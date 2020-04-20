/**
 * JsonRPCController module.
 * @module common/tale/JsonRPCController
 * @see common/tale/JsonRPCController.ts;
 */
import { think } from 'thinkjs';
import BaseController from './BaseController';
import { IJsonRpcRequest, IJsonRpcSuccess, IJsonRpcFail, IJsonRpcError } from '../tale/TaleDefine';
/**
 * 用户操作相关控制器
 * @class JsonRPCController
 * @classdesc 提供JSONRPC的相关实现，其他需要jsonrpc的controller都需要继承JsonRPCController，子方法不必使用action结尾
 * @extends @link:./BaseController
 * @author yuanxiao <yuanxiao@talefun.com>
 */
export default class JsonRPCController extends BaseController {

    async __before() {
        // 将jsonrpc排除在jwt以外
        return true;
    }

    /**
     * jsonrrpc逻辑处理成功的方法
     * <br/>当jsonrpc处理完毕，成功返回的时候调用此方法
     * @argument {string} id jsonrpc的id;
     * @argument {object} result jsonrpc的成功返回结果;
     * @returns {object} jsonrpc的标准返回格式
     *
     */
    success_jsonrpc(id: any, result: object) {
        const msg: IJsonRpcSuccess = { jsonrpc: "2.0", result, id };
        this.body = msg;
    }

    /**
     * jsonrrpc逻辑处理失败的调用方法
     * <br/>当jsonrpc处理完毕，失败返回的时候调用此方法
     * @argument {string} id jsonrpc的id;
     * @argument {int} errcode 错误码
     * @argument {string} result jsonrpc的失败的原因;
     * @returns {object} jsonrpc的标准返回格式
     *
     */
    fail_jsonrpc(id: any, errcode: number, errmsg: string) {
        // const errorobj: JsonRpcError = { code: errcode, message: errmsg };
        const errormsg: IJsonRpcFail = { jsonrpc: "2.0", error: { code: errcode, message: errmsg }, id };
        this.body = errormsg;
    }

    /**
     * jsonrpc入口(异步)
     * <br/>jsonrpc相关方法都从这里进入
     * @argument {string} userName 用户名|post;
     * @argument {string} password 密码|post;
     * @returns {object} jsonrpc的标准返回格式
     *
     */
    async jsonrpcAction() {
        let data: IJsonRpcRequest;
        try {
            data = this.post() as IJsonRpcRequest;
            // throw new Error('exception');
        } catch (error) {
            this.fail_jsonrpc(-1, -32600, "ERROR JSONRPC REQUEST PARAMS");
            return;
        }
        const auth = this.header("authorization") as any;
        if (!think.isEmpty(auth)) {
            const authinfo = new Buffer(auth.split(" ")[1], 'base64').toString('utf8').split(':');
            const username = authinfo[0];
            const password = authinfo[1];
            // console.log(username, password);
            // todo auth
        }
        // {"jsonrpc": "2.0", "error": {"code": -32601, "message": "IS NOT JSONRPC2.0"}, "id": jp['id']};
        // {"jsonrpc": "2.0", "result": 19, "id": jp['id']};
        // let id:number;
        // id = data['id']
        // if(think.isNumber(id)){
        //     if(id % 1 !== 0){
        //         this.fail_jsonrpc(-1, -32603, "id is not number");
        //         return
        //     }
        // }else{
        //     this.fail_jsonrpc(-1, -32603, "id is not number");
        //     return
        // }
        const id: any = data.id;
        if (data.jsonrpc !== "2.0") {
            this.fail_jsonrpc(id, -32600, "IS NOT JSONRPC2.0");
        } else if (think.isEmpty(id)) {
            this.fail_jsonrpc(id, -32600, "ID IS NULL");
        } else {
            const method = data.method;
            const params = data.params;
            if (think.isEmpty(method)) {
                this.fail_jsonrpc(id, -32601, "METHOD IS NULL");
            } else if (think.isEmpty(params)) {
                this.fail_jsonrpc(id, -32602, "PARAMS IS NULL");
            } else {
                if (think.isEmpty(this[method])) {
                    this.fail_jsonrpc(id, -32603, "METHOD IS UNDEFINED");
                } else {
                    await this[method](id, params);
                }
            }
        }
    }

}

// //用法在项目的controller文件夹下面创建jsonrpcsub.ts，内容如下
// /**
//  * jsonrpc module.
//  * @module demo/controller/JsonRPCSubController
//  * @see demo/controller/jsonrpcsub.ts;
//  */
// import { think } from 'thinkjs';
// import JsonRPCController from '../../common/tale/JsonRPCController';
// /**
//  * jsonrpc的具体逻辑实现
//  * @class JsonRPCSubController
//  * @classdesc jsonrpc的具体逻辑实现，内部方法，后面不用加action
//  * @extends @link:common/tale/JsonRPCController
//  * @author yuanxiao <yuanxiao@talefun.com>
//  */
// export default class JsonRPCSubController extends JsonRPCController {

//     /**
//      * jsonrrpc逻辑处理成功的方法
//      * <br/>当jsonrpc处理完毕，成功返回的时候调用此方法,如果方法调用成功，在使用this.success_jsonpc进行返回反之则用this.fail_jsonrpc进行返回
//      * @argument {string} id jsonrpc的id;
//      * @argument {object} params jsonrpc的调用参数;
//      * @returns {object} jsonrpc的标准返回格式
//      *
//      */
//     helloworld1(id: any, params: object) {
//         // throw new Error("test async func if await method have a error");
//         const msg: string = "hello world1 " + JSON.stringify(params);
//         const result: { msg: string } = { msg };
//         this.success_jsonrpc(id, result);
//     }

//     helloworld2(id: any, params: object) {
//         const msg: string = "hello world2 " + JSON.stringify(params);
//         this.fail_jsonrpc(id, 200, msg);
//     }
// }