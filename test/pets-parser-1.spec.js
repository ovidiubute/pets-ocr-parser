var parser = require('../src/pets-parser-1')
var testData = require('./pets-ocr-data-1')
var chai = require('chai')
chai.should()
chai.use(require('chai-things'))

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

      chai.expect(st2[0].labelRegion).to.deep.equal([
        {"value":"client_id","boundingBox": "27,115,49,10"},
        {"value":"client_name","boundingBox": "27,129,69,10"},
        {"value":"address","boundingBox": "30,166,47,10"},
        {"value":"telephone","boundingBox": "26,207,60,13"}
      ])
      chai.expect(st2[1].labelRegion).to.deep.equal([
        {"value":"patient_id","boundingBox": "418,108,56,10"},
        {"value":"name","boundingBox": "418,123,34,9"},
        {"value":"species","boundingBox": "418,137,44,12"},
        {"value":"color","boundingBox": "418,207,31,10"},
        {"value":"microchip","boundingBox": "418,225,55,12"},
        {"value":"birth_date","boundingBox": "418,244,58,10"}
      ])
    })
  })

  describe('#stage3', function () {
    it('should return data for dataRegion', function () {
      var st1 = parser.stage1(testData)
      var st2 = parser.stage2(st1)
      var st3 = parser.stage3(st2)

      chai.expect(st3[0].dataRegion).to.deep.equal([
        {"value":" 214553","boundingBox":"131,108,41,10"},
        {"value":" Dr Herron, Andrew","boundingBox":"131,122,102,12"},
        {"value":" 7 Carlyle st","boundingBox":"131,159,63,12"},
        {"value":" Wollstonecraft, NSW 2065","boundingBox":"131,173,142,11"},
        {"value":" 9460 9943","boundingBox":"131,207,58,10"}
      ])
      chai.expect(st3[1].dataRegion).to.deep.equal([
        {"value":" 131657","boundingBox":"529,108,40,10"},
        {"value":" Eddie","boundingBox":"529,122,30,10"},
        {"value":" Feline","boundingBox":"529,137,32,10"},
        {"value":" Shorthair, Domestic","boundingBox":"529,166,108,11"},
        {"value":" Male","boundingBox":"529,190,25,10"},
        {"value":" Black","boundingBox":"529,207,29,10"},
        {"value":" 981000300550586","boundingBox":"529,225,103,10"},
        {"value":" 01-11-2011","boundingBox":"529,244,62,10"}
      ])
    })
  })

  describe('#stage4', function () {
    it('should match labels with values', function () {
      var st1 = parser.stage1(testData)
      var st2 = parser.stage2(st1)
      var st3 = parser.stage3(st2)
      var st4 = parser.stage4(st3)

      chai.expect(st4[0].labelRegion).to.deep.equal([
        {"boundingBox":"27,115,49,10","value":"client_id"},
        {"boundingBox":"27,129,69,10","value":"client_name"},
        {"boundingBox":"30,166,47,10","value":"address"}
      ])
      chai.expect(st4[0].dataRegion).to.deep.equal([
        {"value":" 214553"},
        {"value":" Dr Herron, Andrew"},
        {"value":" 7 Carlyle st  Wollstonecraft, NSW 2065"}
      ])
      chai.expect(st4[1].labelRegion).to.deep.equal([
        {"boundingBox":"418,108,56,10","value":"patient_id"},
        {"boundingBox":"418,123,34,9","value":"name"},
        {"boundingBox":"418,137,44,12","value":"species"}
      ])
      chai.expect(st4[1].dataRegion).to.deep.equal([
        {"value":" 131657"},
        {"value":" Eddie"},
        {"value":" Feline"}
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
        { label: 'patient_id', value: '131657' },
        { label: 'name', value: 'Eddie' },
        { label: 'species', value: 'Feline' }
      ])
    })
  })
})
