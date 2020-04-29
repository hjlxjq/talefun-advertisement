/**
 * advertisement adChannelMapModel
 * @module advertisement/model/adChannelMap
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';

import MBModel from './managerBaseModel';
import { AdChannelMapVO } from '../defines';
import Utils from '../utils';

/**
 * 广告平台与广告类型关系表配置相关模型
 * @class adChannelMapModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class AdChannelMapModel extends MBModel {

    /**
     * 获取某个广告平台下所有的广告类型主键 id 列表
     * @argument {string} adChannelId 广告平台表 id;
     * @returns {Promise<string[]>} 主键 id 列表;
     */
    public async getAdTypeIdList(adChannelId: string) {
        const adChannelMapVOList: AdChannelMapVO[] = await this.where({ adChannelId }).select();

        return _.map(adChannelMapVOList, (adChannelMapVO) => {
            return adChannelMapVO.adTypeId;
        });
    }

    /**
     * 获取某个广告类型下所有的广告平台主键 id 列表
     * @argument {string} adTypeId 广告类型表 id;
     * @returns {Promise<string[]>} 主键 id 列表;
     */
    public async getAdChannelIdList(adTypeId: string) {
        const adChannelMapVOList: AdChannelMapVO[] = await this.where({ adTypeId }).select();

        return _.map(adChannelMapVOList, (adChannelMapVO) => {
            return adChannelMapVO.adChannelId;
        });
    }

    /**
     * 批量更新,
     * <br/>更新某个广告平台下所有的广告类型
     * @argument {string} adChannelId 广告平台表主键 id;
     * @argument {string[]} adTypeIdList 广告类型表主键 id 列表;
     * @returns {Promise<string[]>} 广告平台表主键 id 列表;
     */
    public async updateList(
        adChannelId: string,
        adTypeIdList: string[]
    ) {
        let idList: string[] = [];

        if (!think.isEmpty(adTypeIdList)) {
            await this.where({ adChannelId }).delete();

            const AdChannelMapVoList: AdChannelMapVO[] = _.map(adTypeIdList, (adTypeId) => {

                const AdChannelMapVo: AdChannelMapVO = {
                    adChannelId, adTypeId
                };
                return AdChannelMapVo;
            });

            await this.addMany(AdChannelMapVoList);

            idList = this.ID;
        }
        return idList;
    }
}