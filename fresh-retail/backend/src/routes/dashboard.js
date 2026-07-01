const express = require('express');
const router = express.Router();
const { Op, fn, col, literal } = require('sequelize');
const {
  sequelize,
  Order, OrderItem, Stock, Product, Category, Store,
  Member, StockLoss, PurchaseOrder
} = require('../models');
const auth = require('../middleware/auth');

// 统一响应格式
const success = (res, data, message = '操作成功') => {
  res.json({ code: 0, message, data });
};

const fail = (res, message, code = 1, httpStatus = 400) => {
  res.status(httpStatus).json({ code, message });
};

// ==================== GET /overview - 经营概览 ====================
router.get('/overview', auth, async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const baseWhere = {};
    if (req.user.role !== 'admin' && req.user.storeId) {
      baseWhere.storeId = req.user.storeId;
    }

    // 并行查询各指标
    const [todaySales, todayOrderCount, todayNewMembers, totalProducts, totalMembers, stockWarnings] = await Promise.all([
      // 今日销售额
      Order.sum('payAmount', {
        where: { ...baseWhere, status: 3, createdAt: { [Op.gte]: todayStart } }
      }),
      // 今日订单数
      Order.count({
        where: { ...baseWhere, createdAt: { [Op.gte]: todayStart } }
      }),
      // 今日新增会员
      Member.count({
        where: { ...baseWhere, createdAt: { [Op.gte]: todayStart } }
      }),
      // 商品总数
      Product.count({ where: { status: 1 } }),
      // 会员总数
      Member.count(),
      // 库存列表（用于计算预警数）
      Stock.findAll({
        attributes: ['id', 'qty', 'minStock'],
        where: { ...baseWhere }
      })
    ]);
    // 库存预警数（库存低于安全阈值）
    const stockWarningCount = stockWarnings.filter(s => parseFloat(s.qty) <= parseFloat(s.minStock) && parseFloat(s.minStock) > 0).length;

    // 本周销售额
    const weekSales = await Order.sum('payAmount', {
      where: { ...baseWhere, status: 3, createdAt: { [Op.gte]: weekStart } }
    });

    // 本月销售额
    const monthSales = await Order.sum('payAmount', {
      where: { ...baseWhere, status: 3, createdAt: { [Op.gte]: monthStart } }
    });

    // 待处理报损
    const pendingLoss = await StockLoss.count({
      where: { ...baseWhere, status: 0 }
    });

    success(res, {
      today: {
        salesAmount: parseFloat(todaySales || 0).toFixed(2),
        orderCount: todayOrderCount,
        newMembers: todayNewMembers
      },
      week: {
        salesAmount: parseFloat(weekSales || 0).toFixed(2)
      },
      month: {
        salesAmount: parseFloat(monthSales || 0).toFixed(2)
      },
      stockWarningCount,
      pendingLossCount: pendingLoss,
      totalProducts,
      totalMembers
    });
  } catch (err) {
    console.error('获取经营概览失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== GET /sales-trend - 销售趋势 ====================
router.get('/sales-trend', auth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const baseWhere = {};
    if (req.user.role !== 'admin' && req.user.storeId) {
      baseWhere.storeId = req.user.storeId;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    // 使用原生SQL按天统计
    const results = await sequelize.query(`
      SELECT DATE(createdAt) as date, COUNT(*) as orderCount, COALESCE(SUM(CASE WHEN status = 3 THEN payAmount ELSE 0 END), 0) as salesAmount
      FROM Orders
      WHERE createdAt >= :startDate ${req.user.storeId ? 'AND storeId = :storeId' : ''}
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `, {
      replacements: { startDate, storeId: req.user.storeId },
      type: sequelize.QueryTypes.SELECT
    });

    // 补全没有数据的日期
    const trend = [];
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = results.find(r => r.date === dateStr);
      trend.push({
        date: dateStr,
        orderCount: found ? parseInt(found.orderCount) : 0,
        salesAmount: found ? parseFloat(found.salesAmount || 0).toFixed(2) : '0.00'
      });
    }

    success(res, trend);
  } catch (err) {
    console.error('获取销售趋势失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== GET /category-sales - 品类销售排行 ====================
router.get('/category-sales', auth, async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    const baseWhere = {};

    if (startDate || endDate) {
      baseWhere.createdAt = {};
      if (startDate) baseWhere.createdAt[Op.gte] = new Date(startDate);
      if (endDate) baseWhere.createdAt[Op.lte] = new Date(endDate + ' 23:59:59');
    }

    // 通过订单项和商品分类关联统计
    const results = await OrderItem.findAll({
      attributes: [
        'productId',
        [fn('SUM', col('amount')), 'totalAmount'],
        [fn('SUM', col('qty')), 'totalQty'],
        [fn('COUNT', col('id')), 'orderCount']
      ],
      include: [
        {
          model: Order,
          as: 'order',
          where: { status: 3, ...baseWhere },
          attributes: []
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'categoryId'],
          include: [{
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          }]
        }
      ],
      group: ['productId'],
      order: [[fn('SUM', col('amount')), 'DESC']],
      limit: parseInt(limit),
      raw: true
    });

    // 按品类汇总
    const categoryMap = {};
    for (const item of results) {
      const categoryName = item['product.category.name'] || '未分类';
      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = { category: categoryName, totalAmount: 0, totalQty: 0, orderCount: 0 };
      }
      categoryMap[categoryName].totalAmount += parseFloat(item.totalAmount || 0);
      categoryMap[categoryName].totalQty += parseFloat(item.totalQty || 0);
      categoryMap[categoryName].orderCount += parseInt(item.orderCount || 0);
    }

    const sorted = Object.values(categoryMap).sort((a, b) => b.totalAmount - a.totalAmount);

    success(res, sorted);
  } catch (err) {
    console.error('获取品类销售排行失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== GET /store-ranking - 门店销售排名 ====================
router.get('/store-ranking', auth, async (req, res) => {
  try {
    const { startDate, endDate, period = 'month' } = req.query;

    const dateWhere = {};
    const now = new Date();
    if (startDate && endDate) {
      dateWhere.createdAt = { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate + ' 23:59:59') };
    } else if (period === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateWhere.createdAt = { [Op.gte]: todayStart };
    } else if (period === 'week') {
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      dateWhere.createdAt = { [Op.gte]: weekStart };
    } else {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      dateWhere.createdAt = { [Op.gte]: monthStart };
    }

    const results = await Order.findAll({
      attributes: [
        'storeId',
        [fn('COUNT', col('id')), 'orderCount'],
        [fn('COALESCE', fn('SUM', literal('CASE WHEN status = 3 THEN payAmount ELSE 0 END')), 0), 'salesAmount'],
        [fn('COALESCE', fn('AVG', literal('CASE WHEN status = 3 THEN payAmount ELSE 0 END')), 0), 'avgAmount']
      ],
      where: { status: 3, ...dateWhere },
      include: [{
        model: Store,
        as: 'store',
        attributes: ['id', 'name', 'code']
      }],
      group: ['storeId', 'store.id'],
      order: [[fn('SUM', literal('CASE WHEN status = 3 THEN payAmount ELSE 0 END')), 'DESC']],
      raw: true
    });

    const ranking = results.map(r => ({
      storeId: r.storeId,
      storeName: r['store.name'],
      storeCode: r['store.code'],
      orderCount: parseInt(r.orderCount),
      salesAmount: parseFloat(r.salesAmount || 0).toFixed(2),
      avgAmount: parseFloat(r.avgAmount || 0).toFixed(2)
    }));

    success(res, ranking);
  } catch (err) {
    console.error('获取门店销售排名失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== GET /loss-analysis - 损耗分析数据 ====================
router.get('/loss-analysis', auth, async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const baseWhere = {};
    if (req.user.role !== 'admin' && req.user.storeId) {
      baseWhere.storeId = req.user.storeId;
    }

    // 本月损耗总金额
    const monthLoss = await StockLoss.findAll({
      where: { ...baseWhere, status: 1, createdAt: { [Op.gte]: monthStart } },
      include: [{ model: Product, as: 'product', attributes: ['costPrice', 'name', 'categoryId'] }]
    });

    let totalLossAmount = 0;
    const byCategory = {};
    const byProduct = {};

    for (const item of monthLoss) {
      const costPrice = parseFloat(item.product?.costPrice || 0);
      const qty = parseFloat(item.qty);
      const amount = qty * costPrice;
      totalLossAmount += amount;

      const categoryName = item.product?.name || '未知商品';
      if (!byProduct[categoryName]) {
        byProduct[categoryName] = { product: categoryName, qty: 0, amount: 0 };
      }
      byProduct[categoryName].qty += qty;
      byProduct[categoryName].amount += amount;
    }

    // 按损耗原因分组
    const byReason = await StockLoss.findAll({
      where: { ...baseWhere, status: 1, createdAt: { [Op.gte]: monthStart } },
      attributes: ['category', [fn('COUNT', col('id')), 'count'], [fn('SUM', col('qty')), 'totalQty']],
      group: ['category'],
      raw: true
    });

    success(res, {
      totalLossAmount: parseFloat(totalLossAmount).toFixed(2),
      byReason: byReason.map(r => ({
        category: r.category,
        count: parseInt(r.count),
        totalQty: parseFloat(r.totalQty || 0)
      })),
      byProduct: Object.values(byProduct).sort((a, b) => b.amount - a.amount).slice(0, 10)
    });
  } catch (err) {
    console.error('获取损耗分析失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== GET /top-products - 热销商品排行 ====================
router.get('/top-products', auth, async (req, res) => {
  try {
    const { limit = 10, period = 'month' } = req.query;

    const dateWhere = {};
    const now = new Date();
    if (period === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateWhere.createdAt = { [Op.gte]: todayStart };
    } else if (period === 'week') {
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      dateWhere.createdAt = { [Op.gte]: weekStart };
    } else {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      dateWhere.createdAt = { [Op.gte]: monthStart };
    }

    const results = await OrderItem.findAll({
      attributes: [
        'productId',
        'productName',
        [fn('SUM', col('qty')), 'totalQty'],
        [fn('SUM', col('amount')), 'totalAmount'],
        [fn('COUNT', col('id')), 'orderCount']
      ],
      include: [
        {
          model: Order,
          as: 'order',
          where: { status: 3, ...dateWhere },
          attributes: []
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'unit', 'imageUrl']
        }
      ],
      group: ['productId', 'productName'],
      order: [[fn('SUM', col('amount')), 'DESC']],
      limit: parseInt(limit),
      raw: true
    });

    const topProducts = results.map(r => ({
      productId: r.productId,
      productName: r.productName,
      sku: r['product.sku'],
      unit: r['product.unit'],
      imageUrl: r['product.imageUrl'],
      totalQty: parseFloat(r.totalQty || 0),
      totalAmount: parseFloat(r.totalAmount || 0).toFixed(2),
      orderCount: parseInt(r.orderCount || 0)
    }));

    success(res, topProducts);
  } catch (err) {
    console.error('获取热销商品排行失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

module.exports = router;
