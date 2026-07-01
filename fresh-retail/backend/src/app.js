const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const appConfig = require('./config/app');
const {
  sequelize,
  Store,
  Category,
  Product,
  Stock,
  Member,
  Order,
  OrderItem,
  Supplier,
  PurchaseOrder,
  PurchaseOrderItem,
  StockLoss,
  User,
  MemberLevel
} = require('./models');

// ==================== 导入路由 ====================
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const stockRoutes = require('./routes/stocks');
const orderRoutes = require('./routes/orders');
const memberRoutes = require('./routes/members');
const storeRoutes = require('./routes/stores');
const supplierRoutes = require('./routes/suppliers');
const purchaseRoutes = require('./routes/purchases');
const lossRoutes = require('./routes/loss');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// ==================== 中间件 ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==================== 健康检查路由 ====================
app.get('/api/health', (req, res) => {
  res.json({ code: 0, message: '服务运行正常', timestamp: new Date() });
});

// ==================== 注册路由 ====================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/loss', lossRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ==================== 404处理 ====================
app.use('/api', (req, res) => {
  res.status(404).json({ code: 1, message: '接口不存在' });
});

// ==================== 全局错误处理 ====================
app.use((err, req, res, next) => {
  console.error('未捕获的错误:', err);
  res.status(500).json({ code: 1, message: '服务器内部错误' });
});

// ==================== 初始化种子数据 ====================
async function seedData() {
  // 检查是否已有数据
  const userCount = await User.count();
  if (userCount > 0) {
    console.log('数据库已有数据，跳过种子数据初始化');
    return;
  }

  console.log('正在初始化种子数据...');

  // 1. 创建默认管理员用户
  const adminPassword = await bcrypt.hash('admin123', appConfig.bcryptSaltRounds);
  await User.create({
    username: 'admin',
    password: adminPassword,
    realName: '系统管理员',
    role: 'admin',
    phone: '13800000001',
    status: 1
  });

  // 2. 创建3个会员等级
  await MemberLevel.bulkCreate([
    { name: '普通会员', minPoints: 0, maxPoints: 999, discountRate: 1.00, pointsMultiplier: 1.0 },
    { name: '白银会员', minPoints: 1000, maxPoints: 4999, discountRate: 0.95, pointsMultiplier: 1.5 },
    { name: '黄金会员', minPoints: 5000, maxPoints: 99999, discountRate: 0.90, pointsMultiplier: 2.0 }
  ]);

  // 3. 创建2个门店
  await Store.bulkCreate([
    { name: '中心旗舰店', code: 'S001', address: '市中心商业区A栋1楼', phone: '021-88880001', status: 1 },
    { name: '城西分店', code: 'S002', address: '城西区发展路88号', phone: '021-88880002', status: 1 }
  ]);

  // 4. 创建5个商品分类
  await Category.bulkCreate([
    { name: '水果', parentId: 0, sort_order: 1, status: 1 },
    { name: '蔬菜', parentId: 0, sort_order: 2, status: 1 },
    { name: '肉类', parentId: 0, sort_order: 3, status: 1 },
    { name: '水产', parentId: 0, sort_order: 4, status: 1 },
    { name: '熟食', parentId: 0, sort_order: 5, status: 1 }
  ]);

  // 5. 创建10个示例商品（每个分类2个）
  await Product.bulkCreate([
    // 水果 (categoryId: 1)
    { name: '红富士苹果', sku: 'FRU-001', barcode: '6901234000001', categoryId: 1, unit: 'kg', price: 8.80, costPrice: 5.50, stockQty: 200, shelfLife: 30, minStock: 20, status: 1 },
    { name: '海南香蕉', sku: 'FRU-002', barcode: '6901234000002', categoryId: 1, unit: 'kg', price: 5.50, costPrice: 3.20, stockQty: 150, shelfLife: 7, minStock: 15, status: 1 },
    // 蔬菜 (categoryId: 2)
    { name: '有机花菜', sku: 'VEG-001', barcode: '6901234000003', categoryId: 2, unit: 'kg', price: 6.00, costPrice: 3.00, stockQty: 100, shelfLife: 5, minStock: 10, status: 1 },
    { name: '小番茄', sku: 'VEG-002', barcode: '6901234000004', categoryId: 2, unit: 'kg', price: 12.80, costPrice: 7.00, stockQty: 80, shelfLife: 7, minStock: 10, status: 1 },
    // 肉类 (categoryId: 3)
    { name: '黑猪五花肉', sku: 'MEA-001', barcode: '6901234000005', categoryId: 3, unit: 'kg', price: 32.00, costPrice: 22.00, stockQty: 50, shelfLife: 3, minStock: 5, status: 1 },
    { name: '冰鲜鸡胸肉', sku: 'MEA-002', barcode: '6901234000006', categoryId: 3, unit: 'kg', price: 18.00, costPrice: 12.00, stockQty: 60, shelfLife: 3, minStock: 5, status: 1 },
    // 水产 (categoryId: 4)
    { name: '鲜活草鱼', sku: 'SEA-001', barcode: '6901234000007', categoryId: 4, unit: 'kg', price: 15.80, costPrice: 10.00, stockQty: 40, shelfLife: 2, minStock: 5, status: 1 },
    { name: '南美大虾', sku: 'SEA-002', barcode: '6901234000008', categoryId: 4, unit: 'kg', price: 58.00, costPrice: 38.00, stockQty: 30, shelfLife: 5, minStock: 3, status: 1 },
    // 熟食 (categoryId: 5)
    { name: '蜜汁叉烧', sku: 'CKD-001', barcode: '6901234000009', categoryId: 5, unit: 'kg', price: 45.00, costPrice: 28.00, stockQty: 20, shelfLife: 2, minStock: 3, status: 1 },
    { name: '卤牛肉', sku: 'CKD-002', barcode: '6901234000010', categoryId: 5, unit: 'kg', price: 68.00, costPrice: 45.00, stockQty: 15, shelfLife: 3, minStock: 2, status: 1 }
  ]);

  // 6. 为每个门店的每个商品初始化库存记录
  const products = await Product.findAll({ attributes: ['id', 'minStock'] });
  const stores = await Store.findAll({ attributes: ['id'] });
  const stockRecords = [];
  for (const store of stores) {
    for (const product of products) {
      stockRecords.push({
        storeId: store.id,
        productId: product.id,
        qty: 50.00,
        minStock: product.minStock || 10,
        batchNo: `BATCH-${Date.now()}-${product.id}`
      });
    }
  }
  await Stock.bulkCreate(stockRecords);

  // 7. 创建2个供应商
  await Supplier.bulkCreate([
    { name: '绿源农产品供应链有限公司', contact: '张经理', phone: '13900001001', address: '市郊区农产品物流中心A区', status: 1 },
    { name: '海达水产贸易公司', contact: '李经理', phone: '13900001002', address: '市水产批发市场B栋', status: 1 }
  ]);

  // 8. 创建1个收银员用户
  const cashierPassword = await bcrypt.hash('123456', appConfig.bcryptSaltRounds);
  await User.create({
    username: 'cashier1',
    password: cashierPassword,
    realName: '收银员小王',
    role: 'cashier',
    storeId: 1,
    phone: '13800000002',
    status: 1
  });

  console.log('种子数据初始化完成！');
}

// ==================== 启动服务 ====================
async function start() {
  try {
    // 同步数据库模型
    await sequelize.sync({ force: false });
    console.log('数据库同步成功');

    // 初始化种子数据
    await seedData();

    // 启动HTTP服务
    app.listen(appConfig.port, () => {
      console.log(`生鲜称重连锁系统后端服务已启动: http://localhost:${appConfig.port}`);
    });
  } catch (err) {
    console.error('服务启动失败:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
