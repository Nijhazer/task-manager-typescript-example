import chai = require('chai');
import chaiAsPromised = require("chai-as-promised");
import sinon = require('sinon');
import Mongo = require('mongodb');
import _ = require('lodash');
import {
    EnvDataConfig,
    IDataConfig,
    MongoDataDriver
} from '../api/db';

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('EnvDataConfig', () => {
    var config;

    beforeEach(() => {
        config = EnvDataConfig.getInstance();
    });

    it('should throw an exception when instantiated', () => {
        expect(() => {
            new EnvDataConfig();
        }).to.throw(EnvDataConfig.MSG_INSTANTIATION_ERROR);
    });

    describe('getInstance()', () => {
        it('should always return the same instance', () => {
            var config1 = EnvDataConfig.getInstance();
            var config2 = EnvDataConfig.getInstance();
            expect(config1 === config2).to.be.true;
        });
    });

    it('should return the current environment value: hostname', () => {
        var expected = 'Expected Hostname';
        process.env['DB_HOSTNAME'] = expected;
        expect(config.hostname).to.equal(expected);
    });

    it('should return the current environment value: port', () => {
        var expected = 'Expected Port';
        process.env['DB_PORT'] = expected;
        expect(config.port).to.equal(expected);
    });

    it('should return the current environment value: username', () => {
        var expected = 'Expected Username';
        process.env['DB_USERNAME'] = expected;
        expect(config.username).to.equal(expected);
    });

    it('should return the current environment value: password', () => {
        var expected = 'Expected Password';
        process.env['DB_PASSWORD'] = expected;
        expect(config.password).to.equal(expected);
    });

    it('should return the current environment value: connection URL', () => {
        var expected = 'Expected Connection URL';
        process.env['DB_CONNECTION_URL'] = expected;
        expect(config.connectionURL).to.equal(expected);
    });
});


describe('MongoDataDriver', () => {
    var driver,
        connectStub;

    beforeEach(() => {
        driver = new MongoDataDriver(EnvDataConfig.getInstance());
        connectStub = sinon.stub(Mongo.MongoClient, 'connect');
    });

    afterEach(() => {
        Mongo.MongoClient.connect['restore']();
    });

    describe('getConnection', () => {
        it('should reject the promise if an error occurs on connect', () => {
            connectStub.callsArgWith(1, {});

            expect(driver.getConnection()).to.eventually.be.rejected;
        });

        it('should resolve the promise if no error occurred on connect', () => {
            connectStub.callsArgWith(1, undefined);

            expect(driver.getConnection()).to.eventually.be.fulfilled;
        });

        it('should resolve the promise with the connection from the Mongo driver', () => {
            var expected = {};

            connectStub.callsArgWith(1, undefined, expected);

            expect(driver.getConnection()).to.eventually.equal(expected);
        });
    });
});