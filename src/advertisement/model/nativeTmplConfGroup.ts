/**
 * advertisement nativeTmplConfGroupModel
 * @module advertisement/model/nativeTmplConfGroup
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';

import MBModel from './managerBaseModel';
import { NativeTmplConfGroupVO } from '../defines';
import Utils from '../utils';

/**
 * 应用下的 native 模板组配置相关模型
 * @class nativeTmplConfGroupModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class NativeTmplConfGroupModel extends MBModel {
    /**
     * 插入应用下的 native 模板组
     * @argument {NativeTmplConfGroupVO} nativeTmplConfGroupVo 应用下的 native 模板组表对象;
     * @returns {Promise<string>} 主键;
     */
    public async addVo(nativeTmplConfGroupVo: NativeTmplConfGroupVO) {
        await this.add(nativeTmplConfGroupVo);
        return this.ID[0];

    }

    /**
     * 更新应用下的 native 模板组
     * @argument {string} id 应用下的 native 模板组表主键;
     * @argument {NativeTmplConfGroupVO} nativeTmplConfGroupVo 应用下的 native 模板组表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateVo(id: string, nativeTmplConfGroupVo: NativeTmplConfGroupVO) {
        if (!Utils.isEmptyObj(nativeTmplConfGroupVo)) {
            return await this.where({ id }).update(nativeTmplConfGroupVo);

        }
        return 0;

    }

    /**
     * 删除应用下的 native 模板组
     * @argument {string} id 应用下的 native 模板组表主键;
     * @returns {Promise<number>} 删除行数;
     */
    public async delVo(id: string) {
        return await this.where({ id }).delete();

    }

    /**
     * 根据主键 获取应用下的 native 模板组信息
     * @argument {string} id 应用下的 native 模板组表主键;
     * @argument {string} creatorId 创建者主键
     * @returns {Promise<nativeTmplConfGroupVO>}应用下的 native 模板组信息;
     */
    public async getVo(id: string, creatorId?: string, active?: number) {
        const queryStrings: string[] = [];
        queryStrings.push(`id='${id}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        if (!_.isUndefined(active)) {
            queryStrings.push(`active=${active}`);

        }
        const queryString: string = queryStrings.join(' AND ');
        return await this.where(queryString).find() as NativeTmplConfGroupVO;

    }

    /**
     * 线上正式数据,
     * <br/>获取应用 native 模板组信息列表
     * @argument {number} active 是否生效;
     */
    public async getList(active: number) {
        const queryStrings: string[] = [];
        queryStrings.push('1=1');

        if (!_.isUndefined(active)) {
            queryStrings.push(`active=${active}`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).select() as NativeTmplConfGroupVO[];

    }

    /**
     * 根据应用主键 获取获取应用下的 native 模板组信息列表
     * @argument {string} productId 应用表主键;
     * @argument {string} creatorId 创建者主键
     * @argument {number} active 是否生效;
     */
    public async getListByProduct(productId: string, creatorId?: string, active?: number) {
        const queryStrings: string[] = [];

        queryStrings.push(`productId='${productId}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        if (!_.isUndefined(active)) {
            queryStrings.push(`active=${active}`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).select() as NativeTmplConfGroupVO[];

    }

}