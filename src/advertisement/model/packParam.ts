/**
 * advertisement PackParamModel
 * @module advertisement/model/PackParam
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';

import MBModel from './managerBaseModel';
import { PackParamVO } from '../defines';
import Utils from '../utils';

/**
 * 打包参数配置相关模型
 * @class PackParamModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class PackParamModel extends MBModel {
    /**
     * 插入打包参数,
     * @argument {PackParamVO} packParamVo 打包参数表对象;
     * @returns {Promise<string>} 主键;
     */
    public async addVo(packParamVo: PackParamVO) {
        await this.add(packParamVo);
        return this.ID[0];

    }

    /**
     * 更新打包参数,
     * @argument {string} id 打包参数表;
     * @argument {PackParamVO} packParamVo 打包参数表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateVo(id: string, packParamVo: PackParamVO) {
        if (!Utils.isEmptyObj(packParamVo)) {
            return await this.where({ id }).update(packParamVo);

        }
        return 0;

    }

    /**
     * 获取打包参数信息列表,
     * @argument {number} active 是否生效;
     * @argument {number} test 是否测试 app 可见;
     */
    public async getList(active?: number, test?: number) {
        const queryStrings: string[] = [];
        queryStrings.push('1=1');

        if (test === 0) {
            queryStrings.push(`test=${test}`);

        }
        if (!_.isUndefined(active)) {
            queryStrings.push(`active=${active}`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).select() as PackParamVO[];

    }

}