/**
 * 通用的函数实例，多处可用到
 */

'use strict';
import * as _ from 'lodash';
import { think } from 'thinkjs';
const uuid = require('node-uuid');

import { AdControlVO } from '../advertisement/defines';

export default class Utils {
    /**
     * Creates an object with all null and undefined removed
     */
    private static compactObj(obj: object) {
        const newObject = {};

        _.each(obj, (v, k) => {
            if (v !== null && v !== undefined) {
                newObject[k] = v;

            }

        });
        return newObject;

    }

    // 最开始的兼容云函数版本
    public static rebuildAdInfoV1(adControlList: AdControlVO[]) {
        // 重新组装 AdControl
        const resultData = {};

        if (!_.isEmpty(adControlList)) {

            _.each(adControlList, ({ adList, place }) => {

                _.each(adList, (adCacheVo) => {
                    const { channel, bidding } = adCacheVo;
                    let { adID } = adCacheVo;

                    // bidding
                    if (bidding) {
                        const headerBiddingVo = { isHeaderBidding: bidding, placementID: adID };
                        adID = JSON.stringify(headerBiddingVo);

                    }
                    const newAdCacheVo = _.omit(
                        adCacheVo,
                        ['channel', 'adID', 'adType', 'bidding']
                    );
                    const compactNewAdCacheVo = this.compactObj(newAdCacheVo);

                    _.setWith(resultData, `${place}.${channel}.${adID}`, compactNewAdCacheVo, Object);

                });

            });
            return resultData;

        }

    }

    // 线上版本
    public static rebuildAdInfoV2(adControlList: AdControlVO[]) {
        // 重新组装 AdControl
        const resultData = {};

        if (!_.isEmpty(adControlList)) {

            _.each(adControlList, ({ adList, place }) => {
                resultData[place] = [];

                _.each(adList, (adCacheVo) => {
                    const { adID, bidding } = adCacheVo;

                    // bidding
                    if (bidding) {
                        const headerBiddingVo = { isHeaderBidding: bidding, placementID: adID };
                        adCacheVo.adID = JSON.stringify(headerBiddingVo);

                    }
                    const newAdCacheVo = _.omit(
                        adCacheVo,
                        ['adType', 'bidding']
                    );
                    const compactNewAdCacheVo = this.compactObj(newAdCacheVo);

                    resultData[place].push(compactNewAdCacheVo);

                });

            });

            return resultData;

        }

    }
}