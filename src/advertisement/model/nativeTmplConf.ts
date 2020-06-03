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
 * 应用下 native 模板配置相关模型
 * @class nativeTmplConfModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class NativeTmplConfModel extends MBModel {

    /**
     * 插入应用下 native 模板
     * @argument {NativeTmplConfVO} nativeTmplConfVo应用下 native 模板表对象;
     * @returns {Promise<string>} 主键 id;
     */
    public async addNativeTmplConf(nativeTmplConfVo: NativeTmplConfVO) {

        await this.add(nativeTmplConfVo);
        return this.ID[0];
    }

    /**
     * 批量
     * 入应用下 native 模板
     * @argument {NativeTmplConfVO[]} configVoList 应用下 native 模板对象列表;
     * @returns {Promise<string[]>} 主键 id 列表;
     */
    public async addList(nativeTmplConfVoList: NativeTmplConfVO[]) {
        let idList: string[] = [];
        if (!think.isEmpty(nativeTmplConfVoList)) {

            await this.addMany(nativeTmplConfVoList);
            idList = this.ID;
        }
        return idList;
    }

    /**
     * 更新应用下 native 模板
     * @argument {string} id应用下 native 模板表 id;
     * @argument {NativeTmplConfVO} nativeTmplConfVo应用下 native 模板表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateNativeTmplConf(id: string, nativeTmplConfVo: NativeTmplConfVO) {
        if (!Utils.isEmptyObj(nativeTmplConfVo)) {
            return await this.where({ id }).update(nativeTmplConfVo);
        }
        return 0;
    }

    /**
     * 根据主键 id 获取应用下 native 模板信息
     * @argument {string} id应用下 native 模板表 id;
     * @returns {Promise<nativeTmplConfVO>}应用下 native 模板信息;
     */
    public async getNativeTmplConf(id: string) {
        return await this.where({ id }).find() as NativeTmplConfVO;
    }

    /**
     * 删除应用下 native 模板
     * @argument {string} id 应用下 native 模板表 id;
     * @returns {Promise<number>} 删除行数;
     */
    public async delNativeTmplConf(id: string) {
        return await this.where({ id }).delete();
    }

    /**
     * 根据 native 模板组表主键 id 获取应用下 native 模板信息列表
     * @argument {string} nativeTmplConfGroupId 应用下 native 模板组表 id;
     * @argument {string} creatorId 创建者 id
     */
    public async getList(nativeTmplConfGroupId: string, creatorId: string = '') {
        const query = `nativeTmplConfGroupId = '${nativeTmplConfGroupId}' AND
        (creatorId IS NULL OR creatorId = '${creatorId}')`;

        return await this.where(query).select() as NativeTmplConfVO[];
    }

    /**
     * 根据 native 模板组表主键 id 获取应用 native 模板数量
     * @argument {string} nativeTmplConfGroupId 应用下 native 模板组表 id;
     * @argument {number} active 是否生效;
     * @returns {Promise<number>} 应用 native 模板数量;
     */
    // public async getNum(nativeTmplConfGroupId: string, active?: number) {
    //     if (!_.isUndefined(active)) {
    //         return await this.where({ nativeTmplConfGroupId, active }).count('id');

    //     }
    //     return await this.where({ nativeTmplConfGroupId }).count('id');
    // }

}