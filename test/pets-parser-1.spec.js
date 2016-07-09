var parser = require('../src/pets-parser-1')
var testDatas = [
  require('./fixtures/pets-ocr-data-1'),
  require('./fixtures/pets-ocr-data-2')
]
var chai = require('chai')

describe('VET Parser', function () {
  describe('#flattenWords', function () {
    it('should flatten regions by merging all words per line', () => {
      chai.expect(parser.flattenWords(testDatas[0].regions)).to.deep.equal([
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

      chai.expect(parser.flattenWords(testDatas[1].regions)).to.deep.equal([
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
      let result = parser.pickDataRegions(parser.flattenWords(testDatas[0].regions))
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

      result = parser.pickDataRegions(parser.flattenWords(testDatas[1].regions))
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
      let result = parser.conjLabels(parser.pickDataRegions(parser.flattenWords(testDatas[0].regions)))
      chai.expect(result).to.deep.equal(
        [
          {
            labels: ['client_id', 'client_name', 'address', 'telephone'],
            data: ['214553', 'Dr Herron, Andrew', '7 Carlyle st', 'Wollstonecraft, NSW 2065', '9460 9943' ]
          },
          {
            labels: ['patient_id', 'name', 'species', 'color', 'breed', 'sex', 'microchip', 'birth_date'],
            data: [ '131657','Eddie','Feline','Shorthair, Domestic','Male','Black','981000300550586','01-11-2011' ]
          }
        ]
      )

      result = parser.conjLabels(parser.pickDataRegions(parser.flattenWords(testDatas[1].regions)))
      chai.expect(result).to.deep.equal(
        [
          {
            labels: ['client_id', 'client_name', 'address', 'telephone'],
            data: ['214553', 'Dr Herron. Andrew', '7 Carlyle st', 'Wollstonecraft. NSW 2065', '9460 9943' ]
          },
          {
            labels: ['patient_id', 'name', 'species', 'color', 'breed', 'sex', 'microchip', 'birth_date'],
            data: [ '431657,','Eddie','Feline','Shorthair, Domestic','Male','Black','981000300550586','01-11-2011' ]
          }
        ]
      )
    })
  })
})
