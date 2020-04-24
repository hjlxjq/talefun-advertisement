/**
 * advertisement PackParamConfModel
 * @module advertisement/model/PackParamConf
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';

import MBModel from './managerBaseModel';
import { PackParamConfVO } from '../defines';
import Utils from '../utils';

/**
 * 应用打包参数配置相关模型
 * @class PackParamConfModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class PackParamConfModel extends MBModel {

    // /**
    //  * 插入应用打包参数
    //  * @argument {PackParamConfVO} packParamConfVo 应用打包参数表对象;
    //  * @returns {Promise<string>} 主键 id;
    //  */
    // public async addPackParamConf(packParamConfVo: PackParamConfVO) {

    //     await this.add(packParamConfVo);
    //     return this.ID[0];
    // }

    /**
     * 更新应用打包参数
     * @argument {string} packParamId 打包参数表 id;
     * @argument {string} productId 应用表 id;
     * @argument {PackParamConfVO} packParamConfUpdateVo 应用打包参数对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updatePackParamConf(
        packParamId: string,
        productId: string,
        packParamConfUpdateVo: PackParamConfVO
    ) {
        think.logger.debug(`packParamId: ${packParamId}`);
        think.logger.debug(`productId: ${productId}`);
        think.logger.debug(`packParamConfUpdateVo: ${JSON.stringify(packParamConfUpdateVo)}`);
        return await this.thenUpdate(packParamConfUpdateVo, { packParamId, productId });
    }

    /**
     * 获取应用打包参数信息
     * @argument {string} id 打包参数表 id;
     * @argument {string} productId 应用表 id;
     * @returns {Promise<number>} 应用打包参数信息;
     */
    public async getPackParamConf(packParamId: string, productId: string) {
        return await this.where({ packParamId, productId }).find() as PackParamConfVO;
    }

    /**
     * @argument {string} productId 应用表 id;
     * 获取应用打包参数信息列表
     */
    public async getList(productId: string) {
        return await this.where({ productId }).select() as PackParamConfVO[];
    }

    /**
     * 删除应用打包参数信息
     * @argument {string} id 打包参数表 id;
     * @argument {string} productId 应用表 id;
     * @returns {Promise<number>} 删除行数;
     */
    public async delPackParamConf(packParamId: string, productId: string) {
        return await this.where({ packParamId, productId }).delete();
    }

}