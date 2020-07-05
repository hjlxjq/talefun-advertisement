/**
 * advertisement productGroupAuthModel
 * @module advertisement/model/productGroupAuth
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';

import MBModel from './managerBaseModel';
import { ProductGroupAuthVO, ProductAuthVO } from '../defines';
import Utils from '../utils';
/**
 * 项目组权限表配置相关模型
 * @class productGroupAuthModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class ProductGroupAuthModel extends MBModel {
    /**
     * 插入项目组权限表
     * @argument {ProductGroupAuthVO} productGroupAuthVo 项目组权限对象;
     * @returns {Promise<string>} 主键;
     */
    public async addVo(productGroupAuthVo: ProductGroupAuthVO) {

        await this.add(productGroupAuthVo);
        return this.ID[0];
    }

    /**
     * 根据项目组表主键 和 用户表主键 更新应用权限表
     * @argument {string} productGroupId 项目组表主键 ;
     * @argument {string} userId 用户表主键;
     * @argument {ProductGroupAuthVO} productGroupAuthUpdateVo 项目组权限对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateVo(
        productGroupId: string,
        userId: string,
        productGroupAuthUpdateVo: ProductGroupAuthVO
    ) {
        if (!Utils.isEmptyObj(productGroupAuthUpdateVo)) {
            return await this.where({ productGroupId, userId }).update(productGroupAuthUpdateVo);

        }
        return 0;

    }

    /**
     * 根据项目组表主键 和 用户表主键 删除应用权限
     * @argument {string} productGroupId 项目组表主键 ;
     * @argument {string} userId 用户表主键;
     * @returns {Promise<number>} 删除行数;
     */
    public async delVo(productGroupId: string, userId: string) {
        return await this.where({ productGroupId, userId }).delete();

    }

    /**
     * 根据项目组表主键 获取项目组权限表列表
     * @argument {string} productGroupId 项目组表主键;
     * @returns {Promise<ProductGroupAuthVO[]>} 项目组权限表列表;
     */
    public async getList(productGroupId: string) {
        return await this.where({ productGroupId }).select() as ProductGroupAuthVO[];

    }

    /**
     * 根据用户表主键 获取项目表主键 列表;
     * @argument {string} userId 用户表主键;
     * @returns {Promise<string[]>} 项目表主键 列表;
     */
    public async getIdListByUser(userId: string) {
        const productGroupAuthVoList = await this.where({ userId }).select() as ProductGroupAuthVO[];

        return _.map(productGroupAuthVoList, (productGroupAuthVo) => {
            return productGroupAuthVo.productGroupId;
        });

    }

    /**
     * 根据用户表主键和项目组表主键 获取 项目组和应用权限对象
     * @argument {string} userId 用户表主键;
     * @argument {string} productGroupId 项目组表主键;
     * @returns {Promise<{ productAuth: ProductAuthVO;productGroupAuth: ProductGroupAuthVO; }>} 项目组和应用权限对象;
     */
    public async getVo(userId: string, productGroupId: string) {
        const allProductGroupAuthVo = await this.where({ userId, productGroupId }).find() as ProductGroupAuthVO;

        const {
            editAd, viewAd, editGameConfig, viewGameConfig,
            editPurchase, viewPurchase, createProduct, editProduct, master
        } = allProductGroupAuthVo;

        // 项目组下所有应用都包含的权限，项目组下是管理员，则再应用下也是管理员
        const productAuthVo: ProductAuthVO = {
            editAd, viewAd, editGameConfig, viewGameConfig, editPurchase, viewPurchase, editProduct, master,
            userId: undefined, productId: undefined
        };

        // 项目组下排除 项目组下所有应用都包含的权限
        const productGroupAuthVo: ProductGroupAuthVO = {
            createProduct, master, userId: undefined, productGroupId: undefined,
            editAd: undefined, viewAd: undefined, editGameConfig: undefined,
            viewGameConfig: undefined, editPurchase: undefined, viewPurchase: undefined, editProduct: undefined,
        };

        return {
            productAuthVo,
            productGroupAuthVo
        };

    }

}