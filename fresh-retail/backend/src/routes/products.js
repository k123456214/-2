const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Product, Category, sequelize } = require('../models');
const auth = require('../middleware/auth');

// 统一响应格式
const success = (res, data, message = '操作成功') => {
  res.json({ code: 0, message, data });
};

const fail = (res, message, code = 1, httpStatus = 400) => {
  res.status(httpStatus).json({ code, message });
};

// ==================== GET / - 获取商品列表 ====================
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, categoryId, status } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { sku: { [Op.like]: `%${keyword}%` } },
        { barcode: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (status !== undefined) where.status = status;

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
      order: [['id', 'DESC']],
      offset: parseInt(offset),
      limit: parseInt(pageSize)
    });

    success(res, { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (err) {
    console.error('获取商品列表失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== GET /categories/tree - 获取商品分类树（必须在 /:id 之前） ====================
router.get('/categories/tree', auth, async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { status: 1 },
      order: [['sort_order', 'ASC'], ['id', 'ASC']]
    });

    // 构建树形结构
    const buildTree = (parentId = 0) => {
      return categories
        .filter(c => c.parentId === parentId)
        .map(c => ({
          id: c.id,
          name: c.name,
          parentId: c.parentId,
          sortOrder: c.sort_order,
          status: c.status,
          children: buildTree(c.id)
        }));
    };

    const tree = buildTree();
    success(res, tree);
  } catch (err) {
    console.error('获取分类树失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== GET /categories/list - 获取商品分类列表（必须在 /:id 之前） ====================
router.get('/categories/list', auth, async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['sort_order', 'ASC'], ['id', 'ASC']]
    });
    success(res, categories);
  } catch (err) {
    console.error('获取分类列表失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== GET /:id - 获取商品详情 ====================
router.get('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: require('../models').Stock, as: 'stocks', include: ['store'] }
      ]
    });
    if (!product) {
      return fail(res, '商品不存在');
    }
    success(res, product);
  } catch (err) {
    console.error('获取商品详情失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== POST / - 创建商品 ====================
router.post('/', auth, async (req, res) => {
  try {
    const { name, sku, barcode, categoryId, unit, price, costPrice, shelfLife, minStock, imageUrl, status } = req.body;
    if (!name || !sku || !categoryId || price === undefined) {
      return fail(res, '商品名称、SKU、分类和售价不能为空');
    }

    const existing = await Product.findOne({ where: { sku } });
    if (existing) {
      return fail(res, 'SKU编码已存在');
    }

    const product = await Product.create({
      name, sku, barcode, categoryId, unit, price, costPrice,
      shelfLife, minStock, imageUrl, status: status !== undefined ? status : 1
    });

    success(res, product, '商品创建成功');
  } catch (err) {
    console.error('创建商品失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== PUT /:id - 更新商品 ====================
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return fail(res, '商品不存在');
    }

    const { name, sku, barcode, categoryId, unit, price, costPrice, shelfLife, minStock, imageUrl, status } = req.body;

    // 检查SKU唯一性
    if (sku && sku !== product.sku) {
      const existing = await Product.findOne({ where: { sku } });
      if (existing) {
        return fail(res, 'SKU编码已存在');
      }
    }

    await product.update({
      name, sku, barcode, categoryId, unit, price, costPrice,
      shelfLife, minStock, imageUrl, status
    });

    success(res, product, '商品更新成功');
  } catch (err) {
    console.error('更新商品失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== DELETE /:id - 删除商品 ====================
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return fail(res, '商品不存在');
    }

    await product.destroy();
    success(res, null, '商品删除成功');
  } catch (err) {
    console.error('删除商品失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== POST /categories - 创建分类 ====================
router.post('/categories', auth, async (req, res) => {
  try {
    const { name, parentId = 0, sort_order, status = 1 } = req.body;
    if (!name) {
      return fail(res, '分类名称不能为空');
    }

    const category = await Category.create({ name, parentId, sort_order: sort_order || 0, status });
    success(res, category, '分类创建成功');
  } catch (err) {
    console.error('创建分类失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== PUT /categories/:id - 更新分类 ====================
router.put('/categories/:id', auth, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return fail(res, '分类不存在');
    }

    const { name, parentId, sort_order, status } = req.body;
    await category.update({ name, parentId, sort_order, status });
    success(res, category, '分类更新成功');
  } catch (err) {
    console.error('更新分类失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

// ==================== DELETE /categories/:id - 删除分类 ====================
router.delete('/categories/:id', auth, async (req, res) => {
  try {
    const categoryId = req.params.id;

    // 检查是否有子分类
    const children = await Category.count({ where: { parentId: categoryId } });
    if (children > 0) {
      return fail(res, '该分类下有子分类，无法删除');
    }

    // 检查是否有商品关联
    const productCount = await Product.count({ where: { categoryId } });
    if (productCount > 0) {
      return fail(res, '该分类下有商品，无法删除');
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return fail(res, '分类不存在');
    }

    await category.destroy();
    success(res, null, '分类删除成功');
  } catch (err) {
    console.error('删除分类失败:', err);
    fail(res, '服务器内部错误', 1, 500);
  }
});

module.exports = router;
