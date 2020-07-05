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
     * @returns {Promise<string>} 主键;
     */
    public async addVo(productAuthVo: ProductAuthVO) {
        await this.add(productAuthVo);
        return this.ID[0];

    }

    /**
     * 根据应用表主键 和 用户表主键 更新应用权限表
     * @argument {string} productId 应用表主键 ;
     * @argument {string} userId 用户表主键;
     * @argument {ProductAuthVO} productAuthUpdateVo 应用权限对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateVo(
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
     * 根据应用表主键 和 用户表主键 删除应用权限
     * @argument {string} productId 应用表主键 ;
     * @argument {string} userId 用户表主键;
     * @returns {Promise<number>} 删除行数;
     */
    public async delProductAuth(productId: string, userId: string) {
        return await this.where({ productId, userId }).delete();

    }

    /**
     * 根据应用表主键 获取应用权限表列表
     * @argument {string} productId 应用表主键;
     * @returns {Promise<ProductAuthVO[]>} 应用权限表列表;
     */
    public async getList(productId: string) {
        return await this.where({ productId }).select() as ProductAuthVO[];

    }

    /**
     * 根据用户表主键 获取应用表主键 列表;
     * @argument {string} userId 用户表主键;
     * @returns {Promise<string[]>} 应用表主键 列表
     */
    public async getIdListByUser(userId: string) {
        const productAuthVoList = await this.where({ userId }).select() as ProductAuthVO[];

        return _.map(productAuthVoList, (productAuthVo) => {
            return productAuthVo.productId;
        });

    }

    /**
     * 根据用户表主键和应用表主键获取应用权限对象
     * @argument {string} userId 用户表主键;
     * @argument {string} productId 应用表主键;
     * @returns {Promise<ProductAuthVO[]>} 应用权限对象;
     */
    public async getVo(userId: string, productId: string) {
        const productAuthVo = await this.where({ userId, productId }).find() as ProductAuthVO;

        // 删除不必要的字段
        delete productAuthVo.id;
        delete productAuthVo.userId;
        delete productAuthVo.productId;
        delete productAuthVo.createAt;
        delete productAuthVo.updateAt;

        return productAuthVo;

    }

}