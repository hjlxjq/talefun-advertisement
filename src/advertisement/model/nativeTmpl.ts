/**
 * advertisement nativeTmplModel
 * @module advertisement/model/nativeTmpl
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';

import MBModel from './managerBaseModel';
import { NativeTmplVO } from '../defines';
import Utils from '../utils';

/**
 * native 模板配置相关模型
 * @class nativeTmplModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class NativeTmplModel extends MBModel {
    /**
     * 插入 native 模板
     * @argument {NativeTmplVO} nativeTmplVo native 模板表对象;
     * @returns {Promise<string>} 主键 id;
     */
    public async addVo(nativeTmplVo: NativeTmplVO) {
        await this.add(nativeTmplVo);
        return this.ID[0];

    }

    /**
     * 更新 native 模板
     * @argument {string} id native 模板表 id;
     * @argument {NativeTmplVO} nativeTmplVo native 模板表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateVo(id: string, nativeTmplVo: NativeTmplVO) {
        if (!Utils.isEmptyObj(nativeTmplVo)) {
            return await this.where({ id }).update(nativeTmplVo);

        }
        return 0;

    }

    /**
     * 根据主键 id 获取 native 模板信息
     * @argument {string} id native 模板表 id;
     * @argument {number} active 是否生效;
     * @argument {number} test 是否测试 app 可见;
     * @returns {Promise<nativeTmplVO>} native 模板信息;
     */
    public async getVo(id: string, active: number, test: number) {
        const queryStrings: string[] = [];
        queryStrings.push(`id='${id}'`);

        if (test === 0) {
            queryStrings.push(`test=${test}`);

        }
        if (!_.isUndefined(active)) {
            queryStrings.push(`active=${active}`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).find() as NativeTmplVO;

    }

    /**
     * 获取 native 模板信息列表
     * </br> 按 native 模板 key 从小到大排序
     */
    public async getList() {
        return await this.select() as NativeTmplVO[];

    }

}