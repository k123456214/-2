const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Order, OrderItem, Stock, Product, Member, Store, MemberLevel, sequelize } = require('../models');
const auth = require('../middleware/auth');

// 统一响应格式
const success = (res, data, message = '操作成功') => {
  res.json({ code: 0, message, data });
};

const fail = (res, message, code = 1, httpStatus = 400) => {
  res.status(httpStatus).json({ code, message });
};

// 生成订单号
const generateOrderNo = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `ORD${y}${m}${d}${h}${mi}${s}${rand}`;
};

// ==================== GET / - 获取订单列表 ====================
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, storeId, status, memberId, startDate, endDate, keyword } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};

    if (storeId) where.storeId = storeId;
    if (status !== undefined) where.status = status;
    if (memberId) where.memberId = memberId;

    // 日期范围筛选
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate + ' 23:59:59');
    }

    // 订单号搜索
    if (keyword) {
      where.orderNo = { [Op.like]: `%${keyword}%` };
    }

    // 非管理员只能看自己门店的订单
    if (req.user.role !== 'admin' && req.user.storeId) {
      where.storeId = req.user.storeId;
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: Store, as: 'store', attributes: ['id', 'name', 'code'] },
        { model: Member, as: 'member', attributes: ['id', 'name', 'phone', 'level'] }
      ],
      order: [['id', 'DESC']],
      offset: parseInt(offset),
      limit: parseInt(pageSize)
    });

    success(res, { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (err) {
    console.error('获取订单列表失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== GET /statistics - 订单统计 ====================
router.get('/statistics', auth, async (req, res) => {
  try {
    const { storeId } = req.query;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // 本周一
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const baseWhere = {};
    if (storeId) baseWhere.storeId = storeId;
    // 非管理员只看自己门店
    if (req.user.role !== 'admin' && req.user.storeId) {
      baseWhere.storeId = req.user.storeId;
    }

    // 并行查询今日/本周/本月统计
    const [todayOrders, weekOrders, monthOrders, todayCount, weekCount, monthCount] = await Promise.all([
      // 今日销售额（已完成的订单）
      Order.sum('payAmount', {
        where: { ...baseWhere, status: 3, createdAt: { [Op.gte]: todayStart } }
      }),
      // 本周销售额
      Order.sum('payAmount', {
        where: { ...baseWhere, status: 3, createdAt: { [Op.gte]: weekStart } }
      }),
      // 本月销售额
      Order.sum('payAmount', {
        where: { ...baseWhere, status: 3, createdAt: { [Op.gte]: monthStart } }
      }),
      // 今日订单数
      Order.count({
        where: { ...baseWhere, createdAt: { [Op.gte]: todayStart } }
      }),
      // 本周订单数
      Order.count({
        where: { ...baseWhere, createdAt: { [Op.gte]: weekStart } }
      }),
      // 本月订单数
      Order.count({
        where: { ...baseWhere, createdAt: { [Op.gte]: monthStart } }
      })
    ]);

    // 今日退款金额
    const todayRefund = await Order.sum('payAmount', {
      where: { ...baseWhere, payStatus: 3, createdAt: { [Op.gte]: todayStart } }
    });

    success(res, {
      today: {
        salesAmount: parseFloat(todayOrders || 0).toFixed(2),
        orderCount: todayCount,
        refundAmount: parseFloat(todayRefund || 0).toFixed(2)
      },
      week: {
        salesAmount: parseFloat(weekOrders || 0).toFixed(2),
        orderCount: weekCount
      },
      month: {
        salesAmount: parseFloat(monthOrders || 0).toFixed(2),
        orderCount: monthCount
      }
    });
  } catch (err) {
    console.error('获取订单统计失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== GET /:id - 获取订单详情 ====================
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: Store, as: 'store' },
        { model: Member, as: 'member' },
        {
          model: OrderItem,
          as: 'orderItems',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku', 'unit', 'imageUrl'] }]
        }
      ]
    });
    if (!order) {
      return fail(res, '订单不存在');
    }
    success(res, order);
  } catch (err) {
    console.error('获取订单详情失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== POST / - 创建订单 ====================
router.post('/', auth, async (req, res) => {
  try {
    const { storeId, memberId, items, payMethod, deliveryType, type, remark } = req.body;
    if (!storeId || !items || !items.length) {
      return fail(res, '门店ID和商品列表不能为空');
    }

    const t = await sequelize.transaction();

    try {
      let discountRate = 1.00;
      let memberData = null;

      // 如果有会员，获取会员折扣信息
      if (memberId) {
        memberData = await Member.findByPk(memberId, {
          include: [{ model: MemberLevel, as: 'memberLevel' }],
          transaction: t
        });
        if (!memberData) {
          await t.rollback();
          return fail(res, '会员不存在');
        }
        if (memberData.status === 0) {
          await t.rollback();
          return fail(res, '会员已被禁用');
        }
        if (memberData.memberLevel) {
          discountRate = parseFloat(memberData.memberLevel.discountRate);
        }
      }

      let totalAmount = 0;
      let totalPoints = 0;
      const orderItems = [];

      // 处理每个商品项
      for (const item of items) {
        const product = await Product.findByPk(item.productId, { transaction: t });
        if (!product) {
          await t.rollback();
          return fail(res, `商品不存在: ${item.productId}`);
        }

        if (product.status === 0) {
          await t.rollback();
          return fail(res, `商品已下架: ${product.name}`);
        }

        const qty = parseFloat(item.qty) || parseFloat(item.weight) || 0;
        if (qty <= 0) {
          await t.rollback();
          return fail(res, `商品数量无效: ${product.name}`);
        }

        // 使用称重重量或数量
        const actualQty = parseFloat(item.weight) || parseFloat(item.qty);
        const unitPrice = parseFloat(product.price);
        const itemAmount = parseFloat((actualQty * unitPrice).toFixed(2));

        totalAmount += itemAmount;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          qty: parseFloat(item.qty) || 0,
          price: unitPrice,
          amount: itemAmount,
          weight: item.weight ? parseFloat(item.weight) : null
        });

        // 检查并扣减库存
        const stock = await Stock.findOne({
          where: { storeId, productId: product.id },
          transaction: t
        });

        if (!stock || parseFloat(stock.qty) < actualQty) {
          await t.rollback();
          return fail(res, `商品 "${product.name}" 库存不足（当前库存: ${stock ? stock.qty : 0}）`);
        }

        await stock.update(
          { qty: parseFloat(stock.qty) - actualQty },
          { transaction: t }
        );
      }

      // 计算折扣
      const discountAmount = parseFloat((totalAmount * (1 - discountRate)).toFixed(2));
      const payAmount = parseFloat((totalAmount - discountAmount).toFixed(2));

      // 计算积分（消费金额 * 积分倍率）
      const pointsMultiplier = memberData && memberData.memberLevel
        ? parseFloat(memberData.memberLevel.pointsMultiplier)
        : 1.0;
      totalPoints = Math.floor(payAmount * pointsMultiplier);

      // 创建订单
      const order = await Order.create({
        orderNo: generateOrderNo(),
        storeId,
        memberId,
        totalAmount,
        discountAmount,
        payAmount,
        payStatus: 1, // 默认已支付
        payMethod: payMethod || 'cash',
        deliveryType: deliveryType || 'offline',
        status: 1, // 待处理
        type: type || 'offline',
        remark
      }, { transaction: t });

      // 创建订单项
      for (const oi of orderItems) {
        oi.orderId = order.id;
        await OrderItem.create(oi, { transaction: t });
      }

      // 更新会员积分
      if (memberData && totalPoints > 0) {
        await memberData.update(
          { points: parseInt(memberData.points) + totalPoints },
          { transaction: t }
        );
      }

      await t.commit();

      // 返回完整订单信息
      const createdOrder = await Order.findByPk(order.id, {
        include: [
          { model: Store, as: 'store', attributes: ['id', 'name'] },
          { model: Member, as: 'member', attributes: ['id', 'name', 'phone'] },
          { model: OrderItem, as: 'orderItems' }
        ]
      });

      success(res, createdOrder, '订单创建成功');
    } catch (innerErr) {
      await t.rollback();
      throw innerErr;
    }
  } catch (err) {
    console.error('创建订单失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== PUT /:id/status - 更新订单状态 ====================
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [1, 2, 3, 4]; // 待处理, 进行中, 已完成, 已取消
    if (!status || !validStatuses.includes(status)) {
      return fail(res, '无效的订单状态（1:待处理 2:进行中 3:已完成 4:已取消）');
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return fail(res, '订单不存在');
    }

    // 如果取消订单，恢复库存
    if (status === 4 && order.status !== 4) {
      const t = await sequelize.transaction();
      try {
        const orderItems = await OrderItem.findAll({
          where: { orderId: order.id },
          include: [{ model: Product, as: 'product' }],
          transaction: t
        });

        for (const item of orderItems) {
          const actualQty = parseFloat(item.weight) || parseFloat(item.qty);
          if (actualQty > 0) {
            const stock = await Stock.findOne({
              where: { storeId: order.storeId, productId: item.productId },
              transaction: t
            });
            if (stock) {
              await stock.update(
                { qty: parseFloat(stock.qty) + actualQty },
                { transaction: t }
              );
            }
          }
        }

        await order.update({ status }, { transaction: t });
        await t.commit();
      } catch (innerErr) {
        await t.rollback();
        throw innerErr;
      }
    } else {
      await order.update({ status });
    }

    const updatedOrder = await Order.findByPk(order.id, {
      include: ['store', 'member', 'orderItems']
    });
    success(res, updatedOrder, '订单状态更新成功');
  } catch (err) {
    console.error('更新订单状态失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

module.exports = router;
