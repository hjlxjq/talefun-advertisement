import { think, Context } from 'thinkjs';
import * as _ from 'lodash';

import BaseLogic from '../../common/tale/BaseLogic';
import { TaleCode, TokenVirifyStatus } from '../../common/tale/TaleDefine';

import TokenService from '../../common/service/token';
import UserModel from '../model/user';

import { CusContext } from '../defines';

export default class ManagerBaseLogic extends BaseLogic {
    public ctx: CusContext;
    /**
     * 检测token 验证格式和有效期
     */
    public async verifyToken() {
        const tokenService = think.service('token') as TokenService;
        const userModel = this.taleModel('user', 'advertisement') as UserModel;

        const token: string = await this.header('sessiontoken');
        const tokenVerifyVO = tokenService.verifyToken(token);

        switch (tokenVerifyVO.status) {

            case TokenVirifyStatus.Faild:
                this.fail(TaleCode.UserNotLogin, 'token校验失败');
                return false;

            case TokenVirifyStatus.Expired:
                this.fail(TaleCode.SessionExpired, 'token过期, 重新登录');
                return false;

            default:
                const ucId = tokenVerifyVO.tradeVO.userId;    // 透传 token解析的数据

                const userVo = await userModel.getUser(ucId);

                if (think.isEmpty(userVo)) {
                    return this.fail(10, '用户不存在！！！');
                }

                if (userVo.active !== 1) {
                    return this.fail(10, '该用户已被禁用！！！');
                }

                this.ctx.state.user = userVo;
                this.ctx.state.userId = ucId;
                return true;
        }
    }

}
