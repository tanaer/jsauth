/**
 * Tauri 应用示例
 * 
 * 在 Tauri 前端中使用 JSAuth
 */

import { requireAuth, JSAuth } from '@tanaer/jsauth';
import { createAuthUI } from '@tanaer/jsauth/ui';

// ============================================
// 方式1: 使用 requireAuth (最简单)
// ============================================
async function method1() {
  try {
    await requireAuth({
      title: '应用授权',
      subtitle: '请输入密码以启动应用'
    });
    
    // 验证成功，继续执行应用逻辑
    console.log('验证成功!');
    
  } catch (error) {
    // 验证失败
    console.error('验证失败');
  }
}

// ============================================
// 方式2: 使用 createAuthUI (更多控制)
// ============================================
function method2() {
  const authUI = createAuthUI({
    title: '欢迎',
    subtitle: '请输入密码',
    buttonText: '登录',
    onSuccess: (result) => {
      console.log('登录成功:', result);
      // 跳转到主界面
    },
    onError: (result) => {
      console.log('登录失败:', result.message);
    }
  });
  
  authUI.show();
}

// ============================================
// 方式3: 直接使用 JSAuth 类 (完全自定义UI)
// ============================================
async function method3() {
  const auth = new JSAuth({
    serverUrl: 'https://890214.net/auth.php',
    timeout: 10000
  });
  
  // 自定义获取密码的方式
  const password = prompt('请输入密码:');
  
  const result = await auth.verify(password);
  
  if (result.success) {
    console.log('验证成功');
  } else {
    console.log('验证失败:', result.message);
  }
}

// 选择一种方式使用
method1();
