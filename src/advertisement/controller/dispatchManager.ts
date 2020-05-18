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
import NationModel from '../model/nation';
import NationDefineModel from '../model/nationDefine';
import AbTestGroupModel from '../model/abTestGroup';
import AbTestMapModel from '../model/abTestMap';
import ConfigGroupModel from '../model/configGroup';
import ConfigModel from '../model/config';
import NativeTmplConfGroupModel from '../model/nativeTmplConfGroup';
import NativeTmplConfModel from '../model/nativeTmplConf';
import AdGroupModel from '../model/adGroup';
import AdModel from '../model/ad';

import {
    VersionGroupVO, AbTestGroupVO, ConfigGroupVO, ConfigVO, NativeTmplConfGroupVO, NativeTmplConfVO,
    AbTestMapVO, AdGroupVO, AdVO, ConfigGroupResVO, NativeTmplConfResVO, NativeTmplConfGroupResVO,
    AdResVO, AbTestGroupResVO, NationDefineVO
} from '../defines';

import {
    VersionGroupListReqVO, VersionGroupListResVO, CreateVersionGroupReqVO, CreateVersionGroupResVO,
    UpdateVersionGroupReqVO, UpdateVersionGroupResVO, AbTestGroupListReqVO, AbTestGroupListResVO,
    CreateAbTestGroupReqVO, CreateAbTestGroupResVO, BindConfigGroupReqVO, BindConfigGroupResVO,
    ConfigGroupListReqVO, ConfigGroupListResVO, ConfigListReqVO, ConfigListResVO,
    CreateConfigGroupReqVO, CreateConfigGroupResVO, UpdateConfigGroupReqVO, UpdateConfigGroupResVO,
    CreateConfigReqVO, CreateConfigResVO, UpdateConfigReqVO, UpdateConfigResVO, DeleteConfigReqVO, DeleteConfigResVO,
    BindNativeTmplConfGroupReqVO, BindNativeTmplConfGroupResVO, NativeTmplConfGroupListReqVO,
    NativeTmplConfGroupListResVO, NativeTmplConfListReqVO, NativeTmplConfListResVO, CreateNativeTmplConfGroupReqVO,
    CreateNativeTmplConfGroupResVO, UpdateNativeTmplConfGroupReqVO, UpdateNativeTmplConfGroupResVO,
    CreateNativeTmplConfReqVO, CreateNativeTmplConfResVO, CopyNativeTmplConfGroupReqVO,
    CopyNativeTmplConfGroupResVO, UpdateNativeTmplConfReqVO, UpdateNativeTmplConfResVO,
    DeleteNativeTmplConfReqVO, DeleteNativeTmplConfResVO, BindAdGroupReqVO, BindAdGroupResVO,
    UnbindAdGroupReqVO, UnbindAdGroupResVO, AdGroupListReqVO, AdGroupListResVO,
    CreateAdGroupReqVO, CreateAdGroupResVO, UpdateAdGroupReqVO, UpdateAdGroupResVO,
    AdListReqVO, AdListResVO, AdListInAdGroupReqVO, AdListInAdGroupResVO, CreateAdReqVO, CreateAdResVO,
    CopyAdGroupReqVO, CopyAdGroupResVO, UpdateAdReqVO, UpdateAdResVO, NationDefineListResVO,
    DeleteAdReqVO, DeleteAdResVO, CopyConfigGroupReqVO, CopyConfigGroupResVO, CreateNativeTmplConfListResVO,
    CopyVersionGroupReqVO, CopyVersionGroupResVO, CompletePlaceReqVO, CompletePlaceResVO,
    CreateDefaultAbTestGroupReqVO, CreateDefaultAbTestGroupResVO, UpdateAdConfigReqVO, UpdateAdConfigResVO,
} from '../interface';

export default class DispatchManagerController extends BaseController {

    /**
     * <br/>获取版本分组控制列表信息
     * @argument {VersionGroupListReqVO}
     * @returns {VersionGroupListResVO}
     * @debugger yes
     */
    public async versionGroupListAction() {
        const ucId: string = this.ctx.state.userId || '';
        const productId: string = this.post('id');
        const type: number = this.post('type');
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const versionGroupResVoList = await modelServer.getVersionGroupList(productId, type);
        return this.success(versionGroupResVoList);
    }

    /**
     * <br/>获取国家代码定义列表
     * @returns {NationDefineListResVO}
     * @debugger yes
     */
    public async nationListAction() {
        const ucId: string = this.ctx.state.userId || '';
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
    public async updateNationListAction() {
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
        const ucId: string = this.ctx.state.userId || '';
        const productId: string = this.post('id');
        const name: string = this.post('name');
        const begin: number = this.post('begin');
        const description: string = this.post('description');
        const codeList: string[] = this.post('codeList') || [];
        const type: number = this.post('type');
        const include: number = this.post('include');
        const active: number = this.post('active');

        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const nationModel = this.taleModel('nation', 'advertisement') as NationModel;
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;

        const versionGroupVo: VersionGroupVO = {
            name,
            begin,
            description,
            active,
            type,
            productId
        };
        const versionGroupId = await versionGroupModel.addVersionGroup(versionGroupVo);
        const rows = (await nationModel.updateList(versionGroupId, codeList, include)).length;

        const abTestGroupVo: AbTestGroupVO = {
            versionGroupId,
            name: 'default', begin: -1, end: -1, description: '默认组',
            configGroupId: null, nativeTmplConfGroupId: null,
        };
        await abTestGroupModel.addAbTestGroup(abTestGroupVo);

        if (rows === codeList.length) {
            this.success('created');
        } else {
            this.fail(TaleCode.DBFaild, 'create fail!!!');
        }
    }

    /**
     * <br/>复制版本分组控制
     * @argument {CopyVersionGroupReqVO}
     * @returns {CopyVersionGroupResVO}
     * @debugger yes
     */
    public async copyVersionGroupAction() {
        const ucId: string = this.ctx.state.userId || '';
        const copyId: string = this.post('id');
        const name: string = this.post('name');
        const begin: number = this.post('begin');
        const description: string = this.post('description');
        const codeList: string[] = this.post('codeList') || [];
        const include: number = this.post('include');
        const active: number = this.post('active');

        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const nationModel = this.taleModel('nation', 'advertisement') as NationModel;
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const abTestMapModel = this.taleModel('abTestMap', 'advertisement') as AbTestMapModel;

        // 被复制组的默认配置
        const [
            { productId, type },
            {
                id: copyedAbTestGroupId, description: AbTestGroupDescription,
                configGroupId, nativeTmplConfGroupId
            }
        ] = await Promise.all([
            versionGroupModel.getVersionGroup(copyId),
            abTestGroupModel.getDefault(copyId)
        ]);

        // 先创建版本分组和对应的国家代码表
        const versionGroupVo: VersionGroupVO = {
            name,
            begin,
            description,
            active,
            type,
            productId
        };
        const versionGroupId = await versionGroupModel.addVersionGroup(versionGroupVo);
        const rows = (await nationModel.updateList(versionGroupId, codeList, include)).length;

        // 再创建版本分组下默认 ab 测试
        const defaultAbTestGroupVo: AbTestGroupVO = {
            name: 'default', begin: -1, end: -1, description: AbTestGroupDescription,
            nativeTmplConfGroupId, configGroupId, versionGroupId
        };
        const defaultAbTestGroupId = await abTestGroupModel.addAbTestGroup(defaultAbTestGroupVo);

        // 再创建版本分组下默认 ab 测试下广告测试
        const copyedAbTestMapVoList = await abTestMapModel.getList(copyedAbTestGroupId);
        const defaultAbTestMapVoList = _.map(copyedAbTestMapVoList, (copyedAbTestMapVo) => {
            const { place, adGroupId } = copyedAbTestMapVo;

            const defaultAbTestMapVo: AbTestMapVO = {
                place, adGroupId, abTestGroupId: defaultAbTestGroupId
            };
            return defaultAbTestMapVo;
        });
        const abTestMapRows = (await abTestMapModel.addList(defaultAbTestMapVoList)).length;

        // 比较创建成功与否
        if (rows === codeList.length && abTestMapRows === copyedAbTestMapVoList.length) {
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
        const ucId: string = this.ctx.state.userId || '';
        const id: string = this.post('id');
        const name: string = this.post('name');
        const begin: number = this.post('begin');
        const description: string = this.post('description');
        const codeList: string[] = this.post('codeList');
        const include: number = this.post('include');
        const active: number = this.post('action');

        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const nationModel = this.taleModel('nation', 'advertisement') as NationModel;

        const versionGroupVo: VersionGroupVO = {
            name, begin, description,
            active,
            type: undefined, productId: undefined
        };
        const list = await Promise.all([
            versionGroupModel.updateVersionGroup(id, versionGroupVo),
            nationModel.updateList(id, codeList, include)
        ]);

        if (list[0] === 0 || (codeList.length !== list[1].length)) {
            this.fail(TaleCode.DBFaild, 'update fail!!!');
        } else {
            this.success('updated');
        }
    }

    /**
     * <br/>获取版本分组下 ab 分组列表
     * @argument {AbTestGroupListReqVO}
     * @returns {AbTestGroupListResVO}
     * @debugger yes
     */
    public async abTestGroupListAction() {
        const versionGroupId: string = this.post('id');
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;

        const abTestGroupVoList = await abTestGroupModel.getList(versionGroupId);

        const abTestGroupResVoList = await Bluebird.map(abTestGroupVoList, async (abTestGroupVo) => {

            const abTestGroupId: string = abTestGroupVo.id;
            const {
                configGroupId, nativeTmplConfGroupId
            } = await abTestGroupModel.getAbTestGroup(abTestGroupId);

            // 获取 ab 分组下的广告，常量， native模板配置
            const [
                adGroupResVoList,
                configGroupResVo,
                nativeTmplConfGroupResVo
            ] = await Promise.all([
                this.adInAb(abTestGroupId),
                this.configInAb(configGroupId),
                this.nativeTmplConfInAb(nativeTmplConfGroupId)
            ]);
            delete abTestGroupVo.configGroupId;
            delete abTestGroupVo.nativeTmplConfGroupId;

            const abTestGroupResVo: AbTestGroupResVO = _.defaults({
                configGroup: configGroupResVo,
            }, abTestGroupVo);

            if (!think.isEmpty(nativeTmplConfGroupResVo)) {
                abTestGroupResVo.nativeTmplConfGroup = nativeTmplConfGroupResVo;
            }

            if (!think.isEmpty(adGroupResVoList)) {
                abTestGroupResVo.adGroup = adGroupResVoList;
            }

            return abTestGroupResVo;
        });

        return this.success(abTestGroupResVoList);
    }

    /**
     * <br/>获取 ab 分组下常量组信息
     * @argument {string} configGroupId 常量组表 id
     * @returns {ConfigGroupResVO} ab 分组下的常量配置
     */
    private async configInAb(configGroupId: string) {
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        if (configGroupId) {
            const configGroupVo = await modelServer.getConfigGroup(configGroupId);
            const configResVoList = await modelServer.getConfigList(configGroupVo.id);

            const configGroupResVo: ConfigGroupResVO = _.defaults({ configList: configResVoList }, configGroupVo);
            return configGroupResVo;
        }

        return null;
    }

    /**
     * <br/>获取 ab 分组下 native 模板信息
     * @argument {string} nativeTmplConfGroupId 应用下的 native 模板组 id
     * @returns {NativeTmplConfGroupResVO}  ab 分组下的应用下的 native 模板配置
     */
    private async nativeTmplConfInAb(nativeTmplConfGroupId: string) {
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        if (nativeTmplConfGroupId) {
            const nativeTmplConfGroupVo = await modelServer.getNativeTmplConfGroup(nativeTmplConfGroupId);
            const { productId } = nativeTmplConfGroupVo;
            const nativeTmplConfResVoList = await modelServer.getNativeTmplConfList(nativeTmplConfGroupId, productId);

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
     */
    private async adInAb(abTestGroupId: string) {
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const adGroupResVoList = await modelServer.getAdGroupListInAb(abTestGroupId);
        return adGroupResVoList;

    }

    /**
     * <br/>向版本分组下创建默认 ab 分组
     * @argument {CreateDefaultAbTestGroupReqVO}
     * @returns {CreateDefaultAbTestGroupResVO}
     * @debugger yes
     */
    public async createDefaultAbTestGroupAction() {
        const ucId: string = this.ctx.state.userId || '';
        const versionGroupId: string = this.post('id');

        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;

        const abTestGroupVo: AbTestGroupVO = {
            versionGroupId,
            name: 'default', begin: -1, end: -1, description: '默认组',
            configGroupId: null, nativeTmplConfGroupId: null,
        };
        await abTestGroupModel.addAbTestGroup(abTestGroupVo);

        this.success('created');
    }

    /**
     * <br/>向版本分组下创建 ab 分组
     * @argument {CreateAbTestGroupReqVO}
     * @returns {CreateAbTestGroupResVO}
     * @debugger yes
     */
    public async createAbTestGroupAction() {
        const ucId: string = this.ctx.state.userId || '';
        const name: string = this.post('name');
        const versionGroupId: string = this.post('id');
        const description: string = this.post('description');
        let begin: number = this.post('begin');
        let end: number = this.post('end');
        const groupNum: number = this.post('groupNum');

        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const nameList = [
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
        ];

        if (groupNum && groupNum > 1) {

            if ((end - begin) % groupNum !== 0) {
                return this.fail(10, '分组失败，无法分组');
            }
            const abTestGroupVoList: AbTestGroupVO[] = [];
            const step = (end - begin + 1) / groupNum;
            end = begin + step - 1;

            for (let i = 0; i < groupNum; i++) {
                const abTestGroupName = name + '_' + nameList[i + 1];

                const abTestGroupVo: AbTestGroupVO = {
                    name: abTestGroupName, begin, end,
                    description, versionGroupId, configGroupId: null, nativeTmplConfGroupId: null
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

        } else {
            return this.fail(10, '分组失败，没有指定大于 1 的组数');
        }

        this.success('created');
    }

    /**
     * <br/>向 ab 分组绑定常量组
     * @argument {BindConfigGroupReqVO}
     * @returns {BindConfigGroupResVO}
     * @debugger yes
     */
    public async bindConfigGroupAction() {
        const ucId: string = this.ctx.state.userId || '';
        const abTestGroupId: string = this.post('id');
        const configGroupId: string = this.post('configGroupId');
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;

        const abTestGroupVo: AbTestGroupVO = {
            configGroupId,
            name: undefined, begin: undefined, end: undefined,
            description: undefined, versionGroupId: undefined,
            nativeTmplConfGroupId: undefined
        };
        const rows = await abTestGroupModel.updateAbTestGroup(abTestGroupId, abTestGroupVo);

        if (rows === 1) {
            return this.success('binded');
        } else {
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
        const ucId: string = this.ctx.state.user.id || '';
        const productId: string = this.post('id');
        const type: number = this.post('type');
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const configGroupResVoList = await modelServer.getConfigGroupList(productId, type);

        return this.success(configGroupResVoList);
    }

    /**
     * <br/>获取常量组下常量列表
     * @argument {ConfigListReqVO}
     * @returns {ConfigListResVO}
     * @debugger yes
     */
    public async configListAction() {
        const configGroupId: string = this.post('id');
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const configResVoList = await modelServer.getConfigList(configGroupId);
        return this.success(configResVoList);
    }

    /**
     * <br/>创建常量组
     * @argument {CreateConfigGroupReqVO}
     * @returns {CreateConfigGroupResVO}
     * @debugger yes
     */
    public async createConfigGroupAction() {
        const ucId: string = this.ctx.state.userId || '';
        const name: string = this.post('name');
        const dependentId: string = this.post('dependentId');
        const productId: string = this.post('id');
        const description: string = this.post('description');
        const type: number = this.post('type');
        const active: number = this.post('active');

        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;
        const configGroupVo: ConfigGroupVO = {
            name, description, type,
            dependentId, productId, active
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
        const ucId: string = this.ctx.state.userId || '';
        const name: string = this.post('name');
        const copyId: string = this.post('id');
        const configGroupDescription: string = this.post('description');
        const configGroupActive: number = this.post('active');
        let dependentId: string = this.post('dependentId');

        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;
        const configModel = this.taleModel('config', 'advertisement') as ConfigModel;

        const [
            copyedConfigGroupVo, copyedConfigVoList
        ] = await Promise.all([
            configGroupModel.getConfigGroup(copyId),
            configModel.getList(copyId)
        ]);

        const {
            dependentId: copyedDependentId, productId, type
        } = copyedConfigGroupVo;

        if (!dependentId) {
            dependentId = copyedDependentId;
        }

        const configGroupVo: ConfigGroupVO = {
            name, description: configGroupDescription, type,
            dependentId, productId, active: configGroupActive
        };
        const configGroupId = await configGroupModel.addConfigGroup(configGroupVo);

        const configVoList = _.map(copyedConfigVoList, (copyedConfigVo) => {

            const configVo: ConfigVO = _.omit(copyedConfigVo, [
                'id', 'createAt', 'updateAt', 'configGroupId'
            ]);
            configVo.configGroupId = configGroupId;

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
        const ucId: string = this.ctx.state.userId || '';
        const name: string = this.post('name');
        const id: string = this.post('id');
        const dependentId: string = this.post('dependentId');
        const description: string = this.post('description');
        const active: number = this.post('active');

        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;

        const configGroupVo: ConfigGroupVO = {
            name, description, dependentId,
            type: undefined, productId: undefined,
            active
        };
        const rows = await configGroupModel.updateConfigGroup(id, configGroupVo);

        if (rows === 1) {
            this.success('updated');
        } else {
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
        const ucId: string = this.ctx.state.userId || '';
        const configGroupId: string = this.post('id');
        const key: string = this.post('key');
        const value: string = this.post('value');
        const description: string = this.post('description');
        const active: number = this.post('active');

        const configModel = this.taleModel('config', 'advertisement') as ConfigModel;

        const configVo: ConfigVO = {
            configGroupId,
            key, value, description,
            active
        };
        await configModel.updateAdConfig(key, configGroupId, configVo);

        return this.success('updated');
    }

    /**
     * <br/>创建常量
     * @argument {CreateConfigReqVO}
     * @returns {CreateConfigResVO}
     * @debugger yes
     */
    public async createConfigAction() {
        const ucId: string = this.ctx.state.userId || '';
        const configGroupId: string = this.post('id');
        const key: string = this.post('key');
        const value: string = this.post('value');
        const description: string = this.post('description');
        const active: number = this.post('active');

        const configModel = this.taleModel('config', 'advertisement') as ConfigModel;

        const configVo: ConfigVO = {
            configGroupId,
            key, value, description,
            active
        };
        await configModel.addConfig(configVo);

        this.success('created');
    }

    /**
     * <br/>更新常量
     * @argument {UpdateConfigReqVO}
     * @returns {UpdateConfigResVO}
     * @debugger yes
     */
    public async updateConfigAction() {
        const ucId: string = this.ctx.state.userId || '';
        const id: string = this.post('id');
        const key: string = this.post('key');
        const value: string = this.post('value');
        const description: string = this.post('description');
        const active: number = this.post('active');

        const configModel = this.taleModel('config', 'advertisement') as ConfigModel;

        const configVo: ConfigVO = {
            configGroupId: undefined,
            key, value, description,
            active
        };

        const rows = await configModel.updateConfig(id, configVo);
        if (rows === 1) {
            this.success('updated');
        } else {
            this.fail(TaleCode.DBFaild, 'update fail!!!');
        }
    }

    /**
     * <br/>删除常量
     * @argument {DeleteConfigReqVO}
     * @returns {DeleteConfigResVO}
     * @debugger yes
     */
    public async deleteConfigAction() {
        const ucId: string = this.ctx.state.userId || '';
        const id: string = this.post('id');

        const configModel = this.taleModel('config', 'advertisement') as ConfigModel;

        const rows = await configModel.delConfig(id);
        if (rows === 1) {
            this.success('deleted');
        } else {
            this.fail(TaleCode.DBFaild, 'delete fail!!!');
        }
    }

    /**
     * <br/>向 ab 分组绑定 native 组
     * @argument {BindNativeTmplConfGroupReqVO}
     * @returns {BindNativeTmplConfGroupResVO}
     * @debugger yes
     */
    public async bindNativeTmplConfGroupAction() {
        const ucId: string = this.ctx.state.userId || '';
        const abTestGroupId: string = this.post('id');
        const nativeTmplConfGroupId: string = this.post('nativeTmplConfGroupId');
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;

        const abTestGroupVo: AbTestGroupVO = {
            nativeTmplConfGroupId,
            name: undefined, begin: undefined, end: undefined, description: undefined,
            versionGroupId: undefined, configGroupId: undefined
        };
        const rows = await abTestGroupModel.updateAbTestGroup(abTestGroupId, abTestGroupVo);

        if (rows === 1) {
            return this.success('binded');
        } else {
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
        const productId: string = this.post('id');
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const nativeTmplConfGroupResVoList = await modelServer.getNativeTmplConfGroupList(productId);
        return this.success(nativeTmplConfGroupResVoList);
    }

    /**
     * <br/>获取应用 native 模板组下模板列表
     * @argument {NativeTmplConfListReqVO}
     * @returns {NativeTmplConfListResVO}
     * @debugger yes
     */
    public async nativeTmplConfListAction() {
        const nativeTmplConfGroupId: string = this.post('id');
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;
        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;

        const nativeTmplConfGroupVo = await nativeTmplConfGroupModel.getNativeTmplConfGroup(nativeTmplConfGroupId);
        const { productId } = nativeTmplConfGroupVo;

        const nativeTmplConfResVoList = await modelServer.getNativeTmplConfList(nativeTmplConfGroupId, productId);
        return this.success(nativeTmplConfResVoList);
    }

    /**
     * <br/>创建应用 native 模板配置组
     * @argument {CreateNativeTmplConfGroupReqVO}
     * @returns {CreateNativeTmplConfGroupResVO}
     * @debugger yes
     */
    public async createNativeTmplConfGroupAction() {
        const ucId: string = this.ctx.state.userId || '';
        const name: string = this.post('name');
        const productId: string = this.post('id');
        const description: string = this.post('description');
        const active: number = this.post('active');

        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;

        const nativeTmplConfGroupVo: NativeTmplConfGroupVO = {
            name, description, productId, active
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
        const ucId: string = this.ctx.state.userId || '';
        const name: string = this.post('name');
        const copyId: string = this.post('id');
        const description: string = this.post('description');
        const nativeTmplConfGroupActive: number = this.post('active');

        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;
        const nativeTmplConfModel = this.taleModel('nativeTmplConf', 'advertisement') as NativeTmplConfModel;

        const [
            { productId }, copyedNativeTmplConfVoList
        ] = await Promise.all([
            nativeTmplConfGroupModel.getNativeTmplConfGroup(copyId),
            nativeTmplConfModel.getList(copyId)
        ]);

        const nativeTmplConfGroupVo: NativeTmplConfGroupVO = {
            name, description, productId, active: nativeTmplConfGroupActive
        };
        const nativeTmplConfGroupId = await nativeTmplConfGroupModel.addNativeTmplConfGroup(nativeTmplConfGroupVo);

        const nativeTmplConfVoList = await Bluebird.map(copyedNativeTmplConfVoList, async (copyedNativeTmplConfVo) => {
            const nativeTmplConfVo: NativeTmplConfVO = _.omit(copyedNativeTmplConfVo, [
                'id', 'createAt', 'updateAt', 'nativeTmplConfGroupId'
            ]);
            nativeTmplConfVo.nativeTmplConfGroupId = nativeTmplConfGroupId;

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
        const ucId: string = this.ctx.state.userId || '';
        const name: string = this.post('name');
        const id: string = this.post('id');
        const description: string = this.post('description');
        const active: number = this.post('active');

        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;

        const nativeTmplConfGroupVo: NativeTmplConfGroupVO = {
            name, description, active, productId: undefined
        };
        const rows = await nativeTmplConfGroupModel.updateNativeTmplConfGroup(id, nativeTmplConfGroupVo);

        if (rows === 1) {
            this.success('updated');
        } else {
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
        const ucId: string = this.ctx.state.userId || '';
        const nativeTmplConfGroupId: string = this.post('id');
        const nativeTmplId: string = this.post('nativeTmplId');
        const weight: number = this.post('weight');
        const clickArea: number = this.post('clickArea');
        const isFull: number = this.post('isFull');
        const active: number = this.post('active');

        const nativeTmplConfModel = this.taleModel('nativeTmplConf', 'advertisement') as NativeTmplConfModel;

        const nativeTmplConfVo: NativeTmplConfVO = {
            nativeTmplConfGroupId, nativeTmplId,
            weight, clickArea, isFull,
            active
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
        const ucId: string = this.ctx.state.userId || '';
        const id: string = this.post('id');
        const nativeTmplConfGroupId: string = this.post('nativeTmplConfGroupId');
        const weight: number = this.post('weight');
        const clickArea: number = this.post('clickArea');
        const isFull: number = this.post('isFull');
        const active: number = this.post('active');

        const nativeTmplConfModel = this.taleModel('nativeTmplConf', 'advertisement') as NativeTmplConfModel;
        const nativeTmplConfVo: NativeTmplConfVO = {
            nativeTmplConfGroupId, nativeTmplId: undefined,
            weight, clickArea, isFull, active
        };
        const rows = await nativeTmplConfModel.updateNativeTmplConf(id, nativeTmplConfVo);

        if (rows === 1) {
            this.success('updated');
        } else {
            this.fail(TaleCode.DBFaild, 'update fail!!!');
        }
    }

    /**
     * <br/>删除应用 native 模板
     * @argument {DeleteNativeTmplConfReqVO}
     * @returns {DeleteNativeTmplConfResVO}
     * @debugger yes
     */
    public async deleteNativeTmplConfAction() {
        const ucId: string = this.ctx.state.userId || '';
        const id: string = this.post('id');
        const nativeTmplConfModel = this.taleModel('nativeTmplConf', 'advertisement') as NativeTmplConfModel;

        const rows = await nativeTmplConfModel.delNativeTmplConf(id);
        if (rows === 1) {
            this.success('deleted');
        } else {
            this.fail(TaleCode.DBFaild, 'delete fail!!!');
        }
    }

    /**
     * <br/>向 ab 分组绑定广告组
     * @argument {BindAdGroupReqVO}
     * @returns {BindAdGroupResVO}
     * @debugger yes
     */
    public async bindAdGroupAction() {
        const ucId: string = this.ctx.state.userId || '';
        const abTestGroupId: string = this.post('id');
        const adGroupId: string = this.post('adGroupId');
        const place: string = this.post('place');

        const abTestMapModel = this.taleModel('abTestMap', 'advertisement') as AbTestMapModel;
        const abTestMapVo: AbTestMapVO = {
            abTestGroupId,
            place,
            adGroupId
        };

        await abTestMapModel.addAbTestMap(abTestGroupId, place, abTestMapVo);
        this.success('binded');
    }

    /**
     * <br/>删除 ab 分组下广告位
     * @argument {UnbindAdGroupReqVO}
     * @returns {UnbindAdGroupResVO}
     * @debugger yes
     */
    public async unbindAdGroupAction() {
        const ucId: string = this.ctx.state.userId || '';
        const id: string = this.post('id');
        const place: string = this.post('place');
        const abTestMapModel = this.taleModel('abTestMap', 'advertisement') as AbTestMapModel;

        const rows = await abTestMapModel.delAbTestMap(id, place);
        if (rows === 1) {
            this.success('unbinded');
        } else {
            this.fail(TaleCode.DBFaild, 'unbind fail!!!');
        }
    }

    /**
     * <br/>全量 ab 分组下广告位到默认组
     * @argument {CompletePlaceReqVO}
     * @returns {CompletePlaceResVO}
     * @debugger yes
     */
    public async completePlaceAction() {
        const ucId: string = this.ctx.state.userId || '';
        const id: string = this.post('id');
        const place: string = this.post('place');
        const abTestMapModel = this.taleModel('abTestMap', 'advertisement') as AbTestMapModel;
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;

        try {
            const [
                { versionGroupId },
                { adGroupId }
            ] = await Promise.all([
                abTestGroupModel.getAbTestGroup(id),
                abTestMapModel.getAbTestMap(id, place)
            ]);

            const { id: defaultId } = await abTestGroupModel.getDefault(versionGroupId);

            think.logger.debug(`versionGroupId : ${versionGroupId}`);
            think.logger.debug(`adGroupId : ${adGroupId}`);
            think.logger.debug(`place : ${place}`);
            think.logger.debug(`defaultId : ${defaultId}`);

            await abTestMapModel.updateAbTestMap(defaultId, place, adGroupId);

            this.success('completed');

        } catch (e) {
            think.logger.debug(`complete place fail error : ${e}`);
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
        const productId: string = this.post('id');
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const adGroupResVoList = await modelServer.getAdGroupList(productId);
        return this.success(adGroupResVoList);
    }

    /**
     * <br/>创建广告组
     * @argument {CreateAdGroupReqVO}
     * @returns {CreateAdGroupResVO}
     * @debugger yes
     */
    public async createAdGroupAction() {
        const ucId: string = this.ctx.state.userId || '';
        const name: string = this.post('name');
        const productId: string = this.post('id');
        const adTypeId: string = this.post('adTypeId');
        const description: string = this.post('description');
        const active: number = this.post('active');
        const adGroupModel = this.taleModel('adGroup', 'advertisement') as AdGroupModel;

        const adGroupVo: AdGroupVO = {
            name, description,
            adTypeId, productId, active
        };

        await adGroupModel.addAdGroup(adGroupVo);
        this.success('created');
    }

    /**
     * <br/>复制广告组
     * @argument {CopyAdGroupReqVO}
     * @returns {CopyAdGroupResVO}
     * @debugger yes
     */
    public async copyAdGroupAction() {
        const ucId: string = this.ctx.state.userId || '';
        const copyId: string = this.post('id');
        const name: string = this.post('name');
        const description: string = this.post('description');
        const active: number = this.post('active');

        const adGroupModel = this.taleModel('adGroup', 'advertisement') as AdGroupModel;
        const adModel = this.taleModel('ad', 'advertisement') as AdModel;

        const [
            copyedAdGroupVo, copyedAdVoList
        ] = await Promise.all([
            adGroupModel.getAdGroup(copyId),
            adModel.getListByAdGroup(copyId)
        ]);

        const { productId, adTypeId } = copyedAdGroupVo;

        const adGroupVo: AdGroupVO = {
            name, description,
            adTypeId, productId, active
        };
        const adGroupId = await adGroupModel.addAdGroup(adGroupVo);

        const adVoList = _.map(copyedAdVoList, (copyedAdVo) => {
            const adVo: AdVO = _.omit(copyedAdVo, [
                'id', 'createAt', 'updateAt', 'adGroupId'
            ]);

            adVo.adGroupId = adGroupId;

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
        const ucId: string = this.ctx.state.userId || '';
        const id: string = this.post('id');
        const name: string = this.post('name');
        const description: string = this.post('description');
        const active: number = this.post('active');

        const adGroupModel = this.taleModel('adGroup', 'advertisement') as AdGroupModel;

        const adGroupVo: AdGroupVO = {
            name, description,
            adTypeId: undefined, productId: undefined, active
        };

        const rows = await adGroupModel.updateAdGroup(id, adGroupVo);
        if (rows === 1) {
            this.success('updated');
        } else {
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
        const productId: string = this.post('id');
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const adResVoList = await modelServer.getAdList(productId);
        return this.success(adResVoList);
    }

    /**
     * <br/>获取广告组下广告列表
     * @argument {AdListInAdGroupReqVO}
     * @returns {AdListInAdGroupResVO}
     * @debugger yes
     */
    public async adListInAdGroupAction() {
        const adGroupId: string = this.post('id');
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const adResVoList = await modelServer.getAdListInAdGroup(adGroupId);
        return this.success(adResVoList);
    }

    /**
     * <br/>创建广告
     * @argument {CreateAdReqVO}
     * @returns {CreateAdResVO}
     * @debugger yes
     */
    public async createAdAction() {
        const adGroupId: string = this.post('id');
        const adChannelId: string = this.post('adChannelId');
        const name: string = this.post('name');
        const placementID: string = this.post('placementID');
        const ecpm: number = this.post('ecpm');
        const bidding: number = this.post('bidding');
        const active: number = this.post('active');

        const adGroupModel = this.taleModel('adGroup', 'advertisement') as AdGroupModel;
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const { adTypeId, productId } = await adGroupModel.getAdGroup(adGroupId);

        const adVo: AdVO = {
            productId, adGroupId, adChannelId, adTypeId,
            name, placementID, ecpm, bidding,
            active, activeIndex: undefined,
            loader: undefined, subloader: undefined, interval: undefined, weight: undefined
        };

        await modelServer.addAd(adGroupId, adVo);
        return this.success('created');
    }

    /**
     * <br/>更新广告
     * @argument {UpdateAdReqVO}
     * @returns {UpdateAdResVO}
     * @debugger yes
     */
    public async updateAdAction() {
        const ucId: string = this.ctx.state.userId || '';
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

        const adModel = this.taleModel('ad', 'advertisement') as AdModel;

        const adVo: AdVO = {
            productId: undefined, adGroupId: undefined, adChannelId: undefined, adTypeId: undefined,
            activeIndex: undefined,
            placementID, name, ecpm, interval, subloader, loader, weight, bidding,
            active
        };

        if (active === 0) {
            const now = moment().format('YYYY-MM-DD HH:mm:ss');
            adVo.activeIndex = now;
        }
        if (active === 1) {
            adVo.activeIndex = null;
        }

        const rows = await adModel.updateAd(id, adVo);
        if (rows === 1) {
            this.success('updated');
        } else {
            this.fail(TaleCode.DBFaild, 'update fail!!!');
        }
    }

    /**
     * <br/>删除广告组下广告
     * @argument {DeleteAdReqVO}
     * @returns {DeleteAdReqVO}
     * @debugger yes
     */
    public async deleteAdAction() {
        const ucId: string = this.ctx.state.userId || '';
        const id: string = this.post('id');

        const adModel = this.taleModel('ad', 'advertisement') as AdModel;
        const rows = await adModel.delAd(id);

        if (rows === 1) {
            this.success('deleted');
        } else {
            this.fail(TaleCode.DBFaild, 'delete fail!!!');
        }
    }

}