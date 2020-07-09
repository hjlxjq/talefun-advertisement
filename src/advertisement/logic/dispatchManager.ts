import { TaleCode, TokenExemptVO } from '../../common/tale/TaleDefine';
import AMLogic from './managerBaseLogic';

import AuthServer from '../service/authServer';

import BaseConfigModel from '../model/baseConfig';
import VersionGroupModel from '../model/versionGroup';
import AbTestGroupModel from '../model/abTestGroup';
import AdGroupModel from '../model/adGroup';
import AdModel from '../model/ad';
import ConfigGroupModel from '../model/configGroup';
import ConfigModel from '../model/config';
import NativeTmplConfGroupModel from '../model/nativeTmplConfGroup';
import NativeTmplConfModel from '../model/nativeTmplConf';
import AdChannelConfModel from '../model/channelParamConf';
import AdChannelModel from '../model/adChannel';

import UpdateCacheServer from '../service/updateCacheServer';

import { ProductAuthVO, AbTestGroupVO, VersionGroupVO } from '../defines';

import * as _ from 'lodash';
import { think } from 'thinkjs';

export default class DispatchManagerLogic extends AMLogic {

    /**
     * 权限认证，
     * <br/>应用下的权限
     * @returns {ProductAuthVO} productAuthVo 应用下的权限
     */
    private async productAuth(productId: string) {
        const ucId: string = this.ctx.state.user.id;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const productAuthVo = await authServer.fetchProductAuth(ucId, productId);
        return productAuthVo;

    }

    /**
     * <br/>获取版本条件分组列表信息
     */
    public async versionGroupListAction() {
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
                int: true,       // 字段类型为 Number 类型
                in: [0, 1, 2],     // 0 广告 1 游戏常量 2 商店
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const productId: string = this.post('id');
        const type: number = this.post('type');    // 0 广告 1 游戏常量 2 商店

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
     * 创建版本条件分组，
     * <br/>需要检查版本条件分组的一致性问题
     */
    public async createVersionGroupAction() {
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
            name: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            begin: {
                int: { min: 0 },       // 字段类型为 Number 类型且最小值为 0
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            codeList: {
                array: true,
                children: {
                    string: true,       // 字段类型为 String 类型
                    cusTrim: true,      // 前后不能有空格
                    required: true,     // 字段必填
                    length: 2,          // 长度为 2
                },
                method: 'POST'       // 指定获取数据的方式
            },
            type: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1, 2],     // 0 广告 1 游戏常量 2 商店
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            include: {
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
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const productId: string = this.post('id');
        const type: number = this.post('type');    // 0 广告 1 游戏常量 2 商店
        const name: string = this.post('name');
        const begin: number = this.post('begin');
        const include: number = this.post('include');
        const codeList: string[] = this.post('codeList') || [];    // 没有选择国家代码默认为空数组
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        // 国家代码为空，则肯定包含
        if (_.isEmpty(codeList) && include === 0) {
            this.fail(TaleCode.DBFaild, '国家代码为空，则肯定包含!!!');
        }

        // 未发布更新在缓存里的版本条件分组对象哈希表，键值为主键
        const cacheVersionGroupVoHash = await updateCacheServer.fetchCacheDataHash(ucId, 'versionGroup');

        /**
         * <br/>权限检查
         */
        const productAuth = await this.productAuth(productId);
        const {
            editAd, editGameConfig, editPurchase, master
        } = productAuth;

        try {
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

        /**
         * <br/>默认组必须，起始版本为 0, 国家全覆盖
         */
        if (
            name !== 'default' ||
            begin !== 0 ||
            include !== 1 ||
            codeList.toString() !== [].toString()
        ) {
            // 线上或者暂存是否存在默认组，创建之前先保证存在默认组
            const defaultVersionGroupVo = await versionGroupModel.getByName('default', type, productId, ucId);

            if (_.isEmpty(defaultVersionGroupVo)) {
                return this.fail(TaleCode.DBFaild, '不存在默认条件组！！！');

            }
            _.assign(defaultVersionGroupVo, cacheVersionGroupVoHash[defaultVersionGroupVo.id]);

            const { begin: defaultBegin, code, include: defaultInclude, active } = defaultVersionGroupVo;

            if (active === 0) {
                return this.fail(TaleCode.DBFaild, '不存在默认条件组！！！');

            }

            const defaultCodeList = JSON.parse(code);

            // 默认组必须，起始版本为 0, 国家全覆盖
            if (
                defaultBegin !== 0 ||
                defaultInclude !== 1 ||
                defaultCodeList.toString() !== [].toString()
            ) {
                return this.fail(TaleCode.DBFaild, '不存在默认条件组！！！');
            }
        }

        /**
         * <br/>线上是否存在冲突组，一个起始版本和一个国家只能对应一个版本条件分组
         */
        const beginVersionGroupVoList = await versionGroupModel.getByBegin(begin, type, productId, ucId);

        // 是否有重复项
        let isDupli = false;
        for (const beginVersionGroupVo of beginVersionGroupVoList) {
            // 更新的缓存数据
            const cacheVersionGroupVo = cacheVersionGroupVoHash[beginVersionGroupVo.id] as VersionGroupVO;
            // 返回线上数据和未发布的数据，以未发布数据为准
            _.assign(beginVersionGroupVo, cacheVersionGroupVo);

            const { code, include: beginInclude, active } = beginVersionGroupVo;

            if (active === 0) {
                continue;

            }

            const beginCodeList = JSON.parse(code);

            // 空数组表示都包含，肯定重复
            if (_.isEmpty(codeList) && _.isEmpty(beginCodeList)) {
                isDupli = true;
                break;

                // 只有一个为空数组则相当于无国家分组，即相当于默认组，可以创建
            } else if (_.isEmpty(codeList) || _.isEmpty(beginCodeList)) {
                continue;

            }

            // 判断 codeList 和线上相同开始版本的 codeList 是否有重复项
            const concatCodeList = _.concat(codeList, beginCodeList);
            const isCross = new Set(concatCodeList).size !== concatCodeList.length;
            // 国家都包含或者不包含，则不能有有交叉
            if ((include === beginInclude) && isCross) {
                isDupli = true;
                break;

            }
            let isContain = true;
            // 创建时选择包含，则必须是线上的子数组
            if (include === 1) {
                isContain = _.isEmpty(_.difference(codeList, beginCodeList));

                // 创建时选择不包含，线上的国家到吗则必须是创建的子数组
            } else {
                isContain = _.isEmpty(_.difference(beginCodeList, codeList));

            }
            // 创建的和线上的国家代码一个包含和一个不包含
            if (include !== beginInclude && !isContain) {
                isDupli = true;
                break;

            }

        }

        if (isDupli) {
            return this.fail(TaleCode.DBFaild, '一个起始版本和一个国家只能对应一个版本条件分组！！！');

        }

        /**
         * <br/>线上存在，则看缓存里是否禁用了，未禁用则报唯一性错误
         */
        const versionGroupVo =
            await versionGroupModel.getByName(name, type, productId, undefined, 1);

        if (!_.isEmpty(versionGroupVo) && versionGroupVo.id) {
            const cacheVersionGroupVo = cacheVersionGroupVoHash[versionGroupVo.id];

            // 未更新（不存在）或者未禁用则报唯一性错误
            if (_.isEmpty(cacheVersionGroupVo) || cacheVersionGroupVo.active !== 0) {
                return this.fail(TaleCode.DBFaild, '版本条件分组名重复！！！');

            }

        }

    }

    /**
     * 复制版本条件分组，
     * <br/>复制即相当于创建，需要检查版本条件分组的一致性问题
     * <br/>版本条件分组下的 ab 测试分组和广告位信息，都是第一次创建，所以不需要检查一致性问题
     */
    public async copyVersionGroupAction() {
        const ucId: string = this.ctx.state.user.id;
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
                cusTrim: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            begin: {
                int: { min: 0 },       // 字段类型为 Number 类型且最小值为 0
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            codeList: {
                array: true,
                children: {
                    string: true,       // 字段类型为 String 类型
                    cusTrim: true,      // 前后不能有空格
                    required: true,     // 字段必填
                    length: 2,          // 长度为 2
                },
                method: 'POST'       // 指定获取数据的方式
            },
            include: {
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
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const copyId: string = this.post('id');    // 被复制的版本条件分组主键
        const name: string = this.post('name');
        const begin: number = this.post('begin');
        const include: number = this.post('include');
        const codeList: string[] = this.post('codeList') || [];    // 没有选择国家代码默认为空数组
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        // 国家代码为空，则肯定包含
        if (_.isEmpty(codeList) && include === 0) {
            this.fail(TaleCode.DBFaild, '国家代码为空，则肯定包含!!!');
        }

        // 被复制组的默认配置
        const [
            copyedVersionGroupVo,
            copyedAbTestGroupVo
        ] = await Promise.all([
            versionGroupModel.getVo(copyId, ucId),
            abTestGroupModel.getDefault(copyId)
        ]);
        // 复制组不存在
        if (_.isEmpty(copyedVersionGroupVo) || _.isEmpty(copyedAbTestGroupVo)) {
            this.fail(TaleCode.DBFaild, '被复制组不存在！！！');

        }

        // 未发布更新在缓存里的版本条件分组对象哈希表，键值为主键
        const cacheVersionGroupVoHash = await updateCacheServer.fetchCacheDataHash(ucId, 'versionGroup');

        /**
         * <br/>权限检查
         */
        const { productId, type } = copyedVersionGroupVo;
        const productAuth = await this.productAuth(productId);
        const {
            editAd, editGameConfig, editPurchase, master
        } = productAuth;

        if (master === 0) {

            if (
                (editAd === 0 && type === 0) ||
                (editGameConfig === 0 && type === 1) ||
                (editPurchase === 0 && type === 2)
            ) {
                return this.fail(TaleCode.AuthFaild, '没有权限！！！');
            }
        }

        /**
         * <br/>线上是否存在冲突组，一个起始版本和一个国家只能对应一个版本条件分组
         */
        const beginVersionGroupVoList = await versionGroupModel.getByBegin(begin, type, productId, ucId);

        // 是否有重复项
        let isDupli = false;
        for (const beginVersionGroupVo of beginVersionGroupVoList) {
            // 更新的缓存数据
            const cacheVersionGroupVo = cacheVersionGroupVoHash[beginVersionGroupVo.id] as VersionGroupVO;
            // 返回线上数据和未发布的数据，以未发布数据为准
            _.assign(beginVersionGroupVo, cacheVersionGroupVo);

            const { code, include: beginInclude, active } = beginVersionGroupVo;

            if (active === 0) {
                continue;

            }
            const beginCodeList = JSON.parse(code);

            // 空数组表示都包含，肯定重复
            if (_.isEmpty(codeList) && _.isEmpty(beginCodeList)) {
                isDupli = true;
                break;

                // 只有一个为空数组则相当于无国家分组，即相当于默认组，可以创建
            } else if (_.isEmpty(codeList) || _.isEmpty(beginCodeList)) {
                continue;

            }

            // 判断 codeList 和线上相同开始版本的 codeList 是否有重复项
            const concatCodeList = _.concat(codeList, beginCodeList);
            const isCross = new Set(concatCodeList).size !== concatCodeList.length;
            // 国家都包含或者不包含，则不能有有交叉
            if ((include === beginInclude) && isCross) {
                isDupli = true;
                break;

            }
            let isContain = true;
            // 创建时选择包含，则必须是线上的子数组
            if (include === 1) {
                isContain = _.isEmpty(_.difference(codeList, beginCodeList));

                // 创建时选择不包含，线上的国家到吗则必须是创建的子数组
            } else {
                isContain = _.isEmpty(_.difference(beginCodeList, codeList));

            }
            // 创建的和线上的国家代码一个包含和一个不包含
            if (include !== beginInclude && !isContain) {
                isDupli = true;
                break;

            }

        }

        // 一个起始版本和一个国家只能对应一个版本条件分组
        if (isDupli) {
            return this.fail(TaleCode.DBFaild, '一个起始版本和一个国家只能对应一个版本条件分组！！！');

        }

        /**
         * <br/>线上存在，则看缓存里是否禁用了，未禁用则报唯一性错误
         */
        const versionGroupVo =
            await versionGroupModel.getByName(name, type, productId, undefined, 1);

        if (!_.isEmpty(versionGroupVo) && versionGroupVo.id) {
            const cacheVersionGroupVo = cacheVersionGroupVoHash[versionGroupVo.id];

            // 未更新（不存在）或者未禁用则报唯一性错误
            if (_.isEmpty(cacheVersionGroupVo) || cacheVersionGroupVo.active !== 0) {
                return this.fail(TaleCode.DBFaild, '版本条件分组名重复！！！');
            }
        }

    }

    /**
     * <br/>更新版本条件分组
     */
    public async updateVersionGroupAction() {
        const ucId: string = this.ctx.state.user.id;
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
                cusTrim: true,      // 前后不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            codeList: {
                array: true,
                children: {
                    string: true,       // 字段类型为 String 类型
                    cusTrim: true,      // 前后不能有空格
                    required: true,     // 字段必填
                    length: 2,          // 长度为 2
                },
                method: 'POST'       // 指定获取数据的方式
            },
            include: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                method: 'POST'       // 指定获取数据的方式
            },
            begin: {
                int: { min: 0 },       // 字段类型为 Number 类型且最小值为 0
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

        const versionGroupId: string = this.post('id');
        const begin: number = this.post('begin');
        const include: number = this.post('include');
        const codeList: string[] = this.post('codeList') || [];    // 没有选择国家代码默认为空数组
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        // 国家代码为空，则肯定包含
        if (_.isEmpty(codeList) && include === 0) {
            this.fail(TaleCode.DBFaild, '国家代码为空，则肯定包含!!!');
        }

        const versionGroupVo = await versionGroupModel.getVo(versionGroupId, ucId);

        if (_.isEmpty(versionGroupVo)) {
            this.fail(TaleCode.DBFaild, '版本条件分组不存在!!!');
        }

        // 未发布更新在缓存里的版本条件分组对象哈希表，键值为主键
        const cacheVersionGroupVoHash = await updateCacheServer.fetchCacheDataHash(ucId, 'versionGroup');
        /**
         * <br/>权限检查
         */
        const { productId, type } = versionGroupVo;
        const productAuth = await this.productAuth(productId);
        const {
            editAd, editGameConfig, editPurchase, master
        } = productAuth;

        try {
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

        /**
         * <br/>线上是否存在冲突组，一个起始版本和一个国家只能对应一个版本条件分组
         */
        const beginVersionGroupVoList = await versionGroupModel.getByBegin(begin, type, productId, ucId);
        // 是否有重复项
        let isDupli = false;
        for (const beginVersionGroupVo of beginVersionGroupVoList) {
            // 更新的缓存数据
            const cacheVersionGroupVo = cacheVersionGroupVoHash[beginVersionGroupVo.id] as VersionGroupVO;
            // 返回线上数据和未发布的数据，以未发布数据为准
            _.assign(beginVersionGroupVo, cacheVersionGroupVo);

            const { code, include: beginInclude, active } = beginVersionGroupVo;

            if (active === 0) {
                continue;

            }

            const beginCodeList = JSON.parse(code);

            // 空数组表示都包含，肯定重复
            if (_.isEmpty(codeList) && _.isEmpty(beginCodeList)) {
                isDupli = true;
                break;

                // 只有一个为空数组则相当于无国家分组，即相当于默认组，可以创建
            } else if (_.isEmpty(codeList) || _.isEmpty(beginCodeList)) {
                continue;

            }

            // 判断 codeList 和线上相同开始版本的 codeList 是否有重复项
            const concatCodeList = _.concat(codeList, beginCodeList);
            const isCross = new Set(concatCodeList).size !== concatCodeList.length;
            // 国家都包含或者不包含，则不能有有交叉
            if ((include === beginInclude) && isCross) {
                isDupli = true;
                break;

            }
            let isContain = true;
            // 创建时选择包含，则必须是线上的子数组
            if (include === 1) {
                isContain = _.isEmpty(_.difference(codeList, beginCodeList));

                // 创建时选择不包含，线上的国家到吗则必须是创建的子数组
            } else {
                isContain = _.isEmpty(_.difference(beginCodeList, codeList));

            }
            // 创建的和线上的国家代码一个包含和一个不包含
            if (include !== beginInclude && !isContain) {
                isDupli = true;
                break;

            }

        }

        // 一个起始版本和一个国家只能对应一个版本条件分组
        if (isDupli) {
            return this.fail(TaleCode.DBFaild, '一个起始版本和一个国家只能对应一个版本条件分组！！！');

        }

    }

    /**
     * <br/>获取版本条件分组下 ab 分组列表
     */
    public async abTestGroupListAction() {
        const ucId: string = this.ctx.state.user.id;
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

        const versionGroupId: string = this.post('id');
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;

        try {
            const { productId, type } = await versionGroupModel.getVo(versionGroupId, ucId);
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
     * <br/>获取 ab 分组下广告位配置
     */
    public async placeGroupListInAbAction() {
        const ucId: string = this.ctx.state.user.id;
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

        const abTestGroupId: string = this.post('id');
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;

        const { versionGroupId } = await abTestGroupModel.getVo(abTestGroupId, ucId);

        try {
            const { productId, type } = await versionGroupModel.getVo(versionGroupId, ucId);
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
     * <br/>获取 ab 分组下的常量组及常量组下常量列表配置
     */
    public async configGroupInAbAction() {
        const ucId: string = this.ctx.state.user.id;
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

        const abTestGroupId: string = this.post('id');
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;

        const { versionGroupId } = await abTestGroupModel.getVo(abTestGroupId, ucId);

        try {
            const { productId, type } = await versionGroupModel.getVo(versionGroupId, ucId);
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
     * <br/>获取 ab 分组下的 native 模板组及包含的 native 模板列表
     */
    public async nativeTmplConfGroupInAbAction() {
        const ucId: string = this.ctx.state.user.id;
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

        const abTestGroupId: string = this.post('id');
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;

        const { versionGroupId } = await abTestGroupModel.getVo(abTestGroupId, ucId);

        try {
            const { productId, type } = await versionGroupModel.getVo(versionGroupId, ucId);
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
     * <br/>向版本条件分组下创建 ab 分组
     */
    public async createAbTestGroupAction() {
        const ucId: string = this.ctx.state.user.id;
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
                cusTrimAll: true,      // 不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            begin: {
                int: { min: 1, max: 99 },       // 字段类型为 Number 类型
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            end: {
                int: { min: 2, max: 100 },       // 字段类型为 Number 类型
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            groupNum: {
                int: { min: 2, max: 100 },       // 字段类型为 Number 类型
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
        const name: string = this.post('name');
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        // 用户范围结束大于开始
        if (begin >= end) {
            return this.fail(TaleCode.ValidData, '分组失败，结束范围必须大于开始范围！！！');
        }

        // 分组要均分，整除
        if ((end - begin + 1) % groupNum !== 0) {
            return this.fail(TaleCode.ValidData, '分组失败，分组范围不能均分！！！');
        }

        /**
         * <br/>权限判断
         */
        try {
            const { productId, type } = await versionGroupModel.getVo(versionGroupId, ucId);
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

        /**
         * <br/>线上存在，则看缓存里是否禁用了，未禁用则报唯一性错误
         */
        const abTestGroupVoList =
            await abTestGroupModel.getListByName(versionGroupId, name, undefined, undefined, 1);

        const abTestGroupVo = abTestGroupVoList[0];
        if (!_.isEmpty(abTestGroupVo) && abTestGroupVo.id) {
            // 缓存中个更新
            const cacheAbTestGroupVo: AbTestGroupVO =
                await updateCacheServer.fetchCacheData(ucId, 'abTestGroup', abTestGroupVo.id);

            // 未更新（不存在）或者未禁用则报唯一性错误
            if (_.isEmpty(cacheAbTestGroupVo) || cacheAbTestGroupVo.active !== 0) {
                return this.fail(TaleCode.DBFaild, 'ab 测试名重复！！！');
            }

        }

        /**
         * <br/> ab 测试分组范围检测
         */
        const currentAbTestGroupVoList = await abTestGroupModel.getListByVersionGroup(versionGroupId, undefined, 1);
        // 终止判断条件
        currentAbTestGroupVoList[currentAbTestGroupVoList.length] = {
            begin: 100, end: 100, nativeTmplConfGroupId: undefined, configGroupId: undefined, versionGroupId: undefined,
            name: undefined, description: undefined, creatorId: undefined, active: undefined, activeTime: undefined
        };

        let correct = false;
        for (let i = 0, l = currentAbTestGroupVoList.length; i < l; i++) {
            const currentAbTestGroupVo = currentAbTestGroupVoList[i];
            // 上一个 ab 测试用户范围，第一个 ab 测试默认上一个用户范围
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

        // 未找到合适的用户范围
        if (!correct) {
            return this.fail(TaleCode.ValidData, '分组失败，范围重叠！！！');
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
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
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

        const versionGroupId: string = this.post('id');
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;

        /**
         * <br/>权限判断
         */
        try {
            const { productId, type } = await versionGroupModel.getVo(versionGroupId, ucId);

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
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            configGroupId: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const abTestGroupId: string = this.post('id');
        const configGroupId: string = this.post('configGroupId');
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;

        try {
            const { versionGroupId } = await abTestGroupModel.getVo(abTestGroupId, ucId);
            const { productId, type } = await versionGroupModel.getVo(versionGroupId, ucId);

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

        // 空字符串也默认删除
        if (configGroupId === '') {
            this.post('configGroupId', null);

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
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            type: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 广告 1 游戏常量
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const productId: string = this.post('id');
        const type: number = this.post('type');    // 0 广告 1 游戏常量 2 商店

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

        const configGroupId: string = this.post('id');
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;

        try {
            const configGroupVo = await configGroupModel.getVo(configGroupId, ucId);
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
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            name: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            dependentId: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            type: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 广告 1 游戏常量
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 1,     // 默认字段
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const productId: string = this.post('id');
        const type: number = this.post('type');    // 0 广告 1 游戏常量 2 商店

        /**
         * <br/>权限判断
         */
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
                cusTrim: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
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
            active: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
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

        /**
         * <br/>权限判断
         */
        try {
            const configGroupVo = await configGroupModel.getVo(configGroupId, ucId);
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
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            dependentId: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
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

        const configGroupId: string = this.post('id');
        const dependentId: string = this.post('dependentId');
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;

        /**
         * <br/>权限判断
         */
        try {
            const configGroupVo = await configGroupModel.getVo(configGroupId, ucId);
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

        // 空字符串也默认删除
        if (dependentId === '') {
            this.post('dependentId', null);

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
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            key: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[A-Za-z][A-Za-z0-9]+$/,    // 字段值要匹配给出的正则
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            value: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
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
            const configGroupVo = await configGroupModel.getVo(configGroupId, ucId);
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
     * <br/>创建游戏常量
     */
    public async createConfigAction() {
        this.allowMethods = 'post';    // 只允许 POST 请求类型
        const ucId: string = this.ctx.state.user.id;

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            key: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[A-Za-z][A-Za-z0-9]+$/,    // 字段值要匹配给出的正则
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            value: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 1,     // 默认字段
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const configGroupId: string = this.post('id');
        const key: string = this.post('key');
        const baseConfigModel = this.taleModel('baseConfig', 'advertisement') as BaseConfigModel;
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;
        const configModel = this.taleModel('config', 'advertisement') as ConfigModel;
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        /**
         * <br/>权限判断
         */
        try {
            const configGroupVo = await configGroupModel.getVo(configGroupId, ucId);
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

        /**
         * <br/>判断 key 在基础常量中是否存在，存在不可创建
         */
        const baseConfigVo = await baseConfigModel.getByKey(key);

        if (!_.isEmpty(baseConfigVo)) {
            return this.fail(TaleCode.ValidData, '基础常量存在相同 key');

        }

        /**
         * <br/>线上存在，则看缓存里是否禁用了，未禁用则报唯一性错误
         */
        const configVo = await configModel.getByGroupAndKey(key, configGroupId, ucId, undefined, 1);

        if (!_.isEmpty(configVo) && configVo.id) {
            const cacheConfigVo = await updateCacheServer.fetchCacheData(ucId, 'config', configVo.id);

            // 未更新（不存在）或者未禁用则报唯一性错误
            if (_.isEmpty(cacheConfigVo) || cacheConfigVo.active !== 0) {
                return this.fail(TaleCode.DBFaild, '游戏常量 key 重复！！！');
            }

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
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            value: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
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

        const configId: string = this.post('id');
        const configModel = this.taleModel('config', 'advertisement') as ConfigModel;
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;

        try {
            const { configGroupId } = await configModel.getVo(configId, ucId);
            const configGroupVo = await configGroupModel.getVo(configGroupId, ucId);
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
     * <br/>向 ab 分组绑定 native 组
     */
    public async bindNativeTmplConfGroupAction() {
        const ucId: string = this.ctx.state.user.id;
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            nativeTmplConfGroupId: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const abTestGroupId: string = this.post('id');
        const nativeTmplConfGroupId: string = this.post('nativeTmplConfGroupId');
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;

        try {
            const { versionGroupId } = await abTestGroupModel.getVo(abTestGroupId, ucId);
            const { productId, type } = await versionGroupModel.getVo(versionGroupId, ucId);
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

        // 空字符串也默认删除
        if (nativeTmplConfGroupId === '') {
            this.post('nativeTmplConfGroupId', null);

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

        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;
        const nativeTmplConfGroupId: string = this.post('id');

        think.logger.debug(`nativeTmplConfGroupId: ${nativeTmplConfGroupId}`);

        try {
            const nativeTmplConfGroupVo =
                await nativeTmplConfGroupModel.getVo(nativeTmplConfGroupId, ucId);

            think.logger.debug(`nativeTmplConfGroupVo: ${JSON.stringify(nativeTmplConfGroupVo)}`);
            const { productId } = nativeTmplConfGroupVo;
            think.logger.debug(`productId: ${productId}`);

            const productAuth = await this.productAuth(productId);

            // think.logger.debug(`productAuth: ${JSON.stringify(productAuth)}`);
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
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            name: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
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
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            name: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
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
                await nativeTmplConfGroupModel.getVo(nativeTmplConfGroupId, ucId);
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
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
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

        const nativeTmplConfGroupId: string = this.post('id');
        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;

        try {
            const nativeTmplConfGroupVo =
                await nativeTmplConfGroupModel.getVo(nativeTmplConfGroupId, ucId);
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
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            nativeTmplId: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            weight: {
                int: true,       // 字段类型为 Number 类型
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            clickArea: {
                int: true,       // 字段类型为 Number 类型
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            isFull: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 1,     // 默认字段
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const nativeTmplId: string = this.post('nativeTmplId');
        const nativeTmplConfGroupId: string = this.post('id');
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;
        const nativeTmplConfModel =
            this.taleModel('nativeTmplConf', 'advertisement') as NativeTmplConfModel;
        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;

        const nativeTmplConfGroupVo =
            await nativeTmplConfGroupModel.getVo(nativeTmplConfGroupId, ucId);

        if (_.isEmpty(nativeTmplConfGroupVo)) {
            return this.fail(TaleCode.DBFaild, '模板组不存在！！！');
        }

        /**
         * <br/>权限判断
         */
        try {
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

        /**
         * <br/>线上存在，则看缓存里是否禁用了，未禁用则报唯一性错误
         */
        const nativeTmplConfVo =
            await nativeTmplConfModel.getByGroupAndNativeTmpl(nativeTmplId, nativeTmplConfGroupId, ucId, 1);

        if (!_.isEmpty(nativeTmplConfVo) && nativeTmplConfVo.id) {
            const cacheNativeTmplConfVo =
                await updateCacheServer.fetchCacheData(ucId, 'nativeTmplConf', nativeTmplConfVo.id);

            // 未更新（不存在）或者未禁用则报唯一性错误
            if (_.isEmpty(cacheNativeTmplConfVo) || cacheNativeTmplConfVo.active !== 0) {
                return this.fail(TaleCode.DBFaild, '模板 key 重复！！！');
            }

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
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            weight: {
                int: true,       // 字段类型为 Number 类型
                method: 'POST'       // 指定获取数据的方式
            },
            clickArea: {
                int: true,       // 字段类型为 Number 类型
                method: 'POST'       // 指定获取数据的方式
            },
            isFull: {
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

        const nativeTmplConfId: string = this.post('id');
        const nativeTmplConfModel = this.taleModel('nativeTmplConf', 'advertisement') as NativeTmplConfModel;
        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;

        const nativeTmplConfVo = await nativeTmplConfModel.getVo(nativeTmplConfId, ucId);

        if (_.isEmpty(nativeTmplConfVo)) {
            return this.fail(TaleCode.DBFaild, '模板配置不存在!!!');

        }
        const { nativeTmplConfGroupId } = nativeTmplConfVo;

        const nativeTmplConfGroupVo =
            await nativeTmplConfGroupModel.getVo(nativeTmplConfGroupId, ucId);

        if (_.isEmpty(nativeTmplConfGroupVo)) {
            return this.fail(TaleCode.DBFaild, '模板配置组不存在!!!');

        }
        const { productId } = nativeTmplConfGroupVo;

        // 权限判断
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
     * <br/>向 ab 分组绑定广告组
     */
    public async bindAdGroupAction() {
        const ucId: string = this.ctx.state.user.id;
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            adGroupId: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                method: 'POST'       // 指定获取数据的方式
            },
            place: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z_]+$/,    // 字段值要匹配给出的正则
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                default: 1,     // 默认字段
                method: 'POST'       // 指定获取数据的方式
            }
        };
        const flag = this.validate(rules);

        if (!flag) {
            return this.fail(TaleCode.ValidData, this.validateMsg());
        }

        const abTestGroupId: string = this.post('id');
        const adGroupId: string = this.post('adGroupId');
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;

        try {
            const { versionGroupId } = await abTestGroupModel.getVo(abTestGroupId, ucId);
            const { productId, type } = await versionGroupModel.getVo(versionGroupId, ucId);
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

        // 空字符串也默认删除
        if (adGroupId === '') {
            this.post('adGroupId', null);

        }

    }

    /**
     * <br/>全量 ab 分组下广告位到默认组
     */
    public async completePlaceAction() {
        const ucId: string = this.ctx.state.user.id;
        this.allowMethods = 'post';    // 只允许 POST 请求类型

        const rules = {
            id: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            place: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z_]+$/,    // 字段值要匹配给出的正则
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
            const { productId, type } = await versionGroupModel.getVo(versionGroupId, ucId);
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
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            name: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            adTypeId: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
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
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            name: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
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
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            description: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
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
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            adChannelId: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9-]+$/,    // 字段值要匹配给出的正则
                length: 36,         // 长度为 36
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            name: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            placementID: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 不能有空格
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            ecpm: {
                float: true,       // 字段类型为 Number 类型
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            bidding: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
                required: true,     // 字段必填
                method: 'POST'       // 指定获取数据的方式
            },
            active: {
                int: true,       // 字段类型为 Number 类型
                in: [0, 1],     // 0 为 false， 1 为 true
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
        const adGroupId: string = this.post('id');
        const adChannelId: string = this.post('adChannelId');
        const name: string = this.post('name');
        const placementID: string = this.post('placementID');
        const adGroupModel = this.taleModel('adGroup', 'advertisement') as AdGroupModel;
        const channelParamConfModel = this.taleModel('channelParamConf', 'advertisement') as AdChannelConfModel;
        const adChannelModel = this.taleModel('adChannel', 'advertisement') as AdChannelModel;
        const adModel = this.taleModel('ad', 'advertisement') as AdModel;
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        // ecpm 非负
        if (ecpm < 0) {
            return this.fail(TaleCode.ValidData, 'ecpm 必须为非负数！！！');
        }
        // bidding 为 1, 则 ecpm 强制为 0
        if (bidding === 1 && ecpm !== 0) {
            return this.fail(TaleCode.ValidData, 'bidding 为 1, 则 ecpm 强制为 0！！！');
        }

        const { productId } = await adGroupModel.getVo(adGroupId, ucId);

        const [adChannelVo, channelParamConfVo] = await Promise.all([
            adChannelModel.getVo(adChannelId),
            channelParamConfModel.getVo(adChannelId, productId)
        ]);

        let keyExist = false;
        if (adChannelVo.key1 || adChannelVo.key2 || adChannelVo.key3) {
            keyExist = true;
        }
        // 常规配置中 key 存在，且在应用下面没有配置 value，则必须在广告 placementID 中包含 $
        if (
            keyExist &&
            _.isEmpty(channelParamConfVo) &&
            !_.includes(placementID, '$')
        ) {
            return this.fail(TaleCode.ValidData, '平台参数没有填, 广告 id 里面也没有加 $ ！！！');
        }

        /**
         * 权限判断
         */
        const productAuth = await this.productAuth(productId);
        const {
            editAd, master
        } = productAuth;

        if (master === 0) {

            if (editAd === 0) {
                return this.fail(TaleCode.AuthFaild, '没有权限！！！');
            }
        }

        /**
         * 广告 placementID 和广告名称唯一性检查，
         * <br/>线上存在，则看缓存里是否禁用了，未禁用则报唯一性错误
         */
        const [
            adByPlacementIDVo, adByNameVo
        ] = await Promise.all([
            adModel.getByPlacementID(adGroupId, placementID, 1),
            adModel.getByName(adGroupId, adChannelId, name, 1)
        ]);

        think.logger.debug(`adByPlacementIDVo: ${JSON.stringify(adByPlacementIDVo)}`);
        think.logger.debug(`adByNameVo: ${JSON.stringify(adByNameVo)}`);

        if (!_.isEmpty(adByPlacementIDVo) && adByPlacementIDVo.id) {
            const cacheAdByPlacementIDVo = await updateCacheServer.fetchCacheData(ucId, 'ad', adByPlacementIDVo.id);

            think.logger.debug(`cacheAdByPlacementIDVo: ${JSON.stringify(cacheAdByPlacementIDVo)}`);

            // 未更新（不存在）或者未禁用则报唯一性错误
            if (_.isEmpty(cacheAdByPlacementIDVo) || cacheAdByPlacementIDVo.active !== 0) {
                return this.fail(TaleCode.DBFaild, '广告 placementID 重复！！！');
            }

        }
        if (!_.isEmpty(adByNameVo) && adByNameVo.id) {
            const cacheAdByNameVo = await updateCacheServer.fetchCacheData(ucId, 'ad', adByNameVo.id);

            think.logger.debug(`cacheAdByNameVo: ${JSON.stringify(cacheAdByNameVo)}`);

            // 未更新（不存在）或者未禁用则报唯一性错误
            if (_.isEmpty(cacheAdByNameVo) || cacheAdByNameVo.active !== 0) {
                return this.fail(TaleCode.DBFaild, '广告名称重复！！！');
            }

        }

    }

    /**
     * <br/>更新广告
     */
    public async updateAdAction() {
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
            name: {
                string: true,       // 字段类型为 String 类型
                cusTrim: true,      // 前后不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            placementID: {
                string: true,       // 字段类型为 String 类型
                cusTrimAll: true,      // 前后不能有空格
                method: 'POST'       // 指定获取数据的方式
            },
            loader: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9]+$/,    // 字段值要匹配给出的正则
                method: 'POST'       // 指定获取数据的方式
            },
            subloader: {
                string: true,       // 字段类型为 String 类型
                regexp: /^[a-z0-9]+$/,    // 字段值要匹配给出的正则
                method: 'POST'       // 指定获取数据的方式
            },
            ecpm: {
                float: true,       // 字段类型为 Number 类型
                method: 'POST'       // 指定获取数据的方式
            },
            interval: {
                int: true,       // 字段类型为 Number 类型
                method: 'POST'       // 指定获取数据的方式
            },
            weight: {
                int: true,       // 字段类型为 Number 类型
                method: 'POST'       // 指定获取数据的方式
            },
            bidding: {
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

        const adId: string = this.post('id');
        const ecpm: number = this.post('ecpm');
        const bidding: number = this.post('bidding');
        const adModel = this.taleModel('ad', 'advertisement') as AdModel;

        const adVo = await adModel.getVo(adId, ucId);

        if (_.isEmpty(adVo)) {
            this.fail(TaleCode.DBFaild, '该广告不存在!!!');
        }

        // ecpm 非负
        if (ecpm < 0) {
            return this.fail(TaleCode.ValidData, 'ecpm 必须为非负数！！！');
        }
        // bidding 为 1, 则 ecpm 强制为 0
        if (bidding === 1 && ecpm !== 0) {
            return this.fail(TaleCode.ValidData, 'bidding 为 1, 则 ecpm 强制为 0！！！');
        }

        // 权限判断
        const { productId } = adVo;
        const productAuth = await this.productAuth(productId);
        const {
            editAd, master
        } = productAuth;

        if (master === 0) {

            if (editAd === 0) {
                return this.fail(TaleCode.AuthFaild, '没有权限！！！');
            }
        }

    }

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
