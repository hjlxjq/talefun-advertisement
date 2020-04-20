/**
 * advertisement configModel
 * @module advertisement/model/config
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';

import MBModel from './managerBaseModel';
import { ConfigVO } from '../defines';
import Utils from '../utils';

/**
 * 常量配置相关模型
 * @class configModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class ConfigModel extends MBModel {

    /**
     * 插入常量
     * @argument {ConfigVO} configVo 常量表对象;
     * @returns {Promise<string>} 主键 id;
     */
    public async addConfig(configVo: ConfigVO) {

        await this.add(configVo);
        return this.ID[0];
    }

    /**
     * 批量
     * 入常量
     * @argument {ConfigVO[]} configVoList 常量对象列表;
     * @returns {Promise<string[]>} 主键 id 列表;
     */
    public async addList(configVoList: ConfigVO[]) {
        let idList: string[] = [];
        if (!think.isEmpty(configVoList)) {

            await this.addMany(configVoList);
            idList = this.ID;
        }
        return idList;
    }

    /**
     * 更新常量
     * @argument {string} id 常量表 id;
     * @argument {ConfigVO} configVo 常量表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateConfig(id: string, configVo: ConfigVO) {
        if (!Utils.isEmptyObj(configVo)) {
            return await this.where({ id }).update(configVo);
        }
        return 0;
    }

    /**
     * 根据常量表主键 id 获取常量
     * @argument {string} id 常量表 id;
     * @returns {Promise<ConfigVO>} 常量表信息;
     */
    public async getConfig(id: string): Promise<ConfigVO> {
        return await this.where({ id }).find();
    }

    /**
     * 删除常量
     * @argument {string} id 常量表 id;
     * @returns {Promise<number>} 删除行数;
     */
    public async delConfig(id: string) {
        return await this.where({ id }).delete();
    }

    /**
     * 根据常量组主键 id 获取常量组下常量数量
     * @argument {string} configGroupId 常量组表 id;
     * @argument {number} active 是否生效;
     * @returns {Promise<number>} 常量组下常量数量;
     */
    public async getNum(configGroupId: string, active?: number) {
        if (!_.isUndefined(active)) {
            return await this.where({ configGroupId, active }).count('id');

        }
        return await this.where({ configGroupId }).count('id');
    }

    /**
     * 按常量组主键获取常量信息
     * @argument {string} configGroupId 常量组表id;
     * @argument {number} active 是否生效;
     * @returns {Promise<ConfigVO[]>} 常量数据列表;
     */
    public async getList(configGroupId: string, active?: number) {
        if (active !== undefined) {
            return await this.where({ configGroupId, active }).select() as ConfigVO[];
        }

        return await this.where({ configGroupId }).select() as ConfigVO[];
    }

}