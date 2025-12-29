/**
 * JSAuth 配置选项
 */
export interface JSAuthOptions {
  /** 服务端验证URL，默认 https://890214.net/auth.php */
  serverUrl?: string;
  /** 请求超时时间(ms)，默认 10000 */
  timeout?: number;
  /** 是否保存验证token到本地存储 */
  saveToken?: boolean;
  /** 本地存储的key名称 */
  storageKey?: string;
}

/**
 * 验证结果
 */
export interface VerifyResult {
  /** 验证是否成功 */
  success: boolean;
  /** 返回消息 */
  message: string;
  /** 验证token（可选） */
  token?: string;
}

/**
 * JSAuth 密码验证类
 */
export declare class JSAuth {
  constructor(options?: JSAuthOptions);
  
  /** 验证密码 */
  verify(password: string): Promise<VerifyResult>;
  
  /** 检查是否已验证 */
  isAuthenticated(): boolean;
  
  /** 获取当前token */
  getToken(): string | null;
  
  /** 从本地存储恢复验证状态 */
  restoreFromStorage(): Promise<boolean>;
  
  /** 清除验证状态 */
  logout(): void;
}

/**
 * 快捷验证函数
 */
export declare function verifyPassword(password: string, options?: JSAuthOptions): Promise<VerifyResult>;

export default JSAuth;
