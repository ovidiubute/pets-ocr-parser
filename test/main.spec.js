var parser = require('../src/main')
var testDatas = {
  'ok-1': require('./fixtures/ok-1'),
  'bad-labels-1': require('./fixtures/bad-labels-1'),
  'bad-data-1': require('./fixtures/bad-data-1')
}

describe('Parser', () => {
  describe('#defaults', () => {
    it('should provide default values according to label config', () => {
      chai.expect(parser.defaults()).to.deep.equal({
        'client_id': 0,
        'client_name': '',
        'address': '',
        'telephone': '',
        'patient_id': 0,
        'name': '',
        'species': '',
        'breed': '',
        'sex': '',
        'color': '',
        'microchip': 0,
        'birth_date': ''
      })
    })
  })

  describe('#flattenWords', function () {
    it('should flatten regions by merging all words per line', () => {
      chai.expect(parser.flattenWords(testDatas['ok-1'].regions)).to.deep.equal([
        [
          "www.vetmed.com.au",
          "Vaccination & Health Certificate"
        ],
        [
          "Client ID:",
          "Client Name:",
          "Address:",
          "Telephone:"
        ],
        [
          "214553",
          "Dr Herron, Andrew",
          "7 Carlyle st",
          "Wollstonecraft, NSW 2065",
          "9460 9943"
        ],
        [
          "23-05-2016",
          "patient ID:",
          "Name:",
          "Species:",
          "Color:",
          "Microchip:",
          "Birth Date:"
        ],
        [
          "131657",
          "Eddie",
          "Feline",
          "Shorthair, Domestic",
          "Male",
          "Black",
          "981000300550586",
          "01-11-2011"
        ],
        [
          "I hereby certify that the above animal has had a general health check and vaccination. The following vaccinations are",
          "current.",
          "Points to remember:",
          "•Full protection after vaccination may take 2 weeks",
          "*A 6 monthly booster for bordetella is required for boarding otherwise a yearly vaccination is sufficient.",
          "*Vaccines are harmless.Therefore, if your pet shows signs of illness after vaccinations please contact us.",
          "•Heart worm prevention for dogs is an ongoing treatment, for life."
        ],
        [
          "*Worm regular every 3 months",
          "28-03-2013"
        ],
        [
          "Vaccination Description:",
          "Vaccination F3"
        ]
      ])

      chai.expect(parser.flattenWords(testDatas['bad-labels-1'].regions)).to.deep.equal([
        [
          "Randwjck NSW 2031"
        ],
        [
          "Northbridge NSW Å063"
        ],
        [
          "West Undfield NSW 2070"
        ],
        [
          "Vaccination & Health Certificate",
          "23-05-2016"
        ],
        [
          "aient1D:",
          "Client Name:",
          "Address:",
          "Telephone:"
        ],
        [
          "214553",
          "Dr Herron. Andrew",
          "7 Carlyle st",
          "Wollstonecraft. NSW 2065",
          "9460 9943"
        ],
        [
          "Patient ID:",
          "Species:",
          "Breed'/",
          "Sex,",
          "Color:",
          "Microchip:'",
          "Birth Date/"
        ],
        [
          "431657,",
          "Eddie",
          "Feline",
          "Shorthair, Domestic",
          "Male",
          "Black",
          "981000300550586",
          "01-11-2011"
        ],
        [
          "I hereby certify that the above animal has had a general health check and vaccination, the following vaccinations are"
        ],
        [
          "current:",
          "Points to remember:",
          "*Full protection after vaccination may take 2 weeks",
          "*A 6 monthl booster for bordetella is re uired for boardin otherwise a earl vaccinati"
        ],
        [
          "uffici n"
        ]
      ]
        )
    })
  })

  describe('#pickDataRegions', function () {
    it('should pick only regions with data', function () {
      let result = parser.pickDataRegions(parser.flattenWords(testDatas['ok-1'].regions))
      chai.expect(result).to.deep.equal(
        [
          {
            data: ['214553', 'Dr Herron, Andrew', '7 Carlyle st', 'Wollstonecraft, NSW 2065', '9460 9943' ]
          },
          {
            data: [ '131657','Eddie','Feline','Shorthair, Domestic','Male','Black','981000300550586','01-11-2011' ]
          }
        ]
      )

      result = parser.pickDataRegions(parser.flattenWords(testDatas['bad-labels-1'].regions))
      chai.expect(result).to.deep.equal(
        [
          {
            data: ['214553', 'Dr Herron. Andrew', '7 Carlyle st', 'Wollstonecraft. NSW 2065', '9460 9943' ]
          },
          {
            data: [ '431657,','Eddie','Feline','Shorthair, Domestic','Male','Black','981000300550586','01-11-2011' ]
          }
        ]
      )
    })
  })

  describe('#conjLabels', () => {
    it('should add labels from configuration', () => {
      let result = parser.conjLabels(parser.pickDataRegions(parser.flattenWords(testDatas['ok-1'].regions)))
      chai.expect(result).to.deep.equal(
        [
          {
            labels: ['client_id', 'client_name', 'address', 'telephone'],
            data: ['214553', 'Dr Herron, Andrew', '7 Carlyle st', 'Wollstonecraft, NSW 2065', '9460 9943' ]
          },
          {
            labels: ['patient_id', 'name', 'species', 'breed', 'sex', 'color', 'microchip', 'birth_date'],
            data: [ '131657','Eddie','Feline','Shorthair, Domestic','Male','Black','981000300550586','01-11-2011' ]
          }
        ]
      )

      result = parser.conjLabels(parser.pickDataRegions(parser.flattenWords(testDatas['bad-labels-1'].regions)))
      chai.expect(result).to.deep.equal(
        [
          {
            labels: ['client_id', 'client_name', 'address', 'telephone'],
            data: ['214553', 'Dr Herron. Andrew', '7 Carlyle st', 'Wollstonecraft. NSW 2065', '9460 9943' ]
          },
          {
            labels: ['patient_id', 'name', 'species', 'breed', 'sex', 'color', 'microchip', 'birth_date'],
            data: [ '431657,','Eddie','Feline','Shorthair, Domestic','Male','Black','981000300550586','01-11-2011' ]
          }
        ]
      )
    })
  })

  describe('#mergeData', () => {
    it('should merge or remove data from data section according to label config', () => {
      let result = parser.mergeData(parser.conjLabels(parser.pickDataRegions(parser.flattenWords(testDatas['ok-1'].regions))))
      chai.expect(result).to.deep.equal(
        [
          {
            labels: ['client_id', 'client_name', 'address', 'telephone'],
            data: ['214553', 'Dr Herron, Andrew', '7 Carlyle st Wollstonecraft, NSW 2065', '9460 9943' ]
          },
          {
            labels: ['patient_id', 'name', 'species', 'breed', 'sex', 'color', 'microchip', 'birth_date'],
            data: [ '131657','Eddie','Feline','Shorthair, Domestic','Male','Black','981000300550586','01-11-2011' ]
          }
        ]
      )

      result = parser.mergeData(parser.conjLabels(parser.pickDataRegions(parser.flattenWords(testDatas['bad-labels-1'].regions))))
      chai.expect(result).to.deep.equal(
        [
          {
            labels: ['client_id', 'client_name', 'address', 'telephone'],
            data: ['214553', 'Dr Herron. Andrew', '7 Carlyle st Wollstonecraft. NSW 2065', '9460 9943' ]
          },
          {
            labels: ['patient_id', 'name', 'species', 'breed', 'sex', 'color', 'microchip', 'birth_date'],
            data: [ '431657,','Eddie','Feline','Shorthair, Domestic','Male','Black','981000300550586','01-11-2011' ]
          }
        ]
      )
    })
  })

  describe('#zipLabelsWithData', () => {
    it('should return a list of objects where label is the key and the value is taken from data', () => {
      let result = parser.zipLabelsWithData(parser.mergeData(parser.conjLabels(parser.pickDataRegions(parser.flattenWords(testDatas['ok-1'].regions)))))
      chai.expect(result).to.deep.equal({
        'client_id': '214553',
        'client_name': 'Dr Herron, Andrew',
        'address': '7 Carlyle st Wollstonecraft, NSW 2065',
        'telephone': '9460 9943',
        'patient_id': '131657',
        'name': 'Eddie',
        'species': 'Feline',
        'breed': 'Shorthair, Domestic',
        'sex': 'Male',
        'color': 'Black',
        'microchip': '981000300550586',
        'birth_date': '01-11-2011'
      })

      result = parser.zipLabelsWithData(parser.mergeData(parser.conjLabels(parser.pickDataRegions(parser.flattenWords(testDatas['bad-labels-1'].regions)))))
      chai.expect(result).to.deep.equal({
        'client_id': '214553',
        'client_name': 'Dr Herron. Andrew',
        'address': '7 Carlyle st Wollstonecraft. NSW 2065',
        'telephone': '9460 9943',
        'patient_id': '431657,',
        'name': 'Eddie',
        'species': 'Feline',
        'breed': 'Shorthair, Domestic',
        'sex': 'Male',
        'color': 'Black',
        'microchip': '981000300550586',
        'birth_date': '01-11-2011'
      })
    })
  })

  describe('#applyDataTypes', () => {
    it('should return correct data types', () => {
      let result = parser.applyDataTypes(parser.zipLabelsWithData(parser.mergeData(parser.conjLabels(parser.pickDataRegions(parser.flattenWords(testDatas['ok-1'].regions))))))
      chai.expect(result).to.deep.equal({
        'client_id': 214553,
        'client_name': 'Dr Herron, Andrew',
        'address': '7 Carlyle st Wollstonecraft, NSW 2065',
        'telephone': '9460 9943',
        'patient_id': 131657,
        'name': 'Eddie',
        'species': 'Feline',
        'breed': 'Shorthair, Domestic',
        'sex': 'Male',
        'color': 'Black',
        'microchip': 981000300550586,
        'birth_date': '01-11-2011'
      })

      result = parser.applyDataTypes(parser.zipLabelsWithData(parser.mergeData(parser.conjLabels(parser.pickDataRegions(parser.flattenWords(testDatas['bad-labels-1'].regions))))))
      chai.expect(result).to.deep.equal({
        'client_id': 214553,
        'client_name': 'Dr Herron. Andrew',
        'address': '7 Carlyle st Wollstonecraft. NSW 2065',
        'telephone': '9460 9943',
        'patient_id': 431657,
        'name': 'Eddie',
        'species': 'Feline',
        'breed': 'Shorthair, Domestic',
        'sex': 'Male',
        'color': 'Black',
        'microchip': 981000300550586,
        'birth_date': '01-11-2011'
      })
    })
  })

  describe('#parse', () => {
    it('should apply all data transformation functions', () => {
      let result = parser.parse(testDatas['ok-1'])
      chai.expect(result).to.deep.equal({
        'client_id': 214553,
        'client_name': 'Dr Herron, Andrew',
        'address': '7 Carlyle st Wollstonecraft, NSW 2065',
        'telephone': '9460 9943',
        'patient_id': 131657,
        'name': 'Eddie',
        'species': 'Feline',
        'breed': 'Shorthair, Domestic',
        'sex': 'Male',
        'color': 'Black',
        'microchip': 981000300550586,
        'birth_date': '01-11-2011'
      })

      result = parser.parse(testDatas['bad-labels-1'])
      chai.expect(result).to.deep.equal({
        'client_id': 214553,
        'client_name': 'Dr Herron. Andrew',
        'address': '7 Carlyle st Wollstonecraft. NSW 2065',
        'telephone': '9460 9943',
        'patient_id': 431657,
        'name': 'Eddie',
        'species': 'Feline',
        'breed': 'Shorthair, Domestic',
        'sex': 'Male',
        'color': 'Black',
        'microchip': 981000300550586,
        'birth_date': '01-11-2011'
      })

      result = parser.parse(testDatas['bad-data-1'])
      chai.expect(result).to.deep.equal({
        'client_id': 214553,
        'client_name': 'Dr Herron. Andrew',
        'address': '7 Carlyle st Wollstonecraft. NSW 2065',
        'telephone': '9460 9943',
        'patient_id': 131657,
        'name': 'Eddie',
        'species': 'Feline',
        'breed': 'Shorthair Domestic',
        'sex': 'Male',
        'color': 'Black',
        'microchip': 981000300550586,
        'birth_date': '01-11-2011'
      })
    })

    it('should return defaults in case of non-JSON input data', () => {
      chai.expect(parser.parse('nojsonhere')).to.deep.equal(parser.defaults())
      chai.expect(parser.parse('<xml></xml>')).to.deep.equal(parser.defaults())
      chai.expect(parser.parse('')).to.deep.equal(parser.defaults())
      chai.expect(parser.parse(3000)).to.deep.equal(parser.defaults())
      chai.expect(parser.parse(['3','4','5'])).to.deep.equal(parser.defaults())
      chai.expect(parser.parse({'a':2})).to.deep.equal(parser.defaults())
      chai.expect(parser.parse({})).to.deep.equal(parser.defaults())
    })

    it('should return defaults in case of incorrect JSON input data', () => {
      chai.expect(parser.parse(
        JSON.stringify({
          "shouldberegionshere": [{
        		"boundingBox": "1031,87,446,55",
        		"lines": [{
        			"boundingBox": "1031,87,446,55",
        			"words": [{
        				"boundingBox": "1031,91,136,51",
        				"text": "ealth"
        			}, {
        				"boundingBox": "1185,87,292,52",
        				"text": "Certificate"
        			}]
        		}]
        	}]
        })
      )).to.deep.equal(parser.defaults())
    })
  })
})
