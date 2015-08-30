import _ = require('lodash');

class Customer {
    private name: string;

    getName() {
        return this.name;
    }

    setName(name: string) {
        this.name = name;
    }
    
    sayIfNumber(value: number) {
        return _.isNumber(value);
    }
}

export = Customer;