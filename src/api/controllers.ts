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
        return (request: Express.Request, response: Express.Response) => {
            manager.findOne(request.params.id).then((results) => {
                response.send(results);
            }, (error) => {
                console.log(error, 'error occurred when searching for a document');
                response.send(error);
            });
        };
    }

    public findAll() {
        var manager = this._manager;
        return (request: Express.Request, response: Express.Response) => {
            manager.findAll().then((results) => {
                response.send(results);
            }, (error) => {
                console.log(error, 'error occurred when searching for documents');
                response.send(error);
            });
        };
    }

    public create() {
        var manager = this._manager;
        return (request: Express.Request, response: Express.Response) => {
            var obj = manager.newObjectOfType();

            _.each(_.keys(request.body), (bodyKey) => {
                obj[bodyKey] = request.body[bodyKey];
            });

            manager.createOne(obj).then((document) => {
                response.send(document);
            }, (error) => {
                console.log(error, 'error occurred when creating document');
                response.send(error);
            });
        };
    }

    public update() {
        var manager = this._manager;
        return (request: Express.Request, response: Express.Response) => {
            var documentForUpdate = manager.newObjectOfType();

            documentForUpdate._id = request.params.id;

            _.each(_.keys(request.body), (key) => {
                documentForUpdate[key] = request.body[key];
            });

            manager.update(documentForUpdate).then((result) => {
                response.send(result);
            }, (error) => {
                console.log(error, 'error occurred when updating document');
                response.send(error);
            });
        };
    }

    public remove() {
        var manager = this._manager;
        return (request: Express.Request, response: Express.Response) => {
            manager.remove(request.params.id).then((result) => {
                response.send('ok');
            }, (error) => {
                console.log(error, 'error occurred when removing document');
                response.send(error);
            });
        };
    }
}