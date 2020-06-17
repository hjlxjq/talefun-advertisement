/**
 * UserController module.
 * @module user/controller/user
 * @see user/controller/user;
 * @debugger
 */
import { think } from 'thinkjs';
import TokenService from '../../common/service/token';
import BaseController from '../../common/tale/BaseController';
import { TokenTradeVO, JwtVO, TaleCode } from '../../common/tale/TaleDefine';

import UserModel from '../model/user';
import UserAuthModel from '../model/userAuth';
import ProductGroupAuthModel from '../model/productGroupAuth';
import ProductAuthModel from '../model/productAuth';

import AuthServer from '../service/authServer';

import * as crypto from 'crypto';
import * as _ from 'lodash';
import * as Bluebird from 'bluebird';

import {
    UserVO, UserAuthVO, ProductGroupAuthVO, ProductAuthVO, UserResVO
} from '../defines';

import {
    CreateUserReqVO, CreateUserResVO, UpdateUserReqVO, UpdateUserResVO, ResetPasswordReqVO, ResetPasswordResVO,
    UserListResVO, UserAuthReqVO, UserAuthResVO, UpdateUserAuthReqVO, UpdateUserAuthResVO,
    LoginReqVO, LoginResVO, UserListInProductGroupReqVO, UserListInProductGroupResVO,
    UserListInProductReqVO, UserListInProductResVO, CreateUserToProductGroupReqVO, CreateUserToProductGroupResVO,
    CreateUserToProductReqVO, CreateUserToProductResVO, UpdateUserAuthInProductReqVO, UpdateUserAuthInProductResVO,
    DeleteUserFromProductGroupReqVO, DeleteUserFromProductGroupResVO, DeleteUserFromProductReqVO,
    DeleteUserFromProductResVO, UpdateUserAuthInProductGroupReqVO, UpdateUserAuthInProductGroupResVO,
    DisableUserReqVO, DisableUserResVO, UserAuthInProductGroupReqVO, UserAuthInProductGroupResVO,
    UserAuthInProductReqVO, UserAuthInProductResVO,
} from '../interface';

/**
 * 用户操作和用户权限相关控制器
 * @class UserController
 * @classdesc 提供用户相关登陆 注册 取值等操作方法 提供jsonwebtoken的具体实现
 * @extends @link:common/tale/BaseController
 * @author jianlong <jianlong@talefun.com>
 * @debugger
 */
export default class UserController extends BaseController {
    /**
     * <br/>创建管理员--后台接口
     * @argument {CreateUserReqVO}
     * @returns {CreateUserResVO}
     */
    public async createAdMinAction() {
        const ucId: string = this.ctx.state.userId;
        const name: string = this.post('name');
        // const avatar: string = this.post('avatar');
        // const telephone: string = this.post('telephone');
        const email: string = this.post('email');
        const password: string = this.post('password');
        const active: number = this.post('active');
        const userAuth: UserAuthVO = this.post('userAuth');
        const userModel = this.taleModel('user', 'advertisement') as UserModel;
        const userAuthModel = this.taleModel('userAuth', 'advertisement') as UserAuthModel;

        const userVo: UserVO = {
            email, name, password, active,
        };
        const userId = await userModel.addVo(userVo);
        think.logger.debug(`userId: ${userId}`);

        const {
            editComConf, viewComConf, createProductGroup, master
        } = userAuth;

        const userAuthVo: UserAuthVO = {
            editComConf, viewComConf, createProductGroup, master,
            userId,
        };
        await userAuthModel.addVo(userAuthVo);

        return this.success('created');
    }

    /**
     * <br/>创建用户--只允许管理员操作
     * @argument {CreateUserReqVO}
     * @returns {CreateUserResVO}
     */
    public async createUserAction() {
        const ucId: string = this.ctx.state.userId;
        const name: string = this.post('name');
        // const avatar: string = this.post('avatar');
        // const telephone: string = this.post('telephone');
        const email: string = this.post('email');
        const password: string = this.post('password');
        const active: number = this.post('active');
        const userAuth: UserAuthVO = this.post('userAuth');
        const userModel = this.taleModel('user', 'advertisement') as UserModel;
        const userAuthModel = this.taleModel('userAuth', 'advertisement') as UserAuthModel;

        // 先创建用户
        const userVo: UserVO = {
            email, name, password, active,
        };
        const userId = await userModel.addVo(userVo);

        // 再创建用户权限
        const {
            editComConf, viewComConf, createProductGroup, master
        } = userAuth;

        const userAuthVo: UserAuthVO = {
            editComConf, viewComConf, createProductGroup, master, userId,
        };
        await userAuthModel.addVo(userAuthVo);

        return this.success('created');

    }

    /**
     * <br/>修改用户密码
     * @argument {UpdateUserReqVO}
     * @returns {UpdateUserResVO}
     */
    public async updateUserAction() {
        const ucId: string = this.ctx.state.userId;
        const id: string = this.post('id');
        const password: string = this.post('password');
        const userModel = this.taleModel('user', 'advertisement') as UserModel;

        const userVo: UserVO = {
            password, email: undefined, name: undefined, active: undefined,
        };
        await userModel.updateVo(id, userVo);

        return this.success('updated');

    }

    /**
     * <br/>禁用或者解禁用户--只允许管理员操作
     * @argument {DisableUserReqVO}
     * @returns {DisableUserResVO}
     */
    public async disableUserAction() {
        const ucId: string = this.ctx.state.userId;
        const id: string = this.post('id');
        const active: number = this.post('active');
        const userModel = this.taleModel('user', 'advertisement') as UserModel;

        // 更新
        const userVo: UserVO = {
            email: undefined, name: undefined, password: undefined, active
        };
        await userModel.updateVo(id, userVo);

        // 根据开关 active 返回
        if (active === 1) {
            return this.success('enabled');

        } else {
            return this.success('disabled');

        }

    }

    /**
     * <br/>重置密码--只允许管理员操作
     * @argument {ResetPasswordReqVO}
     * @returns {ResetPasswordResVO}
     */
    public async resetPasswordAction() {
        const ucId: string = this.ctx.state.userId;
        const password: string = this.post('password');
        const id: string = this.post('id');
        const userModel = this.taleModel('user', 'advertisement') as UserModel;

        const userVo: UserVO = {
            email: undefined, name: undefined, active: undefined,
            password
        };
        await userModel.updateVo(id, userVo);

        return this.success('reseted');

    }

    /**
     * <br/>获取用户列表
     * @returns {UserListResVO}
     */
    public async userListAction() {
        const ucId: string = this.ctx.state.userId;    // 获取已登录用的 userId
        const userModel = this.taleModel('user', 'advertisement') as UserModel;
        const userAuthModel = this.taleModel('userAuth', 'advertisement') as UserAuthModel;

        const userVoList = await userModel.getList();

        // 返回用户信息列表
        const userResVoList = await Bluebird.map(userVoList, async (userVo) => {
            const userAuthVo = await userAuthModel.getVo(userVo.id);
            const userResVo: UserResVO = _.defaults({
                userAuth: userAuthVo, productAuth: undefined, productGroupAuth: undefined
            }, userVo);

            // 删除不必要的字段
            delete userResVo.createAt;
            delete userResVo.updateAt;

            return userResVo;

        });

        return this.success(userResVoList);

    }

    /**
     * <br/>获取用户权限--只允许管理员操作
     * @argument {UserAuthReqVO}
     * @returns {UserAuthResVO}
     */
    public async userAuthAction() {
        const ucId: string = this.ctx.state.userId;    // 获取已登录用的 userId
        const userId: string = this.post('id');
        const userAuthModel = this.taleModel('userAuth', 'advertisement') as UserAuthModel;

        const userAuthVo = await userAuthModel.getVo(userId);

        return this.success(userAuthVo);

    }

    /**
     * <br/>获取用户在项目组下权限--只允许管理员和项目管理员操作
     * @argument {UserAuthInProductGroupReqVO}
     * @returns {UserAuthInProductGroupResVO}
     */
    public async userAuthInProductGroupAction() {
        const ucId: string = this.ctx.state.userId;    // 获取已登录用的 userId
        const productGroupId: string = this.post('id');
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const productGroupAuth = await authServer.fetchProductGroupAuth(ucId, productGroupId);

        return this.success(productGroupAuth);

    }

    /**
     * <br/>获取用户在应用下权限--只允许管理员和项目管理员操作
     * @argument {UserAuthInProductGroupReqVO}
     * @returns {UserAuthInProductGroupResVO}
     */
    public async userAuthInProductAction() {
        const ucId: string = this.ctx.state.userId;    // 获取已登录用的 userId
        const productId: string = this.post('id');
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const productAuth = await authServer.fetchProductAuth(ucId, productId);

        return this.success(productAuth);

    }

    /**
     * <br/>更新用户权限--只允许管理员操作
     * @argument {UpdateUserAuthReqVO}
     * @returns {UpdateUserAuthResVO}
     */
    public async updateUserAuthAction() {
        const ucId: string = this.ctx.state.userId;    // 获取已登录用的 userId
        const userId: string = this.post('id');
        const editComConf: number = this.post('editComConf');
        const viewComConf: number = this.post('viewComConf');
        const createProductGroup: number = this.post('createProductGroup');
        const master: number = this.post('master');
        const userAuthModel = this.taleModel('userAuth', 'advertisement') as UserAuthModel;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const userAuthVo: UserAuthVO = {
            editComConf, viewComConf, createProductGroup, master, userId: undefined
        };

        // 更新数据库，并删除缓存中的所有权限，后续操作再从数据库更新权限到 redis 缓存
        await Promise.all([
            userAuthModel.updateVo(userId, userAuthVo),
            authServer.deleteAllAuthFromRedis(userId)
        ]);

        return this.success('updated');

    }

    /**
     * 根据用户UID创建token,
     * <br/>token将分发给前端
     * @argument {string} userId 用户id
     */
    private createToken(userId: string): JwtVO {
        const signture: TokenTradeVO = { userId };

        const tokenService = think.service('token') as TokenService;
        return tokenService.createToken(signture);

    }

    /**
     * 登陆,
     * <br/>登陆成功后会返回token字段，后续的每一次操作均需要将此token值传递到服务端。用于校验用户登陆状态
     * @argument {LoginReqVO}
     * @returns {LoginResVO}
     * @debugger yes
     *
     */
    public async loginAction() {
        const email = this.post('email');
        // const verifiCode = this.post('verifiCode') || '123';
        const userModel = this.taleModel('user', 'advertisement') as UserModel;
        const userAuthModel = this.taleModel('userAuth', 'advertisement') as UserAuthModel;

        // 用户信息
        const userVo = await userModel.getByEmail(email);
        // 用户权限信息
        const userAuthVo = await userAuthModel.getVo(userVo.id);

        const jwt = this.createToken(userVo.id);
        this.header('sessiontoken', jwt.sessionToken);
        this.header('Access-Control-Expose-Headers', ['sessionToken']); // 允许跨站接收的token
        // const isRightCode = await verifiCodeServer.verification(verifiCode, userId);
        // if (!isRightCode) {
        //     gobj.raise(10, '验证码错误！！！');
        // }
        // 删除密码，不返回前端
        delete userVo.password;

        this.success({ user: userVo, userAuth: userAuthVo });

    }

    /**
     * <br/>获取项目组下用户列表---管理员或者项目组管理员才可以
     * @argument {UserListInProductGroupReqVO}
     * @returns {UserListInProductGroupResVO}
     */
    public async userListInProductGroupAction() {
        const productGroupAuthModel = this.taleModel('productGroupAuth', 'advertisement') as ProductGroupAuthModel;
        const userModel = this.taleModel('user', 'advertisement') as UserModel;
        const productGroupId: string = this.post('id');

        const productGroupAuthVoList = await productGroupAuthModel.getList(productGroupId);

        // 返回用户信息列表
        const userResVoList = await Bluebird.map(productGroupAuthVoList, async (productGroupAuthVo) => {
            const userVo = await userModel.getUser(productGroupAuthVo.userId);
            // 返回用户信息
            const userResVo: UserResVO = _.assign({
                userAuth: undefined, productGroupAuth: undefined, productAuth: undefined
            }, userVo);

            userResVo.productGroupAuth = _.clone(productGroupAuthVo);

            // 删除不必要的字段
            delete userResVo.productGroupAuth.id;
            delete userResVo.productGroupAuth.userId;
            delete userResVo.productGroupAuth.productGroupId;
            delete userResVo.productGroupAuth.createAt;
            delete userResVo.updateAt;

            return userResVo;

        });

        return this.success(userResVoList);

    }

    /**
     * <br/>获取应用下用户列表---管理员或者项目组管理员
     * @argument {UserListInProductReqVO}
     * @returns {UserListInProductResVO}
     */
    public async userListInProductAction() {
        const productAuthModel = this.taleModel('productAuth', 'advertisement') as ProductAuthModel;
        const userModel = this.taleModel('user', 'advertisement') as UserModel;
        const productId: string = this.post('id');

        const productAuthVoList = await productAuthModel.getList(productId);

        // 返回用户信息列表
        const userResVoList = await Bluebird.map(productAuthVoList, async (productAuthVo) => {
            const userVo = await userModel.getUser(productAuthVo.userId);
            // 返回用户信息
            const userResVo: UserResVO = _.assign({
                userAuth: undefined, productGroupAuth: undefined, productAuth: undefined
            }, userVo);

            userResVo.productAuth = _.clone(productAuthVo);

            // 删除不必要的字段
            delete userResVo.productAuth.id;
            delete userResVo.productAuth.userId;
            delete userResVo.productAuth.productId;
            delete userResVo.productAuth.createAt;
            delete userResVo.productAuth.updateAt;

            return userResVo;

        });

        return this.success(userResVoList);

    }

    /**
     * <br/>项目组创建成员---管理员或者项目组管理员
     * @argument {CreateUserToProductGroupReqVO}
     * @returns {CreateUserToProductGroupResVO}
     */
    public async createUserToProductGroupAction() {
        const ucId: string = this.ctx.state.userId;    // 获取已登录用的 userId
        const productGroupId: string = this.post('id');
        const userId: string = this.post('userId');
        const editAd: number = this.post('editAd');
        const viewAd: number = this.post('viewAd');
        const editGameConfig: number = this.post('editGameConfig');
        const viewGameConfig: number = this.post('viewGameConfig');
        const editPurchase: number = this.post('editPurchase');
        const viewPurchase: number = this.post('viewPurchase');
        const createProduct: number = this.post('createProduct');
        const editProduct: number = this.post('editProduct');
        const master: number = this.post('master');
        const productGroupAuthModel = this.taleModel('productGroupAuth', 'advertisement') as ProductGroupAuthModel;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const productGroupAuthVo: ProductGroupAuthVO = {
            productGroupId, userId, editAd, viewAd, editGameConfig, viewGameConfig,
            editPurchase, viewPurchase, editProduct, createProduct, master
        };
        await productGroupAuthModel.addVo(productGroupAuthVo);

        // 删除缓存数据
        const success = await authServer.deleteAllAuthFromRedis(userId);

        if (success === true) {
            return this.success('created');

        }

        this.fail(TaleCode.DBFaild, 'create fail!!!');

    }

    /**
     * <br/>应用创建成员---管理员或者项目组管理员
     * @argument {CreateUserToProductReqVO}
     * @returns {CreateUserToProductResVO}
     */
    public async createUserToProductAction() {
        const ucId: string = this.ctx.state.userId;    // 获取已登录用户的 userId
        const productId: string = this.post('id');
        const userId: string = this.post('userId');
        const editAd: number = this.post('editAd');
        const viewAd: number = this.post('viewAd');
        const editGameConfig: number = this.post('editGameConfig');
        const viewGameConfig: number = this.post('viewGameConfig');
        const editPurchase: number = this.post('editPurchase');
        const viewPurchase: number = this.post('viewPurchase');
        const editProduct: number = this.post('editProduct');
        const master: number = this.post('master');
        const productAuthModel = this.taleModel('productAuth', 'advertisement') as ProductAuthModel;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const productAuthVo: ProductAuthVO = {
            productId, userId, master,
            editAd, viewAd, editGameConfig, viewGameConfig, editPurchase, viewPurchase, editProduct
        };
        // 数据库中创建，并删除缓存中的所有权限，后续操作再从数据库更新权限到 redis 缓存
        await Promise.all([
            productAuthModel.addVo(productAuthVo),
            authServer.deleteProductAuthFromRedis(userId, productId)
        ]);

        return this.success('created');

    }

    /**
     * <br/>更新应用成员权限---管理员或者项目组管理员
     * @argument {UpdateUserAuthInProductReqVO}
     * @returns {UpdateUserAuthInProductReqVO}
     */
    public async updateUserAuthInProductAction() {
        const ucId: string = this.ctx.state.userId;    // 获取已登录用的 userId
        const productId: string = this.post('id');
        const userId: string = this.post('userId');
        const editAd: number = this.post('editAd');
        const viewAd: number = this.post('viewAd');
        const editGameConfig: number = this.post('editGameConfig');
        const viewGameConfig: number = this.post('viewGameConfig');
        const editPurchase: number = this.post('editPurchase');
        const viewPurchase: number = this.post('viewPurchase');
        const editProduct: number = this.post('editProduct');
        const master: number = this.post('master');

        const productAuthModel = this.taleModel('productAuth', 'advertisement') as ProductAuthModel;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const productAuthVo: ProductAuthVO = {
            productId: undefined, userId: undefined, master,
            editAd, viewAd, editGameConfig, viewGameConfig, editPurchase, viewPurchase, editProduct
        };

        // 更新数据库，并删除缓存中的所有权限，后续操作再从数据库更新权限到 redis 缓存
        await Promise.all([
            productAuthModel.updateVo(productId, userId, productAuthVo),
            authServer.deleteProductAuthFromRedis(userId, productId)
        ]);

        return this.success('updated');

    }

    /**
     * <br/>更新项目组成员权限---管理员或者项目组管理员
     * @argument {UpdateUserAuthInProductGroupReqVO}
     * @returns {UpdateUserAuthInProductGroupReqVO}
     */
    public async updateUserAuthInProductGroupAction() {
        const ucId: string = this.ctx.state.userId;    // 获取已登录用的 userId
        const productGroupId: string = this.post('id');
        const userId: string = this.post('userId');
        const editAd: number = this.post('editAd');
        const viewAd: number = this.post('viewAd');
        const editGameConfig: number = this.post('editGameConfig');
        const viewGameConfig: number = this.post('viewGameConfig');
        const editPurchase: number = this.post('editPurchase');
        const viewPurchase: number = this.post('viewPurchase');
        const createProduct: number = this.post('createProduct');
        const editProduct: number = this.post('editProduct');
        const master: number = this.post('master');
        const productGroupAuthModel = this.taleModel('productGroupAuth', 'advertisement') as ProductGroupAuthModel;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        const productGroupAuthVo: ProductGroupAuthVO = {
            productGroupId: undefined, userId: undefined,
            editAd, viewAd, editGameConfig, viewGameConfig, editPurchase,
            viewPurchase, editProduct, createProduct, master
        };

        // 更新数据库，并删除缓存中的所有权限，后续操作再从数据库更新权限到 redis 缓存
        await Promise.all([
            productGroupAuthModel.updateVo(productGroupId, userId, productGroupAuthVo),
            authServer.deleteAllAuthFromRedis(userId)
        ]);

        return this.success('updated');

    }

    /**
     * <br/>删除应用下成员---管理员或者项目组管理员
     * @argument {DeleteUserFromProductReqVO}
     * @returns {DeleteUserFromProductReqVO}
     */
    public async deleteUserFromProductAction() {
        const ucId: string = this.ctx.state.userId;    // 获取已登录用的 userId
        const productId: string = this.post('id');
        const userId: string = this.post('userId');
        const productAuthModel = this.taleModel('productAuth', 'advertisement') as ProductAuthModel;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        // 删除数据库数据，并删除缓存中的所有权限
        await Promise.all([
            productAuthModel.delProductAuth(productId, userId),
            authServer.deleteProductAuthFromRedis(userId, productId)
        ]);

        return this.success('deleted');

    }

    /**
     * <br/>删除项目组下成员---管理员或者项目组管理员
     * @argument {DeleteUserFromProductGroupReqVO}
     * @returns {DeleteUserFromProductGroupReqVO}
     */
    public async deleteUserFromProductGroupAction() {
        const ucId: string = this.ctx.state.userId;    // 获取已登录用的 userId
        const productGroupId: string = this.post('id');
        const userId: string = this.post('userId');
        const productGroupAuthModel = this.taleModel('productGroupAuth', 'advertisement') as ProductGroupAuthModel;
        const authServer = this.taleService('authServer', 'advertisement') as AuthServer;

        // 删除数据库数据，并删除缓存中的所有权限
        await Promise.all([
            productGroupAuthModel.delVo(productGroupId, userId),
            authServer.deleteAllAuthFromRedis(userId)
        ]);

        return this.success('deleted');

    }

}
