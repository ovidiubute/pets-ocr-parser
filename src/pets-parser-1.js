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

function conjLabels(contentRegions) {
  return _.map(contentRegions, (contentRegion, contentIndex) => {
    return {
      labels: _.map(_.filter(LABELS, (label) => {
        return label.position == contentIndex
      }), label => label.slug),
      data: contentRegion.data
    }
  })
}

module.exports = {
  flattenWords,
  pickDataRegions,
  conjLabels
}
