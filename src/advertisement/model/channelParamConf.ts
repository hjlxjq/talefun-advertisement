/**
 * advertisement ChannelParamConfModel
 * @module advertisement/model/channelParamConf
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';

import MBModel from './managerBaseModel';
import { ChannelParamConfVO } from '../defines';
import Utils from '../utils';

/**
 * 应用广告平台参数配置相关模型
 * @class ChannelParamConfModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class ChannelParamConfModel extends MBModel {

    /**
     * 更新应用广告平台参数
     * @argument {string} adChannelId 广告平台参数表 id;
     * @argument {string} productId 应用表 id;
     * @argument {ChannelParamConfVO} channelParamConfVo 应用广告平台参数表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateVo(
        adChannelId: string,
        productId: string,
        channelParamConfVo: ChannelParamConfVO
    ) {
        if (!_.isEmpty(channelParamConfVo)) {
            return await this.thenUpdate(channelParamConfVo, { adChannelId, productId });
        }
        return 0;
    }

    /**
     * 根据广告平台表主键 id 获取应用广告平台参数信息
     * @argument {string} id 应用广告平台参数表 id;
     * @argument {string} adChannelId 广告平台表 id;
     * @argument {string} productId 应用表 id;
     * @returns {Promise<ChannelParamConfVO>} 应用广告平台参数信息;
     */
    public async getVo(adChannelId: string, productId: string) {
        return await this.where({ adChannelId, productId }).find() as ChannelParamConfVO;
    }

    /**
     * @argument {string} productId 应用表 id;
     * 获取应用广告平台参数信息列表
     */
    public async getList(productId: string) {
        return await this.where({ productId }).select() as ChannelParamConfVO[];
    }

    /**
     * 删除应用广告平台参数信息
     * @argument {string} adChannelId 广告平台参数表 id;
     * @argument {string} productId 应用表 id;
     * @returns {Promise<number>} 删除行数;
     */
    public async delVo(adChannelId: string, productId: string) {
        return await this.where({ adChannelId, productId }).delete();
    }
}