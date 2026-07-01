const express = require('express');
const router = express.Router();
const { Op, fn, col, literal } = require('sequelize');
const { StockLoss, Stock, Product, Store, Category, sequelize } = require('../models');
const auth = require('../middleware/auth');

// 统一响应格式
const success = (res, data, message = '操作成功') => {
  res.json({ code: 0, message, data });
};

const fail = (res, message, code = 1, httpStatus = 400) => {
  res.status(httpStatus).json({ code, message });
};

// ==================== GET / - 获取损耗记录列表 ====================
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, storeId, productId, category, status, startDate, endDate } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (storeId) where.storeId = storeId;
    if (productId) where.productId = productId;
    if (category) where.category = category;
    if (status !== undefined) where.status = status;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate + ' 23:59:59');
    }

    // 非管理员只看自己门店
    if (req.user.role !== 'admin' && req.user.storeId) {
      where.storeId = req.user.storeId;
    }

    const { count, rows } = await StockLoss.findAndCountAll({
      where,
      include: [
        { model: Store, as: 'store', attributes: ['id', 'name', 'code'] },
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku', 'unit', 'costPrice'] },
        { model: require('../models').User, as: 'approver', attributes: ['id', 'username', 'realName'] }
      ],
      order: [['id', 'DESC']],
      offset: parseInt(offset),
      limit: parseInt(pageSize)
    });

    success(res, { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (err) {
    console.error('获取损耗记录列表失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== POST / - 创建报损申请 ====================
router.post('/', auth, async (req, res) => {
  try {
    const { storeId, productId, qty, reason, category, imageUrl } = req.body;
    if (!storeId || !productId || !qty) {
      return fail(res, '门店ID、商品ID和数量不能为空');
    }

    if (qty <= 0) {
      return fail(res, '报损数量必须大于0');
    }

    // 检查库存是否充足
    const stock = await Stock.findOne({ where: { storeId, productId } });
    if (!stock || parseFloat(stock.qty) < qty) {
      return fail(res, '库存不足，无法报损');
    }

    const t = await sequelize.transaction();
    try {
      const loss = await StockLoss.create({
        storeId, productId, qty,
        reason: reason || '',
        category: category || 'other',
        imageUrl,
        status: 0 // 待审核
      }, { transaction: t });

      await t.commit();

      const created = await StockLoss.findByPk(loss.id, {
        include: ['store', 'product']
      });

      success(res, created, '报损申请已提交');
    } catch (innerErr) {
      await t.rollback();
      throw innerErr;
    }
  } catch (err) {
    console.error('创建报损申请失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== PUT /:id/approve - 审批报损 ====================
router.put('/:id/approve', auth, async (req, res) => {
  try {
    const loss = await StockLoss.findByPk(req.params.id);
    if (!loss) {
      return fail(res, '报损记录不存在');
    }

    if (loss.status !== 0) {
      return fail(res, '该报损记录已处理');
    }

    const t = await sequelize.transaction();
    try {
      // 更新审核状态
      await loss.update({
        status: 1, // 已审核
        approvedBy: req.user.id
      }, { transaction: t });

      // 扣减库存
      const stock = await Stock.findOne({
        where: { storeId: loss.storeId, productId: loss.productId },
        transaction: t
      });

      if (stock) {
        await stock.update(
          { qty: parseFloat(stock.qty) - parseFloat(loss.qty) },
          { transaction: t }
        );
      }

      await t.commit();

      success(res, { id: loss.id, status: 1 }, '报损审批通过，库存已扣减');
    } catch (innerErr) {
      await t.rollback();
      throw innerErr;
    }
  } catch (err) {
    console.error('审批报损失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== PUT /:id/reject - 驳回报损 ====================
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const loss = await StockLoss.findByPk(req.params.id);
    if (!loss) {
      return fail(res, '报损记录不存在');
    }

    if (loss.status !== 0) {
      return fail(res, '该报损记录已处理');
    }

    await loss.update({
      status: 2, // 已驳回
      approvedBy: req.user.id
    });

    success(res, { id: loss.id, status: 2 }, '报损已驳回');
  } catch (err) {
    console.error('驳回报损失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== GET /statistics - 损耗统计 ====================
router.get('/statistics', auth, async (req, res) => {
  try {
    const { storeId, startDate, endDate } = req.query;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const baseWhere = {};
    if (storeId) baseWhere.storeId = storeId;
    if (req.user.role !== 'admin' && req.user.storeId) {
      baseWhere.storeId = req.user.storeId;
    }
    if (startDate) baseWhere.createdAt = { ...baseWhere.createdAt, [Op.gte]: new Date(startDate) };
    if (endDate) baseWhere.createdAt = { ...baseWhere.createdAt, [Op.lte]: new Date(endDate + ' 23:59:59') };

    // 今日损耗金额
    const todayLoss = await StockLoss.findAll({
      where: { ...baseWhere, status: 1, createdAt: { [Op.gte]: todayStart } },
      include: [{ model: Product, as: 'product', attributes: ['costPrice'] }],
    });

    const todayLossAmount = todayLoss.reduce((sum, item) => {
      return sum + parseFloat(item.qty) * parseFloat(item.product?.costPrice || 0);
    }, 0);

    // 本月损耗金额
    const monthLoss = await StockLoss.findAll({
      where: { ...baseWhere, status: 1, createdAt: { [Op.gte]: monthStart } },
      include: [{ model: Product, as: 'product', attributes: ['costPrice'] }],
    });

    const monthLossAmount = monthLoss.reduce((sum, item) => {
      return sum + parseFloat(item.qty) * parseFloat(item.product?.costPrice || 0);
    }, 0);

    // 按损耗分类统计
    const categoryStats = await StockLoss.findAll({
      where: { ...baseWhere, status: 1 },
      attributes: ['category', [fn('COUNT', col('id')), 'count'], [fn('SUM', col('qty')), 'totalQty']],
      group: ['category'],
      raw: true
    });

    // 按门店统计
    const storeStats = await StockLoss.findAll({
      where: { ...baseWhere, status: 1 },
      attributes: ['storeId', [fn('COUNT', col('id')), 'count'], [fn('SUM', col('qty')), 'totalQty']],
      include: [{ model: Store, as: 'store', attributes: ['name'] }],
      group: ['storeId'],
      raw: true
    });

    // 待审核数量
    const pendingCount = await StockLoss.count({
      where: { ...baseWhere, status: 0 }
    });

    success(res, {
      todayLossAmount: parseFloat(todayLossAmount).toFixed(2),
      monthLossAmount: parseFloat(monthLossAmount).toFixed(2),
      pendingCount,
      categoryStats: categoryStats.map(s => ({
        category: s.category,
        count: parseInt(s.count),
        totalQty: parseFloat(s.totalQty || 0)
      })),
      storeStats: storeStats.map(s => ({
        storeId: s.storeId,
        storeName: s['store.name'],
        count: parseInt(s.count),
        totalQty: parseFloat(s.totalQty || 0)
      }))
    });
  } catch (err) {
    console.error('获取损耗统计失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

module.exports = router;
