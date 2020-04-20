/**
 * advertisement configGroupModel
 * @module advertisement/model/configGroup
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';

import MBModel from './managerBaseModel';
import { ConfigGroupVO } from '../defines';
import Utils from '../utils';

/**
 * 常量组配置相关模型
 * @class configGroupModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class ConfigGroupModel extends MBModel {

    /**
     * 插入常量组
     * @argument {ConfigGroupVO} configGroupVo 常量组表对象;
     * @returns {Promise<string>} 主键 id;
     */
    public async addConfigGroup(configGroupVo: ConfigGroupVO) {

        await this.add(configGroupVo);
        return this.ID[0];
    }

    /**
     * 更新常量组
     * @argument {string} id 常量组表 id;
     * @argument {ConfigGroupVO} configGroupVo 常量组表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateConfigGroup(id: string, configGroupVo: ConfigGroupVO) {
        if (!Utils.isEmptyObj(configGroupVo)) {
            return await this.where({ id }).update(configGroupVo);
        }
        return 0;
    }

    /**
     * 按常量组 id 获取常量组
     * @argument {string} id 常量组 id;
     * @returns {Promise<ConfigGroupVO>} 常量组数据;
     */
    public async getConfigGroup(id: string) {
        return await this.where({ id }).find() as ConfigGroupVO;
    }

    /**
     * 获取常量组列表
     * </br> 按常量组名称从小到大排序
     * @returns {Promise<AdTypeVO[]>} 常量组列表;
     */
    public async getList() {
        return await this.order('name').select() as ConfigGroupVO[];
    }

    /**
     * 根据应用主键 id 获取常量组列表
     * </br> 按常量组名称从小到大排序
     * @argument {string} productId 应用表 id;
     * @argument {number} type 0 广告 1 游戏常量
     * @returns {Promise<AdTypeVO[]>} 常量组列表;
     */
    public async getListByProductAndType(productId: string, type: number) {
        return await this.where({ productId, type }).order('name').select() as ConfigGroupVO[];
    }

}