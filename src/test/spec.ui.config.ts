import chai = require('chai');
import _ = require('lodash');
import $ = require('jquery');

var expect = chai.expect;

describe('UI: Config', () => {
    var what;

    beforeEach(() => {
        what = 1;
    });

    it('should do a thing', () => {
        expect(what).to.equal(1);
    });

    it('should use lodash', () => {
        expect(_.startsWith('testing', 'test')).to.be.true;
    });

    it('should use jquery', () => {
        expect($.inArray('something', ['everything', 'nothing'])).to.equal(-1);
        expect($.inArray('something', ['everything', 'something'])).to.equal(1);
    });
});