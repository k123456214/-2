const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Member, MemberLevel, Store, sequelize } = require('../models');
const auth = require('../middleware/auth');

// 统一响应格式
const success = (res, data, message = '操作成功') => {
  res.json({ code: 0, message, data });
};

const fail = (res, message, code = 1, httpStatus = 400) => {
  res.status(httpStatus).json({ code, message });
};

// ==================== GET / - 获取会员列表 ====================
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, storeId, level, status } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (storeId) where.storeId = storeId;
    if (level) where.level = level;
    if (status !== undefined) where.status = status;

    const { count, rows } = await Member.findAndCountAll({
      where,
      include: [
        { model: Store, as: 'store', attributes: ['id', 'name', 'code'] },
        { model: MemberLevel, as: 'memberLevel', attributes: ['id', 'name', 'discountRate', 'pointsMultiplier'] }
      ],
      order: [['id', 'DESC']],
      offset: parseInt(offset),
      limit: parseInt(pageSize)
    });

    success(res, { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (err) {
    console.error('获取会员列表失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== GET /levels - 获取会员等级列表（必须在 /:id 之前） ====================
router.get('/levels', auth, async (req, res) => {
  try {
    const levels = await MemberLevel.findAll({ order: [['minPoints', 'ASC']] });
    success(res, levels);
  } catch (err) {
    console.error('获取会员等级列表失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== GET /:id - 获取会员详情 ====================
router.get('/:id', auth, async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id, {
      include: [
        { model: Store, as: 'store' },
        { model: MemberLevel, as: 'memberLevel' }
      ]
    });
    if (!member) {
      return fail(res, '会员不存在');
    }
    success(res, member);
  } catch (err) {
    console.error('获取会员详情失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== POST / - 注册/创建会员 ====================
router.post('/', auth, async (req, res) => {
  try {
    const { name, phone, storeId, level } = req.body;
    if (!name || !phone) {
      return fail(res, '会员姓名和手机号不能为空');
    }

    const existing = await Member.findOne({ where: { phone } });
    if (existing) {
      return fail(res, '该手机号已注册为会员');
    }

    const member = await Member.create({
      name,
      phone,
      storeId: storeId || req.user.storeId,
      level: level || 1,
      points: 0,
      balance: 0,
      status: 1
    });

    const created = await Member.findByPk(member.id, {
      include: [
        { model: Store, as: 'store', attributes: ['id', 'name'] },
        { model: MemberLevel, as: 'memberLevel' }
      ]
    });

    success(res, created, '会员创建成功');
  } catch (err) {
    console.error('创建会员失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== PUT /:id - 更新会员信息 ====================
router.put('/:id', auth, async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) {
      return fail(res, '会员不存在');
    }

    const { name, phone, storeId, level, status } = req.body;

    // 检查手机号唯一性
    if (phone && phone !== member.phone) {
      const existing = await Member.findOne({ where: { phone } });
      if (existing) {
        return fail(res, '该手机号已注册为会员');
      }
    }

    await member.update({ name, phone, storeId, level, status });

    const updated = await Member.findByPk(member.id, {
      include: [
        { model: Store, as: 'store', attributes: ['id', 'name'] },
        { model: MemberLevel, as: 'memberLevel' }
      ]
    });

    success(res, updated, '会员信息更新成功');
  } catch (err) {
    console.error('更新会员信息失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== POST /:id/recharge - 会员储值 ====================
router.post('/:id/recharge', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return fail(res, '储值金额必须大于0');
    }

    const member = await Member.findByPk(req.params.id);
    if (!member) {
      return fail(res, '会员不存在');
    }

    if (member.status === 0) {
      return fail(res, '会员已被禁用，无法储值');
    }

    const t = await sequelize.transaction();
    try {
      const newBalance = parseFloat(member.balance) + parseFloat(amount);
      await member.update({ balance: newBalance }, { transaction: t });
      await t.commit();
    } catch (innerErr) {
      await t.rollback();
      throw innerErr;
    }

    success(res, {
      id: member.id,
      name: member.name,
      phone: member.phone,
      balance: member.balance,
      rechargeAmount: parseFloat(amount)
    }, '储值成功');
  } catch (err) {
    console.error('会员储值失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== POST /:id/points/add - 增加积分 ====================
router.post('/:id/points/add', auth, async (req, res) => {
  try {
    const { points } = req.body;
    if (!points || points <= 0) {
      return fail(res, '积分数量必须大于0');
    }

    const member = await Member.findByPk(req.params.id);
    if (!member) {
      return fail(res, '会员不存在');
    }

    const newPoints = parseInt(member.points) + parseInt(points);
    await member.update({ points: newPoints });

    // 检查是否需要升级等级
    const levels = await MemberLevel.findAll({ order: [['minPoints', 'ASC']] });
    let newLevel = member.level;
    for (const lv of levels) {
      if (newPoints >= lv.minPoints) {
        newLevel = lv.id;
      }
    }

    if (newLevel !== member.level) {
      await member.update({ level: newLevel });
    }

    success(res, {
      id: member.id,
      name: member.name,
      points: newPoints,
      level: newLevel,
      addedPoints: parseInt(points)
    }, '积分增加成功');
  } catch (err) {
    console.error('增加积分失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== POST /:id/points/deduct - 扣减积分 ====================
router.post('/:id/points/deduct', auth, async (req, res) => {
  try {
    const { points } = req.body;
    if (!points || points <= 0) {
      return fail(res, '扣减积分数量必须大于0');
    }

    const member = await Member.findByPk(req.params.id);
    if (!member) {
      return fail(res, '会员不存在');
    }

    if (parseInt(member.points) < parseInt(points)) {
      return fail(res, '积分不足');
    }

    const newPoints = parseInt(member.points) - parseInt(points);
    await member.update({ points: newPoints });

    // 检查是否需要降级
    const levels = await MemberLevel.findAll({ order: [['minPoints', 'DESC']] });
    let newLevel = member.level;
    for (const lv of levels) {
      if (newPoints >= lv.minPoints) {
        newLevel = lv.id;
        break;
      }
    }

    if (newLevel !== member.level) {
      await member.update({ level: newLevel });
    }

    success(res, {
      id: member.id,
      name: member.name,
      points: newPoints,
      level: newLevel,
      deductedPoints: parseInt(points)
    }, '积分扣减成功');
  } catch (err) {
    console.error('扣减积分失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== POST /levels - 创建会员等级 ====================
router.post('/levels', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return fail(res, '权限不足，仅管理员可创建会员等级', 1, 403);
    }

    const { name, minPoints, maxPoints, discountRate, pointsMultiplier } = req.body;
    if (!name) {
      return fail(res, '等级名称不能为空');
    }

    const level = await MemberLevel.create({
      name,
      minPoints: minPoints || 0,
      maxPoints: maxPoints || 0,
      discountRate: discountRate || 1.00,
      pointsMultiplier: pointsMultiplier || 1.00
    });

    success(res, level, '会员等级创建成功');
  } catch (err) {
    console.error('创建会员等级失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== PUT /levels/:id - 更新会员等级 ====================
router.put('/levels/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return fail(res, '权限不足，仅管理员可修改会员等级', 1, 403);
    }

    const level = await MemberLevel.findByPk(req.params.id);
    if (!level) {
      return fail(res, '会员等级不存在');
    }

    const { name, minPoints, maxPoints, discountRate, pointsMultiplier } = req.body;
    await level.update({ name, minPoints, maxPoints, discountRate, pointsMultiplier });

    success(res, level, '会员等级更新成功');
  } catch (err) {
    console.error('更新会员等级失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

module.exports = router;
