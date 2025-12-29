/**
 * JSAuth - 通用JS密码验证组件 (CommonJS版本)
 * 支持 Electron / Tauri 桌面应用
 */

class JSAuth {
  /**
   * 创建验证实例
   * @param {Object} options 配置选项
   * @param {string} options.serverUrl 服务端验证URL，默认 https://890214.net/auth.php
   * @param {number} options.timeout 请求超时时间(ms)，默认 10000
   * @param {boolean} options.saveToken 是否保存验证token到本地存储
   * @param {string} options.storageKey 本地存储的key名称
   */
  constructor(options = {}) {
    this.serverUrl = options.serverUrl || 'https://890214.net/auth.php';
    this.timeout = options.timeout || 10000;
    this.saveToken = options.saveToken || false;
    this.storageKey = options.storageKey || 'jsauth_token';
    this._isAuthenticated = false;
    this._token = null;
  }

  /**
   * 验证密码
   * @param {string} password 用户输入的密码
   * @returns {Promise<{success: boolean, message: string, token?: string}>}
   */
  async verify(password) {
    if (!password || typeof password !== 'string') {
      return {
        success: false,
        message: '密码不能为空'
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(this.serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          message: `服务器错误: ${response.status}`
        };
      }

      const result = await response.json();
      
      if (result.success) {
        this._isAuthenticated = true;
        this._token = result.token || null;
        
        // 保存token到本地存储
        if (this.saveToken && this._token) {
          this._saveToStorage(this._token);
        }
      }

      return {
        success: result.success === true,
        message: result.message || (result.success ? '验证成功' : '验证失败'),
        token: result.token
      };

    } catch (error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          message: '请求超时，请检查网络连接'
        };
      }
      return {
        success: false,
        message: `验证失败: ${error.message}`
      };
    }
  }

  /**
   * 检查是否已验证
   * @returns {boolean}
   */
  isAuthenticated() {
    return this._isAuthenticated;
  }

  /**
   * 获取当前token
   * @returns {string|null}
   */
  getToken() {
    return this._token;
  }

  /**
   * 从本地存储恢复验证状态
   * @returns {Promise<boolean>}
   */
  async restoreFromStorage() {
    const token = this._getFromStorage();
    if (!token) {
      return false;
    }

    // 向服务器验证token是否有效
    try {
      const response = await fetch(this.serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      if (result.success) {
        this._isAuthenticated = true;
        this._token = token;
        return true;
      }
    } catch (error) {
      console.error('恢复验证状态失败:', error);
    }

    return false;
  }

  /**
   * 清除验证状态
   */
  logout() {
    this._isAuthenticated = false;
    this._token = null;
    this._removeFromStorage();
  }

  /**
   * 保存到本地存储
   * @private
   */
  _saveToStorage(token) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, token);
      }
    } catch (e) {
      console.warn('无法保存到localStorage:', e);
    }
  }

  /**
   * 从本地存储获取
   * @private
   */
  _getFromStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(this.storageKey);
      }
    } catch (e) {
      console.warn('无法从localStorage读取:', e);
    }
    return null;
  }

  /**
   * 从本地存储移除
   * @private
   */
  _removeFromStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.storageKey);
      }
    } catch (e) {
      console.warn('无法从localStorage移除:', e);
    }
  }
}

/**
 * 创建一个简单的验证函数（快捷方式）
 * @param {string} password 密码
 * @param {Object} options 配置选项
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function verifyPassword(password, options = {}) {
  const auth = new JSAuth(options);
  return auth.verify(password);
}

// CommonJS 导出
module.exports = { JSAuth, verifyPassword };
module.exports.default = JSAuth;
