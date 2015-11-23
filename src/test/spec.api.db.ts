import chai = require('chai');
import _ = require('lodash');

var expect = chai.expect;

describe('Hmm What', () => {
    var what;

    beforeEach(() => {
        what = 1;
    });

    it('should accurately report numbers', () => {
        expect(what).to.equal(1);
    });

    it('should use lodash', () => {
        expect(_.startsWith('testing', 'test')).to.be.true;
    });
});