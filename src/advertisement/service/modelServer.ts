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
import AbTestMapModel from '../model/AbTestMap';
import ProductModel from '../model/product';
import ProductGroupModel from '../model/productGroup';
import ProductAuthModel from '../model/productAuth';
import ProductGroupAuthModel from '../model/productGroupAuth';

import BaseService from '../../common/tale/BaseService';

import {
    AdVO, AdChannelResVO, PackParamConfResVO, ChannelParamConfResVO, ConfigGroupResVO, ConfigResVO,
    NativeTmplConfResVO, VersionGroupResVO, NativeTmplConfGroupResVO, AdGroupResVO, AdResVO,
} from '../defines';

/**
 * model重新包装，包含日志处理相关service
 * @class modelService
 * @extends @link:common/tale/BaseService
 * @author jianlong <jianlong@talefun.com>
 */
export default class ModelService extends BaseService {

    /**
     * 查询 adType，adChannel，adChannelMap 三张表,
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
     * 查询 adType，adChannel，adChannelMap 三张表,
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
     * 查询 productAuth, productGroupAuth, product 三张表,
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
     * 查询 packParam, packParamConf, product 三张表,
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
     * 查询 adTypeModel, adChannel, channelParamConf, adChannelMapModel, product 五张表,
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
     * 查询 versionGroup, nation 两张表,
     * <br/>获取版本分组控制列表信息
     * @argument {string} productId 应用表 id;
     * @argument {string} type 版本分组类型;
     */
    public async getVersionGroupList(productId: string, type: number) {
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const nationModel = this.taleModel('nation', 'advertisement') as NationModel;

        const versionGroupVoList = await versionGroupModel.getList(productId, type);

        const versionGroupResVoList = await Bluebird.map(versionGroupVoList, async (versionGroupVo) => {
            const codeList = await nationModel.getList(versionGroupVo.id);

            delete versionGroupVo.productId;
            const versionGroupResVo: VersionGroupResVO = _.defaults({ codeList }, versionGroupVo);

            return versionGroupResVo;
        });

        return versionGroupResVoList;
    }

    /**
     * 查询 nativeTmplConfGroup, abTestGroup, versionGroup 三张表,
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
     * 查询 nativeTmplConf, nativeTmpl 两张表,
     * <br/>获取应用下 native 模板列表信息
     * @argument {string} nativeTmplConfGroupId 应用下 native 模板组表 id;
     * @argument {string} productId 应用表 id;
     */
    public async getNativeTmplConfList(nativeTmplConfGroupId: string, productId: string) {
        const nativeTmplModel = this.taleModel('nativeTmpl', 'advertisement') as NativeTmplModel;
        const nativeTmplConfModel = this.taleModel('nativeTmplConf', 'advertisement') as NativeTmplConfModel;

        const nativeTmplConfVoList = await nativeTmplConfModel.getList(nativeTmplConfGroupId);

        const nativeTmplConfResVoList = await Bluebird.map(nativeTmplConfVoList, async (nativeTmplConfVo) => {

            const { nativeTmplId } = nativeTmplConfVo;
            const nativeTmplVo = await nativeTmplModel.getNativeTmpl(nativeTmplId);

            if (think.isEmpty(nativeTmplVo)) {
                return;

            }
            const { key, preview } = nativeTmplVo;
            delete nativeTmplConfVo.nativeTmplConfGroupId;
            delete nativeTmplConfVo.nativeTmplId;

            const nativeTmplConfResVo: NativeTmplConfResVO = _.defaults({
                key, preview
            }, nativeTmplConfVo);

            return nativeTmplConfResVo;
        });

        return _.compact(nativeTmplConfResVoList);
    }

    /**
     * 查询 adGroup, abTestMap, versionGroup, adType 四张表,
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
     * 查询 nativeTmplConfGroup, nativeTmplConf, abTestGroup, versionGroup 四张表,
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
                type, channel, adGroupName
            }, adVo);

            return adResVo;
        });

        return _.compact(adResVoList);
    }

    /**
     * 查询 ad, adChannel 两张表,
     * <br/>获取广告组下广告列表信息
     * @argument {string} adGroupId 广告组表 id;
     */
    public async getAdListInAdGroup(adGroupId: string) {
        const adModel = this.taleModel('ad', 'advertisement') as AdModel;
        const adChannelModel = this.taleModel('adChannel', 'advertisement') as AdChannelModel;

        const adVoList = await adModel.getListByAdGroup(adGroupId);
        const adResVoList = await Bluebird.map(adVoList, async (adVo) => {
            const { adChannelId } = adVo;

            const adChannelVo = await adChannelModel.getAdChannel(adChannelId);

            if (think.isEmpty(adChannelVo)) {
                return;
            }

            const { channel } = adChannelVo;
            delete adVo.productId;
            delete adVo.adGroupId;
            delete adVo.adTypeId;
            delete adVo.adChannelId;

            const adResVo: AdResVO = _.defaults({
                channel
            }, adVo);

            return adResVo;
        });

        return _.compact(adResVoList);
    }

    /**
     * 获取关联组下常量数据,
     * <br/>迭代查询关联组下的常量，一起返回
     * @argument {string} dependent 关联组名
     * @argument {string} dependentId 关联组主键 id
     * @argument {{ [propName: string]: ConfigResVO; }} dpdConfigResVo 关联组下常量数据
     */
    private async getDpdConfigResVo(
        dependent: string,
        dependentId: string,
        dpdConfigResVo: { [propName: string]: ConfigResVO; } = {}
    ): Promise<object> {
        // think.logger.debug(`configGroupId: ${configGroupId}`);
        const configModel = this.taleModel('config', 'advertisement') as ConfigModel;
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;

        const [
            configVoList,
            configGroupVo
        ] = await Promise.all([
            configModel.getList(dependentId, 1),
            configGroupModel.getConfigGroup(dependentId)    // 关联组 id
        ]);

        // 依赖组未配置或者失效直接返回
        if (think.isEmpty(configGroupVo) || !configGroupVo.active) {
            return dpdConfigResVo;
        }

        const configResVo: { [propName: string]: ConfigResVO; } = {};
        configVoList.map((configVo) => {

            const { key } = configVo;
            delete configVo.configGroupId;
            configResVo[key] = _.defaults({ dependent }, configVo);
        });

        _.defaults(dpdConfigResVo, configResVo);

        // 依赖组存在依赖组继续迭代，否则返回
        if (configGroupVo.dependentId) {
            return await this.getDpdConfigResVo(dependent, configGroupVo.dependentId, dpdConfigResVo);

        } else {
            return dpdConfigResVo;
        }
    }

    /**
     * 查询 configGroup, config, product 三张表,
     * <br/>获取常量组下常量数据列表,
     * <br/>迭代查询关联组下的常量，一起返回
     * @argument {string} configGroupId 常量组主键 id
     */
    public async getConfigList(configGroupId: string) {
        const configModel = this.taleModel('config', 'advertisement') as ConfigModel;
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;
        const baseConfigModel = this.taleModel('baseConfig', 'advertisement') as BaseConfigModel;
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;

        const [
            configVoList,
            { dependentId, type, productId }
        ] = await Promise.all([
            configModel.getList(configGroupId),
            configGroupModel.getConfigGroup(configGroupId)    // 关联组 id
        ]);

        // 当前常量组常量
        const configResVo: { [propName: string]: ConfigResVO; } = {};

        configVoList.map((configVo) => {

            const { key } = configVo;
            delete configVo.configGroupId;
            configResVo[key] = _.defaults({ dependent: null }, configVo);
        });

        // 依赖组常量
        let dpdConfigResVo: object = {};
        if (dependentId) {
            const { name: dependent } = await configGroupModel.getConfigGroup(dependentId);    // 关联组名
            dpdConfigResVo = await this.getDpdConfigResVo(dependent, dependentId);

        }
        // 广告常量依赖于基础常量
        const baseConfigResVo: { [propName: string]: ConfigResVO; } = {};
        if (type === 0) {
            const { test } = await productModel.getProduct(productId);
            const baseConfigVoList = await baseConfigModel.getList(1, test);

            baseConfigVoList.map((baseConfigVo) => {

                const { key } = baseConfigVo;
                delete baseConfigVo.test;
                baseConfigResVo[key] = _.defaults({ dependent: '基础常量' }, baseConfigVo);
            });

        }
        _.defaults(configResVo, dpdConfigResVo, baseConfigResVo);
        return _.values(configResVo);
    }

    /**
     * 查询 configGroup, abTestGroup, versionGroup 三张表,
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
     * 查询 configGroup, abTestGroup, versionGroup 三张表,
     * <br/>获取常量组数据
     * @argument {string} id 常量组主键 id
     */
    public async getConfigGroup(configGroupId: string) {
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;

        const configGroupVo = await configGroupModel.getConfigGroup(configGroupId);
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
    }

    /**
     * 查询 nativeTmplConfGroup, abTestGroup, versionGroup 三张表,
     * <br/>获取 native 模板组信息
     * @argument {string} nativeTmplConfGroupId  native 模板组表 id;
     */
    public async getNativeTmplConfGroup(nativeTmplConfGroupId: string) {
        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;

        const nativeTmplConfGroupVo = await nativeTmplConfGroupModel.getNativeTmplConfGroup(nativeTmplConfGroupId);
        const { id } = nativeTmplConfGroupVo;

        const verionGroupIdList = await abTestGroupModel.getVerionGroupIdListByNative(id);
        const versionGroupNameList = await versionGroupModel.getVersionGroupNameList(verionGroupIdList, 1);

        delete nativeTmplConfGroupVo.productId;

        const nativeTmplConfGroupResVo: NativeTmplConfGroupResVO = _.defaults({
            versionGroup: versionGroupNameList,
        }, nativeTmplConfGroupVo);

        return nativeTmplConfGroupResVo;
    }

    /**
     * 查询 adGroup, abTestMap, adType, product 四张表,
     * <br/>获取广告组列表信息
     * @argument {string} abTestGroupId ab 分组表主键 id;
     */
    public async getAdGroupListInAb(abTestGroupId: string) {
        const adGroupModel = this.taleModel('adGroup', 'advertisement') as AdGroupModel;
        const abTestMapModel = this.taleModel('abTestMap', 'advertisement') as AbTestMapModel;
        const adTypeModel = this.taleModel('adType', 'advertisement') as AdTypeModel;

        const abTestMapVoList = await abTestMapModel.getList(abTestGroupId);

        const adGroupResVoList: AdGroupResVO[] = await Bluebird.map(abTestMapVoList, async (abTestMapVo) => {
            const { adGroupId, place } = abTestMapVo;

            if (adGroupId) {
                const [adGroupVo, adList] = await Promise.all([
                    adGroupModel.getAdGroup(adGroupId),
                    this.getAdListInAdGroup(adGroupId)
                ]);
                const { adTypeId } = adGroupVo;

                const adTypeVo = await adTypeModel.getAdType(adTypeId);

                if (think.isEmpty(adTypeVo)) {
                    return {
                        place,
                        type: undefined, versionGroup: undefined,
                        name: undefined, description: undefined, active: undefined
                    };
                }

                const { name: type } = adTypeVo;

                delete adGroupVo.productId;
                delete adGroupVo.adTypeId;

                const adGroupResVo: AdGroupResVO = _.defaults({
                    type, place, adList, versionGroup: undefined
                }, adGroupVo);

                return adGroupResVo;
            }
            return {
                place,
                type: undefined, versionGroup: undefined,
                name: undefined, description: undefined, active: undefined
            };
        });

        return adGroupResVoList;
    }

}