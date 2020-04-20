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
 * ab 测试分组与广告组关系配置相关模型
 * @class abTestMapModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class AbTestMapModel extends MBModel {

    /**
     * 插入 ab 测试分组与广告组关系表对象
     * @argument {AbTestMapVO} abTestMapVo ab 测试分组与广告组关系表对象;
     * @returns {Promise<string>} 主键 id;
     */
    public async addAbTestMap(abTestMapVo: AbTestMapVO) {

        await this.add(abTestMapVo);
        return this.ID[0];
    }

    /**
     * 批量，
     * <br/>插入 ab 测试分组与广告组关系表对象
     * @argument {AbTestMapVO[]} abTestMapVoList ab 测试分组与广告组关系表对象列表;
     * @returns {Promise<string[]>} 主键列表;
     */
    public async addList(abTestMapVoList: AbTestMapVO[]) {
        if (!think.isEmpty(abTestMapVoList)) {

            await this.addMany(abTestMapVoList);
            return this.ID;
        }
        return [];
    }

    /**
     * 更新 ab 测试分组与广告组关系表
     * @argument {string} abTestGroupId 分组表 id;
     * @argument {string} place 广告位;
     * @argument {string} adGroupId 广告组表主键 id;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateAbTestMap(abTestGroupId: string, place: string, adGroupId: string) {
        if (adGroupId) {
            return await this.where({ abTestGroupId, place }).update({ adGroupId });
        }
        return 0;
    }

    /**
     * 删除 ab 分组与广告组关系
     * @argument {string} abTestGroupId 分组表 id;
     * @argument {string} place 广告位;
     * @returns {Promise<number>} 删除行数;
     */
    public async delAbTestMap(abTestGroupId: string, place: string) {
        return await this.where({ abTestGroupId, place }).delete();
    }

    /**
     * 根据主键 id 获取 ab 测试分组与广告组关系信息
     * @argument {string} abTestGroupId 分组表 id;
     * @argument {string} place 广告位;
     * @returns {Promise<AbTestMapVO>} ab 测试分组与广告组关系信息;
     */
    public async getAbTestMap(abTestGroupId: string, place: string) {
        return await this.where({ abTestGroupId, place }).find() as AbTestMapVO;
    }

    /**
     * 根据 ab 测试分组表主键 id 获取 ab 测试分组与广告组关系表列表
     * @argument {string} abTestGroupId ab 测试分组表 id;
     * @returns {Promise<AbTestMapVO[]>} ab 测试分组与广告组关系表列表;
     */
    public async getList(abTestGroupId: string) {
        return await this.where({ abTestGroupId }).select() as AbTestMapVO[];
    }

    /**
     * 根据广告组表主键 id 获取 ab 测试分组主键 id 列表
     * @argument {string} adGroupId 广告组表 id;
     * @returns {Promise<AbTestMapVO>} ab 测试分组主键 id 列表
     */
    public async getAbTestGroupIdByAdGrroup(adGroupId: string) {
        const abTestMapVoList = await this.where({ adGroupId }).select() as AbTestMapVO[];

        return _.map(abTestMapVoList, (abTestMapVo) => {
            return abTestMapVo.abTestGroupId;
        });
    }
}