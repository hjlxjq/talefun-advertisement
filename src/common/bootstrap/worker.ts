import { think } from 'thinkjs';
import * as path from 'path';

import Utils from '../../advertisement/utils';

import DispatchCacheManagerService from '../../advertisement/service/dispatchCacheServer';

const PreviewDir = path.resolve(think.ROOT_PATH, '..', think.config('PreviewDir'));

think.beforeStartServer(async () => {
    const appId = think.config('TLF_AppId');
    const appName = think.config('TLF_AppName');

    think.logger.info(`appId:${appId} - appName:${appName}`);

    think.config('PreviewDir', PreviewDir);
    await Utils.thenCreateDir(PreviewDir);

    const dispatchCacheManagerServer =
        think.service('dispatchCacheServer', 'advertisement') as DispatchCacheManagerService;
    try {
        await dispatchCacheManagerServer.initCacheData();
        think.logger.debug('dispatchCacheManager init completed');

    } catch (e) {
        think.logger.debug('cacheManager init failed: ');
        think.logger.debug(e);

    }

});

think.app.on('appReady', () => {
});