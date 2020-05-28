/**
 * advertisement adModel
 * @module advertisement/model/ad
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';

import MBModel from './managerBaseModel';
import { AdVO } from '../defines';
import Utils from '../utils';

/**
 * 广告组下广告配置相关模型
 * @class adModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class AdModel extends MBModel {

    /**
     * 插入广告组下广告
     * @argument {AdVO} adVo 广告组下广告表对象;
     * @returns {Promise<string>} 主键 id;
     */
    public async addVo(adVo: AdVO) {

        await this.add(adVo);
        return this.ID[0];
    }

    /**
     * 批量插入广告表对象列表
     * @argument {AdVO[]} adVolist 广告表对象列表;
     * @returns {Promise<string[]>} 主键 id 列表;
     */
    public async addList(adVolist: AdVO[]) {
        let idList: string[] = [];

        if (!think.isEmpty(adVolist)) {

            await this.addMany(adVolist);
            idList = this.ID;
        }
        return idList;
    }

    /**
     * 更新广告组下广告
     * @argument {string} id 广告组下广告表 id;
     * @argument {AdVO} adVo 广告组下广告表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateVo(id: string, adVo: AdVO) {
        if (!Utils.isEmptyObj(adVo)) {
            return await this.where({ id }).update(adVo);
        }
        return 0;
    }

    /**
     * 删除广告组下广告
     * @argument {string} id 广告表 id;
     * @returns {Promise<number>} 删除行数;
     */
    public async delVo(id: string) {
        return await this.where({ id }).delete();
    }

    /**
     * 根据主键 id 获取广告信息
     * @argument {string} id 广告表 id;
     * @returns {Promise<AdVO>} 广告信息;
     */
    public async getVo(id: string) {
        return await this.where({ id }).find() as AdVO;
    }

    /**
     * 根据广告组表主键 id 获取广告信息
     * @argument {string} adGroupId 广告组表 id;
     * @argument {string} creatorId 创建者 id
     * @argument {number} active 是否生效;
     * 获取广告组下广告信息列表
     */
    public async getListByAdGroup(adGroupId: string, creatorId: string, active?: number) {
        const queryStrings: string[] = [];
        queryStrings.push(`adGroupId='${adGroupId}'`);
        queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        if (!_.isUndefined(active)) {
            queryStrings.push(`active=${active}`);
        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).order('name ASC').select() as AdVO[];
    }

    /**
     * 根据应用表主键 id 获取广告信息
     * @argument {string} productId 应用表 id;
     * @argument {string} creatorId 创建者 id
     * 获取应用下广告信息列表
     */
    public async getListByProduct(productId: string, creatorId: string) {
        const queryStrings: string[] = [];
        queryStrings.push(`productId='${productId}'`);
        queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).select() as AdVO[];
    }

    /**
     * 根据广告组表主键 id 获取广告数量
     * @argument {string} adGroupId 广告组表 id;
     * @argument {number} active 是否生效;
     * @returns {Promise<number>} 广告数量;
     */
    // public async getNum(adGroupId: string, active?: number) {
    //     if (!_.isUndefined(active)) {
    //         return await this.where({ adGroupId, active }).count('id');

    //     }
    //     return await this.where({ adGroupId }).count('id');
    // }
}