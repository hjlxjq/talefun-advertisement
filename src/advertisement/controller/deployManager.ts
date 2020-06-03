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
import CacheService from '../service/cacheServer';

export default class DeployManagerController extends BaseController {

    /**
     * GET
     * <br/>发布到正式环境
     * @debugger yes
     */
    public async deployAction() {
        const ucId: string = this.ctx.state.userId;
        think.logger.debug(`ucId: ${ucId}`);
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        // 下发相关的所有表
        const tableNameList = [
            'adGroup', 'ad', 'configGroup', 'config', 'nativeTmplConf', 'nativeTmplConfGroup',
            'abTestMap', 'abTestGroup', 'versionGroup',
        ];

        try {
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
                const deployModel = this.taleModel(tableName, 'advertisement') as MBModel;
                await Promise.all([
                    deployModel.updateModelVoList(modelVoList),
                    deployModel.deployVo(ucId)
                ]);
                await cacheServer.delCacheDataList(tableNameList, ucId);

            });
            this.success('发布成功！！！');

        } catch (e) {
            think.logger.debug(e);
            this.fail(10, '发布失败！！！');
        }
    }

    /**
     * GET
     * <br/>回滚用户操作
     * @debugger yes
     */
    public async rollBackAction() {
        const ucId: string = this.ctx.state.userId;
        think.logger.debug(`ucId: ${ucId}`);
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        // const {tableNameList, cachetKeyList } = await cacheServer.fetchDeployModelList(ucId);
        const tableNameList = [
            'adGroup', 'ad', 'configGroup', 'config', 'nativeTmplConf', 'nativeTmplConfGroup',
            'abTestMap', 'abTestGroup', 'versionGroup',
        ];

        try {
            await Bluebird.map(tableNameList, async (tableName) => {
                const deployModel = this.taleModel(tableName, 'advertisement') as MBModel;
                await  deployModel.delModelVoList(ucId);

            });
            await cacheServer.delCacheDataList(tableNameList, ucId);

            this.success('回滚成功！！！');

        } catch (e) {
            think.logger.debug(e);
            this.fail(10, '回滚失败！！！');
        }
    }

}