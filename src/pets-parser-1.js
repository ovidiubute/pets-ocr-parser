const _ = require('lodash')
const LABELS = require('./labels')
const helpers = require('./helpers')

// Transform to regions only with words merged by line
function flattenWords(rawRegions) {
  return rawRegions.map((region) => {
    return region.lines.map((line) => {
      return _.join(line.words.map(word => word.text), ' ')
    })
  })
  return result
}

// Filter out regions that do not contain labels by configuration
function pickDataRegions(contentRegions) {
  contentRegionIndexes = []
  contentRegions.forEach((contentRegion, contentIndex) => {
    let labelsFound = 0
    contentRegion.forEach((text, textIndex) => {
      LABELS.forEach((label, index) => {
        if (_.snakeCase(helpers.clean(text)) === label.slug) {
          labelsFound++
        }
      })
    })
    if (labelsFound >= 2) {
      contentRegionIndexes.push(contentIndex + 1)
    }
  })

  return contentRegionIndexes.map((idx) => {
    return {
      data: contentRegions[idx]
    }
  })
}

// function transformLabels(labelDataPairs) {
//   return labelDataPairs.map((labelDataPair) => {
//     return [labelDataPair[0].map((label) => {
//       return _.snakeCase(helpers.clean(label))
//     }), labelDataPair[1]]
//   })
// }
//
// function fixMissingLabels(labelDataPairs) {
//   if (labelDataPairs.length !== 2) {
//     throw new Error('fixMissingLabels cannot continue, length input data != 2')
//   }
//
//   let ldp = _.cloneDeep(labelDataPairs)
//   return _.map([0, 1], (labelPosition) => {
//     let currentLabels = _.filter(LABELS, (label) => {
//       return label.position == labelPosition
//     })
//
//     // Test if we have the same labels
//     let isIdentical = _.reduce(ldp[labelPosition][0], (accum, label, index) => {
//       return accum && (label === currentLabels[index].slug)
//     }, true)
//
//     if (!isIdentical) {
//       // Check which labels have not been detected or which ones are extra
//       // Also check spelling as we may have the labels but under diff. names
//       let currentLabelSlugs = _.map(currentLabels, curLabel => curLabel.slug)
//       let diffLabels = _.difference(ldp[labelPosition][0], currentLabelSlugs)
//
//       if (diffLabels.length) {
//         // Extra labels?
//         _.forEach(diffLabels, (diffLabel) => {
//           autoCorrectLabel = helpers.autocorrect(diffLabel)
//
//           // We will always get a result, but has it already been found?
//           if (_.includes(ldp[labelPosition][0], autoCorrectLabel)) {
//             // Remove this label -- mutating array!
//             _.pull(ldp[labelPosition][0], autoCorrectLabel)
//           } else {
//             // We've found our label, replace it
//             ldp[labelPosition][0] = _.reject(ldp[labelPosition][0], (value) => {
//               return value === diffLabel
//             })
//           }
//         })
//       }
//     }
//
//     return ldp[labelPosition]
//   })
// }

// function mapLabelsToValues(labelDataPairs) {
//   return _.map(labelDataPairs, (labelDataPair) => {
//     if (labelDataPair[0].length === labelDataPair[1].length) {
//       return labelDataPair
//     } else {
//       let diff = labelDataPair[1].length - labelDataPair[0].length
//       overflowableLabel = _.find(LABELS, (configLabel) => {
//         return configLabel.meta.data.canOverflow
//       })
//
//       let overflowableIndex = -1
//       labelDataPair[0].forEach((label, labelIndex) => {
//         if (label === overflowableLabel.slug) {
//           overflowableIndex = labelIndex
//           false
//         }
//       })
//
//       let newValueList = []
//       if (overflowableIndex > -1) {
//         for (let i = 0; i < labelDataPair[0].length; i++) {
//           if (i == overflowableIndex) {
//             newValueList[i] = _.range(i, i + diff).map((idx) => {
//               return labelDataPair[1][idx]
//             }).join(' ')
//           } else {
//             newValueList[i] = labelDataPair[1][i]
//           }
//         }
//       }
//
//       return _.zip(labelDataPair[0], newValueList)
//     }
//   })
//
//   return result
// }

module.exports = {
  flattenWords,
  pickDataRegions
}

// function _isWordInteresting(text) {
//   return _.includes(INTERESTING_WORDS, _cleanText(text))
// }
//
// function _findIndexOfInterestingRegions(regions) {
//   return (
//     _.map(
//       _.keys(
//         _.pickBy(
//           regions,
//           function(region, index) {
//             var score = _.reduce(
//               region.lines,
//               function (lineSum, line) {
//                 return lineSum + _.reduce(
//                   line.words,
//                   function (wordSum, word) {
//                     return wordSum + _isWordInteresting(word.text)
//                   },
//                   0
//                 )
//               },
//               0
//             )
//             return score >= INTERESTING_SCORE_THRESHOLD
//           }
//         )
//       ),
//       function (key) {
//         // Keys returned by _.keys are Strings, we need numbers later
//         return _.toNumber(key)
//       }
//     )
//   )
// }
//
// // Filter out uninteresting boxes, output list of labelRegion/dataRegion
// function stage1(input) {
//   var interestingIndexes = _findIndexOfInterestingRegions(input.regions)
//
//   return _.map(interestingIndexes, function (index) {
//     return {
//       labelRegion: input.regions[index],
//       dataRegion: input.regions[index + 1]
//     }
//   })
// }
//
// // Normalize data from labelRegion
// function stage2(input) {
//   return _.map(input, function (labelDataPair) {
//     return {
//       dataRegion: labelDataPair.dataRegion,
//       labelRegion: _.map(_.filter(
//         _.map(labelDataPair.labelRegion.lines, function (line) {
//           // At this stage we may get a label that has nothing to do
//           // with our interesting labels, so we completely filter them out
//           var areAllWordsInvalid = _.every(_.map(line.words, function (word) {
//             return _isWordInteresting(word.text)
//           }), function (v) {
//             return !v
//           })
//
//           // This is inside _.map so mark them and filter later...
//           return {
//             isValid: !areAllWordsInvalid,
//             value: _.snakeCase(_.reduce(line.words, function (mergedWord, word) {
//               return _.toString(mergedWord) + ' ' + _.toString(word.text)
//             }, '')),
//             boundingBox: line.boundingBox
//           }
//         }), function (labelObject) {
//           return labelObject.isValid
//         }), function (obj) {
//           // Remove isValid
//           return {
//             boundingBox: obj.boundingBox,
//             value: obj.value
//           }
//         })
//     }
//   })
// }
//
// // Normalize data from dataRegion
// function stage3(input) {
//   return _.map(input, function (labelDataPair) {
//     return {
//       labelRegion: labelDataPair.labelRegion,
//       dataRegion: _.map(labelDataPair.dataRegion.lines, function (line) {
//         return {
//           value: _.reduce(line.words, function (mergedWord, word) {
//             return mergedWord + ' ' + word.text
//           }, ''),
//           boundingBox: line.boundingBox
//         }
//       })
//     }
//   })
// }
//
// // Match labels with values based on boundingBox
// function stage4(input) {
//   // We may get lucky...
//   var perfectMatch = _.every(input, function (regionObject) {
//     regionObject.labelRegion.length === regionObject.dataRegion.length
//   })
//
//   if (!perfectMatch) {
//     // No luck :-(
//     var Y_AXIS_PIXEL_THRESHOLD = _lineHeight(input)
//
//     _.forEach(input, function (regionObject) {
//       var results = []
//       var overflowed = 0
//       for (var i = 0; i < regionObject.labelRegion.length; i++) {
//         var labelYAxisValue = _yAxis(regionObject.labelRegion[i])
//         var dataYRange = _.range(labelYAxisValue - Y_AXIS_PIXEL_THRESHOLD,
//           labelYAxisValue)
//
//         if (_.includes(ALLOWED_TO_OVERFLOW, regionObject.labelRegion[i].value)) {
//           var potentialValue = regionObject.dataRegion[i].value
//           for (var j = i + 1; j < i + MAX_OVERFLOW_LINES; j++) {
//             if (j >= regionObject.dataRegion.length ||
//                 j >= regionObject.labelRegion.length) {
//               continue
//             }
//             var jLabelYAxisValue = _yAxis(regionObject.labelRegion[j])
//             var jDataYAxisValue = _yAxis(regionObject.dataRegion[j])
//
//             if ((jLabelYAxisValue - jDataYAxisValue) > Y_AXIS_PIXEL_THRESHOLD) {
//               potentialValue += ' ' + regionObject.dataRegion[j].value
//               overflowed++
//             }
//           }
//
//           results.push({
//             value: potentialValue
//           })
//         } else {
//           var searchIndex = i
//           if (overflowed) {
//             searchIndex += overflowed
//           }
//           var dataYAxisValue = _yAxis(regionObject.dataRegion[searchIndex])
//
//           if (dataYAxisValue === labelYAxisValue) {
//             console.log(labelYAxisValue)
//           }
//           if (dataYAxisValue === labelYAxisValue ||
//             _.includes(dataYRange, dataYAxisValue)) {
//               results.push({
//                 value: regionObject.dataRegion[searchIndex].value
//               })
//           } else {
//             // Not found so probably labels were skipped by ocrData
//             // Do a full scan before giving up
//             for (var q = 0; q < regionObject.dataRegion.length; q++) {
//               var qDataYAxisValue = _yAxis(regionObject.dataRegion[q])
//               if (qDataYAxisValue === labelYAxisValue ||
//                 _.includes(dataYRange, qDataYAxisValue)) {
//
//                 results.push({
//                   value: regionObject.dataRegion[q].value
//                 })
//               }
//             }
//           }
//         }
//       }
//       regionObject.dataRegion = results
//     })
//   }
//
//   return input
// }
//
// // Pretty print (remove boundingBox, etc.) for library users
// function stage5(input) {
//   var results = []
//   for (var i = 0; i < input.length; i++) {
//     for (var j = 0; j < input[i].labelRegion.length; j++) {
//       results.push({
//         label: input[i].labelRegion[j].value,
//         value: _.trim(input[i].dataRegion[j].value)
//       })
//     }
//   }
//   return results
// }
//
// module.exports = {
//   parse: function (ocrData) {
//     return _.flow([stage1, stage2, stage3, stage4, stage5])(ocrData)
//   },
//   stage1: stage1,
//   stage2: stage2,
//   stage3: stage3,
//   stage4: stage4
// }
