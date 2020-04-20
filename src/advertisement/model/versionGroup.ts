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
 * 版本分组控制配置相关模型
 * @class versionGroupModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class VersionGroupModel extends MBModel {

    /**
     * 插入版本分组控制
     * @argument {VersionGroupVO} versionGroupVo 版本分组控制表对象;
     * @returns {Promise<string>} 主键 id;
     */
    public async addVersionGroup(versionGroupVo: VersionGroupVO) {

        await this.add(versionGroupVo);
        return this.ID[0];
    }

    /**
     * 更新版本分组控制
     * @argument {string} id 版本分组控制表 id;
     * @argument {VersionGroupVO} versionGroupVo 版本分组控制表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateVersionGroup(id: string, versionGroupVo: VersionGroupVO) {
        if (!Utils.isEmptyObj(versionGroupVo)) {
            return await this.where({ id }).update(versionGroupVo);

        }
        return 0;
    }

    /**
     * 根据主键 id 获取版本分组控制信息
     * @argument {string} id 版本分组控制表 id;
     * @returns {Promise<VersionGroupVO>} 版本分组控制信息;
     */
    public async getVersionGroup(id: string) {
        return await this.where({ id }).find() as VersionGroupVO;
    }

    /**获取版本分组控制信息列表
     * @argument {string} productId 应用表 id;
     * @argument {string} type 版本分组控制表类型;
     */
    public async getList(productId: string, type: number) {

        return await this.where({
            productId, type
        }).select() as VersionGroupVO[];
    }

    /**
     * 获取版本分组控制名列表,
     * @argument {string[]} idList 版本分组控制表 id 列表;
     * @argument {number} active 是否生效;
     * @returns {Promise<string[]>} 版本分组控制名列表;
     */
    public async getVersionGroupNameList(idList: string[], active?: number) {
        idList.push('');    // 为空数组报错
        let versionGroupVoList: VersionGroupVO[];

        if (!_.isUndefined(active)) {
            versionGroupVoList = await this.where({ id: ['IN', idList], active }).select();

        }
        versionGroupVoList = await this.where({ id: ['IN', idList], active }).select();

        const versionGroupNameList = _.map(versionGroupVoList, (versionGroupVo) => {
            return versionGroupVo.name;
        });
        return versionGroupNameList;
    }

}