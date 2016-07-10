var helpers = require('../src/helpers')

describe('Helpers', () => {
  describe('#clean', () => {
    it('should remove all punctuation and transform to lowercase', () => {
      ['Client-ID', 'Client&^%ID', '!Client--/.,ID'].map((term) => {
        chai.expect(helpers.clean(term)).to.equal('clientid')
      })
    })
  })
})
