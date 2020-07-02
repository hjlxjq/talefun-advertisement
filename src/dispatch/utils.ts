'use strict';
import * as _ from 'lodash';
import { think } from 'thinkjs';
const uuid = require('node-uuid');

import { AdCacheVO } from '../advertisement/defines';

export default class Utils {

    /**
     * Creates an object with all null and  undefined removed
     */
    public static compactObj(obj: object) {
        const newObject = {};
        _.each(obj, (v, k) => {
            if (v !== null && v !== undefined) {
                newObject[k] = v;
            }
        });
        return newObject;
    }

    /**
     * 自动生成主键id
     */
    public static generateId(): string {
        return uuid.v4();
    }

    /**
     * 对象子数组处理, redis hash表数据
     */
    public static hashArr(obj: object) {
        return _.flatten(_.map(obj, (value, key) => {
            return [key, JSON.stringify(value)];
        }));
    }

    public static rebuildAdInfoV1(adGroupData: any) {
        const newData = {};

        _.each(adGroupData, ({ adList, place }) => {
            _.each(adList, (adCacheVo: AdCacheVO) => {
                const { channel, bidding } = adCacheVo;
                let { adID } = adCacheVo;
                if (bidding) {
                    const headerBiddingObject = { isHeaderBidding: bidding, placementID: adID };
                    const compactHeaderBiddingObject = this.compactObj(headerBiddingObject);
                    adID = JSON.stringify(compactHeaderBiddingObject);
                }
                const object = _.omit(
                    adCacheVo,
                    ['channel', 'adID', 'adType', 'bidding']
                );
                const compactObj = this.compactObj(object);
                _.setWith(newData, `${place}.${channel}.${adID}`, compactObj, Object);

            });

        });
        return newData;

    }

    public static rebuildAdInfoV2(adGroupData: any) {
        const newData = {};

        _.each(adGroupData, ({ adList, place }) => {
            newData[place] = [];

            _.each(adList, (adCacheVo: AdCacheVO) => {
                const { adID, bidding } = adCacheVo;
                if (bidding) {
                    const headerBiddingObject = { isHeaderBidding: bidding, placementID: adID };
                    const compactHeaderBiddingObject = this.compactObj(headerBiddingObject);
                    adCacheVo.adID = JSON.stringify(compactHeaderBiddingObject);

                }
                const object = _.omit(
                    adCacheVo,
                    ['adType', 'bidding']
                );
                const compactObj: any = this.compactObj(object);

                newData[place].push(compactObj);

            });

        });

        return newData;

    }
}