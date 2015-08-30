import {IStorable} from "../api/db";

export interface IAPIServable {
    baseAPIURL: string;
}

export interface ITask extends IStorable {
	title: string;
}

export class Task implements ITask, IStorable, IAPIServable {
    public _id: any;
	public title: string;
    public static REPOSITORY_NAME = 'tasks';
    public static API_BASE_URL = '/tasks';

    public description: string;
    public active: boolean;
	
	public createdOn: Date;
    public updatedOn: Date;

    public get baseAPIURL() {
        return Task.API_BASE_URL;
    }
	
	constructor() {
		this.createdOn = new Date();
        this.active = false;
	}

    public getRepositoryName() : string {
        return Task.REPOSITORY_NAME;
    }
}