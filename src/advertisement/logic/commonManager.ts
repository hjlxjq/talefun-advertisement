import { TaleCode, TokenExemptVO } from '../../common/tale/TaleDefine';
import AMLogic from './managerBaseLogic';
import AuthServer from '../service/authServer';

import * as _ from 'lodash';
import { think } from 'thinkjs';

export default class CommonManagerLogic extends AMLogic {

    /**
     * 权限认证，
     * <br/>常规配置权限
     */
    private async comAuth() {
        const ucId: string = this.ctx.state.user.id;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const userAuth = await authServer.fetchUserAuth(ucId);
        // think.logger.debug(`userAuth: ${JSON.stringify(userAuth)}`);
        return userAuth;
    }

    /**
     * GET，
     * <br/>获取广告类型列表
     */
    public async adTypeListAction() {
        this.allowMethods = 'get';    // 只允许 GET 请求类型

        try {
            const userAuth = await this.comAuth();
            const { master, viewComConf } = userAuth;

            if (master === 0 && viewComConf === 0) {
                throw new Error('没有权限！！！');
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }
    }

    /**
     * <br/>获取广告类型
     */
    public async adTypeAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        try {
            const userAuth = await this.comAuth();
            const { master, viewComConf } = userAuth;

            if (master === 0 && viewComConf === 0) {
                throw new Error('没有权限！！！');
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

        const rules = {
            name: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
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
     * <br/>创建广告类型
     */
    public async createAdTypeAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        try {
            const userAuth = await this.comAuth();
            const { master, editComConf } = userAuth;

            if (master === 0 && editComConf === 0) {
                throw new Error('没有权限！！！');
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

        const rules = {
            type: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            name: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            test: {
                int: true,       // 字段类型为 Number 类型
                default: 1,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
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
     * <br/>更新广告类型
     */
    public async updateAdTypeAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        try {
            const userAuth = await this.comAuth();
            const { master, editComConf } = userAuth;

            if (master === 0 && editComConf === 0) {
                throw new Error('没有权限！！！');
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            type: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            name: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            test: {
                int: true,       // 字段类型为 Number 类型
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
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
     * <br/>获取广告平台列表
     */
    public async adChannelListAction() {
        this.allowMethods = 'get';    // 只允许 GET 请求类型

        try {
            const userAuth = await this.comAuth();
            const { master, viewComConf } = userAuth;

            if (master === 0 && viewComConf === 0) {
                throw new Error('没有权限！！！');
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>获取广告平台
     */
    public async adChannelAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        try {
            const userAuth = await this.comAuth();
            const { master, viewComConf } = userAuth;

            if (master === 0 && viewComConf === 0) {
                throw new Error('没有权限！！！');
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

        const rules = {
            channel: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
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
     * <br/>创建广告平台
     */
    public async createAdChannelAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        try {
            const userAuth = await this.comAuth();
            const { master, editComConf } = userAuth;

            if (master === 0 && editComConf === 0) {
                throw new Error('没有权限！！！');
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

        const rules = {
            channel: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            key1: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            key2: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            key3: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            test: {
                int: true,       // 字段类型为 Number 类型
                default: 1,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
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
     * <br/>更新广告平台
     */
    public async updateAdChannelAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        try {
            const userAuth = await this.comAuth();
            const { master, editComConf } = userAuth;

            if (master === 0 && editComConf === 0) {
                throw new Error('没有权限！！！');
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            channel: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            key1: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            key2: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            key3: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            adTypeIdList: {
                array: true,
                children: {
                    string: true,       // 字段类型为 String 类型
                    cusTrimAll: true,      // 不能有空格
                },
                method: 'POST'       // 指定获取数据的方式
            },
            test: {
                int: true,       // 字段类型为 Number 类型
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
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
     * <br/>获取 native 模板列表
     */
    public async nativeTmplListAction() {
        this.allowMethods = 'get';    // 只允许 GET 请求类型

        try {
            const userAuth = await this.comAuth();
            const { master, viewComConf } = userAuth;

            if (master === 0 && viewComConf === 0) {
                throw new Error('没有权限！！！');
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }
    }

    /**
     * <br/>上传 native 模板预览图
     */
    // public async uploadPreviewAction() {
    //     this.allowMethods = 'post';    // 只允许 POST 请求类型

    //     try {
    //         const userAuth = await this.comAuth();
    //         const { master, editComConf } = userAuth;

    //         if (master === 0 && editComConf === 0) {
    //             throw new Error('没有权限！！！');
    //         }
    //     } catch (e) {
    //         think.logger.debug(e);
    //         return this.fail(TaleCode.AuthFaild, '没有权限！！！');
    //     }

    // }

    /**
     * <br/>创建 native 模板
     */
    public async createNativeTmplAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        try {
            const userAuth = await this.comAuth();
            const { master, editComConf } = userAuth;

            if (master === 0 && editComConf === 0) {
                throw new Error('没有权限！！！');
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

        const rules = {
            key: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            preview: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            test: {
                int: true,       // 字段类型为 Number 类型
                default: 1,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
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
     * <br/>更新 native 模板
     */
    public async updateNativeTmplAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        try {
            const userAuth = await this.comAuth();
            const { master, editComConf } = userAuth;

            if (master === 0 && editComConf === 0) {
                throw new Error('没有权限！！！');
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            key: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            preview: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            test: {
                int: true,       // 字段类型为 Number 类型
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
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
     * <br/>获取基础常量列表
     */
    public async baseConfigListAction() {
        this.allowMethods = 'get';    // 只允许 GET 请求类型

        try {
            const userAuth = await this.comAuth();
            const { master, viewComConf } = userAuth;

            if (master === 0 && viewComConf === 0) {
                throw new Error('没有权限！！！');
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>创建基础常量列表
     */
    public async createBaseConfigAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        try {
            const userAuth = await this.comAuth();
            const { master, editComConf } = userAuth;

            if (master === 0 && editComConf === 0) {
                throw new Error('没有权限！！！');
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

        const rules = {
            key: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            value: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            test: {
                int: true,       // 字段类型为 Number 类型
                default: 1,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
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
     * <br/>更新基础常量
     */
    public async updateBaseConfigAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        try {
            const userAuth = await this.comAuth();
            const { master, editComConf } = userAuth;

            if (master === 0 && editComConf === 0) {
                throw new Error('没有权限！！！');
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            key: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            value: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            test: {
                int: true,       // 字段类型为 Number 类型
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
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
     * <br/>获取打包参数列表
     */
    public async packParamListAction() {
        this.allowMethods = 'get';    // 只允许 GET 请求类型

        try {
            const userAuth = await this.comAuth();
            const { master, viewComConf } = userAuth;

            if (master === 0 && viewComConf === 0) {
                throw new Error('没有权限！！！');
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>创建打包参数
     */
    public async createPackParamAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        try {
            const userAuth = await this.comAuth();
            const { master, editComConf } = userAuth;

            if (master === 0 && editComConf === 0) {
                throw new Error('没有权限！！！');
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

        const rules = {
            key: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            test: {
                int: true,       // 字段类型为 Number 类型
                default: 1,    // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
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
     * <br/>更新打包参数
     */
    public async updatePackParamAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        try {
            const userAuth = await this.comAuth();
            const { master, editComConf } = userAuth;

            if (master === 0 && editComConf === 0) {
                throw new Error('没有权限！！！');
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            key: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            test: {
                int: true,       // 字段类型为 Number 类型
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

    }

    /**
     * 取得访问豁免,
     * <br/>当前类的index方法不验证token
     */
    tokenExempts(): TokenExemptVO[] {
        const exes = super.tokenExempts();

        exes.push({ action: 'index' });
        exes.push({ action: 'uploadPreview' });

        return exes;
    }

}
