import { think} from 'thinkjs';
think.beforeStartServer(async () => {
    if (think.isEmpty(think.config('TLF_AppId'))) { think.logger.error(new Error('config必须配置TLF_AppId') + ''); }
    if (think.isEmpty(think.config('TLF_AppName'))) { think.logger.error(new Error('config必须配置TLF_AppName') + ''); }
});
