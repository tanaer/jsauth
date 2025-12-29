/**
 * JSAuth UI组件 - 提供开箱即用的密码验证界面
 */

import { JSAuth } from './index.js';

/**
 * 默认样式
 */
const defaultStyles = `
  .jsauth-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  }

  .jsauth-modal {
    background: #fff;
    border-radius: 12px;
    padding: 40px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    text-align: center;
  }

  .jsauth-title {
    margin: 0 0 10px 0;
    font-size: 24px;
    font-weight: 600;
    color: #333;
  }

  .jsauth-subtitle {
    margin: 0 0 30px 0;
    font-size: 14px;
    color: #666;
  }

  .jsauth-input-wrapper {
    position: relative;
    margin-bottom: 20px;
  }

  .jsauth-input {
    width: 100%;
    padding: 14px 45px 14px 16px;
    font-size: 16px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }

  .jsauth-input:focus {
    border-color: #4a90d9;
    box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.15);
  }

  .jsauth-input.error {
    border-color: #e74c3c;
    box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.15);
  }

  .jsauth-toggle-password {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
    color: #999;
    font-size: 18px;
  }

  .jsauth-toggle-password:hover {
    color: #666;
  }

  .jsauth-button {
    width: 100%;
    padding: 14px;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .jsauth-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .jsauth-button:active {
    transform: translateY(0);
  }

  .jsauth-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .jsauth-message {
    margin-top: 15px;
    padding: 10px;
    border-radius: 6px;
    font-size: 14px;
  }

  .jsauth-message.error {
    background: #fdf0f0;
    color: #e74c3c;
  }

  .jsauth-message.success {
    background: #f0fdf4;
    color: #22c55e;
  }

  .jsauth-spinner {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 2px solid #fff;
    border-top-color: transparent;
    border-radius: 50%;
    animation: jsauth-spin 0.8s linear infinite;
    vertical-align: middle;
    margin-right: 8px;
  }

  @keyframes jsauth-spin {
    to { transform: rotate(360deg); }
  }
`;

/**
 * 创建密码验证UI
 * @param {Object} options 配置选项
 * @param {string} options.title 标题
 * @param {string} options.subtitle 副标题
 * @param {string} options.buttonText 按钮文字
 * @param {string} options.placeholder 输入框占位符
 * @param {Function} options.onSuccess 验证成功回调
 * @param {Function} options.onError 验证失败回调
 * @param {Object} options.authOptions JSAuth配置选项
 * @returns {{show: Function, hide: Function, destroy: Function}}
 */
function createAuthUI(options = {}) {
  const config = {
    title: options.title || '密码验证',
    subtitle: options.subtitle || '请输入密码以继续使用',
    buttonText: options.buttonText || '验 证',
    placeholder: options.placeholder || '请输入密码',
    onSuccess: options.onSuccess || (() => {}),
    onError: options.onError || (() => {}),
    authOptions: options.authOptions || {}
  };

  const auth = new JSAuth(config.authOptions);
  let overlayElement = null;
  let styleElement = null;

  /**
   * 创建UI元素
   */
  function createElements() {
    // 添加样式
    styleElement = document.createElement('style');
    styleElement.textContent = defaultStyles;
    document.head.appendChild(styleElement);

    // 创建遮罩层
    overlayElement = document.createElement('div');
    overlayElement.className = 'jsauth-overlay';
    overlayElement.innerHTML = `
      <div class="jsauth-modal">
        <h2 class="jsauth-title">${config.title}</h2>
        <p class="jsauth-subtitle">${config.subtitle}</p>
        <div class="jsauth-input-wrapper">
          <input type="password" class="jsauth-input" placeholder="${config.placeholder}" autocomplete="current-password">
          <button type="button" class="jsauth-toggle-password" title="显示/隐藏密码">👁</button>
        </div>
        <button type="button" class="jsauth-button">${config.buttonText}</button>
        <div class="jsauth-message" style="display: none;"></div>
      </div>
    `;

    // 绑定事件
    const input = overlayElement.querySelector('.jsauth-input');
    const button = overlayElement.querySelector('.jsauth-button');
    const toggleBtn = overlayElement.querySelector('.jsauth-toggle-password');
    const message = overlayElement.querySelector('.jsauth-message');

    // 切换密码可见性
    toggleBtn.addEventListener('click', () => {
      if (input.type === 'password') {
        input.type = 'text';
        toggleBtn.textContent = '🙈';
      } else {
        input.type = 'password';
        toggleBtn.textContent = '👁';
      }
    });

    // 验证函数
    async function handleVerify() {
      const password = input.value.trim();
      
      if (!password) {
        showMessage('请输入密码', 'error');
        input.classList.add('error');
        return;
      }

      button.disabled = true;
      button.innerHTML = '<span class="jsauth-spinner"></span>验证中...';
      input.classList.remove('error');
      message.style.display = 'none';

      const result = await auth.verify(password);

      button.disabled = false;
      button.textContent = config.buttonText;

      if (result.success) {
        showMessage('验证成功！', 'success');
        setTimeout(() => {
          hide();
          config.onSuccess(result);
        }, 500);
      } else {
        showMessage(result.message, 'error');
        input.classList.add('error');
        config.onError(result);
      }
    }

    // 显示消息
    function showMessage(text, type) {
      message.textContent = text;
      message.className = `jsauth-message ${type}`;
      message.style.display = 'block';
    }

    // 点击按钮验证
    button.addEventListener('click', handleVerify);

    // 回车验证
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleVerify();
      }
    });

    // 阻止点击遮罩关闭
    overlayElement.addEventListener('click', (e) => {
      if (e.target === overlayElement) {
        e.preventDefault();
      }
    });
  }

  /**
   * 显示验证界面
   */
  function show() {
    if (!overlayElement) {
      createElements();
    }
    document.body.appendChild(overlayElement);
    
    // 自动聚焦输入框
    setTimeout(() => {
      const input = overlayElement.querySelector('.jsauth-input');
      if (input) {
        input.focus();
      }
    }, 100);
  }

  /**
   * 隐藏验证界面
   */
  function hide() {
    // 方式1: 通过引用移除
    if (overlayElement) {
      try {
        overlayElement.remove();
      } catch (e) {
        // fallback: 通过父节点移除
        if (overlayElement.parentNode) {
          overlayElement.parentNode.removeChild(overlayElement);
        }
      }
    }
    
    // 方式2: 通过选择器确保移除（防止引用丢失的情况）
    const existingOverlay = document.querySelector('.jsauth-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
  }

  /**
   * 销毁实例
   */
  function destroy() {
    // 先移除 overlay
    hide();
    
    // 移除样式
    if (styleElement) {
      try {
        styleElement.remove();
      } catch (e) {
        if (styleElement.parentNode) {
          styleElement.parentNode.removeChild(styleElement);
        }
      }
    }
    
    // 通过选择器确保样式也被移除
    const existingStyles = document.querySelectorAll('style');
    existingStyles.forEach(style => {
      if (style.textContent && style.textContent.includes('.jsauth-overlay')) {
        style.remove();
      }
    });
    
    // 清空引用
    overlayElement = null;
    styleElement = null;
  }

  return {
    show,
    hide,
    destroy,
    auth
  };
}

/**
 * 快速显示验证界面（一次性使用）
 * @param {Object} options 配置选项
 * @returns {Promise<{success: boolean, message: string}>}
 */
function showAuthDialog(options = {}) {
  return new Promise((resolve) => {
    const ui = createAuthUI({
      ...options,
      onSuccess: (result) => {
        ui.destroy();
        resolve(result);
      },
      onError: (result) => {
        // 继续显示，让用户重试
      }
    });
    ui.show();
  });
}

/**
 * 阻止应用启动，直到验证成功
 * @param {Object} options 配置选项
 * @returns {Promise<void>}
 */
async function requireAuth(options = {}) {
  const result = await showAuthDialog(options);
  if (!result.success) {
    throw new Error('验证失败');
  }
  return result;
}

export { createAuthUI, showAuthDialog, requireAuth };
export default createAuthUI;
