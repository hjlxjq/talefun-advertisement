import { TaleCode, TokenExemptVO } from '../../common/tale/TaleDefine';
import AMLogic from './managerBaseLogic';
import AuthServer from '../service/authServer';

import * as _ from 'lodash';
import { think } from 'thinkjs';

export default class UserManagerLogic extends AMLogic {

    /**
     * 权限认证,
     * <br/>用户权限
     */
    private async userAuth() {
        const ucId: string = this.ctx.state.user.id || '';
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const userAuth = await authServer.fetchUserAuth(ucId);
        // think.logger.debug(`userAuth: ${JSON.stringify(userAuth)}`);
        const { master } = userAuth;

        if (master === 0) {
            throw new Error('没有权限！！！');
        }

    }

    /**
     * 权限认证,
     * <br/>用户在项目组下权限
     */
    private async productGroupAuth(productGroupId: string, authKey: string) {
        const ucId: string = this.ctx.state.user.id || '';
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const productGroupAuth = await authServer.fetchProductGroupAuth(ucId, productGroupId);
        // think.logger.debug(`productGroupAuth: ${JSON.stringify(productGroupAuth)}`);
        const auth: number = productGroupAuth[authKey];

        if (auth === 0) {
            throw new Error('没有权限！！！');
        }

    }

    /**
     * 权限认证,
     * <br/>用户在应用下权限
     */
    private async productAuth(productId: string, authKey: string) {
        const ucId: string = this.ctx.state.user.id || '';
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const productAuth = await authServer.fetchProductAuth(ucId, productId);
        // think.logger.debug(`productAuth: ${JSON.stringify(productAuth)}`);
        const auth = productAuth[authKey];

        if (auth === 0) {
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
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

        const rules = {
            email: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                default: 'admin@talefun.com',    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            name: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                default: 'admin',    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            password: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                default: 'talefun123',    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            userAuth: {
                object: true,
                children: {
                    int: true,       // 字段类型为 Number 类型
                    trim: true,         // 字段需要 trim 处理
                    default: 0,    // 字段默认值
                },
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
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
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

        const rules = {
            email: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            name: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            password: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                default: '1234567890',    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            userAuth: {
                object: true,
                children: {
                    int: true,       // 字段类型为 Number 类型
                    trim: true,         // 字段需要 trim 处理
                    default: 0,    // 字段默认值
                },
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
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
     * <br/>修改用户密码
     */
    public async updateUserAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
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

    }

    /**
     * <br/>禁用或者解禁用户--只允许管理员操作
     */
    public async disableUserAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        try {
            await this.userAuth();
        } catch (e) {
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
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
     * <br/>重置密码--只允许管理员操作
     */
    public async resetPasswordAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        try {
            await this.userAuth();
        } catch (e) {
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
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

    }

    /**
     * GET，
     * <br/>获取用户列表
     */
    public async userListAction() {
        this.allowMethods = 'get';    // 只允许 GET 请求类型

        // try {
        //     await this.userAuth();
        // } catch (e) {
        //     return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        // }

    }

    /**
     * <br/>获取用户权限
     */
    public async userAuthAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        try {
            await this.userAuth();
        } catch (e) {
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

        const rules = {
            id: {
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

    }

    /**
     * <br/>获取用户在项目组下权限
     */
    public async userAuthInProductGroupAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
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

    }

    /**
     * <br/>获取用户在应用下权限
     */
    public async userAuthInProductAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
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

    }

    /**
     * <br/>更新用户权限
     */
    public async updateUserAuthAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        try {
            await this.userAuth();
        } catch (e) {
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            editComConf: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            viewComConf: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            createProductGroup: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            master: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
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

    }

    /**
     * <br/>获取项目组下用户列表--管理员或者项目组管理员
     */
    public async userListInProductGroupAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型
        const productGroupId: string = this.post('id');

        const rules = {
            id: {
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

        // try {
        //     await this.productGroupAuth(productGroupId, 'master');
        // } catch (e) {
        //     return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        // }

    }

    /**
     * <br/>获取应用下用户列表---管理员或者项目组管理员
     */
    public async userListInProductAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型
        const productId: string = this.post('id');

        const rules = {
            id: {
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

        // try {
        //     await this.productAuth(productId, 'master');
        // } catch (e) {
        //     return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        // }

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
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            userId: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            editAd: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            viewAd: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            editGameConfig: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            viewGameConfig: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            editPurchase: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            viewPurchase: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            createProduct: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            editProduct: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            master: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
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
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            userId: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            editAd: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            viewAd: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            editGameConfig: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            viewGameConfig: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            editPurchase: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            viewPurchase: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            editProduct: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 0,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            master: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
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
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            userId: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            editAd: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            viewAd: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            editGameConfig: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            viewGameConfig: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            editPurchase: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            viewPurchase: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            editProduct: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            master: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
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
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            userId: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            editAd: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            viewAd: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            editGameConfig: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            viewGameConfig: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            editPurchase: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            viewPurchase: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            createProduct: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            editProduct: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            master: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
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
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            userId: {
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

        try {
            await this.productGroupAuth(productId, 'master');
        } catch (e) {
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
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            userId: {
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

        try {
            await this.productGroupAuth(productGroupId, 'master');
        } catch (e) {
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
