module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'fresh_retail_jwt_secret_key_2024',
  jwtExpiresIn: '24h',
  bcryptSaltRounds: 10
};
