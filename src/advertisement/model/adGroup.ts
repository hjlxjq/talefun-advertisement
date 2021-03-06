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
     * @returns {Promise<string>} 主键 id;
     */
    public async addAdGroup(adGroupVo: AdGroupVO) {

        await this.add(adGroupVo);
        return this.ID[0];
    }

    /**
     * 更新广告组
     * @argument {string} id 广告组表 id;
     * @argument {AdGroupVO} adGroupVo 广告组表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateAdGroup(id: string, adGroupVo: AdGroupVO) {
        if (!Utils.isEmptyObj(adGroupVo)) {
            return await this.where({ id }).update(adGroupVo);
        }
        return 0;
    }

    /**
     * 根据主键 id 获取广告组信息
     * @argument {string} id 广告组表 id;
     * @argument {number} active 是否生效;
     * @returns {Promise<AdGroupVO>} 广告组信息;
     */
    public async getAdGroup(id: string, active?: number) {
        if (!_.isUndefined(active)) {

            return await this.where({ id, active }).find() as AdGroupVO;
        }
        return await this.where({ id }).find() as AdGroupVO;
    }

    /**
     * 根据应用主键 id 获取广告组信息列表
     * @argument {string} productId 应用表 id;
     */
    public async getList(productId: string) {
        return await this.where({ productId }).order('name').select() as AdGroupVO[];
    }

}