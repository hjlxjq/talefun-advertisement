import { think } from "thinkjs";
think.beforeStartServer(async () => {
    const appId = think.config("TLF_AppId");
    const appName = think.config("TLF_AppName");
    think.logger.info(`appId:${appId} - appName:${appName}`);
});

think.app.on("appReady", () => {
});