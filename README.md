# JSAuth

通用 JS 密码验证组件，专为 Electron / Tauri 桌面应用设计。

## 特性

- 🔐 简单的密码验证功能
- 🎨 开箱即用的验证UI界面
- 📦 支持 ES Module 和 CommonJS
- 🖥️ 专为 Electron / Tauri 桌面应用优化
- 🔒 支持本地 Token 存储
- ⚡ 零依赖，轻量级

## 安装

### npm 安装

```bash
npm install @tanaer/jsauth
```

### 直接引用

```html
<script type="module">
  import { JSAuth } from 'https://cdn.jsdelivr.net/npm/@tanaer/jsauth/src/index.js';
</script>
```

## 快速开始

### 方式1: 使用内置UI (推荐)

最简单的方式，自动显示密码输入界面，验证成功后继续执行：

```javascript
import { requireAuth } from '@tanaer/jsauth/ui';

// 应用启动时验证
async function init() {
  try {
    await requireAuth({
      title: '应用授权',
      subtitle: '请输入密码以启动应用'
    });
    
    // 验证成功，继续执行应用逻辑
    console.log('验证成功!');
    
  } catch (error) {
    console.error('验证失败');
  }
}

init();
```

### 方式2: 手动控制UI

```javascript
import { createAuthUI } from '@tanaer/jsauth/ui';

const authUI = createAuthUI({
  title: '欢迎',
  subtitle: '请输入密码',
  buttonText: '登录',
  onSuccess: (result) => {
    console.log('登录成功:', result);
  },
  onError: (result) => {
    console.log('登录失败:', result.message);
  }
});

// 显示验证界面
authUI.show();

// 隐藏验证界面
// authUI.hide();

// 销毁实例
// authUI.destroy();
```

### 方式3: 纯API调用 (自定义UI)

```javascript
import { JSAuth } from '@tanaer/jsauth';

const auth = new JSAuth({
  serverUrl: 'https://890214.net/auth.php'
});

// 验证密码
const result = await auth.verify('user_password');

if (result.success) {
  console.log('验证成功');
} else {
  console.log('验证失败:', result.message);
}
```

## API 文档

### JSAuth 类

#### 构造函数

```javascript
new JSAuth(options)
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| serverUrl | string | 'https://890214.net/auth.php' | 验证服务器URL |
| timeout | number | 10000 | 请求超时时间(ms) |
| saveToken | boolean | false | 是否保存token到localStorage |
| storageKey | string | 'jsauth_token' | localStorage的key名 |

#### 方法

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `verify(password)` | `Promise<VerifyResult>` | 验证密码 |
| `isAuthenticated()` | `boolean` | 检查是否已验证 |
| `getToken()` | `string \| null` | 获取当前token |
| `restoreFromStorage()` | `Promise<boolean>` | 从本地存储恢复验证状态 |
| `logout()` | `void` | 清除验证状态 |

#### VerifyResult 类型

```typescript
interface VerifyResult {
  success: boolean;  // 是否成功
  message: string;   // 返回消息
  token?: string;    // 验证token（可选）
}
```

### UI 组件

#### requireAuth(options)

显示验证界面并返回 Promise，验证成功后 resolve。

```javascript
import { requireAuth } from '@tanaer/jsauth/ui';

await requireAuth({
  title: '应用授权',
  subtitle: '请输入密码以启动应用',
  buttonText: '验 证'
});
```

#### createAuthUI(options)

创建可控的验证UI实例。

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | '密码验证' | 标题 |
| subtitle | string | '请输入密码以继续使用' | 副标题 |
| buttonText | string | '验 证' | 按钮文字 |
| placeholder | string | '请输入密码' | 输入框占位符 |
| onSuccess | function | - | 验证成功回调 |
| onError | function | - | 验证失败回调 |
| authOptions | object | {} | JSAuth配置选项 |

## Electron 集成

```javascript
// renderer.js
const { requireAuth } = require('@tanaer/jsauth/ui');

async function init() {
  try {
    await requireAuth({
      title: '应用授权',
      subtitle: '请输入密码以启动应用'
    });
    
    // 验证成功，初始化应用
    startApp();
    
  } catch (error) {
    // 验证失败，退出应用
    const { ipcRenderer } = require('electron');
    ipcRenderer.send('quit-app');
  }
}

init();
```

## Tauri 集成

```javascript
// main.js
import { requireAuth } from '@tanaer/jsauth/ui';

async function init() {
  try {
    await requireAuth({
      title: '应用授权',
      subtitle: '请输入密码以启动应用'
    });
    
    // 验证成功，初始化应用
    startApp();
    
  } catch (error) {
    // 验证失败，退出应用
    import { exit } from '@tauri-apps/api/process';
    exit(0);
  }
}

init();
```

## 服务端接口

你的服务端 `auth.php` 需要接收 POST 请求并返回 JSON：

### 请求

```json
{
  "password": "用户输入的密码"
}
```

### 响应

```json
{
  "success": true,
  "message": "验证成功",
  "token": "可选的验证token"
}
```

### 示例 PHP 实现

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$input = json_decode(file_get_contents('php://input'), true);
$password = $input['password'] ?? '';

// 验证密码（这里使用简单示例，实际应该使用更安全的方式）
$correctPassword = 'your_secret_password';

if ($password === $correctPassword) {
    echo json_encode([
        'success' => true,
        'message' => '验证成功',
        'token' => bin2hex(random_bytes(32))
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => '密码错误'
    ]);
}
```

## 许可证

MIT
