/**
 * Talefun framework Utils 基础通用库
 * @module common/tale/Utils
 * @see module:Utils
 */
/**
 * 常用的基础函数封装可放于此文件
 * @class Utils
 * @classdesc 基础通用库
 * @author yangzhu <yangzhu@talefun.com>
 */
export default class Utils {
    /**
     * 睡眠几秒
     * 主要用于暂停当前帧的调度 并于几秒后回归
     * sleep仅中止调度 并不阻塞进程
     * 调用请务必await 否则将不起作用
     * @param timeout number 毫秒时间
     */
    public static sleep(timeout: number): Promise<any> {
        if (!timeout) { timeout = 1000; }
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, timeout);
        });
    }

    /**
     * 移除字符串两边的空白
     * @param input string
     */
    public static trim(input: string): string {
        return input.replace(/(^\s*)|(\s*$)/g, "");
    }

}