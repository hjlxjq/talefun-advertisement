
talefun-framework jwt

## 介绍
##### 项目采用json web token的方式来为集群提供会话验证。
## 用户中心
### 登陆
###### 需要
    account
    password
###### 返回
    sessionToken //用户会话授权token 30m/1h
    freshToken  用户会话刷新token 24h 
###### 说明
    sessionToken 用户每次请求传递到服务端 用于验证用户是否有权调用该接口 过期后统一返回1000
    freshToken 用户 sessionToken 过期后 底层用freshToken 申请新的 sessionToken 如果 freshToken 也过期了视为用户过期 需要重新登陆获取新的token
### 登出
    客户端清理本地的 sessionToken 和 freshToken

### 刷新
    用户 sessionToken 失效 但 freshToken 没有失效的时候通过调用此接口重新刷新 sessionToken (freshToken?);
###### 需要
    freshToken
    sessionToken
###### 返回
    freshToken
    sessionToken

## 逻辑后端(某游戏后端模块)
### 验证 
    framework的BaseController中的供了基础的sessionToken 验证. (返回如:1001)
    如果有对 sessionToken 的踢下线操作 可单独设置一个redis的key存放 已踢除设置一个时间直接禁止访问 (返回如:1003)
### 优点
    jwt的方式用户申请token之后 后端服务器只需校验 无需网络验证 会节省开销
    jwt比分布式session方案有更大的适配能力。session cookie等涉及到跨域问题,业务庞大后会非常麻烦。