const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Supplier } = require('../models');
const auth = require('../middleware/auth');

// 统一响应格式
const success = (res, data, message = '操作成功') => {
  res.json({ code: 0, message, data });
};

const fail = (res, message, code = 1, httpStatus = 400) => {
  res.status(httpStatus).json({ code, message });
};

// ==================== GET / - 获取供应商列表 ====================
router.get('/', auth, async (req, res) => {
  try {
    const { page, pageSize, keyword, status } = req.query;

    const where = {};
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { contact: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (status !== undefined) where.status = status;

    // 如果没有分页参数，返回全部
    if (!page || !pageSize) {
      const suppliers = await Supplier.findAll({
        where,
        order: [['id', 'ASC']]
      });
      return success(res, suppliers);
    }

    const offset = (page - 1) * pageSize;
    const { count, rows } = await Supplier.findAndCountAll({
      where,
      order: [['id', 'ASC']],
      offset: parseInt(offset),
      limit: parseInt(pageSize)
    });

    success(res, { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (err) {
    console.error('获取供应商列表失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== GET /:id - 获取供应商详情 ====================
router.get('/:id', auth, async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return fail(res, '供应商不存在');
    }
    success(res, supplier);
  } catch (err) {
    console.error('获取供应商详情失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== POST / - 创建供应商 ====================
router.post('/', auth, async (req, res) => {
  try {
    const { name, contact, phone, address, status } = req.body;
    if (!name) {
      return fail(res, '供应商名称不能为空');
    }

    const supplier = await Supplier.create({
      name, contact, phone, address,
      status: status !== undefined ? status : 1
    });

    success(res, supplier, '供应商创建成功');
  } catch (err) {
    console.error('创建供应商失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== PUT /:id - 更新供应商 ====================
router.put('/:id', auth, async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return fail(res, '供应商不存在');
    }

    const { name, contact, phone, address, status } = req.body;
    await supplier.update({ name, contact, phone, address, status });

    success(res, supplier, '供应商更新成功');
  } catch (err) {
    console.error('更新供应商失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== DELETE /:id - 删除供应商 ====================
router.delete('/:id', auth, async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return fail(res, '供应商不存在');
    }

    await supplier.destroy();
    success(res, null, '供应商删除成功');
  } catch (err) {
    console.error('删除供应商失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

module.exports = router;
