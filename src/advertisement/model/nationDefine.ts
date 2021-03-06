/**
 * advertisement nationDefineModel
 * @module advertisement/model/nationDefine
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';

import MBModel from './managerBaseModel';
import { NationDefineVO } from '../defines';

/**
 * 国家代码定义表配置相关模型
 * @class nationDefineModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class NationDefineDefineModel extends MBModel {

    /**
     * 批量，
     * <br/>插入国家代码定义对象列表
     * @argument {NationDefineVO[]} nationDefineVoList 国家代码定义列表;
     * @returns {Promise<string[]>} 主键 id 列表;
     */
    public async addList(nationDefineVoList: NationDefineVO[]) {
        let idList: string[] = [];

        if (!think.isEmpty(nationDefineVoList)) {

            await this.addMany(nationDefineVoList);
            idList = this.ID;
        }
        return idList;
    }

    /**
     * 获取国家代码定义列表;
     * @returns {Promise<string[]>} 国家代码定义列表;
     */
    public async getList() {
        const nationDefineVOList = await this.where().select() as NationDefineVO[];

        return _.map(nationDefineVOList, (nationDefineVo) => {
            delete nationDefineVo.id;
            delete nationDefineVo.createAt;
            delete nationDefineVo.updateAt;

            return nationDefineVo;
        });
    }

    /**
     * 更新国家代码定义表
     * @argument {string} code 国家代码;
     * @argument {string} name 国家代码定义表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateNationDefine(code: string, name: string) {
        return await this.where({ code }).update({ name });
    }

}