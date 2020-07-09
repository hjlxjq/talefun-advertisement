/**
 * advertisement managerBaseModel
 * @module advertisement/model/managerBase
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';

import BaseModel from '../../common/tale/BaseModel';
import Utils from '../utils';

/**
 * 数据库基础操作方法
 * @class managerBaseModel
 * @extends @link:common/tale/BaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class ManagerBaseModel extends BaseModel {
    protected ID: string[];    // 主键列表

    constructor(...args: any[]) {
        super(...args);
        this.ID = [];

    }

    /**
     * 为需要创建的新数据增加主键 以及 createAt 和 updateAt 字段
     * @argument {any} modelVo 需要创建的表数据;
     */
    protected beforeAdd(modelVo: any) {
        modelVo.id = Utils.generateId();
        this.ID.push(modelVo.id);

        return modelVo;

    }

    /**
     * 批量更新，
     * <br/> 数据库表对象必须包含主键
     * @argument {any[]} modelVoList 数据库表对象列表;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateModelVoList(modelVoList: any[]) {
        think.logger.debug(`modelVoList: ${JSON.stringify(modelVoList)}`);
        return await this.updateMany(modelVoList);

    }

    /**
     * 批量删除
     * @argument {string} creatorId 创建者主键
     * @returns {Promise<number>} 返回影响的行数
     */
    public async delModelVoList(creatorId: string) {
        return await this.where({ creatorId }).delete();

    }

    /**
     * 发布数据库暂存的数据到正式环境,
     * <br/>即删除创建者主键和更新 activeTime 为线上固定时间
     * @argument {string} creatorId 创建者主键;
     * @argument {number} live 是否线上已发布数据
     * @returns {Promise<number>} 返回影响的行数
     */
    public async deployVo(creatorId: string, live?: number) {
        // 线上的 activeTime 值
        const LiveActiveTime = think.config('LiveActiveTime');

        const updateVo: any = {
            creatorId: null,
        };
        if (live === 1) {
            updateVo.activeTime = LiveActiveTime;

        }

        return await this.where({ creatorId }).update(updateVo);

    }

}