/**
 * advertisement adTypeModel
 * @module advertisement/model/adType
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import MBModel from './managerBaseModel';
import * as _ from 'lodash';
import { AdTypeVO } from '../defines';
import Utils from '../utils';

/**
 * 广告类型配置相关模型
 * @class adTypeModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class AdTypeModel extends MBModel {

    /**
     * 插入广告类型
     * @argument {AdTypeVO} adTypeVo 广告类型表对象;
     * @returns {Promise<string>} 主键 id;
     */
    public async addAdType(adTypeVo: AdTypeVO) {

        await this.add(adTypeVo);
        return this.ID[0];
    }

    /**
     * 更新广告类型
     * @argument {string} id 广告类型表 id;
     * @argument {AdTypeVO} adTypeVo 广告类型表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateAdType(id: string, adTypeVo: AdTypeVO) {
        if (!Utils.isEmptyObj(adTypeVo)) {
            return await this.where({ id }).update(adTypeVo);
        }
        return 0;
    }

    /**
     * 根据主键 id 获取广告类型信息
     * @argument {string} id 广告类型表 id;
     * @argument {number} active 是否生效;
     * @argument {number} test 是否测试 app 可见;
     * @returns {Promise<AdTypeVO>} 广告类型信息;
     */
    public async getAdType(id: string, active?: number, test?: number) {
        const queryStrings: string[] = [];
        queryStrings.push(`id='${id}'`);

        if (test === 0) {
            queryStrings.push(`test=${test}`);
        }

        if (!_.isUndefined(active)) {
            queryStrings.push(`active=${active}`);
        }

        const queryString: string = queryStrings.join(' AND ');

        // think.logger.debug(`queryString: ${queryString}`);

        return await this.where(queryString).find() as AdTypeVO;
    }

    /**
     * 根据广告类型获取广告类型信息
     * @argument {string} name 广告类型显示名称;
     * @returns {Promise<AdTypeVO>} 广告类型信息;
     */
    public async getByName(name: string) {
        return await this.where({ name }).find() as AdTypeVO;
    }

    /**
     * 获取广告类型信息列表
     * </br> 按广告类型从小到大排序
     * @returns {Promise<AdTypeVO[]>} 广告类型信息列表;
     */
    public async getList() {
        return await this.order('type').select() as AdTypeVO[];
    }

}