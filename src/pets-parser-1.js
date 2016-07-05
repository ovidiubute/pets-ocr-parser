var _ = require('lodash')

// Const
var INTERESTING_WORDS = [
  'client',
  'patient',
  'name',
  'species',
  'sex',
  'breed',
  'microchip',
  'birth',
  'address',
  'telephone',
  'color'
]
var ALLOWED_TO_OVERFLOW = [
  'address'
]
var INTERESTING_SCORE_THRESHOLD = 4
var MAX_OVERFLOW_LINES = 3
var Y_AXIS_PIXEL_THRESHOLD = 10

function _cleanText(input) {
  return _.replace(_.trim(_.toLower(input)), /[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
}

function _isWordInteresting(input) {
  return _.includes(INTERESTING_WORDS, _cleanText(input))
}

function _findIndexOfInterestingRegions(regions) {
  return _.map(_.keys(_.pickBy(regions, function(region, index) {
    var score = _.reduce(region.lines, function (lineSum, line) {
      return lineSum + _.reduce(line.words, function (wordSum, word) {
        return wordSum + _isWordInteresting(word.text)
      }, 0)
    }, 0)
    return score >= INTERESTING_SCORE_THRESHOLD
  })), function (key) {
    // Keys returned by _.keys are Strings, we need numbers later
    return _.toNumber(key)
  })
}

function _yAxis(input) {
  return _.toNumber(input.boundingBox.split(',')[1])
}

// Filter out uninteresting boxes, output list of labelRegion/dataRegion
function stage1(input) {
  var interestingIndexes = _findIndexOfInterestingRegions(input.regions)

  return _.map(interestingIndexes, function (index) {
    return {
      labelRegion: input.regions[index],
      dataRegion: input.regions[index + 1]
    }
  })
}

// Normalize data from labelRegion
function stage2(input) {
  return _.map(input, function (labelDataPair) {
    return {
      dataRegion: labelDataPair.dataRegion,
      labelRegion: _.map(_.filter(
        _.map(labelDataPair.labelRegion.lines, function (line) {
          // At this stage we may get a label that has nothing to do
          // with our interesting labels, so we completely filter them out
          var areAllWordsInvalid = _.every(_.map(line.words, function (word) {
            return _isWordInteresting(word.text)
          }), function (v) {
            return !v
          })

          // This is inside _.map so mark them and filter later...
          return {
            isValid: !areAllWordsInvalid,
            value: _.snakeCase(_.reduce(line.words, function (mergedWord, word) {
              return _.toString(mergedWord) + ' ' + _.toString(word.text)
            }, '')),
            boundingBox: line.boundingBox
          }
        }), function (labelObject) {
          return labelObject.isValid
        }), function (obj) {
          // Remove isValid
          return {
            boundingBox: obj.boundingBox,
            value: obj.value
          }
        })
    }
  })
}

// Normalize data from dataRegion
function stage3(input) {
  return _.map(input, function (labelDataPair) {
    return {
      labelRegion: labelDataPair.labelRegion,
      dataRegion: _.map(labelDataPair.dataRegion.lines, function (line) {
        return {
          value: _.reduce(line.words, function (mergedWord, word) {
            return mergedWord + ' ' + word.text
          }, ''),
          boundingBox: line.boundingBox
        }
      })
    }
  })
}

// Match labels with values based on boundingBox
function stage4(input) {
  // We may get lucky...
  var perfectMatch = _.every(input, function (regionObject) {
    regionObject.labelRegion.length === regionObject.dataRegion.length
  })

  if (!perfectMatch) {
    // No luck :-(
    _.forEach(input, function (regionObject) {
      var results = []
      var overflowed = 0
      for (var i = 0; i < regionObject.labelRegion.length; i++) {
        var labelYAxisValue = _yAxis(regionObject.labelRegion[i])
        var dataYRange = _.range(labelYAxisValue - Y_AXIS_PIXEL_THRESHOLD,
          labelYAxisValue + Y_AXIS_PIXEL_THRESHOLD)

        if (_.includes(ALLOWED_TO_OVERFLOW, regionObject.labelRegion[i].value)) {
          var potentialValue = regionObject.dataRegion[i].value
          for (var j = i + 1; j < i + MAX_OVERFLOW_LINES; j++) {
            if (j >= regionObject.dataRegion.length ||
                j >= regionObject.labelRegion.length) {
              continue
            }
            var jLabelYAxisValue = _yAxis(regionObject.labelRegion[j])
            var jDataYAxisValue = _yAxis(regionObject.dataRegion[j])

            if ((jLabelYAxisValue - jDataYAxisValue) > Y_AXIS_PIXEL_THRESHOLD) {
              potentialValue += ' ' + regionObject.dataRegion[j].value
              overflowed++
            }
          }

          if (potentialValue !== '') {
            results.push({
              value: potentialValue
            })
          }
        } else {
          var searchIndex = i
          if (overflowed) {
            searchIndex += overflowed
          }
          var dataYAxisValue = _yAxis(regionObject.dataRegion[searchIndex])

          if (_.includes(dataYRange, dataYAxisValue)) {
            results.push({
              value: regionObject.dataRegion[searchIndex].value
            })
          } else {
            // Not found so probably labels were skipped by ocrData
            // Do a full scan before giving up
            for (var q = 0; q < regionObject.dataRegion.length; q++) {
              var qDataYAxisValue = _yAxis(regionObject.dataRegion[q])
              if (_.includes(dataYRange, qDataYAxisValue)) {
                results.push({
                  value: regionObject.dataRegion[q].value
                })
              }
            }
          }
        }
      }
      regionObject.dataRegion = results
    })
  }

  return input
}

// Pretty print (remove boundingBox, etc.) for library users
function stage5(input) {
  var results = []
  for (var i = 0; i < input.length; i++) {
    for (var j = 0; j < input[i].labelRegion.length; j++) {
      results.push({
        label: input[i].labelRegion[j].value,
        value: _.trim(input[i].dataRegion[j].value)
      })
    }
  }
  return results
}

module.exports = {
  parse: function (ocrData) {
    return _.flow([stage1, stage2, stage3, stage4, stage5])(ocrData)
  },
  stage1: stage1,
  stage2: stage2,
  stage3: stage3,
  stage4: stage4
}
