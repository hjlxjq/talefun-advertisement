import { think } from 'thinkjs';
import * as path from 'path';

import Utils from '../../advertisement/utils';

const PreviewDir = path.resolve(think.ROOT_PATH, '..', think.config('PreviewDir'));

think.beforeStartServer(async () => {
    const appId = think.config('TLF_AppId');
    const appName = think.config('TLF_AppName');

    think.logger.info(`appId:${appId} - appName:${appName}`);

    think.config('PreviewDir', PreviewDir);
    await Utils.thenCreateDir(PreviewDir);

});

think.app.on('appReady', () => {
});