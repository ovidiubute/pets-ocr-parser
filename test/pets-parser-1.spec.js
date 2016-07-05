var parser = require('../src/pets-parser-1')
var testData = require('./pets-ocr-data-1')
var chai = require('chai')

describe('Pets Parser #1', function () {
  describe('#stage1', function () {
    it('should only return regions containing interesting words', function () {
      var regions = parser.stage1(testData)
      chai.expect(regions.length).to.equal(2)
      for (var i = 0; i < 2; i++) {
        chai.expect(regions[i].labelRegion).not.equal(undefined)
        chai.expect(regions[i].dataRegion).not.equal(undefined)
      }
    })
  })

  describe('#stage2', function () {
    it('should return snake case labels for labelRegion', function () {
      var st1 = parser.stage1(testData)
      var st2 = parser.stage2(st1)

      chai.expect(st2[0].labelRegion.map(l => l.value)).to.deep.equal([
        'client_id', 'client_name', 'address', 'telephone'
      ])
      chai.expect(st2[1].labelRegion.map(l => l.value)).to.deep.equal([
        'patient_id', 'name', 'species', 'color', 'microchip', 'birth_date'
      ])
    })
  })

  describe('#stage3', function () {
    it('should return data for dataRegion', function () {
      var st1 = parser.stage1(testData)
      var st2 = parser.stage2(st1)
      var st3 = parser.stage3(st2)

      chai.expect(st3[0].dataRegion.map(l => l.value)).to.deep.equal([
        ' 214553', ' Dr Herron, Andrew', ' 7 Carlyle st',
        ' Wollstonecraft, NSW 2065', ' 9460 9943'
      ])
      chai.expect(st3[1].dataRegion.map(l => l.value)).to.deep.equal([
        ' 131657', ' Eddie', ' Feline', ' Shorthair, Domestic',
        ' Male', ' Black', ' 981000300550586', ' 01-11-2011'
      ])
    })
  })

  describe('#stage4', function () {
    it('should match labels with values', function () {
      var st1 = parser.stage1(testData)
      var st2 = parser.stage2(st1)
      var st3 = parser.stage3(st2)
      var st4 = parser.stage4(st3)

      chai.expect(st4[0].labelRegion.map(l => l.value)).to.deep.equal([
        'client_id', 'client_name', 'address', 'telephone'
      ])
      chai.expect(st4[0].dataRegion.map(l => l.value)).to.deep.equal([
        ' 214553', ' Dr Herron, Andrew',
        ' 7 Carlyle st  Wollstonecraft, NSW 2065', ' 9460 9943'
      ])
      chai.expect(st4[1].labelRegion.map(l => l.value)).to.deep.equal([
        'patient_id', 'name', 'species', 'color', 'microchip', 'birth_date'
      ])
      chai.expect(st4[1].dataRegion.map(l => l.value)).to.deep.equal([
        ' 131657', ' Eddie', ' Feline',
        ' Black', ' 981000300550586', ' 01-11-2011'
      ])
    })
  })

  describe('#parse', function () {
    it('should return key/value list from ocr data', function () {
      var structuredData = parser.parse(testData)

      chai.expect(structuredData).to.deep.equal([
        { label: 'client_id', value: '214553' },
        { label: 'client_name', value: 'Dr Herron, Andrew' },
        { label: 'address', value: '7 Carlyle st  Wollstonecraft, NSW 2065' },
        { label: 'telephone', value: '9460 9943' },
        { label: 'patient_id', value: '131657' },
        { label: 'name', value: 'Eddie' },
        { label: 'species', value: 'Feline' },
        { label: 'color', value: 'Black' },
        { label: 'microchip', value: '981000300550586' },
        { label: 'birth_date', value: '01-11-2011' }
      ])
    })
  })
})
