
/**
 * token 透传数据格式
 */
export interface TokenTradeVO {
    userId: string; /** 用户uuid */
    iat?: number; // 创建时间
    exp?: number; // 过期时间
}
/**
 * 用户表基本字段
 */
export interface UserVO {
    uid: string; // 用户ID
    account: string; // 帐号
    password?: string; // 密码 md5
    nikeName?: string; // 昵称
    lastTime?: number; // 最后更新时间
    addTime?: number; // 由号创建时间
}

/**
 * json web token 生成基本数据
 */
export interface JwtVO {
    sessionToken: string; // 访问令牌
    freshToken: string; // token刷新令牌
}

/**
 * token验证的结果
 * 失败（需重新登陆） 过期(需刷新续期) 通过
 */
export enum TokenVirifyStatus {
    OK = 0,
    Expired = 1,
    Faild = 2
}

/**
 * token验证结果字段
 */
export interface TokenVirifyVO {
    status: TokenVirifyStatus;
    tradeVO?: TokenTradeVO;
}

/**
 * 请求token豁免的条目
 * 豁免条目将不进行token检测
 */
export interface TokenExemptVO {
    controller?: string;
    action: string;
}

/**
 * 前端输出基本格式
 */
// export interface OutPackage {
//     errno: TaleCode;
//     errmsg?: string;
//     data: object;
// }

/**
 * 错误码
 * 对常用错误的统一表识
 */
export enum TaleCode {
    OK = 0, /** 无错误 */
    UserNotLogin = 1000, // 用户未登陆 fresh token验证不通过时派发
    SessionExpired = 1001, // session过期 需要刷新token
    ValidData = 1002, // 数据验证不通过
    DBFaild = 1003, // 数据库操作失败
    AuthFaild = 1004, // 权限操作失败
}

/**
 * jsonrpc的request参数
 */
export interface IJsonRpcRequest {
    jsonrpc: string;
    params: object;
    id: any;
    method: string;
}

/**
 * jsonrpc正确的返回结果
 */
export interface IJsonRpcSuccess {
    jsonrpc: string;
    result: object;
    id: any;
}

/**
 * jsonrpc错误码的定义
 */
export interface IJsonRpcError {
    code: number;    // 错误码
    message: string; // 错误的原因
}

/**
 * jsonrpc错误的返回结果
 */
export interface IJsonRpcFail {
    jsonrpc: string;
    error: IJsonRpcError;
    id: any;
}
// for test fork patch 104
