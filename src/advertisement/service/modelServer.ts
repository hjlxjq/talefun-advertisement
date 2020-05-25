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
import NationModel from '../model/nation';
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
import ProductGroupModel from '../model/productGroup';
import ProductAuthModel from '../model/productAuth';
import ProductGroupAuthModel from '../model/productGroupAuth';

import BaseService from '../../common/tale/BaseService';
import CacheService from './cacheServer';

import {
    VersionGroupVO, AdChannelResVO, PackParamConfResVO, ChannelParamConfResVO, ConfigGroupResVO, ConfigResVO,
    NativeTmplConfResVO, VersionGroupResVO, NativeTmplConfGroupResVO, AdGroupResVO, AdResVO, AbTestMapVO, AdGroupVO,
} from '../defines';
import { VersionGroupListResVO } from '../interface';

/**
 * model 重新包装，包含日志处理相关 service
 * @class modelService
 * @extends @link:common/tale/BaseService
 * @author jianlong <jianlong@talefun.com>
 */
export default class ModelService extends BaseService {

    /**
     * <br/>获取广告平台和该平台下所有广告类型列表信息
     */
    public async getAdChannelList() {
        const adTypeModel = this.taleModel('adType', 'advertisement') as AdTypeModel;
        const adChannelModel = this.taleModel('adChannel', 'advertisement') as AdChannelModel;
        const adChannelMapModel = this.taleModel('adChannelMap', 'advertisement') as AdChannelMapModel;

        const adChannelVoList = await adChannelModel.getList();
        const adChannelResVoList = await Bluebird.map(adChannelVoList, async (adChannelVo) => {

            const { id, test } = adChannelVo;
            const adTypeIdList = await adChannelMapModel.getAdTypeIdList(id);

            // 获取支持的广告类型
            const adTypeList = await Bluebird.map(adTypeIdList, async (adTypeId) => {
                const adTypeVo = await adTypeModel.getAdType(adTypeId, 1, test);

                if (adTypeVo) {
                    return adTypeVo.name;
                }
            });

            const adChannelResVo: AdChannelResVO = _.defaults({
                adTypeList: _.compact(adTypeList)    // 删除空项
            }, adChannelVo);

            return adChannelResVo;
        });

        return adChannelResVoList;
    }

    /**
     * <br/>获取广告平台和该平台下所有广告类型列表信息
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
            const adTypeVo = await adTypeModel.getAdType(adTypeId, 1, test);

            if (adTypeVo) {
                return adTypeVo.name;
            }
        });

        const adChannelResVo: AdChannelResVO = _.defaults({
            adTypeList: _.compact(adTypeList)    // 删除空项
        }, adChannelVo);

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
        think.logger.debug(`productIdList: ${JSON.stringify(productIdList)}`);
        think.logger.debug(`productGroupIdList: ${JSON.stringify(productGroupIdList)}`);

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

        const { test } = await productModel.getProduct(productId);
        const packParamVoList = await packParamModel.getList(1, test);

        const packParamConfResVoList = await Bluebird.map(packParamVoList, async (packParamVo) => {
            let value: string = null;
            const packParamConfVo = await packParamConfModel.getPackParamConf(packParamVo.id, productId);

            if (packParamConfVo) {
                ({ value } = packParamConfVo);
            }
            const packParamConfResVo: PackParamConfResVO = _.defaults({ value }, packParamVo);

            return packParamConfResVo;
        });

        return packParamConfResVoList;
    }

    /**
     * <br/>获取应用广告平台参数信息
     * @argument {string} productId 应用表 id;
     */
    public async getChannelParamConfList(productId: string, adType?: string) {
        const adTypeModel = this.taleModel('adType', 'advertisement') as AdTypeModel;
        const adChannelModel = this.taleModel('adChannel', 'advertisement') as AdChannelModel;
        const channelParamConfModel = this.taleModel('channelParamConf', 'advertisement') as AdChannelConfModel;
        const adChannelMapModel = this.taleModel('adChannelMap', 'advertisement') as AdChannelMapModel;
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;

        const { test } = await productModel.getProduct(productId);
        let adChannelIdList: string[] = [];

        if (adType) {
            const adTypeVo = await adTypeModel.getByName(adType);
            const { id } = adTypeVo;
            adChannelIdList = await adChannelMapModel.getAdChannelIdList(id);
        }
        const adChannelVoList = await adChannelModel.getList(1, test, adChannelIdList);

        const channelParamConfResVoList = await Bluebird.map(adChannelVoList, async (adChannelVo) => {
            const channelParamConfVo = await channelParamConfModel.getChannelParamConf(adChannelVo.id, productId);

            let value1: string = null;    // 启动参数 1 的值
            let value2: string = null;    // 启动参数 2 的值
            let value3: string = null;    // 启动参数 3 的值,

            if (channelParamConfVo) {
                ({
                    value1,
                    value2,
                    value3,
                } = channelParamConfVo);
            }
            const channelParamConfResVo: ChannelParamConfResVO = _.defaults(
                {
                    value1,    // 启动参数 1 的值
                    value2,    // 启动参数 2 的值
                    value3,    // 启动参数 3 的值,
                },
                adChannelVo
            );

            return channelParamConfResVo;
        });

        return channelParamConfResVoList;
    }

    /**
     * <br/>获取版本分组控制列表信息
     * @argument {string} productId 应用表 id;
     * @argument {string} type 版本分组类型;
     * @argument {string} creatorId 创建者 id
     */
    public async getVersionGroupList(productId: string, type: number, creatorId: string) {
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        // 数据库里的版本条件分组对象
        const versionGroupVoList = await versionGroupModel.getList(productId, type, creatorId);
        // 未发布更新在缓存里的版本条件分组对象
        const cacheVersionGroupVoHash = await cacheServer.fetchCacheDataHash(creatorId, 'versionGroupModel');

        const versionGroupResVoList = await Bluebird.map(versionGroupVoList, async (versionGroupVo) => {

            // 更新的缓存数据
            const cacheVersionGroupVo = cacheVersionGroupVoHash[versionGroupVo.id] as VersionGroupVO;
            // 国家代码返回数组
            const codeList: string[] = JSON.parse(versionGroupVo.code);

            // 删除不需要返回的数据
            delete versionGroupVo.code;
            delete versionGroupVo.productId;
            delete versionGroupVo.createAt;
            delete versionGroupVo.updateAt;

            // 返回线上数据和未发布的数据，以未发布数据为准
            const versionGroupResVo: VersionGroupResVO = _.assign({ codeList }, versionGroupVo, cacheVersionGroupVo);

            return versionGroupResVo;
        });

        return versionGroupResVoList;
    }

    /**
     * <br/>获取 native 模板组列表信息
     * @argument {string} productId 应用表 id;
     */
    public async getNativeTmplConfGroupList(productId: string) {
        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;

        const nativeTmplConfGroupVoList = await nativeTmplConfGroupModel.getList(productId);

        const nativeTmplConfGroupResVoList =
            await Bluebird.map(nativeTmplConfGroupVoList, async (nativeTmplConfGroupVo) => {
                const { id } = nativeTmplConfGroupVo;

                const verionGroupIdList = await abTestGroupModel.getVerionGroupIdListByNative(id);
                const versionGroupNameList = await versionGroupModel.getVersionGroupNameList(verionGroupIdList, 1);

                delete nativeTmplConfGroupVo.productId;
                const nativeTmplConfGroupResVo: NativeTmplConfGroupResVO = _.defaults({
                    versionGroup: versionGroupNameList,
                }, nativeTmplConfGroupVo);

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
        const cacheAdVoHash = await cacheServer.fetchCacheDataHash(creatorId, 'nativeTmplConfModel');

        const nativeTmplConfResVoList = await Bluebird.map(nativeTmplConfVoList, async (nativeTmplConfVo) => {

            const { nativeTmplId } = nativeTmplConfVo;
            const nativeTmplVo = await nativeTmplModel.getNativeTmpl(nativeTmplId);

            if (think.isEmpty(nativeTmplVo)) {
                return;

            }
            const { key, preview } = nativeTmplVo;
            const cacheNativeTmplConfVo = cacheAdVoHash[nativeTmplConfVo.id];

            const nativeTmplConfResVo: NativeTmplConfResVO = _.assign({
                key, preview
            }, nativeTmplConfVo, cacheNativeTmplConfVo);

            delete nativeTmplConfResVo.nativeTmplConfGroupId;
            delete nativeTmplConfResVo.nativeTmplId;
            delete nativeTmplConfResVo.createAt;
            delete nativeTmplConfResVo.updateAt;
            return nativeTmplConfResVo;
        });

        return _.compact(nativeTmplConfResVoList);
    }

    /**
     * <br/>获取广告组列表信息
     * @argument {string} productId 应用表 id;
     */
    public async getAdGroupList(productId: string) {
        const adGroupModel = this.taleModel('adGroup', 'advertisement') as AdGroupModel;
        const abTestMapModel = this.taleModel('abTestMap', 'advertisement') as AbTestMapModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const adTypeModel = this.taleModel('adType', 'advertisement') as AdTypeModel;

        const adGroupVoList = await adGroupModel.getList(productId);
        const adGroupResVoList = await Bluebird.map(adGroupVoList, async (adGroupVo) => {
            const { id, adTypeId } = adGroupVo;
            const adTypeVo = await adTypeModel.getAdType(adTypeId);

            if (think.isEmpty(adTypeVo)) {
                return;
            }

            const { name: type } = adTypeVo;

            const verionGroupIdList = await abTestMapModel.getAbTestGroupIdByAdGrroup(id);
            const versionGroupNameList = await versionGroupModel.getVersionGroupNameList(verionGroupIdList, 1);

            delete adGroupVo.productId;
            delete adGroupVo.adTypeId;

            const adGroupResVo: AdGroupResVO = _.defaults({
                type, versionGroup: versionGroupNameList,
            }, adGroupVo);

            return adGroupResVo;
        });

        return _.compact(adGroupResVoList);
    }

    /**
     * <br/>获取广告列表信息
     * @argument {string} productId 应用表 id;
     */
    public async getAdList(productId: string) {
        const adGroupModel = this.taleModel('adGroup', 'advertisement') as AdGroupModel;
        const adModel = this.taleModel('ad', 'advertisement') as AdModel;
        const adTypeModel = this.taleModel('adType', 'advertisement') as AdTypeModel;
        const adChannelModel = this.taleModel('adChannel', 'advertisement') as AdChannelModel;

        const adVoList = await adModel.getListByProduct(productId);
        const adResVoList: AdResVO[] = await Bluebird.map(adVoList, async (adVo) => {
            const { adChannelId, adTypeId, adGroupId } = adVo;

            const [
                adTypeVo, adChannelVo, adGroupVo
            ] = await Promise.all([
                adTypeModel.getAdType(adTypeId),
                adChannelModel.getAdChannel(adChannelId),
                adGroupModel.getAdGroup(adGroupId)
            ]);

            if (think.isEmpty(adTypeVo) || think.isEmpty(adChannelVo) || think.isEmpty(adGroupVo)) {
                return;
            }

            const { name: type } = adTypeVo;
            const { channel } = adChannelVo;
            const { name: adGroupName } = adGroupVo;

            delete adVo.productId;
            delete adVo.adGroupId;
            delete adVo.adTypeId;
            delete adVo.adChannelId;

            const adResVo: AdResVO = _.defaults({
                type, channel, adGroupName, isEcpm: false, isLoader: false, isSubloader: false
            }, adVo);

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
        const adVoList = await adModel.getListByAdGroup(adGroupId);
        // 未发布更新在缓存里的广告对象
        const cacheAdVoHash = await cacheServer.fetchCacheDataHash(creatorId, 'adModel');

        const adResVoList = await Bluebird.map(adVoList, async (adVo) => {
            const { adChannelId } = adVo;

            const adChannelVo = await adChannelModel.getAdChannel(adChannelId);

            if (think.isEmpty(adChannelVo)) {
                return;
            }

            const { channel } = adChannelVo;

            const adResVo: AdResVO = _.assign({
                channel, isEcpm: false, isLoader: false, isSubloader: false
            }, adVo, cacheAdVoHash[adVo.id]);

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
        // think.logger.debug(`configGroupId: ${configGroupId}`);
        const configModel = this.taleModel('config', 'advertisement') as ConfigModel;
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;

        const [
            configVoList,
            configGroupVo
        ] = await Promise.all([
            configModel.getList(dependentId, creatorId, 1),
            configGroupModel.getConfigGroup(dependentId, creatorId)    // 关联组 id
        ]);

        // 依赖组未配置或者失效直接返回
        if (think.isEmpty(configGroupVo) || !configGroupVo.active) {
            return dpdConfigVoHash;
        }

        const configVoHash: { [propName: string]: ConfigResVO; } = {};
        configVoList.map((configVo) => {

            const { key } = configVo;

            delete configVo.configGroupId;
            delete configVo.createAt;
            delete configVo.updateAt;

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

        const [
            configVoList,
            configGroupVo
        ] = await Promise.all([
            configModel.getList(configGroupId, creatorId),
            configGroupModel.getConfigGroup(configGroupId, creatorId)    // 关联组 id
        ]);

        if (!configGroupVo) {
            return;
        }
        const { dependentId, type, productId } = configGroupVo;

        // 当前常量组常量
        const configVoHash: { [propName: string]: ConfigResVO; } = {};

        configVoList.map((configVo) => {

            const { key } = configVo;

            delete configVo.configGroupId;
            delete configVo.createAt;
            delete configVo.updateAt;

            configVoHash[key] = _.defaults({ dependent: null }, configVo) as ConfigResVO;
        });

        // 依赖组常量
        let dpdConfigVoHash: { [propName: string]: ConfigResVO; } = {};
        if (dependentId) {
            const { name: dependent } = await configGroupModel.getConfigGroup(dependentId, creatorId);    // 关联组名
            dpdConfigVoHash = await this.getDpdConfigVoHash(dependent, dependentId, creatorId);

        }
        // 广告常量依赖于基础常量
        const baseConfigVoHash: { [propName: string]: ConfigResVO; } = {};
        if (type === 0) {
            const { test } = await productModel.getProduct(productId);
            const baseConfigVoList = await baseConfigModel.getList(1, test);

            baseConfigVoList.map((baseConfigVo) => {

                const { key } = baseConfigVo;

                delete baseConfigVo.test;
                delete baseConfigVo.createAt;
                delete baseConfigVo.updateAt;

                baseConfigVoHash[key] = _.defaults({ dependent: '基础常量' }, baseConfigVo) as ConfigResVO;
            });

        }
        _.defaults(configVoHash, dpdConfigVoHash, baseConfigVoHash);

        return _.values(configVoHash);
    }

    /**
     * 获取常量组信息列表
     * @argument {string} productId 应用表主键 id
     * @argument {number} type 0 广告 1 游戏常量
     */
    public async getConfigGroupList(productId: string, type: number) {
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;

        const configGroupVoList = await configGroupModel.getListByProductAndType(productId, type);

        const configGroupResVoList = await Bluebird.map(configGroupVoList, async (configGroupVo) => {
            const { id, dependentId } = configGroupVo;

            let dependent: string = null;
            if (dependentId) {
                dependent = (await configGroupModel.getConfigGroup(dependentId)).name;
            }

            const verionGroupIdList = await abTestGroupModel.getVerionGroupIdListByConfig(id);
            const versionGroupNameList = await versionGroupModel.getVersionGroupNameList(verionGroupIdList, 1);

            const configGroupResVo: ConfigGroupResVO = _.defaults({
                dependent, versionGroup: versionGroupNameList
            }, configGroupVo);

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

        // 数据库里的常量组组对象
        const configGroupVo = await configGroupModel.getConfigGroup(configGroupId, creatorId);
        // 未发布更新在缓存里的常量组组对象
        const cacheConfigGroupVo =
            await cacheServer.fetchCacheData(creatorId, 'configGroupModel', configGroupId);

        // 不能看到其他人创建的组
        if (!configGroupVo) {
            return;
        }
        const { dependentId } = configGroupVo;

        let dependent: string = null;
        if (dependentId) {
            const dependentVo = await configGroupModel.getConfigGroup(dependentId, creatorId);

            // 不能看到其他人创建的组
            if (dependentVo) {
                dependent = dependentVo.name;
            }
        }

        const configGroupResVo: ConfigGroupResVO = _.assign({
            dependent, versionGroup: undefined
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
            await nativeTmplConfGroupModel.getNativeTmplConfGroup(nativeTmplConfGroupId, creatorId);
        // 未发布更新在缓存里的 native 模板组对象
        const cacheNativeTmplConfGroupVo =
            await cacheServer.fetchCacheData(creatorId, 'nativeTmplConfGroupModel', nativeTmplConfGroupId);

        if (!nativeTmplConfGroupVo) {
            return;
        }

        const nativeTmplConfGroupResVo: NativeTmplConfGroupResVO = _.assign({
            versionGroup: undefined,
        }, nativeTmplConfGroupVo, cacheNativeTmplConfGroupVo);

        delete nativeTmplConfGroupResVo.productId;
        delete nativeTmplConfGroupResVo.createAt;
        delete nativeTmplConfGroupResVo.updateAt;
        return nativeTmplConfGroupResVo;
    }

    /**
     * <br/>获取广告组列表信息
     * @argument {string} abTestGroupId ab 分组表主键 id;
     * @argument {string} creatorId 创建者 id
     */
    public async getAdGroupListInAb(abTestGroupId: string, creatorId: string) {
        const adGroupModel = this.taleModel('adGroup', 'advertisement') as AdGroupModel;
        const abTestMapModel = this.taleModel('abTestMap', 'advertisement') as AbTestMapModel;
        const adTypeModel = this.taleModel('adType', 'advertisement') as AdTypeModel;
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        // 数据库里的版本条件分组对象
        const abTestMapVoList = await abTestMapModel.getList(abTestGroupId, creatorId);
        // 未发布更新在缓存里的版本条件分组对象和广告组对象
        const [
            cacheAbTestMapVoHash, cacheAdGroupVoHash
        ] = await Promise.all([
            cacheServer.fetchCacheDataHash(creatorId, 'abTestMapModel'),
            cacheServer.fetchCacheDataHash(creatorId, 'adGroupModel')
        ]);

        const adGroupResVoList: AdGroupResVO[] = await Bluebird.map(abTestMapVoList, async (abTestMapVo) => {
            const place = abTestMapVo.place;
            let adGroupId = abTestMapVo.adGroupId;

            // 获取缓存中未发布更新，redis 哈希域为广告位加 ab 分组表主键 id
            const field = `${place}-${abTestGroupId}`;
            const cacheAbTestMapVo = cacheAbTestMapVoHash[field] as AbTestMapVO;

            // 缓存中有更新，则以缓存中数据为准
            if (cacheAbTestMapVo && cacheAbTestMapVo.adGroupId) {
                adGroupId = cacheAbTestMapVo.adGroupId;
            }

            let adGroupResVo: AdGroupResVO = {
                place, creatorId: null,
                type: undefined, versionGroup: undefined,
                name: undefined, description: undefined, active: undefined
            };

            if (adGroupId) {
                const [adGroupVo, adList] = await Promise.all([
                    adGroupModel.getAdGroup(adGroupId, creatorId),
                    this.getAdListInAdGroup(adGroupId, creatorId)
                ]);
                const { adTypeId } = adGroupVo;

                const adTypeVo = await adTypeModel.getAdType(adTypeId);

                if (think.isEmpty(adTypeVo)) {
                    adGroupResVo = _.defaults(adGroupResVo, adGroupVo);

                } else {
                    // 获取缓存中未发布更新，redis 哈希域为广告组表主键 id
                    const cacheAdGroupVo = cacheAdGroupVoHash[adGroupId] as AdGroupVO;

                    const { name: type } = adTypeVo;

                    adGroupResVo = _.assign({
                        type, place, adList, versionGroup: undefined
                    }, adGroupVo, cacheAdGroupVo);

                    delete adGroupResVo.productId;
                    delete adGroupResVo.adTypeId;
                    delete adGroupResVo.createAt;
                    delete adGroupResVo.updateAt;
                }
            }

            return adGroupResVo;
        });

        return adGroupResVoList;
    }

}