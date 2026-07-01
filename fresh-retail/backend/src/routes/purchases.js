const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { PurchaseOrder, PurchaseOrderItem, Product, Stock, Store, Supplier, sequelize } = require('../models');
const auth = require('../middleware/auth');

// 统一响应格式
const success = (res, data, message = '操作成功') => {
  res.json({ code: 0, message, data });
};

const fail = (res, message, code = 1, httpStatus = 400) => {
  res.status(httpStatus).json({ code, message });
};

// 生成采购单号
const generatePurchaseNo = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `PO${y}${m}${d}${rand}`;
};

// ==================== GET / - 获取采购单列表 ====================
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, storeId, supplierId, status, keyword, startDate, endDate } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (storeId) where.storeId = storeId;
    if (supplierId) where.supplierId = supplierId;
    if (status !== undefined) where.status = status;
    if (keyword) {
      where.orderNo = { [Op.like]: `%${keyword}%` };
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate + ' 23:59:59');
    }

    // 非管理员只看自己门店
    if (req.user.role !== 'admin' && req.user.storeId) {
      where.storeId = req.user.storeId;
    }

    const { count, rows } = await PurchaseOrder.findAndCountAll({
      where,
      include: [
        { model: Store, as: 'store', attributes: ['id', 'name', 'code'] },
        { model: Supplier, as: 'supplier', attributes: ['id', 'name', 'contact', 'phone'] }
      ],
      order: [['id', 'DESC']],
      offset: parseInt(offset),
      limit: parseInt(pageSize)
    });

    success(res, { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (err) {
    console.error('获取采购单列表失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== GET /statistics - 采购统计（必须在 /:id 之前） ====================
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

    // 今日采购金额
    const todayPurchase = await PurchaseOrder.sum('totalAmount', {
      where: { ...baseWhere, createdAt: { [Op.gte]: todayStart } }
    });

    // 本月采购金额
    const monthPurchase = await PurchaseOrder.sum('totalAmount', {
      where: { ...baseWhere, createdAt: { [Op.gte]: monthStart } }
    });

    // 待审核采购单数
    const pendingCount = await PurchaseOrder.count({
      where: { ...baseWhere, status: 1 }
    });

    // 采购中采购单数
    const inProgressCount = await PurchaseOrder.count({
      where: { ...baseWhere, status: 3 }
    });

    success(res, {
      todayAmount: parseFloat(todayPurchase || 0).toFixed(2),
      monthAmount: parseFloat(monthPurchase || 0).toFixed(2),
      pendingCount,
      inProgressCount
    });
  } catch (err) {
    console.error('获取采购统计失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== GET /:id - 获取采购单详情 ====================
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id, {
      include: [
        { model: Store, as: 'store' },
        { model: Supplier, as: 'supplier' },
        {
          model: PurchaseOrderItem,
          as: 'purchaseOrderItems',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku', 'unit', 'price'] }]
        }
      ]
    });
    if (!order) {
      return fail(res, '采购单不存在');
    }
    success(res, order);
  } catch (err) {
    console.error('获取采购单详情失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== POST / - 创建采购单 ====================
router.post('/', auth, async (req, res) => {
  try {
    const { storeId, supplierId, items, expectedDate, remark } = req.body;
    if (!storeId || !supplierId || !items || !items.length) {
      return fail(res, '门店ID、供应商ID和商品列表不能为空');
    }

    const t = await sequelize.transaction();

    try {
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await Product.findByPk(item.productId, { transaction: t });
        if (!product) {
          await t.rollback();
          return fail(res, `商品不存在: ${item.productId}`);
        }

        const qty = parseFloat(item.qty);
        const price = parseFloat(item.price);
        const amount = parseFloat((qty * price).toFixed(2));
        totalAmount += amount;

        orderItems.push({
          productId: product.id,
          qty,
          price,
          amount
        });
      }

      const order = await PurchaseOrder.create({
        orderNo: generatePurchaseNo(),
        storeId,
        supplierId,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        status: 1, // 待审核
        expectedDate,
        remark
      }, { transaction: t });

      for (const oi of orderItems) {
        oi.purchaseOrderId = order.id;
        await PurchaseOrderItem.create(oi, { transaction: t });
      }

      await t.commit();

      const created = await PurchaseOrder.findByPk(order.id, {
        include: ['store', 'supplier', 'purchaseOrderItems']
      });

      success(res, created, '采购单创建成功');
    } catch (innerErr) {
      await t.rollback();
      throw innerErr;
    }
  } catch (err) {
    console.error('创建采购单失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== PUT /:id - 更新采购单状态 ====================
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [1, 2, 3, 4, 5]; // 待审核, 已审核, 采购中, 已完成, 已取消
    if (!status || !validStatuses.includes(status)) {
      return fail(res, '无效的采购单状态');
    }

    const order = await PurchaseOrder.findByPk(req.params.id);
    if (!order) {
      return fail(res, '采购单不存在');
    }

    await order.update({ status });
    success(res, order, '采购单状态更新成功');
  } catch (err) {
    console.error('更新采购单状态失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== PUT /:id/items/:itemId/receive - 收货确认 ====================
router.put('/:id/items/:itemId/receive', auth, async (req, res) => {
  try {
    const { receivedQty } = req.body;
    if (!receivedQty || receivedQty <= 0) {
      return fail(res, '收货数量必须大于0');
    }

    const order = await PurchaseOrder.findByPk(req.params.id);
    if (!order) {
      return fail(res, '采购单不存在');
    }

    if (order.status < 2) {
      return fail(res, '采购单未审核，无法收货');
    }

    const item = await PurchaseOrderItem.findOne({
      where: { id: req.params.itemId, purchaseOrderId: req.params.id }
    });
    if (!item) {
      return fail(res, '采购单项不存在');
    }

    const newReceivedQty = parseFloat(item.receivedQty) + parseFloat(receivedQty);
    if (newReceivedQty > parseFloat(item.qty)) {
      return fail(res, '收货数量不能超过采购数量');
    }

    const t = await sequelize.transaction();

    try {
      // 更新收货数量
      await item.update({ receivedQty: newReceivedQty }, { transaction: t });

      // 自动增加库存
      let stock = await Stock.findOne({
        where: { storeId: order.storeId, productId: item.productId },
        transaction: t
      });

      if (stock) {
        await stock.update(
          { qty: parseFloat(stock.qty) + parseFloat(receivedQty) },
          { transaction: t }
        );
      } else {
        const product = await Product.findByPk(item.productId, { transaction: t });
        stock = await Stock.create({
          storeId: order.storeId,
          productId: item.productId,
          qty: parseFloat(receivedQty),
          minStock: product ? product.minStock : 0,
          batchNo: `PO-${order.orderNo}-${item.productId}`
        }, { transaction: t });
      }

      // 更新商品成本价
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (product && item.price) {
        await product.update({ costPrice: item.price }, { transaction: t });
      }

      await t.commit();

      success(res, {
        itemId: item.id,
        receivedQty: newReceivedQty,
        qty: item.qty,
        isComplete: newReceivedQty >= parseFloat(item.qty)
      }, '收货确认成功');
    } catch (innerErr) {
      await t.rollback();
      throw innerErr;
    }
  } catch (err) {
    console.error('收货确认失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

module.exports = router;
