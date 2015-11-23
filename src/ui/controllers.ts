import {Task} from "../core/task";
import Handlebars = require('handlebars');
import $ = require('jquery');
import _ = require('lodash');
import {ITask} from "../core/task";
import {IUIConfig} from "./config";

export interface ITemplateProvider<T> {
    getTemplate(templateKey : string) : Promise<T>;
    setTemplate(templateKey : string, template : T);
}

export class HandlebarsTemplateProvider implements ITemplateProvider<HandlebarsTemplateDelegate> {
    private cache: { [templateKey : string] : HandlebarsTemplateDelegate; } = {};

    getTemplate(templateKey : string) : Promise<HandlebarsTemplateDelegate> {
        var self = this;
        return new Promise<HandlebarsTemplateDelegate>((resolve) => {
            if (_.isUndefined(self.cache[templateKey])) {
                $.ajax({
                    url: templateKey,
                    method: 'GET',
                    dataType: 'text/html'
                }).always((response: any) => {
                    self.cache[templateKey] = Handlebars.compile(response.responseText);
                    console.log('resolving get template');
                    resolve(self.cache[templateKey]);
                });
            } else {
                resolve(self.cache[templateKey]);
            }
        });
    }

    setTemplate(templateKey : string, template : HandlebarsTemplateDelegate) {
        this.cache[templateKey] = template;
    }
}

export interface IAPIManager<T> {
    config: IUIConfig;
    newObjectOfType() : T;
    findOne(documentId : any) : Promise<T>;
    findAll() : Promise<T[]>;
    createOne(document : T) : Promise<T>;
    update(document : T) : Promise<T>;
    remove(documentId : any) : Promise<any>;
}

export class JQueryAjaxManager<T> implements IAPIManager<T> {
    private typeForInstantiation : any;
    private _config : IUIConfig;

    public set config(config: IUIConfig) {
        this._config = config;
    }

    constructor(config: IUIConfig, typeForInstantiation : any) {
        this.config = config;
        this.typeForInstantiation = typeForInstantiation;
    }

    newObjectOfType() : T {
        return new this.typeForInstantiation();
    }

    findOne(documentId:any):Promise<T> {
        return undefined;
    }

    findAll() : Promise<T[]> {
        var self = this;
        return new Promise<T[]>((resolve, reject) => {
            $.ajax({
                url: self._config.apiBaseURL + Task.API_BASE_URL,
                method: 'GET',
                dataType: 'json',
                contentType: 'application/json'
            }).done((response) => {
                var results : T[] = [];

                _.each(response, (responseItem) => {
                    var result = self.newObjectOfType();

                    _.each(_.keys(responseItem), (key) => {
                        result[key] = responseItem[key];
                    });

                    results.push(result);
                });

                resolve(results);
            }).fail((error) => {
                reject(error);
            });
        });
    }

    createOne(document:T):Promise<T> {
        var self = this;
        return new Promise<T>((resolve, reject) => {
            $.ajax({
                url: self._config.apiBaseURL + Task.API_BASE_URL,
                method: 'POST',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify(document),
                processData: false
            }).done((response) => {
                var newDocument : T = self.newObjectOfType();

                _.each(_.keys(response), (key) => {
                    newDocument[key] = response[key];
                });

                resolve(newDocument);
            }).fail((error) => {
                reject(error);
            });
        });
    }

    update(document:T):Promise<T> {
        return undefined;
    }

    remove(documentIds:any[]):Promise<any> {
        var self = this;
        return new Promise<any>((resolve, reject) => {
            var promises: Promise<any>[] = [];

            _.each(documentIds, (documentId) => {
                promises.push(self.removeOne(documentId));
            });

            Promise.all(promises).then((results) => {
                resolve(results);
            }, (error) => {
                reject(error);
            });
        });
    }

    removeOne(documentId:any):Promise<any> {
        var self = this;
        return new Promise<any>((resolve, reject) => {
            $.ajax({
                url: self._config.apiBaseURL + Task.API_BASE_URL + '/' + documentId,
                method: 'DELETE'
            }).done((response) => {
                resolve(response);
            }).fail((error) => {
                reject(error);
            });
        });
    }
}

export class TaskController {
    private _templateProvider : HandlebarsTemplateProvider;
    private _dataManager : JQueryAjaxManager<ITask>;
    private element : JQuery;

    public set templateProvider(templateProvider : HandlebarsTemplateProvider) {
        this._templateProvider = templateProvider;
    }

    public set dataManager(dataManager : JQueryAjaxManager<ITask>) {
        this._dataManager = dataManager;
    }

    public bindTo(selector : string) {
        var self = this;

        $(document).ready(function() {
            self.element = $(selector);

            self.renderTasks().then((content) => {
                self.replaceContent(content);
            });
        });
    }

    public replaceContent(content: string) {
        this.element.empty().append(content);
        this.bindActions();
    }

    public bindActions() {
        var self = this;

        self.element.find('button[data-control="tasks.delete"]').on('click', () => {
            var taskIds : string[] = [];

            self.element.find('input:checked').each((index: number, input: any) => {
                taskIds.push(input.value);
            });

            self.deleteTasks(taskIds).then((content) => {
                self.replaceContent(content);
            });
        });

        self.element.find('button[data-control="tasks.create"]').on('click', () => {
            var task : Task = new Task();

            task.title = self.element.find('input[name="task.title"]').val();

            self.createTask(task).then((content) => {
                self.replaceContent(content);
            });
        });
    }

    public renderTasks() : Promise<string> {
        var self = this;
        return new Promise<string>((resolve) => {
            self._dataManager.findAll().then((tasks) => {
                self._templateProvider
                    .getTemplate('views/tasks.hbs')
                    .then((template) => {
                        resolve(template({
                            tasks: tasks
                        }));
                    });
            });
        });
    }

    public deleteTasks(taskIds : string[]) : Promise<string> {
        var self = this;
        return new Promise<string>((resolve) => {
            self._dataManager.remove(taskIds).then(() => {
                self.renderTasks().then((content) => {
                    resolve(content);
                });
            });
        });
    }

    public createTask(task : Task) : Promise<string> {
        var self = this;
        return new Promise<string>((resolve, reject) => {
            self._dataManager.createOne(task).then(() => {
                self.renderTasks().then((content) => {
                    resolve(content);
                });
            });
        });
    }
}