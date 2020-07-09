/**
 * DeployManager Controller module.
 * <br/>发布相关 api
 * @module advertisement/controller/deployManager
 * @see advertisement/controller/deployManager;
 * @debugger
 */
import { think } from 'thinkjs';
import * as Bluebird from 'bluebird';
import * as _ from 'lodash';

import BaseController from '../../common/tale/BaseController';
import MBModel from '../model/managerBaseModel';
import UpdateCacheServer from '../service/updateCacheServer';

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
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        // 下发相关的所有数据表
        const tableNameList = [
            'adGroup', 'ad', 'configGroup', 'config', 'nativeTmplConf', 'nativeTmplConfGroup',
            'abTestMap', 'abTestGroup', 'versionGroup',
        ];

        // 数据表中没有暂存所有数据表
        const NoTableNameList = [
            'adGroup', 'configGroup', 'nativeTmplConfGroup', 'abTestMap'
        ];

        try {
            // 所有数据表都发布
            await Bluebird.map(tableNameList, async (tableName) => {
                // 待更新的表数据对象
                const modelVohash = await updateCacheServer.fetchCacheDataHash(ucId, tableName);
                // 待更新的数据库表对象组装，需要包含主键
                const modelVoList = [];
                for (const id in modelVohash) {

                    if (modelVohash.hasOwnProperty(id)) {
                        const modelVo = modelVohash[id];
                        modelVo.id = id;
                        modelVoList.push(modelVo);

                    }

                }

                // 初始化数据表 model
                const deployModel = this.taleModel(tableName, 'advertisement') as MBModel;
                // 数据表中更新，更新缓存数据到数据表到正式
                await deployModel.updateModelVoList(modelVoList);

                // 数据表中暂存更新到正式
                if (_.indexOf(NoTableNameList, tableName) === -1) {
                    await deployModel.deployVo(ucId, 1);

                } else {
                    await deployModel.deployVo(ucId);

                }

            }, { concurrency: 3 });

            // 从缓存中删除（数据表中更新成功再删除）
            await updateCacheServer.delCacheDataList(tableNameList, ucId);

            // 从缓存中删除用户发布状态
            await updateCacheServer.delDeployStatus(ucId);
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
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

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

            }, { concurrency: 3 });

            // 从缓存中删除
            await updateCacheServer.delCacheDataList(tableNameList, ucId);
            await updateCacheServer.delDeployStatus(ucId);

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
        const updateCacheServer = this.taleService('updateCacheServer', 'advertisement') as UpdateCacheServer;

        // 从缓存中获取用户发布状态
        const deployStatus = await updateCacheServer.fetchDeployStatus(ucId);

        if (deployStatus) {
            return this.success({ deployStatus: 1 });

        }

        return this.success({ deployStatus: 0 });
    }

}