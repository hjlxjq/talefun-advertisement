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
    /**
     * 创建或者更新应用打包参数，
     * <br/>不存在则创建
     * @argument {string} packParamId 打包参数表主键;
     * @argument {string} productId 应用表主键;
     * @argument {PackParamConfVO} packParamConfUpdateVo 应用打包参数对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async thenUpdateVo(
        packParamId: string,
        productId: string,
        packParamConfUpdateVo: PackParamConfVO
    ) {
        return await this.thenUpdate(packParamConfUpdateVo, { packParamId, productId });

    }

    /**
     * 获取应用打包参数信息
     * @argument {string} id 打包参数表主键;
     * @argument {string} productId 应用表主键;
     * @returns {Promise<number>} 应用打包参数信息;
     */
    public async getVo(packParamId: string, productId: string) {
        return await this.where({ packParamId, productId }).find() as PackParamConfVO;

    }

    /**
     * 获取应用打包参数信息列表
     * @argument {string} productId 应用表主键;
     */
    public async getList(productId: string) {
        return await this.where({ productId }).select() as PackParamConfVO[];

    }

    /**
     * 删除应用打包参数信息
     * @argument {string} id 打包参数表主键;
     * @argument {string} productId 应用表主键;
     * @returns {Promise<number>} 删除行数;
     */
    public async delPackParamConf(packParamId: string, productId: string) {
        return await this.where({ packParamId, productId }).delete();

    }

}