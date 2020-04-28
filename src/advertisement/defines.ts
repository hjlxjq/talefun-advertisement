/**
 * advertisement Model
 * <br/>所有的表结构，表结构所有字段全部必须（包括问号字段）
 */
import * as Redis from 'ioredis';
import { Context } from 'thinkjs';

/**
 * base
 */
export interface BaseVO {
    id?: string;    // 主键, 唯一 id
    createAt?: string;    // 创建时间
    updateAt?: string;    // 修改时间
}

/**
 * *********************************************************************************************************************
 * 常规配置
 * *********************************************************************************************************************
 */

/**
 * 通用广告类型表基本字段
 */
export interface AdTypeVO extends BaseVO {
    type: string;    // 类型名称
    name: string;    // 显示名称
    test: number;    // 是否测试 app 可见
    active: number;    // 是否生效
}

/**
 * 通用广告平台表基本字段
 */
export interface AdChannelVO extends BaseVO {
    channel: string;    // 平台名
    key1: string;    // 启动参数 1
    key2: string;    // 启动参数 2
    key3: string;    // 启动参数 3
    test: number;    // 是否测试 app 可见
    active: number;    // 是否生效
}

/**
 * 通用广告平台与广告类型关系表基本字段
 */
export interface AdChannelMapVO extends BaseVO {
    adChannelId: string;    // 广告平台表 id
    adTypeId: string;    // 广告类型表 id
}

/**
 * 通用 native 模板表基本字段
 */
export interface NativeTmplVO extends BaseVO {
    key: string;    // 模板编号
    preview: string;    // 预览图地址
    test: number;    // 是否测试 app 可见
    active: number;    // 是否生效
}

/**
 * 通用基础常量表基本字段
 */
export interface BaseConfigVO extends BaseVO {
    key: string;    // 键
    value: string;    // 值
    description: string;    // 描述
    test: number;    // 是否测试 app 可见
    active: number;    // 是否生效
}

/**
 * 通用打包参数表基本字段
 */
export interface PackParamVO extends BaseVO {
    key: string;    // 键
    description: string;    // 描述
    test: number;    // 是否测试 app 可见
    active: number;    // 是否生效
}

/**
 * *********************************************************************************************************************
 * 应用和项目组相关配置
 * *********************************************************************************************************************
 */

/**
 * 项目组表基本字段
 */
export interface ProductGroupVO extends BaseVO {
    name: string;    // 项目组名
    description: string;    // 描述
    active: number;    // 是否生效
}

/**
 * 应用表基本字段
 */
export interface ProductVO extends BaseVO {
    name: string;    // 应用名
    packageName: string;     // 包名
    platform: string;    // 平台名
    pid: string;    // 苹果 id
    productGroupId?: string;    // 项目组表 id
    test: number;    // 是否测试 app 可见
    active: number;    // 是否生效
}

/**
 * 应用打包参数配置表基本字段
 */
export interface PackParamConfVO extends BaseVO {
    value: string;    // 值
    packParamId: string;    // 打包参数表 id
    productId: string;    // 应用表 id
}

/**
 * 应用平台参数配置表基本字段
 */
export interface ChannelParamConfVO extends BaseVO {
    value1: string;    // 启动参数 1 的值
    value2: string;    // 启动参数 2 的值
    value3: string;    // 启动参数 3 的值
    adChannelId: string;    // 广告平台表 id
    productId: string;    // 应用表 id
}

/**
 * *********************************************************************************************************************
 * 下发控制相关
 * *********************************************************************************************************************
 */

/**
 * 广告组表基本字段
 */
export interface AdGroupVO extends BaseVO {
    name: string;    // 广告组名称
    description: string; // 广告组描述
    adTypeId?: string;    // 广告类型表 id
    productId?: string;    // 应用表 id
    active: number;    // 是否生效
}

/**
 * 广告表基本字段
 */
export interface AdVO extends BaseVO {
    name: string;    // 广告名称
    placementID: string;    // 广告唯一 id
    ecpm: number;    // 分层控制
    loader: string;    // 加载器
    subloader: string;    // 子加载器
    interval: number;    // 间隔
    weight: number;    // 权重
    bidding: number;    // 实时竞价
    activeIndex: string;    // 失效时间戳
    adChannelId?: string;    // 广告平台表 id
    adTypeId?: string;    // 广告类型表 id
    adGroupId?: string;    // 广告组表 id
    productId?: string;    // 应用表 id
    active: number;    // 控制生效
}

/**
 * 应用 native 模板配置组表基本字段
 */
export interface NativeTmplConfGroupVO extends BaseVO {
    name: string;    // native 模板配置组名称
    description: string; // native 模板配置组描述
    productId?: string;    // 应用表 id
    active: number;    // 控制生效
}

/**
 * 应用 native 模板配置表基本字段
 */
export interface NativeTmplConfVO extends BaseVO {
    weight: number;    // 权重
    clickArea: number;    // 点击区域配置
    isFull: number;    // 是否支持全屏点击
    nativeTmplId?: string;    // native 模板表 id
    nativeTmplConfGroupId?: string;    // native 模板配置组表 id
    active: number;    // 控制生效
}

/**
 * 常量组表基本字段
 */
export interface ConfigGroupVO extends BaseVO {
    name: string;    // 常量组名称
    description: string; // 常量组描述
    type: number;    // 0 广告 1 游戏常量
    dependentId?: string;    // 依赖的常量组表 id
    productId?: string;    // 应用表 id
    active: number;    // 控制生效
}

/**
 * 常量表基本字段
 */
export interface ConfigVO extends BaseVO {
    key: string;    // 键
    value: string; // 值
    description: string; // 描述
    configGroupId?: string;    // 常量组表 id
    active: number;    // 控制生效
}

/**
 * 版本分组控制表基本字段
 */
export interface VersionGroupVO extends BaseVO {
    name: string;    // 版本分组控制组名
    begin: number;    // 起始版本
    description: string; // 描述
    type: number;    // 0 广告 1 游戏常量 2 商店
    productId?: string;    // 应用表 id
    active: number;    // 控制生效
}

/**
 * 国家代码表基本字段
 */
export interface NationVO extends BaseVO {
    code: string;    // 国家代码
    include: number;    // 是否包含
    versionGroupId: string;    // 版本分组控制表 id
}

/**
 * 国家代码定义表基本字段
 */
export interface NationDefineVO extends BaseVO {
    name: string;    // 国家名称
    code: string;    // 国家代码
}

/**
 * ab 分组测试表基本字段
 */
export interface AbTestGroupVO extends BaseVO {
    name: string;    // ab 测试组名
    begin: number;    // 开始范围
    end: number;    // 结束范围
    description: string; // 描述
    nativeTmplConfGroupId?: string;    // native 模板组表 id
    configGroupId?: string;    // 常量组表 id
    versionGroupId?: string;    // 版本分组控制表 id
}

/**
 * ab 分组测试与广告组关系表基本字段
 */
export interface AbTestMapVO extends BaseVO {
    place: string; // 广告位
    abTestGroupId: string;    // ab 分组测试表 id
    adGroupId: string;    // 广告组表 id
}

/**
 * *********************************************************************************************************************
 * 用户和权限相关
 * *********************************************************************************************************************
 */

/**
 * 用户表配置
 */
export interface UserVO extends BaseVO {
    name: string;    // 用户名
    email: string;    // 邮箱
    // avatar: string;    // 头像
    // telephone: string;    // 手机号
    password?: string;    // 密码
    active: number;    // 控制生效
}

/**
 * 用户权限表配置
 */
export interface UserAuthVO extends BaseVO {
    editComConf: number;    // 编辑常规配置权限
    viewComConf: number;    // 查看常规配置权限
    createProductGroup: number;    // 创建项目组权限
    master: number;    // 是否管理员
    userId?: string;    // 用户表 id
}

/**
 * 项目组权限字段
 */
export interface ProductGroupAuthVO extends BaseProductAuthVO {
    master: number;    // 项目组管理员
    createProduct: number; // 创建应用
    active?: number;    // 控制生效
    userId?: string;    // 用户表 id
    productGroupId?: string;    // 项目组表 id
}

/**
 * 应用权限字段
 */
export interface ProductAuthVO extends BaseProductAuthVO {
    master: number;    // 应用管理员
    active?: number;    // 控制生效
    userId?: string;    // 用户表 id
    productId?: string;    // 应用表 id
}

/**
 * 应用下权限，基本配置，非数据库结构
 */
interface BaseProductAuthVO extends BaseVO {
    editAd: number;    // 编辑广告
    viewAd: number;    // 查看广告
    editGameConfig: number;    // 编辑游戏常量
    viewGameConfig: number;    // 查看游戏常量
    editPurchase: number;    // 编辑内购配置
    viewPurchase: number;    // 查看内购配置
    editProduct: number; // 编辑应用
}

/**
 * *********************************************************************************************************************
 * 自定义接口，包括不限于扩展数据库和 redis 以及内存中的数据结构
 * *********************************************************************************************************************
 */

/**
 * redis 中缓存的应用权限结构
 */
export interface CusProductAuth extends ProductAuthVO {
    master: number;    // 是否管理员或项目组管理员或应用管理员
}

/**
 * redis 中缓存的应用权限结构
 */
export interface CusProductGroupAuth extends ProductGroupAuthVO {
    master: number;    // 是否管理员或项目组管理员
}

/**
 * 自定义 redis 接口，扩展 Redis.Redis 接口
 */
export interface CusRedis extends Redis.Redis {
    tranSet(
        verifiCodeKey: string,
        expireTime: number,
        verifiCode: string
    ): Promise<string>;
}

/**
 * *********************************************************************************************************************
 * 扩展 thinkjs 原生 interface 结构
 * *********************************************************************************************************************
 */

/**
 * 自定义 Context 接口，扩展 thinkjs.Context 接口
 */
export interface CusContext extends Context {
    state: {
        userId: string;
        user: UserVO;
    };
}

/**
 * *********************************************************************************************************************
 * 返回数据类型定义
 * *********************************************************************************************************************
 */

export interface AdChannelResVO extends AdChannelVO {
    adTypeList: string[];    // 支持的广告类型列表
}

export interface ProductResVO extends ProductVO {
    productGroupName?: string;    // 项目组名
    productAuth?: ProductAuthVO;    // 用户在应用下权限
}

export interface PackParamConfResVO extends PackParamVO {
    value: string;    // 值
}

export interface ChannelParamConfResVO extends AdChannelVO {
    value1: string;    // 启动参数 1 的值
    value2: string;    // 启动参数 2 的值
    value3: string;    // 启动参数 3 的值
}

export interface ProductGroupResVO extends ProductGroupVO {
    productGroupAuth?: ProductAuthVO;    // 用户在项目组下权限
}

export interface VersionGroupResVO extends VersionGroupVO {
    codeList: string[];    // 支持的国家代码列表
}

export interface ConfigGroupResVO extends ConfigGroupVO {
    versionGroup: string[];    // 支持的条件组
    dependent: string;    // 依赖的常量组名
    configList?: ConfigResVO[];    // 常量列表
}

export interface ConfigResVO extends ConfigVO {
    dependent: string;    // 依赖的常量组名
}

export interface NativeTmplConfGroupResVO extends NativeTmplConfGroupVO {
    versionGroup: string[];    // 支持的条件组
    nativeTmplConfList?: NativeTmplConfResVO[];
}

export interface NativeTmplConfResVO extends NativeTmplConfVO {
    key: string;    // 模板编号
    preview: string;    // 预览
}

export interface AdGroupResVO extends AdGroupVO {
    type: string;    // 广告类型显示名称
    versionGroup: string[];    // 支持的条件组
    place?: string;    // 广告位
    adList?: AdResVO[];    // 广告列表
}

export interface AdResVO extends AdVO {
    adGroupName?: string;    // 广告组名称
    type?: string;    // 广告类型显示名称
    channel: string;    // 广告平台名称
}

export interface AbTestGroupResVO extends AbTestGroupVO {
    configGroup: ConfigGroupResVO;
    adGroup?: AdGroupResVO[];
    nativeTmplConfGroup?: NativeTmplConfGroupResVO;
}

export interface UserResVO extends UserVO {
    userAuth?: UserAuthVO;    // 用户权限
    productGroupAuth?: ProductGroupAuthVO;    // 用户在项目组权限
    productAuth?: ProductAuthVO;    // 用户在应用下权限
}