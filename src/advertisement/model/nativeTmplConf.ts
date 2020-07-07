/**
 * advertisement nativeTmplConfModel
 * @module advertisement/model/nativeTmplConf
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';

import MBModel from './managerBaseModel';
import { NativeTmplConfVO } from '../defines';
import Utils from '../utils';

/**
 * 应用下的 native 模板配置相关模型
 * @class nativeTmplConfModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class NativeTmplConfModel extends MBModel {
    /**
     * 插入应用下的 native 模板
     * @argument {NativeTmplConfVO} nativeTmplConfVo 应用下的 native 模板表对象;
     * @returns {Promise<string>} 主键;
     */
    public async addVo(nativeTmplConfVo: NativeTmplConfVO) {
        await this.add(nativeTmplConfVo);
        return this.ID[0];

    }

    /**
     * 批量插入应用下的 native 模板
     * @argument {NativeTmplConfVO[]} configVoList 应用下的 native 模板对象列表;
     * @returns {Promise<string[]>} 主键列表;
     */
    public async addList(nativeTmplConfVoList: NativeTmplConfVO[]) {
        let idList: string[] = [];

        if (!_.isEmpty(nativeTmplConfVoList)) {
            await this.addMany(nativeTmplConfVoList);
            idList = this.ID;

        }
        return idList;

    }

    /**
     * 更新应用下的 native 模板
     * @argument {string} id 应用下的 native 模板表主键;
     * @argument {NativeTmplConfVO} nativeTmplConfVo 应用下的 native 模板表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateVo(id: string, nativeTmplConfVo: NativeTmplConfVO) {
        if (!Utils.isEmptyObj(nativeTmplConfVo)) {
            return await this.where({ id }).update(nativeTmplConfVo);

        }
        return 0;

    }

    /**
     * 根据主键获取应用下的 native 模板信息
     * @argument {string} id 应用下的 native 模板表主键;
     * @argument {string} creatorId 创建者主键
     * @returns {Promise<nativeTmplConfVO>} 应用下的 native 模板信息;
     */
    public async getVo(id: string, creatorId: string) {
        const queryStrings: string[] = [];

        queryStrings.push(`id='${id}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).find() as NativeTmplConfVO;
    }

    /**
     * 删除应用 native 模板
     * @argument {string} id 应用 native 模板表主键;
     * @returns {Promise<number>} 删除行数;
     */
    public async delVo(id: string) {
        return await this.where({ id }).delete();

    }

    /**
     * <br/>根据应用 native 模板组表主键和 native 模板表主键获取应用 native 模板信息
     * @argument {string} nativeTmplId native 模板表主键;
     * @argument {string} nativeTmplConfGroupId 应用下的 native 模板组表主键;
     * @argument {string} creatorId 创建者主键
     * @argument {number} live 是否线上已发布数据
     * @returns {Promise<ConfigVO>} 应用 native 模板表信息;
     */
    public async getByGroupAndNativeTmpl(
        nativeTmplId: string,
        nativeTmplConfGroupId: string,
        creatorId: string,
        live: number,
    ) {
        const queryStrings: string[] = [];

        queryStrings.push(`nativeTmplId='${nativeTmplId}'`);
        queryStrings.push(`nativeTmplConfGroupId = '${nativeTmplConfGroupId}'`);

        if (live === 1) {
            const LiveActiveTime = think.config('LiveActiveTime');
            queryStrings.push(`activeTime = '${LiveActiveTime}'`);

        }
        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        const queryString: string = queryStrings.join(' AND ');
        // think.logger.debug(`queryString: ${queryString}`);

        return await this.where(queryString).find() as NativeTmplConfVO;

    }

    /**
     * 线上正式数据,
     * <br/>获取应用 native 模板信息列表
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

        return await this.where(queryString).select() as NativeTmplConfVO[];

    }

    /**
     * 根据应用 native 模板组表主键 获取应用下的 native 模板信息列表
     * @argument {string} nativeTmplConfGroupId 应用下的 native 模板组表主键;
     * @argument {string} creatorId 创建者主键
     * @returns {Promise<ConfigVO[]>} 应用 native 模板数据列表;
     */
    public async getListByGroup(nativeTmplConfGroupId: string, creatorId: string) {
        const queryStrings: string[] = [];

        queryStrings.push(`nativeTmplConfGroupId='${nativeTmplConfGroupId}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).select() as NativeTmplConfVO[];

    }

    /**
     * 根据应用 native 模板组表主键 获取应用下的 native 模板信息列表
     * @argument {string[]} nativeTmplConfGroupIdList 应用下的 native 模板组表主键列表;
     * @argument {number} live 是否线上已发布数据
     * @returns {Promise<ConfigVO[]>} 应用 native 模板数据列表;
     */
    public async getListByGroupList(nativeTmplConfGroupIdList: string[], live: number) {
        const queryStrings: string[] = [];

        // 为空数组直接返回空
        if (_.isEmpty(nativeTmplConfGroupIdList)) {
            return [];
        }

        // in 查询逻辑
        const nativeTmplConfGroupIdListString = _.map(nativeTmplConfGroupIdList, (id) => {
            return `'${id}'`;

        });
        queryStrings.push(`nativeTmplConfGroupId IN (${nativeTmplConfGroupIdListString})`);

        if (live === 1) {
            const LiveActiveTime = think.config('LiveActiveTime');
            queryStrings.push(`activeTime = '${LiveActiveTime}'`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).select() as NativeTmplConfVO[];

    }

}