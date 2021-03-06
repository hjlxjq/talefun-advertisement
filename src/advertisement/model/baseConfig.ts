/**
 * advertisement baseConfigModel
 * @module advertisement/model/baseConfig
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';

import MBModel from './managerBaseModel';
import { BaseConfigVO } from '../defines';
import Utils from '../utils';

/**
 * 基础常量配置相关模型
 * @class baseConfigModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class BaseConfigModel extends MBModel {

    /**
     * 插入基础常量
     * @argument {BaseConfigVO} baseConfigVo 基础常量表对象;
     * @returns {Promise<string>} 主键 id;
     */
    public async addBaseConfig(baseConfigVo: BaseConfigVO) {

        await this.add(baseConfigVo);
        return this.ID[0];
    }

    /**
     * 更新基础常量
     * @argument {string} id 基础常量表 id;
     * @argument {BaseConfigVO} baseConfigVo 基础常量表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateBaseConfig(id: string, baseConfigVo: BaseConfigVO) {
        if (!Utils.isEmptyObj(baseConfigVo)) {
            return await this.where({ id }).update(baseConfigVo);
        }
        return 0;
    }

    /**
     * 获取基础常量信息列表
     * </br> 按基础常量 key 从小到大排序
     * @argument {number} active 是否生效;
     * @argument {number} test 是否测试 app 可见;
     * @returns {Promise<BaseConfigVO[]>} 基础常量信息列表;
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

        return await this.where(queryString).select() as BaseConfigVO[];
    }

}