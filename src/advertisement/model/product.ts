/**
 * advertisement productModel
 * @module advertisement/model/product
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import MBModel from './managerBaseModel';
import * as _ from 'lodash';
import { ProductVO } from '../defines';
import Utils from '../utils';

/**
 * 广告与常量配置相关模型
 * @class productModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class ProductModel extends MBModel {

    /**
     * 插入应用
     * @argument {ProductVO} productVo 应用表对象;
     * @returns {Promise<string>} 主键 id;
     */
    public async addProduct(productVo: ProductVO) {

        await this.add(productVo);
        return this.ID[0];
    }

    /**
     * 更新应用
     * @argument {string} id 应用表id;
     * @argument {ProductVO} productUpdateVo 应用表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateProduct(id: string, productUpdateVo: ProductVO) {
        if (!_.isEmpty(productUpdateVo)) {
            return await this.where({ id }).update(productUpdateVo);
        }
        return 0;
    }

    /**
     * 根据项目组表主键 id 获取应用数量
     * @argument {string} productGroupId 应用表 id;
     * @argument {number} active 是否生效;
     * @returns {Promise<number>} 应用数量;
     */
    // public async getNum(productGroupId: string, active?: number) {
    //     if (!_.isUndefined(active)) {
    //         return await this.where({ productGroupId, active }).count('id');

    //     }
    //     return await this.where({ productGroupId }).count('id');
    // }

    /**
     * 获取全部应用列表
     * @returns {Promise<ProductVO[]>} 应用列表;
     */
    public async getList() {
        return await this.order('name').select() as ProductVO[];
    }

    /**
     * 根据项目组 id 获取全部应用列表
     * @argument {string} productGroupId 应用表 id;
     * @returns {Promise<ProductVO[]>} 应用列表;
     */
    public async getListByProductGroup(productGroupId: string) {
        return await this.where({ productGroupId }).order('name').select() as ProductVO[];
    }

    /**
     * 获取应用列表,
     * <br/>多条件查询，查询用户拥有的所有权限的应用
     * @argument {string[]} idList 应用表主键列表;
     * @argument {string[]} productGroupId 项目组表主键列表;
     * @returns {Promise<ProductVO[]>} 应用列表;
     */
    public async getListByAuth(idList: string[], ProductGroupIdList: string[]) {

        idList.push('');    // 为空数组报错
        ProductGroupIdList.push('');    // 为空数组报错

        return await this.where({
            id: ['IN', idList],
            productGroupId: ['IN', ProductGroupIdList],
            _logic: 'OR'
        })
            .order('name').select() as ProductVO[];
    }

    /**
     * 根据主键 id 获取应用表信息
     * @argument {string} id 应用表 id;
     * @returns {Promise<ProductVO>} 应用表信息;
     */
    public async getProduct(id: string) {
        return await this.where({ id }).find() as ProductVO;
    }

}