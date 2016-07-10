const words = require('../src/config/words')

describe('Words', () => {
  it('should return list of words based on configured labels', () => {
    chai.expect(words).to.deep.equal([
      'Client ID',
      'Client Name',
      'Address',
      'Telephone',
      'Patient ID',
      'Name',
      'Species',
      'Breed',
      'sex',
      'Color',
      'Microchip',
      'Birth Date'
    ])
  })
})
