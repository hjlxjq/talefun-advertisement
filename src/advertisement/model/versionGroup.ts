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
 * 版本条件分组配置相关模型
 * @class versionGroupModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class VersionGroupModel extends MBModel {
    /**
     * 插入版本条件分组
     * @argument {VersionGroupVO} versionGroupVo 版本条件分组表对象;
     * @returns {Promise<string>} 主键;
     */
    public async addVo(versionGroupVo: VersionGroupVO) {
        await this.add(versionGroupVo);
        return this.ID[0];

    }

    /**
     * 更新版本条件分组
     * @argument {string} id 版本条件分组表主键;
     * @argument {VersionGroupVO} versionGroupVo 版本条件分组表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateVo(id: string, versionGroupVo: VersionGroupVO) {
        if (!Utils.isEmptyObj(versionGroupVo)) {
            return await this.where({ id }).update(versionGroupVo);

        }
        return 0;

    }

    /**
     * 删除版本条件分组
     * @argument {string} id 版本条件分组表主键;
     * @returns {Promise<number>} 删除行数;
     */
    public async delVo(id: string) {
        return await this.where({ id }).delete();

    }

    /**
     * 根据主键获取版本条件分组信息
     * @argument {string} id 版本条件分组表主键;
     * @argument {string} creatorId 创建者主键
     * @returns {Promise<VersionGroupVO>} 版本条件分组信息;
     */
    public async getVo(id: string, creatorId: string) {
        const queryStrings: string[] = [];

        queryStrings.push(`id = '${id}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).find() as VersionGroupVO;

    }

    /**
     * 根据 版本条件分组名称 获取版本条件分组
     * @argument {string} name 版本条件分组名;
     * @argument {number} type 版本条件分组表类型;
     * @argument {string} productId 应用表主键;
     * @argument {string} creatorId 创建者主键
     * @argument {number} live 是否线上已发布数据
     * @returns {Promise<VersionGroupVO>} 版本条件分组;
     */
    public async getByName(
        name: string,
        type: number,
        productId: string,
        creatorId?: string,
        live?: number
    ) {
        const queryStrings: string[] = [];

        queryStrings.push(`type = ${type}`);
        queryStrings.push(`name = '${name}'`);
        queryStrings.push(`productId = '${productId}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        if (live === 1) {
            const LiveActiveTime = think.config('LiveActiveTime');
            queryStrings.push(`activeTime = '${LiveActiveTime}'`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).find() as VersionGroupVO;

    }

    /**
     * 根据 版本条件分组的开始版本 获取版本条件分组列表
     * @argument {number} begin 版本条件分组的开始版本;
     * @argument {number} type 版本条件分组表类型;
     * @argument {string} productId 应用表主键;
     * @argument {number} active 是否生效;
     * @returns {Promise<string[]>} 版本条件分组列表;
     */
    public async getByBegin(
        begin: number,
        type: number,
        productId: string,
        active: number,
    ) {
        const queryStrings: string[] = [];

        queryStrings.push(`type = ${type}`);
        queryStrings.push(`begin = ${begin}`);
        queryStrings.push(`productId = '${productId}'`);

        if (!_.isUndefined(active)) {
            queryStrings.push(`active = ${active}`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).select() as VersionGroupVO[];

    }

    /**
     * 获取默认版本条件分组
     * @argument {number} type 版本条件分组表类型;
     * @argument {string} productId 应用表主键;
     * @argument {string} creatorId 创建者主键
     * @returns {Promise<VersionGroupVO>} 版本条件分组;
     */
    public async getDefaultVo(
        type: number,
        productId: string,
        creatorId?: string,
    ) {
        const queryStrings: string[] = [];

        queryStrings.push(`type = ${type}`);
        queryStrings.push(`productId = '${productId}'`);
        queryStrings.push(`begin = 0`);
        queryStrings.push(`code = '[]'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        const queryString: string = queryStrings.join(' AND ');
        think.logger.debug(queryString);

        return await this.where(queryString).find() as VersionGroupVO;

    }

    /**
     * 线上正式数据,
     * <br/>获取版本条件分组信息列表
     * @argument {number} type 版本条件分组表类型;
     * @argument {number} live 是否线上已发布数据
     */
    public async getList(type: number, live: number) {
        const queryStrings: string[] = [];

        queryStrings.push(`type = ${type}`);

        if (live === 1) {
            const LiveActiveTime = think.config('LiveActiveTime');
            queryStrings.push(`activeTime = '${LiveActiveTime}'`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).select() as VersionGroupVO[];

    }

    /**
     * 获取版本条件分组信息列表
     * @argument {string} productId 应用表主键;
     * @argument {number} type 版本条件分组表类型;
     * @argument {string} creatorId 创建者主键
     */
    public async getListByProduct(
        productId: string, type: number, creatorId?: string, live?: number
    ) {
        const queryStrings: string[] = [];

        queryStrings.push(`type = ${type}`);
        queryStrings.push(`productId = '${productId}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        if (live === 1) {
            const LiveActiveTime = think.config('LiveActiveTime');
            queryStrings.push(`activeTime = '${LiveActiveTime}'`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).select() as VersionGroupVO[];

    }

    /**
     * 获取版本条件分组名列表,
     * @argument {string[]} idList 版本条件分组表主键列表;
     * @argument {string} creatorId 创建者主键;
     * @argument {number} active 是否生效;
     * @returns {Promise<string[]>} 版本条件分组名列表;
     */
    public async getVersionGroupNameList(idList: string[] = [], creatorId: string, active: number) {
        // 为空数组直接返回空
        if (_.isEmpty(idList)) {
            return [];

        }

        const queryStrings: string[] = [];

        // 条件单字段查询
        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        // in 查询逻辑
        const idListString = _.map(idList, (id) => {
            return `'${id}'`;

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