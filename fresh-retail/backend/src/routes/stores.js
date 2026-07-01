const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Store } = require('../models');
const auth = require('../middleware/auth');

// 统一响应格式
const success = (res, data, message = '操作成功') => {
  res.json({ code: 0, message, data });
};

const fail = (res, message, code = 1, httpStatus = 400) => {
  res.status(httpStatus).json({ code, message });
};

// ==================== GET / - 获取门店列表 ====================
router.get('/', auth, async (req, res) => {
  try {
    const { page, pageSize, keyword, status } = req.query;

    const where = {};
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } },
        { address: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (status !== undefined) where.status = status;

    // 如果没有分页参数，返回全部
    if (!page || !pageSize) {
      const stores = await Store.findAll({
        where,
        order: [['id', 'ASC']]
      });
      return success(res, stores);
    }

    const offset = (page - 1) * pageSize;
    const { count, rows } = await Store.findAndCountAll({
      where,
      order: [['id', 'ASC']],
      offset: parseInt(offset),
      limit: parseInt(pageSize)
    });

    success(res, { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (err) {
    console.error('获取门店列表失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== GET /:id - 获取门店详情 ====================
router.get('/:id', auth, async (req, res) => {
  try {
    const store = await Store.findByPk(req.params.id, {
      include: [{ model: require('../models').User, as: 'users', attributes: ['id', 'username', 'realName', 'role'] }]
    });
    if (!store) {
      return fail(res, '门店不存在');
    }
    success(res, store);
  } catch (err) {
    console.error('获取门店详情失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== POST / - 创建门店 ====================
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return fail(res, '权限不足，仅管理员可创建门店', 1, 403);
    }

    const { name, code, address, phone, status } = req.body;
    if (!name || !code) {
      return fail(res, '门店名称和编码不能为空');
    }

    const existing = await Store.findOne({ where: { code } });
    if (existing) {
      return fail(res, '门店编码已存在');
    }

    const store = await Store.create({
      name, code, address, phone,
      status: status !== undefined ? status : 1
    });

    success(res, store, '门店创建成功');
  } catch (err) {
    console.error('创建门店失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== PUT /:id - 更新门店 ====================
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return fail(res, '权限不足，仅管理员可修改门店', 1, 403);
    }

    const store = await Store.findByPk(req.params.id);
    if (!store) {
      return fail(res, '门店不存在');
    }

    const { name, code, address, phone, status } = req.body;

    // 检查编码唯一性
    if (code && code !== store.code) {
      const existing = await Store.findOne({ where: { code } });
      if (existing) {
        return fail(res, '门店编码已存在');
      }
    }

    await store.update({ name, code, address, phone, status });
    success(res, store, '门店更新成功');
  } catch (err) {
    console.error('更新门店失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== DELETE /:id - 删除门店 ====================
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return fail(res, '权限不足，仅管理员可删除门店', 1, 403);
    }

    const store = await Store.findByPk(req.params.id);
    if (!store) {
      return fail(res, '门店不存在');
    }

    await store.destroy();
    success(res, null, '门店删除成功');
  } catch (err) {
    console.error('删除门店失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

module.exports = router;
