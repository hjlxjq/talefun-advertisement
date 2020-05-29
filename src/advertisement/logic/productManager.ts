import { TaleCode, TokenExemptVO } from '../../common/tale/TaleDefine';
import AMLogic from './managerBaseLogic';

import ProductGroupModel from '../model/productGroup';
import ProductModel from '../model/product';

import AuthServer from '../service/authServer';

import * as _ from 'lodash';
import { think } from 'thinkjs';

export default class ProductManagerLogic extends AMLogic {

    /**
     * 权限认证，
     * <br/>应用权限
     */
    private async productAuth(productId: string) {
        const ucId: string = this.ctx.state.user.id || '';
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const productAuth = await authServer.fetchProductAuth(ucId, productId);
        // think.logger.debug(`productAuth: ${JSON.stringify(productAuth)}`);
        return productAuth;
    }

    /**
     * 权限认证，
     * <br/>项目组权限
     */
    private async productGroupAuth(productGroupId: string) {
        const ucId: string = this.ctx.state.user.id || '';
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const productGroupAuth = await authServer.fetchProductGroupAuth(ucId, productGroupId);
        think.logger.debug(`productGroupAuth: ${JSON.stringify(productGroupAuth)}`);
        return productGroupAuth;
    }

    /**
     * 权限认证,
     * <br/>用户权限
     */
    private async userAuth() {
        const ucId: string = this.ctx.state.user.id || '';
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const userAuth = await authServer.fetchUserAuth(ucId);
        think.logger.debug(`userAuth: ${JSON.stringify(userAuth)}`);
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
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const productId: string = this.post('id');

        // try {
        //     const productAuth = await this.productAuth(productId);
        //     if (think.isEmpty(productAuth)) {
        //         throw new Error('没有权限！！！');
        //     }

        // } catch (e) {
        //     return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        // }

    }

    /**
     * <br/>更新应用
     */
    public async updateProductAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            name: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            packageName: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            platform: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            pid: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            test: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
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
                trim: true,         // 字段需要 trim 处理
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
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>创建应用打包参数
     */
    // public async createPackParamConfAction() {
    //     this.allowMethods = 'post';    // 只允许 POST 请求类型

    //     const rules = {
    //         productId: {
    //             string: true,       // 字段类型为 String 类型
    //             trim: true,         // 字段需要 trim 处理
    //             required: true,     // 字段必填
    //             method: 'POST'       // 指定获取数据的方式
    //         },
    //         id: {
    //             string: true,       // 字段类型为 String 类型
    //             trim: true,         // 字段需要 trim 处理
    //             required: true,     // 字段必填
    //             method: 'POST'       // 指定获取数据的方式
    //         },
    //         value: {
    //             string: true,       // 字段类型为 String 类型
    //             trim: true,         // 字段需要 trim 处理
    //             required: true,     // 字段必填
    //             method: 'POST'       // 指定获取数据的方式
    //         }
    //     };
    //     const flag = this.validate(rules);

    //     if (!flag) {
    //         return this.fail(TaleCode.ValidData, this.validateMsg());
    //     }

    //     const productId: string = this.post('productId');

    //     try {
    //         const productAuth = await this.productAuth(productId);
    //         const { master, editProduct } = productAuth;

    //         if (master === 0 && editProduct === 0) {
    //             throw new Error('没有权限！！！');
    //         }
    //     } catch (e) {
    //         return this.fail(TaleCode.AuthFaild, '没有权限！！！');
    //     }

    // }

    /**
     * <br/>更新应用打包参数
     */
    public async updatePackParamConfAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            productId: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            id: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            value: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
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
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>删除应用打包参数
     */
    // public async deletePackParamConfAction() {
    //     this.allowMethods = 'post';    // 只允许 POST 请求类型

    //     const rules = {
    //         productId: {
    //             string: true,       // 字段类型为 String 类型
    //             trim: true,         // 字段需要 trim 处理
    //             required: true,     // 字段必填
    //             method: 'POST'       // 指定获取数据的方式
    //         },
    //         id: {
    //             string: true,       // 字段类型为 String 类型
    //             trim: true,         // 字段需要 trim 处理
    //             required: true,     // 字段必填
    //             method: 'POST'       // 指定获取数据的方式
    //         }
    //     };
    //     const flag = this.validate(rules);

    //     if (!flag) {
    //         return this.fail(TaleCode.ValidData, this.validateMsg());
    //     }

    //     const productId: string = this.post('productId');

    //     try {
    //         const productAuth = await this.productAuth(productId);
    //         const { master, editProduct } = productAuth;

    //         if (master === 0 && editProduct === 0) {
    //             throw new Error('没有权限！！！');
    //         }
    //     } catch (e) {
    //         return this.fail(TaleCode.AuthFaild, '没有权限！！！');
    //     }

    // }

    /**
     * <br/>获取应用广告平台参数列表
     */
    public async channelParamConfListAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            type: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
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
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>创建应用平台参数
     */
    // public async createChannelParamConfAction() {
    //     this.allowMethods = 'post';    // 只允许 POST 请求类型

    //     const rules = {
    //         productId: {
    //             string: true,       // 字段类型为 String 类型
    //             trim: true,         // 字段需要 trim 处理
    //             required: true,     // 字段必填
    //             method: 'POST'       // 指定获取数据的方式
    //         },
    //         id: {
    //             string: true,       // 字段类型为 String 类型
    //             trim: true,         // 字段需要 trim 处理
    //             required: true,     // 字段必填
    //             method: 'POST'       // 指定获取数据的方式
    //         },
    //         value1: {
    //             string: true,       // 字段类型为 String 类型
    //             trim: true,         // 字段需要 trim 处理
    //             method: 'POST'       // 指定获取数据的方式
    //         },
    //         value2: {
    //             string: true,       // 字段类型为 String 类型
    //             trim: true,         // 字段需要 trim 处理
    //             method: 'POST'       // 指定获取数据的方式
    //         },
    //         value3: {
    //             string: true,       // 字段类型为 String 类型
    //             trim: true,         // 字段需要 trim 处理
    //             method: 'POST'       // 指定获取数据的方式
    //         }
    //     };
    //     const flag = this.validate(rules);

    //     if (!flag) {
    //         return this.fail(TaleCode.ValidData, this.validateMsg());
    //     }

    //     const productId: string = this.post('productId');

    //     try {
    //         const productAuth = await this.productAuth(productId);
    //         const { master, editProduct } = productAuth;

    //         if (master === 0 && editProduct === 0) {
    //             throw new Error('没有权限！！！');
    //         }
    //     } catch (e) {
    //         return this.fail(TaleCode.AuthFaild, '没有权限！！！');
    //     }

    // }

    /**
     * <br/>更新应用平台参数
     */
    public async updateChannelParamConfAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            productId: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            id: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            value1: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            value2: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            value3: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
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
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>删除应用平台参数
     */
    // public async deleteChannelParamConfAction() {
    //     this.allowMethods = 'post';    // 只允许 POST 请求类型

    //     const rules = {
    //         productId: {
    //             string: true,       // 字段类型为 String 类型
    //             trim: true,         // 字段需要 trim 处理
    //             required: true,     // 字段必填
    //             method: 'POST'       // 指定获取数据的方式
    //         },
    //         id: {
    //             string: true,       // 字段类型为 String 类型
    //             trim: true,         // 字段需要 trim 处理
    //             required: true,     // 字段必填
    //             method: 'POST'       // 指定获取数据的方式
    //         }
    //     };
    //     const flag = this.validate(rules);

    //     if (!flag) {
    //         return this.fail(TaleCode.ValidData, this.validateMsg());
    //     }

    //     const productId: string = this.post('productId');

    //     try {
    //         const productAuth = await this.productAuth(productId);
    //         const { master, editProduct } = productAuth;

    //         if (master === 0 && editProduct === 0) {
    //             throw new Error('没有权限！！！');
    //         }
    //     } catch (e) {
    //         return this.fail(TaleCode.AuthFaild, '没有权限！！！');
    //     }

    // }

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
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        // const productGroupId: string = this.post('id');

        // try {
        //     const producrGroupAuth = await this.productGroupAuth(productGroupId);
        //     const { master } = producrGroupAuth;

        //     if (master === 0) {
        //         throw new Error('没有权限！！！');
        //     }
        // } catch (e) {
        //     return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        // }

    }

    /**
     * <br/>创建项目组
     */
    public async createProductGroupAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            name: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            action: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 1,     // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        try {
            const userAuth = await this.userAuth();
            const { master, createProductGroup } = userAuth;

            if (master === 0 && createProductGroup === 0) {
                throw new Error('没有权限！！！');
            }
        } catch (e) {
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
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            name: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            action: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
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
                trim: true,         // 字段需要 trim 处理
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
            packageName: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            platform: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            pid: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            test: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 1,     // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            action: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 1,     // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const productGroupId: string = this.post('id');
        // think.logger.debug(`productGroupId: ${productGroupId}`);

        try {
            const productGroupAuth = await this.productGroupAuth(productGroupId);
            // think.logger.debug(`productGroupAuth: ${JSON.stringify(productGroupAuth)}`);
            const { master, createProduct } = productGroupAuth;

            if (master === 0 && createProduct === 0) {
                throw new Error('没有权限！！！');
            }
        } catch (e) {
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
