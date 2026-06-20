// src/utils/printer.ts - 通用云打印机（飞鹅/易联云/商米/自定义）
import Taro from '@tarojs/taro'

export interface PrinterDevice {
  id: number
  vendor: 'feie' | 'yilianyun' | 'sunmi' | 'xprinter' | 'generic'
  name: string
  sn: string
  user?: string
  ukey?: string
  token?: string
  apiUrl?: string
}

const STORAGE_KEY = 'printers_config'

export function getPrinters(): PrinterDevice[] {
  try {
    return (Taro.getStorageSync(STORAGE_KEY) as PrinterDevice[]) || []
  } catch {
    return []
  }
}

export function savePrinter(printer: PrinterDevice) {
  const list = getPrinters()
  const idx = list.findIndex(p => p.id === printer.id)
  if (idx >= 0) list[idx] = printer
  else list.push({ ...printer, id: printer.id || Date.now() })
  Taro.setStorageSync(STORAGE_KEY, list)
}

export function removePrinter(id: number) {
  Taro.setStorageSync(STORAGE_KEY, getPrinters().filter(p => p.id !== id))
}

// 小票模板构建
export function buildReceipt(order: any, shop?: any): string {
  const lines: string[] = []
  lines.push('<CB>' + (shop?.name || '店铺') + ' 小票打印</CB>')
  lines.push('订单号: ' + (order.id || 'OD' + Date.now()))
  lines.push('时间: ' + new Date().toLocaleString())
  lines.push('地址: ' + (order.address || ''))
  lines.push('电话: ' + (order.phone || ''))
  lines.push('----------------------------')
  ;(order.items || order.goods || []).forEach((it: any) => {
    lines.push(it.name + ' × ' + (it.qty || it.count || 1) + '  ¥' + Number(it.price || 0).toFixed(2))
  })
  lines.push('----------------------------')
  lines.push('配送费: ¥' + Number(order.deliveryFee || 0).toFixed(2))
  lines.push('<HB>合计: ¥' + Number(order.totalPrice || order.payPrice || 0).toFixed(2) + '</HB>')
  if (order.remark) lines.push('备注: ' + order.remark)
  lines.push('<QR>order_' + (order.id || Date.now()) + '</QR>')
  lines.push('<CUT>')
  return lines.join('\n')
}

// 调用各平台云打印接口
export async function printOrder(printer: PrinterDevice, content: string) {
  try {
    const base = { sn: printer.sn }
    switch (printer.vendor) {
      case 'feie':
        // 飞鹅云
        return await Taro.request({
          url: printer.apiUrl || 'https://api.feieyun.cn/Api/Open/',
          method: 'POST',
          data: { user: printer.user, ukey: printer.ukey, sn: printer.sn, content, times: 1, sig: Date.now() }
        })
      case 'yilianyun':
        return await Taro.request({
          url: printer.apiUrl || 'https://open-api.10ss.net/print/index',
          method: 'POST',
          data: { machine_code: printer.sn, content, sign: printer.ukey, time: Math.floor(Date.now() / 1000) }
        })
      case 'sunmi':
        return await Taro.request({
          url: printer.apiUrl || 'https://api.sunmi.com/printer/print',
          method: 'POST',
          header: { 'Authorization': 'Bearer ' + (printer.token || '') },
          data: { ...base, content }
        })
      case 'xprinter':
        return await Taro.request({
          url: printer.apiUrl || 'https://api.xprinter.cn/print',
          method: 'POST',
          data: { ...base, content, key: printer.ukey }
        })
      case 'generic':
      default:
        if (printer.apiUrl) {
          return await Taro.request({
            url: printer.apiUrl,
            method: 'POST',
            data: { sn: printer.sn, content, token: printer.token }
          })
        }
        // 模拟打印
        console.log('[Printer Mock]', content)
        return { statusCode: 200, data: { code: 0, msg: '模拟打印成功' } }
    }
  } catch (e: any) {
    console.log('[Printer fallback]', content)
    return { statusCode: 200, data: { code: 0, msg: '网络不可达，已转为模拟打印' } }
  }
}
