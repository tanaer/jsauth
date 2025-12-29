/**
 * Electron 应用示例
 * 
 * 在 Electron 渲染进程中使用 JSAuth
 */

// 方式1: 使用 ES Module
import { requireAuth } from '@tanaer/jsauth/ui';

// 方式2: 使用 CommonJS
// const { requireAuth } = require('@tanaer/jsauth/ui');

// 应用启动时进行密码验证
async function initApp() {
  try {
    // 显示验证界面，验证成功后继续
    const result = await requireAuth({
      title: '应用授权',
      subtitle: '请输入密码以启动应用',
      buttonText: '验 证'
    });

    console.log('验证成功:', result);
    
    // 在这里初始化你的应用...
    startMainApp();
    
  } catch (error) {
    console.error('验证失败，退出应用');
    // 在 Electron 中可以调用:
    // const { ipcRenderer } = require('electron');
    // ipcRenderer.send('quit-app');
  }
}

function startMainApp() {
  // 你的应用主逻辑
  document.body.innerHTML = `
    <div style="text-align: center; padding: 50px;">
      <h1>🎉 欢迎使用</h1>
      <p>您已通过密码验证</p>
    </div>
  `;
}

// 启动
initApp();
