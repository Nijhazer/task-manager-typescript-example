import _ = require('lodash');
import Express = require('express');
import {IDataManager, IStorable} from "./db";

export interface IExpressController<T extends IStorable> {
    manager: IDataManager<T>;

    create();
    findAll();
    findById();
    update();
    remove();
}

export class ExpressController<T extends IStorable> implements IExpressController<T> {
    public _manager: IDataManager<T>;

    public set manager(manager : IDataManager<T>) {
        this._manager = manager;
    }

    public findById() {
        var manager = this._manager;
        return function(request: Express.Request, response: Express.Response) {
            manager.findOne(request.params.id).then(function(results) {
                response.send(results);
            }, function(error) {
                console.log(error, 'error occurred when searching for a document');
                response.send(error);
            });
        };
    }

    public findAll() {
        var manager = this._manager;
        return function(request: Express.Request, response: Express.Response) {
            manager.findAll().then(function(results) {
                response.send(results);
            }, function(error) {
                console.log(error, 'error occurred when searching for documents');
                response.send(error);
            });
        };
    }

    public create() {
        var manager = this._manager;
        return function(request: Express.Request, response: Express.Response) {
            var obj = manager.newObjectOfType();

            _.each(_.keys(request.body), function(bodyKey) {
                obj[bodyKey] = request.body[bodyKey];
            });

            manager.createOne(obj).then(function(document) {
                response.send(document);
            }, function(error) {
                console.log(error, 'error occurred when creating document');
                response.send(error);
            });
        };
    }

    public update() {
        var manager = this._manager;
        return function(request: Express.Request, response: Express.Response) {
            var documentForUpdate = manager.newObjectOfType();

            documentForUpdate._id = request.params.id;

            _.each(_.keys(request.body), function(key) {
                documentForUpdate[key] = request.body[key];
            });

            manager.update(documentForUpdate).then(function(result) {
                response.send(result);
            }, function(error) {
                console.log(error, 'error occurred when updating document');
                response.send(error);
            });
        };
    }

    public remove() {
        var manager = this._manager;
        return function(request: Express.Request, response: Express.Response) {
            manager.remove(request.params.id).then(function(result) {
                response.send('ok');
            }, function(error) {
                console.log(error, 'error occurred when removing document');
                response.send(error);
            });
        };
    }
}