import { think } from 'thinkjs';
import BaseLogic from '../tale/BaseLogic';
import { TokenExemptVO } from '../tale/TaleDefine';
export default class MainLogic extends BaseLogic {
    /**
     * 默认控制器方法
     */
    indexAction() {
        this.body = "hello talefun";
    }

    versionAction() {
        const proj = require(think.ROOT_PATH + '/package.json');
        let tlfVerion = "0.0.0";
        if (proj && proj.talefun && proj.talefun.tlf_version) {
            tlfVerion = proj.talefun.tlf_version;
        }
        const out = {
            version: proj.version,
            TLF_Version: tlfVerion,
            TLF_AppId: this.config("TLF_AppId"),
            TLF_AppName: this.config("TLF_AppName")
        };
        this.body = out;
    }

    /**
     * 取得访问豁免
     * 当前类的login signUp 方法不验证token
     */
    tokenExempts(): TokenExemptVO[] {
        const exes = super.tokenExempts();
        exes.push({ action: 'index' });
        exes.push({ action: 'version' });
        return exes;
    }
}