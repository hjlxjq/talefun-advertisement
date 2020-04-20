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
     * 为需要添加的新数据增加主键id以及createAt和updateAt字段
     * @argument {any} modelVo 需要添加的新数据;
     */
    protected beforeAdd(modelVo: any) {
        modelVo.id = Utils.generateId();
        this.ID.push(modelVo.id);

        return modelVo;
    }
}