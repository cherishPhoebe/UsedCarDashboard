/**
 * 验证工具类
 */

// 邮箱验证
export const isEmail = (email: string): boolean => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return regex.test(email)
}

// 手机号验证（中国）
export const isPhone = (phone: string): boolean => {
  const regex = /^1[3-9]\d{9}$/
  return regex.test(phone)
}

// 身份证验证（中国）
export const isIdCard = (idCard: string): boolean => {
  const regex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return regex.test(idCard)
}

// 密码强度验证
export const isStrongPassword = (password: string): boolean => {
  // 至少8位，包含大小写字母、数字和特殊字符
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return regex.test(password)
}

// URL验证
export const isUrl = (url: string): boolean => {
  const regex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/
  return regex.test(url)
}

// IP地址验证
export const isIp = (ip: string): boolean => {
  const regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return regex.test(ip)
}

// 用户名验证（3-20位，字母数字下划线）
export const isUsername = (username: string): boolean => {
  const regex = /^[a-zA-Z0-9_]{3,20}$/
  return regex.test(username)
}

// 验证码验证（4-6位数字）
export const isCaptcha = (captcha: string): boolean => {
  const regex = /^\d{4,6}$/
  return regex.test(captcha)
}

// 数字验证
export const isNumber = (num: string): boolean => {
  const regex = /^\d+$/
  return regex.test(num)
}

// 小数验证
export const isDecimal = (num: string, decimalPlaces: number = 2): boolean => {
  const regex = new RegExp(`^\\d+(\\.\\d{1,${decimalPlaces}})?$`)
  return regex.test(num)
}

// 正整数验证
export const isPositiveInteger = (num: string): boolean => {
  const regex = /^[1-9]\d*$/
  return regex.test(num)
}

// 非负整数验证
export const isNonNegativeInteger = (num: string): boolean => {
  const regex = /^\d+$/
  return regex.test(num)
}

// 文件扩展名验证
export const isFileType = (filename: string, allowedExtensions: string[]): boolean => {
  const extension = filename.split('.').pop()?.toLowerCase() || ''
  return allowedExtensions.includes(extension)
}

// 文件大小验证（MB）
export const isFileSize = (file: File, maxSizeMB: number): boolean => {
  return file.size <= maxSizeMB * 1024 * 1024
}

// 空值验证
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  if (typeof value === 'object' && Object.keys(value).length === 0) return true
  return false
}

// 非空验证
export const isNotEmpty = (value: any): boolean => {
  return !isEmpty(value)
}

// 数组验证
export const isArray = (value: any): boolean => {
  return Array.isArray(value)
}

// 对象验证
export const isObject = (value: any): boolean => {
  return Object.prototype.toString.call(value) === '[object Object]'
}

// 函数验证
export const isFunction = (value: any): boolean => {
  return typeof value === 'function'
}

// 日期验证
export const isDate = (date: string): boolean => {
  const d = new Date(date)
  return d instanceof Date && !isNaN(d.getTime())
}

// 时间戳验证
export const isTimestamp = (timestamp: number): boolean => {
  return new Date(timestamp).getTime() > 0
}

// 颜色值验证（hex）
export const isHexColor = (color: string): boolean => {
  const regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  return regex.test(color)
}

// JSON验证
export const isJson = (str: string): boolean => {
  try {
    JSON.parse(str)
    return true
  } catch (e) {
    return false
  }
}

// 路径验证
export const isValidPath = (path: string): boolean => {
  const regex = /^(\/[a-zA-Z0-9_.-]+)+$/
  return regex.test(path)
}

// 表单验证器
export const validate = {
  // 必填验证
  required: (value: any, message: string = '此项为必填项') => {
    if (isEmpty(value)) return message
    return ''
  },

  // 邮箱验证
  email: (value: string, message: string = '邮箱格式不正确') => {
    if (!isEmpty(value) && !isEmail(value)) return message
    return ''
  },

  // 手机号验证
  phone: (value: string, message: string = '手机号格式不正确') => {
    if (!isEmpty(value) && !isPhone(value)) return message
    return ''
  },

  // 长度验证
  length: (value: string, min: number, max: number, message?: string) => {
    if (isEmpty(value)) return ''
    const length = value.length
    if (length < min || length > max) {
      return message || `长度必须在 ${min} 到 ${max} 个字符之间`
    }
    return ''
  },

  // 最小值验证
  min: (value: number, min: number, message?: string) => {
    if (isEmpty(value)) return ''
    if (value < min) {
      return message || `值不能小于 ${min}`
    }
    return ''
  },

  // 最大值验证
  max: (value: number, max: number, message?: string) => {
    if (isEmpty(value)) return ''
    if (value > max) {
      return message || `值不能大于 ${max}`
    }
    return ''
  },

  // 范围验证
  range: (value: number, min: number, max: number, message?: string) => {
    if (isEmpty(value)) return ''
    if (value < min || value > max) {
      return message || `值必须在 ${min} 到 ${max} 之间`
    }
    return ''
  },

  // 正则验证
  pattern: (value: string, pattern: RegExp, message: string) => {
    if (isEmpty(value)) return ''
    if (!pattern.test(value)) return message
    return ''
  },

  // 自定义验证
  custom: (value: any, validator: (value: any) => boolean, message: string) => {
    if (isEmpty(value)) return ''
    if (!validator(value)) return message
    return ''
  }
}

export default validate