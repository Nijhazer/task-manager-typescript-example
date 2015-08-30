import chai = require('chai');
import Customer = require('../core/customer');

var expect = chai.expect;

describe('Hmm What', () => {
    var what;
    var customer : Customer;
    
    beforeEach(function () {
        what = 1;
        customer = new Customer();
    });

    it('should correctly report the name', () => {
        customer.setName("Thomas");
        expect(customer.getName()).to.equal("Thomas");
    });
    
    it('should accurately report numbers', () => {
        expect(customer.sayIfNumber(5)).to.be.true;
    });
});