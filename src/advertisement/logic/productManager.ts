import { TaleCode, TokenExemptVO } from '../../common/tale/TaleDefine';
import AMLogic from './managerBaseLogic';
import AuthServer from '../service/authServer';

import * as _ from 'lodash';
import { think } from 'thinkjs';

export default class ProductManagerLogic extends AMLogic {
    /**
     * 权限认证，
     * <br/>应用权限
     */
    private async productAuth(productId: string) {
        const ucId: string = this.ctx.state.user.id;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const productAuth = await authServer.fetchProductAuth(ucId, productId);
        return productAuth;

    }

    /**
     * 权限认证，
     * <br/>项目组权限
     */
    private async productGroupAuth(productGroupId: string) {
        const ucId: string = this.ctx.state.user.id;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const productGroupAuth = await authServer.fetchProductGroupAuth(ucId, productGroupId);
        return productGroupAuth;

    }

    /**
     * 权限认证,
     * <br/>用户权限
     */
    private async userAuth() {
        const ucId: string = this.ctx.state.user.id;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const userAuth = await authServer.fetchUserAuth(ucId);
        return userAuth;

    }

    /**
     * GET，
     * <br/>获取全部应用列表
     */
    public async productListAction() {
        this.allowMethods = 'get';    // 只允许 GET 请求类型

    }

    /**
     * <br/>获取应用详情
     */
    public async productAction() {
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

        const productId: string = this.post('id');

        try {
            const productAuth = await this.productAuth(productId);
            if (think.isEmpty(productAuth)) {
                throw new Error('没有权限！！！');

            }

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');

        }

    }

    /**
     * <br/>更新应用
     */
    public async updateProductAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            pid: {
                string: true,       // 字段类型为 String 类型
                // cusTrimed: true,      // 前后不能有空格
                regexp: /^id[0-9]+$/,    // 字段值要匹配给出的正则
                method: 'POST'       // 指定获取数据的方式
            },
            test: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const productId: string = this.post('id');

        try {
            const productAuth = await this.productAuth(productId);
            const { master, editProduct } = productAuth;

            if (master === 0 && editProduct === 0) {
                throw new Error('没有权限！！！');

            }

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');

        }

    }

    /**
     * <br/>获取应用打包参数
     */
    public async packParamConfListAction() {
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

        const productId: string = this.post('id');

        try {
            const productAuth = await this.productAuth(productId);
            if (think.isEmpty(productAuth)) {
                throw new Error('没有权限！！！');

            }

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');

        }

    }

    /**
     * <br/>更新应用打包参数
     */
    public async updatePackParamConfAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            productId: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            value: {
                string: true,       // 字段类型为 String 类型
                cusTrimed: true,      // 前后不能有空格
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const productId: string = this.post('productId');

        try {
            const productAuth = await this.productAuth(productId);
            const { master, editProduct } = productAuth;

            if (master === 0 && editProduct === 0) {
                throw new Error('没有权限！！！');

            }

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');

        }

    }

    /**
     * <br/>获取应用广告平台参数列表
     */
    public async channelParamConfListAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            type: {
                string: true,       // 字段类型为 String 类型
                cusTrimed: true,      // 前后不能有空格
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const productId: string = this.post('id');

        try {
            const productAuth = await this.productAuth(productId);
            if (think.isEmpty(productAuth)) {
                throw new Error('没有权限！！！');

            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');

        }

    }

    /**
     * <br/>更新应用平台参数
     */
    public async updateChannelParamConfAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            productId: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            value1: {
                string: true,       // 字段类型为 String 类型
                cusTrimed: true,      // 前后不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            value2: {
                string: true,       // 字段类型为 String 类型
                cusTrimed: true,      // 前后不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            value3: {
                string: true,       // 字段类型为 String 类型
                cusTrimed: true,      // 前后不能有空格
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const productId: string = this.post('productId');

        try {
            const productAuth = await this.productAuth(productId);
            const { master, editProduct } = productAuth;

            if (master === 0 && editProduct === 0) {
                throw new Error('没有权限！！！');

            }

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');

        }

    }

    /**
     * GET，
     * <br/>获取项目组列表
     */
    public async productGroupListAction() {
        this.allowMethods = 'get';    // 只允许 GET 请求类型

    }

    /**
     * <br/>获取项目组详情
     */
    public async productGroupAction() {
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
        const productGroupId: string = this.post('id');

        try {
            const productGroupAuth = await this.productGroupAuth(productGroupId);

            if (_.isEmpty(productGroupAuth)) {
                throw new Error('没有权限！！！');

            }

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');

        }

    }

    /**
     * <br/>创建项目组
     */
    public async createProductGroupAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            name: {
                string: true,       // 字段类型为 String 类型
                cusTrimed: true,      // 前后不能有空格
                regexp: /^[a-z][a-z\s]*[a-z]$/,    // 字段值要匹配给出的正则
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                cusTrimed: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 1,     // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        try {
            const userAuthVo = await this.userAuth();
            const { master, createProductGroup } = userAuthVo;

            if (master === 0 && createProductGroup === 0) {
                throw new Error('没有权限！！！');

            }

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');

        }

    }

    /**
     * <br/>更新项目组
     */
    public async updateProductGroupAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                cusTrimed: true,      // 前后不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const productGroupId: string = this.post('id');

        try {
            const producrGroupAuth = await this.productGroupAuth(productGroupId);
            const { master } = producrGroupAuth;

            if (master === 0) {
                throw new Error('没有权限！！！');

            }

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');

        }

    }

    /**
     * <br/>获取项目组下应用列表
     */
    public async productListInProductGroupAction() {
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

        const productGroupId: string = this.post('id');

        try {
            const productGroupAuth = await this.productGroupAuth(productGroupId);

            if (think.isEmpty(productGroupAuth)) {
                throw new Error('没有权限！！！');

            }

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');

        }

    }

    /**
     * <br/>项目组下创建应用
     */
    public async createProductAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            name: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-zA-Z][a-zA-Z0-9\s\-_]*[a-zA-Z0-9\-_]+$/,    // 字段值要匹配给出的正则
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            packageName: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z][a-z0-9\.]+$/,    // 字段值要匹配给出的正则
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            platform: {
                string: true,       // 字段类型为 String 类型
                in: ['android', 'ios', 'weixin', 'instant'],    // 平台只包含四项
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            pid: {
                string: true,       // 字段类型为 String 类型
                // cusTrimed: true,      // 前后不能有空格
                regexp: /^id[0-9]+$/,    // 字段值要匹配给出的正则
                method: 'POST'       // 指定获取数据的方式
            },
            test: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 1,     // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 1,     // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const productGroupId: string = this.post('id');

        // 权限判断
        try {
            const productGroupAuth = await this.productGroupAuth(productGroupId);
            const { master, createProduct } = productGroupAuth;

            if (master === 0 && createProduct === 0) {
                throw new Error('没有权限！！！');

            }

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');

        }

    }

    /**
     * 取得访问豁免,
     * <br/>当前类的index方法不验证token
     */
    tokenExempts(): TokenExemptVO[] {
        const exes = super.tokenExempts();
        exes.push({ action: 'index' });
        return exes;

    }

}
