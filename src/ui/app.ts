import $ = require('jquery');
import {TaskController, HandlebarsTemplateProvider} from './controllers';
import {Task} from "../core/task";
import {JQueryAjaxManager} from "./controllers";
import {ITask} from "../core/task";
import {ConfigManager} from "./config";

ConfigManager.loadFromURL('config.json').then((config) => {
    var controller: TaskController = new TaskController();
    controller.dataManager = new JQueryAjaxManager<ITask>(config, Task);
    controller.templateProvider = new HandlebarsTemplateProvider();
    controller.bindTo('tasks');
});