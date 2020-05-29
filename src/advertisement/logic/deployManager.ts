import { TaleCode, TokenExemptVO } from '../../common/tale/TaleDefine';
import AMLogic from './managerBaseLogic';
import AuthServer from '../service/authServer';

import * as _ from 'lodash';
import { think } from 'thinkjs';

export default class DeployManagerLogic extends AMLogic {

    /**
     * 取得访问豁免,
     * <br/>当前类的index方法不验证token
     */
    tokenExempts(): TokenExemptVO[] {
        const exes = super.tokenExempts();
        exes.push({ action: 'index' });

        return exes;
    }

}
