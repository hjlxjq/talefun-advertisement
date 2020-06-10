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
 * 应用下 native 模板组配置相关模型
 * @class nativeTmplConfGroupModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class NativeTmplConfGroupModel extends MBModel {
    /**
     * 插入应用下 native 模板组
     * @argument {NativeTmplConfGroupVO} nativeTmplConfGroupVo 应用下 native 模板组表对象;
     * @returns {Promise<string>} 主键 id;
     */
    public async addVo(nativeTmplConfGroupVo: NativeTmplConfGroupVO) {
        await this.add(nativeTmplConfGroupVo);
        return this.ID[0];

    }

    /**
     * 更新应用下 native 模板组
     * @argument {string} id 应用下 native 模板组表 id;
     * @argument {NativeTmplConfGroupVO} nativeTmplConfGroupVo 应用下 native 模板组表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateVo(id: string, nativeTmplConfGroupVo: NativeTmplConfGroupVO) {
        if (!_.isEmpty(nativeTmplConfGroupVo)) {
            return await this.where({ id }).update(nativeTmplConfGroupVo);

        }
        return 0;

    }

    /**
     * 根据主键 id 获取应用下 native 模板组信息
     * @argument {string} id 应用下 native 模板组表 id;
     * @argument {string} creatorId 创建者 id
     * @returns {Promise<nativeTmplConfGroupVO>}应用下 native 模板组信息;
     */
    public async getVo(id: string, creatorId: string) {
        const queryStrings: string[] = [];
        queryStrings.push(`id='${id}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        const queryString: string = queryStrings.join(' AND ');
        return await this.where(queryString).find() as NativeTmplConfGroupVO;

    }

    /**
     * 获取应用下 native 模板组信息列表
     * @argument {string} productId 应用表 id;
     * @argument {string} creatorId 创建者 id
     */
    public async getList(productId: string, creatorId: string) {
        const queryStrings: string[] = [];

        queryStrings.push(`productId='${productId}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).select() as NativeTmplConfGroupVO[];

    }

}