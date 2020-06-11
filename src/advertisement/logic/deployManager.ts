import { TaleCode, TokenExemptVO } from '../../common/tale/TaleDefine';
import AMLogic from './managerBaseLogic';

import * as _ from 'lodash';
import { think } from 'thinkjs';

export default class DeployManagerLogic extends AMLogic {
    /**
     * GET，
     * <br/>发布到正式环境
     */
    public async deployAction() {
        this.allowMethods = 'get';    // 只允许 GET 请求类型

    }

    /**
     * GET，
     * <br/>回滚用户操作
     */
    public async rollBackAction() {
        this.allowMethods = 'get';    // 只允许 GET 请求类型

    }

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
