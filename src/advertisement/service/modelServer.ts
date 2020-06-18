/**
 * advertisement modelService
 * @module advertisement/service/modelServer
 * @see module:../../common/tale/BaseService
 */
import { think } from 'thinkjs';
import * as Bluebird from 'bluebird';
import * as _ from 'lodash';

import AdTypeModel from '../model/adType';
import AdChannelModel from '../model/adChannel';
import AdChannelMapModel from '../model/adChannelMap';
import BaseConfigModel from '../model/baseConfig';
import AdChannelConfModel from '../model/channelParamConf';
import PackParamConfModel from '../model/packParamConf';
import PackParamModel from '../model/packParam';
import VersionGroupModel from '../model/versionGroup';
import AdGroupModel from '../model/adGroup';
import ConfigGroupModel from '../model/configGroup';
import AdModel from '../model/ad';
import ConfigModel from '../model/config';
import NativeTmplConfGroupModel from '../model/nativeTmplConfGroup';
import NativeTmplConfModel from '../model/nativeTmplConf';
import NativeTmplModel from '../model/nativeTmpl';
import AbTestGroupModel from '../model/abTestGroup';
import AbTestMapModel from '../model/abTestMap';
import ProductModel from '../model/product';
import ProductAuthModel from '../model/productAuth';
import ProductGroupAuthModel from '../model/productGroupAuth';

import BaseService from '../../common/tale/BaseService';
import CacheService from './cacheServer';

import {
    VersionGroupVO, AdChannelResVO, PackParamConfResVO, ChannelParamConfResVO, ConfigGroupResVO, ConfigResVO,
    NativeTmplConfResVO, VersionGroupResVO, NativeTmplConfGroupResVO, AdGroupResVO, AdResVO, AbTestMapVO,
    AdGroupVO, ConfigGroupVO, NativeTmplConfGroupVO, AdVO, PlaceResVO
} from '../defines';

/**
 * model 重新包装，数据库操作相关 service
 * @class modelService
 * @extends @link:common/tale/BaseService
 * @author jianlong <jianlong@talefun.com>
 */
export default class ModelService extends BaseService {
    /**
     * <br/>获取所有的，广告平台和该平台下所有广告类型列表信息，列表
     */
    public async getAdChannelList() {
        const adTypeModel = this.taleModel('adType', 'advertisement') as AdTypeModel;
        const adChannelModel = this.taleModel('adChannel', 'advertisement') as AdChannelModel;
        const adChannelMapModel = this.taleModel('adChannelMap', 'advertisement') as AdChannelMapModel;

        const adChannelVoList = await adChannelModel.getList(undefined, undefined, undefined);
        const adChannelResVoList = await Bluebird.map(adChannelVoList, async (adChannelVo) => {
            const { id, test } = adChannelVo;
            const adTypeIdList = await adChannelMapModel.getAdTypeIdList(id);

            // 获取支持的广告类型
            const adTypeList = await Bluebird.map(adTypeIdList, async (adTypeId) => {
                // 只返回启用的，如果平台为正式，则只返回正式的广告类型
                const adTypeVo = await adTypeModel.getVo(adTypeId, 1, test);

                if (adTypeVo) {
                    return adTypeVo.name;
                }

            });

            const adChannelResVo: AdChannelResVO = _.defaults({
                adTypeList: _.compact(adTypeList)    // 删除空项
            }, adChannelVo);

            delete adChannelResVo.createAt;
            delete adChannelResVo.updateAt;
            return adChannelResVo;

        });
        return adChannelResVoList;

    }

    /**
     * <br/>获取广告平台和 该平台下所有广告类型列表 信息
     * @argument {string} channel 广告平台名;
     */
    public async getAdChannel(channel: string) {
        const adTypeModel = this.taleModel('adType', 'advertisement') as AdTypeModel;
        const adChannelModel = this.taleModel('adChannel', 'advertisement') as AdChannelModel;
        const adChannelMapModel = this.taleModel('adChannelMap', 'advertisement') as AdChannelMapModel;

        const adChannelVo = await adChannelModel.getByChannel(channel);
        const { id, test } = adChannelVo;

        const adTypeIdList = await adChannelMapModel.getAdTypeIdList(id);

        // 获取支持的广告类型
        const adTypeList = await Bluebird.map(adTypeIdList, async (adTypeId) => {
            const adTypeVo = await adTypeModel.getVo(adTypeId, 1, test);

            if (adTypeVo) {
                return adTypeVo.name;
            }

        });

        const adChannelResVo: AdChannelResVO = _.defaults({
            adTypeList: _.compact(adTypeList)    // 删除空项
        }, adChannelVo);

        delete adChannelResVo.createAt;
        delete adChannelResVo.updateAt;
        return adChannelResVo;

    }

    /**
     * <br/>根据用户主键 id 获取应用列表
     * @argument {string} userId 用户表 id;
     */
    public async getProductListByUser(userId: string) {
        const productAuthModel = this.taleModel('productAuth', 'advertisement') as ProductAuthModel;
        const productGroupAuthModel = this.taleModel('productGroupAuth', 'advertisement') as ProductGroupAuthModel;
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;

        const [productIdList, productGroupIdList] = await Promise.all([
            productAuthModel.getIdListByUser(userId),
            productGroupAuthModel.getIdListByUser(userId)
        ]);
        // think.logger.debug(`productIdList: ${JSON.stringify(productIdList)}`);
        // think.logger.debug(`productGroupIdList: ${JSON.stringify(productGroupIdList)}`);

        const productVoList = await productModel.getListByAuth(productIdList, productGroupIdList);

        return productVoList;

    }

    /**
     * <br/>获取应用打包参数列表信息
     * @argument {string} productId 应用表 id;
     */
    public async getPackParamConfList(productId: string) {
        const packParamModel = this.taleModel('packParam', 'advertisement') as PackParamModel;
        const packParamConfModel = this.taleModel('packParamConf', 'advertisement') as PackParamConfModel;
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;

        // 非测试应用 只能获取非测试打包参数
        const { test } = await productModel.getVo(productId);
        const packParamVoList = await packParamModel.getList(1, test);

        // 返回打包参数
        const packParamConfResVoList = await Bluebird.map(packParamVoList, async (packParamVo) => {
            const packParamConfVo = await packParamConfModel.getVo(packParamVo.id, productId);
            // 默认返回 null
            const packParamConfResVo: PackParamConfResVO = _.defaults({ value: null }, packParamVo);

            // 存在则覆盖
            if (packParamConfVo && packParamConfVo.value) {
                packParamConfResVo.value = packParamConfVo.value;
            }

            // 删除不必要的字段
            delete packParamConfResVo.createAt;
            delete packParamConfResVo.updateAt;

            return packParamConfResVo;

        });

        return packParamConfResVoList;

    }

    /**
     * <br/>获取应用广告平台参数信息
     * @argument {string} productId 应用表 id;
     * @argument {string} adType 广告类型显示名称;
     */
    public async getChannelParamConfList(productId: string, adType: string) {
        const adTypeModel = this.taleModel('adType', 'advertisement') as AdTypeModel;
        const adChannelModel = this.taleModel('adChannel', 'advertisement') as AdChannelModel;
        const channelParamConfModel = this.taleModel('channelParamConf', 'advertisement') as AdChannelConfModel;
        const adChannelMapModel = this.taleModel('adChannelMap', 'advertisement') as AdChannelMapModel;
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;

        const { test } = await productModel.getVo(productId);
        let adChannelIdList: string[] = [];

        // 获取广告类型支持下的所有广告平台
        if (adType) {
            const adTypeVo = await adTypeModel.getByName(adType);
            const { id } = adTypeVo;
            adChannelIdList = await adChannelMapModel.getAdChannelIdList(id);

        }
        // 非测试应用看不到测试广告平台数据
        const adChannelVoList = await adChannelModel.getList(1, test, adChannelIdList);

        // 返回的广告平台参数
        const channelParamConfResVoList = await Bluebird.map(adChannelVoList, async (adChannelVo) => {
            const channelParamConfVo = await channelParamConfModel.getVo(adChannelVo.id, productId);

            // 默认 value 为 null
            const channelParamConfResVo: ChannelParamConfResVO = _.defaults(
                {
                    value1: null,    // 启动参数 1 的值
                    value2: null,    // 启动参数 2 的值
                    value3: null,    // 启动参数 3 的值,
                },
                adChannelVo
            );

            if (!_.isEmpty(channelParamConfVo)) {
                const {
                    value1,
                    value2,
                    value3,
                } = channelParamConfVo;

                channelParamConfResVo.value1 = value1;
                channelParamConfResVo.value2 = value2;
                channelParamConfResVo.value3 = value3;

            }
            // 删除不必要的值
            delete channelParamConfResVo.createAt;
            delete channelParamConfResVo.updateAt;

            return channelParamConfResVo;

        });

        return channelParamConfResVoList;

    }

    /**
     * <br/>获取版本条件分组列表信息.
     * @argument {string} productId 应用表 id;
     * @argument {string} type 版本条件分组类型;
     * @argument {string} creatorId 创建者 id;
     */
    public async getVersionGroupList(productId: string, type: number, creatorId: string) {
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        // 数据库里的版本条件分组对象
        const versionGroupVoList = await versionGroupModel.getList(productId, type, creatorId);
        // 未发布更新在缓存里的版本条件分组对象哈希表，键值为主键 id
        const cacheVersionGroupVoHash = await cacheServer.fetchCacheDataHash(creatorId, 'versionGroup');

        // 返回的版本条件分组列表信息
        const versionGroupResVoList = await Bluebird.map(versionGroupVoList, async (versionGroupVo) => {
            // 更新的缓存数据
            const cacheVersionGroupVo = cacheVersionGroupVoHash[versionGroupVo.id] as VersionGroupVO;
            // 国家代码返回数组
            const codeList: string[] = JSON.parse(versionGroupVo.code);

            // 返回线上数据和未发布的数据，以未发布数据为准
            const versionGroupResVo: VersionGroupResVO = _.assign({ codeList }, versionGroupVo, cacheVersionGroupVo);

            // 删除不需要返回的数据
            delete versionGroupResVo.code;
            delete versionGroupResVo.type;
            delete versionGroupResVo.activeTime;
            delete versionGroupResVo.productId;
            delete versionGroupResVo.createAt;
            delete versionGroupResVo.updateAt;

            return versionGroupResVo;
        });

        return versionGroupResVoList;

    }

    /**
     * <br/>获取 native 模板组列表信息
     * @argument {string} productId 应用表 id;
     * @argument {string} creatorId 创建者 id
     */
    public async getNativeTmplConfGroupList(productId: string, creatorId: string) {
        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        // 数据库里的 native 模板组对象
        const nativeTmplConfGroupVoList = await nativeTmplConfGroupModel.getList(productId, creatorId);
        // 未发布更新在缓存里的 native 模板组对象哈希表
        const cacheNativeTmplConfGroupVoHash = await cacheServer.fetchCacheDataHash(creatorId, 'nativeTmplConfGroup');

        // native 模板组列表信息
        const nativeTmplConfGroupResVoList =
            await Bluebird.map(nativeTmplConfGroupVoList, async (nativeTmplConfGroupVo) => {
                const { id } = nativeTmplConfGroupVo;
                // 未发布更新在缓存里的 native 模板组对象
                const cacheNativeTmplConfGroupVo = cacheNativeTmplConfGroupVoHash[id] as NativeTmplConfGroupVO;

                const verionGroupIdList = await abTestGroupModel.getVerionGroupIdListByNative(id, creatorId);
                const versionGroupNameList =
                    await versionGroupModel.getVersionGroupNameList(verionGroupIdList, creatorId, 1);

                const nativeTmplConfGroupResVo: NativeTmplConfGroupResVO = _.assign({
                    versionGroup: versionGroupNameList, nativeTmplConfList: undefined
                }, nativeTmplConfGroupVo, cacheNativeTmplConfGroupVo);

                // 删除不需要的字段
                delete nativeTmplConfGroupResVo.productId;
                delete nativeTmplConfGroupResVo.createAt;
                delete nativeTmplConfGroupResVo.updateAt;

                return nativeTmplConfGroupResVo;

            });

        return nativeTmplConfGroupResVoList;
    }

    /**
     * <br/>获取应用下 native 模板列表信息
     * @argument {string} nativeTmplConfGroupId 应用下 native 模板组表 id;
     * @argument {string} creatorId 创建者 id
     */
    public async getNativeTmplConfList(nativeTmplConfGroupId: string, creatorId: string) {
        const nativeTmplModel = this.taleModel('nativeTmpl', 'advertisement') as NativeTmplModel;
        const nativeTmplConfModel = this.taleModel('nativeTmplConf', 'advertisement') as NativeTmplConfModel;
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        // 数据库里的 native 模板对象
        const nativeTmplConfVoList = await nativeTmplConfModel.getList(nativeTmplConfGroupId, creatorId);
        // 未发布更新在缓存里的 native 模板对象哈希表，优化批量取出，减少 redis io
        const cacheNativeTmplConfVoHash = await cacheServer.fetchCacheDataHash(creatorId, 'nativeTmplConf');

        const nativeTmplConfResVoList = await Bluebird.map(nativeTmplConfVoList, async (nativeTmplConfVo) => {

            // 从 native 模板表常规配置中获取 key, preview
            const { nativeTmplId } = nativeTmplConfVo;
            const nativeTmplVo = await nativeTmplModel.getVo(nativeTmplId, undefined, undefined);

            if (think.isEmpty(nativeTmplVo)) {
                return;
            }

            const { key, preview } = nativeTmplVo;
            // 未发布更新在缓存里的 native 模板对象
            const cacheNativeTmplConfVo = cacheNativeTmplConfVoHash[nativeTmplConfVo.id];

            const nativeTmplConfResVo: NativeTmplConfResVO = _.assign({
                key, preview
            }, nativeTmplConfVo, cacheNativeTmplConfVo);

            // 删除不必要的字段
            delete nativeTmplConfResVo.nativeTmplConfGroupId;
            delete nativeTmplConfResVo.nativeTmplId;
            delete nativeTmplConfResVo.activeTime;
            delete nativeTmplConfResVo.createAt;
            delete nativeTmplConfResVo.updateAt;
            return nativeTmplConfResVo;
        });

        return _.compact(nativeTmplConfResVoList);
    }

    /**
     * <br/>获取广告组列表信息
     * @argument {string} productId 应用表 id;
     * @argument {string} creatorId 创建者 id
     */
    public async getAdGroupList(productId: string, creatorId: string) {
        const adGroupModel = this.taleModel('adGroup', 'advertisement') as AdGroupModel;
        const abTestMapModel = this.taleModel('abTestMap', 'advertisement') as AbTestMapModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const adTypeModel = this.taleModel('adType', 'advertisement') as AdTypeModel;
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        // 数据库里的广告组对象
        const adGroupVoList = await adGroupModel.getList(productId, creatorId);
        // 未发布更新在缓存里的广告组对象
        const cacheAdGroupVoHash = await cacheServer.fetchCacheDataHash(creatorId, 'adGroup');

        const adGroupResVoList = await Bluebird.map(adGroupVoList, async (adGroupVo) => {
            const { id, adTypeId } = adGroupVo;

            const cacheAdGroupVo = cacheAdGroupVoHash[id] as AdGroupVO;
            const adTypeVo = await adTypeModel.getVo(adTypeId, undefined, undefined);

            if (think.isEmpty(adTypeVo)) {
                return;
            }

            const { name: type } = adTypeVo;

            const verionGroupIdList = await abTestMapModel.getAbTestGroupIdByAdGroup(id, creatorId);
            const versionGroupNameList =
                await versionGroupModel.getVersionGroupNameList(verionGroupIdList, creatorId, 1);

            const adGroupResVo: AdGroupResVO = _.assign({
                type, versionGroup: versionGroupNameList, adList: undefined
            }, adGroupVo, cacheAdGroupVo);

            delete adGroupResVo.productId;
            delete adGroupResVo.adTypeId;
            delete adGroupResVo.creatorId;
            delete adGroupResVo.createAt;
            delete adGroupResVo.updateAt;
            return adGroupResVo;
        });

        return _.compact(adGroupResVoList);
    }

    /**
     * <br/>获取广告列表信息
     * @argument {string} productId 应用表 id;
     * @argument {string} creatorId 创建者 id
     */
    public async getAdList(productId: string, creatorId: string) {
        const adGroupModel = this.taleModel('adGroup', 'advertisement') as AdGroupModel;
        const adModel = this.taleModel('ad', 'advertisement') as AdModel;
        const adTypeModel = this.taleModel('adType', 'advertisement') as AdTypeModel;
        const adChannelModel = this.taleModel('adChannel', 'advertisement') as AdChannelModel;

        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        // 数据库里的广告对象
        const adVoList = await adModel.getListByProduct(productId, creatorId);
        // 未发布更新在缓存里的广告对象
        const cacheAdVoHash = await cacheServer.fetchCacheDataHash(creatorId, 'ad');

        const adResVoList: AdResVO[] = await Bluebird.map(adVoList, async (adVo) => {
            const { id, adChannelId, adTypeId, adGroupId } = adVo;

            const cacheAdVo = cacheAdVoHash[id] as AdVO;

            const [
                adTypeVo, adChannelVo, adGroupVo
            ] = await Promise.all([
                adTypeModel.getVo(adTypeId, undefined, undefined),
                adChannelModel.getVo(adChannelId, undefined, undefined),
                adGroupModel.getVo(adGroupId, creatorId)
            ]);

            if (think.isEmpty(adTypeVo) || think.isEmpty(adChannelVo) || think.isEmpty(adGroupVo)) {
                return;
            }

            const { name: type } = adTypeVo;
            const { channel } = adChannelVo;
            const { name: adGroupName } = adGroupVo;

            const adResVo: AdResVO = _.assign({
                type, channel, adGroupName, isEcpm: false, isLoader: false, isSubloader: false
            }, adVo, cacheAdVo);

            delete adResVo.productId;
            delete adResVo.adGroupId;
            delete adResVo.adTypeId;
            delete adResVo.adChannelId;
            delete adResVo.createAt;
            delete adResVo.updateAt;
            return adResVo;
        });

        return _.compact(adResVoList);
    }

    /**
     * <br/>获取广告组下广告列表信息
     * @argument {string} adGroupId 广告组表 id;
     * @argument {string} creatorId 创建者 id
     */
    public async getAdListInAdGroup(adGroupId: string, creatorId: string) {
        const adModel = this.taleModel('ad', 'advertisement') as AdModel;
        const adChannelModel = this.taleModel('adChannel', 'advertisement') as AdChannelModel;
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        // 数据库里的广告对象
        const adVoList = await adModel.getListByAdGroup(adGroupId, creatorId);
        // 未发布更新在缓存里的广告对象哈希表
        const cacheAdVoHash = await cacheServer.fetchCacheDataHash(creatorId, 'ad');

        const adResVoList = await Bluebird.map(adVoList, async (adVo) => {
            // 获取广告平台名
            const { adChannelId } = adVo;
            const adChannelVo = await adChannelModel.getVo(adChannelId, undefined, undefined);

            if (think.isEmpty(adChannelVo)) {
                return;

            }
            const { channel } = adChannelVo;

            const adResVo: AdResVO = _.assign({
                channel, adGroupName: undefined, type: undefined, isEcpm: false, isLoader: false, isSubloader: false
            }, adVo, cacheAdVoHash[adVo.id]);

            delete adResVo.productId;
            delete adResVo.adGroupId;
            delete adResVo.adTypeId;
            delete adResVo.adChannelId;
            delete adResVo.activeTime;
            delete adResVo.createAt;
            delete adResVo.updateAt;
            return adResVo;
        });

        return _.compact(adResVoList);
    }

    /**
     * 获取关联组下常量数据,
     * <br/>迭代查询关联组下的常量，一起返回
     * @argument {string} dependent 关联组名
     * @argument {string} dependentId 关联组主键 id
     * @argument {string} creatorId 创建者 id
     * @argument {{ [propName: string]: ConfigResVO; }} dpdConfigVoHash 关联组下常量数据
     */
    private async getDpdConfigVoHash(
        dependent: string,
        dependentId: string,
        creatorId: string,
        dpdConfigVoHash: { [propName: string]: ConfigResVO; } = {}
    ): Promise<{ [propName: string]: ConfigResVO; }> {
        const configModel = this.taleModel('config', 'advertisement') as ConfigModel;
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;

        const [
            configVoList,
            configGroupVo
        ] = await Promise.all([
            configModel.getList(dependentId, creatorId, 1),
            configGroupModel.getVo(dependentId, creatorId)
        ]);

        // 依赖组未配置或者失效直接返回
        if (think.isEmpty(configGroupVo) || !configGroupVo.active) {
            return dpdConfigVoHash;
        }

        const configVoHash: { [propName: string]: ConfigResVO; } = {};
        configVoList.map((configVo) => {
            const { key } = configVo;
            configVoHash[key] = _.defaults({ dependent }, configVo);
        });

        _.defaults(dpdConfigVoHash, configVoHash);

        // 依赖组存在依赖组继续迭代，否则返回
        if (configGroupVo.dependentId) {
            return await this.getDpdConfigVoHash(dependent, configGroupVo.dependentId, creatorId, dpdConfigVoHash);

        } else {
            return dpdConfigVoHash;
        }

    }

    /**
     * <br/>获取常量组下常量数据列表,
     * <br/>迭代查询关联组下的常量，一起返回
     * @argument {string} configGroupId 常量组主键 id
     * @argument {string} creatorId 创建者 id
     */
    public async getConfigList(configGroupId: string, creatorId: string) {
        const configModel = this.taleModel('config', 'advertisement') as ConfigModel;
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;
        const baseConfigModel = this.taleModel('baseConfig', 'advertisement') as BaseConfigModel;
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        // 未发布更新在缓存里的常量对象
        const cacheConfigVoHash = await cacheServer.fetchCacheDataHash(creatorId, 'config');

        const [
            configVoList,
            configGroupVo
        ] = await Promise.all([
            configModel.getList(configGroupId, creatorId, undefined),
            configGroupModel.getVo(configGroupId, creatorId)
        ]);

        if (!configGroupVo) {
            return;
        }
        // 获取常量组的依赖组，关联的应用表主键和常量类型（广告常量或者游戏常量）
        const { dependentId, type, productId } = configGroupVo;

        // 当前常量组常量, 哈希表的键值为常量表主键
        const configVoHash: { [propName: string]: ConfigResVO; } = {};

        configVoList.map((configVo) => {
            const { key } = configVo;
            configVoHash[key] = _.defaults({ dependent: null }, configVo) as ConfigResVO;
        });

        // think.logger.debug(`configVoHash1: ${JSON.stringify(configVoHash)}`);

        // 依赖组常量
        let dpdConfigVoHash: { [propName: string]: ConfigResVO; } = {};
        if (dependentId) {
            const { name: dependent } = await configGroupModel.getVo(dependentId, creatorId);    // 关联组名
            think.logger.debug(`dependent: ${dependent}`);

            dpdConfigVoHash = await this.getDpdConfigVoHash(dependent, dependentId, creatorId);

            // think.logger.debug(`dpdConfigVoHash: ${JSON.stringify(dpdConfigVoHash)}`);
            // 以当前常量组常量为准
            _.defaults(configVoHash, dpdConfigVoHash);

        }
        // think.logger.debug(`configVoHash2: ${JSON.stringify(configVoHash)}`);

        // 广告常量依赖于基础常量
        const baseConfigVoHash: { [propName: string]: ConfigResVO; } = {};
        if (type === 0) {
            const { test } = await productModel.getVo(productId);
            const baseConfigVoList = await baseConfigModel.getList(1, test);

            baseConfigVoList.map((baseConfigVo) => {
                const { key } = baseConfigVo;
                // 删除 test 字段
                delete baseConfigVo.test;

                baseConfigVoHash[key] = _.defaults(
                    {
                        dependent: '基础常量', creatorId: undefined, activeTime: undefined, configGroupId: undefined
                    },
                    baseConfigVo
                ) as ConfigResVO;
            });
            // think.logger.debug(`baseConfigVoHash: ${JSON.stringify(baseConfigVoHash)}`);

            // 以基础常量 key 为准， 基础常量关闭则不返回
            for (const key in baseConfigVoHash) {

                if (baseConfigVoHash.hasOwnProperty(key)) {
                    configVoHash[key] = configVoHash[key] || baseConfigVoHash[key];
                }
            }
        }

        const configResVoList = _.values(configVoHash);

        return _.map(configResVoList, (configVo) => {
            // 缓存中数据
            const cacheConfigVo = cacheConfigVoHash[configVo.id] as ConfigResVO;
            const configResVo = _.assign(configVo, cacheConfigVo);

            // 删除不需要的字段
            delete configResVo.configGroupId;
            delete configResVo.createAt;
            delete configResVo.updateAt;

            return configResVo;
        });

    }

    /**
     * 获取常量组信息列表
     * @argument {string} productId 应用表主键 id
     * @argument {number} type 0 广告 1 游戏常量
     * @argument {string} creatorId 创建者 id
     */
    public async getConfigGroupList(productId: string, type: number, creatorId: string) {
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        // 数据库里的常量组对象
        const configGroupVoList = await configGroupModel.getListByProductAndType(productId, type, creatorId);
        // 未发布更新在缓存里的常量组对象哈希表
        const cacheConfigGroupVoHash = await cacheServer.fetchCacheDataHash(creatorId, 'configGroup');

        const configGroupResVoList = await Bluebird.map(configGroupVoList, async (configGroupVo) => {
            const { id, dependentId } = configGroupVo;
            // 未发布更新在缓存里的常量组对象
            const cacheConfigGroupVo = cacheConfigGroupVoHash[id] as ConfigGroupVO;

            // 获取依赖组名
            let dependent: string;
            if (dependentId) {
                dependent = (await configGroupModel.getVo(dependentId, creatorId)).name;
            }

            const verionGroupIdList = await abTestGroupModel.getVerionGroupIdListByConfig(id, creatorId);
            const versionGroupNameList =
                await versionGroupModel.getVersionGroupNameList(verionGroupIdList, creatorId, 1);

            const configGroupResVo: ConfigGroupResVO = _.assign({
                dependent: dependent || null, versionGroup: versionGroupNameList, configList: undefined
            }, configGroupVo, cacheConfigGroupVo);

            // 删除不需要的字段
            delete configGroupResVo.productId;
            delete configGroupResVo.dependentId;
            delete configGroupResVo.createAt;
            delete configGroupResVo.updateAt;

            return configGroupResVo;

        });
        return configGroupResVoList;

    }

    /**
     * <br/>获取常量组数据
     * @argument {string} id 常量组主键 id
     * @argument {string} creatorId 创建者 id
     */
    public async getConfigGroup(configGroupId: string, creatorId: string) {
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        // 数据库里的常量组对象
        const configGroupVo = await configGroupModel.getVo(configGroupId, creatorId);
        // 未发布更新在缓存里的常量组对象
        const cacheConfigGroupVo =
            await cacheServer.fetchCacheData(creatorId, 'configGroup', configGroupId);

        // 不能看到其他人创建的组
        if (!configGroupVo) {
            return;
        }
        const { dependentId } = configGroupVo;

        let dependent: string;
        if (dependentId) {
            const dependentVo = await configGroupModel.getVo(dependentId, creatorId);

            // 不能看到其他人创建的组
            if (dependentVo) {
                dependent = dependentVo.name;
            }
        }

        const configGroupResVo: ConfigGroupResVO = _.assign({
            dependent: dependent || null, versionGroup: undefined
        }, configGroupVo, cacheConfigGroupVo);

        delete configGroupResVo.productId;
        delete configGroupResVo.dependentId;
        delete configGroupResVo.createAt;
        delete configGroupResVo.updateAt;
        return configGroupResVo;
    }

    /**
     * <br/>获取 native 模板组信息
     * @argument {string} nativeTmplConfGroupId  native 模板组表 id;
     * @argument {string} creatorId 创建者 id
     */
    public async getNativeTmplConfGroup(nativeTmplConfGroupId: string, creatorId: string) {
        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;

        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        // 数据库里的 native 模板组对象
        const nativeTmplConfGroupVo =
            await nativeTmplConfGroupModel.getVo(nativeTmplConfGroupId, creatorId);
        // 未发布更新在缓存里的 native 模板组对象
        const cacheNativeTmplConfGroupVo =
            await cacheServer.fetchCacheData(creatorId, 'nativeTmplConfGroup', nativeTmplConfGroupId);

        if (!nativeTmplConfGroupVo) {
            return;
        }

        const nativeTmplConfGroupResVo: NativeTmplConfGroupResVO = _.assign({
            versionGroup: undefined, nativeTmplConfList: undefined
        }, nativeTmplConfGroupVo, cacheNativeTmplConfGroupVo);

        delete nativeTmplConfGroupResVo.productId;
        delete nativeTmplConfGroupResVo.createAt;
        delete nativeTmplConfGroupResVo.updateAt;
        return nativeTmplConfGroupResVo;
    }

    /**
     * <br/>获取广告位列表信息
     * @argument {string} abTestGroupId ab 测试分组表主键 id;
     * @argument {string} creatorId 创建者 id
     */
    public async getPlaceList(abTestGroupId: string, creatorId: string) {
        const adTypeModel = this.taleModel('adType', 'advertisement') as AdTypeModel;
        const adGroupModel = this.taleModel('adGroup', 'advertisement') as AdGroupModel;
        const abTestMapModel = this.taleModel('abTestMap', 'advertisement') as AbTestMapModel;
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        // 数据库里的广告位对象
        const abTestMapVoList = await abTestMapModel.getList(abTestGroupId, creatorId);

        // 未发布更新在缓存里的广告位对象哈希表 和 广告组对象哈希表
        const [
            cacheAbTestMapVoHash, cacheAdGroupVoHash
        ] = await Promise.all([
            cacheServer.fetchCacheDataHash(creatorId, 'abTestMap'),
            cacheServer.fetchCacheDataHash(creatorId, 'adGroup')
        ]);

        // 广告位列表信息
        const placeResVoList: PlaceResVO[] = await Bluebird.map(abTestMapVoList, async (abTestMapVo) => {
            // 获取缓存中未发布更新的 ab 测试分组对象
            const cacheAbTestMapVo = cacheAbTestMapVoHash[abTestMapVo.id] as AbTestMapVO;
            // 缓存中有更新，则以缓存中数据为准
            _.assign(abTestMapVo, cacheAbTestMapVo);

            // 广告组主键和广告类型名
            const { adGroupId, place } = abTestMapVo;

            // 广告类型显示名称
            const { name: typeName } = await adTypeModel.getByType(place);

            const placeResVo: PlaceResVO = _.defaults({
                adGroup: null, type: typeName
            }, abTestMapVo);

            if (adGroupId) {
                const [adGroupVo, adList] = await Promise.all([
                    adGroupModel.getVo(adGroupId, creatorId),
                    this.getAdListInAdGroup(adGroupId, creatorId)
                ]);
                // 获取缓存中未发布更新，redis 哈希域为广告组表主键 id
                const cacheAdGroupVo = cacheAdGroupVoHash[adGroupId] as AdGroupVO;

                const adGroupResVo: AdGroupResVO = _.assign({
                    type: typeName, adList, versionGroup: undefined
                }, adGroupVo, cacheAdGroupVo);

                // 删除不需要的字段
                delete adGroupResVo.productId;
                delete adGroupResVo.adTypeId;
                delete adGroupResVo.createAt;
                delete adGroupResVo.updateAt;

                placeResVo.adGroup = adGroupResVo;
            }

            // 删除不需要的字段
            delete placeResVo.abTestGroupId;
            delete placeResVo.adGroupId;
            delete placeResVo.createAt;
            delete placeResVo.updateAt;

            return placeResVo;
        });

        return _.compact(placeResVoList);

    }

}