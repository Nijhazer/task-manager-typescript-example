import $ = require('jquery');

export interface IUIConfig {
    apiBaseURL: string;
}

export class EnvJSONUIConfig implements IUIConfig {
    private json: {};

    constructor(json: {}) {
        this.json = json;
    }

    public get apiBaseURL() {
        return this.json['UI_API_BASE_URL'];
    }
}

export class ConfigManager {
    public static loadFromURL(url: string) : Promise<IUIConfig> {
        return new Promise<IUIConfig>((resolve, reject) => {
            $.ajax({
                url: url,
                method: 'GET'
            }).done((response) => {
                resolve(new EnvJSONUIConfig(response));
            }).fail((error) => {
                reject(error);
            });
        });
    }
}