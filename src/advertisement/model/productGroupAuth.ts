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
     * @returns {Promise<string>} 主键 id;
     */
    public async addProductGroupAuth(productGroupAuthVo: ProductGroupAuthVO) {

        await this.add(productGroupAuthVo);
        return this.ID[0];
    }

    /**
     * 根据项目组表主键 id 和 用户表主键 id 更新应用权限表
     * @argument {string} productGroupId 项目组表主键 id ;
     * @argument {string} userId 用户表主键 id;
     * @argument {ProductGroupAuthVO} productGroupAuthUpdateVo 项目组权限对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateProductGroupAuth(
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
     * 根据项目组表主键 id 和 用户表主键 id 删除应用权限
     * @argument {string} productGroupId 项目组表主键 id ;
     * @argument {string} userId 用户表主键 id;
     * @returns {Promise<number>} 删除行数;
     */
    public async delProductGroupAuth(productGroupId: string, userId: string) {
        return await this.where({ productGroupId, userId }).delete();
    }

    /**
     * 根据项目组表主键 id 获取项目组权限表列表
     * @argument {string} productGroupId 项目组表 id;
     * @returns {Promise<ProductGroupAuthVO[]>} 项目组权限表列表;
     */
    public async getList(productGroupId: string) {
        return await this.where({ productGroupId }).select() as ProductGroupAuthVO[];
    }

    /**
     * 根据用户表主键 id 获取项目表主键 id 列表;
     * @argument {string} userId 用户表 id;
     * @returns {Promise<string[]>} 项目表主键 id 列表;
     */
    public async getIdListByUser(userId: string) {
        const productGroupAuthVoList = await this.where({ userId }).select() as ProductGroupAuthVO[];

        return _.map(productGroupAuthVoList, (productGroupAuthVo) => {
            return productGroupAuthVo.productGroupId;
        });
    }

    /**
     * 根据项目组表主键 id 获取项目组权限表数量
     * @argument {string} productGroupId 应用表 id;
     * @argument {number} active 是否生效;
     * @returns {Promise<number>} 项目组权限表数量;
     */
    // public async getNum(productGroupId: string, active?: number) {
    //     if (!_.isUndefined(active)) {
    //         return await this.where({ productGroupId, active }).count('id');

    //     }
    //     return await this.where({ productGroupId }).count('id');
    // }

    /**
     * 根据用户表主键和项目组表主键获取项目组和应用权限对象
     * @argument {string} userId 用户表 id;
     * @argument {string} productGroupId 项目组表 id;
     * @returns {Promise<{ productAuth: ProductAuthVO;productGroupAuth: ProductGroupAuthVO; }>} 项目组和应用权限对象;
     */
    public async getProductGroupAuth(userId: string, productGroupId: string) {
        const productGroupAuthVo = await this.where({ userId, productGroupId }).find() as ProductGroupAuthVO;

        const {
            editAd, viewAd, editGameConfig, viewGameConfig,
            editPurchase, viewPurchase, createProduct, editProduct, master
        } = productGroupAuthVo;

        const productAuth: ProductAuthVO = {
            editAd, viewAd, editGameConfig, viewGameConfig, editPurchase, viewPurchase, editProduct,
            master: 0
        };

        if (master === 1) {
            productAuth.master = 1;
        }

        for (const key of Object.keys(productAuth)) {
            const auth = productAuth[key];

            if (auth === 0) {
                delete productAuth[key];
            }
        }

        const productGroupAuth: ProductGroupAuthVO = {
            createProduct, master,
            editAd: undefined, viewAd: undefined, editGameConfig: undefined,
            viewGameConfig: undefined, editPurchase: undefined, viewPurchase: undefined, editProduct: undefined,
        };

        return {
            productAuth,
            productGroupAuth
        };
    }
}