// config/index.ts - Taro 多端统一构建配置
import path from 'path'

const config = {
  projectName: 'campus-service',
  date: '2026-06-20',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {
    API_BASE: JSON.stringify('https://api.campus.example.com'),
    APP_VERSION: JSON.stringify('1.0.0')
  },
  copy: {
    patterns: [],
    options: {}
  },
  framework: 'react',
  compiler: 'webpack5',
  sass: {
    resource: [
      path.resolve(__dirname, '..', 'src/styles/variables.scss')
    ]
  },
  cache: {
    enable: false
  },
  mini: {
    postcss: {
      pxtransform: { enable: true, config: {} },
      cssModules: {
        enable: false,
        config: { namingPattern: 'module', generateScopedName: '[name]__[local]___[hash:base64:5]' }
      }
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: { enable: true, config: { browsers: ['last 3 versions', 'Android >= 4.1', 'iOS >= 8'] } }
    },
    devServer: {
      port: 10086,
      host: '0.0.0.0',
      historyApiFallback: true,
      hot: true
    }
  },
  rn: {
    appName: 'campusApp',
    output: { dir: 'android/app/src/main/assets', root: 'src', filename: 'index.bundle' }
  }
}

// 根据编译类型动态调整 outputRoot
const typeConfig = {
  weapp: { outputRoot: 'dist/weapp' },
  alipay: { outputRoot: 'dist/alipay' },
  tt: { outputRoot: 'dist/tt' },
  qq: { outputRoot: 'dist/qq' },
  jd: { outputRoot: 'dist/jd' },
  swan: { outputRoot: 'dist/swan' },
  h5: { outputRoot: 'dist/h5' },
  rn: { outputRoot: 'dist/rn' }
}

const TARO_ENV = process.env.TARO_ENV || 'weapp'
const envConfig = typeConfig[TARO_ENV] || typeConfig.weapp

module.exports = { ...config, ...envConfig }
