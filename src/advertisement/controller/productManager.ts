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

import {
    PackParamConfVO, ChannelParamConfVO, ProductVO, ProductGroupVO, ProductResVO, ProductGroupAuthVO,
    ProductGroupResVO, ProductAuthVO,
} from '../defines';

import {
    ProductListResVO, PackParamConfListReqVO, PackParamConfListResVO, GetProductReqVO, GetProductResVO,
    CreatePackParamConfReqVO, CreatePackParamConfResVO, ChannelParamConfListReqVO, ChannelParamConfListResVO,
    UpdatePackParamConfReqVO, UpdatePackParamConfResVO, DeletePackParamConfReqVO, DeletePackParamConfResVO,
    CreateChannelParamConfReqVO, CreateChannelParamConfResVO, UpdateChannelParamConfReqVO, UpdateChannelParamConfResVO,
    DeleteChannelParamConfReqVO, DeleteChannelParamConfResVO, UpdateProductReqVO, UpdateProductResVO,
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
        const ucId: string = this.ctx.state.userId || '';
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;
        const productGroupModel = this.taleModel('productGroup', 'advertisement') as ProductGroupModel;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const userAuth = await authServer.fetchUserAuth(ucId);
        const { master } = userAuth;

        let productVoList: ProductVO[];

        // think.logger.debug(`master: ${master}`);

        if (master === 1) {    // 管理员获取全部应用
            productVoList = await productModel.getList();

        } else {    // 获取用户有权查看的全部应用
            productVoList = await modelServer.getProductListByUser(ucId);
        }

        const productResVoList = await Bluebird.map(productVoList, async (productVo) => {

            const productGroupVo = await productGroupModel.getProductGroup(productVo.productGroupId);
            const { name: productGroupName, active } = productGroupVo;

            // 项目组不生效则不显示其下的应用
            if (!active) {
                return;
            }

            delete productVo.productGroupId;

            const productResVo: ProductResVO = _.defaults({ productGroupName }, productVo);

            return productResVo;
        });

        return this.success(_.compact(productResVoList));
    }

    /**
     * <br/>获取应用详情
     * @argument {GetProductReqVO}
     * @returns {GetProductResVO}
     * @debugger yes
     */
    public async productAction() {
        const ucId: string = this.ctx.state.userId || '';
        const productId: string = this.post('id');

        const productModel = this.taleModel('product', 'advertisement') as ProductModel;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const [
            productVo, productAuth
        ] = await Promise.all([
            productModel.getProduct(productId),
            authServer.fetchProductAuth(ucId, productId)
        ]);

        delete productVo.productGroupId;

        const productResVo: ProductResVO = _.defaults({
            productAuth
        }, productVo);

        return this.success(productResVo);
    }

    /**
     * <br/>更新应用
     * @argument {UpdateProductReqVO}
     * @returns {UpdateProductResVO}
     * @debugger yes
     */
    public async updateProductAction() {
        const ucId: string = this.ctx.state.userId || '';
        const name: string = this.post('name');
        const packageName: string = this.post('packageName');
        const platform: string = this.post('platform');
        const pid: string = this.post('pid');
        const productId: string = this.post('id');
        const active: number = this.post('active');
        const test: number = this.post('test');
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;

        const productVo: ProductVO = {
            name, packageName, platform, pid,
            test, active,
            productGroupId: undefined
        };
        const rows = await productModel.updateProduct(productId, productVo);

        if (rows === 1) {
            return this.success('updated');
        } else {
            this.fail(TaleCode.DBFaild, 'update fail!!!');
        }
    }

    /**
     * <br/>获取应用打包参数
     * @argument {PackParamConfListReqVO}
     * @returns {PackParamConfListResVO}
     * @debugger yes
     */
    public async packParamConfListAction() {
        const ucId: string = this.ctx.state.userId || '';
        const productId: string = this.post('id');
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const packParamConfResVoList = await modelServer.getPackParamConfList(productId);
        return this.success(packParamConfResVoList);
    }

    // /**
    //  * <br/>创建应用打包参数
    //  * @argument {CreatePackParamConfReqVO}
    //  * @returns {CreatePackParamConfResVO}
    //  * @debugger yes
    //  */
    // public async createPackParamConfAction() {
    //     const ucId: string = this.ctx.state.userId || '';
    //     const packParamId: string = this.post('id');    // 打包参数表 id
    //     const value: string = this.post('value');
    //     const productId: string = this.post('productId');
    //     const packParamConfModel = this.taleModel('packParamConf', 'advertisement') as PackParamConfModel;

    //     const packParamConfVo: PackParamConfVO = {
    //         packParamId, productId,
    //         value,
    //     };
    //     await packParamConfModel.addPackParamConf(packParamConfVo);
    //     this.success('created');
    // }

    /**
     * <br/>更新应用打包参数
     * @argument {UpdatePackParamConfReqVO}
     * @returns {UpdatePackParamConfResVO}
     * @debugger yes
     */
    public async updatePackParamConfAction() {
        const ucId: string = this.ctx.state.userId || '';
        const packParamId: string = this.post('id');
        const productId: string = this.post('productId');
        const value: string = this.post('value');

        const packParamConfModel = this.taleModel('packParamConf', 'advertisement') as PackParamConfModel;

        if (!_.isEmpty(value)) {
            const packParamConfUpdateVo: PackParamConfVO = {
                value,
                packParamId, productId
            };

            const result = await packParamConfModel.updatePackParamConf(packParamId, productId, packParamConfUpdateVo);
            think.logger.debug(`result: ${JSON.stringify(result)}`);

        } else {
            await packParamConfModel.delPackParamConf(packParamId, productId);

        }
        return this.success('updated');
        // if (rows === 1) {
        //     return this.success('updated');
        // } else {
        //     this.fail(TaleCode.DBFaild, 'update fail!!!');
        // }
    }

    // /**
    //  * <br/>删除应用打包参数
    //  * @argument {DeletePackParamConfReqVO}
    //  * @returns {DeletePackParamConfResVO}
    //  * @debugger yes
    //  */
    // public async deletePackParamConfAction() {
    //     const ucId: string = this.ctx.state.userId || '';
    //     const packParamId: string = this.post('id');
    //     const productId: string = this.post('productId');
    //     const packParamConfModel = this.taleModel('packParamConf', 'advertisement') as PackParamConfModel;

    //     const rows = await packParamConfModel.delPackParamConf(packParamId, productId);

    //     if (rows === 1) {
    //         return this.success('deleted');
    //     } else {
    //         this.fail(TaleCode.DBFaild, 'delete fail!!!');
    //     }
    // }

    /**
     * GET，
     * <br/>获取应用广告平台参数列表
     * @argument {ChannelParamConfListReqVO}
     * @returns {ChannelParamConfListResVO}
     * @debugger yes
     */
    public async channelParamConfListAction() {
        const ucId: string = this.ctx.state.userId || '';
        const productId: string = this.post('id');
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const channelParamResVoList = await modelServer.getChannelParamConfList(productId);
        return this.success(channelParamResVoList);
    }

    // /**
    //  * <br/>创建应用平台参数
    //  * @argument {CreateChannelParamConfReqVO}
    //  * @returns {CreateChannelParamConfResVO}
    //  * @debugger yes
    //  */
    // public async createChannelParamConfAction() {
    //     const ucId: string = this.ctx.state.userId || '';
    //     const value1: string = this.post('value1');
    //     const value2: string = this.post('value2');
    //     const value3: string = this.post('value3');
    //     const adChannelId: string = this.post('id');    // 广告平台表 id
    //     const productId: string = this.post('productId');
    //     const channelParamConfModel = this.taleModel('channelParamConf', 'advertisement') as ChannelParamConfModel;

    //     const channelParamConfVo: ChannelParamConfVO = {
    //         adChannelId, productId,
    //         value1, value2, value3
    //     };

    //     await channelParamConfModel.addChannelParamConf(channelParamConfVo);
    //     this.success('created');
    // }

    /**
     * <br/>更新应用平台参数
     * @argument {UpdateChannelParamConfReqVO}
     * @returns {UpdateChannelParamConfResVO}
     * @debugger yes
     */
    public async updateChannelParamConfAction() {
        const ucId: string = this.ctx.state.userId || '';
        const adChannelId: string = this.post('id');
        const productId: string = this.post('productId');
        const value1: string = this.post('value1');
        const value2: string = this.post('value2');
        const value3: string = this.post('value3');

        const channelParamConfModel = this.taleModel('channelParamConf', 'advertisement') as ChannelParamConfModel;

        const channelParamConfUpdateVo: ChannelParamConfVO = {
            value1, value2, value3,
            adChannelId, productId
        };
        await channelParamConfModel.updateChannelParamConf(
            adChannelId, productId, channelParamConfUpdateVo
        );

        const channelParamConfVo = await channelParamConfModel.getChannelParamConf(adChannelId, productId);

        if (
            _.isEmpty(channelParamConfVo.value1) &&
            _.isEmpty(channelParamConfVo.value2) &&
            _.isEmpty(channelParamConfVo.value3)
        ) {
            await channelParamConfModel.delChannelParamConf(adChannelId, productId);
        }

        return this.success('updated');
    }

    // /**
    //  * <br/>删除应用平台参数
    //  * @argument {DeleteChannelParamConfReqVO}
    //  * @returns {DeleteChannelParamConfResVO}
    //  * @debugger yes
    //  */
    // public async deleteChannelParamConfAction() {
    //     const ucId: string = this.ctx.state.userId || '';
    //     const adChannelId: string = this.post('id');
    //     const productId: string = this.post('productId');
    //     const channelParamConfModel = this.taleModel('channelParamConf', 'advertisement') as ChannelParamConfModel;

    //     const rows = await channelParamConfModel.delChannelParamConf(adChannelId, productId);

    //     if (rows === 1) {
    //         return this.success('deleted');
    //     } else {
    //         this.fail(TaleCode.DBFaild, 'delete fail!!!');
    //     }
    // }

    /**
     * <br/>获取项目组列表
     * @returns {ProductGroupListResVO}
     * @debugger yes
     */
    public async productGroupListAction() {
        const ucId: string = this.ctx.state.userId || '';
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const userAuth = await authServer.fetchUserAuth(ucId);
        const { master } = userAuth;

        let productGroupResVoList: ProductGroupVO[];
        if (master === 1) {    // 管理员获取全部应用
            productGroupResVoList = await modelServer.getProductGroupList();

        } else {    // 获取用户有权查看的全部应用
            productGroupResVoList = await modelServer.getProductGroupList(ucId);
        }

        return this.success(productGroupResVoList);
    }

    /**
     * <br/>获取项目组详情
     * @argument {GetProductGroupReqVO}
     * @returns {GetProductGroupResVO}
     * @debugger yes
     */
    public async productGroupAction() {
        const ucId: string = this.ctx.state.userId || '';
        const productGroupId: string = this.post('id');

        const productGroupModel = this.taleModel('productGroup', 'advertisement') as ProductGroupModel;
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const [
            productGroupVo, productGroupAuth
        ] = await Promise.all([
            modelServer.getProductGroup(productGroupId),
            authServer.fetchProductGroupAuth(ucId, productGroupId)
        ]);

        const productGroupResVo: ProductGroupResVO = _.defaults({
            productGroupAuth
        }, productGroupVo);

        return this.success(productGroupResVo);
    }

    /**
     * <br/>创建项目组
     * @argument {CreateProductGroupReqVO}
     * @returns {CreateProductGroupResVO}
     * @debugger yes
     */
    public async createProductGroupAction() {
        const ucId: string = this.ctx.state.userId || '';
        const name: string = this.post('name');
        const description: string = this.post('description');
        const active: number = this.post('active');
        const productGroupModel = this.taleModel('productGroup', 'advertisement') as ProductGroupModel;
        const productGroupAuthModel = this.taleModel('productGroupAuth', 'advertisement') as ProductGroupAuthModel;

        const productGroupVo: ProductGroupVO = {
            name, description,
            active
        };

        const productGroupId = await productGroupModel.addProductGroup(productGroupVo);

        // 创建者自动拥有管理员权限
        const productGroupAuthVo: ProductGroupAuthVO = {
            productGroupId, userId: ucId, active, master: 1,
            editAd: 1, viewAd: 1, editGameConfig: 1, viewGameConfig: 1,
            editPurchase: 1, viewPurchase: 1, editProduct: 1, createProduct: 1
        };
        await productGroupAuthModel.addProductGroupAuth(productGroupAuthVo);

        this.success('created');
    }

    /**
     * <br/>更新项目组
     * @argument {UpdateProductGroupReqVO}
     * @returns {UpdateProductGroupResVO}
     * @debugger yes
     */
    public async updateProductGroupAction() {
        const ucId: string = this.ctx.state.userId || '';
        const name: string = this.post('name');
        const description: string = this.post('description');
        const productGroupId: string = this.post('id');
        const active: number = this.post('active');
        const productGroupModel = this.taleModel('productGroup', 'advertisement') as ProductGroupModel;

        const productGroupVo: ProductGroupVO = {
            name, description,
            active,
        };
        const rows = await productGroupModel.updateProductGroup(productGroupId, productGroupVo);

        if (rows === 1) {
            return this.success('updated');
        } else {
            this.fail(TaleCode.DBFaild, 'update fail!!!');
        }
    }

    /**
     * <br/>获取项目组下应用列表
     * @argument {ProductListInProductGroupReqVO}
     * @returns {ProductListInProductGroupResVO}
     * @debugger yes
     */
    public async productListInProductGroupAction() {
        const ucId: string = this.ctx.state.userId || '';
        const productGroupId: string = this.post('id');
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;

        const productVoList = await productModel.getListByProductGroup(productGroupId);

        const productResVoList = await Bluebird.map(productVoList, async (productVo) => {
            delete productVo.productGroupId;

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
        const ucId: string = this.ctx.state.userId || '';
        const name: string = this.post('name');
        const packageName: string = this.post('packageName');
        const platform: string = this.post('platform');
        const pid: string = this.post('pid');
        const productGroupId: string = this.post('id');
        const active: number = this.post('active');
        const test: number = this.post('test');
        const productModel = this.taleModel('product', 'advertisement') as ProductModel;
        const productAuthModel = this.taleModel('productAuth', 'advertisement') as ProductAuthModel;

        const productVo: ProductVO = {
            productGroupId,
            name, packageName, platform, pid,
            test, active
        };
        const productId = await productModel.addProduct(productVo);

        // 创建者自动拥有管理员权限
        const productAuthVo: ProductAuthVO = {
            productId, userId: ucId, active, master: 1,
            editAd: 1, viewAd: 1, editGameConfig: 1, viewGameConfig: 1,
            editPurchase: 1, viewPurchase: 1, editProduct: 1,
        };
        await productAuthModel.addProductAuth(productAuthVo);

        this.success('created');
    }
}