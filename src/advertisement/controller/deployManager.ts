/**
 * DeployManager Controller module.
 * <br/> 发布
 * @module advertisement/controller/deployManager
 * @see advertisement/controller/deployManager;
 * @debugger
 */
import { think } from 'thinkjs';
import * as Bluebird from 'bluebird';
import * as _ from 'lodash';
import BaseController from '../../common/tale/BaseController';

import MBModel from '../model/managerBaseModel';
import CacheService from '../service/updateCacheServer';

import { DeployResVO, RollBackResVO, DeployStatusResVO } from '../interface';

export default class DeployManagerController extends BaseController {
    /**
     * GET
     * <br/>发布到正式环境
     * @returns {DeployResVO}
     * @debugger yes
     */
    public async deployAction() {
        const ucId: string = this.ctx.state.userId;
        const cacheServer = this.taleService('updateCacheServer', 'advertisement') as CacheService;

        // 下发相关的所有数据表
        const tableNameList = [
            'adGroup', 'ad', 'configGroup', 'config', 'nativeTmplConf', 'nativeTmplConfGroup',
            'abTestMap', 'abTestGroup', 'versionGroup',
        ];

        try {
            // 所有数据表都发布
            await Bluebird.map(tableNameList, async (tableName) => {
                // 待更新的表数据对象
                const modelVohash = await cacheServer.fetchCacheDataHash(ucId, tableName);
                // 待更新的数据库表对象列表组装，需要包含主键
                const modelVoList = [];
                for (const id in modelVohash) {
                    if (modelVohash.hasOwnProperty(id)) {
                        const modelVo = modelVohash[id];
                        modelVo.id = id;
                        modelVoList.push(modelVo);

                    }

                }
                // think.logger.debug(`modelVoList: ${JSON.stringify(modelVoList)}`);
                // think.logger.debug(`tableName: ${tableName}`);
                // 初始化数据表 model
                const deployModel = this.taleModel(tableName, 'advertisement') as MBModel;
                // 数据表中更新，更新缓存到数据表 和 数据表中暂存更新到正式
                await Promise.all([
                    deployModel.updateModelVoList(modelVoList),
                    deployModel.deployVo(ucId)
                ]);
                // 从缓存中删除
                await cacheServer.delCacheDataList(tableNameList, ucId);

            });

            // 从缓存中删除用户发布状态
            await cacheServer.delDeployStatus(ucId);
            this.success('发布成功！！！');

        } catch (e) {
            think.logger.debug(e);
            this.fail(10, '发布失败！！！');
        }

    }

    /**
     * GET
     * <br/>回滚用户操作
     * @returns {RollBackResVO}
     * @debugger yes
     */
    public async rollBackAction() {
        const ucId: string = this.ctx.state.userId;
        const cacheServer = this.taleService('updateCacheServer', 'advertisement') as CacheService;

        // 下发相关的所有数据表
        const tableNameList = [
            'adGroup', 'ad', 'configGroup', 'config', 'nativeTmplConf', 'nativeTmplConfGroup',
            'abTestMap', 'abTestGroup', 'versionGroup',
        ];

        try {
            // 所有数据表都回滚
            await Bluebird.map(tableNameList, async (tableName) => {
                // 初始化数据表 model
                const deployModel = this.taleModel(tableName, 'advertisement') as MBModel;
                // 数据表中删除用户暂存的数据
                await deployModel.delModelVoList(ucId);

            });
            // 从缓存中删除
            await cacheServer.delCacheDataList(tableNameList, ucId);
            await cacheServer.delDeployStatus(ucId);

            this.success('回滚成功！！！');

        } catch (e) {
            think.logger.debug(e);
            this.fail(10, '回滚失败！！！');
        }

    }

    /**
     * GET
     * <br/>获取发布状态
     * @returns {DeployStatusResVO}
     * @debugger yes
     */
    public async deployStatusAction() {
        const ucId: string = this.ctx.state.userId;
        const cacheServer = this.taleService('updateCacheServer', 'advertisement') as CacheService;

        // 从缓存中获取用户发布状态
        const deployStatus = await cacheServer.fetchDeployStatus(ucId);

        if (deployStatus) {
            return this.success({ deployStatus: 1 });

        }

        return this.success({ deployStatus: 0 });
    }

}