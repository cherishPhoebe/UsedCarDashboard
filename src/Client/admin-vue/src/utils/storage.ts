// src/utils/storage.ts
/**
 * 本地存储工具类
 * 支持 localStorage 和 sessionStorage
 */

// 存储类型
export type StorageType = 'local' | 'session'

// 存储配置
export interface StorageConfig {
  type?: StorageType
  expire?: number // 过期时间（秒）
  prefix?: string // 存储键前缀
}

// 存储数据格式
interface StorageItem<T = any> {
  value: T
  timestamp: number
  expire: number | null
}

// 默认配置
const DEFAULT_CONFIG: StorageConfig = {
  type: 'local',
  expire: 7 * 24 * 60 * 60, // 7天
  prefix: 'rbac_'
}

/**
 * 获取存储对象实例
 */
const getStorageInstance = (type: StorageType = 'local'): Storage => {
  return type === 'local' ? localStorage : sessionStorage
}

/**
 * 生成存储键
 */
const generateStorageKey = (key: string, prefix?: string): string => {
  const actualPrefix = prefix || DEFAULT_CONFIG.prefix
  return `${actualPrefix}${key}`
}

/**
 * 设置存储项
 * @param key 键
 * @param value 值
 * @param config 配置
 */
export const setStorage = <T = any>(
  key: string,
  value: T,
  config?: StorageConfig
): void => {
  try {
    const { type = 'local', expire, prefix } = { ...DEFAULT_CONFIG, ...config }
    const storage = getStorageInstance(type)
    const storageKey = generateStorageKey(key, prefix)

    const data: StorageItem<T> = {
      value,
      timestamp: Date.now(),
      expire: expire ? Date.now() + expire * 1000 : null
    }

    storage.setItem(storageKey, JSON.stringify(data))
  } catch (error) {
    console.error('存储数据失败:', error)

    // 处理存储空间不足的情况
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('存储空间不足，尝试清理过期数据...')
      // 可以在这里添加清理过期数据的逻辑
    }
  }
}

/**
 * 获取存储项
 * @param key 键
 * @param config 配置
 * @returns 存储的值
 */
export const getStorage = <T = any>(
  key: string,
  config?: StorageConfig
): T | null => {
  try {
    const { type = 'local', prefix } = { ...DEFAULT_CONFIG, ...config }
    const storage = getStorageInstance(type)
    const storageKey = generateStorageKey(key, prefix)
    const item = storage.getItem(storageKey)

    if (!item) return null

    const data = JSON.parse(item) as StorageItem<T>

    // 检查是否过期
    if (data.expire && data.expire < Date.now()) {
      storage.removeItem(storageKey)
      return null
    }

    return data.value
  } catch (error) {
    console.error('获取存储数据失败:', error)
    return null
  }
}

/**
 * 移除存储项
 * @param key 键
 * @param config 配置
 */
export const removeStorage = (
  key: string,
  config?: StorageConfig
): void => {
  try {
    const { type = 'local', prefix } = { ...DEFAULT_CONFIG, ...config }
    const storage = getStorageInstance(type)
    const storageKey = generateStorageKey(key, prefix)
    storage.removeItem(storageKey)
  } catch (error) {
    console.error('移除存储数据失败:', error)
  }
}

/**
 * 清空存储（支持按前缀清空）
 * @param config 配置
 */
export const clearStorage = (config?: StorageConfig): void => {
  try {
    const { type = 'local', prefix } = { ...DEFAULT_CONFIG, ...config }
    const storage = getStorageInstance(type)

    if (prefix) {
      // 只清空指定前缀的项
      const keysToRemove: string[] = []
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i)
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach(key => storage.removeItem(key))
    } else {
      // 清空所有
      storage.clear()
    }
  } catch (error) {
    console.error('清空存储失败:', error)
  }
}

/**
 * 检查存储项是否存在
 * @param key 键
 * @param config 配置
 * @returns 是否存在
 */
export const hasStorage = (
  key: string,
  config?: StorageConfig
): boolean => {
  try {
    const { type = 'local', prefix } = { ...DEFAULT_CONFIG, ...config }
    const storage = getStorageInstance(type)
    const storageKey = generateStorageKey(key, prefix)
    return storage.getItem(storageKey) !== null
  } catch (error) {
    console.error('检查存储项失败:', error)
    return false
  }
}

/**
 * 获取所有存储键
 * @param config 配置
 * @returns 键列表
 */
export const getStorageKeys = (
  config?: StorageConfig
): string[] => {
  try {
    const { type = 'local', prefix } = { ...DEFAULT_CONFIG, ...config }
    const storage = getStorageInstance(type)
    const keys: string[] = []

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key) {
        if (!prefix || key.startsWith(prefix)) {
          // 移除前缀返回原始键
          const originalKey = prefix ? key.slice(prefix.length) : key
          keys.push(originalKey)
        }
      }
    }

    return keys
  } catch (error) {
    console.error('获取存储键失败:', error)
    return []
  }
}

/**
 * 获取存储大小（字节）
 * @param config 配置
 * @returns 存储大小
 */
export const getStorageSize = (
  config?: StorageConfig
): number => {
  try {
    const { type = 'local', prefix } = { ...DEFAULT_CONFIG, ...config }
    const storage = getStorageInstance(type)
    let totalSize = 0

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key && (!prefix || key.startsWith(prefix))) {
        const value = storage.getItem(key)
        totalSize += (key.length + (value?.length || 0)) * 2 // 每个字符2字节
      }
    }

    return totalSize
  } catch (error) {
    console.error('计算存储大小失败:', error)
    return 0
  }
}

/**
 * 批量设置存储
 * @param items 存储项数组
 * @param config 配置
 */
export const setStorageBatch = <T = any>(
  items: Array<{ key: string; value: T }>,
  config?: StorageConfig
): void => {
  items.forEach(item => {
    setStorage(item.key, item.value, config)
  })
}

/**
 * 批量获取存储
 * @param keys 键数组
 * @param config 配置
 * @returns 存储值映射
 */
export const getStorageBatch = <T = any>(
  keys: string[],
  config?: StorageConfig
): Record<string, T | null> => {
  const result: Record<string, T | null> = {}
  keys.forEach(key => {
    result[key] = getStorage(key, config)
  })
  return result
}

/**
 * 批量移除存储
 * @param keys 键数组
 * @param config 配置
 */
export const removeStorageBatch = (
  keys: string[],
  config?: StorageConfig
): void => {
  keys.forEach(key => {
    removeStorage(key, config)
  })
}

/**
 * 获取存储项信息（包含元数据）
 * @param key 键
 * @param config 配置
 * @returns 存储项信息
 */
export const getStorageInfo = <T = any>(
  key: string,
  config?: StorageConfig
): StorageItem<T> | null => {
  try {
    const { type = 'local', prefix } = { ...DEFAULT_CONFIG, ...config }
    const storage = getStorageInstance(type)
    const storageKey = generateStorageKey(key, prefix)
    const item = storage.getItem(storageKey)

    if (!item) return null

    return JSON.parse(item) as StorageItem<T>
  } catch (error) {
    console.error('获取存储项信息失败:', error)
    return null
  }
}

/**
 * 获取存储统计信息
 * @param config 配置
 * @returns 统计信息
 */
export const getStorageStats = (config?: StorageConfig) => {
  const { type = 'local', prefix } = { ...DEFAULT_CONFIG, ...config }
  const keys = getStorageKeys(config)
  const totalSize = getStorageSize(config)

  // 统计过期项目
  const expiredKeys: string[] = []
  keys.forEach(key => {
    const info = getStorageInfo(key, config)
    if (info && info.expire && info.expire < Date.now()) {
      expiredKeys.push(key)
    }
  })

  return {
    type,
    prefix,
    totalKeys: keys.length,
    expiredKeys: expiredKeys.length,
    totalSize,
    readableSize: formatFileSize(totalSize)
  }
}

/**
 * 清理过期存储项
 * @param config 配置
 * @returns 清理的数量
 */
export const cleanupExpiredStorage = (config?: StorageConfig): number => {
  const keys = getStorageKeys(config)
  let cleanedCount = 0

  keys.forEach(key => {
    const info = getStorageInfo(key, config)
    if (info && info.expire && info.expire < Date.now()) {
      removeStorage(key, config)
      cleanedCount++
    }
  })

  return cleanedCount
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数
 */
const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 存储管理器
 * 提供统一的存储操作接口
 */
class StorageManager {
  private config: StorageConfig

  constructor(config?: StorageConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  set<T = any>(key: string, value: T): void {
    setStorage(key, value, this.config)
  }

  get<T = any>(key: string): T | null {
    return getStorage(key, this.config)
  }

  remove(key: string): void {
    removeStorage(key, this.config)
  }

  has(key: string): boolean {
    return hasStorage(key, this.config)
  }

  keys(): string[] {
    return getStorageKeys(this.config)
  }

  clear(): void {
    clearStorage(this.config)
  }

  getStats() {
    return getStorageStats(this.config)
  }

  cleanup(): number {
    return cleanupExpiredStorage(this.config)
  }
}

// 导出快捷方法
export const storage = {
  set: setStorage,
  get: getStorage,
  remove: removeStorage,
  clear: clearStorage,
  has: hasStorage,
  keys: getStorageKeys,
  size: getStorageSize,
  info: getStorageInfo,
  stats: getStorageStats,
  cleanup: cleanupExpiredStorage,
  setBatch: setStorageBatch,
  getBatch: getStorageBatch,
  removeBatch: removeStorageBatch,

  // 创建存储管理器实例
  createManager: (config?: StorageConfig) => new StorageManager(config)
}

// 导出默认实例
export default storage