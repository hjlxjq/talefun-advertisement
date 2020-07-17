/**
 * ProductManager Controller module.
 * <br/>应用和项目组相关配置
 * @module advertisement/controller/productManager
 * @see advertisement/controller/productManager;
 * @debugger
 */
import { think } from 'thinkjs';
import * as Bluebird from 'bluebird';
import * as _ from 'lodash';

import { TaleCode } from '../../common/tale/TaleDefine';
import BaseController from '../../common/tale/BaseController';

import ProductModel from '../model/product';
import ProductGroupModel from '../model/productGroup';
import PackParamConfModel from '../model/packParamConf';
import ChannelParamConfModel from '../model/channelParamConf';
import ProductGroupAuthModel from '../model/productGroupAuth';
import ProductAuthModel from '../model/productAuth';

import ModelServer from '../service/modelServer';
import AuthServer from '../service/authServer';
import DispatchCacheServer from '../service/dispatchCacheServer';

import {
    PackParamConfVO, ChannelParamConfVO, ProductVO, ProductGroupVO, ProductResVO, ProductGroupAuthVO,
    ProductGroupResVO, ProductAuthVO,
} from '../defines';

import {
    ProductListResVO, PackParamConfListReqVO, PackParamConfListResVO, GetProductReqVO, GetProductResVO,
    ChannelParamConfListReqVO, ChannelParamConfListResVO, UpdatePackParamConfReqVO, UpdatePackParamConfResVO,
    UpdateChannelParamConfReqVO, UpdateChannelParamConfResVO, UpdateProductReqVO, UpdateProductResVO,
    ProductGroupListResVO, CreateProductGroupReqVO, CreateProductGroupResVO, UpdateProductGroupReqVO,
    UpdateProductGroupResVO, ProductListInProductGroupReqVO, ProductListInProductGroupResVO, CreateProductReqVO,
    CreateProductResVO, GetProductGroupReqVO, GetProductGroupResVO,
} from '../interface';

export default class ProductManagerController extends BaseController {
    /**
     * GET，
     * <br/>获取全部应用列表
     * @returns {ProductListResVO}
     * @debugger yes
     */
    public async productListAction() {
        const ucId: string = this.ctx.state.userId;
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;
        const productGroupModel = this.taleModel('productGroup', 'advertisement') as ProductGroupModel;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const userAuth = await authServer.fetchUserAuth(ucId);
        const { master } = userAuth;

        // 应用列表
        let productVoList: ProductVO[];

        if (master === 1) {    // 管理员获取全部应用
            productVoList = await productModel.getList();

        } else {    // 获取用户有权查看的全部应用
            productVoList = await modelServer.getProductListByUser(ucId);

        }

        // 返回前端的应用信息列表
        const productResVoList = await Bluebird.map(productVoList, async (productVo) => {
            // 项目组表对象，获取项目组名
            const productGroupVo = await productGroupModel.getVo(productVo.productGroupId);
            const { name: productGroupName, active } = productGroupVo;

            // 项目组不生效则不显示其下的应用
            if (active === 0) {
                return;

            }

            // 返回应用信息包含项目组名
            const productResVo: ProductResVO = _.defaults({
                productGroupName, productAuth: undefined
            }, productVo);

            // 删除不必要的字段
            delete productResVo.productGroupId;
            delete productResVo.createdAt;
            delete productResVo.updatedAt;

            return productResVo;

        }, { concurrency: 3 });

        return this.success(_.compact(productResVoList));

    }

    /**
     * <br/>获取应用详情
     * @argument {GetProductReqVO}
     * @returns {GetProductResVO}
     * @debugger yes
     */
    public async productAction() {
        const ucId: string = this.ctx.state.userId;
        const productId: string = this.post('id');
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const [
            productVo, productAuth
        ] = await Promise.all([
            productModel.getVo(productId),
            authServer.fetchProductAuth(ucId, productId)
        ]);

        const productResVo: ProductResVO = _.defaults({
            productAuth, productGroupName: undefined
        }, productVo);

        // 删除不必要的字段
        delete productResVo.productGroupId;
        delete productResVo.createdAt;
        delete productResVo.updatedAt;

        return this.success(productResVo);

    }

    /**
     * <br/>更新应用
     * @argument {UpdateProductReqVO}
     * @returns {UpdateProductResVO}
     * @debugger yes
     */
    public async updateProductAction() {
        const ucId: string = this.ctx.state.userId;
        const pid: string = this.post('pid');
        const productId: string = this.post('id');
        const active: number = this.post('active');
        const test: number = this.post('test');
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;
        const dispatchCacheServer = this.taleService('dispatchCacheServer', 'advertisement') as DispatchCacheServer;

        const productVo: ProductVO = {
            name: undefined, packageName: undefined, platform: undefined, pid,
            test, active, productGroupId: undefined
        };
        await productModel.updateProduct(productId, productVo);

        if (!_.isNil(test)) {
            // 刷新到 下发 redis
            await dispatchCacheServer.refreshProductData(productId);

        }

        return this.success('updated');

    }

    /**
     * <br/>获取应用打包参数
     * @argument {PackParamConfListReqVO}
     * @returns {PackParamConfListResVO}
     * @debugger yes
     */
    public async packParamConfListAction() {
        const ucId: string = this.ctx.state.userId;
        const productId: string = this.post('id');
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const packParamConfResVoList = await modelServer.getPackParamConfList(productId);
        return this.success(packParamConfResVoList);

    }

    /**
     * <br/>更新应用打包参数
     * @argument {UpdatePackParamConfReqVO}
     * @returns {UpdatePackParamConfResVO}
     * @debugger yes
     */
    public async updatePackParamConfAction() {
        const ucId: string = this.ctx.state.userId;
        const packParamId: string = this.post('id');
        const productId: string = this.post('productId');
        const value: string = this.post('value');
        const packParamConfModel = this.taleModel('packParamConf', 'advertisement') as PackParamConfModel;

        // value 不存在 或者 不为 '' 和 null，即为空，则创建或者更新
        if (!_.isEmpty(value)) {
            // 创建或者更新，要补全所有字段
            const packParamConfUpdateVo: PackParamConfVO = {
                value, packParamId, productId
            };

            await packParamConfModel.thenUpdateVo(packParamId, productId, packParamConfUpdateVo);

            // 否者从数据库中删除
        } else {
            await packParamConfModel.delPackParamConf(packParamId, productId);

        }
        return this.success('updated');

    }

    /**
     * GET，
     * <br/>获取应用广告平台参数列表
     * @argument {ChannelParamConfListReqVO}
     * @returns {ChannelParamConfListResVO}
     * @debugger yes
     */
    public async channelParamConfListAction() {
        const ucId: string = this.ctx.state.userId;
        const productId: string = this.post('id');
        const adType: string = this.post('type');
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const channelParamResVoList = await modelServer.getChannelParamConfList(productId, adType);
        return this.success(channelParamResVoList);

    }

    /**
     * <br/>更新应用平台参数
     * @argument {UpdateChannelParamConfReqVO}
     * @returns {UpdateChannelParamConfResVO}
     * @debugger yes
     */
    public async updateChannelParamConfAction() {
        const ucId: string = this.ctx.state.userId;
        const adChannelId: string = this.post('id');
        const productId: string = this.post('productId');
        const value1: string = this.post('value1');
        const value2: string = this.post('value2');
        const value3: string = this.post('value3');
        const channelParamConfModel = this.taleModel('channelParamConf', 'advertisement') as ChannelParamConfModel;

        // 创建或者更新，要补全所有字段
        const channelParamConfUpdateVo: ChannelParamConfVO = {
            value1, value2, value3, adChannelId, productId
        };
        await channelParamConfModel.thenUpdateVo(
            adChannelId, productId, channelParamConfUpdateVo
        );

        const channelParamConfVo = await channelParamConfModel.getVo(adChannelId, productId);

        // 如果所有 value 都不存在，则删除
        if (
            _.isEmpty(channelParamConfVo.value1) &&
            _.isEmpty(channelParamConfVo.value2) &&
            _.isEmpty(channelParamConfVo.value3)
        ) {
            await channelParamConfModel.delVo(adChannelId, productId);

        }

        return this.success('updated');
    }

    /**
     * <br/>获取项目组列表
     * @returns {ProductGroupListResVO}
     * @debugger yes
     */
    public async productGroupListAction() {
        const ucId: string = this.ctx.state.userId;
        const productGroupModel = this.taleModel('productGroup', 'advertisement') as ProductGroupModel;
        const productGroupAuthModel = this.taleModel('productGroupAuth', 'advertisement') as ProductGroupAuthModel;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const userAuth = await authServer.fetchUserAuth(ucId);
        const { master } = userAuth;

        let productGroupVoList: ProductGroupVO[];
        if (master === 1) {    // 管理员获取全部应用
            productGroupVoList = await productGroupModel.getList();

        } else {    // 获取用户有权查看的全部应用
            const productGroupIdList = await productGroupAuthModel.getIdListByUser(ucId);
            productGroupVoList = await productGroupModel.getListByAuth(productGroupIdList);
        }

        return this.success(productGroupVoList);

    }

    /**
     * <br/>获取项目组详情
     * @argument {GetProductGroupReqVO}
     * @returns {GetProductGroupResVO}
     * @debugger yes
     */
    public async productGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const productGroupId: string = this.post('id');
        const productGroupModel = this.taleModel('productGroup', 'advertisement') as ProductGroupModel;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const [
            productGroupVo, productGroupAuth
        ] = await Promise.all([
            productGroupModel.getVo(productGroupId),
            authServer.fetchProductGroupAuth(ucId, productGroupId)
        ]);

        // 返回项目组详情，包含用户在项目组下权限
        const productGroupResVo: ProductGroupResVO = _.defaults({
            productGroupAuth
        }, productGroupVo);

        // 删除不必要的字段
        delete productGroupResVo.createdAt;
        delete productGroupResVo.updatedAt;

        return this.success(productGroupResVo);

    }

    /**
     * <br/>创建项目组
     * @argument {CreateProductGroupReqVO}
     * @returns {CreateProductGroupResVO}
     * @debugger yes
     */
    public async createProductGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const name: string = this.post('name');
        const description: string = this.post('description');
        const active: number = this.post('active');
        const productGroupModel = this.taleModel('productGroup', 'advertisement') as ProductGroupModel;
        const productGroupAuthModel = this.taleModel('productGroupAuth', 'advertisement') as ProductGroupAuthModel;

        const productGroupVo: ProductGroupVO = {
            name, description, active
        };

        const productGroupId = await productGroupModel.addVo(productGroupVo);

        // 创建者自动拥有管理员权限
        const productGroupAuthVo: ProductGroupAuthVO = {
            productGroupId, userId: ucId, master: 1,
            editAd: 1, viewAd: 1, editGameConfig: 1, viewGameConfig: 1,
            editPurchase: 1, viewPurchase: 1, editProduct: 1, createProduct: 1
        };
        await productGroupAuthModel.addVo(productGroupAuthVo);

        this.success('created');
    }

    /**
     * <br/>更新项目组
     * @argument {UpdateProductGroupReqVO}
     * @returns {UpdateProductGroupResVO}
     * @debugger yes
     */
    public async updateProductGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const description: string = this.post('description');
        const productGroupId: string = this.post('id');
        const active: number = this.post('active');
        const productGroupModel = this.taleModel('productGroup', 'advertisement') as ProductGroupModel;

        const productGroupVo: ProductGroupVO = {
            name: undefined, description, active,
        };
        await productGroupModel.updateProductGroup(productGroupId, productGroupVo);

        return this.success('updated');

    }

    /**
     * <br/>获取项目组下应用列表
     * @argument {ProductListInProductGroupReqVO}
     * @returns {ProductListInProductGroupResVO}
     * @debugger yes
     */
    public async productListInProductGroupAction() {
        const ucId: string = this.ctx.state.userId;
        const productGroupId: string = this.post('id');
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;

        const productVoList = await productModel.getListByProductGroup(productGroupId);

        // 返回的项目组下应用列表
        const productResVoList = _.map(productVoList, (productVo) => {
            // 删除不必要的字段
            delete productVo.productGroupId;
            delete productVo.createdAt;
            delete productVo.updatedAt;

            return productVo;

        });

        return this.success(productResVoList);
    }

    /**
     * <br/>项目组下创建应用
     * @argument {CreateProductReqVO}
     * @returns {CreateProductResVO}
     * @debugger yes
     */
    public async createProductAction() {
        const ucId: string = this.ctx.state.userId;
        const name: string = this.post('name');
        const packageName: string = this.post('packageName');
        const platform: string = this.post('platform');
        const pid: string = this.post('pid');
        const productGroupId: string = this.post('id');
        const active: number = this.post('active');
        const test: number = this.post('test');
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;
        const productAuthModel = this.taleModel('productAuth', 'advertisement') as ProductAuthModel;
        const dispatchCacheServer = this.taleService('dispatchCacheServer', 'advertisement') as DispatchCacheServer;

        const productVo: ProductVO = {
            productGroupId,
            name, packageName, platform, pid,
            test, active
        };
        const productId = await productModel.addVo(productVo);

        // 创建者自动拥有管理员权限
        const productAuthVo: ProductAuthVO = {
            productId, userId: ucId, master: 1,
            editAd: 1, viewAd: 1, editGameConfig: 1, viewGameConfig: 1,
            editPurchase: 1, viewPurchase: 1, editProduct: 1,
        };
        await productAuthModel.addVo(productAuthVo);

        // 刷新到 下发 redis
        await dispatchCacheServer.refreshProductData(productId);

        this.success('created');

    }

}