/**
 * advertisement adGroupModel
 * @module advertisement/model/adGroup
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';

import MBModel from './managerBaseModel';
import { AdGroupVO } from '../defines';
import Utils from '../utils';

/**
 * 广告组配置相关模型
 * @class adGroupModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class AdGroupModel extends MBModel {
    /**
     * 插入广告组
     * @argument {AdGroupVO} adGroupVo 广告组表对象;
     * @returns {Promise<string>} 主键;
     */
    public async addVo(adGroupVo: AdGroupVO) {
        await this.add(adGroupVo);
        return this.ID[0];

    }

    /**
     * 更新广告组
     * @argument {string} id 广告组表主键;
     * @argument {AdGroupVO} adGroupVo 广告组表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateVo(id: string, adGroupVo: AdGroupVO) {
        if (!Utils.isEmptyObj(adGroupVo)) {
            return await this.where({ id }).update(adGroupVo);

        }
        return 0;

    }

    /**
     * 根据主键 获取广告组信息
     * @argument {string} id 广告组表主键;
     * @argument {string} creatorId 创建者主键
     * @returns {Promise<AdGroupVO>} 广告组信息;
     */
    public async getVo(id: string, creatorId: string) {
        const queryStrings: string[] = [];

        queryStrings.push(`id='${id}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).find() as AdGroupVO;
    }

    /**
     * 线上正式数据,
     * <br/>获取广告组信息列表
     * @argument {number} active 是否生效;
     */
    public async getList(active: number) {
        const queryStrings: string[] = [];
        queryStrings.push('1=1');

        if (!_.isUndefined(active)) {
            queryStrings.push(`active=${active}`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).select() as AdGroupVO[];

    }

    /**
     * 根据应用主键 获取广告组信息列表
     * @argument {string} productId 应用表主键;
     * @argument {string} creatorId 创建者主键
     * @argument {number} active 是否生效;
     */
    public async getListByProduct(productId: string, creatorId?: string, active?: number) {
        const queryStrings: string[] = [];

        queryStrings.push(`productId='${productId}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        if (!_.isUndefined(active)) {
            queryStrings.push(`active=${active}`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).select() as AdGroupVO[];

    }

}