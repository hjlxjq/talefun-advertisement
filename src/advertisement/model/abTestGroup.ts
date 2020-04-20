/**
 * advertisement abTestGroupModel
 * @module advertisement/model/abTestGroup
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';

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
    public async addAbTestGroup(abTestGroupVo: AbTestGroupVO) {

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

        await this.addMany(abTestGroupVoList);
        think.logger.debug(`插入ab 测试分组列表返回主键 id 列表： ${JSON.stringify(this.ID)}`);
        return this.ID;
    }

    /**
     * 更新 ab 测试分组
     * @argument {string} id ab 测试分组表 id;
     * @argument {AbTestGroupVO} abTestGroupVo ab 测试分组表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateAbTestGroup(id: string, abTestGroupVo: AbTestGroupVO) {
        if (!Utils.isEmptyObj(abTestGroupVo)) {
            return await this.where({ id }).update(abTestGroupVo);
        }
        return 0;
    }

    /**
     * 根据主键 id 获取 ab 测试分组信息
     * @argument {string} id ab 测试分组表 id;
     * @returns {Promise<AbTestGroupVO>} ab 测试分组信息;
     */
    public async getAbTestGroup(id: string) {
        return await this.where({ id }).find() as AbTestGroupVO;
    }

    /**
     * 获取 ab 测试分组信息列表,
     * @argument {string} versionGroupId 分组条件表 id;
     */
    public async getList(versionGroupId: string) {
        return await this.where({ versionGroupId }).order('begin').select() as AbTestGroupVO[];
    }

    /**
     * 获取默认 ab 测试分组信息列表
     * @argument {string} versionGroupId 分组条件表 id;
     */
    public async getDefault(versionGroupId: string) {
        return await this.where({ versionGroupId, name: 'default' }).find() as AbTestGroupVO;
    }

    /**
     * 获取版本分组表主键 id 列表，
     * @argument {string} nativeTmplGroupId native 模板组表 id;
     * @returns {Promise<string[]>} 获取版本分组表主键 id 列表;
     */
    public async getVerionGroupIdListByNative(nativeTmplGroupId: string) {
        const abTestGroupVoList = await this.where({ nativeTmplGroupId }).select() as AbTestGroupVO[];

        const verionGroupIdList = _.map(abTestGroupVoList, (abTestGroupVo) => {
            return abTestGroupVo.versionGroupId;
        });
        return verionGroupIdList;
    }

    /**
     * 获取版本分组表主键 id 列表，
     * @argument {string} configGroupId 常量组表 id;
     * @returns {Promise<string[]>} 获取版本分组表主键 id 列表;
     */
    public async getVerionGroupIdListByConfig(configGroupId: string) {
        const abTestGroupVoList = await this.where({ configGroupId }).select() as AbTestGroupVO[];

        const verionGroupIdList = _.map(abTestGroupVoList, (abTestGroupVo) => {
            return abTestGroupVo.versionGroupId;
        });
        return verionGroupIdList;
    }
}