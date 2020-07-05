/**
 * advertisement userModel
 * @module advertisement/model/user
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import MBModel from './managerBaseModel';
import { UserVO } from '../defines';
import Utils from '../utils';
import * as _ from 'lodash';
import * as crypto from 'crypto';

/**
 * 用户操作相关模型
 * @class userModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class UserModel extends MBModel {
    /**
     * 插入用户
     * @argument {UserVO} userVo 用户表对象;
     * @returns {Promise<string>} 用户表主键;
     */
    public async addVo(userVo: UserVO) {
        const md5 = crypto.createHash('md5');
        const password = md5.update(userVo.password).digest('hex');
        userVo.password = password;

        await this.add(userVo);
        return this.ID[0];

    }

    /**
     * 更新用户
     * @argument {string} id 用户表主键;
     * @argument {UserVO} userVo 用户表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateVo(id: string, userVo: UserVO) {
        if (!Utils.isEmptyObj(userVo)) {
            const password: string = userVo.password;

            if (!think.isEmpty(password)) {
                const md5 = crypto.createHash('md5');
                userVo.password = md5.update(password).digest('hex');

            } else {
                delete userVo.password;

            }
            return await this.where({ id }).update(userVo);

        }
        return 0;

    }

    /**
     * 查看详细信息
     * @argument {string} id 用户表主键;
     * @returns {Promise<UserVO>} 用户表对象;
     */
    public async getVo(id: string): Promise<UserVO> {
        const userVo = await this.where({ id }).find() as UserVO;

        delete userVo.password;
        return userVo;

    }

    /**
     * 根据帐号取得用户信息
     * @param name string
     */
    public async getByEmail(email: string): Promise<UserVO> {
        const userVo = await this.where({ email }).find() as UserVO;
        return userVo;

    }

    /**
     * 获取全部用户列表
     * @returns {Promise<UserVO[]>} 用户列表;
     */
    public async getList(): Promise<UserVO[]> {
        const userVoList = await this.select();

        return _.map(userVoList, (userVo) => {
            delete userVo.password;

            return userVo;

        });

    }

}