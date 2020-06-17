/**
 * CommonManager Controller module.
 * <br/>常规配置相关 api
 * @module advertisement/controller/CommonManager
 * @see advertisement/controller/commonManager;
 * @debugger
 */
import BaseController from '../../common/tale/BaseController';
import { TaleCode } from '../../common/tale/TaleDefine';

import AdTypeModel from '../model/adType';
import AdChannelModel from '../model/adChannel';
import AdChannelMapModel from '../model/adChannelMap';
import NativeTmplModel from '../model/nativeTmpl';
import BaseConfigModel from '../model/baseConfig';
import PackParamModel from '../model/PackParam';

import ModelServer from '../service/modelServer';

import Utils from '../utils';

import { think } from 'thinkjs';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

const rename = think.promisify(fs.rename, fs); // 通过 promisify 方法把 rename 方法包装成 Promise 接口

import {
    AdTypeVO, AdChannelVO, NativeTmplVO, BaseConfigVO, PackParamVO, FileVO
} from '../defines';

import {
    AdTypeListResVO,
    GetAdTypeReqVO, GetAdTypeResVO, CreateAdTypeReqVO, CreateAdTypeResVO, UpdateAdTypeReqVO, UpdateAdTypeResVO,
    AdChannelListResVO, GetAdChannelReqVO, GetAdChannelResVO, CreateAdChannelReqVO, CreateAdChannelResVO,
    UpdateAdChannelReqVO, UpdateAdChannelResVO, NativeTmplListResVO, CreateNativeTmplReqVO, CreateNativeTmplResVO,
    UpdateNativeTmplReqVO, UpdateNativeTmplResVO, BaseConfigListResVO, CreateBaseConfigReqVO,
    CreateBaseConfigResVO, UpdateBaseConfigReqVO, UpdateBaseConfigResVO, PackParamListResVO,
    CreatePackParamReqVO, CreatePackParamResVO, UpdatePackParamReqVO, UpdatePackParamResVO,
} from '../interface';

export default class CommonManagerController extends BaseController {
    /**
     * GET，
     * <br/>获取广告类型列表
     * @returns {AdTypeListResVO}
     * @debugger yes
     */
    public async adTypeListAction() {
        const ucId: string = this.ctx.state.user.id;
        const adTypeModel = this.taleModel('adType', 'advertisement') as AdTypeModel;

        const adTypeVoList = await adTypeModel.getList();

        const adTypeResVoList = _.map(adTypeVoList, (adTypeVo) => {
            // 删除不必要的字段
            delete adTypeVo.createAt;
            delete adTypeVo.updateAt;

            return adTypeVo;

        });
        return this.success(adTypeResVoList);

    }

    /**
     * <br/>获取广告类型
     * @argument {GetAdTypeReqVO}
     * @returns {GetAdTypeResVO}
     * @debugger yes
     */
    public async adTypeAction() {
        const ucId: string = this.ctx.state.user.id;
        const name: string = this.post('name');
        const adTypeModel = this.taleModel('adType', 'advertisement') as AdTypeModel;

        const adTypeVo = await adTypeModel.getByName(name);
        // 删除不必要的字段
        delete adTypeVo.createAt;
        delete adTypeVo.updateAt;

        return this.success(adTypeVo);

    }

    /**
     * <br/>创建广告类型
     * @argument {CreateAdTypeReqVO}
     * @returns {CreateAdTypeResVO}
     * @debugger yes
     */
    public async createAdTypeAction() {
        const ucId: string = this.ctx.state.user.id;
        const type: string = this.post('type');
        const name: string = this.post('name');
        const test: number = this.post('test');
        const active: number = this.post('active');
        const adTypeModel = this.taleModel('adType', 'advertisement') as AdTypeModel;

        const adTypeVo: AdTypeVO = {
            type, name, test, active,
        };
        await adTypeModel.addVo(adTypeVo);

        this.success('created');

    }

    /**
     * <br/>更新广告类型
     * @argument {UpdateAdTypeReqVO}
     * @returns {UpdateAdTypeResVO}
     * @debugger yes
     */
    public async updateAdTypeAction() {
        const ucId: string = this.ctx.state.user.id;
        const id: string = this.post('id');
        const name: string = this.post('name');
        const test: number = this.post('test');
        const active: number = this.post('active');
        const adTypeModel = this.taleModel('adType', 'advertisement') as AdTypeModel;

        const adTypeUpdateVo: AdTypeVO = {
            type: undefined, name, test, active
        };
        await adTypeModel.updateVo(id, adTypeUpdateVo);

        return this.success('updated');

    }

    /**
     * GET，
     * <br/>获取广告平台列表
     * @returns {AdChannelListResVO}
     * @debugger yes
     */
    public async adChannelListAction() {
        const ucId: string = this.ctx.state.user.id;
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const adChannelResVoList = await modelServer.getAdChannelList();
        return this.success(adChannelResVoList);

    }

    /**
     * <br/>获取广告平台
     * @argument {GetAdChannelReqVO}
     * @returns {GetAdChannelResVO}
     * @debugger yes
     */
    public async adChannelAction() {
        const ucId: string = this.ctx.state.user.id;
        const channel: string = this.post('channel');
        const modelServer = this.taleService('modelServer', 'advertisement') as ModelServer;

        const adChannelVo = await modelServer.getAdChannel(channel);
        return this.success(adChannelVo);

    }

    /**
     * <br/>创建广告平台
     * @argument {CreateAdChannelReqVO}
     * @returns {CreateAdChannelResVO}
     * @debugger yes
     */
    public async createAdChannelAction() {
        const ucId: string = this.ctx.state.user.id;
        const channel: string = this.post('channel');
        const key1: string = this.post('key1') || undefined;
        const key2: string = this.post('key2') || undefined;
        const key3: string = this.post('key3') || undefined;
        const test: number = this.post('test');
        const active: number = this.post('active');
        const adChannelModel = this.taleModel('adChannel', 'advertisement') as AdChannelModel;

        const adChannelVo: AdChannelVO = {
            channel, key1, key2, key3, test, active,
        };
        await adChannelModel.addVo(adChannelVo);

        this.success('created');

    }

    /**
     * <br/>更新广告平台
     * @argument {UpdateAdChannelReqVO}
     * @returns {UpdateAdChannelResVO}
     * @debugger yes
     */
    public async updateAdChannelAction() {
        const ucId: string = this.ctx.state.user.id;
        const id: string = this.post('id');
        const key1: string = this.post('key1');
        const key2: string = this.post('key2');
        const key3: string = this.post('key3');
        const adTypeIdList: string[] = this.post('adTypeIdList');
        const test: number = this.post('test');
        const active: number = this.post('active');
        const adChannelModel = this.taleModel('adChannel', 'advertisement') as AdChannelModel;
        const adChannelMapModel = this.taleModel('adChannelMap', 'advertisement') as AdChannelMapModel;

        try {
            // 如果存在 adTypeIdList，则表示只更新 广告平台下的广告类型
            if (adTypeIdList) {
                const rows = (await adChannelMapModel.updateList(id, adTypeIdList)).length;

                if (rows !== adTypeIdList.length) {
                    throw new Error('没有全部更新！！！');
                }

            } else {
                const adChannelUpdateVo: AdChannelVO = {
                    channel: undefined, key1, key2, key3, test, active
                };
                await adChannelModel.updateVo(id, adChannelUpdateVo);

            }
            return this.success('updated');

        } catch (e) {
            think.logger.debug(e);
            this.fail(TaleCode.DBFaild, 'update fail!!!');
        }

    }

    /**
     * GET，
     * <br/>获取 native 模板列表
     * @returns {NativeTmplListResVO}
     * @debugger yes
     */
    public async nativeTmplListAction() {
        const ucId: string = this.ctx.state.user.id;
        const nativeTmplModel = this.taleModel('nativeTmpl', 'advertisement') as NativeTmplModel;

        const nativeTmplVoList = await nativeTmplModel.getList();

        return this.success(nativeTmplVoList);
    }

    /**
     * <br/>上传 native 模板预览图
     * @debugger yes
     */
    public async uploadPreviewAction() {
        think.logger.debug(`files: ${JSON.stringify(this.file())}`);
        think.logger.debug(`posts: ${JSON.stringify(this.post())}`);
        const file = this.file('file');
        think.logger.debug(`file: ${JSON.stringify(file)}`);

        if (!file || !file.type.startsWith('image') || !file.name) {
            return this.fail(10, '上传失败');
        }

        const fireName: string = file.name;

        think.logger.debug(`file: ${fireName}`);
        think.logger.debug(`file: ${file.path}`);

        const CTR_ENV = process.env.CTR_ENV;
        think.logger.debug(`CTR_ENV: ${CTR_ENV}`);

        const domain: string = think.config(CTR_ENV + '_domain');

        think.logger.debug(`domain: ${domain}`);

        const PreviewDir = path.resolve(think.ROOT_PATH, '..', think.config('PreviewDir'));
        const filepath = path.resolve(PreviewDir, fireName);

        await rename(file.path, filepath);

        const preview = domain + 'image/preview/' + fireName;
        this.success({ preview });
    }

    /**
     * <br/>创建 native 模板
     * @argument {CreateNativeTmplReqVO}
     * @returns {CreateNativeTmplResVO}
     * @debugger yes
     */
    public async createNativeTmplAction() {
        const ucId: string = this.ctx.state.user.id;
        const file = this.file('file') as FileVO;    // 上传的文件
        const key: string = this.post('key');
        const test: number = this.post('test');
        const active: number = this.post('active');
        const nativeTmplModel = this.taleModel('nativeTmpl', 'advertisement') as NativeTmplModel;

        // 服务器环境。本地服务器，管理服务器或者分发服务器
        const CTR_ENV = process.env.CTR_ENV;
        // 服务器域名 -暂时，后期考虑加上 CDN
        const domain: string = think.config(CTR_ENV + '_domain');
        // 上传图片保存目录
        const PreviewDir = think.config('PreviewDir');

        // 模板图片保存在上传图片保存目录的子目录，目录名为 key
        const nativeTmplDir = path.resolve(PreviewDir, key);
        // 不存在这创建
        await Utils.thenCreateDir(nativeTmplDir);
        // 模板图片名
        const fileName = path.basename(file.path);
        // 模板图片地址
        const filepath = path.resolve(nativeTmplDir, fileName);
        // 把图片从暂存中 move 到图片目录
        await rename(file.path, filepath);

        // 预览图地址
        const preview = new URL(filepath, domain).toString();
        // native 模板表对象
        const nativeTmplVo: NativeTmplVO = {
            key, preview, test, active,
        };
        await nativeTmplModel.addVo(nativeTmplVo);

        this.success('created');

    }

    /**
     * <br/>更新 native 模板
     * @argument {UpdateNativeTmplReqVO}
     * @returns {UpdateNativeTmplResVO}
     * @debugger yes
     */
    public async updateNativeTmplAction() {
        const ucId: string = this.ctx.state.user.id;
        const file = this.file('file') as FileVO;    // 上传的文件
        const id: string = this.post('id');
        const test: number = this.post('test');
        const active: number = this.post('active');
        const nativeTmplModel = this.taleModel('nativeTmpl', 'advertisement') as NativeTmplModel;

        // 当前 native 模板的 key
        const { key } = await nativeTmplModel.getVo(id, undefined, undefined);

        // 服务器环境。本地服务器，管理服务器或者分发服务器
        const CTR_ENV = process.env.CTR_ENV;
        // 服务器域名 -暂时，后期考虑加上 CDN
        const domain: string = think.config(CTR_ENV + '_domain');
        // 上传图片保存目录
        const PreviewDir = think.config('PreviewDir');

        // 模板图片保存在上传图片保存目录的子目录，目录名为 key
        const nativeTmplDir = path.resolve(PreviewDir, key);
        // 不存在这创建
        await Utils.thenCreateDir(nativeTmplDir);
        // 模板图片名
        const fileName = path.basename(file.path);
        // 模板图片地址
        const filepath = path.resolve(nativeTmplDir, fileName);
        // 把图片从暂存中 move 到图片目录
        await rename(file.path, filepath);

        // 预览图地址
        const preview = new URL(filepath, domain).toString();

        const nativeTmplUpdateVo: NativeTmplVO = {
            key: undefined, preview, test, active,
        };
        await nativeTmplModel.updateVo(id, nativeTmplUpdateVo);

        return this.success('updated');

    }

    /**
     * GET，
     * <br/>获取基础常量列表
     * @returns {BaseConfigListResVO}
     * @debugger yes
     */
    public async baseConfigListAction() {
        const ucId: string = this.ctx.state.user.id;
        const baseConfigModel = this.taleModel('baseConfig', 'advertisement') as BaseConfigModel;
        const baseConfigVoList = await baseConfigModel.getList(undefined, undefined);

        const baseConfigResVoList = _.map(baseConfigVoList, (baseConfigVo) => {
            // 删除不必要的字段
            delete baseConfigVo.createAt;
            delete baseConfigVo.updateAt;

            return baseConfigVo;

        });
        return this.success(baseConfigResVoList);

    }

    /**
     * <br/>创建基础常量
     * @argument {CreateBaseConfigReqVO}
     * @returns {CreateBaseConfigResVO}
     * @debugger yes
     */
    public async createBaseConfigAction() {
        const ucId: string = this.ctx.state.user.id;
        const key: string = this.post('key');
        const value: string = this.post('value');
        const description: string = this.post('description');
        const test: number = this.post('test');
        const active: number = this.post('active');
        const baseConfigModel = this.taleModel('baseConfig', 'advertisement') as BaseConfigModel;

        const baseConfigVo: BaseConfigVO = {
            key, value, description, test, active,
        };
        await baseConfigModel.addVo(baseConfigVo);

        this.success('created');

    }

    /**
     * <br/>更新基础常量
     * @argument {UpdateBaseConfigReqVO}
     * @returns {UpdateBaseConfigResVO}
     * @debugger yes
     */
    public async updateBaseConfigAction() {
        const ucId: string = this.ctx.state.user.id;
        const id: string = this.post('id');
        const value: string = this.post('value');
        const description: string = this.post('description');
        const test: number = this.post('test');
        const active: number = this.post('active');
        const baseConfigModel = this.taleModel('baseConfig', 'advertisement') as BaseConfigModel;

        const baseConfigUpdateVo: BaseConfigVO = {
            key: undefined, value, description, test, active
        };
        await baseConfigModel.updateVo(id, baseConfigUpdateVo);

        return this.success('updated');

    }

    /**
     * GET，
     * <br/>获取打包参数列表
     * @returns {PackParamListResVO}
     * @debugger yes
     */
    public async packParamListAction() {
        const ucId: string = this.ctx.state.user.id;
        const packParamModel = this.taleModel('packParam', 'advertisement') as PackParamModel;

        const packParamVoList = await packParamModel.getList(undefined, undefined);

        const packParamResVoList = _.map(packParamVoList, (packParamVo) => {
            // 删除不必要的字段
            delete packParamVo.createAt;
            delete packParamVo.updateAt;

            return packParamVo;

        });
        return this.success(packParamResVoList);

    }

    /**
     * <br/>创建打包参数
     * @argument {CreatePackParamReqVO}
     * @returns {CreatePackParamResVO}
     * @debugger yes
     */
    public async createPackParamAction() {
        const ucId: string = this.ctx.state.user.id;
        const key: string = this.post('key');
        const description: string = this.post('description');
        const test: number = this.post('test');
        const active: number = this.post('active');
        const packParamModel = this.taleModel('packParam', 'advertisement') as PackParamModel;

        const packParamVo: PackParamVO = {
            key, description, test, active,
        };
        await packParamModel.addVo(packParamVo);

        this.success('created');

    }

    /**
     * <br/>更新打包参数
     * @argument {UpdatePackParamReqVO}
     * @returns {UpdatePackParamResVO}
     * @debugger yes
     */
    public async updatePackParamAction() {
        const ucId: string = this.ctx.state.user.id;
        const id: string = this.post('id');
        const description: string = this.post('description');
        const test: number = this.post('test');
        const active: number = this.post('active');
        const packParamModel = this.taleModel('packParam', 'advertisement') as PackParamModel;

        const packParamUpdateVo: PackParamVO = {
            key: undefined, description, test, active
        };
        await packParamModel.updateVo(id, packParamUpdateVo);

        return this.success('updated');

    }

}