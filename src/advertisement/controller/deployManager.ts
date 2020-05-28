/**
 * DeployManager Controller module.
 * <br/> 发布
 * @module advertisement/controller/deployManager
 * @see advertisement/controller/deployManager;
 * @debugger
 */
import { think } from 'thinkjs';
import * as Bluebird from 'bluebird';
import ModelServer from '../service/modelServer';
import * as _ from 'lodash';
import * as moment from 'moment-mini-ts';

import { TaleCode } from '../../common/tale/TaleDefine';
import BaseController from '../../common/tale/BaseController';

import MBModel from '../model/managerBaseModel';
import VersionGroupModel from '../model/versionGroup';
import AbTestGroupModel from '../model/abTestGroup';
import AbTestMapModel from '../model/abTestMap';
import ConfigGroupModel from '../model/configGroup';
import ConfigModel from '../model/config';
import NativeTmplConfGroupModel from '../model/nativeTmplConfGroup';
import NativeTmplConfModel from '../model/nativeTmplConf';
import AdGroupModel from '../model/adGroup';
import AdModel from '../model/ad';

import CacheService from '../service/cacheServer';

import {
    VersionGroupVO, AbTestGroupVO, ConfigGroupVO, ConfigVO, NativeTmplConfGroupVO, NativeTmplConfVO,
    AbTestMapVO, AdGroupVO, AdVO, ConfigGroupResVO, NativeTmplConfGroupResVO, AbTestGroupResVO, NationDefineVO
} from '../defines';

export default class DeployManagerController extends BaseController {

    /**
     * <br/>发布到正式环境
     * @debugger yes
     */
    public async deployAction() {
        const ucId: string = this.ctx.state.userId;
        const adModel = this.taleModel('ad', 'advertisement') as AdModel;
        const adGroupModel = this.taleModel('adGroup', 'advertisement') as AdGroupModel;
        const nativeTmplConfModel = this.taleModel('nativeTmplConf', 'advertisement') as NativeTmplConfModel;
        const nativeTmplConfGroupModel =
            this.taleModel('nativeTmplConfGroup', 'advertisement') as NativeTmplConfGroupModel;
        const configModel = this.taleModel('config', 'advertisement') as ConfigModel;
        const configGroupModel = this.taleModel('configGroup', 'advertisement') as ConfigGroupModel;
        const abTestMapModel = this.taleModel('abTestMap', 'advertisement') as AbTestMapModel;
        const abTestGroupModel = this.taleModel('abTestMapGroup', 'advertisement') as AbTestGroupModel;
        const versionGroupModel = this.taleModel('versionGroup', 'advertisement') as VersionGroupModel;
        const cacheServer = this.taleService('cacheServer', 'advertisement') as CacheService;

        const deployTableNameList = await cacheServer.fetchDeployModelList(ucId);

        try {
            await Bluebird.map(deployTableNameList, async (deployTableName) => {
                const modelVohash = await cacheServer.fetchCacheDataHash(ucId, deployTableName);

                // 待更新的数据库表对象列表组装，需要包含主键
                const modelVoList = [];
                for (const id in modelVohash) {
                    if (modelVohash.hasOwnProperty(id)) {
                        const modelVo = modelVohash[id];
                        modelVo.id = id;
                        modelVoList.push(modelVo);
                    }
                }
                const deployModel = this.taleModel(deployTableName, 'advertisement') as MBModel;
                await deployModel.updateList(modelVoList);
                await deployModel.deployVo(ucId);
            });
            this.success('发布成功！！！');

        } catch (e) {
            this.fail(10, '发布失败！！！');
        }
    }

}