/**
 * advertisement productGroupModel
 * @module advertisement/model/productGroup
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';

import MBModel from './managerBaseModel';
import { ProductGroupVO } from '../defines';
import Utils from '../utils';
/**
 * 项目组表配置相关模型
 * @class productGroupModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class ProductGroupModel extends MBModel {

    /**
     * 插入项目组
     * @argument {ProductGroupVO} productGroupVo 项目组表对象;
     * @returns {Promise<string>} 主键 id;
     */
    public async addProductGroup(productGroupVo: ProductGroupVO) {

        await this.add(productGroupVo);
        return this.ID[0];
    }

    /**
     * 更新项目组
     * @argument {string} id 项目组表 id;
     * @argument {ProductGroupVO} productGroupUpdateVo 项目组表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateProductGroup(id: string, productGroupUpdateVo: ProductGroupVO) {
        if (!Utils.isEmptyObj(productGroupUpdateVo)) {
            return await this.where({ id }).update(productGroupUpdateVo);
        }
        return 0;
    }

    /**
     * 获取全部项目组列表
     * @returns {Promise<ProductGroupVO[]>} 项目组列表;
     */
    public async getList() {
        return await this.order('name').select() as ProductGroupVO[];
    }

    /**
     * 根据用户权限获取项目组列表,
     * @argument {string[]} idList 项目组表主键列表;
     * @returns {Promise<ProductGroupVO[]>} 项目组列表;
     */
    public async getListByAuth(idList: string[]) {
        idList.push('');    // 为空数组报错

        return await this.where({ id: ['IN', idList] }).order('name').select() as ProductGroupVO[];
    }

    /**
     * 根据主键 id 获取项目组信息
     * @argument {string} id 项目组表 id;
     * @returns {Promise<ProductGroupVO>} 项目组信息;
     */
    public async getProductGroup(id: string) {
        return await this.where({ id }).find() as ProductGroupVO;
    }

}