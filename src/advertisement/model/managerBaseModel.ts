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
 * 数据库基础方法，返回主键
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
     * 为需要创建的新数据增加主键 id 以及 createAt 和 updateAt 字段
     * @argument {any} modelVo 需要创建的新数据;
     */
    protected beforeAdd(modelVo: any) {
        modelVo.id = Utils.generateId();
        this.ID.push(modelVo.id);

        return modelVo;
    }

    /**
     * 批量更新
     * @argument {any[]} modelVoList 数据库对象列表;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateModelVoList(modelVoList: any[]): Promise<number> {
        return await this.updateMany(modelVoList);
    }

    /**
     * 批量删除
     * @argument {string} creatorId 创建者 id
     * @returns {Promise<number>} 返回影响的行数
     */
    public async delModelVoList(creatorId: string): Promise<number> {
        return await this.where({ creatorId }).delete();
    }

    /**
     * 更新 ab 测试分组,
     * <br/>
     * @argument {string} creatorId 创建者 id
     * @returns {Promise<number>} 返回影响的行数
     */
    public async deployVo(creatorId: string) {
        if ((creatorId)) {
            return await this.where({ creatorId }).update({ creatorId: null });
        }
        return 0;
    }

}