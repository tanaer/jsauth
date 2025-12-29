/**
 * JSAuth 单元测试
 */

// 使用 CommonJS 版本进行 Node.js 测试
const { JSAuth, verifyPassword } = require('../src/index.cjs');

// 测试计数器
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    passed++;
  } else {
    console.log(`✗ ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n========================================');
  console.log('       JSAuth 单元测试');
  console.log('========================================\n');

  // 测试1: 创建实例
  console.log('【测试组1: 实例化】\n');
  
  const auth = new JSAuth();
  assert(auth !== null, '能够创建 JSAuth 实例');
  assert(auth.serverUrl === 'https://890214.net/auth.php', '默认服务器URL正确');
  assert(auth.timeout === 10000, '默认超时时间正确');
  assert(auth.isAuthenticated() === false, '初始状态为未验证');
  assert(auth.getToken() === null, '初始token为null');

  // 测试2: 自定义配置
  console.log('\n【测试组2: 自定义配置】\n');
  
  const customAuth = new JSAuth({
    serverUrl: 'https://custom.example.com/auth',
    timeout: 5000,
    saveToken: true,
    storageKey: 'custom_key'
  });
  assert(customAuth.serverUrl === 'https://custom.example.com/auth', '自定义服务器URL正确');
  assert(customAuth.timeout === 5000, '自定义超时时间正确');
  assert(customAuth.saveToken === true, '自定义saveToken正确');
  assert(customAuth.storageKey === 'custom_key', '自定义storageKey正确');

  // 测试3: 空密码验证
  console.log('\n【测试组3: 输入验证】\n');
  
  const emptyResult = await auth.verify('');
  assert(emptyResult.success === false, '空密码验证应该失败');
  assert(emptyResult.message === '密码不能为空', '空密码错误消息正确');

  const nullResult = await auth.verify(null);
  assert(nullResult.success === false, 'null密码验证应该失败');

  const undefinedResult = await auth.verify(undefined);
  assert(undefinedResult.success === false, 'undefined密码验证应该失败');

  // 测试4: 网络请求（需要服务器支持）
  console.log('\n【测试组4: 网络请求测试】\n');
  
  const networkResult = await auth.verify('test_password');
  assert(typeof networkResult.success === 'boolean', '返回结果包含success字段');
  assert(typeof networkResult.message === 'string', '返回结果包含message字段');
  console.log(`  服务器响应: ${networkResult.message}`);

  // 测试5: 快捷函数
  console.log('\n【测试组5: 快捷函数】\n');
  
  const quickResult = await verifyPassword('', {});
  assert(quickResult.success === false, 'verifyPassword快捷函数可用');

  // 测试6: logout功能
  console.log('\n【测试组6: 登出功能】\n');
  
  auth._isAuthenticated = true;
  auth._token = 'test_token';
  auth.logout();
  assert(auth.isAuthenticated() === false, 'logout后isAuthenticated返回false');
  assert(auth.getToken() === null, 'logout后token为null');

  // 输出测试结果
  console.log('\n========================================');
  console.log(`测试完成: ${passed} 通过, ${failed} 失败`);
  console.log('========================================\n');

  // 退出码
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
