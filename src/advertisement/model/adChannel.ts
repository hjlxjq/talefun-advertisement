/**
 * advertisement adChannelModel
 * @module advertisement/model/adChannel
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';

import MBModel from './managerBaseModel';
import { AdChannelVO } from '../defines';
import Utils from '../utils';

/**
 * 广告平台配置相关模型
 * @class adChannelModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class AdChannelModel extends MBModel {

    /**
     * 插入广告平台
     * @argument {AdChannelVO} adChannelVo 广告平台表对象;
     * @returns {Promise<string>} 主键 id;
     */
    public async addVo(adChannelVo: AdChannelVO) {

        await this.add(adChannelVo);
        return this.ID[0];
    }

    /**
     * 更新广告平台
     * @argument {string} id 广告平台表 id;
     * @argument {AdChannelVO} adChannelVo 广告平台表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateVo(id: string, adChannelVo: AdChannelVO) {
        if (!Utils.isEmptyObj(adChannelVo)) {
            return await this.where({ id }).update(adChannelVo);

        }
        return 0;
    }

    /**
     * 根据主键 id 获取广告平台信息
     * @argument {string} id 广告平台表 id;
     * @argument {number} active 是否生效;
     * @argument {number} test 是否测试 app 可见;
     * @returns {Promise<AdChannelVO>} 广告平台信息;
     */
    public async getVo(id: string, active?: number, test?: number) {
        const queryStrings: string[] = [];
        queryStrings.push(`id='${id}'`);

        if (test === 0) {
            queryStrings.push(`test=${test}`);
        }

        if (!_.isUndefined(active)) {
            queryStrings.push(`active=${active}`);
        }

        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).find() as AdChannelVO;
    }

    /**
     * 根据广告平台获取广告平台信息
     * @argument {string} channel 广告平台;
     * @returns {Promise<AdChannelVO>} 广告平台信息;
     */
    public async getByChannel(channel: string) {
        return await this.where({ channel }).find() as AdChannelVO;
    }

    /**
     * 获取广告平台信息列表,
     * </br>按广告平台从小到大排序
     * @argument {number} active 是否生效;
     * @argument {number} test 是否测试 app 可见;
     * @argument {string[]} idList 查询的主键列表;
     */
    public async getList(active?: number, test?: number, idList?: string[]) {
        const queryStrings: string[] = [];
        queryStrings.push('1=1');

        if (test === 0) {
            queryStrings.push(`test=${test}`);
        }

        if (!_.isUndefined(active)) {
            queryStrings.push(`active=${active}`);
        }

        if (!think.isEmpty(idList)) {
            idList.push('');    // 为空数组报错
            const idStr = (_.map(idList, (id) => {
                return `'${id}'`;
            })).join();

            queryStrings.push(`id in (${idStr})`);
        }

        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).select() as AdChannelVO[];
    }

}