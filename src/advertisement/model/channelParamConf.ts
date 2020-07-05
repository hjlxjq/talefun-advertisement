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
     * 创建或更新应用广告平台参数,
     * <br/>不存在则创建，否者更新
     * @argument {string} adChannelId 广告平台参数表主键;
     * @argument {string} productId 应用表主键;
     * @argument {ChannelParamConfVO} channelParamConfVo 应用广告平台参数表对象;
     */
    public async thenUpdateVo(
        adChannelId: string,
        productId: string,
        channelParamConfVo: ChannelParamConfVO
    ) {
        if (!Utils.isEmptyObj(channelParamConfVo)) {
            return await this.thenUpdate(channelParamConfVo, { adChannelId, productId });

        }

    }

    /**
     * 根据广告平台表主键 获取应用广告平台参数信息
     * @argument {string} id 应用广告平台参数表主键;
     * @argument {string} adChannelId 广告平台表主键;
     * @argument {string} productId 应用表主键;
     * @returns {Promise<ChannelParamConfVO>} 应用广告平台参数信息;
     */
    public async getVo(adChannelId: string, productId: string) {
        return await this.where({ adChannelId, productId }).find() as ChannelParamConfVO;

    }

    /**
     * @argument {string} productId 应用表主键;
     * 获取应用广告平台参数信息列表
     */
    public async getList(productId: string) {
        return await this.where({ productId }).select() as ChannelParamConfVO[];

    }

    /**
     * 删除应用广告平台参数信息
     * @argument {string} adChannelId 广告平台参数表主键;
     * @argument {string} productId 应用表主键;
     * @returns {Promise<number>} 删除行数;
     */
    public async delVo(adChannelId: string, productId: string) {
        return await this.where({ adChannelId, productId }).delete();

    }

}