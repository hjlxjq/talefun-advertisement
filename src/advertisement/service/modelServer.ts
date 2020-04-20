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
    AdVO, AdChannelResVO, PackParamConfResVO, ChannelParamConfResVO, ProductGroupResVO, ProductGroupVO, VersionGroupVO,
    ConfigGroupResVO, ConfigResVO, NativeTmplConfResVO, VersionGroupResVO, NativeTmplConfGroupResVO, AdGroupResVO,
    AdResVO,
    BaseConfigVO,
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

            const adTypeIdList = await adChannelMapModel.getAdTypeIdList(adChannelVo.id);
            // 获取支持的广告类型
            const adTypeList = await Bluebird.map(adTypeIdList, async (adTypeId) => {
                const adTypeVo = await adTypeModel.getAdType(adTypeId, 1);

                if (adTypeVo) {
                    return adTypeVo.type;
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
        const adTypeIdList = await adChannelMapModel.getAdTypeIdList(adChannelVo.id);

        // 获取支持的广告类型
        const adTypeList = await Bluebird.map(adTypeIdList, async (adTypeId) => {
            const adTypeVo = await adTypeModel.getAdType(adTypeId, 1);

            if (adTypeVo) {
                return adTypeVo.type;
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
            delete packParamVo.test;
            delete packParamVo.active;
            delete packParamVo.updateAt;
            delete packParamVo.createAt;

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
     * 查询 adChannel, channelParamConf, product 三张表,
     * <br/>获取应用广告平台参数信息
     * @argument {string} productId 应用表 id;
     */
    public async getChannelParamConfList(productId: string) {
        const adChannelModel = this.taleModel('adChannel', 'advertisement') as AdChannelModel;
        const channelParamConfModel = this.taleModel('channelParamConf', 'advertisement') as AdChannelConfModel;
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;

        const { test } = await productModel.getProduct(productId);
        const adChannelVoList = await adChannelModel.getList(1, test);

        const channelParamConfResVoList = await Bluebird.map(adChannelVoList, async (adChannelVo) => {
            delete adChannelVo.test;
            delete adChannelVo.active;
            delete adChannelVo.updateAt;
            delete adChannelVo.createAt;

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
     * 查询 productGroup, product, productGroupAuth 三张表,
     * <br/>获取所有项目组列表信息，或者用户拥有权限的项目组列表信息
     * @argument {string} userId 用户表 id;
     */
    public async getProductGroupList(userId?: string) {
        const productGroupModel = this.taleModel('productGroup', 'advertisement') as ProductGroupModel;
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;
        const productGroupAuthModel = this.taleModel('productGroupAuth', 'advertisement') as ProductGroupAuthModel;

        let productGroupVoList: ProductGroupVO[];

        if (userId) {    // 用户拥有权限的项目组列表信息
            const productGroupIdList = await productGroupAuthModel.getIdListByUser(userId);
            productGroupVoList = await productGroupModel.getListByAuth(productGroupIdList);

        } else {    // 所有项目组列表信息
            productGroupVoList = await productGroupModel.getList();
        }

        const productGroupResVoList = await Bluebird.map(productGroupVoList, async (productGroupVo) => {

            const [
                productNum,
                userNum
            ] = await Promise.all([
                productModel.getNum(productGroupVo.id, 1),
                productGroupAuthModel.getNum(productGroupVo.id, 1),
            ]);

            const productGroupResVo: ProductGroupResVO = _.defaults(
                {
                    productNum,
                    userNum
                },
                productGroupVo
            );

            return productGroupResVo;
        });

        return productGroupResVoList;
    }

    /**
     * 查询 productGroup, product, productGroupAuth 三张表,
     * <br/>获取所有项目组列表信息，或者用户拥有权限的项目组列表信息
     * @argument {string} productGroupId 项目组表 id;
     */
    public async getProductGroup(productGroupId: string) {
        const productGroupModel = this.taleModel('productGroup', 'advertisement') as ProductGroupModel;
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;
        const productGroupAuthModel = this.taleModel('productGroupAuth', 'advertisement') as ProductGroupAuthModel;

        const productGroupVo = await productGroupModel.getProductGroup(productGroupId);
        const [
            productNum,
            userNum
        ] = await Promise.all([
            productModel.getNum(productGroupVo.id, 1),
            productGroupAuthModel.getNum(productGroupVo.id, 1),
        ]);

        const productGroupResVo: ProductGroupResVO = _.defaults(
            {
                productNum,
                userNum
            },
            productGroupVo
        );

        return productGroupResVo;

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
     * 查询 nativeTmplConfGroup, nativeTmplConf, abTestGroup, versionGroup 四张表,
     * <br/>获取 native 模板组列表信息
     * @argument {string} productId 应用表 id;
     */
    public async getNativeTmplConfGroupList(productId: string) {
        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;
        const nativeTmplConfModel = this.taleModel('nativeTmplConf', 'advertisement') as NativeTmplConfModel;
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;

        const nativeTmplConfGroupVoList = await nativeTmplConfGroupModel.getList(productId);
        const nativeTmplConfGroupResVoList =
            await Bluebird.map(nativeTmplConfGroupVoList, async (nativeTmplConfGroupVo) => {
                const { id } = nativeTmplConfGroupVo;

                const nativeTmplConfNum = await nativeTmplConfModel.getNum(id, 1);
                const verionGroupIdList = await abTestGroupModel.getVerionGroupIdListByNative(id);
                const versionGroupNameList = await versionGroupModel.getVersionGroupNameList(verionGroupIdList, 1);

                delete nativeTmplConfGroupVo.productId;
                const nativeTmplConfGroupResVo: NativeTmplConfGroupResVO = _.defaults({
                    nativeTmplConfNum, versionGroup: versionGroupNameList,
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
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;
        const nativeTmplModel = this.taleModel('nativeTmpl', 'advertisement') as NativeTmplModel;
        const nativeTmplConfModel = this.taleModel('nativeTmplConf', 'advertisement') as NativeTmplConfModel;

        const [
            nativeTmplConfVoList, productVo
        ] = await Promise.all([
            nativeTmplConfModel.getList(nativeTmplConfGroupId),
            productModel.getProduct(productId)
        ]);
        const nativeTmplConfResVoList = await Bluebird.map(nativeTmplConfVoList, async (nativeTmplConfVo) => {

            const { test } = productVo;
            const { nativeTmplId } = nativeTmplConfVo;
            const nativeTmplVo = await nativeTmplModel.getNativeTmpl(nativeTmplId, 1, test);

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
     * 查询 adGroup, ad, abTestMap, versionGroup, adType, product 六张表,
     * <br/>获取广告组列表信息
     * @argument {string} productId 应用表 id;
     */
    public async getAdGroupList(productId: string) {
        const adGroupModel = this.taleModel('adGroup', 'advertisement') as AdGroupModel;
        const adModel = this.taleModel('ad', 'advertisement') as AdModel;
        const abTestMapModel = this.taleModel('abTestMap', 'advertisement') as AbTestMapModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const adTypeModel = this.taleModel('adType', 'advertisement') as AdTypeModel;
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;

        const adGroupVoList = await adGroupModel.getList(productId);
        const adGroupResVoList = await Bluebird.map(adGroupVoList, async (adGroupVo) => {
            const { id, adTypeId } = adGroupVo;

            const { test } = await productModel.getProduct(productId);
            const adTypeVo = await adTypeModel.getAdType(adTypeId, 1, test);

            if (think.isEmpty(adTypeVo)) {
                return;
            }

            const { type } = adTypeVo;

            const adNum = await adModel.getNum(id, 1);
            const verionGroupIdList = await abTestMapModel.getAbTestGroupIdByAdGrroup(id);
            const versionGroupNameList = await versionGroupModel.getVersionGroupNameList(verionGroupIdList, 1);

            delete adGroupVo.productId;
            delete adGroupVo.adTypeId;

            const adGroupResVo: AdGroupResVO = _.defaults({
                type, adNum, versionGroup: versionGroupNameList,
            }, adGroupVo);

            return adGroupResVo;
        });

        return _.compact(adGroupResVoList);
    }

    /**
     * 查询 nativeTmplConfGroup, nativeTmplConf, abTestGroup, versionGroup, product 五张表,
     * <br/>获取广告列表信息
     * @argument {string} productId 应用表 id;
     */
    public async getAdList(productId: string) {
        const adGroupModel = this.taleModel('adGroup', 'advertisement') as AdGroupModel;
        const adModel = this.taleModel('ad', 'advertisement') as AdModel;
        const adTypeModel = this.taleModel('adType', 'advertisement') as AdTypeModel;
        const adChannelModel = this.taleModel('adChannel', 'advertisement') as AdChannelModel;
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;

        const adVoList = await adModel.getListByProduct(productId);
        const adResVoList: AdResVO[] = await Bluebird.map(adVoList, async (adVo) => {
            const { adChannelId, adTypeId, adGroupId } = adVo;

            const { test } = await productModel.getProduct(productId);

            const [
                adTypeVo, adChannelVo, adGroupVo
            ] = await Promise.all([
                adTypeModel.getAdType(adTypeId, 1, test),
                adChannelModel.getAdChannel(adChannelId, 1, test),
                adGroupModel.getAdGroup(adGroupId, 1)
            ]);

            if (think.isEmpty(adTypeVo) || think.isEmpty(adChannelVo) || think.isEmpty(adGroupVo)) {
                return;
            }

            const { type } = adTypeVo;
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
     * 查询 ad, nativeTmplConf, adChannel, versionGroup, product 五张表,
     * <br/>获取广告列表信息
     * @argument {string} adGroupId 广告组表 id;
     */
    public async getAdListInAdGroup(adGroupId: string) {
        const adModel = this.taleModel('ad', 'advertisement') as AdModel;
        const adChannelModel = this.taleModel('adChannel', 'advertisement') as AdChannelModel;
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;

        const adVoList = await adModel.getListByAdGroup(adGroupId);
        const adResVoList = await Bluebird.map(adVoList, async (adVo) => {
            const { adChannelId, productId } = adVo;

            const { test } = await productModel.getProduct(productId);
            const adChannelVo = await adChannelModel.getAdChannel(adChannelId, 1, test);

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
     * 查询 ad, adGroup 两张表,
     * <br/>创建广告
     * @argument {string} adGroupId 广告组表 id;
     * @argument {AdVO} adVo 广告表对象;
     */
    public async addAd(adGroupId: string, adVo: AdVO) {
        const adModel = this.taleModel('ad', 'advertisement') as AdModel;
        const adGroupModel = this.taleModel('adGroup', 'advertisement') as AdGroupModel;

        const adGroupVo = await adGroupModel.getAdGroup(adGroupId);
        adVo.adTypeId = adGroupVo.adTypeId;

        return adModel.addAd(adVo);
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
            configModel.getList(dependentId, 1),    // 依赖组只返回生效的常量
            configGroupModel.getConfigGroup(dependentId)    // 关联组 id
        ]);

        // 依赖组未配置直接返回
        if (!configGroupVo) {
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
     * 查询 configGroup, config, abTestGroup, versionGroup 四张表,
     * 获取常量组信息列表
     * @argument {string} productId 应用表主键 id
     * @argument {number} type 0 广告 1 游戏常量
     */
    public async getConfigGroupList(productId: string, type: number) {
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const configModel = this.taleModel('config', 'advertisement') as ConfigModel;
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;

        const configGroupVoList = await configGroupModel.getListByProductAndType(productId, type);

        const configGroupResVoList = await Bluebird.map(configGroupVoList, async (configGroupVo) => {
            const { id, dependentId } = configGroupVo;

            let dependent: string = null;
            if (dependentId) {
                dependent = (await configGroupModel.getConfigGroup(dependentId)).name;
            }

            const [
                configNum, verionGroupIdList
            ] = await Promise.all([
                configModel.getNum(id, 1),
                abTestGroupModel.getVerionGroupIdListByConfig(id)
            ]);

            const versionGroupNameList = await versionGroupModel.getVersionGroupNameList(verionGroupIdList, 1);

            const configGroupResVo: ConfigGroupResVO = _.defaults({
                dependent, configNum, versionGroup: versionGroupNameList
            }, configGroupVo);

            return configGroupResVo;
        });
        return configGroupResVoList;
    }

    /**
     * 查询 configGroup, config, abTestGroup, versionGroup 四张表,
     * <br/>获取常量组数据
     * @argument {string} id 常量组主键 id
     */
    public async getConfigGroup(configGroupId: string) {
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const configModel = this.taleModel('config', 'advertisement') as ConfigModel;
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;

        const configGroupVo = await configGroupModel.getConfigGroup(configGroupId);
        const { id, dependentId } = configGroupVo;

        let dependent: string = null;
        if (dependentId) {
            dependent = (await configGroupModel.getConfigGroup(dependentId)).name;
        }

        const [
            configNum, verionGroupIdList
        ] = await Promise.all([
            configModel.getNum(id, 1),
            abTestGroupModel.getVerionGroupIdListByConfig(id)
        ]);

        const versionGroupNameList = await versionGroupModel.getVersionGroupNameList(verionGroupIdList, 1);

        const configGroupResVo: ConfigGroupResVO = _.defaults({
            dependent, configNum, versionGroup: versionGroupNameList
        }, configGroupVo);

        return configGroupResVo;
    }

    /**
     * 查询 nativeTmplConfGroup, nativeTmplConf, abTestGroup, versionGroup 四张表,
     * <br/>获取 native 模板组信息
     * @argument {string} nativeTmplConfGroupId  native 模板组表 id;
     */
    public async getNativeTmplConfGroup(nativeTmplConfGroupId: string) {
        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;
        const nativeTmplConfModel = this.taleModel('nativeTmplConf', 'advertisement') as NativeTmplConfModel;
        const abTestGroupModel = this.taleModel('abTestGroup', 'advertisement') as AbTestGroupModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;

        const nativeTmplConfGroupVo = await nativeTmplConfGroupModel.getNativeTmplConfGroup(nativeTmplConfGroupId);
        const { id } = nativeTmplConfGroupVo;

        const nativeTmplConfNum = await nativeTmplConfModel.getNum(id, 1);
        const verionGroupIdList = await abTestGroupModel.getVerionGroupIdListByNative(id);
        const versionGroupNameList = await versionGroupModel.getVersionGroupNameList(verionGroupIdList, 1);

        delete nativeTmplConfGroupVo.productId;
        const nativeTmplConfGroupResVo: NativeTmplConfGroupResVO = _.defaults({
            nativeTmplConfNum, versionGroup: versionGroupNameList,
        }, nativeTmplConfGroupVo);

        return nativeTmplConfGroupResVo;
    }

    /**
     * 查询 adGroup, ad, abTestMap, versionGroup, adType, product 六张表,
     * <br/>获取广告组列表信息
     * @argument {string} abTestGroupId ab 分组表主键 id;
     */
    public async getAdGroupListInAb(abTestGroupId: string) {
        const adGroupModel = this.taleModel('adGroup', 'advertisement') as AdGroupModel;
        const adModel = this.taleModel('ad', 'advertisement') as AdModel;
        const abTestMapModel = this.taleModel('abTestMap', 'advertisement') as AbTestMapModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const adTypeModel = this.taleModel('adType', 'advertisement') as AdTypeModel;
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;

        const abTestMapVoList = await abTestMapModel.getList(abTestGroupId);

        const adGroupResVoList: AdGroupResVO[] = await Bluebird.map(abTestMapVoList, async (abTestMapVo) => {
            const { adGroupId, place } = abTestMapVo;

            if (adGroupId) {
                const [adGroupVo, adList] = await Promise.all([
                    adGroupModel.getAdGroup(adGroupId),
                    this.getAdListInAdGroup(adGroupId)
                ]);
                const { id, adTypeId, productId } = adGroupVo;

                const { test } = await productModel.getProduct(productId);
                const adTypeVo = await adTypeModel.getAdType(adTypeId, 1, test);

                if (think.isEmpty(adTypeVo)) {
                    return {
                        place,
                        type: undefined, adNum: undefined, versionGroup: undefined,
                        name: undefined, description: undefined, active: undefined
                    };
                }

                const { type } = adTypeVo;

                const [adNum, verionGroupIdList] = await Promise.all([
                    adModel.getNum(id, 1),
                    abTestMapModel.getAbTestGroupIdByAdGrroup(id)
                ]);
                const versionGroupNameList = await versionGroupModel.getVersionGroupNameList(verionGroupIdList, 1);

                delete adGroupVo.productId;
                delete adGroupVo.adTypeId;

                const adGroupResVo: AdGroupResVO = _.defaults({
                    type, adNum, versionGroup: versionGroupNameList, place, adList
                }, adGroupVo);

                return adGroupResVo;
            }
            return {
                place,
                type: undefined, adNum: undefined, versionGroup: undefined,
                name: undefined, description: undefined, active: undefined
            };
        });

        return adGroupResVoList;
    }

}