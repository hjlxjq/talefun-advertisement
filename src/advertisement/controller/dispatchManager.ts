/**
 * DistributeManager Controller module.
 * <br/> 应用下发相关 api
 * @module advertisement/controller/distributeManager
 * @see advertisement/controller/distributeManager;
 * @debugger
 */
import { think } from 'thinkjs';
import * as Bluebird from 'bluebird';
import ModelServer from '../service/modelServer';
import * as _ from 'lodash';
import * as moment from 'moment-mini-ts';

import { TaleCode } from '../../common/tale/TaleDefine';
import BaseController from '../../common/tale/BaseController';

import VersionGroupModel from '../model/versionGroup';
import NationDefineModel from '../model/nationDefine';
import AbTestGroupModel from '../model/abTestGroup';
import AbTestMapModel from '../model/abTestMap';
import ConfigGroupModel from '../model/configGroup';
import ConfigModel from '../model/config';
import NativeTmplConfGroupModel from '../model/nativeTmplConfGroup';
import NativeTmplConfModel from '../model/nativeTmplConf';
import AdGroupModel from '../model/adGroup';
import AdModel from '../model/ad';

import CacheService from '../service/cacheServer';

import {
    VersionGroupVO, AbTestGroupVO, ConfigGroupVO, ConfigVO, NativeTmplConfGroupVO, NativeTmplConfVO,
    AbTestMapVO, AdGroupVO, AdVO, ConfigGroupResVO, NativeTmplConfGroupResVO, AbTestGroupResVO, NationDefineVO
} from '../defines';

import {
    VersionGroupListReqVO, VersionGroupListResVO, CreateVersionGroupReqVO, CreateVersionGroupResVO,
    UpdateVersionGroupReqVO, UpdateVersionGroupResVO, AbTestGroupListReqVO, AbTestGroupListResVO,
    CreateAbTestGroupReqVO, CreateAbTestGroupResVO, BindConfigGroupReqVO, BindConfigGroupResVO,
    ConfigGroupListReqVO, ConfigGroupListResVO, ConfigListReqVO, ConfigListResVO,
    CreateConfigGroupReqVO, CreateConfigGroupResVO, UpdateConfigGroupReqVO, UpdateConfigGroupResVO,
    CreateConfigReqVO, CreateConfigResVO, UpdateConfigReqVO, UpdateConfigResVO,
    BindNativeTmplConfGroupReqVO, BindNativeTmplConfGroupResVO, NativeTmplConfGroupListReqVO,
    NativeTmplConfGroupListResVO, NativeTmplConfListReqVO, NativeTmplConfListResVO, CreateNativeTmplConfGroupReqVO,
    CreateNativeTmplConfGroupResVO, UpdateNativeTmplConfGroupReqVO, UpdateNativeTmplConfGroupResVO,
    CreateNativeTmplConfReqVO, CreateNativeTmplConfResVO, CopyNativeTmplConfGroupReqVO,
    CopyNativeTmplConfGroupResVO, UpdateNativeTmplConfReqVO, UpdateNativeTmplConfResVO, BindAdGroupReqVO,
    BindAdGroupResVO, AdGroupListReqVO, AdGroupListResVO,
    CreateAdGroupReqVO, CreateAdGroupResVO, UpdateAdGroupReqVO, UpdateAdGroupResVO,
    AdListReqVO, AdListResVO, AdListInAdGroupReqVO, AdListInAdGroupResVO, CreateAdReqVO, CreateAdResVO,
    CopyAdGroupReqVO, CopyAdGroupResVO, UpdateAdReqVO, UpdateAdResVO, NationDefineListResVO,
    CopyConfigGroupReqVO, CopyConfigGroupResVO, CreateNativeTmplConfListResVO,
    CopyVersionGroupReqVO, CopyVersionGroupResVO, CompletePlaceReqVO, CompletePlaceResVO,
    CreateDefaultAbTestGroupReqVO, CreateDefaultAbTestGroupResVO, UpdateAdConfigReqVO, UpdateAdConfigResVO,
    // DeleteConfigReqVO, DeleteConfigResVO, DeleteNativeTmplConfReqVO, DeleteNativeTmplConfResVO,
    // UnbindAdGroupReqVO, UnbindAdGroupResVO,DeleteAdReqVO, DeleteAdResVO,
} from '../interface';
import AdTypeModel from '../model/adType';

export default class DispatchManagerController extends BaseController {

    /**
     * <br/>获取版本分组控制列表信息
     * @argument {VersionGroupListReqVO}
     * @returns {VersionGroupListResVO}
     * @debugger yes
     */
    public async versionGroupListAction() {
        const ucId: string = this.ctx.state.userId;
        const productId: string = this.post('id');
        const type: number = this.post('type');
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const versionGroupResVoList = await modelServer.getVersionGroupList(productId, type, ucId);
        return this.success(versionGroupResVoList);
    }

    /**
     * <br/>获取国家代码定义列表
     * @returns {NationDefineListResVO}
     * @debugger yes
     */
    public async nationListAction() {
        const ucId: string = this.ctx.state.userId;
        const nationDefineModel = this.taleModel('nationDefine', 'advertisement') as NationDefineModel;

        const nationDefineVoList = await nationDefineModel.getList();
        return this.success(nationDefineVoList);
    }

    /**
     * <br/>插入国家代码定义列表 --- 一次性
     */
    public async createNationListAction() {
        const nationDefineList: NationDefineVO[] = this.post('nationDefineList');
        const nationDefineModel = this.taleModel('nationDefine', 'advertisement') as NationDefineModel;

        const rows = await nationDefineModel.addList(nationDefineList);

        if (rows.length === nationDefineList.length) {
            this.success('created');
        } else {
            this.fail(TaleCode.DBFaild, 'create fail!!!');
        }
    }

    /**
     * <br/>更新国家代码定义列表
     */
    public async updateNationAction() {
        const name: string = this.post('name');
        const code: string = this.post('code');

        const nationDefineModel = this.taleModel('nationDefine', 'advertisement') as NationDefineModel;

        const rows = await nationDefineModel.updateNationDefine(code, name);
        if (rows === 1) {
            this.success('updated');
        } else {
            this.fail(TaleCode.DBFaild, 'update fail!!!');
        }
    }

    /**
     * <br/>创建版本分组控制
     * @argument {CreateVersionGroupReqVO}
     * @returns {CreateVersionGroupResVO}
     * @debugger yes
     */
    public async createVersionGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const productId: string = this.post('id');
        const name: string = this.post('name');
        const begin: number = this.post('begin');
        const description: string = this.post('description');
        const codeList: string[] = this.post('codeList') || [];
        const type: number = this.post('type');
        const include: number = this.post('include');
        const active: number = this.post('active');

        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;

        const versionGroupVo: VersionGroupVO = {
            name,
            begin,
            description,
            type,
            code: JSON.stringify(codeList),
            include,
            active, activeTime: undefined,
            creatorId: ucId,
            productId
        };
        const versionGroupId = await versionGroupModel.addVersionGroup(versionGroupVo);

        // 向版本分组下创建默认 ab 分组
        const abTestGroupVo: AbTestGroupVO = {
            versionGroupId, active,
            name: 'default', begin: -1, end: -1, description: '默认组',
            creatorId: ucId, configGroupId: null, nativeTmplConfGroupId: null, activeTime: null
        };
        await abTestGroupModel.addVo(abTestGroupVo);

        this.success('created');
    }

    /**
     * <br/>复制版本分组控制
     * @argument {CopyVersionGroupReqVO}
     * @returns {CopyVersionGroupResVO}
     * @debugger yes
     */
    public async copyVersionGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const copyId: string = this.post('id');
        const name: string = this.post('name');
        const description: string = this.post('description');
        const active: number = this.post('active');

        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const abTestMapModel = this.taleModel('abTestMap', 'advertisement') as AbTestMapModel;

        // 被复制组的默认配置
        const [
            copyedVersionGroupVo,
            copyedAbTestGroupVo
        ] = await Promise.all([
            versionGroupModel.getVersionGroup(copyId, ucId),
            abTestGroupModel.getDefault(copyId, ucId)
        ]);

        // 复制组不存在
        if (_.isEmpty(copyedVersionGroupVo) || _.isEmpty(copyedAbTestGroupVo)) {
            this.fail(TaleCode.DBFaild, '复制组不存在！！！');
        }

        const { begin, description: copyedDescription, type, code, include, productId } = copyedVersionGroupVo;
        const { id: copyedAbTestGroupId, configGroupId, nativeTmplConfGroupId } = copyedAbTestGroupVo;

        // 先创建版本分组和对应的国家代码表
        const versionGroupVo: VersionGroupVO = {
            name,
            begin,
            description: description || copyedDescription,
            type,
            code,
            include,
            active, activeTime: undefined,
            creatorId: ucId,
            productId
        };
        const versionGroupId = await versionGroupModel.addVersionGroup(versionGroupVo);

        // 再创建版本分组下默认 ab 测试
        const defaultAbTestGroupVo: AbTestGroupVO = {
            name: 'default', begin: -1, end: -1, description: '默认组', active, activeTime: null,
            creatorId: ucId, nativeTmplConfGroupId, configGroupId, versionGroupId
        };
        const defaultAbTestGroupId = await abTestGroupModel.addVo(defaultAbTestGroupVo);

        // 再创建版本分组下默认 ab 测试下的广告测试
        const copyedAbTestMapVoList = await abTestMapModel.getList(copyedAbTestGroupId, ucId);
        const defaultAbTestMapVoList = _.map(copyedAbTestMapVoList, (copyedAbTestMapVo) => {
            const { place, type: adType, adGroupId } = copyedAbTestMapVo;

            const defaultAbTestMapVo: AbTestMapVO = {
                place, type: adType, adGroupId, abTestGroupId: defaultAbTestGroupId, creatorId: ucId, active: 1
            };
            return defaultAbTestMapVo;
        });
        const rows = (await abTestMapModel.addList(defaultAbTestMapVoList)).length;

        // 比较创建成功与否
        if (rows === copyedAbTestMapVoList.length) {
            this.success('copyed');
        } else {
            this.fail(TaleCode.DBFaild, 'copy fail!!!');
        }
    }

    /**
     * <br/>更新版本分组控制
     * @argument {UpdateVersionGroupReqVO}
     * @returns {UpdateVersionGroupResVO}
     * @debugger yes
     */
    public async updateVersionGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const id: string = this.post('id');
        const name: string = this.post('name');
        const begin: number = this.post('begin');
        const description: string = this.post('description');
        const codeList: string[] = this.post('codeList');
        const include: number = this.post('include');
        const active: number = this.post('action');
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        let code: string;

        if (codeList) {
            code = JSON.stringify(codeList);
        }

        const versionGroupVo: VersionGroupVO = {
            name, begin, description, code, include, active, activeTime: undefined,
            type: undefined, productId: undefined, creatorId: undefined
        };

        if (active === 0) {
            const now = moment().format('YYYY-MM-DD HH:mm:ss');
            versionGroupVo.activeTime = now;
        }

        try {
            await cacheServer.setCacheData(ucId, 'versionGroup', id, versionGroupVo);
            this.success('updated');

        } catch (e) {
            think.logger.debug(e);
            this.fail(TaleCode.DBFaild, 'update fail!!!');
        }
    }

    /**
     * <br/>获取版本分组下 ab 分组列表
     * @argument {AbTestGroupListReqVO}
     * @returns {AbTestGroupListResVO}
     * @debugger yes
     */
    public async abTestGroupListAction() {
        const ucId: string = this.ctx.state.userId;
        const versionGroupId: string = this.post('id');
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        // 数据库里的 ab 分组对象
        const abTestGroupVoList = await abTestGroupModel.getList(versionGroupId, ucId);
        // 未发布更新在缓存里的 ab 分组对象
        const cacheAbTestGroupVoHash = await cacheServer.fetchCacheDataHash(ucId, 'abTestGroup');

        const abTestGroupResVoList = await Bluebird.map(abTestGroupVoList, async (abTestGroupVo) => {
            const { id: abTestGroupId } = abTestGroupVo;
            // 更新的缓存数据
            const cacheAbTestGroupVo = cacheAbTestGroupVoHash[abTestGroupId] as AbTestGroupVO;

            // 返回线上数据和未发布的数据，以未发布数据为准
            let abTestGroupResVo: AbTestGroupResVO = _.assign({
                configGroup: null,
            }, abTestGroupVo, cacheAbTestGroupVo);

            const { configGroupId, nativeTmplConfGroupId } = abTestGroupVo;

            // 获取 ab 分组下的广告，常量， native模板配置
            const [
                adGroupResVoList,
                configGroupResVo,
                nativeTmplConfGroupResVo
            ] = await Promise.all([
                this.adInAb(abTestGroupId, ucId),
                this.configInAb(configGroupId, ucId),
                this.nativeTmplConfInAb(nativeTmplConfGroupId, ucId)
            ]);

            // 返回线上数据和未发布的数据，以未发布数据为准
            abTestGroupResVo = _.assign(
                abTestGroupResVo,
                {
                configGroup: configGroupResVo,
                }
            );

            if (!think.isEmpty(nativeTmplConfGroupResVo)) {
                abTestGroupResVo.nativeTmplConfGroup = nativeTmplConfGroupResVo;
            }

            if (!think.isEmpty(adGroupResVoList)) {
                abTestGroupResVo.adGroup = adGroupResVoList;
            }

            delete abTestGroupResVo.configGroupId;
            delete abTestGroupResVo.nativeTmplConfGroupId;
            delete abTestGroupResVo.createAt;
            delete abTestGroupResVo.updateAt;

            return abTestGroupResVo;
        });

        return this.success(abTestGroupResVoList);
    }

    /**
     * <br/>获取 ab 分组下常量组信息
     * @argument {string} configGroupId 常量组表 id
     * @returns {ConfigGroupResVO} ab 分组下的常量配置
     * @argument {string} creatorId 创建者 id
     */
    private async configInAb(configGroupId: string, creatorId: string) {
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        if (configGroupId) {
            const configGroupVo = await modelServer.getConfigGroup(configGroupId, creatorId);
            const configResVoList = await modelServer.getConfigList(configGroupId, creatorId);

            const configGroupResVo: ConfigGroupResVO = _.defaults({ configList: configResVoList }, configGroupVo);
            return configGroupResVo;
        }

        return null;
    }

    /**
     * <br/>获取 ab 分组下 native 模板信息
     * @argument {string} nativeTmplConfGroupId 应用下的 native 模板组 id
     * @returns {NativeTmplConfGroupResVO}  ab 分组下的应用下的 native 模板配置
     * @argument {string} creatorId 创建者 id
     */
    private async nativeTmplConfInAb(nativeTmplConfGroupId: string, creatorId: string) {
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        if (nativeTmplConfGroupId) {
            // 模板组数据
            const nativeTmplConfGroupVo =
                await modelServer.getNativeTmplConfGroup(nativeTmplConfGroupId, creatorId);

            // 模板数据
            const nativeTmplConfResVoList =
                await modelServer.getNativeTmplConfList(nativeTmplConfGroupId, creatorId);

            // 返回数据
            const nativeTmplConfGroupResVo: NativeTmplConfGroupResVO = _.defaults({
                nativeTmplConfList: nativeTmplConfResVoList
            }, nativeTmplConfGroupVo);

            return nativeTmplConfGroupResVo;
        }

        return null;
    }

    /**
     * <br/>获取 ab 分组下广告位信息
     * @argument {string} abTestGroupId ab 分组 id
     * @returns {AdGroupResVO[]} ab 分组下的广告位配置
     * @argument {string} creatorId 创建者 id
     */
    private async adInAb(abTestGroupId: string, creatorId: string) {
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const adGroupResVoList = await modelServer.getAdGroupListInAb(abTestGroupId, creatorId);
        return adGroupResVoList;

    }

    /**
     * <br/>向版本分组下创建默认 ab 分组
     * @argument {CreateDefaultAbTestGroupReqVO}
     * @returns {CreateDefaultAbTestGroupResVO}
     * @debugger yes
     */
    public async createDefaultAbTestGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const versionGroupId: string = this.post('id');

        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;

        const abTestGroupVo: AbTestGroupVO = {
            versionGroupId, active: 1, activeTime: undefined,
            name: 'default', begin: -1, end: -1, description: '默认组',
            creatorId: null, configGroupId: null, nativeTmplConfGroupId: null,
        };
        await abTestGroupModel.addVo(abTestGroupVo);

        this.success('created');
    }

    /**
     * <br/>向版本分组下创建 ab 分组
     * @argument {CreateAbTestGroupReqVO}
     * @returns {CreateAbTestGroupResVO}
     * @debugger yes
     */
    public async createAbTestGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const name: string = this.post('name');
        const versionGroupId: string = this.post('id');
        const description: string = this.post('description');
        let begin: number = this.post('begin');
        let end: number = this.post('end');
        const groupNum: number = this.post('groupNum');

        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        // 分组后缀，默认最大 26 个字母
        const nameList = [
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
        ];

        const abTestGroupVoList: AbTestGroupVO[] = [];
        const step = (end - begin + 1) / groupNum;
        // 分组左右均包含
        end = begin + step - 1;

        for (let i = 0; i < groupNum; i++) {
            const abTestGroupName = name + '_' + nameList[i];

            const abTestGroupVo: AbTestGroupVO = {
                name: abTestGroupName, begin, end, description, activeTime: undefined, active: 1,
                versionGroupId, creatorId: ucId, configGroupId: null, nativeTmplConfGroupId: null
            };

            abTestGroupVoList.push(abTestGroupVo);
            begin = end + 1;
            end += step;
        }

        think.logger.debug(`abTestGroupVoList: ${JSON.stringify(abTestGroupVoList)}`);

        const rows = (await abTestGroupModel.addList(abTestGroupVoList)).length;
        if (rows === groupNum) {
            this.success('created');
        } else {
            this.fail(TaleCode.DBFaild, 'create fail!!!');
        }

    }

    /**
     * <br/>测试结束
     * @argument {DeleteAdReqVO}
     * @returns {DeleteAdReqVO}
     * @debugger yes
     */
    public async deleteABTestAction() {
        const ucId: string = this.ctx.state.userId;
        const name: string = this.post('name');

        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        await abTestGroupModel.updateByName(ucId);

        this.success('deleted');
    }

    /**
     * <br/>向 ab 分组绑定常量组
     * @argument {BindConfigGroupReqVO}
     * @returns {BindConfigGroupResVO}
     * @debugger yes
     */
    public async bindConfigGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const abTestGroupId: string = this.post('id');
        const configGroupId: string = this.post('configGroupId');
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        const abTestGroupVo: AbTestGroupVO = {
            configGroupId, active: undefined, activeTime: undefined,
            name: undefined, begin: undefined, end: undefined,
            description: undefined, versionGroupId: undefined,
            nativeTmplConfGroupId: undefined, creatorId: undefined
        };

        try {
            await cacheServer.setCacheData(ucId, 'abTestGroup', abTestGroupId, abTestGroupVo);
            this.success('binded');

        } catch (e) {
            think.logger.debug(e);
            this.fail(TaleCode.DBFaild, 'bind fail!!!');
        }
    }

    /**
     * <br/>获取常量组列表
     * @argument {ConfigGroupListReqVO}
     * @returns {ConfigGroupListResVO}
     * @debugger yes
     */
    public async configGroupListAction() {
        const ucId: string = this.ctx.state.user.id;
        const productId: string = this.post('id');
        const type: number = this.post('type');
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const configGroupResVoList = await modelServer.getConfigGroupList(productId, type, ucId);

        return this.success(configGroupResVoList);
    }

    /**
     * <br/>获取常量组下常量列表
     * @argument {ConfigListReqVO}
     * @returns {ConfigListResVO}
     * @debugger yes
     */
    public async configListAction() {
        const ucId: string = this.ctx.state.user.id;
        const configGroupId: string = this.post('id');
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const configResVoList = await modelServer.getConfigList(configGroupId, ucId);
        return this.success(configResVoList);
    }

    /**
     * <br/>创建常量组
     * @argument {CreateConfigGroupReqVO}
     * @returns {CreateConfigGroupResVO}
     * @debugger yes
     */
    public async createConfigGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const name: string = this.post('name');
        const dependentId: string = this.post('dependentId');
        const productId: string = this.post('id');
        const description: string = this.post('description');
        const type: number = this.post('type');
        const active: number = this.post('active');

        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;
        const configGroupVo: ConfigGroupVO = {
            name, description, type, active,
            dependentId, productId, creatorId: ucId
        };
        await configGroupModel.addConfigGroup(configGroupVo);

        this.success('created');
    }

    /**
     * <br/>复制常量组
     * @argument {CopyConfigGroupReqVO}
     * @returns {CopyConfigGroupResVO}
     * @debugger yes
     */
    public async copyConfigGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const name: string = this.post('name');
        const copyId: string = this.post('id');
        const description: string = this.post('description');
        const active: number = this.post('active');

        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;
        const configModel = this.taleModel('config', 'advertisement') as ConfigModel;

        const [
            copyedConfigGroupVo, copyedConfigVoList
        ] = await Promise.all([
            configGroupModel.getConfigGroup(copyId, ucId),
            configModel.getList(copyId, ucId)
        ]);

        const {
            dependentId, productId, type
        } = copyedConfigGroupVo;

        const configGroupVo: ConfigGroupVO = {
            name, description, type, active,
            dependentId, productId, creatorId: ucId
        };
        const configGroupId = await configGroupModel.addConfigGroup(configGroupVo);

        const configVoList = _.map(copyedConfigVoList, (copyedConfigVo) => {

            const configVo: ConfigVO = _.omit(copyedConfigVo, [
                'id', 'createAt', 'updateAt', 'configGroupId'
            ]);
            configVo.configGroupId = configGroupId;
            configVo.creatorId = ucId;
            return configVo;

        });
        const rows = (await configModel.addList(configVoList)).length;

        if (rows === copyedConfigVoList.length) {
            return this.success('copyed');
        } else {
            this.fail(TaleCode.DBFaild, 'copy fail!!!');
        }
    }

    /**
     * <br/>更新常量组
     * @argument {UpdateConfigGroupReqVO}
     * @returns {UpdateConfigGroupResVO}
     * @debugger yes
     */
    public async updateConfigGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const name: string = this.post('name');
        const id: string = this.post('id');
        const dependentId: string = this.post('dependentId');
        const description: string = this.post('description');
        const active: number = this.post('active');
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        const configGroupVo: ConfigGroupVO = {
            name, description, dependentId, active,
            type: undefined, productId: undefined, creatorId: undefined
        };

        try {
            await cacheServer.setCacheData(ucId, 'configGroup', id, configGroupVo);
            this.success('updated');

        } catch (e) {
            think.logger.debug(e);
            this.fail(TaleCode.DBFaild, 'update fail!!!');
        }
    }

    /**
     * <br/>更新广告常量
     * @argument {UpdateAdConfigReqVO}
     * @returns {UpdateAdConfigResVO}
     * @debugger yes
     */
    public async updateAdConfigAction() {
        const ucId: string = this.ctx.state.userId;
        const configGroupId: string = this.post('id');
        const key: string = this.post('key');
        const value: string = this.post('value');
        const description: string = this.post('description');
        const active: number = this.post('active');
        const configModel = this.taleModel('config', 'advertisement') as ConfigModel;
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        const configVo = await configModel.getByGroupAndKey(key, configGroupId, ucId);
        think.logger.debug(`configVo: ${JSON.stringify(configVo)}`);

        const { id } = configVo;

        const updateConfigVo: ConfigVO = {
            key, value, description, active,
            configGroupId, activeTime: undefined, creatorId: undefined
        };

        try {
            // 数据库不存在，怎插入，同事创建者暂时设置为当前操作用户
            if (_.isEmpty(configVo)) {
                updateConfigVo.creatorId = ucId;
                await configModel.addConfig(updateConfigVo);

                // 存在加入缓存
            } else {
                await cacheServer.setCacheData(ucId, 'config', id, updateConfigVo);

            }
            this.success('updated');

        } catch (e) {
            think.logger.debug(e);
            this.fail(TaleCode.DBFaild, 'update fail!!!');
        }
    }

    /**
     * <br/>创建游戏常量
     * @argument {CreateConfigReqVO}
     * @returns {CreateConfigResVO}
     * @debugger yes
     */
    public async createConfigAction() {
        const ucId: string = this.ctx.state.userId;
        const configGroupId: string = this.post('id');
        const key: string = this.post('key');
        const value: string = this.post('value');
        const description: string = this.post('description');
        const active: number = this.post('active');

        const configModel = this.taleModel('config', 'advertisement') as ConfigModel;

        const configVo: ConfigVO = {
            configGroupId, creatorId: ucId,
            key, value, description,
            active, activeTime: null
        };
        await configModel.addConfig(configVo);

        this.success('created');
    }

    /**
     * <br/>更新游戏常量
     * @argument {UpdateConfigReqVO}
     * @returns {UpdateConfigResVO}
     * @debugger yes
     */
    public async updateConfigAction() {
        const ucId: string = this.ctx.state.userId;
        const id: string = this.post('id');
        const key: string = this.post('key');
        const value: string = this.post('value');
        const description: string = this.post('description');
        const active: number = this.post('active');
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        const configVo: ConfigVO = {
            configGroupId: undefined, creatorId: undefined,
            key, value, description,
            active, activeTime: undefined
        };
        if (active === 0) {
            const now = moment().format('YYYY-MM-DD HH:mm:ss');
            configVo.activeTime = now;
        }

        try {
            await cacheServer.setCacheData(ucId, 'config', id, configVo);
            this.success('updated');

        } catch (e) {
            think.logger.debug(e);
            this.fail(TaleCode.DBFaild, 'update fail!!!');
        }
    }

    /**
     * <br/>删除常量
     * @argument {DeleteConfigReqVO}
     * @returns {DeleteConfigResVO}
     * @debugger yes
     */
    // public async deleteConfigAction() {
    //     const ucId: string = this.ctx.state.userId;
    //     const id: string = this.post('id');

    //     const configModel = this.taleModel('config', 'advertisement') as ConfigModel;

    //     const rows = await configModel.delConfig(id);
    //     if (rows === 1) {
    //         this.success('deleted');
    //     } else {
    //         this.fail(TaleCode.DBFaild, 'delete fail!!!');
    //     }
    // }

    /**
     * <br/>向 ab 分组绑定 native 组
     * @argument {BindNativeTmplConfGroupReqVO}
     * @returns {BindNativeTmplConfGroupResVO}
     * @debugger yes
     */
    public async bindNativeTmplConfGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const abTestGroupId: string = this.post('id');
        const nativeTmplConfGroupId: string = this.post('nativeTmplConfGroupId');
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        const abTestGroupVo: AbTestGroupVO = {
            nativeTmplConfGroupId, active: undefined, activeTime: undefined,
            name: undefined, begin: undefined, end: undefined, description: undefined,
            versionGroupId: undefined, configGroupId: undefined, creatorId: undefined
        };
        try {
            await cacheServer.setCacheData(ucId, 'abTestGroup', abTestGroupId, abTestGroupVo);
            this.success('binded');

        } catch (e) {
            think.logger.debug(e);
            this.fail(TaleCode.DBFaild, 'bind fail!!!');
        }
    }

    /**
     * <br/>获取应用 native 模板组列表
     * @argument {NativeTmplConfGroupListReqVO}
     * @returns {NativeTmplConfGroupListResVO}
     * @debugger yes
     */
    public async nativeTmplConfGroupListAction() {
        const ucId: string = this.ctx.state.userId;
        const productId: string = this.post('id');
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const nativeTmplConfGroupResVoList = await modelServer.getNativeTmplConfGroupList(productId, ucId);
        return this.success(nativeTmplConfGroupResVoList);
    }

    /**
     * <br/>获取应用 native 模板组下模板列表
     * @argument {NativeTmplConfListReqVO}
     * @returns {NativeTmplConfListResVO}
     * @debugger yes
     */
    public async nativeTmplConfListAction() {
        const ucId: string = this.ctx.state.userId;
        const nativeTmplConfGroupId: string = this.post('id');
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const nativeTmplConfResVoList = await modelServer.getNativeTmplConfList(nativeTmplConfGroupId, ucId);
        return this.success(nativeTmplConfResVoList);
    }

    /**
     * <br/>创建应用 native 模板配置组
     * @argument {CreateNativeTmplConfGroupReqVO}
     * @returns {CreateNativeTmplConfGroupResVO}
     * @debugger yes
     */
    public async createNativeTmplConfGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const name: string = this.post('name');
        const productId: string = this.post('id');
        const description: string = this.post('description');
        const active: number = this.post('active');

        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;

        const nativeTmplConfGroupVo: NativeTmplConfGroupVO = {
            name, description, productId, active, creatorId: ucId
        };
        await nativeTmplConfGroupModel.addNativeTmplConfGroup(nativeTmplConfGroupVo);

        this.success('created');
    }

    /**
     * <br/>复制应用 native 模板配置组
     * @argument {CopyNativeTmplConfGroupReqVO}
     * @returns {CopyNativeTmplConfGroupResVO}
     * @debugger yes
     */
    public async copyNativeTmplConfGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const name: string = this.post('name');
        const copyId: string = this.post('id');
        const description: string = this.post('description');
        const active: number = this.post('active');

        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;
        const nativeTmplConfModel = this.taleModel('nativeTmplConf', 'advertisement') as NativeTmplConfModel;

        const [
            { productId }, copyedNativeTmplConfVoList
        ] = await Promise.all([
            nativeTmplConfGroupModel.getNativeTmplConfGroup(copyId, ucId),
            nativeTmplConfModel.getList(copyId, ucId)
        ]);

        const nativeTmplConfGroupVo: NativeTmplConfGroupVO = {
            name, description, productId, active, creatorId: ucId
        };
        const nativeTmplConfGroupId = await nativeTmplConfGroupModel.addNativeTmplConfGroup(nativeTmplConfGroupVo);

        const nativeTmplConfVoList = await Bluebird.map(copyedNativeTmplConfVoList, async (copyedNativeTmplConfVo) => {
            const nativeTmplConfVo: NativeTmplConfVO = _.omit(copyedNativeTmplConfVo, [
                'id', 'createAt', 'updateAt', 'nativeTmplConfGroupId'
            ]);
            nativeTmplConfVo.nativeTmplConfGroupId = nativeTmplConfGroupId;
            nativeTmplConfVo.creatorId = ucId;
            return nativeTmplConfVo;

        });
        const rows = (await nativeTmplConfModel.addList(nativeTmplConfVoList)).length;

        if (rows === copyedNativeTmplConfVoList.length) {
            this.success('copyed');
        } else {
            this.fail(TaleCode.DBFaild, 'copy fail!!!');
        }
    }

    /**
     * <br/>更新应用 native 模板组
     * @argument {UpdateNativeTmplConfGroupReqVO}
     * @returns {UpdateNativeTmplConfGroupResVO}
     * @debugger yes
     */
    public async updateNativeTmplConfGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const name: string = this.post('name');
        const id: string = this.post('id');
        const description: string = this.post('description');
        const active: number = this.post('active');
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        const nativeTmplConfGroupVo: NativeTmplConfGroupVO = {
            name, description, active, productId: undefined, creatorId: undefined
        };

        try {
            await cacheServer.setCacheData(ucId, 'nativeTmplConfGroup', id, nativeTmplConfGroupVo);
            this.success('updated');

        } catch (e) {
            think.logger.debug(e);
            this.fail(TaleCode.DBFaild, 'update fail!!!');
        }
    }

    /**
     * <br/>创建应用 native 模板配置
     * @argument {CreateNativeTmplConfReqVO}
     * @returns {CreateNativeTmplConfResVO}
     * @debugger yes
     */
    public async createNativeTmplConfAction() {
        const ucId: string = this.ctx.state.userId;
        const nativeTmplConfGroupId: string = this.post('id');
        const nativeTmplId: string = this.post('nativeTmplId');
        const weight: number = this.post('weight');
        const clickArea: number = this.post('clickArea');
        const isFull: number = this.post('isFull');
        const active: number = this.post('active');
        const nativeTmplConfModel = this.taleModel('nativeTmplConf', 'advertisement') as NativeTmplConfModel;

        const nativeTmplConfVo: NativeTmplConfVO = {
            nativeTmplConfGroupId, nativeTmplId, creatorId: ucId,
            weight, clickArea, isFull,
            active, activeTime: undefined
        };
        await nativeTmplConfModel.addNativeTmplConf(nativeTmplConfVo);
        this.success('created');
    }

    /**
     * <br/>更新应用 native 模板
     * @argument {UpdateNativeTmplConfReqVO}
     * @returns {UpdateNativeTmplConfResVO}
     * @debugger yes
     */
    public async updateNativeTmplConfAction() {
        const ucId: string = this.ctx.state.userId;
        const id: string = this.post('id');
        const nativeTmplConfGroupId: string = this.post('nativeTmplConfGroupId');
        const weight: number = this.post('weight');
        const clickArea: number = this.post('clickArea');
        const isFull: number = this.post('isFull');
        const active: number = this.post('active');
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        const nativeTmplConfVo: NativeTmplConfVO = {
            nativeTmplConfGroupId, nativeTmplId: undefined, activeTime: undefined, creatorId: undefined,
            weight, clickArea, isFull, active
        };

        if (active === 0) {
            const now = moment().format('YYYY-MM-DD HH:mm:ss');
            nativeTmplConfVo.activeTime = now;
        }

        try {
            await cacheServer.setCacheData(ucId, 'nativeTmplConf', id, nativeTmplConfVo);
            this.success('updated');

        } catch (e) {
            think.logger.debug(e);
            this.fail(TaleCode.DBFaild, 'update fail!!!');
        }
    }

    /**
     * <br/>删除应用 native 模板
     * @argument {DeleteNativeTmplConfReqVO}
     * @returns {DeleteNativeTmplConfResVO}
     * @debugger yes
     */
    // public async deleteNativeTmplConfAction() {
    //     const ucId: string = this.ctx.state.userId;
    //     const id: string = this.post('id');
    //     const nativeTmplConfModel = this.taleModel('nativeTmplConf', 'advertisement') as NativeTmplConfModel;

    //     const rows = await nativeTmplConfModel.delNativeTmplConf(id);
    //     if (rows === 1) {
    //         this.success('deleted');
    //     } else {
    //         this.fail(TaleCode.DBFaild, 'delete fail!!!');
    //     }
    // }

    /**
     * <br/>向 ab 分组绑定广告组
     * @argument {BindAdGroupReqVO}
     * @returns {BindAdGroupResVO}
     * @debugger yes
     */
    public async bindAdGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const abTestGroupId: string = this.post('id');
        const adGroupId: string = this.post('adGroupId');
        const place: string = this.post('place');
        const active: number = this.post('active');
        const abTestMapModel = this.taleModel('abTestMap', 'advertisement') as AbTestMapModel;
        const adTypeModel = this.taleModel('adType', 'advertisement') as AdTypeModel;
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        const { name: type } = await adTypeModel.getVo(place);

        const updateAbTestMapVo: AbTestMapVO = {
            place, type, abTestGroupId, adGroupId, creatorId: undefined, active
        };

        try {
            const abTestMapVo = await abTestMapModel.getVo(abTestGroupId, place, ucId);

            if (_.isEmpty(abTestMapVo)) {
                updateAbTestMapVo.creatorId = ucId;
                await abTestMapModel.addVo(updateAbTestMapVo);

            } else {
                const id = abTestMapVo.id;
                await cacheServer.setCacheData(ucId, 'abTestMap', id, updateAbTestMapVo);

            }
            this.success('binded');

        } catch (e) {
            think.logger.debug(e);
            this.fail(TaleCode.DBFaild, 'bind fail!!!');
        }
    }

    /**
     * <br/>删除 ab 分组下广告位
     * @argument {UnbindAdGroupReqVO}
     * @returns {UnbindAdGroupResVO}
     * @debugger yes
     */
    // public async unbindAdGroupAction() {
    //     const ucId: string = this.ctx.state.userId;
    //     const id: string = this.post('id');
    //     const place: string = this.post('place');
    //     const abTestMapModel = this.taleModel('abTestMap', 'advertisement') as AbTestMapModel;

    //     const rows = await abTestMapModel.delVo(id, place);
    //     if (rows === 1) {
    //         this.success('unbinded');
    //     } else {
    //         this.fail(TaleCode.DBFaild, 'unbind fail!!!');
    //     }
    // }

    /**
     * <br/>全量 ab 分组下广告位到默认组
     * @argument {CompletePlaceReqVO}
     * @returns {CompletePlaceResVO}
     * @debugger yes
     */
    public async completePlaceAction() {
        const ucId: string = this.ctx.state.userId;
        const id: string = this.post('id');
        const place: string = this.post('place');
        const abTestMapModel = this.taleModel('abTestMap', 'advertisement') as AbTestMapModel;
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        try {
            const [
                { versionGroupId },
                { id: abTestMapId, adGroupId, type }
            ] = await Promise.all([
                abTestGroupModel.getVo(id, ucId),
                abTestMapModel.getVo(id, place, ucId)
            ]);

            const { id: defaultId } = await abTestGroupModel.getDefault(versionGroupId, ucId);
            const defaultAbTestMapVo = await abTestMapModel.getVo(defaultId, place, ucId);

            const updateDefaultAbTestMapVo: AbTestMapVO = {
                abTestGroupId: defaultId, creatorId: undefined, active: 1,
                place, type, adGroupId
            };
            const updateAbTestMapVo: AbTestMapVO = {
                abTestGroupId: id, creatorId: undefined, active: 0,
                place, type, adGroupId
            };

            if (_.isEmpty(defaultAbTestMapVo)) {
                updateDefaultAbTestMapVo.creatorId = ucId;
                await abTestMapModel.addVo(updateDefaultAbTestMapVo);

            } else {
                await cacheServer.setCacheData(ucId, 'abTestMap', defaultAbTestMapVo.id, updateDefaultAbTestMapVo);
                await cacheServer.setCacheData(ucId, 'abTestMap', abTestMapId, updateAbTestMapVo);
            }
            this.success('completed');

        } catch (e) {
            think.logger.debug(e);
            this.fail(TaleCode.DBFaild, 'complete place fail!!!');
        }
    }

    /**
     * <br/>获取广告组列表
     * @argument {AdGroupListReqVO}
     * @returns {AdGroupListResVO}
     * @debugger yes
     */
    public async adGroupListAction() {
        const ucId: string = this.ctx.state.userId;
        const productId: string = this.post('id');
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const adGroupResVoList = await modelServer.getAdGroupList(productId, ucId);
        return this.success(adGroupResVoList);
    }

    /**
     * <br/>创建广告组
     * @argument {CreateAdGroupReqVO}
     * @returns {CreateAdGroupResVO}
     * @debugger yes
     */
    public async createAdGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const name: string = this.post('name');
        const productId: string = this.post('id');
        const adTypeId: string = this.post('adTypeId');
        const description: string = this.post('description');
        const active: number = this.post('active');
        const adGroupModel = this.taleModel('adGroup', 'advertisement') as AdGroupModel;

        const adGroupVo: AdGroupVO = {
            name, description, creatorId: ucId,
            adTypeId, productId, active
        };

        await adGroupModel.addVo(adGroupVo);
        this.success('created');
    }

    /**
     * <br/>复制广告组
     * @argument {CopyAdGroupReqVO}
     * @returns {CopyAdGroupResVO}
     * @debugger yes
     */
    public async copyAdGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const copyId: string = this.post('id');
        const name: string = this.post('name');
        const description: string = this.post('description');
        const active: number = this.post('active');

        const adGroupModel = this.taleModel('adGroup', 'advertisement') as AdGroupModel;
        const adModel = this.taleModel('ad', 'advertisement') as AdModel;

        const [
            copyedAdGroupVo, copyedAdVoList
        ] = await Promise.all([
            adGroupModel.getVo(copyId, ucId),
            adModel.getListByAdGroup(copyId, ucId)
        ]);

        const { productId, adTypeId } = copyedAdGroupVo;

        const adGroupVo: AdGroupVO = {
            name, description, creatorId: ucId,
            adTypeId, productId, active
        };
        const adGroupId = await adGroupModel.addVo(adGroupVo);

        const adVoList = _.map(copyedAdVoList, (copyedAdVo) => {
            const adVo: AdVO = _.omit(copyedAdVo, [
                'id', 'createAt', 'updateAt', 'adGroupId'
            ]);

            adVo.adGroupId = adGroupId;
            adVo.creatorId = ucId;
            return adVo;
        });

        think.logger.debug(`adVoList: ${JSON.stringify(adVoList)}`);
        const rows = (await adModel.addList(adVoList)).length;

        if (rows === copyedAdVoList.length) {
            this.success('copyed');
        } else {
            this.fail(TaleCode.DBFaild, 'copy fail!!!');
        }
    }

    /**
     * <br/>更新广告组
     * @argument {UpdateAdGroupReqVO}
     * @returns {UpdateAdGroupResVO}
     * @debugger yes
     */
    public async updateAdGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const id: string = this.post('id');
        const name: string = this.post('name');
        const description: string = this.post('description');
        const active: number = this.post('active');
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        const adGroupVo: AdGroupVO = {
            name, description,
            creatorId: undefined, adTypeId: undefined, productId: undefined, active
        };

        try {
            await cacheServer.setCacheData(ucId, 'adGroup', id, adGroupVo);
            this.success('updated');

        } catch (e) {
            think.logger.debug(e);
            this.fail(TaleCode.DBFaild, 'update fail!!!');
        }
    }

    /**
     * <br/>获取广告列表
     * @argument {AdListReqVO}
     * @returns {AdListResVO}
     * @debugger yes
     */
    public async adListAction() {
        const ucId: string = this.ctx.state.userId;
        const productId: string = this.post('id');
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const adResVoList = await modelServer.getAdList(productId, ucId);
        return this.success(adResVoList);
    }

    /**
     * <br/>获取广告组下广告列表
     * @argument {AdListInAdGroupReqVO}
     * @returns {AdListInAdGroupResVO}
     * @debugger yes
     */
    public async adListInAdGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const adGroupId: string = this.post('id');
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const adResVoList = await modelServer.getAdListInAdGroup(adGroupId, ucId);
        return this.success(adResVoList);
    }

    /**
     * <br/>创建广告
     * @argument {CreateAdReqVO}
     * @returns {CreateAdResVO}
     * @debugger yes
     */
    public async createAdAction() {
        const ucId: string = this.ctx.state.userId;
        const adGroupId: string = this.post('id');
        const adChannelId: string = this.post('adChannelId');
        const name: string = this.post('name');
        const placementID: string = this.post('placementID');
        const ecpm: number = this.post('ecpm');
        const bidding: number = this.post('bidding');
        const active: number = this.post('active');

        const adGroupModel = this.taleModel('adGroup', 'advertisement') as AdGroupModel;
        const adModel = this.taleModel('ad', 'advertisement') as AdModel;

        const { adTypeId, productId } = await adGroupModel.getVo(adGroupId, ucId);

        const adVo: AdVO = {
            productId, adGroupId, adChannelId, adTypeId,
            name, placementID, ecpm, bidding, creatorId: ucId,
            active, activeTime: undefined,
            loader: undefined, subloader: undefined, interval: undefined, weight: undefined
        };
        await adModel.addVo(adVo);

        this.success('created');
    }

    /**
     * <br/>更新广告
     * @argument {UpdateAdReqVO}
     * @returns {UpdateAdResVO}
     * @debugger yes
     */
    public async updateAdAction() {
        const ucId: string = this.ctx.state.userId;
        const id: string = this.post('id');
        const name: string = this.post('name');
        const placementID: string = this.post('placementID');
        const loader: string = this.post('loader');
        const subloader: string = this.post('subloader');
        const ecpm: number = this.post('ecpm');
        const interval: number = this.post('interval');
        const weight: number = this.post('weight');
        const bidding: number = this.post('bidding');
        const active: number = this.post('active');
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        const adVo: AdVO = {
            productId: undefined, adGroupId: undefined, adChannelId: undefined, adTypeId: undefined,
            activeTime: undefined, creatorId: null,
            placementID, name, ecpm, interval, subloader, loader, weight, bidding,
            active
        };

        if (active === 0) {
            const now = moment().format('YYYY-MM-DD HH:mm:ss');
            adVo.activeTime = now;
        }

        try {
            await cacheServer.setCacheData(ucId, 'ad', id, adVo);
            this.success('updated');

        } catch (e) {
            think.logger.debug(e);
            this.fail(TaleCode.DBFaild, 'update fail!!!');
        }
    }

    /**
     * <br/>删除广告组下广告
     * @argument {DeleteAdReqVO}
     * @returns {DeleteAdReqVO}
     * @debugger yes
     */
    // public async deleteAdAction() {
    //     const ucId: string = this.ctx.state.userId;
    //     const id: string = this.post('id');

    //     const adModel = this.taleModel('ad', 'advertisement') as AdModel;
    //     const rows = await adModel.delVo(id);

    //     if (rows === 1) {
    //         this.success('deleted');
    //     } else {
    //         this.fail(TaleCode.DBFaild, 'delete fail!!!');
    //     }
    // }

}