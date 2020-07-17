import { TaleCode, TokenExemptVO } from '../../common/tale/TaleDefine';
import AMLogic from './managerBaseLogic';
import AuthServer from '../service/authServer';

import * as _ from 'lodash';
import { think } from 'thinkjs';

import ConfigModel from '../model/config';

import { FileVO } from '../defines';

export default class CommonManagerLogic extends AMLogic {
    /**
     * 权限认证，
     * <br/>常规配置权限
     */
    private async comAuth() {
        const ucId: string = this.ctx.state.user.id;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const userAuth = await authServer.fetchUserAuth(ucId);
        return userAuth;

    }

    /**
     * GET，
     * <br/>获取广告类型列表
     */
    public async adTypeListAction() {
        this.allowMethods = 'get';    // 只允许 GET 请求类型

    }

    /**
     * <br/>根据广告类型显示名称获取广告类型
     */
    public async adTypeAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            name: {
                string: true,       // 字段类型为 String 类型
                cusTrimed: true,      // 前后不能有空格
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
                required: true,     // 字段必填
                regexp: /^[a-z_]+$/,    // 字段值要匹配给出的正则
                method: 'POST'       // 指定获取数据的方式
            },
            name: {
                string: true,       // 字段类型为 String 类型
                cusTrimed: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            test: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 1,    // 字段默认值
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
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            name: {
                string: true,       // 字段类型为 String 类型
                cusTrimed: true,      // 前后不能有空格
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

    }

    /**
     * GET，
     * <br/>获取广告平台列表
     */
    public async adChannelListAction() {
        this.allowMethods = 'get';    // 只允许 GET 请求类型

    }

    /**
     * <br/>获取广告平台
     */
    public async adChannelAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            channel: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z]+$/,    // 字段值要匹配给出的正则
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
                regexp: /^[a-z]+$/,    // 字段值要匹配给出的正则
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            key1: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[A-Za-z]+$/,    // 字段值要匹配给出的正则
                requiredWith: ['key2'],    // key2 存在，则 key1 必填
                method: 'POST'       // 指定获取数据的方式
            },
            key2: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[A-Za-z]+$/,    // 字段值要匹配给出的正则
                requiredWith: ['key3'],    // key3 存在，则 key2 必填
                method: 'POST'       // 指定获取数据的方式
            },
            key3: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[A-Za-z]+$/,    // 字段值要匹配给出的正则
                method: 'POST'       // 指定获取数据的方式
            },
            test: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 1,    // 字段默认值
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
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            key1: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[A-Za-z]+$/,    // 字段值要匹配给出的正则
                method: 'POST'       // 指定获取数据的方式
            },
            key2: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[A-Za-z]+$/,    // 字段值要匹配给出的正则
                method: 'POST'       // 指定获取数据的方式
            },
            key3: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[A-Za-z]+$/,    // 字段值要匹配给出的正则
                method: 'POST'       // 指定获取数据的方式
            },
            adTypeIdList: {
                array: true,
                children: {
                    string: true,       // 字段类型为 String 类型
                    regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                    length: 36,         // 长度为 36
                    required: true,     // 字段必填
                },
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

        const key1: string = this.post('key1');
        const key2: string = this.post('key2');
        const key3: string = this.post('key3');

        // 空字符串也默认删除
        if (key1 === '') {
            this.post('key1', null);

        }
        if (key2 === '') {
            this.post('key2', null);

        }
        if (key3 === '') {
            this.post('key3', null);

        }

    }

    /**
     * GET，
     * <br/>获取 native 模板列表
     */
    public async nativeTmplListAction() {
        this.allowMethods = 'get';    // 只允许 GET 请求类型

    }

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
                regexp: /^[0-9]+$/,    // 字段值要匹配给出的正则
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            file: {
                required: true,    // required 默认为false
                image: true,    // 上传的文件需要为图片
                method: 'file'    // 文件通过post提交，验证文件需要制定 method 为 `file`
            },
            test: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 1,    // 字段默认值
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

        // 上传的文件
        const file = this.file('file') as FileVO;

        if (!file || !file.type.startsWith('image')) {
            return this.fail(TaleCode.ValidData, '请上传图片');

        }
        // 图片要小于 10M
        if (file.size > 10485760) {
            return this.fail(TaleCode.ValidData, '图片大于 10M！！！');

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
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            file: {
                image: true,    // 上传的文件需要为图片
                method: 'file'    // 文件通过post提交，验证文件需要制定 method 为 `file`
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

        // 上传的文件
        const file = this.file('file') as FileVO;

        if (!file || !file.type.startsWith('image')) {
            return this.fail(TaleCode.ValidData, '请上传图片');

        }
        // 图片小于 10M
        if (file.size > 10485760) {
            return this.fail(TaleCode.ValidData, '图片大于 10M！！！');

        }

    }

    /**
     * GET，
     * <br/>获取基础常量列表
     */
    public async baseConfigListAction() {
        this.allowMethods = 'get';    // 只允许 GET 请求类型

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
                regexp: /^[A-Za-z][A-Za-z0-9]+$/,    // 字段值要匹配给出的正则
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            value: {
                string: true,       // 字段类型为 String 类型
                cusTrimed: true,      // 前后不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                cusTrimed: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            test: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 1,    // 字段默认值
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

        /**
         * <br/>判断 key 在游戏常量中是否存在，存在不可创建
         */
        const key: string = this.post('key');
        const configModel = this.taleModel('config', 'advertisement') as ConfigModel;

        const configVoList = await configModel.getListByKey(key, 1);

        if (!_.isEmpty(configVoList)) {
            return this.fail(TaleCode.ValidData, '游戏常量存在相同 key');

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
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            value: {
                string: true,       // 字段类型为 String 类型
                cusTrimed: true,      // 前后不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                cusTrimed: true,      // 前后不能有空格
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

    }

    /**
     * GET，
     * <br/>获取打包参数列表
     */
    public async packParamListAction() {
        this.allowMethods = 'get';    // 只允许 GET 请求类型

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
                regexp: /^[A-Za-z_]+$/,    // 字段值要匹配给出的正则
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                cusTrimed: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            test: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 1,    // 字段默认值
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

    }

    /**
     * 取得访问豁免,
     * <br/>当前类的index方法不验证token
     */
    tokenExempts(): TokenExemptVO[] {
        const exes = super.tokenExempts();
        exes.push({ action: 'index' });
        // exes.push({ action: 'createNativeTmpl' });

        return exes;

    }

}
