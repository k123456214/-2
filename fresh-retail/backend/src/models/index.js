const sequelize = require('../config/database');

// 导入所有模型
const Store = require('./Store');
const Category = require('./Category');
const Product = require('./Product');
const Stock = require('./Stock');
const Member = require('./Member');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Supplier = require('./Supplier');
const PurchaseOrder = require('./PurchaseOrder');
const PurchaseOrderItem = require('./PurchaseOrderItem');
const StockLoss = require('./StockLoss');
const User = require('./User');
const MemberLevel = require('./MemberLevel');

// ==================== 定义模型关联关系 ====================

// Product <-> Category
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

// Stock <-> Product, Stock <-> Store
Stock.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Stock.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });
Product.hasMany(Stock, { foreignKey: 'productId', as: 'stocks' });
Store.hasMany(Stock, { foreignKey: 'storeId', as: 'stocks' });

// Order <-> Store, Order <-> Member, Order <-> OrderItem
Order.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });
Order.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });
Store.hasMany(Order, { foreignKey: 'storeId', as: 'orders' });
Member.hasMany(Order, { foreignKey: 'memberId', as: 'orders' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'orderItems' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Member <-> Store, Member <-> MemberLevel
Member.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });
Member.belongsTo(MemberLevel, { foreignKey: 'level', as: 'memberLevel' });
Store.hasMany(Member, { foreignKey: 'storeId', as: 'members' });
MemberLevel.hasMany(Member, { foreignKey: 'level', as: 'members' });

// PurchaseOrder <-> Store, PurchaseOrder <-> Supplier, PurchaseOrder <-> PurchaseOrderItem
PurchaseOrder.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });
Store.hasMany(PurchaseOrder, { foreignKey: 'storeId', as: 'purchaseOrders' });
Supplier.hasMany(PurchaseOrder, { foreignKey: 'supplierId', as: 'purchaseOrders' });
PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: 'purchaseOrderId', as: 'purchaseOrderItems' });
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId', as: 'purchaseOrder' });
PurchaseOrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User <-> Store
User.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });
Store.hasMany(User, { foreignKey: 'storeId', as: 'users' });

// StockLoss <-> Store, StockLoss <-> Product, StockLoss <-> User(as approvedBy)
StockLoss.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });
StockLoss.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
StockLoss.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
Store.hasMany(StockLoss, { foreignKey: 'storeId', as: 'stockLosses' });
Product.hasMany(StockLoss, { foreignKey: 'productId', as: 'stockLosses' });

module.exports = {
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
};
