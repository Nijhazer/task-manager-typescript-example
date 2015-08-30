import {ITask, Task} from '../core/task';
import {DataManager, MongoDataDriver, EnvDataConfig} from './db';
import {MongoClient} from 'mongodb';

import Express = require('express');
import bodyParser = require('body-parser');

import {ExpressController} from "./controllers";

var cors = require('cors');

require('dotenv').load();

var app = Express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var router = Express.Router();

var port = process.env.PORT || '9000';

var taskManager = new DataManager<ITask>(
    new MongoDataDriver(EnvDataConfig.getInstance()),
    Task
);

var taskController = new ExpressController<ITask>();
taskController.manager = taskManager;

router.route(Task.API_BASE_URL)
    .get(taskController.findAll())
    .post(taskController.create());

router.route(Task.API_BASE_URL + '/:id')
    .get(taskController.findById())
    .put(taskController.update())
    .delete(taskController.remove());

app.use('/api', router);

app.listen(port);