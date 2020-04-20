
talefun-framework

## 介绍
##### talefun-framework基于thinkjs3.x创建,为便于团队协同请使用ts进行开发。此template由thinkjs-cli命令创建,并集成了相关代码以供参考。同时针对使用有进行了一些定制。使用中要注意model service等模块的调用方式与thinkjs原生API不同。

###
新开项目直接从本template中fork再改名即可。如果framework有更新也可以拉新。

## 使用方式

```
npm install
```

## Start server

```
npm start //默认启动local
pm2 /path to proj/pm2startup/development.json
```


## 关于model
thinkjs中的model跟数据库表一一对应,对某次请求涉及多个表的操作可以通过service进行封装后再由controller调用。
thinkjs官方示例中在controller中直接调用orm操作数据库，实际开发中因为涉及到缓存的创建和清理，建议所有db查询均在model内部封装好,对外提供统一的api供controller和service访问,model层也提供了getCache等缓存层API。model中不建议调用其它model。


## 关于service
```
const tokenService = think.service("token");
const userToken = this.header("token") || this.get("token") || this.post("token");
const verifyTokenResult = await tokenService.verifyToken(userToken);
```
## 关于logic
logic主要为controller提供参数的验证，think已经内置了一些标准的验证规则。可以参考https://thinkjs.org/zh-cn/doc/3.0/logic.html


## redis调用写法
##### thinkjs的redis操作封装在cache模块下。基本是简单的KV缓存层。这里又创建了一个redis对像，可以对redis直接操作。便于使用redis的其它数据类型。

### redis采用ioredis库,ioredis几乎支持所有的redis命令，也提供了集群连接入口。
#### 通过think.redis("rds1")；这样的方式获取连接对像。详细使用方法可以参考API文档或者访问https://github.com/luin/ioredis
```
const redisClient = await think.redis('redis1');
redisClient.hset('h1', "user1", "acdsd");
```
相关redis配置在src/common/config.ts中。


## 关于jwt(json web token)

jwt相关操作在common/service/tokenService中实现。提供了如下两个方法
```
/**
* @description 创建token
*/
createToken(userinfo: object) 

/**
* @description 验证票据
*/
verifyToken(token: string)
```
在BaseController中_before方法里有加入对json token的统一验证,并将解密的token信息通过ctx透传进controller的后续操作(在本次请求的生命周期中生效)。在controller的后续操作中可以通过
```
this.getToken("userId");
```
这样的方式访问在token中存放的数据。因为token会在每次请求时从客户端提交到服务端，为减少网络传输量，尽可能的在token中只存放userId等关键的会话信息，其它需要的会话数据通过 redis/memchche 等在需要的时候调用。

## 关于数据返回

由于业务需要，我们所有的输出基本都是json。所以基本不需要view层。对json的输出必须要controller中调用
thinkjs中返回数据的方式如下
失败
```
this.fail(errno, errmsg, data)
```
输出如下
```
{
  errno: 1000,
  errmsg: 'no permission',
  data: ''
}
```
成功
```
this.success(data, message)
```
输出如下
```
{
  errno: 0,
  errmsg: '',
  data: ...
}
```
这里成功也会输出一个空的errmsg字段，设计不太合理。所以增加了一个输出缓冲。在BaseController/BaseModel/BaseService中增加了如下方法。
```
/**
* 向输出容器附加内容
* @param key string
* @param value any
*/
appendOut(field: string, value: any) {
    if (!this.ctx.state.outBuffer) { this.ctx.state.outBuffer = {}; }
    this.ctx.state.outBuffer[field] = value;
}
在BaseController中增加了输出缓冲区内容的方法。
/**
* 输出缓冲并清空
* 用于替换success
*/
flush() {
    const pack = {
        errno: 0,
        data: this.ctx.state.outBuffer || {}
    };
    this.json(pack);
}
```
使用方法如下
```
this.appendOut('userInfo', userInfo);
this.appendOut('abc', "fuck");
this.appendOut('aaaa', "fuck3");
this.flush();
```
输出如下
```
{"errno":0,"data":{"userInfo":{"userId":1234},"abc":"fuck","aaaa":"fuck3"}}
```
#### flush()仅能在crontroller中调用。appendOut可以在BaseModel和BaseService的子类中调用。
需要注意的是 在原本thinkjs的设计理念中 contex(请求上下文)在service model是不能访问的。我们通过Base*基类将ctx传入了对应的service model(thinkjs中 service model实例均由请求创建)。但需要注意的是尽量减少在model service中调用ctx。

flush()调用后将输出缓冲，并清空。

##### 在一些复杂的逻辑情况下可以将不同逻辑模块拆分到不同的action中，每个action只负责自已的输出。最后逻辑完成后再flush(); 
示例如下
```
async userTestAction() {
    await this.userTestFunc1();
    await this.userTestFunc2();
    await this.userTestFunc3();
    this.flush();
}
async userTestFunc1() {
    // do something
    this.appendOut('test1', "fuck");
}
async userTestFunc2() {
    // do something
    this.appendOut('test2', "fuck");
}
async userTestFunc3() {
    // do something
    this.appendOut('test3', "fuck");
}
```
产生输出如下
```
{
    "errno": 0,
    "data": {
        "test1": "fuck",
        "test2": "fuck",
        "test3": "fuck"
    }
}
```

##### 对于缓存应遵循原则:针对同一缓存条目的创建,更新,销毁的方法必须存在于同一个类中，以便于后续管理。controller层不见议使用缓存。最好在service,model层封装后在controller调用。

## 对于think结构不足和思考和调整
##### 对于复杂业务逻辑，经过多次封装后在一次用户请求中对同一缓存的读取可能会有多次，例如 getUserInfoFromCache(),但是数据无变动时取回的是相同的数据。会造成很多无用的内网流量，也会提高响应的等待时间。所以需要在缓存层上再封装一层基于内存的高速缓存。同时为了防止内存缓存被长期持有，把该缓存放在了用户请求的context中。
##### 基于这样的原因，我们需要把context对像传入model和service中。以便于model和service能进行context的读取。同时为了不侵入thinkjs的底层，我们提供了BaseController BaseLogic BaseModel BaseService 四个类来提供相应的操作方法(没有重写thinkjs的API) 
首先：controller和service中提供了如下两个方法
```
 /**
* 取得service实例
*/
taleService(name: string, m: any = "common", ...args: any[])

/**
* 取得model实例
*/
taleModel(name: string, config: any = {}, module: string = "common")
```
所以controller和service中相应的调用方式变成了
```
const userService = this.taleService("user");
const userModel = this.taleModel("user");
```
通过这种方式实例化的service和model对像将持有当前的会话上下文。
基于ctx service 和 model中 提供了 appendOut 方法向输出中附加内容。
其次：
model中提供了如下三个方法
    async getCache(key: string) 
    async delCache(key: string) 
    async setCache(key: string, value: any, expire: number) 
其会调用adapter中设置的缓存源为默认缓存，同时在当前请求上下文ctx中提供了一个快速缓存(无IO开销)；

参考源码可以看到，我们在cache层之上封装了一层flashCache。目的是减少多次get同一个cache造成内网流量增加。flash缓存放置于ctx中。仅存在于用户请求期间。

-------------------------------------
## json-rpc 基于json-rpc2.0 的配置方案
-------------------------------------

### 配置方案和开发样例：
1.  config/router.ts的配置
    ```
    module.exports = [
        ['/jsonrpc', '/jsonrpc/jsonrpc']
    ];
    ```


2.  config/config.ts的配置
    ```
    jwt_exceptions: [// 需要将path放入jwt之外
        ....
        'jsonrpc|jsonrpc',
    ],
    ```

3.  controller/jsonrpc.js这里面写rpc远程方法的的逻辑需求；
    ```
    helloworld1(id, params){
        let result = "hello world1 "+JSON.stringify(params);
        this.success_jsonrpc(id, result);
    }

    helloworld2(id, params){
        let result =  "hello world2 "+JSON.stringify(params);
        this.fail_jsonrpc(id, 200, result);
    }
    ```



4.  客户端调用代码如下
#####注意，此实现于语言无关，跨平台调用，我在其他语言上测试，都能正确返回:
    ```
    var rpc = require('node-json-rpc');

    var options = {
    port: 8360,
    host: 'localhost',
    path: '/jsonrpc',
    strict: true
    };
    var client = new rpc.Client(options);
    client.call(
    {"jsonrpc": "2.0", "method": "helloworld1", "params": {"param1":"helloworld"}, "id": 1},
    function (err, res) {
        if (err) { console.log(err); }
        else { console.log(res); }
    }
    );
    ```

