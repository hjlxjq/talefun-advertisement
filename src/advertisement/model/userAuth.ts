/**
 * advertisement userAuthModel
 * @module advertisement/model/userAuth
 * @see module:../../common/tale/BaseModel
 */
import { think } from 'thinkjs';
import * as _ from 'lodash';

import MBModel from './managerBaseModel';
import { UserAuthVO } from '../defines';
import Utils from '../utils';

/**
 * 用户权限操作相关模型
 * @class userAuthModel
 * @extends @link:advertisement/model/managerBaseModel
 * @author jianlong <jianlong@talefun.com>
 */
export default class UserAuthModel extends MBModel {

    /**
     * 插入用户权限
     * @argument {UserAuthVO} userAuthVo 用户权限表对象;
     * @returns {Promise<string>} 用户权限表主键;
     */
    public async addUserAuth(userAuthVo: UserAuthVO): Promise<string> {

        await this.add(userAuthVo);
        return this.ID[0];
    }

    /**
     * 更新用户权限
     * @argument {string} userId 用户表 id;
     * @argument {UserAuthVO} userAuthVo 用户权限表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateUserAuth(userId: string, userAuthVo: UserAuthVO) {
        if (!_.isEmpty(userAuthVo)) {
            return await this.where({ userId }).update(userAuthVo);
        }
        return 0;
    }

    /**
     * 查看详细信息
     * @argument {string} id 用户表 id;
     * @returns {Promise<UserAuthVO>} 用户权限表对象;
     */
    public async getUserAuth(userId: string) {
        const userAuthVo = await this.where({ userId }).find() as UserAuthVO;
        return _.omit(userAuthVo, ['id', 'userId', 'createAt', 'updateAt']);
    }
}