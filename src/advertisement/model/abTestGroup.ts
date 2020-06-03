/**
 * advertisement abTestGroupModel
 * @module advertisement/model/abTestGroup
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';
import * as moment from 'moment-mini-ts';

import MBModel from './managerBaseModel';
import { AbTestGroupVO } from '../defines';
import Utils from '../utils';

/**
 * ab 测试分组配置相关模型
 * @class abTestGroupModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class AbTestGroupModel extends MBModel {

    /**
     * 插入 ab 测试分组
     * @argument {AbTestGroupVO} abTestGroupVo ab 测试分组表对象;
     * @returns {Promise<string>} 主键 id;
     */
    public async addVo(abTestGroupVo: AbTestGroupVO) {

        await this.add(abTestGroupVo);
        return this.ID[0];
    }

    /**
     * 批量，
     * <br/>插入 ab 测试分组列表
     * @argument {AbTestGroupVO[]} abTestGroupVoList ab 测试分组表对象列表;
     * @returns {Promise<string[]>} 主键 id 列表;
     */
    public async addList(abTestGroupVoList: AbTestGroupVO[]) {
        let idList: string[] = [];

        if (!think.isEmpty(abTestGroupVoList)) {

            await this.addMany(abTestGroupVoList);
            think.logger.debug(`插入ab 测试分组列表返回主键 id 列表： ${JSON.stringify(this.ID)}`);
            idList = this.ID;
        }
        return idList;
    }

    /**
     * 更新 ab 测试分组
     * @argument {string} id ab 测试分组表 id;
     * @argument {AbTestGroupVO} abTestGroupVo ab 测试分组表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateVo(id: string, abTestGroupVo: AbTestGroupVO) {
        if (!Utils.isEmptyObj(abTestGroupVo)) {
            return await this.where({ id }).update(abTestGroupVo);
        }
        return 0;
    }

    /**
     * 根据测试名获取 ab 测试分组主键列表
     * <br/>
     * @argument {string} versionGroupId 分组条件表 id;
     * @argument {string} name ab 测试分组表 id;
     * @argument {string} creatorId 创建者 id
     * @returns {Promise<string[]>} 返回 ab 测试分组主键列表
     */
    public async getIdListByName(versionGroupId: string, name: string, creatorId: string) {
        const query = `versionGroupId = '${versionGroupId}' AND name LIKE '${name}_%' AND (creatorId IS NULL OR creatorId = '${creatorId}')`;

        think.logger.debug(`getIdListByName query: ${query}`);
        const abTestGroupVoList = await this.where(query).select() as AbTestGroupVO[];
        return _.map(abTestGroupVoList, (abTestGroupVo) => {
            return abTestGroupVo.id;
        });
    }

    /**
     * 根据主键 id 获取 ab 测试分组信息
     * @argument {string} id ab 测试分组表 id;
     * @argument {string} creatorId 创建者 id
     * @returns {Promise<AbTestGroupVO>} ab 测试分组信息;
     */
    public async getVo(id: string, creatorId: string) {
        const query = `id = '${id}' AND
        (creatorId IS NULL OR creatorId = '${creatorId}')`;

        return await this.where(query).find() as AbTestGroupVO;
    }

    /**
     * 获取 ab 测试分组信息列表,
     * @argument {string} versionGroupId 分组条件表 id;
     * @argument {string} creatorId 创建者 id
     */
    public async getList(versionGroupId: string, creatorId?: string) {
        const queryStrings: string[] = [];
        queryStrings.push(`versionGroupId='${versionGroupId}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);
        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).order('begin').select() as AbTestGroupVO[];
    }

    /**
     * 获取默认 ab 测试分组信息列表
     * @argument {string} versionGroupId 分组条件表 id;
     * @argument {string} creatorId 创建者 id
     */
    public async getDefault(versionGroupId: string, creatorId: string) {
        const query = `versionGroupId = '${versionGroupId}' AND name = 'default' AND
        (creatorId IS NULL OR creatorId = '${creatorId}')`;

        return await this.where(query).find() as AbTestGroupVO;
    }

    /**
     * 获取版本分组表主键 id 列表，
     * @argument {string} nativeTmplConfGroupId native 模板组表 id;
     * @argument {string} creatorId 创建者 id
     * @returns {Promise<string[]>} 获取版本分组表主键 id 列表;
     */
    public async getVerionGroupIdListByNative(nativeTmplConfGroupId: string, creatorId: string) {
        const query = `nativeTmplConfGroupId = '${nativeTmplConfGroupId}' AND (creatorId IS NULL OR creatorId = '${creatorId}')`;
        const abTestGroupVoList = await this.where(query).select() as AbTestGroupVO[];

        const verionGroupIdList = _.map(abTestGroupVoList, (abTestGroupVo) => {
            return abTestGroupVo.versionGroupId;
        });
        return verionGroupIdList;
    }

    /**
     * 获取版本分组表主键 id 列表，
     * @argument {string} configGroupId 常量组表 id;
     * @argument {string} creatorId 创建者 id
     * @returns {Promise<string[]>} 获取版本分组表主键 id 列表;
     */
    public async getVerionGroupIdListByConfig(configGroupId: string, creatorId: string) {
        const query = `configGroupId = '${configGroupId}' AND (creatorId IS NULL OR creatorId = '${creatorId}')`;
        const abTestGroupVoList = await this.where(query).select() as AbTestGroupVO[];

        const verionGroupIdList = _.map(abTestGroupVoList, (abTestGroupVo) => {
            return abTestGroupVo.versionGroupId;
        });
        return verionGroupIdList;
    }
}