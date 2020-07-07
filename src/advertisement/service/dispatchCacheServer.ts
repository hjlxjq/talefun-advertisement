/**
 * advertisement dispatchCacheServer Service
 * @module advertisement/service/dispatchCacheServer
 * @see module:../../common/tale/BaseService
 */
import { think } from 'thinkjs';
import * as Bluebird from 'bluebird';
import * as _ from 'lodash';
import * as Redis from 'ioredis';

import BaseService from '../../common/tale/BaseService';
import Utils from '../utils';

import BaseConfigModel from '../model/baseConfig';
import AdTypeModel from '../model/adType';
import AdChannelModel from '../model/adChannel';
import AdModel from '../model/ad';
import ConfigModel from '../model/config';
import ConfigGroupModel from '../model/configGroup';
import VersionGroupModel from '../model/versionGroup';
import AbTestGroupModel from '../model/abTestGroup';
import AbTestMapModel from '../model/abTestMap';
import NativeTmplModel from '../model/nativeTmpl';
import NativeTmplConfModel from '../model/nativeTmplConf';
import NativeTmplConfGroupModel from '../model/nativeTmplConfGroup';
import ProductModel from '../model/product';

import {
    HashVO, HashHashVO, NativeTmplCacheVO, AdCacheVO, ConfigCacheVO, VersionGroupCacheVO, AbTestGroupCacheVO,
    AbTestMapCacheVO, RedisKeyVO, NativeTmplConfVO, AdVO, ConfigVO, ConfigGroupVO
} from '../defines';

// 默认间隔
const defaultInterval = 60;

/**
 * adType 处理，
 * </br> adexchange 替换成 admob
 */
function formatAdTypeName(adType: string) {
    return _.replace(adType.toLowerCase(), 'adexchange', 'admob');

}

/**
 * 按 begin 顺序排序
 */
function beginSort(groupVo1: any, groupVo2: any) {
    return (groupVo1.begin - groupVo2.begin);

}

/**
 * 下发数据，保存在 redis 缓存中，
 * <br/>从 mysql 刷新全部下发的数据，组装到 redis
 * @class DispatchCacheService
 * @extends @link:common/tale/BaseService
 * @author jianlong <jianlong@talefun.com>
 */
export default class DispatchCacheService extends BaseService {
    private redis: Redis.Redis;
    private keyPrefix = 'dispatch:';    // redis 哈希表的 key 前缀
    // 定义下发缓存中的 key 对应 获取数据数据的方法
    private CACHE_DEFINE: { [propName: string]: () => Promise<any> };

    constructor() {
        super();
        this.redis = (think as any).redis('redis1');

        this.CACHE_DEFINE = {
            // BaseConfig: this.baseConfigData.bind(this),
            // Product: this.productData.bind(this),
            AdGroup: this.allAdGroupData.bind(this),
            NativeTmpl: this.allNativeTmplData.bind(this),
            Config: this.allConfigData.bind(this),
            Ios_Ad_Product: this.ios_ad_productData.bind(this),
            Ios_Config_Product: this.ios_config_productData.bind(this),
            Android_Ad_Product: this.android_ad_productData.bind(this),
            Android_Config_Product: this.android_config_productData.bind(this),
            Weixin_Ad_Product: this.wx_ad_productData.bind(this),
            Weixin_Config_Product: this.wx_config_productData.bind(this),
            Instant_Ad_Product: this.instant_ad_productData.bind(this),
            Instant_Config_Product: this.instant_config_productData.bind(this),
            AbTestGroup: this.abTestGroupData.bind(this),
            AbTestMap: this.abTestMapData.bind(this)
        };

    }

    /**
     * 获取常量组及关联组下常量数据
     * <br/>初始化数据库到 redis
     * <br/>返回常量相关 redis 哈希表数据
     * @argument {HashHashVO} configHashHash 常量组表主键映射常量(key value) 哈希表的哈希表
     * @argument {HashVO} configGroupHash 常量组表主键映射依赖组主键的哈希表
     * @argument {ConfigCacheVO} configCacheVo redis 哈希表中常量组数据
     * @argument {string} configGroupId 常量组主键
     * @argument {string[]} dependentIdList 所有前置依赖的组主键
     * @return {ConfigCacheVO} configCacheVo
     */
    private packConfigData(
        configHashHash: HashHashVO,
        configGroupHash: HashVO,
        configCacheVo: ConfigCacheVO,
        configGroupId: string,
        dependentIdList: string[] = []
    ): ConfigCacheVO {
        // 依赖组循环则返回
        if (_.indexOf(dependentIdList, configGroupId) !== -1) {
            return configCacheVo;

        }
        // 当前常量组常量数据
        const currentConfigCacheVo = configHashHash[configGroupId];
        _.defaults(configCacheVo, currentConfigCacheVo);

        const dependentId = configGroupHash[configGroupId];
        if (dependentId) {
            dependentIdList.push(configGroupId);
            return this.packConfigData(configHashHash, configGroupHash, configCacheVo, dependentId, dependentIdList);

        }
        return configCacheVo;

    }

    /**
     * 从 mysql 刷新数据，组装到 redis，
     * <br/>按包名返回所有待写入 redis 的应用相关版本条件分组列表，以包名为 key,
     * @argument {number} type  0 广告 1 游戏常量 2 商店
     * @argument {string} platform 平台名
     * @return {{ [propName: string]: VersionGroupCacheVO[]; }} 所有待写入 redis 的应用相关版本条件分组列表
     */
    private async packageData(type: number, platform: string) {
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;

        const cacheData: { [propName: string]: VersionGroupCacheVO[] } = {};

        // 获取全部应用和版本条件分组
        const [productVoList, versionGroupVoList] = await Promise.all([
            productModel.getListByPlatform(platform, 1),
            versionGroupModel.getList(type, 1)
        ]);

        // 应用表主键映射包名的哈希表
        const productHash: HashVO = {};
        _.each(productVoList, (productVo) => {
            const { id, packageName } = productVo;
            productHash[id] = packageName;

        });

        // 遍历版本条件对象列表，组装应用相关版本条件分组列表
        _.each(versionGroupVoList, (versionGroupVo) => {
            const { id, productId, begin, include, code } = versionGroupVo;
            const packageName = productHash[productId];
            if (packageName) {
                if (!cacheData[packageName]) {
                    cacheData[packageName] = [];

                }
                const versionGroupCacheVo: VersionGroupCacheVO = {
                    id, begin, include, code
                };
                cacheData[packageName].push(versionGroupCacheVo);

            }

        });
        // 版本分组按 begin 排序
        for (const packageName of _.keys(cacheData)) {
            const versionGroupCacheVoList = cacheData[packageName];
            versionGroupCacheVoList.sort(beginSort);

        }
        return cacheData;

    }

    /**
     * 从 mysql 刷新数据，组装到 redis，
     * <br/>按 native 模板组返回所有待写入 redis 的 native 模板相关数据对象，以 native 模板组 id 为 key
     * @argument {NativeTmplConfVO[]} nativeTmplConfVoList  native 模板表对象列表
     * @return {{ [propName: string]: NativeTmplCacheVO[]; }} 所有待写入 redis 的 native 模板相关数据对象
     */
    private async nativeTmplData(nativeTmplConfVoList: NativeTmplConfVO[]) {
        const nativeTmplModel = this.taleModel('nativeTmpl', 'advertisement') as NativeTmplModel;

        // redis 哈希表中 native 模板组数据
        const cacheData: {
            [propName: string]: NativeTmplCacheVO[];
        } = {};

        // 获取全部常规 native 模板
        const nativeTmplVoList = await nativeTmplModel.getList();

        // 常规 native 模板表主键映射常规 native 模板的哈希表
        const nativeTmplHash: HashVO = {};
        _.each(nativeTmplVoList, (nativeTmplVo) => {
            const { id, key } = nativeTmplVo;
            nativeTmplHash[id] = key;

        });

        // 遍历 native 模板对象列表，组装 native 模板相关数据对象，以 native 模板组 id 为 key
        _.each(nativeTmplConfVoList, (nativeTmplConfVo) => {
            const { weight, clickArea, isFull, nativeTmplId, nativeTmplConfGroupId } = nativeTmplConfVo;

            if (!cacheData[nativeTmplConfGroupId]) {
                cacheData[nativeTmplConfGroupId] = [];

            }
            // 获取模板编号
            const key = nativeTmplHash[nativeTmplId];
            // 下发布尔值
            const newIsFull = (isFull === 1) ? true : false;

            const nativeTmplCacheVO: NativeTmplCacheVO = {
                key, weight, clickArea, isFull: newIsFull
            };
            cacheData[nativeTmplConfGroupId].push(nativeTmplCacheVO);

        });
        // think.logger.debug(`nativeTmplData: ${JSON.stringify(cacheData[_.keys(cacheData)[0]])}`);
        return cacheData;

    }

    /**
     * 从 mysql 刷新数据，组装到 redis，
     * <br/>按广告组返回所有待写入 redis 的广告相关数据对象，以广告组 id 为 key
     * @argument {AdVO[]} adVoList 广告表对象列表
     * @return {{ [propName: string]: AdCacheVO[]; }} 所有待写入 redis 的广告相关数据对象
     */
    private async adGroupData(adVoList: AdVO[]) {
        const adTypeModel = this.taleModel('adType', 'advertisement') as AdTypeModel;
        const adChannelModel = this.taleModel('adChannel', 'advertisement') as AdChannelModel;

        // redis 哈希表中广告组数据
        const cacheData: {
            [propName: string]: AdCacheVO[];
        } = {};

        // 获取全部广告类型列表和广告平台列表
        const [
            adTypeVoList, adChannelVoList
        ] = await Promise.all([
            adTypeModel.getList(),
            adChannelModel.getList()
        ]);

        // 广告类型表主键映射广告类型的哈希表
        const adTypeHash: HashVO = {};
        _.each(adTypeVoList, (adTypeVo) => {
            const { id, type } = adTypeVo;
            adTypeHash[id] = type;

        });
        // 广告平台表主键映射广告平台的哈希表
        const adChannelHash: HashVO = {};
        _.each(adChannelVoList, (adChannelVo) => {
            const { id, channel } = adChannelVo;
            adChannelHash[id] = channel;

        });

        // 遍历广告对象列表，组装广告相关数据对象，以广告组 id 为 key
        _.each(adVoList, (adVo) => {
            const {
                adGroupId, adChannelId, adTypeId,
                placementID, ecpm, loader, subloader, interval, weight, bidding
            } = adVo;

            // 广告类型
            const adType = adTypeHash[adTypeId];
            // 广告平台
            const channel = adChannelHash[adChannelId];
            // 下发布尔值
            const newBidding = (bidding === 1) ? true : false;
            // adexchange 替换成 admob
            const newAdType = formatAdTypeName(adType);

            // interval 处理
            let newInterval = interval;
            if (adType === 'Native' || adType === 'Native_Menu') {
                newInterval = interval || defaultInterval;

            }

            // 下发的广告数据
            const adCacheVo: AdCacheVO = {
                adType: newAdType, channel,
                adID: placementID, ecpm, loader, subloader, interval: newInterval, weight, bidding: newBidding
            };

            if (!cacheData[adGroupId]) {
                cacheData[adGroupId] = [];

            }
            cacheData[adGroupId].push(adCacheVo);

        });
        // think.logger.debug(`adCacheData: ${JSON.stringify(cacheData[_.keys(cacheData)[0]])}`);
        return cacheData;

    }

    /**
     * 从 mysql 刷新数据，组装到 redis,
     * <br/>按常量组返回所有待写入 redis 的常量相关数据对象，以常量组 id 为 key
     * @argument {ConfigVO[]} configVoList 常量表对象列表
     * @argument {ConfigGroupVO[]} configGroupVoList 常量组表对象列表
     * @return {{ [propName: string]: ConfigCacheVO; }} 所有待写入 redis 的常量相关数据对象
     */
    private async configData(configVoList: ConfigVO[], configGroupVoList: ConfigGroupVO[]) {
        // redis 哈希表中常量组数据
        const cacheData: {
            [propName: string]: ConfigCacheVO;
        } = {};

        // 常量组表主键映射依赖组主键的哈希表
        const configGroupHash: HashVO = {};
        _.each(configGroupVoList, (configGroupVo) => {
            const { id, dependentId } = configGroupVo;
            configGroupHash[id] = dependentId;

        });
        // 常量组表主键映射常量 key value 哈希表的哈希表
        const configHashHash: HashHashVO = {};
        _.each(configVoList, (configVo) => {
            const { configGroupId, key, value } = configVo;

            if (!configHashHash[configGroupId]) {
                configHashHash[configGroupId] = {};

            }
            configHashHash[configGroupId][key] = value;

        });

        _.each(configGroupVoList, (configGroupVo) => {
            const { id, name } = configGroupVo;

            // 哈希表中常量组数据，以常量组主键为 key
            cacheData[id] = { weightGroup: name };
            this.packConfigData(configHashHash, configGroupHash, cacheData[id], id);

        });
        // think.logger.debug(`configData: ${JSON.stringify(cacheData[_.keys(cacheData)[0]])}`);
        return cacheData;

    }

    /**
     * 从 mysql 刷新数据，组装到 redis,
     * <br>基础常量
     * <br/>返回所有待写入 redis 的基础常量相关数据对象，以常量 key 为 key
     * @return {{ [propName: string]: HashVO; }} 所有待写入 redis 的基础常量相关数据对象
     */
    public async baseConfigData() {
        const baseConfigModel = this.taleModel('baseConfig', 'advertisement') as BaseConfigModel;

        // redis 哈希表中常量组数据
        const cacheData: { [propName: string]: HashVO; } = {};

        // 获取全部基础常量
        const baseConfigVoList = await baseConfigModel.getList(1);

        _.each(baseConfigVoList, (baseConfigVo) => {
            const { key, value, test } = baseConfigVo;

            if (!cacheData.test) {
                cacheData.test = {};

            }
            if (!cacheData.live) {
                cacheData.live = {};

            }
            if (test === 0) {
                cacheData.live[key] = value;

            }
            cacheData.test[key] = value;

        });
        // think.logger.debug(`baseConfigData: ${JSON.stringify(cacheData)}`);
        return cacheData;

    }

    /**
     * 从 mysql 刷新数据，组装到 redis,
     * <br>应用
     * <br/>返回所有待写入 redis 的基础常量相关数据对象，以常量 key 为 key
     * @return {{ [propName: string]: HashVO; }} 所有待写入 redis 的基础常量相关数据对象
     */
    public async productData() {
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;

        // redis 哈希表中常量组数据
        const cacheData: { [propName: string]: { [propName: string]: number }; } = {};

        // 获取全部基础常量
        const productVoList = await productModel.getList(1);

        _.each(productVoList, (productVo) => {
            const { packageName, platform, test } = productVo;

            if (!cacheData[platform]) {
                cacheData[platform] = {};

            }
            cacheData[platform][packageName] = test;

        });
        // think.logger.debug(`baseConfigData: ${JSON.stringify(cacheData)}`);
        return cacheData;

    }

    /**
     * 从 mysql 刷新数据，组装到 redis，
     * <br/>按广告组返回所有待写入 redis 的广告相关数据对象，以广告组 id 为 key
     * @return {{ [propName: string]: AdCacheVO[]; }} 所有待写入 redis 的广告相关数据对象
     */
    public async allAdGroupData() {
        const adModel = this.taleModel('ad', 'advertisement') as AdModel;
        // 获取线上正式的全部广告列表
        const adVoList = await adModel.getList(1);

        return this.adGroupData(adVoList);

    }

    /**
     * 从 mysql 刷新数据，组装到 redis，
     * <br/>按 native 模板组返回所有待写入 redis 的 native 模板相关数据对象，以 native 模板组 id 为 key
     * @return {{ [propName: string]: NativeTmplCacheVO[]; }} 所有待写入 redis 的 native 模板相关数据对象
     */
    public async allNativeTmplData() {
        const nativeTmplConfModel = this.taleModel('nativeTmplConf', 'advertisement') as NativeTmplConfModel;
        const nativeTmplModel = this.taleModel('nativeTmpl', 'advertisement') as NativeTmplModel;

        // 获取全部应用下 native 模板配置
        const nativeTmplConfVoList = await nativeTmplConfModel.getList(1);

        return await this.nativeTmplData(nativeTmplConfVoList);

    }

    /**
     * 从 mysql 刷新数据，组装到 redis,
     * <br/>按常量组返回所有待写入 redis 的常量相关数据对象，以常量组 id 为 key
     * @return {{ [propName: string]: ConfigCacheVO; }} 所有待写入 redis 的常量相关数据对象
     */
    public async allConfigData() {
        const configModel = this.taleModel('config', 'advertisement') as ConfigModel;
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;

        // 获取全部常量和常量组
        const [configVoList, configGroupVoList] = await Promise.all([
            configModel.getList(1),
            configGroupModel.getList(1)
        ]);

        return this.configData(configVoList, configGroupVoList);

    }

    /**
     * 从 mysql 刷新数据，组装到 redis，
     * <br/>按包名返回所有待写入 redis 的应用分组相关数据对象，以包名为 key
     * <br/>ios 广告
     * @return {{ [propName: string]: VersionGroupCacheVO[]; }} 所有待写入 redis 的应用分组相关相关数据对象
     */
    public async ios_ad_productData() {
        const cacheData = await this.packageData(0, 'ios');
        // think.logger.debug(`ios_ad_productData: ${JSON.stringify(cacheData[_.keys(cacheData)[0]])}`);
        return cacheData;

    }

    /**
     * 从 mysql 刷新数据，组装到 redis，
     * <br/>按包名返回所有待写入 redis 的应用分组相关数据对象，以包名为 key
     * <br/>ios 常量
     * @return {{ [propName: string]: VersionGroupCacheVO[]; }} 所有待写入 redis 的应用分组相关相关数据对象
     */
    public async ios_config_productData() {
        const cacheData = await this.packageData(1, 'ios');
        // think.logger.debug(`ios_config_productData: ${JSON.stringify(cacheData[_.keys(cacheData)[0]])}`);
        return cacheData;

    }

    /**
     * 从 mysql 刷新数据，组装到 redis，
     * <br/>按包名返回所有待写入 redis 的应用分组相关数据对象，以包名为 key
     * <br/>安卓广告
     * @return {{ [propName: string]: VersionGroupCacheVO[]; }} 所有待写入 redis 的应用分组相关相关数据对象
     */
    public async android_ad_productData() {
        const cacheData = await this.packageData(0, 'android');
        // think.logger.debug(`android_ad_productData: ${JSON.stringify(cacheData[_.keys(cacheData)[0]])}`);
        return cacheData;

    }

    /**
     * 从 mysql 刷新数据，组装到 redis，
     * <br/>按包名返回所有待写入 redis 的应用分组相关数据对象，以包名为 key
     * <br/>安卓常量
     * @return {{ [propName: string]: VersionGroupCacheVO[]; }} 所有待写入 redis 的应用分组相关相关数据对象
     */
    public async android_config_productData() {
        const cacheData = await this.packageData(1, 'android');
        // think.logger.debug(`android_config_productData: ${JSON.stringify(cacheData[_.keys(cacheData)[0]])}`);
        return cacheData;

    }

    /**
     * 从 mysql 刷新数据，组装到 redis，
     * <br/>按包名返回所有待写入 redis 的应用分组相关数据对象，以包名为 key
     * <br/>微信 广告
     * @return {{ [propName: string]: VersionGroupCacheVO[]; }} 所有待写入 redis 的应用分组相关相关数据对象
     */
    public async wx_ad_productData() {
        const cacheData = await this.packageData(0, 'weixin');
        // think.logger.debug(`wx_ad_productData: ${JSON.stringify(cacheData[_.keys(cacheData)[0]])}`);
        return cacheData;

    }

    /**
     * 从 mysql 刷新数据，组装到 redis，
     * <br/>按包名返回所有待写入 redis 的应用分组相关数据对象，以包名为 key
     * <br/>微信 常量
     * @return {{ [propName: string]: VersionGroupCacheVO[]; }} 所有待写入 redis 的应用分组相关相关数据对象
     */
    public async wx_config_productData() {
        const cacheData = await this.packageData(1, 'weixin');
        // think.logger.debug(`wx_config_productData: ${JSON.stringify(cacheData[_.keys(cacheData)[0]])}`);
        return cacheData;

    }

    /**
     * 从 mysql 刷新数据，组装到 redis，
     * <br/>按包名返回所有待写入 redis 的应用分组相关数据对象，以包名为 key
     * <br/>instant 广告
     * @return {{ [propName: string]: VersionGroupCacheVO[]; }} 所有待写入 redis 的应用分组相关相关数据对象
     */
    public async instant_ad_productData() {
        const cacheData = await this.packageData(0, 'instant');
        // think.logger.debug(`instant_ad_productData: ${JSON.stringify(cacheData[_.keys(cacheData)[0]])}`);
        return cacheData;

    }

    /**
     * 从 mysql 刷新数据，组装到 redis，
     * <br/>按包名返回所有待写入 redis 的应用分组相关数据对象，以包名为 key
     * <br/>instant 常量
     * @return {{ [propName: string]: VersionGroupCacheVO[]; }} 所有待写入 redis 的应用分组相关相关数据对象
     */
    public async instant_config_productData() {
        const cacheData = await this.packageData(1, 'instant');
        // think.logger.debug(`instant_config_productData: ${JSON.stringify(cacheData[_.keys(cacheData)[0]])}`);
        return cacheData;

    }

    /**
     * 从 mysql 刷新数据，组装到 redis，
     * <br/>返回所有待写入 redis 的 ab 测试分组相关数据对象，以版本条件分组表主键 为 key
     * @return {{ [propName: string]: AbTestGroupCacheVO[]; }} 所有待写入 redis 的 ab 测试分组相关数据对象
     */
    public async abTestGroupData() {
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;

        const cacheData: { [propName: string]: AbTestGroupCacheVO[] } = {};

        const abTestGroupVoList = await abTestGroupModel.getList(1);

        _.each(abTestGroupVoList, (abTestGroupVo) => {
            const { id, versionGroupId, name, begin, end, nativeTmplConfGroupId, configGroupId } = abTestGroupVo;
            if (!cacheData[versionGroupId]) {
                cacheData[versionGroupId] = [];

            }
            const abTestGroupCacheVo: AbTestGroupCacheVO = {
                id, name, begin, end, nativeTmplConfGroupId, configGroupId
            };
            cacheData[versionGroupId].push(abTestGroupCacheVo);

        });
        // ab 测试分组按 begin 排序
        for (const versionGroupId of _.keys(cacheData)) {
            const abTestGroupCacheVoList = cacheData[versionGroupId];
            abTestGroupCacheVoList.sort(beginSort);

        }
        // think.logger.debug(`abTestGroupData: ${JSON.stringify(cacheData[_.keys(cacheData)[0]])}`);
        return cacheData;

    }

    /**
     * 从 mysql 刷新数据，组装到 redis，
     * <br/>返回所有待写入 redis 的 ab 测试分组广告位相关数据对象，以 ab 测试分组表主键 为 key
     * @return {{ [propName: string]: AbTestMapCacheVO[] }} 所有待写入 redis 的 ab 测试分组广告位相关数据对象
     */
    public async abTestMapData() {
        const abTestMapModel = this.taleModel('abTestMap', 'advertisement') as AbTestMapModel;

        const cacheData: { [propName: string]: AbTestMapCacheVO[] } = {};

        const abTestMapVoList = await abTestMapModel.getList(1);

        _.each(abTestMapVoList, (abTestMapVo) => {
            const { abTestGroupId, place, adGroupId } = abTestMapVo;
            if (!cacheData[abTestGroupId]) {
                cacheData[abTestGroupId] = [];

            }
            const abTestMapCacheVo: AbTestMapCacheVO = {
                place, adGroupId
            };
            cacheData[abTestGroupId].push(abTestMapCacheVo);

        });
        // think.logger.debug(`abTestMapData: ${JSON.stringify(cacheData[_.keys(cacheData)[0]])}`);
        return cacheData;

    }

    /**
     * <br/>初始化缓存
     * @argument {string} redisKey redis key
     * @argument {Promise<{[propName: string]: object}>} queryMethod 从 mysql 查询 redis 哈希表数据的函数
     */
    private async initOneCache(redisKey: string, queryMethod: () => Promise<any>) {
        // 首先判断 redis 里面是否有，如果 redis 里面没有的话，则从数据库查询
        const result = await this.redis.exists(redisKey);
        if (result === 0) {
            const cacheData = await queryMethod();
            if (!_.isEmpty(cacheData)) {
                const redisHash = Utils.getRedisHash(cacheData);
                // think.logger.debug(`redisKey: ${redisKey}`);
                // think.logger.debug(`redisHash: ${JSON.stringify(redisHash)}`);
                // 更新到 redis 中
                return this.redis.hmset(redisKey, redisHash);

            }

        }

    }

    /**
     * <br/>初始化所有缓存
     */
    public async initCacheData() {
        const ping = await this.redis.ping();
        think.logger.debug(`test redis: ${ping}`);

        const promiseArr = _.map(this.CACHE_DEFINE, (queryMethod, key) => {
            const redisKey = this.keyPrefix + key;
            return this.initOneCache(redisKey, queryMethod);

        });
        await Promise.all(promiseArr);

    }

    /**
     * *****************************************************************************************************************
     * 发布应用相关
     * *****************************************************************************************************************
     */

    /**
     * <br/>获取所有和类型和平台相关的 redis key
     * @argument {string} platform 平台
     * @argument {string} type 类型，0 广告 1 游戏常量 2 商店
     */
    private getCacheKey(type: number, platform: string) {
        let appPackageKey: string;

        const abTestGroupKey = this.keyPrefix + 'AbTestGroup';
        const abTestMapKey = this.keyPrefix + 'AbTestMap';
        const configKey = this.keyPrefix + 'Config';
        const adGroupKey = this.keyPrefix + 'AdGroup';
        const nativeTmplKey = this.keyPrefix + 'NativeTmpl';
        if (type === 0) {
            if (platform === 'ios') {
                appPackageKey = this.keyPrefix + 'Ios_Ad_Product';

            }
            if (platform === 'android') {
                appPackageKey = this.keyPrefix + 'Android_Ad_Product';

            }
            if (platform === 'wx' || platform === 'weixin') {
                appPackageKey = this.keyPrefix + 'Weixin_Ad_Product';

            }
            if (platform === 'web' || platform === 'instant') {
                appPackageKey = this.keyPrefix + 'Instant_Ad_Product';

            }

        }
        if (type === 1) {
            if (platform === 'ios') {
                appPackageKey = this.keyPrefix + 'Ios_Config_Product';

            }
            if (platform === 'android') {
                appPackageKey = this.keyPrefix + 'Android_Config_Product';

            }
            if (platform === 'wx' || platform === 'weixin') {
                appPackageKey = this.keyPrefix + 'Weixin_Config_Product';

            }
            if (platform === 'web' || platform === 'instant') {
                appPackageKey = this.keyPrefix + 'Instant_Config_Product';

            }

        }
        const redisKeyVo: RedisKeyVO = {
            appPackageKey, abTestGroupKey, abTestMapKey, adGroupKey, nativeTmplKey, configKey
        };
        return redisKeyVo;

    }

    /**
     * 发布应用,
     * <br/>即从 mysql 数据库刷新应用信息到 redis
     * @argument {number} type 类型，0 广告 1 游戏常量 2 商店
     * @argument {string} productId 应用主键
     * @return {boolean} 是否发布到线上分发成功
     */
    public async refreshCacheData(type: number, productId: string) {
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;

        const { packageName, platform, active } = await productModel.getVo(productId);

        if (active === 0) {
            throw new Error('不能发布未生效的应用');

        }

        const {
            appPackageKey, abTestGroupKey, abTestMapKey, adGroupKey, nativeTmplKey, configKey
        } = this.getCacheKey(type, platform);

        if (type === 0) {
            const {
                productCacheData, abGroupCacheData, abMapCacheData, adGroupCacheData, nativeTmplCacheData
            } = await this.refreshAdDispatch(productId, packageName);

            await this.redis.multi([
                ['hset', appPackageKey, packageName, Utils.getRedisHash(productCacheData)],
                // @ts-ignore
                ['hmset', abTestGroupKey, Utils.getRedisHash(abGroupCacheData)],
                // @ts-ignore
                ['hmset', abTestMapKey, Utils.getRedisHash(abMapCacheData)],
                // @ts-ignore
                ['hmset', adGroupKey, Utils.getRedisHash(adGroupCacheData)],
                // @ts-ignore
                ['hmset', nativeTmplKey, Utils.getRedisHash(nativeTmplCacheData)]
            ], { pipeline: true }).exec();

        }
        if (type === 1) {
            const {
                productCacheData, abGroupCacheData, configCacheData
            } = await this.refreshConfigDispatch(productId, packageName);

            await this.redis.multi([
                ['hset', appPackageKey, packageName, Utils.getRedisHash(productCacheData)],
                // @ts-ignore
                ['hmset', abTestGroupKey, Utils.getRedisHash(abGroupCacheData)],
                // @ts-ignore
                ['hmset', configKey, Utils.getRedisHash(configCacheData)]
            ], { pipeline: true }).exec();

        }
        return true;

    }

    /**
     * 获取广告分发相关缓存
     * <br/>返回常量相关 redis 哈希表数据
     * @argument {string} productId 应用主键
     * @argument {string} packageName 包名
     */
    private async refreshAdDispatch(productId: string, packageName: string) {
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const abTestMapModel = this.taleModel('abTestMap', 'advertisement') as AbTestMapModel;
        const adModel = this.taleModel('ad', 'advertisement') as AdModel;
        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;
        const nativeTmplConfModel = this.taleModel('nativeTmplConf', 'advertisement') as NativeTmplConfModel;

        // 应用包名 对应 应用相关版本条件分组列表
        const productCacheData: { [propName: string]: VersionGroupCacheVO[] } = {};
        // 版本条件分组表主键 对应 ab 测试分组列表
        const abGroupCacheData: { [propName: string]: AbTestGroupCacheVO[] } = {};
        // ab 测试分组表主键 对应 ab 测试分组下广告位列表
        const abMapCacheData: { [propName: string]: AbTestMapCacheVO[] } = {};

        const [
            versionGroupVoList, adVoList, nativeTmplConfGroupVoList
        ] = await Promise.all([
            versionGroupModel.getListByProduct(productId, 0, undefined, 1),
            adModel.getListByProduct(productId, undefined, 1),
            nativeTmplConfGroupModel.getListByProduct(productId, undefined, 1)
        ]);

        const nativeTmplConfGroupVoIdList = _.map(nativeTmplConfGroupVoList, (nativeTmplConfGroupVo) => {
            return nativeTmplConfGroupVo.id;

        });
        const nativeTmplConfVoList = await nativeTmplConfModel.getListByGroupList(nativeTmplConfGroupVoIdList, 1);

        // 广告组表主键 对应 广告列表
        const adGroupCacheData = await this.adGroupData(adVoList);
        // native 模板组主键对应 native 模板列表
        const nativeTmplCacheData = await this.nativeTmplData(nativeTmplConfVoList);

        // 遍历刷新应用下的数据到正式缓存中来
        await Bluebird.map(versionGroupVoList, async (versionGroupVo) => {
            const { id, begin, include, code } = versionGroupVo;

            const versionGroupCacheVo: VersionGroupCacheVO = {
                id, begin, include, code
            };
            productCacheData[packageName].push(versionGroupCacheVo);

            const abTestGroupVoList = await abTestGroupModel.getListByVersionGroup(id, undefined, undefined, 1);

            await Bluebird.map(abTestGroupVoList, async (abTestGroupVo) => {
                const {
                    id: abTestGroupId, versionGroupId, name, begin: abTestGroupBegin, end: abTestGroupEnd,
                    nativeTmplConfGroupId
                } = abTestGroupVo;

                const abTestGroupCacheVo: AbTestGroupCacheVO = {
                    id: abTestGroupId, name, begin: abTestGroupBegin, end: abTestGroupEnd, nativeTmplConfGroupId
                };
                abGroupCacheData[versionGroupId].push(abTestGroupCacheVo);

                const abTestMapVoList = await abTestMapModel.getListByAbTestGroup(abTestGroupId, undefined, 1);

                await Bluebird.map(abTestMapVoList, async (abTestMapVo) => {
                    const { place, adGroupId } = abTestMapVo;

                    const abTestMapCacheVo: AbTestMapCacheVO = {
                        place, adGroupId
                    };
                    abMapCacheData[abTestGroupId].push(abTestMapCacheVo);
                });

            });

        }, { concurrency: 3 });
        return {
            productCacheData, abGroupCacheData, abMapCacheData, adGroupCacheData, nativeTmplCacheData
        };

    }

    /**
     * 获取游戏常量分发相关缓存
     * <br/>返回游戏常量相关 redis 哈希表数据
     * @argument {string} productId 应用主键
     * @argument {string} packageName 包名
     */
    private async refreshConfigDispatch(productId: string, packageName: string) {
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;
        const configModel = this.taleModel('config', 'advertisement') as ConfigModel;

        // 应用包名 对应 应用相关版本条件分组列表
        const productCacheData: { [propName: string]: VersionGroupCacheVO[] } = {};
        // 版本条件分组表主键 对应 ab 测试分组列表
        const abGroupCacheData: { [propName: string]: AbTestGroupCacheVO[] } = {};

        const [
            versionGroupVoList, configGroupVoList
        ] = await Promise.all([
            versionGroupModel.getListByProduct(productId, 1, undefined, 1),
            configGroupModel.getListByProductAndType(productId, 1, undefined, 1),
        ]);

        const configGroupVoIdList = _.map(configGroupVoList, (configGroupVo) => {
            return configGroupVo.id;

        });
        const configVoList = await configModel.getListByGroupList(configGroupVoIdList, 1);

        // 游戏常量组表主键 对应 游戏常量列表
        const configCacheData = await this.configData(configVoList, configGroupVoList);

        await Bluebird.map(versionGroupVoList, async (versionGroupVo) => {
            const { id, begin, include, code } = versionGroupVo;

            const versionGroupCacheVo: VersionGroupCacheVO = {
                id, begin, include, code
            };
            productCacheData[packageName].push(versionGroupCacheVo);

            const abTestGroupVoList = await abTestGroupModel.getListByVersionGroup(id, undefined, undefined, 1);

            _.each(abTestGroupVoList, (abTestGroupVo) => {
                const {
                    id: abTestGroupId, versionGroupId, name, begin: abTestGroupBegin, end: abTestGroupEnd,
                    nativeTmplConfGroupId
                } = abTestGroupVo;

                const abTestGroupCacheVo: AbTestGroupCacheVO = {
                    id: abTestGroupId, name, begin: abTestGroupBegin, end: abTestGroupEnd, nativeTmplConfGroupId
                };
                abGroupCacheData[versionGroupId].push(abTestGroupCacheVo);

            });

        }, { concurrency: 3 });
        return {
            productCacheData, abGroupCacheData, configCacheData
        };

    }

}