/**
 * Talefun framework 控制器基类
 * @module common/service/token
 * @see module:think.Service
 */
import { think } from 'thinkjs';
import { decode } from 'punycode';
import { TokenTradeVO, JwtVO, TokenVirifyStatus, TokenVirifyVO } from '../tale/TaleDefine';

const jwt = require('jsonwebtoken');
const TOKEN_SECRET = think.config("TLF_TokenSecret");
// const expiresIn = think.config("talefun_token_expiresIn");
const SESSION_EXPIRES_TIME = 1 * 24 * 60 * 60;  // 1天后过期
const FRESH_EXPIRES_TIME = 10 * 24 * 60 * 60;  // 10天后过期
export default class TokenService extends think.Service {
    /**
     * @description 创建token
     * @param {Object} userinfo 用户信息
     * @returns {string} 返回token字符串
     */
    public createToken(trateVO: TokenTradeVO): JwtVO {
        const sessionToken = jwt.sign(trateVO, TOKEN_SECRET, { expiresIn: SESSION_EXPIRES_TIME });
        const freshToken = jwt.sign(trateVO, TOKEN_SECRET, { expiresIn: FRESH_EXPIRES_TIME });
        return { sessionToken, freshToken };
    }

    /**
     * @description 验证票据
     * @param {string} token 用户请求token
     * @returns {object|boolean} 返回 错误或者解密过的token对像
     */
    public verifyToken(sessionToken: string): TokenVirifyVO {
        const verifyVO: TokenVirifyVO = {
            status: TokenVirifyStatus.Faild
        };

        if (think.isEmpty(sessionToken)) {
            return verifyVO;
        }
        try {
            const tradeVO: TokenTradeVO = jwt.verify(sessionToken, TOKEN_SECRET);
            const nt: number = new Date().getTime() / 1000;
            if (tradeVO.exp < nt) {// token已过期
                verifyVO.status = TokenVirifyStatus.Expired;
                return verifyVO;
            }
            verifyVO.status = TokenVirifyStatus.OK;
            verifyVO.tradeVO = tradeVO;
            return verifyVO;
        } catch (err) {
            // think.logger.error(err);
            verifyVO.status = TokenVirifyStatus.Expired;
            return verifyVO;
            // 票据验证失败,需要提示需要重新登录
        }
    }

    public decodeToken(token: string) {
        const de = jwt.decode(token);
        return de;
    }

    /**
     * 清理trateVO中的时间参数
     * @param trateVO TokenTradeVO
     */
    public clearTrateVO(trateVO: TokenTradeVO) {
        if (trateVO.iat) { delete trateVO.iat; }
        if (trateVO.exp) { delete trateVO.exp; }
        return trateVO;
    }

    /**
     * 检测并刷新jwt token
     * @param sessionToken string
     * @param freshToken string
     */
    public freshToken(sessionToken: string, freshToken: string) {
        let freshVO: TokenTradeVO;
        let sessVO: TokenTradeVO;
        try {
            freshVO = jwt.verify(freshToken, TOKEN_SECRET);
        } catch (err) {// 票据验证失败,需要提示需要重新登录
            return false;
        }
        try {
            sessVO = jwt.verify(sessionToken, TOKEN_SECRET);
        } catch (err) { // 票据验证失败,需要提示需要重新登录
            return false;
        }
        if (!freshVO || !sessVO) { return false; }
        const nt: number = new Date().getTime() / 1000;
        // console.log(accessToken, freshToken, accVO, freshVO, nt)

        if (freshVO.exp < nt) {// freahtoken已过期
            return false;
        }
        const trateVO = this.clearTrateVO(sessVO);
        return this.createToken(trateVO);
    }

}
