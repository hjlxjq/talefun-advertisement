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
export default class NationDefineModel extends MBModel {
    /**
     * 获取国家代码定义列表;
     * @returns {Promise<NationDefineVO[]>} 国家代码定义列表;
     */
    public async getList() {
        const nationDefineVOList = await this.select() as NationDefineVO[];

        return _.map(nationDefineVOList, (nationDefineVo) => {
            // 删除不需要返回的数据
            delete nationDefineVo.id;
            delete nationDefineVo.createAt;
            delete nationDefineVo.updateAt;

            return nationDefineVo;
        });

    }

}