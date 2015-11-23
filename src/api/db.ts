/// <reference path="api.d.ts" />

import MTask = require('../core/task');
import Mongo = require('mongodb');
import _ = require('lodash');

export interface IDataManager<T extends IStorable> {
    newObjectOfType() : T;
    findOne(documentId : any) : Promise<T>;
    findAll() : Promise<T[]>;
    createOne(document : T) : Promise<T>;
    update(document : T) : Promise<T>;
    remove(documentId : any) : Promise<any>;
}

export interface IDataConfig {
    hostname: string;
    port: number;
    username: string;
    password: string;
    useConnectionURL: boolean;
    connectionURL: string;
}

export interface IDataDriver {
    getConnection() : Promise<IDataConnection>;
    getRepository(repositoryName : string) : Promise<IDataOperationResponse>;
    getIdType(value : any) : any;
}

export interface IDataConnection {
    close();
}

export interface IDataOperationResponse {
    connection: IDataConnection,
    repository: any
}

export interface IStorable {
    _id: any;
    createdOn: Date;
    updatedOn: Date;
    getRepositoryName() : string;
}

export class EnvDataConfig implements IDataConfig {
    private static _instance : EnvDataConfig = new EnvDataConfig();

    public static get MSG_INSTANTIATION_ERROR() {
        return 'Use EnvDataConfig.getInstance() to get the instance of a singleton';
    }

    constructor() {
        if (EnvDataConfig._instance) {
            throw new Error(EnvDataConfig.MSG_INSTANTIATION_ERROR);
        }
        EnvDataConfig._instance = this;
    }

    public static getInstance() : EnvDataConfig {
        if (EnvDataConfig._instance == null) {
            EnvDataConfig._instance = new EnvDataConfig();
        }
        return EnvDataConfig._instance;
    }

    private getEnvProperty(propertyName: string) : any {
        return process.env[propertyName];
    }

    get hostname() {
        return this.getEnvProperty('DB_HOSTNAME');
    }

    get port() {
        return this.getEnvProperty('DB_PORT');
    }

    get username() {
        return this.getEnvProperty('DB_USERNAME');
    }

    get password() {
        return this.getEnvProperty('DB_PASSWORD');
    }

    get useConnectionURL() {
        if (this.connectionURL == null) {
            return false;
        }
        return true;
    }

    get connectionURL() {
        return this.getEnvProperty('DB_CONNECTION_URL');
    }
}

export class MongoDataOperationResponse implements IDataOperationResponse {
    connection: Mongo.Db;
    repository: Mongo.Collection;
}

export class MongoDataDriver implements IDataDriver {
    private config : IDataConfig;

    constructor(config: IDataConfig) {
        this.config = config;
    }

    getConnection() : Promise<Mongo.Db> {
        var self = this;
        return new Promise<Mongo.Db>((resolve, reject) => {
            Mongo.MongoClient.connect(self.config.connectionURL, (err, connection) => {
                if (err) {
                    reject(err);
                }
                resolve(connection);
            });
        });
    }

    getRepository(repositoryName : string) : Promise<MongoDataOperationResponse> {
        var self = this;
        return new Promise<MongoDataOperationResponse>((resolve, reject) => {
            self.getConnection().then((connection) => {
                var response = new MongoDataOperationResponse();
                response.connection = connection;
                response.repository = connection.collection(repositoryName);
                resolve(response);
            }, (err) => {
                reject(err);
            });
        });
    }

    getIdType(value : string) : Mongo.ObjectID {
        return new Mongo.ObjectID(value);
    }
}

export class DataManager<T extends IStorable> implements IDataManager<T> {
    private driver : IDataDriver;
    private typeForInstantiation : any;

    constructor (driver : IDataDriver, typeForInstantiation: any) {
        this.driver = driver;
        this.typeForInstantiation = typeForInstantiation;
    }

    newObjectOfType() : T {
        return new this.typeForInstantiation();
    }

    findOne(documentId : any) : Promise<T> {
        var self = this;
        var document = self.newObjectOfType();

        return new Promise<T>((resolve, reject) => {
            self.driver.getRepository(document.getRepositoryName()).then((response) => {
                response.repository.findOne({
                    _id: self.driver.getIdType(documentId)
                }, (err, result) => {
                    response.connection.close();

                    if (err) {
                        reject(err);
                    }

                    _.each(_.keys(result), (key) => {
                        document[key] = result[key];
                    });

                    resolve(document);
                });
            });
        });
    }

    findAll() : Promise<T[]> {
        var self = this;
        var document = self.newObjectOfType();

        return new Promise<T[]>((resolve, reject) => {
            self.driver.getRepository(document.getRepositoryName()).then((response) => {
                response.repository.find({}).toArray((err, documents) => {
                    response.connection.close();

                    var results : T[] = [];

                    if (err) {
                        reject(err);
                    }

                    _.each(documents, (document) => {
                        var result = self.newObjectOfType();

                        _.each(_.keys(document), (key) => {
                            result[key] = document[key];
                        });

                        results.push(result);
                    });

                    resolve(results);
                });
            });
        });
    }

    createOne(document : T) : Promise<T> {
        var self = this;

        return new Promise<T>((resolve, reject) => {
            self.driver.getRepository(document.getRepositoryName()).then((response) => {
                document.updatedOn = new Date();
                response.repository.insertOne(document, (err, result) => {
                    response.connection.close();

                    if (err) {
                        reject(err);
                    }

                    var newDocument : T = self.newObjectOfType();

                    _.each(_.keys(result), (key) => {
                        newDocument[key] = result[key];
                    });

                    resolve(newDocument);
                });
            });
        });
    }

    update(document : T) : Promise<T> {
        var self = this;

        return new Promise<T>((resolve, reject) => {
            self.driver.getRepository(document.getRepositoryName()).then((response) => {
                document.updatedOn = new Date();
                var id = self.driver.getIdType(document._id);
                var updateRequest = {};
                _.each(_.without(_.keys(document), '_id'), (key) => {
                    updateRequest[key] = document[key];
                });
                response.repository.findOneAndUpdate({
                    _id: id
                }, {
                    $set: updateRequest
                }, {
                    returnOriginal: false
                }, (err, result) => {
                    response.connection.close();

                    var updatedDocument = self.newObjectOfType();

                    var updatedData = result.value;
                    _.each(_.keys(updatedData), (key) => {
                        updatedDocument[key] = updatedData[key];
                    });

                    if (err) {
                        reject(err);
                    }

                    resolve(updatedDocument);
                });
            });
        });
    }

    remove(documentId : any) : Promise<any> {
        var self = this;
        var document = self.newObjectOfType();

        return new Promise<T[]>((resolve, reject) => {
            self.driver.getRepository(document.getRepositoryName()).then((response) => {
                response.repository.findOneAndDelete({
                    _id: self.driver.getIdType(documentId)
                }, (err) => {
                    response.connection.close();

                    if (err) {
                        reject(err);
                    }

                    resolve();
                });
            });
        });
    }
}