const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Stock, Product, Store, sequelize } = require('../models');
const auth = require('../middleware/auth');

// 统一响应格式
const success = (res, data, message = '操作成功') => {
  res.json({ code: 0, message, data });
};

const fail = (res, message, code = 1, httpStatus = 400) => {
  res.status(httpStatus).json({ code, message });
};

// ==================== GET / - 获取库存列表 ====================
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, storeId, productId, keyword } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (storeId) where.storeId = storeId;
    if (productId) where.productId = productId;

    const include = [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'sku', 'unit', 'price', 'minStock']
      },
      {
        model: Store,
        as: 'store',
        attributes: ['id', 'name', 'code']
      }
    ];

    // 如果有关键词搜索商品名称
    if (keyword) {
      include[0].where = {
        [Op.or]: [
          { name: { [Op.like]: `%${keyword}%` } },
          { sku: { [Op.like]: `%${keyword}%` } }
        ]
      };
    }

    const { count, rows } = await Stock.findAndCountAll({
      where,
      include,
      order: [['id', 'DESC']],
      offset: parseInt(offset),
      limit: parseInt(pageSize)
    });

    success(res, { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (err) {
    console.error('获取库存列表失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== GET /warnings - 获取库存预警列表 ====================
router.get('/warnings', auth, async (req, res) => {
  try {
    const { storeId } = req.query;
    const where = {};
    if (storeId) where.storeId = storeId;

    // 查找库存低于安全阈值的记录
    // 使用 literal 比较库存量和最低库存
    const warnings = await Stock.findAll({
      where: {
        ...where,
        [Op.and]: [
          sequelize.where(
            sequelize.col('Stock.qty'),
            { [Op.lte]: sequelize.col('Stock.minStock') }
          )
        ]
      },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'unit']
        },
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'code']
        }
      ],
      order: [['qty', 'ASC']]
    });

    success(res, warnings);
  } catch (err) {
    console.error('获取库存预警失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== POST /adjust - 库存调整 ====================
router.post('/adjust', auth, async (req, res) => {
  try {
    const { storeId, productId, qty, type, remark, batchNo, productionDate, expiryDate } = req.body;
    // type: in(入库), out(出库), check(盘点)
    if (!storeId || !productId || qty === undefined || !type) {
      return fail(res, '门店ID、商品ID、数量和调整类型不能为空');
    }

    if (qty <= 0) {
      return fail(res, '调整数量必须大于0');
    }

    const t = await sequelize.transaction();

    try {
      // 查找或创建库存记录
      let stock = await Stock.findOne({
        where: { storeId, productId },
        transaction: t
      });

      if (type === 'out') {
        // 出库扣减库存
        if (!stock) {
          await t.rollback();
          return fail(res, '该门店没有该商品的库存记录');
        }
        if (parseFloat(stock.qty) < qty) {
          await t.rollback();
          return fail(res, '库存不足，当前库存: ' + stock.qty);
        }
        await stock.update(
          { qty: parseFloat(stock.qty) - parseFloat(qty) },
          { transaction: t }
        );
      } else if (type === 'in') {
        // 入库增加库存
        if (!stock) {
          const product = await Product.findByPk(productId, { transaction: t });
          stock = await Stock.create({
            storeId, productId,
            qty: parseFloat(qty),
            minStock: product ? product.minStock : 0,
            batchNo: batchNo || `ADJ-${Date.now()}`,
            productionDate, expiryDate
          }, { transaction: t });
        } else {
          await stock.update(
            { qty: parseFloat(stock.qty) + parseFloat(qty) },
            { transaction: t }
          );
        }
      } else if (type === 'check') {
        // 盘点：直接设置库存数量
        if (!stock) {
          const product = await Product.findByPk(productId, { transaction: t });
          stock = await Stock.create({
            storeId, productId,
            qty: parseFloat(qty),
            minStock: product ? product.minStock : 0,
            batchNo: batchNo || `CHK-${Date.now()}`,
            productionDate, expiryDate
          }, { transaction: t });
        } else {
          await stock.update({ qty: parseFloat(qty) }, { transaction: t });
        }
      }

      await t.commit();

      // 返回更新后的库存
      const updatedStock = await Stock.findByPk(stock.id, {
        include: ['product', 'store']
      });

      success(res, updatedStock, '库存调整成功');
    } catch (innerErr) {
      await t.rollback();
      throw innerErr;
    }
  } catch (err) {
    console.error('库存调整失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== POST /transfer - 跨店调拨 ====================
router.post('/transfer', auth, async (req, res) => {
  try {
    const { fromStoreId, toStoreId, productId, qty } = req.body;
    if (!fromStoreId || !toStoreId || !productId || !qty) {
      return fail(res, '调出门店、调入门店、商品ID和数量不能为空');
    }

    if (fromStoreId === toStoreId) {
      return fail(res, '调出门店和调入门店不能相同');
    }

    if (qty <= 0) {
      return fail(res, '调拨数量必须大于0');
    }

    const t = await sequelize.transaction();

    try {
      // 检查调出门店库存
      const fromStock = await Stock.findOne({
        where: { storeId: fromStoreId, productId },
        transaction: t
      });

      if (!fromStock || parseFloat(fromStock.qty) < qty) {
        await t.rollback();
        return fail(res, '调出门店库存不足');
      }

      // 扣减调出门店库存
      await fromStock.update(
        { qty: parseFloat(fromStock.qty) - parseFloat(qty) },
        { transaction: t }
      );

      // 增加调入门店库存
      let toStock = await Stock.findOne({
        where: { storeId: toStoreId, productId },
        transaction: t
      });

      if (toStock) {
        await toStock.update(
          { qty: parseFloat(toStock.qty) + parseFloat(qty) },
          { transaction: t }
        );
      } else {
        const product = await Product.findByPk(productId, { transaction: t });
        toStock = await Stock.create({
          storeId: toStoreId,
          productId,
          qty: parseFloat(qty),
          minStock: product ? product.minStock : 0,
          batchNo: `TRF-${Date.now()}`
        }, { transaction: t });
      }

      await t.commit();

      success(res, {
        fromStock: await Stock.findByPk(fromStock.id, { include: ['product', 'store'] }),
        toStock: await Stock.findByPk(toStock.id, { include: ['product', 'store'] })
      }, '跨店调拨成功');
    } catch (innerErr) {
      await t.rollback();
      throw innerErr;
    }
  } catch (err) {
    console.error('跨店调拨失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== GET /history - 库存变动历史 ====================
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, storeId, productId } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (storeId) where.storeId = storeId;
    if (productId) where.productId = productId;

    const { count, rows } = await Stock.findAndCountAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku', 'unit'] },
        { model: Store, as: 'store', attributes: ['id', 'name', 'code'] }
      ],
      order: [['createdAt', 'DESC']],
      offset: parseInt(offset),
      limit: parseInt(pageSize)
    });

    success(res, { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (err) {
    console.error('获取库存历史失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

module.exports = router;
