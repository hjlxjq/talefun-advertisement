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
     * @returns {Promise<string>} 主键;
     */
    public async addVo(configGroupVo: ConfigGroupVO) {
        await this.add(configGroupVo);
        return this.ID[0];

    }

    /**
     * 更新常量组
     * @argument {string} id 常量组表主键;
     * @argument {ConfigGroupVO} configGroupVo 常量组表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateVo(id: string, configGroupVo: ConfigGroupVO) {
        if (!Utils.isEmptyObj(configGroupVo)) {
            return await this.where({ id }).update(configGroupVo);

        }
        return 0;

    }

    /**
     * 按常量组 id 获取常量组
     * @argument {string} id 常量组 id;
     * @argument {string} creatorId 创建者 id
     * @returns {Promise<ConfigGroupVO>} 常量组数据;
     */
    public async getVo(id: string, creatorId?: string) {
        const queryStrings: string[] = [];
        queryStrings.push(`id='${id}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).find() as ConfigGroupVO;

    }

    /**
     * 线上正式数据,
     * <br/>获取常量组信息列表
     * @argument {number} active 是否生效;
     */
    public async getList(active: number) {
        const queryStrings: string[] = [];
        queryStrings.push('1=1');

        if (!_.isUndefined(active)) {
            queryStrings.push(`active=${active}`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).select() as ConfigGroupVO[];

    }

    /**
     * 根据应用主键 获取常量组列表
     * </br> 按常量组名称从小到大排序
     * @argument {string} productId 应用表主键;
     * @argument {number} type 0 广告 1 游戏常量
     * @argument {string} creatorId 创建者 id
     * @argument {number} active 是否生效;
     * @returns {Promise<ConfigGroupVO[]>} 常量组列表;
     */
    public async getListByProductAndType(
        productId: string, type: number, creatorId?: string, active?: number
        ) {
        const queryStrings: string[] = [];

        queryStrings.push(`productId='${productId}'`);
        queryStrings.push(`type='${type}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        if (!_.isUndefined(active)) {
            queryStrings.push(`active=${active}`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).select() as ConfigGroupVO[];

    }

}