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
     * <br/>插入 ab 测试分组与广告组关系表对象
     * @argument {AbTestMapVO[]} abTestMapVo ab 测试分组与广告组关系表对象;
     * @returns {Promise<string>} 主键 id;
     */
    public async addVo(abTestMapVo: AbTestMapVO) {
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
        let idList: string[] = [];

        if (!think.isEmpty(abTestMapVoList)) {

            await this.addMany(abTestMapVoList);
            idList = this.ID;
        }
        return idList;
    }

    /**
     * 更新 ab 测试分组与广告组关系表
     * @argument {string} abTestGroupId 分组表 id;
     * @argument {string} place 广告位;
     * @argument {AbTestMapVO} abTestMapVo ab 测试分组与广告组关系表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateVo(
        abTestGroupId: string, place: string, abTestMapVo: AbTestMapVO
    ) {
        if (!Utils.isEmptyObj(abTestMapVo)) {
            return await this.thenUpdate(abTestMapVo, { place, abTestGroupId });
        }

        return 0;
    }

    /**
     * 删除 ab 分组与广告组关系
     * @argument {string} abTestGroupId 分组表 id;
     * @argument {string} place 广告位;
     * @returns {Promise<number>} 删除行数;
     */
    public async delVo(abTestGroupId: string, place: string) {
        return await this.where({ abTestGroupId, place }).delete();
    }

    /**
     * 根据主键 id 获取 ab 测试分组与广告组关系信息
     * @argument {string} abTestGroupId 分组表 id;
     * @argument {string} place 广告位;
     * @argument {string} creatorId 创建者 id
     * @returns {Promise<AbTestMapVO>} ab 测试分组与广告组关系信息;
     */
    public async getVo(abTestGroupId: string, place: string, creatorId: string = '') {
        const query = `abTestGroupId = '${abTestGroupId}' AND place = '${place}' AND (creatorId IS NULL OR creatorId = '${creatorId}')`;

        return await this.where(query).find() as AbTestMapVO;
    }

    /**
     * 根据 ab 测试分组表主键 id 获取 ab 测试分组与广告组关系表列表
     * @argument {string} abTestGroupId ab 测试分组表 id;
     * @argument {string} creatorId 创建者 id
     * @returns {Promise<AbTestMapVO[]>} ab 测试分组与广告组关系表列表;
     */
    public async getList(abTestGroupId: string, creatorId: string = '') {
        const query = `abTestGroupId = '${abTestGroupId}' AND (creatorId IS NULL OR creatorId = '${creatorId}')`;

        return await this.where(query).select() as AbTestMapVO[];
    }

    /**
     * 根据广告组表主键 id 获取 ab 测试分组主键 id 列表
     * @argument {string} adGroupId 广告组表 id;
     * @argument {string} creatorId 创建者 id
     * @returns {Promise<AbTestMapVO>} ab 测试分组主键 id 列表
     */
    public async getAbTestGroupIdByAdGroup(adGroupId: string, creatorId: string = '') {
        const query = `adGroupId = '${adGroupId}' AND (creatorId IS NULL OR creatorId = '${creatorId}')`;

        const abTestMapVoList = await this.where(query).select() as AbTestMapVO[];

        return _.map(abTestMapVoList, (abTestMapVo) => {
            return abTestMapVo.abTestGroupId;
        });
    }
}