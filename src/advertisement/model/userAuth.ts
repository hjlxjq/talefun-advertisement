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
    public async addVo(userAuthVo: UserAuthVO): Promise<string> {
        await this.add(userAuthVo);
        return this.ID[0];

    }

    /**
     * 更新用户权限
     * @argument {string} userId 用户表主键;
     * @argument {UserAuthVO} userAuthVo 用户权限表对象;
     * @returns {Promise<number>} 返回影响的行数
     */
    public async updateVo(userId: string, userAuthVo: UserAuthVO) {
        if (!Utils.isEmptyObj(userAuthVo)) {
            return await this.where({ userId }).update(userAuthVo);

        }
        return 0;

    }

    /**
     * 查看用户权限
     * @argument {string} id 用户表主键;
     * @returns {Promise<UserAuthVO>} 用户权限表对象;
     */
    public async getVo(userId: string) {
        const userAuthVo = await this.where({ userId }).find() as UserAuthVO;

        // 删除不必要的字段
        delete userAuthVo.id;
        delete userAuthVo.userId;
        delete userAuthVo.createAt;
        delete userAuthVo.updateAt;

        return userAuthVo;

    }

}