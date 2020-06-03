import { TaleCode, TokenExemptVO } from '../../common/tale/TaleDefine';
import AMLogic from './managerBaseLogic';

import AuthServer from '../service/authServer';

import VersionGroupModel from '../model/versionGroup';
import AbTestGroupModel from '../model/abTestGroup';
import AdGroupModel from '../model/adGroup';
import AdModel from '../model/ad';
import ConfigGroupModel from '../model/configGroup';
import ConfigModel from '../model/config';
import NativeTmplConfGroupModel from '../model/nativeTmplConfGroup';
import NativeTmplConfModel from '../model/nativeTmplConf';

import * as _ from 'lodash';
import { think } from 'thinkjs';

export default class DispatchManagerLogic extends AMLogic {

    /**
     * 权限认证，
     * <br/>应用权限
     */
    private async productAuth(productId: string) {
        const ucId: string = this.ctx.state.user.id;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const productAuth = await authServer.fetchProductAuth(ucId, productId);
        // think.logger.debug(`productAuth: ${JSON.stringify(productAuth)}`);
        return productAuth;
    }

    /**
     * <br/>获取版本分组控制列表信息
     */
    public async versionGroupListAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            type: {
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

        const productId: string = this.post('id');
        const type: number = this.post('type');

        try {
            const productAuth = await this.productAuth(productId);
            const {
                viewAd, viewGameConfig, viewPurchase, master
            } = productAuth;

            if (master === 0) {

                if (viewAd === 0 && type === 0) {
                    throw new Error('没有权限！！！');
                }
                if (viewGameConfig === 0 && type === 1) {
                    throw new Error('没有权限！！！');
                }
                if (viewPurchase === 0 && type === 2) {
                    throw new Error('没有权限！！！');
                }
            }

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>获取国家代码
     */
    public async nationListAction() {
        this.allowMethods = 'get';    // 只允许 GET 请求类型

    }

    /**
     * <br/>创建版本分组控制
     */
    public async createVersionGroupAction() {
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
            begin: {
                int: true,       // 字段类型为 Number 类型
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
            code: {
                array: true,
                children: {
                    string: true,       // 字段类型为 String 类型
                    trim: true,         // 字段需要 trim 处理
                },
                method: 'POST'       // 指定获取数据的方式
            },
            type: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            include: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 1,     // 字段默认值
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
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

        const productId: string = this.post('id');
        const type: number = this.post('type');

        try {
            const productAuth = await this.productAuth(productId);
            const {
                editAd, editGameConfig, editPurchase, master
            } = productAuth;

            if (master === 0) {

                if (editAd === 0 && type === 0) {
                    throw new Error('没有权限！！！');
                }
                if (editGameConfig === 0 && type === 1) {
                    throw new Error('没有权限！！！');
                }
                if (editPurchase === 0 && type === 2) {
                    throw new Error('没有权限！！！');
                }
            }

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>复制版本分组控制
     */
    public async copyVersionGroupAction() {
        const ucId: string = this.ctx.state.user.id;
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
            description: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
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

        const copyId: string = this.post('id');
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;

        try {
            // 被复制组的默认配置
            const { productId, type } = await versionGroupModel.getVersionGroup(copyId, ucId);
            const productAuth = await this.productAuth(productId);
            const {
                editAd, editGameConfig, editPurchase, master
            } = productAuth;

            if (master === 0) {

                if (editAd === 0 && type === 0) {
                    throw new Error('没有权限！！！');
                }
                if (editGameConfig === 0 && type === 1) {
                    throw new Error('没有权限！！！');
                }
                if (editPurchase === 0 && type === 2) {
                    throw new Error('没有权限！！！');
                }
            }

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>更新版本分组控制
     */
    public async updateVersionGroupAction() {
        const ucId: string = this.ctx.state.user.id;
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
            begin: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            codeList: {
                array: true,
                children: {
                    string: true,       // 字段类型为 String 类型
                    trim: true,         // 字段需要 trim 处理
                },
                method: 'POST'       // 指定获取数据的方式
            },
            include: {
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

        const versionGroupId: string = this.post('id');
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;

        try {
            const { productId, type } = await versionGroupModel.getVersionGroup(versionGroupId, ucId);
            const productAuth = await this.productAuth(productId);
            const {
                editAd, editGameConfig, editPurchase, master
            } = productAuth;

            if (master === 0) {

                if (editAd === 0 && type === 0) {
                    throw new Error('没有权限！！！');
                }
                if (editGameConfig === 0 && type === 1) {
                    throw new Error('没有权限！！！');
                }
                if (editPurchase === 0 && type === 2) {
                    throw new Error('没有权限！！！');
                }
            }

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>获取版本分组下 ab 分组列表
     */
    public async abTestGroupListAction() {
        const ucId: string = this.ctx.state.user.id;
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

        const versionGroupId: string = this.post('id');
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;

        try {
            const { productId, type } = await versionGroupModel.getVersionGroup(versionGroupId, ucId);
            const productAuth = await this.productAuth(productId);
            const {
                viewAd, viewGameConfig, viewPurchase, master
            } = productAuth;

            if (master === 0) {

                if (viewAd === 0 && type === 0) {
                    throw new Error('没有权限！！！');
                }
                if (viewGameConfig === 0 && type === 1) {
                    throw new Error('没有权限！！！');
                }
                if (viewPurchase === 0 && type === 2) {
                    throw new Error('没有权限！！！');
                }
            }

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>向版本分组下创建默认 ab 分组
     */
    public async createDefaultAbTestGroupAction() {
        const ucId: string = this.ctx.state.user.id;
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

        const versionGroupId: string = this.post('id');
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;

        try {
            const { productId, type } = await versionGroupModel.getVersionGroup(versionGroupId, ucId);
            const productAuth = await this.productAuth(productId);
            const {
                editAd, editGameConfig, editPurchase, master
            } = productAuth;

            if (master === 0) {

                if (editAd === 0 && type === 0) {
                    throw new Error('没有权限！！！');
                }
                if (editGameConfig === 0 && type === 1) {
                    throw new Error('没有权限！！！');
                }
                if (editPurchase === 0 && type === 2) {
                    throw new Error('没有权限！！！');
                }
            }

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>向版本分组下创建 ab 分组
     */
    public async createAbTestGroupAction() {
        const ucId: string = this.ctx.state.user.id;
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
            description: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            begin: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            end: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            groupNum: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const begin: number = this.post('begin');
        const end: number = this.post('end');
        const groupNum: number = this.post('groupNum');
        const versionGroupId: string = this.post('id');
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;

        // 最少分 2 组
        if (!groupNum || groupNum < 2) {
            return this.fail(TaleCode.ValidData, '分组失败，没有指定大于 1 的组数');
        }

        // 用户范围结束大于开始
        if (begin >= end) {
            return this.fail(TaleCode.ValidData, '分组失败，结束范围必须大于开始范围！！！');
        }

        // 分组要均分，整除
        if ((end - begin + 1) % groupNum !== 0) {
            return this.fail(TaleCode.ValidData, '分组失败，分组范围不能均分！！！');
        }

        const currentAbTestGroupVoList = await abTestGroupModel.getList(versionGroupId, undefined, 1);
        // 终止判断条件
        currentAbTestGroupVoList[currentAbTestGroupVoList.length] = {
            begin: 100, end: 100,
            name: undefined, description: undefined, creatorId: undefined, active: undefined, activeTime: undefined
        };

        let correct = false;
        for (let i = 0, l = currentAbTestGroupVoList.length; i < l; i++) {
            const currentAbTestGroupVo = currentAbTestGroupVoList[i];
            let lastAbTestGroupVo = { begin: 1, end: 1 };

            if (i > 0) {
                lastAbTestGroupVo = currentAbTestGroupVoList[i - 1];
            }
            // 范围正确，跳出循环
            if (end < currentAbTestGroupVo.begin && begin > lastAbTestGroupVo.end) {
                correct = true;
                break;
            }
        }

        if (!correct) {
            return this.fail(TaleCode.ValidData, '分组失败，范围重叠！！！');
        }

        try {
            const { productId, type } = await versionGroupModel.getVersionGroup(versionGroupId, ucId);
            const productAuth = await this.productAuth(productId);
            const {
                editAd, editGameConfig, editPurchase, master
            } = productAuth;

            if (master === 0) {

                if (editAd === 0 && type === 0) {
                    throw new Error('没有权限！！！');
                }
                if (editGameConfig === 0 && type === 1) {
                    throw new Error('没有权限！！！');
                }
                if (editPurchase === 0 && type === 2) {
                    throw new Error('没有权限！！！');
                }
            }

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>测试结束
     */
    public async deleteABTestGroupAction() {
        const ucId: string = this.ctx.state.user.id;
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
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const versionGroupId: string = this.post('id');
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;

        try {
            const { productId, type } = await versionGroupModel.getVersionGroup(versionGroupId, ucId);

            const productAuth = await this.productAuth(productId);
            const {
                editAd, editGameConfig, master
            } = productAuth;

            if (master === 0) {

                if (editAd === 0 && type === 0) {
                    throw new Error('没有权限！！！');
                }

                if (editGameConfig === 0 && type === 1) {
                    throw new Error('没有权限！！！');
                }
            }

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>向 ab 分组绑定常量组
     */
    public async bindConfigGroupAction() {
        const ucId: string = this.ctx.state.user.id;
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            configGroupId: {
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

        const abTestGroupId: string = this.post('id');
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;

        try {
            const { versionGroupId } = await abTestGroupModel.getVo(abTestGroupId, ucId);
            const { productId, type } = await versionGroupModel.getVersionGroup(versionGroupId, ucId);

            const productAuth = await this.productAuth(productId);
            const {
                editAd, editGameConfig, master
            } = productAuth;

            if (master === 0) {

                if (editAd === 0 && type === 0) {
                    throw new Error('没有权限！！！');
                }

                if (editGameConfig === 0 && type === 1) {
                    throw new Error('没有权限！！！');
                }
            }

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>获取常量组列表
     */
    public async configGroupListAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            type: {
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

        const productId: string = this.post('id');
        const type: number = this.post('type');

        try {
            const productAuth = await this.productAuth(productId);
            const {
                viewAd, viewGameConfig, master
            } = productAuth;

            if (master === 0) {

                if (viewAd === 0 && type === 0) {
                    throw new Error('没有权限！！！');
                }
                if (viewGameConfig === 0 && type === 1) {
                    throw new Error('没有权限！！！');
                }
            }

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>获取常量组下常量列表
     */
    public async configListAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型
        const ucId: string = this.ctx.state.user.id;

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

        const configGroupId: string = this.post('id');
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;

        try {
            const configGroupVo = await configGroupModel.getConfigGroup(configGroupId, ucId);
            const { type, productId } = configGroupVo;

            const productAuth = await this.productAuth(productId);
            const {
                viewAd, viewGameConfig, master
            } = productAuth;

            if (master === 0) {

                if (viewAd === 0 && type === 0) {
                    throw new Error('没有权限！！！');
                }

                if (viewGameConfig === 0 && type === 1) {
                    throw new Error('没有权限！！！');
                }
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }
    }

    /**
     * <br/>创建常量组
     */
    public async createConfigGroupAction() {
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
            dependentId: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            type: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 1,     // 默认字段
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const productId: string = this.post('id');
        const type: number = this.post('type');

        try {
            const productAuth = await this.productAuth(productId);
            const {
                editAd, editGameConfig, master
            } = productAuth;

            if (master === 0) {

                if (editAd === 0 && type === 0) {
                    throw new Error('没有权限！！！');
                }

                if (editGameConfig === 0 && type === 1) {
                    throw new Error('没有权限！！！');
                }
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }
    }

    /**
     * <br/>复制常量组
     */
    public async copyConfigGroupAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型
        const ucId: string = this.ctx.state.user.id;

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
            id: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 1,     // 默认字段
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const configGroupId: string = this.post('id');
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;

        try {
            const configGroupVo = await configGroupModel.getConfigGroup(configGroupId, ucId);
            const { type, productId } = configGroupVo;

            const productAuth = await this.productAuth(productId);
            const {
                editAd, editGameConfig, master
            } = productAuth;

            if (master === 0) {

                if (editAd === 0 && type === 0) {
                    throw new Error('没有权限！！！');
                }

                if (editGameConfig === 0 && type === 1) {
                    throw new Error('没有权限！！！');
                }
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>更新常量组
     */
    public async updateConfigGroupAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型
        const ucId: string = this.ctx.state.user.id;

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
            dependentId: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
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

        const configGroupId: string = this.post('id');
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;

        try {
            const configGroupVo = await configGroupModel.getConfigGroup(configGroupId, ucId);
            const { type, productId } = configGroupVo;

            const productAuth = await this.productAuth(productId);
            const {
                editAd, editGameConfig, master
            } = productAuth;

            if (master === 0) {

                if (editAd === 0 && type === 0) {
                    throw new Error('没有权限！！！');
                }

                if (editGameConfig === 0 && type === 1) {
                    throw new Error('没有权限！！！');
                }
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>更新广告常量
     */
    public async updateAdConfigAction() {
        const ucId: string = this.ctx.state.user.id;
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            key: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            value: {
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
            active: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 1,     // 默认字段
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const configGroupId: string = this.post('id');
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;

        try {
            const configGroupVo = await configGroupModel.getConfigGroup(configGroupId, ucId);
            // think.logger.debug(`configGroupId: ${configGroupId}`);
            // think.logger.debug(`ucId: ${ucId}`);
            // think.logger.debug(`configGroupVo: ${JSON.stringify(configGroupVo)}`);
            const { type, productId } = configGroupVo;

            const productAuth = await this.productAuth(productId);
            const {
                editAd, master
            } = productAuth;

            if (master === 0) {

                if (type === 1) {
                    throw new Error('没有权限！！！');
                }

                if (editAd === 0 && type === 0) {
                    throw new Error('没有权限！！！');
                }

            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>创建常量
     */
    public async createConfigAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型
        const ucId: string = this.ctx.state.user.id;

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            key: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            value: {
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
            active: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 1,     // 默认字段
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const configGroupId: string = this.post('id');
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;

        try {
            const configGroupVo = await configGroupModel.getConfigGroup(configGroupId, ucId);
            const { type, productId } = configGroupVo;

            const productAuth = await this.productAuth(productId);
            const {
                editGameConfig, master
            } = productAuth;

            if (master === 0) {

                if (type === 0) {
                    throw new Error('没有权限！！！');
                }

                if (editGameConfig === 0 && type === 1) {
                    throw new Error('没有权限！！！');
                }
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>更新游戏常量
     */
    public async updateConfigAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型
        const ucId: string = this.ctx.state.user.id;

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            key: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            value: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
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

        const configId: string = this.post('id');
        const configModel = this.taleModel('config', 'advertisement') as ConfigModel;
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;

        try {
            const { configGroupId } = await configModel.getConfig(configId);
            const configGroupVo = await configGroupModel.getConfigGroup(configGroupId, ucId);
            const { type, productId } = configGroupVo;

            const productAuth = await this.productAuth(productId);
            const {
                editGameConfig, master
            } = productAuth;

            if (master === 0) {

                if (type === 0) {
                    throw new Error('没有权限！！！');
                }

                if (editGameConfig === 0 && type === 1) {
                    throw new Error('没有权限！！！');
                }
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>删除常量
     */
    // public async deleteConfigAction() {
    //     this.allowMethods = 'post';    // 只允许 POST 请求类型
    //     const ucId: string = this.ctx.state.user.id;

    //     const rules = {
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

    //     const configId: string = this.post('id');
    //     const configModel = this.taleModel('config', 'advertisement') as ConfigModel;
    //     const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;

    //     try {
    //         const { configGroupId } = await configModel.getConfig(configId);
    //         const configGroupVo = await configGroupModel.getConfigGroup(configGroupId, ucId);
    //         const { type, productId } = configGroupVo;

    //         const productAuth = await this.productAuth(productId);
    //         const {
    //             editGameConfig, master
    //         } = productAuth;

    //         if (master === 0) {

    //             if (type === 0) {
    //                 throw new Error('没有权限！！！');
    //             }

    //             if (editGameConfig === 0 && type === 1) {
    //                 throw new Error('没有权限！！！');
    //             }
    //         }
    //     } catch (e) {
    //         think.logger.debug(e);
    //         return this.fail(TaleCode.AuthFaild, '没有权限！！！');
    //     }

    // }

    /**
     * <br/>向 ab 分组绑定 native 组
     */
    public async bindNativeTmplConfGroupAction() {
        const ucId: string = this.ctx.state.user.id;
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            nativeTmplConfGroupId: {
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

        const abTestGroupId: string = this.post('id');
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;

        try {
            const { versionGroupId } = await abTestGroupModel.getVo(abTestGroupId, ucId);
            const { productId, type } = await versionGroupModel.getVersionGroup(versionGroupId, ucId);
            const productAuth = await this.productAuth(productId);

            const {
                editAd, master
            } = productAuth;

            if (master === 0) {

                if (editAd === 0 && type === 0) {
                    throw new Error('没有权限！！！');
                }

            }

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>获取应用 native 模板组列表
     */
    public async nativeTmplConfGroupListAction() {
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
            const {
                viewAd, master
            } = productAuth;

            if (master === 0) {

                if (viewAd === 0) {
                    throw new Error('没有权限！！！');
                }
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>获取应用 native 模板组下模板列表
     */
    public async nativeTmplConfListAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型
        const ucId: string = this.ctx.state.user.id;

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

        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;
        const nativeTmplConfGroupId: string = this.post('id');

        think.logger.debug(`nativeTmplConfGroupId: ${nativeTmplConfGroupId}`);

        try {
            const nativeTmplConfGroupVo =
                await nativeTmplConfGroupModel.getNativeTmplConfGroup(nativeTmplConfGroupId, ucId);

            think.logger.debug(`nativeTmplConfGroupVo: ${JSON.stringify(nativeTmplConfGroupVo)}`);
            const { productId } = nativeTmplConfGroupVo;
            think.logger.debug(`productId: ${productId}`);

            const productAuth = await this.productAuth(productId);

            think.logger.debug(`productAuth: ${JSON.stringify(productAuth)}`);
            const {
                viewAd, master
            } = productAuth;

            if (master === 0 && viewAd === 0) {
                throw new Error('没有权限！！！');
            }

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>创建应用 native 模板配置组
     */
    public async createNativeTmplConfGroupAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
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
            name: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 1,     // 默认字段
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
            const {
                editAd, master
            } = productAuth;

            if (master === 0) {

                if (editAd === 0) {
                    throw new Error('没有权限！！！');
                }
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>复制应用 native 模板配置组
     */
    public async copyNativeTmplConfGroupAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型
        const ucId: string = this.ctx.state.user.id;

        const rules = {
            id: {
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
            name: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 1,     // 默认字段
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;
        const nativeTmplConfGroupId: string = this.post('id');

        try {
            const nativeTmplConfGroupVo =
                await nativeTmplConfGroupModel.getNativeTmplConfGroup(nativeTmplConfGroupId, ucId);
            const { productId } = nativeTmplConfGroupVo;
            const productAuth = await this.productAuth(productId);
            const {
                editAd, master
            } = productAuth;

            if (master === 0) {

                if (editAd === 0) {
                    throw new Error('没有权限！！！');
                }
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>更新应用 native 模板组
     */
    public async updateNativeTmplConfGroupAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型
        const ucId: string = this.ctx.state.user.id;

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            name: {
                string: true,       // 字段类型为 String 类型
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

        const nativeTmplConfGroupId: string = this.post('id');
        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;

        try {
            const nativeTmplConfGroupVo =
                await nativeTmplConfGroupModel.getNativeTmplConfGroup(nativeTmplConfGroupId, ucId);
            const { productId } = nativeTmplConfGroupVo;

            const productAuth = await this.productAuth(productId);
            const {
                editAd, master
            } = productAuth;

            if (master === 0) {

                if (editAd === 0) {
                    throw new Error('没有权限！！！');
                }
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>创建应用 native 模板配置
     */
    public async createNativeTmplConfAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型
        const ucId: string = this.ctx.state.user.id;

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            nativeTmplId: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            weight: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            clickArea: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            isFull: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 1,     // 默认字段
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const nativeTmplConfGroupId: string = this.post('id');
        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;

        try {
            const nativeTmplConfGroupVo =
                await nativeTmplConfGroupModel.getNativeTmplConfGroup(nativeTmplConfGroupId, ucId);
            const { productId } = nativeTmplConfGroupVo;

            const productAuth = await this.productAuth(productId);
            const {
                editAd, master
            } = productAuth;

            if (master === 0) {

                if (editAd === 0) {
                    throw new Error('没有权限！！！');
                }
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>更新应用 native 模板
     */
    public async updateNativeTmplConfAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型
        const ucId: string = this.ctx.state.user.id;

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            weight: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            clickArea: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            isFull: {
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

        const nativeTmplConfId: string = this.post('id');
        const nativeTmplConfModel = this.taleModel('nativeTmplConf', 'advertisement') as NativeTmplConfModel;
        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;

        try {
            const { nativeTmplConfGroupId } = await nativeTmplConfModel.getNativeTmplConf(nativeTmplConfId);
            const nativeTmplConfGroupVo =
                await nativeTmplConfGroupModel.getNativeTmplConfGroup(nativeTmplConfGroupId, ucId);
            const { productId } = nativeTmplConfGroupVo;

            const productAuth = await this.productAuth(productId);
            const {
                editAd, master
            } = productAuth;

            if (master === 0) {

                if (editAd === 0) {
                    throw new Error('没有权限！！！');
                }
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>删除应用 native 模板
     */
    // public async deleteNativeTmplConfAction() {
    //     this.allowMethods = 'post';    // 只允许 POST 请求类型
    //     const ucId: string = this.ctx.state.user.id;

    //     const rules = {
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

    //     const nativeTmplConfId: string = this.post('id');
    //     const nativeTmplConfModel = this.taleModel('nativeTmplConf', 'advertisement') as NativeTmplConfModel;
    //     const nativeTmplConfGroupModel =
    //         this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;

    //     try {
    //         const { nativeTmplConfGroupId } = await nativeTmplConfModel.getNativeTmplConf(nativeTmplConfId);
    //         const nativeTmplConfGroupVo =
    //             await nativeTmplConfGroupModel.getNativeTmplConfGroup(nativeTmplConfGroupId, ucId);
    //         const { productId } = nativeTmplConfGroupVo;

    //         const productAuth = await this.productAuth(productId);
    //         const {
    //             editAd, master
    //         } = productAuth;

    //         if (master === 0) {

    //             if (editAd === 0) {
    //                 throw new Error('没有权限！！！');
    //             }
    //         }
    //     } catch (e) {
    //         think.logger.debug(e);
    //         return this.fail(TaleCode.AuthFaild, '没有权限！！！');
    //     }

    // }

    /**
     * <br/>向 ab 分组绑定广告组
     */
    public async bindAdGroupAction() {
        const ucId: string = this.ctx.state.user.id;
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            adGroupId: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            place: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 1,     // 默认字段
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const abTestGroupId: string = this.post('id');
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;

        try {
            const { versionGroupId } = await abTestGroupModel.getVo(abTestGroupId, ucId);
            const { productId, type } = await versionGroupModel.getVersionGroup(versionGroupId, ucId);
            const productAuth = await this.productAuth(productId);

            const {
                editAd, master
            } = productAuth;

            if (master === 0) {

                if (editAd === 0 && type === 0) {
                    throw new Error('没有权限！！！');
                }

            }

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>删除 ab 分组下广告位
     */
    // public async unbindAdGroupAction() {
    //     const ucId: string = this.ctx.state.user.id;
    //     this.allowMethods = 'post';    // 只允许 POST 请求类型

    //     const rules = {
    //         id: {
    //             string: true,       // 字段类型为 String 类型
    //             trim: true,         // 字段需要 trim 处理
    //             required: true,     // 字段必填
    //             method: 'POST'       // 指定获取数据的方式
    //         },
    //         place: {
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

    //     const abTestGroupId: string = this.post('id');
    //     const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
    //     const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;

    //     try {
    //         const { versionGroupId } = await abTestGroupModel.getVo(abTestGroupId, ucId);
    //         const { productId, type } = await versionGroupModel.getVersionGroup(versionGroupId, ucId);
    //         const productAuth = await this.productAuth(productId);

    //         const {
    //             editAd, master
    //         } = productAuth;

    //         if (master === 0) {

    //             if (editAd === 0 && type === 0) {
    //                 throw new Error('没有权限！！！');
    //             }

    //         }

    //     } catch (e) {
    //         think.logger.debug(e);
    //         return this.fail(TaleCode.AuthFaild, '没有权限！！！');
    //     }

    // }

    /**
     * <br/>全量 ab 分组下广告位到默认组
     */
    public async completePlaceAction() {
        const ucId: string = this.ctx.state.user.id;
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            place: {
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

        const abTestGroupId: string = this.post('id');
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;

        try {
            const { versionGroupId } = await abTestGroupModel.getVo(abTestGroupId, ucId);
            const { productId, type } = await versionGroupModel.getVersionGroup(versionGroupId, ucId);
            const productAuth = await this.productAuth(productId);

            const {
                editAd, master
            } = productAuth;

            if (master === 0) {

                if (editAd === 0 && type === 0) {
                    throw new Error('没有权限！！！');
                }

            }

        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>获取广告组列表
     */
    public async adGroupListAction() {
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
            const {
                viewAd, master
            } = productAuth;

            if (master === 0) {

                if (viewAd === 0) {
                    throw new Error('没有权限！！！');
                }
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>创建广告组
     */
    public async createAdGroupAction() {
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
            adTypeId: {
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
            active: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 1,     // 默认字段
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
            const {
                editAd, master
            } = productAuth;

            if (master === 0) {

                if (editAd === 0) {
                    throw new Error('没有权限！！！');
                }
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>复制广告组
     */
    public async copyAdGroupAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型
        const ucId: string = this.ctx.state.user.id;

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
            description: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 1,     // 默认字段
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const adGroupId: string = this.post('id');
        const adGroupModel = this.taleModel('adGroup', 'advertisement') as AdGroupModel;

        try {
            const { productId } = await adGroupModel.getVo(adGroupId, ucId);
            const productAuth = await this.productAuth(productId);
            const {
                editAd, master
            } = productAuth;

            if (master === 0) {

                if (editAd === 0) {
                    throw new Error('没有权限！！！');
                }
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>更新广告组
     */
    public async updateAdGroupAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型
        const ucId: string = this.ctx.state.user.id;

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

        const adGroupId: string = this.post('id');
        const adGroupModel = this.taleModel('adGroup', 'advertisement') as AdGroupModel;

        try {
            const { productId } = await adGroupModel.getVo(adGroupId, ucId);
            const productAuth = await this.productAuth(productId);
            const {
                editAd, master
            } = productAuth;

            if (master === 0) {

                if (editAd === 0) {
                    throw new Error('没有权限！！！');
                }
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>获取广告列表
     */
    public async adListAction() {
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
            const {
                viewAd, master
            } = productAuth;

            if (master === 0) {

                if (viewAd === 0) {
                    throw new Error('没有权限！！！');
                }
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>获取广告组下广告列表
     */
    public async adListInAdGroupAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型
        const ucId: string = this.ctx.state.user.id;

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

        const adGroupId: string = this.post('id');
        const adGroupModel = this.taleModel('adGroup', 'advertisement') as AdGroupModel;

        try {
            const { productId } = await adGroupModel.getVo(adGroupId, ucId);
            const productAuth = await this.productAuth(productId);
            const {
                viewAd, master
            } = productAuth;

            if (master === 0) {

                if (viewAd === 0) {
                    throw new Error('没有权限！！！');
                }
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>创建广告
     */
    public async createAdAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型
        const ucId: string = this.ctx.state.user.id;

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            adChannelId: {
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
            ecpm: {
                float: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            bidding: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                default: 1,    // 默认字段
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const ecpm: number = this.post('ecpm');
        const bidding: number = this.post('bidding');

        if (ecpm < 0) {
            return this.fail(TaleCode.ValidData, 'ecpm 必须为非负数！！！');
        }
        if (bidding === 1) {
            this.post('ecpm', 0);
        }

        const adGroupId: string = this.post('id');
        const adGroupModel = this.taleModel('adGroup', 'advertisement') as AdGroupModel;

        try {
            const { productId } = await adGroupModel.getVo(adGroupId, ucId);
            const productAuth = await this.productAuth(productId);
            const {
                editAd, master
            } = productAuth;

            if (master === 0) {

                if (editAd === 0) {
                    throw new Error('没有权限！！！');
                }
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>更新广告
     */
    public async updateAdAction() {
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
            placementID: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            loader: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            subloader: {
                string: true,       // 字段类型为 String 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            ecpm: {
                float: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            interval: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            weight: {
                int: true,       // 字段类型为 Number 类型
                trim: true,         // 字段需要 trim 处理
                method: 'POST'       // 指定获取数据的方式
            },
            bidding: {
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

        const adId: string = this.post('id');
        const adModel = this.taleModel('ad', 'advertisement') as AdModel;

        try {
            const { productId } = await adModel.getVo(adId);
            const productAuth = await this.productAuth(productId);
            const {
                editAd, master
            } = productAuth;

            if (master === 0) {

                if (editAd === 0) {
                    throw new Error('没有权限！！！');
                }
            }
        } catch (e) {
            think.logger.debug(e);
            return this.fail(TaleCode.AuthFaild, '没有权限！！！');
        }

    }

    /**
     * <br/>删除广告组下广告
     */
    // public async deleteAdAction() {
    //     this.allowMethods = 'post';    // 只允许 POST 请求类型

    //     const rules = {
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

    //     const adId: string = this.post('id');
    //     const adModel = this.taleModel('ad', 'advertisement') as AdModel;

    //     try {
    //         const { productId } = await adModel.getVo(adId);
    //         const productAuth = await this.productAuth(productId);
    //         const {
    //             editAd, master
    //         } = productAuth;

    //         if (master === 0) {

    //             if (editAd === 0) {
    //                 throw new Error('没有权限！！！');
    //             }
    //         }

    //     } catch (e) {
    //         think.logger.debug(e);
    //         return this.fail(TaleCode.AuthFaild, '没有权限！！！');
    //     }

    // }

    /**
     * 取得访问豁免,
     * <br/>当前类的index方法不验证token
     */
    tokenExempts(): TokenExemptVO[] {
        const exes = super.tokenExempts();

        exes.push({ action: 'index' });
        exes.push({ action: 'createNationList' });
        exes.push({ action: 'updateNationList' });

        return exes;
    }

}
