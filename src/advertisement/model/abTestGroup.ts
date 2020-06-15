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

        if (!Utils.isEmptyObj(abTestGroupVoList)) {

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
        think.logger.debug(`abTestGroupVo1: ${JSON.stringify(abTestGroupVo)}`);
        if (!Utils.isEmptyObj(abTestGroupVo)) {
            think.logger.debug(`abTestGroupVo2: ${JSON.stringify(abTestGroupVo)}`);
            return await this.where({ id }).update(abTestGroupVo);
        }

        return 0;

    }

    /**
     * 删除 ab 测试分组
     * @argument {string} versionGroupId  版本分组条件表 id;
     * @returns {Promise<number>} 删除行数;
     */
    public async delByVersionGroup(versionGroupId: string) {
        return await this.where({ versionGroupId }).delete();

    }

    /**
     * 删除  ab 测试分组列表
     * @argument {string[]} idList ab 测试分组主键列表;
     * @returns {Promise<number>} 删除行数;
     */
    public async delList(idList: string[]) {
        idList.push('');    // 为空数组报错

        return await this.where({ id: ['IN', idList] }).delete();

    }

    /**
     * 根据测试名获取 ab 测试分组列表
     * <br/>
     * @argument {string} versionGroupId  版本分组条件表 id;
     * @argument {string} name ab 测试分组名;
     * @argument {string} creatorId 创建者 id
     * @argument {number} active 是否生效
     * @argument {number} live 是否线上已发布数据
     * @returns {Promise<string[]>} 返回 ab 测试分组列表
     */
    public async getListByName(
        versionGroupId: string,
        name: string,
        creatorId: string,
        active: number,
        live: number
    ) {
        const queryStrings: string[] = [];
        queryStrings.push(`name LIKE '${name}_%'`);
        queryStrings.push(`versionGroupId = '${versionGroupId}'`);

        if (!_.isUndefined(active)) {
            queryStrings.push(`active=${active}`);

        }
        if (!_.isUndefined(live)) {
            const LiveActiveTime = think.config('LiveActiveTime');
            queryStrings.push(`activeTime = '${LiveActiveTime}'`);

        }
        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }

        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).select() as AbTestGroupVO[];

    }

    /**
     * 根据主键 id 获取 ab 测试分组信息
     * @argument {string} id ab 测试分组表 id;
     * @argument {string} creatorId 创建者 id
     * @returns {Promise<AbTestGroupVO>} ab 测试分组信息;
     */
    public async getVo(id: string, creatorId: string) {
        const queryStrings: string[] = [];
        queryStrings.push(`id = '${id}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).find() as AbTestGroupVO;

    }

    /**
     * 根据版本分组条件表主键获取 ab 测试分组表主键列表
     * @argument {string} versionGroupId 版本分组条件表主键;
     * @returns {Promise<string[]>}  ab 测试分组表主键列表;
     */
    public async getIdListByVersionGroup(versionGroupId: string) {
        const abTestGroupVoList = await this.where({ versionGroupId }).select() as AbTestGroupVO[];

        return _.map(abTestGroupVoList, (abTestGroupVo) => {
            return abTestGroupVo.id;
        });

    }

    /**
     * 获取 ab 测试分组信息列表,
     * @argument {string} versionGroupId 分组条件表主键;
     * @argument {string} creatorId 创建者 id
     * @argument {number} active 是否生效
     */
    public async getList(versionGroupId: string, creatorId: string, active: number) {
        const queryStrings: string[] = [];
        queryStrings.push(`versionGroupId='${versionGroupId}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        if (!_.isUndefined(active)) {
            queryStrings.push(`active='${active}'`);

        }

        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).order('begin').select() as AbTestGroupVO[];

    }

    /**
     * 获取默认 ab 测试分组信息列表
     *  @argument {string} versionGroupId 分组条件表主键;
     */
    public async getDefault(versionGroupId: string) {
        return await this.where({ name: 'default',  versionGroupId}).find() as AbTestGroupVO;

    }

    /**
     * 获取版本条件分组表主键 id 列表，
     * @argument {string} nativeTmplConfGroupId native 模板组表 id;
     * @argument {string} creatorId 创建者 id
     * @returns {Promise<string[]>} 版本条件分组表主键 id 列表;
     */
    public async getVerionGroupIdListByNative(nativeTmplConfGroupId: string, creatorId: string) {
        const queryStrings: string[] = [];
        queryStrings.push(`nativeTmplConfGroupId = '${nativeTmplConfGroupId}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        const queryString: string = queryStrings.join(' AND ');

        const abTestGroupVoList = await this.where(queryString).select() as AbTestGroupVO[];

        const verionGroupIdList = _.map(abTestGroupVoList, (abTestGroupVo) => {
            return abTestGroupVo.versionGroupId;
        });

        return verionGroupIdList;

    }

    /**
     * 获取版本条件分组表主键 id 列表，
     * @argument {string} configGroupId 常量组表 id;
     * @argument {string} creatorId 创建者 id
     * @returns {Promise<string[]>} 版本条件分组表主键 id 列表;
     */
    public async getVerionGroupIdListByConfig(configGroupId: string, creatorId: string) {
        const queryStrings: string[] = [];
        queryStrings.push(`configGroupId = '${configGroupId}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        const queryString: string = queryStrings.join(' AND ');

        const abTestGroupVoList = await this.where(queryString).select() as AbTestGroupVO[];

        const verionGroupIdList = _.map(abTestGroupVoList, (abTestGroupVo) => {
            return abTestGroupVo.versionGroupId;
        });

        return verionGroupIdList;

    }

}