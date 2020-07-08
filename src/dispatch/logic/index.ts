import BaseLogic from '../../common/tale/BaseLogic';
import { TokenExemptVO } from '../../common/tale/TaleDefine';
import * as _ from 'lodash';

export default class WebhookLogic extends BaseLogic {
    /**
     * 取得访问豁免
     * 当前类的index方法不验证token
     */
    tokenExempts(): TokenExemptVO[] {
        const exes = super.tokenExempts();

        exes.push({ action: '/' });
        exes.push({ action: 'adInfo' });
        exes.push({ action: 'acig' });
        exes.push({ action: 'adControlInfo' });
        exes.push({ action: ' instantAdInfo' });
        exes.push({ action: 'configInfo' });
        exes.push({ action: 'getIPAdress' });
        exes.push({ action: 'getClientIp' });

        return exes;

    }
}