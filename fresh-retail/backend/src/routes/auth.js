const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');
const auth = require('../middleware/auth');
const appConfig = require('../config/app');

// 统一响应格式
const success = (res, data, message = '操作成功') => {
  res.json({ code: 0, message, data });
};

const fail = (res, message, code = 1, httpStatus = 400) => {
  res.status(httpStatus).json({ code, message });
};

// ==================== POST /login - 用户登录 ====================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return fail(res, '用户名和密码不能为空');
    }

    const user = await User.findOne({
      where: { username },
      include: ['store']
    });

    if (!user) {
      return fail(res, '用户不存在');
    }

    if (user.status === 0) {
      return fail(res, '账号已被禁用');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return fail(res, '密码错误');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, storeId: user.storeId },
      appConfig.jwtSecret,
      { expiresIn: appConfig.jwtExpiresIn }
    );

    success(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        role: user.role,
        storeId: user.storeId,
        phone: user.phone,
        store: user.store ? {
          id: user.store.id,
          name: user.store.name,
          code: user.store.code
        } : null
      }
    }, '登录成功');
  } catch (err) {
    console.error('登录失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== GET /profile - 获取当前用户信息 ====================
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: ['store']
    });
    if (!user) {
      return fail(res, '用户不存在');
    }
    success(res, user);
  } catch (err) {
    console.error('获取用户信息失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== PUT /profile - 更新当前用户信息 ====================
router.put('/profile', auth, async (req, res) => {
  try {
    const { realName, phone, password } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return fail(res, '用户不存在');
    }

    const updateData = {};
    if (realName !== undefined) updateData.realName = realName;
    if (phone !== undefined) updateData.phone = phone;
    if (password) {
      updateData.password = await bcrypt.hash(password, appConfig.bcryptSaltRounds);
    }

    await user.update(updateData);
    success(res, { id: user.id, username: user.username, realName: user.realName, phone: user.phone }, '个人信息更新成功');
  } catch (err) {
    console.error('更新用户信息失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== GET /users - 获取用户列表 ====================
router.get('/users', auth, async (req, res) => {
  try {
    // 仅 admin 和 store_manager 可访问
    if (req.user.role !== 'admin' && req.user.role !== 'store_manager') {
      return fail(res, '权限不足', 1, 403);
    }

    const { page = 1, pageSize = 10, keyword, role, status, storeId } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (keyword) {
      where[Op.or] = [
        { username: { [Op.like]: `%${keyword}%` } },
        { realName: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (role) where.role = role;
    if (status !== undefined) where.status = status;
    // store_manager 只能看到自己门店的用户
    if (req.user.role === 'store_manager') {
      where.storeId = req.user.storeId;
    } else if (storeId) {
      where.storeId = storeId;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      include: ['store'],
      order: [['id', 'DESC']],
      offset: parseInt(offset),
      limit: parseInt(pageSize)
    });

    success(res, { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (err) {
    console.error('获取用户列表失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== POST /users - 创建用户 ====================
router.post('/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return fail(res, '权限不足，仅管理员可创建用户', 1, 403);
    }

    const { username, password, realName, role, storeId, phone, status } = req.body;
    if (!username || !password || !role) {
      return fail(res, '用户名、密码和角色不能为空');
    }

    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return fail(res, '用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(password, appConfig.bcryptSaltRounds);
    const user = await User.create({
      username,
      password: hashedPassword,
      realName,
      role,
      storeId,
      phone,
      status: status !== undefined ? status : 1
    });

    success(res, { id: user.id, username: user.username, realName: user.realName, role: user.role }, '用户创建成功');
  } catch (err) {
    console.error('创建用户失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== PUT /users/:id - 更新用户 ====================
router.put('/users/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return fail(res, '权限不足，仅管理员可修改用户', 1, 403);
    }

    const userId = parseInt(req.params.id);
    const { realName, role, storeId, phone, status, password } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return fail(res, '用户不存在');
    }

    const updateData = {};
    if (realName !== undefined) updateData.realName = realName;
    if (role !== undefined) updateData.role = role;
    if (storeId !== undefined) updateData.storeId = storeId;
    if (phone !== undefined) updateData.phone = phone;
    if (status !== undefined) updateData.status = status;
    if (password) {
      updateData.password = await bcrypt.hash(password, appConfig.bcryptSaltRounds);
    }

    await user.update(updateData);
    success(res, { id: user.id }, '用户更新成功');
  } catch (err) {
    console.error('更新用户失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== DELETE /users/:id - 删除用户 ====================
router.delete('/users/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return fail(res, '权限不足，仅管理员可删除用户', 1, 403);
    }

    const userId = parseInt(req.params.id);
    if (userId === req.user.id) {
      return fail(res, '不能删除自己的账号');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return fail(res, '用户不存在');
    }

    await user.destroy();
    success(res, null, '用户删除成功');
  } catch (err) {
    console.error('删除用户失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

module.exports = router;
