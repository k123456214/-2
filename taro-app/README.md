# 🎓 校园综合服务平台 · 多端小程序（Taro 4.x）

一套代码，多端发布。基于 **Taro 4.x + React + TypeScript** 构建，覆盖微信/支付宝/抖音/QQ/京东小程序、H5、React Native 等主流平台。

## ✨ 功能清单

### 🍔 外卖点餐系统
- 商户列表（分类筛选、评分、月销、起送价、配送费）
- 店铺页：左侧分类、右侧商品、底部浮动购物车
- **商品多规格属性**：支持 `select`（单选）/`multiselect`（多选，可带附加价）/`number`（数字步进）/`text`（备注）
- 购物车动态计算：基础价 + 附加价 × 数量
- 结算页：地址选择、优惠券、支付方式（微信/余额/券）
- 订单详情：制作中/配送中/已送达状态流、打印小票

### 🏪 多商户服务
- **商户入驻申请表单**：营业执照、法人信息、联系方式、店铺分类/地址
- 管理员审核流程（模拟状态通知）
- 商户列表/详情页、分类筛选、排序
- **商户后台首页**：今日订单/销售额、本周销售数据、最新订单
- **商品管理**：新增/编辑/下架、动态属性配置
- **商品编辑**：动态添加/删除属性、设置属性类型与选项
- **订单管理**：接单/拒单/打印小票/联系用户

### 🎯 兴趣社区
- 社区列表（卡片式，分类标签：运动/科技/艺术/音乐/其他）
- 社区详情：动态 / 活动 / 成员 Tab
- 创建社区：名称、分类、简介、图标、公告
- 活动页：活动卡片、报名按钮、已报名人数

### 📚 校园论坛
- **板块**：校园生活 / 学习交流 / 失物招领 / 求职招聘
- **帖子列表**：置顶帖、精华帖、热帖排序、点赞/评论数
- **帖子详情**：完整正文、点赞、收藏、投票、评论列表
- **发帖**：选择板块、标题、正文、添加选项投票、匿名开关

### 💌 表白墙
- **时间线**展示（最新/热门 Tab）
- **匿名投稿**：文字 + 图片上传、审核机制
- 详情页：点赞、举报、匿名评论

### 🛍️ 二手市场
- **瀑布流商品卡**（数码/书籍/服饰/生活用品/其他）
- 发布页：图片、标题、描述、分类、原价/售价、议价开关、线下交易地
- 商品详情：大图、卖家信息、信用分、私信/购买
- 我的商品：出售中 / 已下架 / 已售出 Tab

### 🏃 跑腿服务
- **任务列表** Tab：我发布的 / 我接的 / 附近任务
- 发布任务：类型、地址、描述、费用
- 任务详情：发单人、接单人、状态流、接单按钮

### 👤 用户中心
- 个人资料（头像、昵称、积分、等级）
- 登录页（手机号 + 验证码、微信授权）
- 我的订单（全部/待付款/待收货/已完成/退款）
- 优惠券中心（我的券）
- 我的收藏（商品/店铺 Tab）
- 设置（资料、地址、消息通知、角色切换、清缓存）

### ✨ DIY 自定义页面 + H5
- `diy`：读取服务端页面组件配置（title/richtext/image/button/goods-list/text/divider/empty），动态渲染，脱离代码发版
- `h5`：`web-view` 嵌入外部 H5，支持复制链接、分享

## 🧩 技术架构

```
taro-app/
├─ src/
│  ├─ app.tsx             # 应用入口
│  ├─ app.config.ts       # 全局路由 + Tab Bar
│  ├─ app.scss            # 全局样式 / 设计令牌
│  ├─ services/api.ts     # 业务 API 聚合层
│  ├─ utils/
│  │  ├─ index.ts         # 通用工具（toast/format/navigate/storage...）
│  │  ├─ request.ts       # 统一请求（含内置 mock 数据池，零后端可演示）
│  │  └─ printer.ts       # ★ 通用云打印机（飞鹅/易联云/商米/芯烨/自定义）
│  ├─ pages/
│  │  ├─ index/index.tsx  # 首页（快捷入口 + 商户 + 论坛）
│  │  ├─ food/            # 外卖点餐
│  │  ├─ merchant/        # 商户管理
│  │  ├─ community/       # 兴趣社区
│  │  ├─ forum/           # 校园论坛
│  │  ├─ confession/      # 表白墙
│  │  ├─ market/          # 二手市场
│  │  ├─ errand/          # 跑腿服务
│  │  ├─ custom/          # DIY 自定义页面 + H5
│  │  └─ user/            # 用户中心
│  └─ global.d.ts
├─ config/index.ts        # Taro 打包配置
├─ babel.config.js
├─ tsconfig.json
└─ package.json
```

### 设计令牌（Design Tokens）
| Token | 值 | 用途 |
|---|---|---|
| primary | `#1890ff` | 品牌主色 |
| success | `#52c41a` | 成功/绿色操作 |
| warning | `#faad14` | 警告/评分 |
| danger | `#f5222d` | 价格/删除/举报 |
| bg-color | `#f5f5f5` | 背景 |
| 圆角 | `16rpx` | 卡片、按钮 |
| 阴影 | `0 2rpx 12rpx rgba(0,0,0,.04)` | 卡片阴影 |

### 🖨️ 通用云打印机（utils/printer.ts）
- **飞鹅云 Feie**：`POST https://api.feieyun.cn/Api/Open/`
- **易联云 Yilianyun**：`POST https://open-api.10ss.net/print/index`
- **商米 Sunmi**：`POST https://api.sunmi.com/printer/print`（Bearer Token）
- **芯烨 Xprinter**：`POST https://api.xprinter.cn/print`
- **自定义 HTTP**：任意 REST 接口
- 小票模板：`<CB>店铺名称</CB> / <QR>order_xxx</QR> / <CUT> 自动切纸`
- 未配置 API 时，自动降级为本地模拟打印 + 控制台输出

## 🚀 快速开始

### 1. 安装依赖
```bash
cd taro-app
npm install
```

### 2. 启动开发（选一或多选）
```bash
# 微信小程序
npm run dev:weapp          # 然后用 微信开发者工具 打开 dist/weapp 目录

# 支付宝小程序
npm run dev:alipay

# 抖音/头条小程序
npm run dev:tt

# QQ 小程序
npm run dev:qq

# 京东小程序
npm run dev:jd

# H5 网页（可直接浏览器访问）
npm run dev:h5

# React Native
npm run dev:rn
```

### 3. 生产构建
```bash
npm run build:weapp        # 微信小程序产物：dist/weapp
npm run build:h5           # H5 产物：dist/h5 (可部署至 Nginx/Vercel)
```

### 4. 接入后端（可选）
修改 `src/utils/request.ts` 中的 `BASE_URL` 指向你的服务端即可。当前默认包含 **完整 mock 数据池**，不启动后端也能演示全部页面。

配套参考服务端见 `../server/index.js`（Node.js + Express，60+ 条 REST API）。

### 5. 微信开发者工具导入
1. 打开「微信开发者工具」
2. 选择「导入项目」
3. 项目目录：`taro-app/dist/weapp`
4. AppID：填你自己的（或"测试号"）
5. 开始预览/真机调试

同样的方式，`dist/alipay` 导入到支付宝开发者工具，`dist/tt` 导入到抖音开发者工具，以此类推。

## 📦 打包与发布

| 平台 | 产物目录 | 发布方式 |
|---|---|---|
| 微信小程序 | `dist/weapp` | 微信开发者工具 → 上传 |
| 支付宝小程序 | `dist/alipay` | 支付宝开放平台 |
| 抖音/头条小程序 | `dist/tt` | 抖音开放平台 |
| QQ 小程序 | `dist/qq` | QQ 开放平台 |
| 京东小程序 | `dist/jd` | 京东小程序 |
| H5 网页 | `dist/h5` | 部署至 CDN / Nginx / Vercel |
| React Native | `dist/rn` | Xcode / Android Studio |

## 📁 页面地图（全部 37 个页面）

```
pages/
├─ index/index                      # 首页（快捷入口/商户/论坛）
├─ food/
│  ├─ index/index                   # 外卖商户列表
│  ├─ shop/shop                     # 店铺页 + 购物车 + 多规格属性选择
│  ├─ checkout/checkout             # 结算（地址、优惠券、支付方式）
│  └─ order-detail/order-detail     # 订单详情 / 状态流 / 云打印
├─ merchant/
│  ├─ list/list                     # 商户列表
│  ├─ detail/detail                 # 商户详情
│  ├─ apply/apply                   # 商户入驻申请
│  ├─ my-shop/my-shop               # 商户后台首页（数据看板）
│  ├─ goods-manage/goods-manage     # 商品管理
│  ├─ goods-edit/goods-edit         # ★ 商品新增/编辑（动态属性配置）
│  └─ order-manage/order-manage     # 商户订单管理
├─ community/
│  ├─ list/list                     # 社区列表
│  ├─ detail/detail                 # 社区详情（帖子/活动/成员 Tab）
│  ├─ create/create                 # 创建社区
│  └─ activity/activity             # 社区活动 + 报名
├─ forum/
│  ├─ list/list                     # 论坛板块 + 帖子列表
│  ├─ detail/detail                 # 帖子详情 + 点赞/收藏/投票/评论
│  └─ publish/publish               # 发帖（板块/标题/正文/投票/匿名）
├─ confession/
│  ├─ list/list                     # 表白墙时间线（最新/热门 Tab）
│  ├─ detail/detail                 # 表白详情 + 评论/举报
│  └─ publish/publish               # 匿名投稿
├─ market/
│  ├─ list/list                     # 二手商品列表（瀑布流 + 分类筛选）
│  ├─ detail/detail                 # 商品详情（价格/卖家/信用分）
│  ├─ publish/publish               # 发布二手商品
│  └─ my-goods/my-goods             # 我的商品（出售中/已下架/已售出 Tab）
├─ errand/
│  ├─ list/list                     # 跑腿任务列表
│  ├─ publish/publish               # 发布跑腿任务
│  └─ detail/detail                 # 任务详情 / 接单 / 完成
├─ custom/
│  ├─ diy/diy                       # ★ DIY 自定义页面（服务端驱动渲染）
│  └─ h5/h5                         # ★ H5 页面嵌入（web-view）
└─ user/
   ├─ profile/profile               # 个人中心
   ├─ login/login                   # 登录/注册
   ├─ order/my-order                # 我的订单（Tab 切换）
   ├─ coupon/coupon                 # 优惠券
   ├─ favorite/favorite             # 收藏（商品/店铺 Tab）
   └─ settings/settings             # 设置（资料/地址/角色/清缓存）
```

## 🔩 代码风格

- 所有页面：**React 函数组件 + Hooks**
- TypeScript **严格类型**（`any` 仅用于接口过渡）
- 统一组件库：`@tarojs/components`
- 路由：`Taro.navigateTo / switchTab / navigateBack`
- API 聚合于 `src/services/api.ts`，每个方法可独立 mock/测试
- 请求工具：`utils/request.ts`，401 自动跳登录、网络失败自动降级 mock

## 📜 License
MIT © 校园服务平台
