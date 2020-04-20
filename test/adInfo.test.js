'use strict';
const sleep = require('system-sleep');
const expect = require('chai').expect;
const request = require('supertest');
const _ = require('lodash');
const getServer = require('./conf/server');
const { decrypt, encrypt } = require('./conf/xxteaParse');
const { getValidateName, isValid } = require('./validator');
const Mock = require('mockjs');
const Random = Mock.Random;
const validateName = getValidateName('adInfo');
const ips = ['202.98.23.114', '217.150.154.153', '204.8.143.114', '203.110.240.22'];
Random.extend({
    ipAddress: function (ip) {
        const ipAddresses = ips;
        return this.pick(ipAddresses);
    }
})

describe('#广告配置拉取相关测试', () => {
    let server;
    before(done => {
        let argv;
        if (process.env.npm_config_argv) {
            argv = JSON.parse(process.env.npm_config_argv).original;
        } else {
            argv = process.argv;
        }
        server = getServer(argv);
        done();
    });

    it('请求数据缺失包名 (packageName) 的情况', done => {
        sleep(1000);
        // 请求参数
        console.log(server);
        const idfa = Random.string(5, 10);
        const versionCode = Random.natural(0, 1000);
        const _cloudApiVersion = Random.natural(2, 1000);
        const ip = Random.ipAddress();
        const body = {
            platform: 'android',
            idfa,
            ip,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(_.isEmpty(result)).to.equal(false);
                expect(result.code).to.equal(2502);
                expect(result.message).to.equal('not find group name info');
                // expect(result.config.weightGroup).to.be.equal('-1');
                // expect(result.ConfigConstant.weightGroup).to.be.equal('default-fuzhou');
                done();
            });
    });

    it('请求数据缺失平台信息 (platform) 的情况', done => {
        // 请求参数
        sleep(1000);
        const idfa = Random.string(5, 10);
        const versionCode = Random.natural(0, 1000);
        const _cloudApiVersion = Random.natural(2, 1000);
        const ip = Random.ipAddress();
        const body = {
            packageName: 'com.test1.999.ad',
            idfa,
            ip,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(_.isEmpty(result)).to.equal(false);
                expect(result.code).to.equal(2502);
                expect(result.message).to.equal('not find group name info');
                done();
            });
    });

    it('请求数据缺失平台信息 (_cloudApiVersion) 的情况（新）', done => {
        // 请求参数
        sleep(1000);
        const idfa = Random.string(5, 10);
        const versionCode = Random.natural(0, 1000);
        const ip = Random.ipAddress();
        const body = {
            packageName: 'com.test1.999.ad',
            platform: 'android',
            idfa,
            ip,
            // _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                done();
            });
    });

    it('请求数据缺失平台信息 (_cloudApiVersion) 的情况（旧）', done => {
        sleep(1000);
        // 请求参数
        const idfa = Mock.Random.string(5, 10);
        const versionCode = Mock.Random.natural(0, 1000);
        const body = {
            packageName: 'com.wordgame.puzzle.board.fr',
            platform: 'android',
            idfa,
            // _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                done();
            });
    });

    it('_cloudApiVersion 小于2的情况（新）', done => {
        sleep(1000);
        // 请求参数
        const idfa = Random.string(5, 10);
        const versionCode = Random.natural(0, 1000);
        const _cloudApiVersion = 1;
        const ip = Random.ipAddress();
        const body = {
            packageName: 'com.test1.999.ad',
            platform: 'android',
            idfa,
            ip,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                const obj = { AdControl: { interstitial: [], banner: [] } };
                expect(result).to.deep.equal(obj);
                done();
            });
    });

    it('_cloudApiVersion 小于2的情况（旧）', done => {
        sleep(1000);
        // 请求参数
        const idfa = Mock.Random.string(5, 10);
        const versionCode = Mock.Random.natural(0, 1000);
        const _cloudApiVersion = 1;
        const body = {
            packageName: 'com.wordgame.puzzle.board.fr',
            platform: 'android',
            idfa,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                const obj = { AdControl: { interstitial: [], banner: [] } };
                expect(result).to.deep.equal(obj);
                done();
            });
    });

    it('测试 debug=false && v > 2，返回自定义加密数据（新）', done => {
        sleep(1000);
        // 请求参数
        const idfa = Random.string(5, 10);
        const versionCode = Random.natural(0, 1000);
        const _cloudApiVersion = Random.natural(2, 1000);
        const ip = Random.ipAddress();
        const body = {
            packageName: 'com.test1.999.ad',
            platform: 'android',
            idfa,
            ip,
            _cloudApiVersion,
            versionCode
        };
        body.params = encrypt(body, 3);
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'text/html; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                expect(res.text).to.be.a('string');
                const result = decrypt(res.text, 3);
                expect(isValid(validateName, result)).to.equal(true);
                done();
            });
    });

    it('测试 debug=false && v > 2，返回自定义加密数据（旧）', done => {
        sleep(1000);
        // 请求参数
        const idfa = Mock.Random.string(5, 10);
        const versionCode = Mock.Random.natural(0, 1000);
        const _cloudApiVersion = Mock.Random.natural(2, 1000);
        const body = {
            packageName: 'com.wordgame.puzzle.board.fr',
            platform: 'android',
            idfa,
            _cloudApiVersion,
            versionCode
        };
        body.params = encrypt(body, 3);
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'text/html; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                expect(res.text).to.be.a('string');
                const result = decrypt(res.text, 3);
                expect(isValid(validateName, result)).to.equal(true);
                done();
            });
    });

    it('测试 debug=false && v = 2，返回原生加密数据（新）', done => {
        sleep(1000);
        // 请求参数
        const idfa = Random.string(5, 10);
        const versionCode = Random.natural(0, 1000);
        const _cloudApiVersion = Random.natural(2, 1000);
        const ip = Random.ipAddress();
        let body = {
            packageName: 'com.test1.999.ad',
            platform: 'android',
            idfa,
            ip,
            _cloudApiVersion,
            versionCode
        };
        const params = encrypt(body, 2);
        body = {};
        body.params = params;
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('v', 2)
            .expect(200)
            .expect('Content-Type', 'text/html; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                expect(res.text).to.be.a('string');
                const result = decrypt(res.text, 2);
                expect(isValid(validateName, result)).to.equal(true);
                done();
            });
    });

    it('测试 debug=false && v = 2，返回原生加密数据（旧）', done => {
        sleep(1000);
        // 请求参数
        const idfa = Mock.Random.string(5, 10);
        const versionCode = Mock.Random.natural(0, 1000);
        const _cloudApiVersion = Mock.Random.natural(2, 1000);
        let body = {
            packageName: 'com.wordgame.puzzle.board.fr',
            platform: 'android',
            idfa,
            _cloudApiVersion,
            versionCode
        };
        const params = encrypt(body, 2);
        body = {};
        body.params = params;
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('v', 2)
            .expect(200)
            .expect('Content-Type', 'text/html; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                expect(res.text).to.be.a('string');
                const result = decrypt(res.text, 2);
                expect(isValid(validateName, result)).to.equal(true);
                done();
            });
    });

    it('测试 debug=true，返回未加密数据（新）', done => {
        sleep(1000);
        // 请求参数
        const idfa = Random.string(5, 10);
        const versionCode = Random.natural(0, 1000);
        const _cloudApiVersion = Random.natural(2, 1000);
        const ip = Random.ipAddress();
        const body = {
            packageName: 'com.test1.999.ad',
            platform: 'android',
            idfa,
            ip,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                done();
            });
    });

    it('测试 debug=true，返回未加密数据（旧）', done => {
        sleep(1000);
        // 请求参数
        const idfa = Mock.Random.string(5, 10);
        const versionCode = Mock.Random.natural(0, 1000);
        const _cloudApiVersion = Mock.Random.natural(2, 1000);
        const body = {
            packageName: 'com.wordgame.puzzle.board.fr',
            platform: 'android',
            idfa,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                done();
            });
    });

    it('测试 v < 2，返回未加密数据（新）', done => {
        sleep(1000);
        // 请求参数
        const idfa = Random.string(5, 10);
        const versionCode = Random.natural(0, 1000);
        const _cloudApiVersion = Random.natural(2, 1000);
        const ip = Random.ipAddress();
        const body = {
            packageName: 'com.test1.999.ad',
            platform: 'android',
            idfa,
            ip,
            _cloudApiVersion,
            versionCode
        };
        body.params = encrypt(body, 3);
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('v', 0)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                done();
            });
    });

    it('测试 v < 2，返回未加密数据（旧）', done => {
        sleep(1000);
        // 请求参数
        const idfa = Mock.Random.string(5, 10);
        const versionCode = Mock.Random.natural(0, 1000);
        const _cloudApiVersion = Mock.Random.natural(2, 1000);
        const body = {
            packageName: 'com.wordgame.puzzle.board.fr',
            platform: 'android',
            idfa,
            _cloudApiVersion,
            versionCode
        };
        body.params = encrypt(body, 3);
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('v', 0)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                done();
            });
    });

    it('包名找不到走Fuzhou default组的情况', done => {
        sleep(1000);
        // 请求参数
        const idfa = Random.string(5, 10);
        const versionCode = Random.natural(0, 1000);
        const _cloudApiVersion = Random.natural(2, 1000);
        const ip = Random.ipAddress();
        const body = {
            packageName: 'com.test22.999.ad',
            platform: 'web',
            idfa,
            ip,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                done();
            });
    });

    it('Solitaire 广告配置拉取测试（旧）', done => {
        sleep(1000);
        // 请求参数
        const idfa = Mock.Random.string(5, 10);
        const versionCode = Mock.Random.natural(0, 1000);
        const _cloudApiVersion = Mock.Random.natural(2, 1000);
        const body = {
            packageName: 'Solitaire-flat-5xing',
            platform: 'android',
            idfa,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                done();
            });
    });

    it('Idle 广告配置拉取测试（旧）', done => {
        sleep(1000);
        // 请求参数
        const idfa = Mock.Random.string(5, 10);
        const versionCode = Mock.Random.natural(0, 1000);
        const _cloudApiVersion = Mock.Random.natural(2, 1000);
        const body = {
            packageName: 'com.idle.games.simulator.fireworks',
            platform: 'android',
            idfa,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                done();
            });
    });

    it('Puzzle 广告配置拉取测试（旧）', done => {
        sleep(1000);
        // 请求参数
        const idfa = Mock.Random.string(5, 10);
        const versionCode = Mock.Random.natural(0, 1000);
        const _cloudApiVersion = Mock.Random.natural(2, 1000);
        const body = {
            packageName: 'com.puzzlegames.collection.puzzle',
            platform: 'android',
            idfa,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                done();
            });
    });

    it('Tripeaks 广告配置拉取测试（旧）', done => {
        sleep(1000);
        // 请求参数
        const idfa = Mock.Random.string(5, 10);
        const versionCode = Mock.Random.natural(0, 1000);
        const _cloudApiVersion = Mock.Random.natural(2, 1000);
        const body = {
            packageName: 'com.queensgame.solitaire.journey',
            platform: 'ios',
            idfa,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                done();
            });
    });

    it('android版本控制（旧）', done => {
        sleep(1000);
        // 请求参数
        const idfa = Mock.Random.string(5, 10);
        const versionCode = Mock.Random.natural(0, 50);
        const _cloudApiVersion = Mock.Random.natural(2, 1000);
        const body = {
            packageName: 'com.wordgame.puzzle.board.fr',
            platform: 'android',
            idfa,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                expect(result.config.condition).to.be.equal('default');
                done();
            });
    });

    it(' ios分组测试（新）', done => {
        sleep(1000);
        // 请求参数
        const idfa = Mock.Random.string(5, 10);
        const versionCode = Mock.Random.natural(12, 1000);
        const _cloudApiVersion = Mock.Random.natural(2, 1000);
        const ip = Random.ipAddress();
        const body = {
            packageName: 'com.wordgame.puzzle.board.da',
            platform: 'ios',
            idfa,
            ip,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                // console.log(`分到${result.config.weightGroup}组`);
                done();
            });
    });

    it(' ios分组测试1（旧）', done => {
        sleep(1000);
        // 请求参数
        const idfa = Mock.Random.string(5, 10);
        const versionCode = Mock.Random.natural(12, 1000);
        const _cloudApiVersion = Mock.Random.natural(2, 1000);
        const body = {
            packageName: 'com.wordgame.puzzle.board.en',
            platform: 'ios',
            idfa,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                // console.log(`分到${result.config.weightGroup}组`);
                done();
            });
    });

    it('ios分组测试2（旧）', done => {
        sleep(1000);
        // 请求参数
        const idfa = Mock.Random.string(5, 10);
        const versionCode = Mock.Random.natural(51, 1000);
        const _cloudApiVersion = Mock.Random.natural(2, 1000);
        const body = {
            packageName: 'com.wordcross.plus.puzzle.en',
            platform: 'ios',
            idfa,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 2)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                console.log(`分到${result.config.weightGroup}组`);
                done();
            });
    });

    it(' ios版本控制（旧）', done => {
        sleep(1000);
        // 请求参数
        const idfa = Mock.Random.string(5, 10);
        const versionCode = Mock.Random.natural(0, 11);
        const _cloudApiVersion = Mock.Random.natural(2, 1000);
        const body = {
            packageName: 'com.wordgame.puzzle.board.en',
            platform: 'ios',
            idfa,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                expect(result.config.weightGroup).to.be.equal('-1');
                expect(result.config.condition).to.be.equal('default');
                done();
            });
    });

    it('版本控制测试, 没有versionCode字段（新）', done => {
        sleep(1000);
        // 请求参数
        const idfa = Random.string(5, 10);
        const _cloudApiVersion = Random.natural(2, 1000);
        const ip = Random.ipAddress();
        const body = {
            packageName: 'com.wordgame.puzzle.board.nl',
            platform: 'android',
            idfa,
            ip,
            _cloudApiVersion,
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                done();
            });
    });

    it('版本控制测试, 没有versionCode字段（旧）', done => {
        sleep(1000);
        // 请求参数
        const idfa = Mock.Random.string(5, 10);
        const _cloudApiVersion = Mock.Random.natural(2, 1000);
        const body = {
            packageName: 'com.wordgame.puzzle.board.fr',
            platform: 'android',
            idfa,
            _cloudApiVersion,
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                expect(result.config.condition).to.be.equal('default');
                done();
            });
    });

    it('安卓分组测试（旧）', done => {
        sleep(1000);
        // 请求参数
        const idfa = Mock.Random.string(5, 10);
        const versionCode = Mock.Random.natural(51, 1000);
        const _cloudApiVersion = Mock.Random.natural(2, 1000);
        const body = {
            packageName: 'com.wordgame.puzzle.board.fr_ROW',
            platform: 'android',
            idfa,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                // console.log(`分到${result.config.weightGroup}组`);
                done();
            });
    });

    it('分组测试美国组, GroupB1组（新）', done => {
        sleep(1000);
        // 请求参数
        const idfa = '123456';
        const versionCode = Random.natural(1, 4);
        const _cloudApiVersion = Random.natural(2, 1000);
        const ip = ips[2];
        const body = {
            packageName: 'com.test1.999.ad',
            platform: 'android',
            idfa,
            ip,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                expect(result.config.weightGroup).to.be.equal('GroupB1');
                expect(result.ConfigConstant.weightGroup).to.be.equal('TestConfigGroupB1');
                done();
            });
    });

    it('分组测试美国组, GroupA1组（新）', done => {
        sleep(1000);
        // 请求参数
        const idfa = '123457';
        const versionCode = Random.natural(1, 4);
        const _cloudApiVersion = Random.natural(2, 1000);
        const ip = ips[2];
        const body = {
            packageName: 'com.test1.999.ad',
            platform: 'android',
            idfa,
            ip,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                expect(result.config.weightGroup).to.be.equal('GroupA1');
                expect(result.ConfigConstant.weightGroup).to.be.equal('TestConfigGroupA1');
                done();
            });
    });

    it('分组测试美国组, GroupB2组（新）', done => {
        sleep(1000);
        // 请求参数
        const idfa = '123456';
        const versionCode = Random.natural(6, 1000);
        const _cloudApiVersion = Random.natural(2, 1000);
        const ip = ips[2];
        const body = {
            packageName: 'com.test1.999.ad',
            platform: 'android',
            idfa,
            ip,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                expect(result.config.weightGroup).to.be.equal('GroupB2');
                expect(result.ConfigConstant.weightGroup).to.be.equal('TestConfigGroupB2');
                done();
            });
    });

    it('分组测试美国组, GroupA2组（新）', done => {
        sleep(1000);
        // 请求参数
        const idfa = '123457';
        const versionCode = Random.natural(6, 1000);
        const _cloudApiVersion = Random.natural(2, 1000);
        const ip = ips[2];
        const body = {
            packageName: 'com.test1.999.ad',
            platform: 'android',
            idfa,
            ip,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                expect(result.config.weightGroup).to.be.equal('GroupA2');
                expect(result.ConfigConstant.weightGroup).to.be.equal('TestConfigGroupA2');
                done();
            });
    });

    it('分组测试印度组, GroupB3组（新）', done => {
        sleep(1000);
        // 请求参数
        const idfa = '123456';
        const versionCode = Random.natural(1, 29);
        const _cloudApiVersion = Random.natural(2, 1000);
        const ip = ips[3];
        const body = {
            packageName: 'com.test1.999.ad',
            platform: 'android',
            idfa,
            ip,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                expect(result.config.weightGroup).to.be.equal('GroupB3');
                expect(result.ConfigConstant.weightGroup).to.be.equal('TestConfigGroupB3');
                done();
            });
    });

    it('分组测试印度组, GroupA3组（新）', done => {
        sleep(1000);
        // 请求参数
        const idfa = '123457';
        const versionCode = Random.natural(1, 29);
        const _cloudApiVersion = Random.natural(2, 1000);
        const ip = ips[3];
        const body = {
            packageName: 'com.test1.999.ad',
            platform: 'android',
            idfa,
            ip,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                expect(result.config.weightGroup).to.be.equal('GroupA3');
                expect(result.ConfigConstant.weightGroup).to.be.equal('TestConfigGroupA3');
                done();
            });
    });

    it('分组测试印度组, GroupB4组（新）', done => {
        sleep(1000);
        // 请求参数
        const idfa = '123456';
        const versionCode = Random.natural(30, 1000);
        const _cloudApiVersion = Random.natural(2, 1000);
        const ip = ips[3];
        const body = {
            packageName: 'com.test1.999.ad',
            platform: 'android',
            idfa,
            ip,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                expect(result.config.weightGroup).to.be.equal('GroupB4');
                expect(result.ConfigConstant.weightGroup).to.be.equal('TestConfigGroupB4');
                done();
            });
    });

    it('分组测试印度组, GroupA4组（新）', done => {
        sleep(1000);
        // 请求参数
        const idfa = '123457';
        const versionCode = Random.natural(30, 1000);
        const _cloudApiVersion = Random.natural(2, 1000);
        const ip = ips[3];
        const body = {
            packageName: 'com.test1.999.ad',
            platform: 'android',
            idfa,
            ip,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                expect(result.config.weightGroup).to.be.equal('GroupA4');
                expect(result.ConfigConstant.weightGroup).to.be.equal('TestConfigGroupA4');
                done();
            });
    });

    it('安卓分组测试默认组（新）', done => {
        sleep(1000);
        // 请求参数
        const versionCode = Random.natural(1, 1000);
        const _cloudApiVersion = Random.natural(2, 1000);
        const ip = Random.ipAddress();
        const body = {
            packageName: 'com.test1.999.ad',
            platform: 'android',
            ip,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                expect(result.config.weightGroup).to.be.equal('-1');
                expect(result.ConfigConstant.weightGroup).to.be.equal('test-default');
                done();
            });
    });

    it('安卓分组测试默认组（旧）', done => {
        sleep(1000);
        // 请求参数
        const versionCode = Mock.Random.natural(51, 1000);
        const _cloudApiVersion = Mock.Random.natural(2, 1000);
        const body = {
            packageName: 'com.wordgame.puzzle.board.fr_ROW',
            platform: 'android',
            // idfa,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                expect(result.config.weightGroup).to.be.equal('-1');
                done();
            });
    });

    it('android前端idfa无法获取的时候分组到默认组（新）', done => {
        sleep(1000);
        // 请求参数
        const versionCode = Random.natural(1, 1000);
        const _cloudApiVersion = Random.natural(2, 1000);
        const ip = Random.ipAddress();
        const body = {
            packageName: 'com.test1.999.ad',
            platform: 'android',
            ip,
            idfa: '00000000-0000-0000-0000-000000000000',
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                expect(result.config.weightGroup).to.be.equal('-1');
                expect(result.ConfigConstant.weightGroup).to.be.equal('test-default');
                done();
            });
    });

    it('android前端idfa无法获取的时候分组到默认组（旧）', done => {
        sleep(1000);
        // 请求参数
        const versionCode = Mock.Random.natural(51, 1000);
        const _cloudApiVersion = Mock.Random.natural(2, 1000);
        const body = {
            packageName: 'com.wordgame.puzzle.board.fr_ROW',
            platform: 'android',
            idfa: '00000000-0000-0000-0000-000000000000',
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                expect(result.config.weightGroup).to.be.equal('-1');
                done();
            });
    });

    it('ios前端idfa无法获取的时候分组到默认组（新）', done => {
        sleep(1000);
        // 请求参数
        const versionCode = 12;
        const _cloudApiVersion = Mock.Random.natural(2, 1000);
        const body = {
            packageName: 'com.wordgame.puzzle.board.da',
            platform: 'ios',
            idfa: '00000000-0000-0000-0000-000000000000',
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                expect(result.config.weightGroup).to.be.equal('-1');
                done();
            });
    });

    it('ios前端idfa无法获取的时候分组到默认组（旧）', done => {
        sleep(1000);
        // 请求参数
        const versionCode = Mock.Random.natural(51, 1000);
        const _cloudApiVersion = Mock.Random.natural(2, 1000);
        const body = {
            packageName: 'com.wordcross.plus.puzzle.en',
            platform: 'ios',
            idfa: '00000000-0000-0000-0000-000000000000',
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                expect(result.config.weightGroup).to.be.equal('-1');
                done();
            });
    });

    it('ios分组测试默认（新）', done => {
        sleep(1000);
        // 请求参数
        const versionCode = 12;
        const _cloudApiVersion = Mock.Random.natural(2, 1000);
        const body = {
            packageName: 'com.wordgame.puzzle.board.da',
            platform: 'ios',
            // idfa,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                expect(result.config.weightGroup).to.be.equal('-1');
                done();
            });
    });

    it('ios分组测试默认（旧）', done => {
        sleep(1000);
        // 请求参数
        const versionCode = Mock.Random.natural(12, 1000);
        const _cloudApiVersion = Mock.Random.natural(2, 1000);
        const body = {
            packageName: 'com.wordgame.puzzle.board.en',
            platform: 'ios',
            // idfa,
            _cloudApiVersion,
            versionCode
        };
        request(server)
            .post('/adInfo')
            .send(body)
            .set('Content-Type', 'application/json')
            .set('debug', true)
            .set('v', 3)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end((err, res) => {
                if (err) return done(err);
                const result = res.body;
                expect(isValid(validateName, result)).to.equal(true);
                expect(result.config.weightGroup).to.be.equal('-1');
                done();
            });
    });
});