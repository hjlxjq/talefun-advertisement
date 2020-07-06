/**
 * DispatchManager Controller module.
 * <br/>应用下发相关 api
 * @module advertisement/controller/dispatchManager
 * @see advertisement/controller/dispatchManager;
 * @debugger
 */
import { think } from 'thinkjs';
import * as Bluebird from 'bluebird';
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

import UpdateCacheServer from '../service/updateCacheServer';
import ModelServer from '../service/modelServer';

import {
    VersionGroupVO, AbTestGroupVO, ConfigGroupVO, ConfigVO, NativeTmplConfGroupVO, NativeTmplConfVO,
    AbTestMapVO, AdGroupVO, AdVO, ConfigGroupResVO, NativeTmplConfGroupResVO, AbTestGroupResVO, NationDefineVO
} from '../defines';

import {
    VersionGroupListReqVO, VersionGroupListResVO, CreateVersionGroupReqVO, CreateVersionGroupResVO,
    UpdateVersionGroupReqVO, UpdateVersionGroupResVO, AbTestGroupListReqVO, AbTestGroupListResVO,
    CreateAbTestGroupReqVO, CreateAbTestGroupResVO, BindConfigGroupReqVO, BindConfigGroupResVO,
    ConfigGroupListReqVO, ConfigGroupListResVO, ConfigListReqVO, ConfigListResVO, CreateConfigGroupReqVO,
    CreateConfigGroupResVO, UpdateConfigGroupReqVO, UpdateConfigGroupResVO, CreateConfigReqVO,
    CreateConfigResVO, UpdateConfigReqVO, UpdateConfigResVO, BindNativeTmplConfGroupReqVO,
    BindNativeTmplConfGroupResVO, NativeTmplConfGroupListReqVO, NativeTmplConfGroupListResVO,
    NativeTmplConfListReqVO, NativeTmplConfListResVO, CreateNativeTmplConfGroupReqVO,
    CreateNativeTmplConfGroupResVO, UpdateNativeTmplConfGroupReqVO, UpdateNativeTmplConfGroupResVO,
    CreateNativeTmplConfReqVO, CreateNativeTmplConfResVO, CopyNativeTmplConfGroupReqVO,
    CopyNativeTmplConfGroupResVO, UpdateNativeTmplConfReqVO, UpdateNativeTmplConfResVO, BindAdGroupReqVO,
    BindAdGroupResVO, AdGroupListReqVO, AdGroupListResVO, CreateAdGroupReqVO, CreateAdGroupResVO,
    UpdateAdGroupReqVO, UpdateAdGroupResVO, AdListReqVO, AdListResVO, AdListInAdGroupReqVO,
    AdListInAdGroupResVO, CreateAdReqVO, CreateAdResVO, CopyAdGroupReqVO, CopyAdGroupResVO, UpdateAdReqVO,
    UpdateAdResVO, NationDefineListResVO, CopyConfigGroupReqVO, CopyConfigGroupResVO, CopyVersionGroupReqVO,
    CopyVersionGroupResVO, CompletePlaceReqVO, CompletePlaceResVO, UpdateAdConfigReqVO, UpdateAdConfigResVO,
    DeleteABTestGroupReqVO, DeleteABTestGroupResVO, PlaceGroupListInAbReqVO, PlaceGroupListInAbResVO,
    ConfigGroupInAbReqVO, ConfigGroupInAbResVO, NativeTmplConfGroupInAbReqVO, NativeTmplConfGroupInAbResVO,
} from '../interface';

export default class DispatchManagerController extends BaseController {
    /**
     * <br/>获取版本条件分组列表信息
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
        const nationDefineModel = this.taleModel('nationDefine', 'advertisement') as NationDefineModel;

        const nationDefineVoList = await nationDefineModel.getList();

        return this.success(nationDefineVoList);

    }

    /**
     * 创建版本条件分组，
     * <br/>创建版本条件分组，再创建默认 ab 测试分组
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
        const codeList: string[] = this.post('codeList') || [];    // 没有选择国家代码默认为空数组
        const type: number = this.post('type');
        const include: number = this.post('include');
        const active: number = this.post('active');
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        try {
            // 创建，先在数据库中暂存，待发布再更新上线， activeTime 标识
            const CacheActiveTime = think.config('CacheActiveTime');
            // 版本条件分组表对象
            const createVersionGroupVo: VersionGroupVO = {
                name, begin, description, type, code: JSON.stringify(codeList), include,
                active, activeTime: CacheActiveTime, creatorId: ucId, productId
            };

            const versionGroupId = await versionGroupModel.addVo(createVersionGroupVo);

            // 默认 ab 测试分组对象
            const abTestGroupVo: AbTestGroupVO = {
                versionGroupId, active, name: 'default', begin: -1, end: -1, description: '默认组',
                creatorId: ucId, configGroupId: undefined, nativeTmplConfGroupId: undefined, activeTime: undefined
            };
            // 向版本条件分组下创建默认 ab 分组
            await abTestGroupModel.addVo(abTestGroupVo);

            // 缓存用户发布状态
            await updateCacheServer.setDeployStatus(ucId);

            this.success('created');

        } catch (e) {
            think.logger.debug(e);
            this.fail(TaleCode.DBFaild, 'create fail!!!');

        }

    }

    /**
     * 复制版本条件分组，
     * <br/>复制即相当于创建，版本条件分组下的 ab 测试分组和广告位信息，都是第一次创建，所以不需要检查一致性问题
     * @argument {CopyVersionGroupReqVO}
     * @returns {CopyVersionGroupResVO}
     * @debugger yes
     */
    public async copyVersionGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const copyId: string = this.post('id');    // 被复制的版本条件分组主键
        const name: string = this.post('name');
        const begin: number = this.post('begin');
        const description: string = this.post('description');
        const codeList: string[] = this.post('codeList') || [];    // 没有选择国家代码默认为空数组
        const include: number = this.post('include');
        const active: number = this.post('active');
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const abTestMapModel = this.taleModel('abTestMap', 'advertisement') as AbTestMapModel;
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        try {
            // 获取被复制组和被复制组的默认 ab 测试分组的配置
            const [
                copyedVersionGroupVo,
                copyedAbTestGroupVo
            ] = await Promise.all([
                versionGroupModel.getVo(copyId, ucId),
                abTestGroupModel.getDefault(copyId)
            ]);

            // 版本条件分组类型和应用主键，和被复制组一样
            const { type, productId } = copyedVersionGroupVo;
            // 被复制组的 ab 测试分组信息
            const { id: copyedAbTestGroupId, configGroupId, nativeTmplConfGroupId } = copyedAbTestGroupVo;

            // 创建，先在数据库中暂存，待发布再更新上线， activeTime 标识
            const CacheActiveTime = think.config('CacheActiveTime');

            // 版本条件分组对象
            const createVersionGroupVo: VersionGroupVO = {
                name, begin, description, type, code: JSON.stringify(codeList), include,
                active, activeTime: CacheActiveTime, creatorId: ucId, productId
            };
            // 先创建版本条件分组表
            const versionGroupId = await versionGroupModel.addVo(createVersionGroupVo);

            // 默认 ab 测试对象
            const defaultAbTestGroupVo: AbTestGroupVO = {
                name: 'default', begin: -1, end: -1, description: '默认组', active, activeTime: CacheActiveTime,
                creatorId: ucId, nativeTmplConfGroupId, configGroupId, versionGroupId
            };
            // 再创建版本条件分组下默认 ab 测试
            const defaultAbTestGroupId = await abTestGroupModel.addVo(defaultAbTestGroupVo);

            // 再创建版本条件分组下默认 ab 测试下的广告位信息测试
            // 被复制组的默认 ab 测试下的广告位信息列表
            const copyedAbTestMapVoList = await abTestMapModel.getListByAbTestGroup(copyedAbTestGroupId, ucId);
            // 复制组的默认 ab 测试下的广告位信息列表
            const defaultAbTestMapVoList = _.map(copyedAbTestMapVoList, (copyedAbTestMapVo) => {
                const { place, adGroupId } = copyedAbTestMapVo;

                // 默认 ab 测试下的广告位信息
                const defaultAbTestMapVo: AbTestMapVO = {
                    place, adGroupId, abTestGroupId: defaultAbTestGroupId, creatorId: ucId, active: 1
                };
                return defaultAbTestMapVo;
            });

            await abTestMapModel.addList(defaultAbTestMapVoList);

            // 缓存用户发布状态
            await updateCacheServer.setDeployStatus(ucId);

            this.success('copyed');

        } catch (e) {
            think.logger.debug(e);
            this.fail(TaleCode.DBFaild, 'copye fail!!!');

        }

    }

    /**
     * <br/>更新版本条件分组
     * @argument {UpdateVersionGroupReqVO}
     * @returns {UpdateVersionGroupResVO}
     * @debugger yes
     */
    public async updateVersionGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const id: string = this.post('id');
        const description: string = this.post('description');
        const codeList: string[] = this.post('codeList');
        const include: number = this.post('include');
        const begin: number = this.post('begin');
        const active: number = this.post('action');
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const abTestMapModel = this.taleModel('abTestMap', 'advertisement') as AbTestMapModel;
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        // 数据库 code 字段为 json 字符串
        let code: string;
        if (codeList) {
            code = JSON.stringify(codeList);
        }

        const versionGroupVo = await versionGroupModel.getVo(id, ucId);

        // 待更新的版本条件分组对象
        const updateVersionGroupVo: VersionGroupVO = {
            name: undefined, begin, description, code, include, active, activeTime: undefined,
            type: undefined, productId: undefined, creatorId: undefined
        };

        try {
            // 本账户创建的直接数据库操作
            if (versionGroupVo.creatorId === ucId) {
                // 关闭则直接数据库删除
                if (active === 0) {
                    const abTestGroupIdList = await abTestGroupModel.getIdListByVersionGroup(id);
                    await Promise.all([
                        versionGroupModel.delVo(id),
                        abTestGroupModel.delByVersionGroup(id),
                        abTestMapModel.delList(abTestGroupIdList)
                    ]);
                    // 否则直接更新
                } else {
                    await versionGroupModel.updateVo(id, updateVersionGroupVo);
                }

                // 线上数据更新到缓存
            } else {
                if (active === 0) {
                    const now = moment().format('YYYY-MM-DD HH:mm:ss');
                    updateVersionGroupVo.activeTime = now;

                }
                await updateCacheServer.setCacheData(ucId, 'versionGroup', id, updateVersionGroupVo);
            }
            // 缓存用户发布状态
            await updateCacheServer.setDeployStatus(ucId);

            this.success('updated');

        } catch (e) {
            think.logger.debug(e);
            this.fail(TaleCode.DBFaild, 'update fail!!!');
        }

    }

    /**
     * <br/>获取版本条件分组下 ab 分组列表
     * @argument {AbTestGroupListReqVO}
     * @returns {AbTestGroupListResVO}
     * @debugger yes
     */
    public async abTestGroupListAction() {
        const ucId: string = this.ctx.state.userId;
        const versionGroupId: string = this.post('id');
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        // think.logger.debug(`versionGroupId: ${versionGroupId}`);
        // 数据库里的 ab 分组对象
        const abTestGroupVoList = await abTestGroupModel.getListByVersionGroup(versionGroupId, ucId);
        // 未发布更新在缓存里的 ab 分组对象
        const cacheAbTestGroupVoHash = await updateCacheServer.fetchCacheDataHash(ucId, 'abTestGroup');

        const abTestGroupResVoList = await Bluebird.map(abTestGroupVoList, async (abTestGroupVo) => {
            const { id: abTestGroupId } = abTestGroupVo;
            // 更新的缓存数据
            const cacheAbTestGroupVo = cacheAbTestGroupVoHash[abTestGroupId] as AbTestGroupVO;
            // 返回线上数据和未发布的数据，以未发布数据为准
            const abTestGroupResVo = _.assign(abTestGroupVo, cacheAbTestGroupVo);

            // 删除不需要的字段
            delete abTestGroupResVo.configGroupId;
            delete abTestGroupResVo.nativeTmplConfGroupId;
            delete abTestGroupResVo.versionGroupId;
            delete abTestGroupResVo.activeTime;
            delete abTestGroupResVo.createAt;
            delete abTestGroupResVo.updateAt;

            return abTestGroupResVo;
        });

        return this.success(abTestGroupResVoList);

    }

    /**
     * <br/>获取 ab 分组下广告位配置
     * @argument {PlaceGroupListInAbReqVO}
     * @returns {PlaceGroupListInAbReqVO}
     * @debugger yes
     */
    public async placeGroupListInAbAction() {
        const ucId: string = this.ctx.state.userId;
        const abTestGroupId: string = this.post('id');
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const placeGroupVoList = await modelServer.getPlaceList(abTestGroupId, ucId);
        return this.success(placeGroupVoList);

    }

    /**
     * <br/>获取 ab 分组下的常量组及常量组下常量列表配置
     * @argument {ConfigGroupInAbReqVO}
     * @returns {ConfigGroupInAbResVO}
     * @debugger yes
     */
    public async configGroupInAbAction() {
        const ucId: string = this.ctx.state.userId;
        const abTestGroupId: string = this.post('id');
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        // 数据库里的 ab 分组对象
        const abTestGroupVo = await abTestGroupModel.getVo(abTestGroupId, ucId);
        // 未发布更新在缓存里的 ab 分组对象
        const cacheAbTestGroupVo = await updateCacheServer.fetchCacheData(ucId, 'abTestGroup', abTestGroupId);

        // 返回线上数据和未发布的数据，以未发布数据为准
        const abTestGroupResVo = _.assign(abTestGroupVo, cacheAbTestGroupVo);

        const { configGroupId } = abTestGroupResVo;

        // 获取 ab 分组下的常量组及常量组下的常量列表数据
        let configGroupResVo: ConfigGroupResVO = null;
        if (configGroupId) {
            const configGroupVo = await modelServer.getConfigGroup(configGroupId, ucId);
            const configResVoList = await modelServer.getConfigList(configGroupId, ucId);

            configGroupResVo = _.defaults({ configList: configResVoList }, configGroupVo);
        }

        return this.success(configGroupResVo);

    }

    /**
     * <br/>获取 ab 分组下的 native 模板组及包含的 native 模板列表
     * @argument {NativeTmplConfGroupInAbReqVO}
     * @returns {NativeTmplConfGroupInAbResVO}
     * @debugger yes
     */
    public async nativeTmplConfGroupInAbAction() {
        const ucId: string = this.ctx.state.userId;
        const abTestGroupId: string = this.post('id');
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        // 数据库里的 ab 分组对象
        const abTestGroupVo = await abTestGroupModel.getVo(abTestGroupId, ucId);
        // 未发布更新在缓存里的 ab 分组对象
        const cacheAbTestGroupVo: AbTestGroupVO =
            await updateCacheServer.fetchCacheData(ucId, 'abTestGroup', abTestGroupId);

        // 返回线上数据和未发布的数据，以未发布数据为准
        const abTestGroupResVo = _.assign(abTestGroupVo, cacheAbTestGroupVo);

        const { nativeTmplConfGroupId } = abTestGroupResVo;

        // 获取 ab 分组下的常量组及常量组下的常量列表数据
        let nativeTmplConfGroupResVo: NativeTmplConfGroupResVO = null;
        if (nativeTmplConfGroupId) {
            // 模板组数据
            const nativeTmplConfGroupVo =
                await modelServer.getNativeTmplConfGroup(nativeTmplConfGroupId, ucId);

            // 模板数据
            const nativeTmplConfResVoList =
                await modelServer.getNativeTmplConfList(nativeTmplConfGroupId, ucId);

            // 返回数据
            nativeTmplConfGroupResVo = _.defaults({
                nativeTmplConfList: nativeTmplConfResVoList
            }, nativeTmplConfGroupVo);

        }

        return this.success(nativeTmplConfGroupResVo);

    }

    /**
     * <br/>向版本条件分组下创建 ab 分组
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
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        try {
            // 创建，先在数据库中暂存，待发布再更新上线， activeTime 标识
            const CacheActiveTime = think.config('CacheActiveTime');
            // 分组后缀，默认最大 26 个字母
            const nameList = [
                'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
                'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
            ];

            // 需要创建的 ab 测试分组对象列表
            const createAbTestGroupVoList: AbTestGroupVO[] = [];
            const step = (end - begin + 1) / groupNum;
            // 分组左右均包含
            end = begin + step - 1;

            for (let i = 0; i < groupNum; i++) {
                const abTestGroupName = name + '_' + nameList[i];

                const createAbTestGroupVo: AbTestGroupVO = {
                    name: abTestGroupName, begin, end, description, activeTime: CacheActiveTime, active: 1,
                    versionGroupId, creatorId: ucId, configGroupId: undefined, nativeTmplConfGroupId: undefined
                };
                createAbTestGroupVoList.push(createAbTestGroupVo);
                begin = end + 1;
                end += step;
            }

            await abTestGroupModel.addList(createAbTestGroupVoList);
            // 缓存用户发布状态
            await updateCacheServer.setDeployStatus(ucId);

            this.success('created');

        } catch (e) {
            think.logger.debug(e);
            this.fail(TaleCode.DBFaild, 'create fail!!!');
        }

    }

    /**
     * <br/>测试结束
     * @argument {DeleteABTestGroupReqVO}
     * @returns {DeleteABTestGroupResVO}
     * @debugger yes
     */
    public async deleteABTestGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const versionGroupId: string = this.post('id');
        const name: string = this.post('name');
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const abTestMapModel = this.taleModel('abTestMap', 'advertisement') as AbTestMapModel;
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        const now = moment().format('YYYY-MM-DD HH:mm:ss');
        const updateAbTestGroupVo: AbTestGroupVO = {
            active: 0, activeTime: now,
            name: undefined, begin: undefined, end: undefined,
            description: undefined, versionGroupId: undefined,
            nativeTmplConfGroupId: undefined, configGroupId: undefined, creatorId: undefined
        };

        const abTestGroupVoList = await abTestGroupModel.getListByName(versionGroupId, name, ucId, 1, undefined);

        try {
            if (!_.isEmpty(abTestGroupVoList)) {
                const { creatorId } = abTestGroupVoList[0];
                // 本账户创建的直接数据库删除
                if (creatorId === ucId) {
                    // ab 测试分组表主键列表
                    const idList = _.map(abTestGroupVoList, (abTestGroupVo) => {
                        return abTestGroupVo.id;
                    });
                    // 同时删除 ab 测试分组列表以及 ab 测试分组下的广告位
                    await Promise.all([
                        abTestGroupModel.delList(idList),
                        abTestMapModel.delList(idList)
                    ]);

                    // 线上数据更新到缓存
                    // 广告位开关不用更新
                } else {
                    await Bluebird.map(abTestGroupVoList, (abTestGroupVo) => {
                        return updateCacheServer.setCacheData(
                            ucId, 'abTestGroup', abTestGroupVo.id, updateAbTestGroupVo
                        );
                    });

                }

            }
            // 缓存用户发布状态
            await updateCacheServer.setDeployStatus(ucId);

            this.success('deleted');

        } catch (e) {
            think.logger.debug(e);
            this.fail(TaleCode.DBFaild, 'delete fail!!!');
        }

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
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        // ab 分组对象
        const abTestGroupVo = await abTestGroupModel.getVo(abTestGroupId, ucId);

        // 待更新的 ab 分组对象
        const updateAbTestGroupVo: AbTestGroupVO = {
            name: undefined, begin: undefined, end: undefined, description: undefined,
            creatorId: undefined, active: undefined, activeTime: undefined, nativeTmplConfGroupId: undefined,
            versionGroupId: undefined, configGroupId
        };

        try {
            // 本账户创建的直接数据库操作
            if (abTestGroupVo.creatorId === ucId) {
                await abTestGroupModel.updateVo(abTestGroupId, updateAbTestGroupVo);

                // 线上数据更新到缓存
            } else {
                await updateCacheServer.setCacheData(ucId, 'abTestGroup', abTestGroupId, updateAbTestGroupVo);

            }
            // 缓存用户发布状态
            await updateCacheServer.setDeployStatus(ucId);

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
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        const configGroupVo: ConfigGroupVO = {
            name, description, type, active,
            dependentId, productId, creatorId: ucId
        };
        await configGroupModel.addVo(configGroupVo);

        // 缓存用户发布状态
        await updateCacheServer.setDeployStatus(ucId);

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
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        const [
            copyedConfigGroupVo, copyedConfigVoList
        ] = await Promise.all([
            configGroupModel.getVo(copyId, ucId),
            configModel.getListByGroup(copyId, ucId)
        ]);

        if (_.isEmpty(copyedConfigGroupVo)) {
            return this.fail(TaleCode.DBFaild, '被复制组不存在!!!');
        }
        // 被复制组的依赖组，光联的应用主键，常量类型被复制
        const {
            dependentId, productId, type
        } = copyedConfigGroupVo;

        const configGroupVo: ConfigGroupVO = {
            name, description, type, active,
            dependentId, productId, creatorId: ucId
        };
        const configGroupId = await configGroupModel.addVo(configGroupVo);

        // 常量批量保存，更改常量组和创造者主键 creatorId
        const configVoList = _.map(copyedConfigVoList, (copyedConfigVo) => {
            const configVo = _.clone(copyedConfigVo);

            // 删除不必要的字段
            delete configVo.id;
            delete configVo.createAt;
            delete configVo.createAt;

            configVo.configGroupId = configGroupId;
            configVo.creatorId = ucId;

            return configVo;

        });
        await configModel.addList(configVoList);

        // 缓存用户发布状态
        await updateCacheServer.setDeployStatus(ucId);

        return this.success('copyed');

    }

    /**
     * <br/>更新常量组
     * @argument {UpdateConfigGroupReqVO}
     * @returns {UpdateConfigGroupResVO}
     * @debugger yes
     */
    public async updateConfigGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const id: string = this.post('id');
        const dependentId: string = this.post('dependentId');
        const description: string = this.post('description');
        const active: number = this.post('active');
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        // 当前常量组对象
        const configGroupVo = await configGroupModel.getVo(id, ucId);
        // 待更新常量组对象
        const updateConfigGroupVo: ConfigGroupVO = {
            name: undefined, description, dependentId, active,
            type: undefined, productId: undefined, creatorId: undefined
        };

        try {
            // 本账户创建的直接数据库操作
            if (configGroupVo.creatorId === ucId) {
                await configGroupModel.updateVo(id, updateConfigGroupVo);

                // 线上数据更新到缓存
            } else {
                await updateCacheServer.setCacheData(ucId, 'configGroup', id, updateConfigGroupVo);

            }
            // 缓存用户发布状态
            await updateCacheServer.setDeployStatus(ucId);

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
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        // 广告常量的 active 和 activeTime 都为默认值（线上值）
        const configVo = await configModel.getByGroupAndKey(key, configGroupId, ucId, 1);

        // 待更新的广告常量
        const updateConfigVo: ConfigVO = {
            key, value, description, active,
            configGroupId, activeTime: undefined, creatorId: undefined
        };

        try {
            // 数据库不存在，则插入，同时创建者暂时设置为当前操作用户
            if (_.isEmpty(configVo)) {
                updateConfigVo.creatorId = ucId;
                await configModel.addVo(updateConfigVo);

                // 存在加入缓存
            } else {
                const { id } = configVo;
                await updateCacheServer.setCacheData(ucId, 'config', id, updateConfigVo);

            }
            // 缓存用户发布状态
            await updateCacheServer.setDeployStatus(ucId);

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
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        // 创建，先在数据库中暂存，待发布再更新上线， activeTime 标识
        const CacheActiveTime = think.config('CacheActiveTime');
        // 常量表对象
        const configVo: ConfigVO = {
            key, value, description,
            configGroupId, creatorId: ucId, active, activeTime: CacheActiveTime
        };
        await configModel.addVo(configVo);

        // 缓存用户发布状态
        await updateCacheServer.setDeployStatus(ucId);

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
        const value: string = this.post('value');
        const description: string = this.post('description');
        const active: number = this.post('active');
        const configModel = this.taleModel('config', 'advertisement') as ConfigModel;
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        const configVo = await configModel.getVo(id, ucId);

        const updateConfigVo: ConfigVO = {
            configGroupId: undefined, creatorId: undefined, active, activeTime: undefined,
            key: undefined, value, description
        };

        try {
            // 本账户创建的直接数据库操作
            if (configVo.creatorId === ucId) {
                if (active === 0) {
                    await configModel.delVo(id);

                } else {
                    await configModel.updateVo(id, updateConfigVo);
                }

                // 线上数据更新到缓存
            } else {
                if (active === 0) {
                    const now = moment().format('YYYY-MM-DD HH:mm:ss');
                    updateConfigVo.activeTime = now;

                }
                await updateCacheServer.setCacheData(ucId, 'config', id, updateConfigVo);
            }
            // 缓存用户发布状态
            await updateCacheServer.setDeployStatus(ucId);

            this.success('updated');

        } catch (e) {
            think.logger.debug(e);
            this.fail(TaleCode.DBFaild, 'update fail!!!');
        }
    }

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
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        // ab 分组对象
        const abTestGroupVo = await abTestGroupModel.getVo(abTestGroupId, ucId);

        // 待更新的 ab 分组对象
        const updateAbTestGroupVo: AbTestGroupVO = {
            name: undefined, begin: undefined, end: undefined, description: undefined,
            creatorId: undefined, active: undefined, activeTime: undefined, nativeTmplConfGroupId,
            versionGroupId: undefined, configGroupId: undefined
        };

        try {
            // 本账户创建的直接数据库操作
            if (abTestGroupVo.creatorId === ucId) {
                await abTestGroupModel.updateVo(abTestGroupId, updateAbTestGroupVo);

                // 线上数据更新到缓存
            } else {
                await updateCacheServer.setCacheData(ucId, 'abTestGroup', abTestGroupId, updateAbTestGroupVo);

            }
            // 缓存用户发布状态
            await updateCacheServer.setDeployStatus(ucId);

            this.success('updated');

        } catch (e) {
            think.logger.debug(e);
            this.fail(TaleCode.DBFaild, 'update fail!!!');
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

        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;
        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;

        const nativeTmplConfGroupVo: NativeTmplConfGroupVO = {
            name, description, productId, active, creatorId: ucId
        };
        await nativeTmplConfGroupModel.addVo(nativeTmplConfGroupVo);

        // 缓存用户发布状态
        await updateCacheServer.setDeployStatus(ucId);

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
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        const [
            copyedNativeTmplConfGroupVo, copyedNativeTmplConfVoList
        ] = await Promise.all([
            nativeTmplConfGroupModel.getVo(copyId, ucId),
            nativeTmplConfModel.getListByGroup(copyId, ucId)
        ]);

        if (_.isEmpty(copyedNativeTmplConfGroupVo)) {
            return this.fail(TaleCode.DBFaild, '被复制组不存在!!!');
        }

        const { productId } = copyedNativeTmplConfGroupVo;

        const nativeTmplConfGroupVo: NativeTmplConfGroupVO = {
            name, description, productId, active, creatorId: ucId
        };
        const nativeTmplConfGroupId = await nativeTmplConfGroupModel.addVo(nativeTmplConfGroupVo);

        const nativeTmplConfVoList = await Bluebird.map(copyedNativeTmplConfVoList, async (copyedNativeTmplConfVo) => {
            const nativeTmplConfVo = _.clone(copyedNativeTmplConfVo);

            // 删除不必要的字段
            delete nativeTmplConfVo.id;
            delete nativeTmplConfVo.createAt;
            delete nativeTmplConfVo.createAt;

            nativeTmplConfVo.nativeTmplConfGroupId = nativeTmplConfGroupId;
            nativeTmplConfVo.creatorId = ucId;

            return nativeTmplConfVo;

        });
        await nativeTmplConfModel.addList(nativeTmplConfVoList);

        // 缓存用户发布状态
        await updateCacheServer.setDeployStatus(ucId);

        this.success('copyed');

    }

    /**
     * <br/>更新应用 native 模板组
     * @argument {UpdateNativeTmplConfGroupReqVO}
     * @returns {UpdateNativeTmplConfGroupResVO}
     * @debugger yes
     */
    public async updateNativeTmplConfGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const id: string = this.post('id');
        const description: string = this.post('description');
        const active: number = this.post('active');
        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        // 应用 native 模板组对象
        const nativeTmplConfGroupVo = await nativeTmplConfGroupModel.getVo(id, ucId);
        // 待更新的应用 native 模板组对象
        const updateNativeTmplConfGroupVo: NativeTmplConfGroupVO = {
            name: undefined, description, active, productId: undefined, creatorId: undefined
        };

        try {
            // 本账户创建的直接数据库操作
            if (nativeTmplConfGroupVo.creatorId === ucId) {
                await nativeTmplConfGroupModel.updateVo(id, updateNativeTmplConfGroupVo);

                // 线上数据更新到缓存
            } else {
                await updateCacheServer.setCacheData(ucId, 'nativeTmplConfGroup', id, updateNativeTmplConfGroupVo);

            }
            // 缓存用户发布状态
            await updateCacheServer.setDeployStatus(ucId);

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
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        // 创建，先在数据库中暂存，待发布再更新上线， activeTime 标识
        const CacheActiveTime = think.config('CacheActiveTime');
        const nativeTmplConfVo: NativeTmplConfVO = {
            weight, clickArea, isFull,
            nativeTmplConfGroupId, nativeTmplId, creatorId: ucId, active, activeTime: CacheActiveTime
        };

        await nativeTmplConfModel.addVo(nativeTmplConfVo);
        // 缓存用户发布状态
        await updateCacheServer.setDeployStatus(ucId);

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
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;
        const nativeTmplConfModel =
            this.taleModel('nativeTmplConf', 'advertisement') as NativeTmplConfModel;

        const nativeTmplConfVo = await nativeTmplConfModel.getVo(id, ucId);

        const updateNativeTmplConfVo: NativeTmplConfVO = {
            nativeTmplConfGroupId, nativeTmplId: undefined, activeTime: undefined, creatorId: undefined,
            weight, clickArea, isFull, active
        };

        try {
            // 本账户创建的直接数据库操作
            if (nativeTmplConfVo.creatorId === ucId) {
                if (active === 0) {
                    await nativeTmplConfModel.delVo(id);

                } else {
                    await nativeTmplConfModel.updateVo(id, updateNativeTmplConfVo);
                }

                // 线上数据更新到缓存
            } else {
                if (active === 0) {
                    const now = moment().format('YYYY-MM-DD HH:mm:ss');
                    updateNativeTmplConfVo.activeTime = now;
                }
                await updateCacheServer.setCacheData(ucId, 'nativeTmplConf', id, updateNativeTmplConfVo);
            }
            // 缓存用户发布状态
            await updateCacheServer.setDeployStatus(ucId);

            this.success('updated');

        } catch (e) {
            think.logger.debug(e);
            this.fail(TaleCode.DBFaild, 'update fail!!!');
        }

    }

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
        const type: string = this.post('type');    // ??? 如果改变 place， 需要传广告类型 type
        const active: number = this.post('active');
        const abTestMapModel = this.taleModel('abTestMap', 'advertisement') as AbTestMapModel;
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        const abTestMapVo = await abTestMapModel.getVo(abTestGroupId, place, ucId);

        // 待创建或更新的广告位表记录
        const updateAbTestMapVo: AbTestMapVO = {
            place, abTestGroupId, adGroupId, creatorId: undefined, active
        };

        try {
            think.logger.debug(`abTestMapVo1: ${JSON.stringify(abTestMapVo)}`);
            // 数据库中不存在，则直接插入数据库
            if (_.isEmpty(abTestMapVo)) {
                updateAbTestMapVo.creatorId = ucId;    // 更新需要更改 creatorId 为 ucId
                await abTestMapModel.addVo(updateAbTestMapVo);

            } else {
                const { id, creatorId } = abTestMapVo;
                // 本账户创建的直接数据库操作
                if (creatorId === ucId) {
                    await abTestMapModel.updateVo(id, updateAbTestMapVo);

                    // 线上数据更新到缓存
                } else {
                    await updateCacheServer.setCacheData(ucId, 'abTestMap', id, updateAbTestMapVo);

                }

            }
            // 缓存用户发布状态
            await updateCacheServer.setDeployStatus(ucId);

            const abTestMapVo2 = await abTestMapModel.getVo(abTestGroupId, place, ucId);
            think.logger.debug(`abTestMapVo2: ${JSON.stringify(abTestMapVo2)}`);

            if (!_.isEmpty(abTestMapVo)) {
                const abTestMapVo3 = await updateCacheServer.fetchCacheData(ucId, 'abTestMap', abTestMapVo.id);
                think.logger.debug(`abTestMapVo3: ${JSON.stringify(abTestMapVo3)}`);
            }

            this.success('updated');

        } catch (e) {
            think.logger.debug(e);
            this.fail(TaleCode.DBFaild, 'update fail!!!');
        }
    }

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
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        try {
            // 获取被全量的 ab 测试分组相关的版本条件分组 id 和 广告位表主键以及绑定的广告组，广告类型
            const [
                { versionGroupId },
                { id: abTestMapId, adGroupId }
            ] = await Promise.all([
                abTestGroupModel.getVo(id, ucId),
                abTestMapModel.getVo(id, place, ucId)
            ]);

            // 默认 ab 测试分组主键
            const { id: defaultId } = await abTestGroupModel.getDefault(versionGroupId);
            // 默认 ab 测试分组下的该广告位表主键
            const defaultAbTestMapVo = await abTestMapModel.getVo(defaultId, place, ucId);

            // 默认 ab 测试分组下的广告位表对象更新
            const updateDefaultAbTestMapVo: AbTestMapVO = {
                abTestGroupId: defaultId, creatorId: undefined, active: 1,
                place, adGroupId
            };
            // 被全量的 ab 测试分组下的广告位表对象更新
            const updateAbTestMapVo: AbTestMapVO = {
                abTestGroupId: id, creatorId: undefined, active: 0,
                place, adGroupId
            };

            // 数据库中不存在默认 ab 分组测试下的该广告位，则直接插入数据库
            if (_.isEmpty(defaultAbTestMapVo)) {
                updateDefaultAbTestMapVo.creatorId = ucId;
                await abTestMapModel.addVo(updateDefaultAbTestMapVo);

            } else {
                await updateCacheServer.setCacheData(
                    ucId, 'abTestMap', defaultAbTestMapVo.id, updateDefaultAbTestMapVo
                );

            }
            // 更新该 ab 测试分组数据，即关闭这个 ab 测试分组下的广告位
            await updateCacheServer.setCacheData(ucId, 'abTestMap', abTestMapId, updateAbTestMapVo);
            // 缓存用户发布状态
            await updateCacheServer.setDeployStatus(ucId);

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
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        const adGroupVo: AdGroupVO = {
            name, description, creatorId: ucId,
            adTypeId, productId, active
        };

        await adGroupModel.addVo(adGroupVo);
        // 缓存用户发布状态
        await updateCacheServer.setDeployStatus(ucId);

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
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;
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
            const adVo = _.clone(copyedAdVo);

            // 删除不必要的字段
            delete adVo.id;
            delete adVo.createAt;
            delete adVo.createAt;

            adVo.adGroupId = adGroupId;
            adVo.creatorId = ucId;

            return adVo;
        });

        think.logger.debug(`adVoList: ${JSON.stringify(adVoList)}`);
        await adModel.addList(adVoList);

        // 缓存用户发布状态
        await updateCacheServer.setDeployStatus(ucId);

        this.success('copyed');

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
        const description: string = this.post('description');
        const active: number = this.post('active');
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        const adGroupVo: AdGroupVO = {
            name: undefined, description, creatorId: undefined, adTypeId: undefined, productId: undefined, active
        };

        try {
            await updateCacheServer.setCacheData(ucId, 'adGroup', id, adGroupVo);

            // 缓存用户发布状态
            await updateCacheServer.setDeployStatus(ucId);

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
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        try {
            const { adTypeId, productId } = await adGroupModel.getVo(adGroupId, ucId);
            const CacheActiveTime = think.config('CacheActiveTime');

            // 创建，先在数据库中暂存，待发布再更新上线， activeTime 标识
            const adVo: AdVO = {
                productId, adGroupId, adChannelId, adTypeId,
                name, placementID, ecpm, bidding, creatorId: ucId,
                active, activeTime: CacheActiveTime,
                loader: undefined, subloader: undefined, interval: undefined, weight: undefined
            };

            await adModel.addVo(adVo);

            // 缓存用户发布状态
            await updateCacheServer.setDeployStatus(ucId);

            this.success('created');

        } catch (e) {
            think.logger.debug(e);
            this.fail(TaleCode.DBFaild, 'create fail!!!');
        }
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
        const adModel = this.taleModel('ad', 'advertisement') as AdModel;
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        // 该广告对象
        const adVo = await adModel.getVo(id, ucId);

        // 待更新广告对象
        const updateAdVo: AdVO = {
            productId: undefined, adGroupId: undefined, adChannelId: undefined, adTypeId: undefined,
            activeTime: undefined, creatorId: undefined,
            placementID, name, ecpm, interval, subloader, loader, weight, bidding, active
        };

        try {
            // 本账户创建的直接数据库操作
            if (adVo.creatorId === ucId) {
                // 直接删除
                if (active === 0) {
                    await adModel.delVo(id);
                    // 直接更新
                } else {
                    await adModel.updateVo(id, updateAdVo);
                }

                // 线上数据更新到缓存
            } else {
                if (active === 0) {
                    const now = moment().format('YYYY-MM-DD HH:mm:ss');
                    updateAdVo.activeTime = now;

                }
                await updateCacheServer.setCacheData(ucId, 'ad', id, updateAdVo);

            }

            // 缓存用户发布状态
            await updateCacheServer.setDeployStatus(ucId);

            this.success('updated');

        } catch (e) {
            think.logger.debug(e);
            this.fail(TaleCode.DBFaild, 'update fail!!!');
        }
    }

}