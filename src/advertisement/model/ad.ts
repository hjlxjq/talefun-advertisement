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
     * 广告组插入广告
     * @argument {AdVO} adVo 广告表对象;
     * @returns {Promise<string>} 主键;
     */
    public async addVo(adVo: AdVO) {
        await this.add(adVo);
        return this.ID[0];

    }

    /**
     * 批量插入广告表对象列表
     * @argument {AdVO[]} adVolist 广告表对象列表;
     * @returns {Promise<string[]>} 主键列表;
     */
    public async addList(adVolist: AdVO[]) {
        let idList: string[] = [];

        if (!_.isEmpty(adVolist)) {
            await this.addMany(adVolist);
            idList = this.ID;

        }
        return idList;

    }

    /**
     * 更新广告组下广告
     * @argument {string} id 广告表主键;
     * @argument {AdVO} adVo 广告表对象;
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
     * @argument {string} id 广告表主键;
     * @returns {Promise<number>} 删除行数;
     */
    public async delVo(id: string) {
        return await this.where({ id }).delete();

    }

    /**
     * 批量删除广告组下所有广告
     * @argument {string} adGroupId 广告组表主键;
     * @returns {Promise<number>} 删除行数;
     */
    public async delList(adGroupId: string) {
        return await this.where({ adGroupId }).delete();

    }

    /**
     * 根据广告表主键获取广告信息，
     * <br/>ecpm 返回正常数字
     * @argument {string} id 广告表主键;
     * @argument {string} creatorId 创建者主键
     * @returns {Promise<AdVO>} 广告信息;
     */
    public async getVo(id: string, creatorId: string) {
        const queryStrings: string[] = [];

        queryStrings.push(`id='${id}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        const queryString: string = queryStrings.join(' AND ');

        const adVo = await this.where(queryString).find() as AdVO;

        // ecpm 返回正常数字，去掉小数后面的零，整数去掉小数点
        if (adVo.ecpm) {
            adVo.ecpm = Number(adVo.ecpm);

        }
        return adVo;

    }

    /**
     * 线上正式数据,
     * <br/>获取广告信息列表
     * @argument {number} live 是否线上已发布数据
     */
    public async getList(live: number) {
        const queryStrings: string[] = [];
        queryStrings.push('1=1');

        if (live === 1) {
            const LiveActiveTime = think.config('LiveActiveTime');
            queryStrings.push(`activeTime = '${LiveActiveTime}'`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).select() as AdVO[];

    }

    /**
     * 根据广告组表主键获取广告信息，
     * <br/>ecpm 返回正常数字
     * @argument {string} adGroupId 广告组表主键;
     * @argument {string} creatorId 创建者主键
     */
    public async getListByAdGroup(adGroupId: string, creatorId: string) {
        const queryStrings: string[] = [];

        queryStrings.push(`adGroupId='${adGroupId}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        const queryString: string = queryStrings.join(' AND ');

        const adVoList = await this.where(queryString).select() as AdVO[];

        return _.map(adVoList, (adVo) => {
            // ecpm 返回正常数字，去掉小数后面的零，整数去掉小数点
            if (adVo.ecpm) {
                adVo.ecpm = Number(adVo.ecpm);

            }
            return adVo;
        });

    }

    /**
     * 根据应用表主键获取广告信息，
     * <br/>ecpm 返回正常数字
     * @argument {string} productId 应用表主键;
     * @argument {string} creatorId 创建者主键
     * @argument {number} live 是否线上已发布数据
     */
    public async getListByProduct(productId: string, creatorId?: string, live?: number) {
        const queryStrings: string[] = [];

        queryStrings.push(`productId='${productId}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        if (live === 1) {
            const LiveActiveTime = think.config('LiveActiveTime');
            queryStrings.push(`activeTime = '${LiveActiveTime}'`);

        }
        const queryString: string = queryStrings.join(' AND ');

        const adVoList = await this.where(queryString).select() as AdVO[];

        return _.map(adVoList, (adVo) => {
            // ecpm 返回正常数字，去掉小数后面的零，整数去掉小数点
            if (adVo.ecpm) {
                adVo.ecpm = Number(adVo.ecpm);

            }
            return adVo;
        });

    }

    /**
     * 根据广告组表主键和广告 placementID 获取广告信息列表，
     * <br/>ecpm 返回正常数字
     * @argument {string} adGroupId 广告组表主键;
     * @argument {string} placementID 广告 placementID
     * @argument {number} live 是否线上已发布数据
     */
    public async getByPlacementID(adGroupId: string, placementID: string, live: number) {
        const queryStrings: string[] = [];

        queryStrings.push(`adGroupId = '${adGroupId}'`);
        queryStrings.push(`placementID = '${placementID}'`);

        if (live === 1) {
            const LiveActiveTime = think.config('LiveActiveTime');
            queryStrings.push(`activeTime = '${LiveActiveTime}'`);

        }
        const queryString: string = queryStrings.join(' AND ');

        const adVo = await this.where(queryString).find() as AdVO;

        // ecpm 返回正常数字，去掉小数后面的零，整数去掉小数点
        if (adVo.ecpm) {
            adVo.ecpm = Number(adVo.ecpm);

        }
        return adVo;

    }

    /**
     * 根据广告组表主键, 广告渠道 和 广告名称获取广告信息列表
     * <br/>ecpm 返回正常数字
     * @argument {string} adGroupId 广告组表主键;
     * @argument {string} adChannelId 广告平台表主键;
     * @argument {string} name 广告名称
     * @argument {number} live 是否线上已发布数据
     */
    public async getByName(
        adGroupId: string, adChannelId: string, name: string, live: number
    ) {
        const queryStrings: string[] = [];

        queryStrings.push(`adGroupId = '${adGroupId}'`);
        queryStrings.push(`adChannelId = '${adChannelId}'`);
        queryStrings.push(`name = '${name}'`);

        if (live === 1) {
            const LiveActiveTime = think.config('LiveActiveTime');
            queryStrings.push(`activeTime = '${LiveActiveTime}'`);

        }
        const queryString: string = queryStrings.join(' AND ');
        const adVo = await this.where(queryString).find() as AdVO;

        // ecpm 返回正常数字，去掉小数后面的零，整数去掉小数点
        if (adVo.ecpm) {
            adVo.ecpm = Number(adVo.ecpm);

        }
        return adVo;

    }

}