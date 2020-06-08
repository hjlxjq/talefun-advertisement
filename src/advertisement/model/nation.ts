/**
 * advertisement nationModel
 * @module advertisement/model/nation
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';

import MBModel from './managerBaseModel';
import { NationVO } from '../defines';
import Utils from '../utils';

/**
 * 版本条件分组与国家关系表配置相关模型
 * @class nationModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class NationModel extends MBModel {

    /**
     * 获取某个版本条件分组下国家列表
     * @argument {string} versionGroupId 版本控制分组表 id;
     * @returns {Promise<string[]>} 国家列表;
     */
    public async getList(versionGroupId: string) {
        const nationVoList: NationVO[] = await this.where({ versionGroupId }).select();

        return _.map(nationVoList, (nationVo) => {
            return nationVo.code;
        });
    }

    /**
     * 批量更新,
     * <br/>更新某个版本控制分组下所有的国家
     * @argument {string} versionGroupId 版本控制分组表 id;
     * @argument {string[]} codeList 国家代码列表;
     * @argument {number} include 是否包含;
     * @returns {Promise<string[]>} 主键 id 列表;
     */
    public async updateList(
        versionGroupId: string,
        codeList: string[],
        include: number
    ) {
        let idList: string[] = [];

        if (!think.isEmpty(codeList)) {
            await this.where({ versionGroupId }).delete();

            const nationVoList = _.map(codeList, (code) => {

                const nationVo: NationVO = {
                    versionGroupId,
                    code,
                    include
                };
                return nationVo;
            });
            await this.addMany(nationVoList);

            idList = this.ID;
        }
        return idList;
    }

}