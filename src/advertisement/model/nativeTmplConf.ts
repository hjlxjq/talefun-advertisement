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
    public async addVo(nativeTmplConfVo: NativeTmplConfVO) {
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
     * @argument {string} id 应用下 native 模板表 id;
     * @argument {NativeTmplConfVO} nativeTmplConfVo应用下 native 模板表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateVo(id: string, nativeTmplConfVo: NativeTmplConfVO) {
        if (!Utils.isEmptyObj(nativeTmplConfVo)) {
            return await this.where({ id }).update(nativeTmplConfVo);

        }
        return 0;

    }

    /**
     * 根据主键 id 获取应用下 native 模板信息
     * @argument {string} id 应用下 native 模板表 id;
     * @argument {string} creatorId 创建者 id
     * @returns {Promise<nativeTmplConfVO>}应用下 native 模板信息;
     */
    public async getVo(id: string, creatorId: string) {
        const queryStrings: string[] = [];
        queryStrings.push(`id='${id}'`);

        if (!_.isUndefined(creatorId)) {
            queryStrings.push(`(creatorId IS NULL OR creatorId = '${creatorId}')`);

        }
        const queryString: string = queryStrings.join(' AND ');

        return await this.where(queryString).find() as NativeTmplConfVO;
    }

    /**
     * 删除应用 native 模板
     * @argument {string} id  引用 native 模板表 id;
     * @returns {Promise<number>} 删除行数;
     */
    public async delVo(id: string) {
        return await this.where({ id }).delete();

    }

    /**
     * 根据 native 模板组表主键和 native 模板表主键获取常量
     * @argument {string} nativeTmplId native 模板表主键;
     * @argument {string} nativeTmplConfGroupId 应用下 native 模板组表 id;
     * @argument {string} creatorId 创建者 id
     * @argument {number} active 是否生效;
     * @argument {number} live 是否线上已发布数据
     * @returns {Promise<ConfigVO>} 常量表信息;
     */
    public async getByGroupAndNativeTmpl(
        nativeTmplId: string,
        nativeTmplConfGroupId: string,
        creatorId: string,
        active: number,
        live: number,
    ) {
        const queryStrings: string[] = [];

        queryStrings.push(`nativeTmplId='${nativeTmplId}'`);
        queryStrings.push(`nativeTmplConfGroupId = '${nativeTmplConfGroupId}'`);

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

        return await this.where(queryString).find() as NativeTmplConfVO;

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

}