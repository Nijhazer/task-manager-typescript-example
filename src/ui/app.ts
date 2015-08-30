import $ = require('jquery');
import {TaskController, HandlebarsTemplateProvider} from './controllers';
import {Task} from "../core/task";

var controller: TaskController = new TaskController();
controller.templateProvider = new HandlebarsTemplateProvider();
controller.bindTo('tasks');