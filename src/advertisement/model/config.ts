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
    public async addVo(configVo: ConfigVO) {
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
     * 更新游戏常量
     * @argument {string} id 常量表 id;
     * @argument {ConfigVO} configVo 常量表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateVo(id: string, configVo: ConfigVO) {
        if (!Utils.isEmptyObj(configVo)) {
            return await this.where({ id }).update(configVo);

        }
        return 0;

    }

    /**
     * 根据常量表主键 id 获取常量
     * @argument {string} id 常量表 id;
     * @argument {string} creatorId 创建者 id
     * @returns {Promise<ConfigVO>} 常量表信息;
     */
    public async getVo(id: string, creatorId: string) {
        const queryStrings: string[] = [];
        queryStrings.push(`id='${id}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).find() as ConfigVO;

    }

    /**
     * 根据常量组表主键 id 和 key 获取常量
     * @argument {string} key 常量 key;
     * @argument {string} configGroupId 常量组表 id;
     * @argument {string} creatorId 创建者 id
     * @argument {number} active 是否生效
     * @argument {number} live 是否线上已发布数据
     * @returns {Promise<ConfigVO>} 常量表信息;
     */
    public async getByGroupAndKey(
        key: string,
        configGroupId: string,
        creatorId: string,
        active: number,
        live: number,
    ) {
        const queryStrings: string[] = [];

        queryStrings.push(`\`key\`='${key}'`);    // key 为 mysql 关键字
        queryStrings.push(`configGroupId='${configGroupId}'`);

        if (!_.isUndefined(active)) {
            queryStrings.push(`active=${active}`);

        }
        if (!_.isUndefined(live)) {
            const LiveActiveTime = think.config('LiveActiveTime');
            queryStrings.push(`activeTime = '${LiveActiveTime}'`);

        }
        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);
        }

        const queryString: string = queryStrings.join(' AND ');
        think.logger.debug(`queryString: ${queryString}`);

        return await this.where(queryString).find() as ConfigVO;

    }

    /**
     * 删除常量
     * @argument {string} id 常量表 id;
     * @returns {Promise<number>} 删除行数;
     */
    public async delVo(id: string) {
        return await this.where({ id }).delete();

    }

    /**
     * 按常量组主键获取常量信息
     * @argument {string} configGroupId 常量组表 id;
     * @argument {string} creatorId 创建者 id
     * @argument {number} active 是否生效;
     * @returns {Promise<ConfigVO[]>} 常量数据列表;
     */
    public async getList(configGroupId: string, creatorId: string, active: number) {
        const queryStrings: string[] = [];
        queryStrings.push(`configGroupId='${configGroupId}'`);

        if (!_.isUndefined(active)) {
            queryStrings.push(`active=${active}`);
        }
        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).select() as ConfigVO[];

    }

}