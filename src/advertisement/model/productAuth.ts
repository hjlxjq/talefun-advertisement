/**
 * advertisement productAuthModel
 * @module advertisement/model/productAuth
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';

import MBModel from './managerBaseModel';
import { ProductAuthVO } from '../defines';
import Utils from '../utils';
/**
 * 应用权限表配置相关模型
 * @class productAuthModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class ProductAuthModel extends MBModel {

    /**
     * 插入应用权限表
     * @argument {ProductAuthVO} productAuthVo 应用权限对象;
     * @returns {Promise<string>} 主键 id;
     */
    public async addProductAuth(productAuthVo: ProductAuthVO) {

        await this.add(productAuthVo);
        return this.ID[0];
    }

    /**
     * 根据应用表主键 id 和 用户表主键 id 更新应用权限表
     * @argument {string} productId 应用表主键 id ;
     * @argument {string} userId 用户表主键 id;
     * @argument {ProductAuthVO} productAuthUpdateVo 应用权限对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateProductAuth(
        productId: string,
        userId: string,
        productAuthUpdateVo: ProductAuthVO
    ) {
        if (!Utils.isEmptyObj(productAuthUpdateVo)) {
            return await this.where({ productId, userId }).update(productAuthUpdateVo);
        }
        return 0;
    }

    /**
     * 根据应用表主键 id 和 用户表主键 id 删除应用权限
     * @argument {string} productId 应用表主键 id ;
     * @argument {string} userId 用户表主键 id;
     * @returns {Promise<number>} 删除行数;
     */
    public async delProductAuth(productId: string, userId: string) {
        return await this.where({ productId, userId }).delete();
    }

    /**
     * 根据应用表主键 id 获取应用权限表列表
     * @argument {string} productId 应用表 id;
     * @returns {Promise<ProductAuthVO[]>} 应用权限表列表;
     */
    public async getList(productId: string) {
        return await this.where({ productId }).select() as ProductAuthVO[];
    }

    /**
     * 根据用户表主键 id 获取应用表主键 id 列表;
     * @argument {string} userId 用户表 id;
     * @returns {Promise<string[]>} 应用表主键 id 列表
     */
    public async getIdListByUser(userId: string) {
        const productAuthVoList = await this.where({ userId }).select() as ProductAuthVO[];

        return _.map(productAuthVoList, (productAuthVo) => {
            return productAuthVo.productId;
        });
    }

    /**
     * 根据用户表主键和应用表主键获取应用权限对象
     * @argument {string} userId 用户表 id;
     * @argument {string} productId 应用表 id;
     * @returns {Promise<ProductAuthVO[]>} 应用权限对象;
     */
    public async getProductAuth(userId: string, productId: string) {
        const productAuthVo = await this.where({ userId, productId }).find() as ProductAuthVO;

        return _.omit(
            productAuthVo,
            ['id', 'createAt', 'updateAt', 'userId', 'productId', 'active']
        );
    }

}