const jwt = require('jsonwebtoken');
const appConfig = require('../config/app');

const auth = (req, res, next) => {
  // 从Authorization header提取Bearer token
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: '未提供认证令牌，请先登录'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 验证token
    const decoded = jwt.verify(token, appConfig.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 401,
        message: '令牌已过期，请重新登录'
      });
    }
    return res.status(401).json({
      code: 401,
      message: '无效的认证令牌'
    });
  }
};

module.exports = auth;
