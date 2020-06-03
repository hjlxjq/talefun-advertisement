/**
 * advertisement versionGroupModel
 * @module advertisement/model/versionGroup
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';

import MBModel from './managerBaseModel';
import { VersionGroupVO } from '../defines';
import Utils from '../utils';

/**
 * 版本分组控制配置相关模型
 * @class versionGroupModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class VersionGroupModel extends MBModel {

    /**
     * 插入版本分组控制
     * @argument {VersionGroupVO} versionGroupVo 版本分组控制表对象;
     * @returns {Promise<string>} 主键 id;
     */
    public async addVersionGroup(versionGroupVo: VersionGroupVO) {

        await this.add(versionGroupVo);
        return this.ID[0];
    }

    /**
     * 更新版本分组控制
     * @argument {string} id 版本分组控制表 id;
     * @argument {VersionGroupVO} versionGroupVo 版本分组控制表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateVersionGroup(id: string, versionGroupVo: VersionGroupVO) {
        if (!Utils.isEmptyObj(versionGroupVo)) {
            return await this.where({ id }).update(versionGroupVo);

        }
        return 0;
    }

    /**
     * 根据主键 id 获取版本分组控制信息
     * @argument {string} id 版本分组控制表 id;
     * @argument {string} creatorId 创建者 id
     * @returns {Promise<VersionGroupVO>} 版本分组控制信息;
     */
    public async getVersionGroup(id: string, creatorId: string = '') {
        const query = `id = '${id}' AND (creatorId IS NULL OR creatorId = '${creatorId}')`;

        return await this.where(query).find() as VersionGroupVO;
    }

    /**获取版本分组控制信息列表
     * @argument {string} productId 应用表 id;
     * @argument {string} type 版本分组控制表类型;
     * @argument {string} creatorId 创建者 id
     */
    public async getList(productId: string, type: number, creatorId: string = '') {

        const query = `productId = '${productId}' AND type = '${type}' AND
        (creatorId IS NULL OR creatorId = '${creatorId}')`;

        return await this.where(query).select() as VersionGroupVO[];
    }

    /**
     * 获取版本分组控制名列表,
     * @argument {string[]} idList 版本分组控制表 id 列表;
     * @argument {string} creatorId 创建者 id
     * @argument {number} active 是否生效;
     * @returns {Promise<string[]>} 版本分组控制名列表;
     */
    public async getVersionGroupNameList(idList: string[] = [], creatorId: string = '', active?: number) {
        // 为空数组
        if (_.isEmpty(idList)) {
            return [];
        }

        const queryStrings: string[] = [];
        // 条件单字段查询
        queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        // in 查询逻辑
        const idListString = _.map(idList, (id) => {
            return `'id'`;
        });
        queryStrings.push(`id IN (${idListString})`);

        if (!_.isUndefined(active)) {
            queryStrings.push(`active=${active}`);
        }

        const queryString: string = queryStrings.join(' AND ');
        const versionGroupVoList = await this.where(queryString).select() as VersionGroupVO[];

        const versionGroupNameList = _.map(versionGroupVoList, (versionGroupVo) => {
            return versionGroupVo.name;
        });
        return versionGroupNameList;
    }

}