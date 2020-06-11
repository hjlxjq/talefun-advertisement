import { TaleCode, TokenExemptVO } from '../../common/tale/TaleDefine';
import AMLogic from './managerBaseLogic';
import AuthServer from '../service/authServer';
import UserModel from '../model/user';

import * as crypto from 'crypto';
import * as _ from 'lodash';
import { think } from 'thinkjs';

export default class UserManagerLogic extends AMLogic {
    /**
     * 权限认证,
     * <br/>用户权限，判断用户是否为管理员
     */
    private async userAuth() {
        const ucId: string = this.ctx.state.user.id;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const userAuth = await authServer.fetchUserAuth(ucId);
        const { master } = userAuth;

        if (master === 0) {
            throw new Error('没有权限！！！');
        }

    }

    /**
     * 权限认证,
     * <br/>判断用户在项目组下是否有 authKey 权限
     */
    private async productGroupAuth(productGroupId: string, authKey: string) {
        const ucId: string = this.ctx.state.user.id;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const productGroupAuth = await authServer.fetchProductGroupAuth(ucId, productGroupId);
        const auth: number = productGroupAuth[authKey];

        if (!auth || auth === 0) {
            throw new Error('没有权限！！！');
        }

    }

    /**
     * 权限认证,
     * <br/>判断用户在应用下是否有 authKey 权限
     */
    private async productAuth(productId: string, authKey: string) {
        const ucId: string = this.ctx.state.user.id;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const productAuth = await authServer.fetchProductAuth(ucId, productId);
        const auth = productAuth[authKey];

        if (!auth || auth === 0) {
            throw new Error('没有权限！！！');
        }
    }

    /**
     * <br/>创建管理员--后台接口
     */
    public async createAdMinAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        try {
            await this.userAuth();

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

        const rules = {
            email: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                regexp: /^\w+@talefun.com$/,    // 字段值要匹配给出的正则
                default: 'admin@talefun.com',    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            name: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[\u4e00-\u9fa5]+$/,    // 字段值要匹配给出的正则
                length: { min: 2, max: 5 },    // 长度范围
                default: 'admin',    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            password: {
                string: true,       // 字段类型为 String 类型
                regexp: /^\w+$/,    // 字段值要匹配给出的正则
                length: { min: 6 },    // 长度不能小于 6
                default: 'talefun123',    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            userAuth: {
                object: true,
                children: {
                    int: true,       // 字段类型为 Number 类型
                    in: [0, 1],     // 0 为 false， 1 为 true
                    default: 0,    // 字段默认值
                },
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 1,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

    }

    /**
     * <br/>创建用户
     */
    public async createUserAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        try {
            await this.userAuth();

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

        const rules = {
            email: {
                string: true,       // 字段类型为 String 类型
                regexp: /^\w+@talefun.com$/,    // 字段值要匹配给出的正则
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            name: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[\u4e00-\u9fa5]+$/,    // 字段值要匹配给出的正则
                length: { min: 2, max: 5 },    // 长度范围
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            password: {
                string: true,       // 字段类型为 String 类型
                regexp: /^\w+$/,    // 字段值要匹配给出的正则
                length: { min: 6 },    // 长度不能小于 6
                default: '1234567890',    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            userAuth: {
                object: true,
                children: {
                    int: true,       // 字段类型为 Number 类型
                    in: [0, 1],     // 0 为 false， 1 为 true
                    default: 0,    // 字段默认值
                },
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 1,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const email: string = this.post('email');
        const userModel = this.taleModel('user', 'advertisement') as UserModel;

        // 判断 user 是否已经创建
        const user = await userModel.getByEmail(email);

        if (!think.isEmpty(user)) {
            return this.fail(TaleCode.ValidData, '用户已存在！！！');

        }

    }

    /**
     * <br/>修改用户密码
     */
    public async updateUserAction() {
        const ucId: string = this.ctx.state.userId;
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            password: {
                string: true,       // 字段类型为 String 类型
                regexp: /^\w+$/,    // 字段值要匹配给出的正则
                length: { min: 6 },    // 长度不能小于 6
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const id: string = this.post('id');
        // 只能修改自己的密码
        if (ucId !== id) {
            return this.fail(TaleCode.ValidData, '不能禁用自己！！！');

        }

    }

    /**
     * <br/>禁用或者解禁用户--只允许管理员操作
     */
    public async disableUserAction() {
        const ucId: string = this.ctx.state.userId;
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        try {
            await this.userAuth();

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const id: string = this.post('id');
        // 不能操作自己
        if (ucId === id) {
            return this.fail(TaleCode.ValidData, '不能禁用自己！！！');

        }

    }

    /**
     * <br/>重置密码--只允许管理员操作
     */
    public async resetPasswordAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        try {
            await this.userAuth();

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            password: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                default: '1234567890',    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const id: string = this.post('id');
        const userModel = this.taleModel('user', 'advertisement') as UserModel;

        // 判断 user 是否已经创建
        const user = await userModel.getUser(id);

        if (think.isEmpty(user)) {
            return this.fail(TaleCode.ValidData, '用户不存在！！！');

        }
        if (user.active !== 1) {
            return this.fail(TaleCode.ValidData, '该用户已被禁用！！！');

        }

    }

    /**
     * GET，
     * <br/>获取用户列表
     */
    public async userListAction() {
        this.allowMethods = 'get';    // 只允许 GET 请求类型

    }

    /**
     * <br/>获取用户权限
     */
    public async userAuthAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

    }

    /**
     * <br/>获取用户在项目组下权限
     */
    public async userAuthInProductGroupAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

    }

    /**
     * <br/>获取用户在应用下权限
     */
    public async userAuthInProductAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

    }

    /**
     * <br/>更新用户权限
     */
    public async updateUserAuthAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        try {
            await this.userAuth();

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            editComConf: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            },
            viewComConf: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            },
            createProductGroup: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            },
            master: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

    }

    /**
     * <br/>登陆,
     */
    public async loginAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            email: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                endWith: '@talefun.com',        // 以某些字符结束
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            password: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const email = this.post('email');
        let password = this.post('password');
        const userModel = this.taleModel('user', 'advertisement') as UserModel;

        const userVo = await userModel.getByEmail(email);

        if (think.isEmpty(userVo)) {
            return this.fail(10, '用户不存在！！！');

        }
        if (userVo.active !== 1) {
            return this.fail(10, '该用户已被禁用！！！');

        }
        const md5 = crypto.createHash('md5');
        password = md5.update(password).digest('hex');

        if (userVo.password !== password) {
            return this.fail(10, '密码错误！！！');

        }

    }

    /**
     * <br/>获取项目组下用户列表--管理员或者项目组管理员
     */
    public async userListInProductGroupAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

    }

    /**
     * <br/>获取应用下用户列表---管理员或者项目组管理员
     */
    public async userListInProductAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

    }

    /**
     * <br/>项目组创建成员---管理员或者项目组管理员
     */
    public async createUserToProductGroupAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型
        const productGroupId: string = this.post('id');

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            userId: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            editAd: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            viewAd: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            editGameConfig: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            viewGameConfig: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            editPurchase: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            viewPurchase: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            createProduct: {
                int: true,       // 字段类型为 Number 类型
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            editProduct: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            master: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        try {
            await this.productGroupAuth(productGroupId, 'master');
            
        } catch (e) {

            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>应用创建成员---管理员或者项目组管理员
     */
    public async createUserToProductAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型
        const productId: string = this.post('id');

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            userId: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            editAd: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            viewAd: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            editGameConfig: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            viewGameConfig: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            editPurchase: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            viewPurchase: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            editProduct: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            master: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        try {
            await this.productAuth(productId, 'master');

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');

        }

    }

    /**
     * <br/>更新应用成员权限---管理员或者项目组管理员
     */
    public async updateUserAuthInProductAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型
        const productId: string = this.post('id');

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            userId: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            editAd: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            },
            viewAd: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            },
            editGameConfig: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            },
            viewGameConfig: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            },
            editPurchase: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            },
            viewPurchase: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            },
            editProduct: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            },
            master: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        try {
            await this.productAuth(productId, 'master');

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');

        }

    }

    /**
     * <br/>更新项目组成员权限---管理员或者项目组管理员
     */
    public async updateUserAuthInProductGroupAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型
        const productGroupId: string = this.post('id');

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            userId: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            editAd: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            },
            viewAd: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            },
            editGameConfig: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            },
            viewGameConfig: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            },
            editPurchase: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            },
            viewPurchase: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            },
            createProduct: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            },
            editProduct: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            },
            master: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        try {
            await this.productGroupAuth(productGroupId, 'master');

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');

        }

    }

    /**
     * <br/>删除应用下成员---管理员或者项目组管理员
     */
    public async deleteUserFromProductAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型
        const productId: string = this.post('id');

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            userId: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        try {
            await this.productGroupAuth(productId, 'master');

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');

        }

    }

    /**
     * <br/>删除项目组下成员---管理员或者项目组管理员
     */
    public async deleteUserFromProductGroupAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型
        const productGroupId: string = this.post('id');

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            userId: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        try {
            await this.productGroupAuth(productGroupId, 'master');

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');

        }

    }

    /**
     * 取得访问豁免
     * 当前类的index方法不验证token
     */
    tokenExempts(): TokenExemptVO[] {
        const exes = super.tokenExempts();
        exes.push({ action: 'index' });
        exes.push({ action: 'createAdMin' });
        exes.push({ action: 'login' });
        return exes;

    }

}
