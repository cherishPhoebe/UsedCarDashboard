/**
 * 格式化工具类
 */

import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// 配置dayjs
dayjs.locale('zh-cn')
dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * 格式化日期时间
 * @param date 日期字符串或Date对象
 * @param format 格式，默认：YYYY-MM-DD HH:mm:ss
 */
export const formatDate = (
  date: string | Date | number,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string => {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 格式化相对时间（如：3天前）
 */
export const formatRelativeTime = (date: string | Date): string => {
  if (!date) return ''
  return dayjs(date).fromNow()
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// /**
//  * 格式化数字（千分位）
//  * @param num 数字
//  * @param decimals 小数位数
//  */
// export const formatNumber = (num: number, decimals: number = 0): string => {
//   if (isNaN(num)) return '0'

//   const parts = num.toFixed(decimals).split('.')
//   parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

//   return parts.join('.')
// }

/**
 * 格式化百分比
 * @param value 数值
 * @param decimals 小数位数
 */
export const formatPercent = (value: number, decimals: number = 2): string => {
  return (value * 100).toFixed(decimals) + '%'
}

/**
 * 格式化手机号（隐藏中间四位）
 */
export const formatPhone = (phone: string): string => {
  if (!phone || phone.length !== 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 格式化身份证号（隐藏中间部分）
 */
export const formatIdCard = (idCard: string): string => {
  if (!idCard) return ''
  if (idCard.length === 15) {
    return idCard.replace(/(\d{6})\d{6}(\d{3})/, '$1******$2')
  } else if (idCard.length === 18) {
    return idCard.replace(/(\d{6})\d{8}(\w{4})/, '$1********$2')
  }
  return idCard
}

// /**
//  * 格式化金额（添加货币符号）
//  * @param amount 金额
//  * @param currency 货币符号，默认：¥
//  * @param decimals 小数位数
//  */
// export const formatCurrency = (
//   amount: number,
//   currency: string = '¥',
//   decimals: number = 2
// ): string => {
//   if (isNaN(amount)) return `${currency}0.00`

//   const num = Math.abs(amount).toFixed(decimals)
//   const parts = num.split('.')
//   parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

//   const result = parts.join('.')
//   const sign = amount < 0 ? '-' : ''

//   return `${sign}${currency}${result}`
// }

/**
 * 格式化持续时间（毫秒转可读格式）
 */
export const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`
  }

  const seconds = Math.floor(milliseconds / 1000)
  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (hours < 24) {
    return `${hours}h ${remainingMinutes}m`
  }

  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return `${days}d ${remainingHours}h`
}

/**
 * 格式化JSON字符串（美化输出）
 */
export const formatJson = (json: string | object, indent: number = 2): string => {
  try {
    const obj = typeof json === 'string' ? JSON.parse(json) : json
    return JSON.stringify(obj, null, indent)
  } catch (error) {
    return typeof json === 'string' ? json : JSON.stringify(json)
  }
}

/**
 * 格式化标签颜色
 */
export const formatTagColor = (type: string): string | undefined => {
  const colors: Record<string, string> = {
    success: '#67C23A',
    primary: '#409EFF',
    warning: '#E6A23C',
    danger: '#F56C6C',
    info: '#909399'
  }
  return colors[type] || colors.info
}

/**
 * 格式化状态文本
 */
export const formatStatus = (status: number | string): { text: string; type: string } => {
  const statusMap: Record<string | number, { text: string; type: string }> = {
    0: { text: '禁用', type: 'danger' },
    1: { text: '启用', type: 'success' },
    2: { text: '待审核', type: 'warning' },
    3: { text: '已锁定', type: 'info' },
    true: { text: '是', type: 'success' },
    false: { text: '否', type: 'danger' },
    'active': { text: '活跃', type: 'success' },
    'inactive': { text: '不活跃', type: 'danger' },
    'pending': { text: '待处理', type: 'warning' }
  }

  return statusMap[status] || { text: String(status), type: 'info' }
}

/**
 * 格式化权限类型
 */
export const formatPermissionType = (type: number): { text: string; type: string } => {
  const typeMap = {
    1: { text: '菜单', type: 'success' },
    2: { text: '按钮', type: 'warning' },
    3: { text: '接口', type: 'info' }
  }
  return typeMap[type as keyof typeof typeMap] || { text: '未知', type: 'info' }
}

/**
 * 格式化时间（短格式）
 */
export const formatTime = (date: string | Date): string => {
  return formatDate(date, 'HH:mm:ss')
}

/**
 * 格式化日期（短格式）
 */
export const formatShortDate = (date: string | Date): string => {
  return formatDate(date, 'MM-DD')
}

/**
 * 格式化周几
 */
export const formatWeekday = (date: string | Date): string | undefined => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const day = dayjs(date).day()
  return weekdays[day]
}

/**
 * 格式化时间范围
 */
export const formatTimeRange = (start: string | Date, end: string | Date): string => {
  if (!start || !end) return ''

  const startDate = dayjs(start)
  const endDate = dayjs(end)

  if (startDate.isSame(endDate, 'day')) {
    return `${formatDate(start, 'MM-DD HH:mm')} ~ ${formatDate(end, 'HH:mm')}`
  }

  return `${formatDate(start, 'MM-DD HH:mm')} ~ ${formatDate(end, 'MM-DD HH:mm')}`
}

/**
 * 去除HTML标签
 */
export const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '')
}

/**
 * 截断文本
 */
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + suffix
}

/**
 * 首字母大写
 */
export const capitalize = (str: string): string => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * 驼峰转连字符
 */
export const camelToKebab = (str: string): string => {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * 连字符转驼峰
 */
export const kebabToCamel = (str: string): string => {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

export default {
  formatDate,
  formatRelativeTime,
  formatFileSize,
  // formatNumber,
  formatPercent,
  formatPhone,
  formatIdCard,
  // formatCurrency,
  formatDuration,
  formatJson,
  formatTagColor,
  formatStatus,
  formatPermissionType,
  formatTime,
  formatShortDate,
  formatWeekday,
  formatTimeRange,
  stripHtmlTags,
  truncateText,
  capitalize,
  camelToKebab,
  kebabToCamel
}