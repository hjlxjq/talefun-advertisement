/**
 * advertisement abTestMapModel
 * @module advertisement/model/abTestMap
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';

import MBModel from './managerBaseModel';
import { AbTestMapVO } from '../defines';
import Utils from '../utils';

/**
 * 广告位表配置相关模型
 * @class abTestMapModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class AbTestMapModel extends MBModel {
    /**
     * <br/>插入广告位表对象
     * @argument {AbTestMapVO[]} abTestMapVo 广告位表对象;
     * @returns {Promise<string>} 主键;
     */
    public async addVo(abTestMapVo: AbTestMapVO) {
        await this.add(abTestMapVo);
        return this.ID[0];

    }

    /**
     * 批量，
     * <br/>插入广告位表对象
     * @argument {AbTestMapVO[]} abTestMapVoList 广告位表对象列表;
     * @returns {Promise<string[]>} 主键列表;
     */
    public async addList(abTestMapVoList: AbTestMapVO[]) {
        let idList: string[] = [];

        if (!_.isEmpty(abTestMapVoList)) {
            await this.addMany(abTestMapVoList);
            idList = this.ID;

        }
        return idList;

    }

    /**
     * 更新广告位表
     * @argument {string} id 广告位表主键;
     * @argument {AbTestMapVO} abTestMapVo 广告位表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateVo(id: string, abTestMapVo: AbTestMapVO) {
        if (!Utils.isEmptyObj(abTestMapVo)) {
            return await this.where({ id }).update(abTestMapVo);

        }
        return 0;

    }

    /**
     * 删除广告位表对象
     * @argument {string} id 广告位表主键;
     * @returns {Promise<number>} 删除行数;
     */
    public async delVo(id: string) {
        return await this.where({ id }).delete();

    }

    /**
     * 根据 ab 测试分组主键列表删除广告位表对象列表
     * @argument {string[]} abTestGroupIdList ab 测试分组条件表主键列表;
     * @returns {Promise<number>} 删除行数;
     */
    public async delList(abTestGroupIdList: string[]) {
        abTestGroupIdList.push('');    // 为空数组报错

        return await this.where({ abTestGroupId: ['IN', abTestGroupIdList] }).delete();

    }

    /**
     * 根据 ab 测试分组条件表主键获取广告位信息,
     * <br/> 广告位表不需要判断是否开启
     * @argument {string} abTestGroupId ab 测试分组表主键;
     * @argument {string} place 广告位;
     * @argument {string} creatorId 创建者主键
     * @returns {Promise<AbTestMapVO>} 广告位信息;
     */
    public async getVo(abTestGroupId: string, place: string, creatorId: string) {
        const queryStrings: string[] = [];

        queryStrings.push(`abTestGroupId = '${abTestGroupId}'`);
        queryStrings.push(`place = '${place}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).find() as AbTestMapVO;

    }

    /**
     * 线上正式数据,
     * <br/>获取广告位表信息列表
     * @argument {number} active 是否生效;
     */
    public async getList(active: number) {
        const queryStrings: string[] = [];
        queryStrings.push('1=1');

        if (!_.isUndefined(active)) {
            queryStrings.push(`active=${active}`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).select() as AbTestMapVO[];

    }

    /**
     * 根据 ab 测试分组表主键获取广告位表列表
     * @argument {string} abTestGroupId ab 测试分组表主键;
     * @argument {string} creatorId 创建者主键
     * @argument {number} active 是否生效;
     * @returns {Promise<AbTestMapVO[]>} 广告位表列表;
     */
    public async getListByAbTestGroup(abTestGroupId: string, creatorId?: string, active?: number) {
        const queryStrings: string[] = [];

        queryStrings.push(`abTestGroupId = '${abTestGroupId}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        if (!_.isUndefined(active)) {
            queryStrings.push(`active=${active}`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).select() as AbTestMapVO[];

    }

    /**
     * 根据广告组表主键获取 ab 测试分组主键列表
     * @argument {string} adGroupId 广告组表主键;
     * @argument {string} creatorId 创建者主键
     * @returns {Promise<AbTestMapVO>} ab 测试分组主键列表
     */
    public async getAbTestGroupIdByAdGroup(adGroupId: string, creatorId: string) {
        const queryStrings: string[] = [];

        queryStrings.push(`adGroupId = '${adGroupId}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);
        }

        const queryString: string = queryStrings.join(' AND ');
        const abTestMapVoList = await this.where(queryString).select() as AbTestMapVO[];

        return _.map(abTestMapVoList, (abTestMapVo) => {
            return abTestMapVo.abTestGroupId;

        });

    }

}