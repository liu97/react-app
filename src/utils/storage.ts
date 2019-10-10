interface IObj {
    [key: string]: any
}

function getStorage(storageType: 'local' | 'session' = 'local') {
    if (storageType === 'local') {
      return window.localStorage
    } else if (storageType === 'session') {
      return window.sessionStorage
    }
    return undefined
  }
  
  export const saveToStorage = (obj: IObj, storageType: 'local' | 'session' = 'local') => {
    const storage = getStorage(storageType)
    if (storage) {
      Object.keys(obj).forEach(key => {
        storage.setItem(key, obj[key])
      })
    }
  }
  
  export const getFromStorage = (key: string, storageType: 'local' | 'session' = 'local') => {
    const storage = getStorage(storageType)
    let value
    if (storage) {
      try {
        value = storage.getItem(key)
      } catch (e) {
        console.error(e)
        value = undefined
      }
    }
    return value
  }
  
  export const removeFromStorage = (keys: string[], storageType: 'local' | 'session' = 'local') => {
    const storage = getStorage(storageType)
    if (storage && keys && keys.length > 0) {
      keys.forEach(key => storage.removeItem(key))
    }
  }
  