/**
 * CommonManager Controller module.
 * <br/>常规配置相关 api
 * @module advertisement/controller/CommonManager
 * @see advertisement/controller/commonManager;
 * @debugger
 */
import BaseController from '../../common/tale/BaseController';
import { TaleCode } from '../../common/tale/TaleDefine';

import DispatchCacheManagerService from '../service/dispatchCacheServer';
import BaseConfigModel from '../model/baseConfig';
import AdModel from '../model/ad';

import Utils from '../utils';

import { think } from 'thinkjs';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

const rename = think.promisify(fs.rename, fs); // 通过 promisify 方法把 rename 方法包装成 Promise 接口

import {
    AdTypeVO, AdChannelVO, NativeTmplVO, BaseConfigVO, PackParamVO, FileVO
} from '../defines';

import {
    AdTypeListResVO,
    GetAdTypeReqVO, GetAdTypeResVO, CreateAdTypeReqVO, CreateAdTypeResVO, UpdateAdTypeReqVO, UpdateAdTypeResVO,
    AdChannelListResVO, GetAdChannelReqVO, GetAdChannelResVO, CreateAdChannelReqVO, CreateAdChannelResVO,
    UpdateAdChannelReqVO, UpdateAdChannelResVO, NativeTmplListResVO, CreateNativeTmplReqVO, CreateNativeTmplResVO,
    UpdateNativeTmplReqVO, UpdateNativeTmplResVO, BaseConfigListResVO, CreateBaseConfigReqVO,
    CreateBaseConfigResVO, UpdateBaseConfigReqVO, UpdateBaseConfigResVO, PackParamListResVO,
    CreatePackParamReqVO, CreatePackParamResVO, UpdatePackParamReqVO, UpdatePackParamResVO,
} from '../interface';

export default class TestController extends BaseController {
    /**
     * GET，
     * <br/>获取广告类型列表
     * @returns {AdTypeListResVO}
     * @debugger yes
     */
    public async dispatchCacheInitAction() {
        const dispatchCacheManagerServer =
            think.service('dispatchCacheServer', 'advertisement') as DispatchCacheManagerService;
        const adModel = this.taleModel('ad', 'advertisement') as AdModel;
        const adVoList = await adModel.getList(1);
        think.logger.debug(`adVoList: ${JSON.stringify(adVoList)}`);
        try {
            await dispatchCacheManagerServer.initCacheData();
            think.logger.debug('dispatchCacheManager init completed');

        } catch (e) {
            think.logger.debug('cacheManager init failed: ');
            think.logger.debug(e);

        }
        return this.success();

    }

}