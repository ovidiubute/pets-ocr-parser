const _ = require('lodash')
const LABELS = require('./config/labels')
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

// Add labels from configuration
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

// Merge or remove from data section
function mergeData(contentRegions) {
  return _.map(contentRegions, (contentRegion, contentRegionIndex) => {
    let dataLengthDiff = contentRegion.data.length - contentRegion.labels.length
    if (dataLengthDiff) {
      // We may have an overflowable field, or
      // OCR has detected more data than needed
      // We can check the second case by some type inference
      let overflowableLabels = _.map(_.filter(LABELS, (label) => {
        return label.meta.data.canOverflow && label.position === contentRegionIndex
      }), label => label.slug)
      let currentSectionLabels = _.map(_.filter(LABELS, (label) => {
        return label.position === contentRegionIndex
      }), label => label.slug)

      if (overflowableLabels.length) {
        let overflowableLabel = overflowableLabels[0]
        if (_.includes(contentRegion.labels, overflowableLabel)) {
          // We have overflowable data, go ahead and merge
          // NOTE: this will only work with one overflowable data per section,
          // otherwise there's no way to determine how many lines each data/label
          // has overflown
          let overflowIndex = _.indexOf(currentSectionLabels, overflowableLabel)
          let newData = _.concat(
            // First elements until index of overflowed data
            _.take(contentRegion.data, overflowIndex),
            // First overflowed element
            _.nth(contentRegion.data, overflowIndex),
            // Last elements excluding overflowed elements
            _.takeRight(contentRegion.data, contentRegion.data.length - overflowIndex - dataLengthDiff - 1)
          )
          // Modify to merge sections
          newData[overflowIndex] += ' ' + _.join(_.map(_.range(0, dataLengthDiff), (offset) => {
            return _.nth(contentRegion.data, overflowIndex + offset + 1)
          }), ' ')

          // Finally, update
          contentRegion.data = newData
        }
      }
    }

    return contentRegion
  })
}

function zipLabelsWithData(contentRegions) {
  return _.reduce([0, 1].map((index) => {
    return _.zipObject(contentRegions[index].labels, contentRegions[index].data)
  }), (accum, value) => {
    _.extend(accum, value)

    return accum
  }, {})
}

function applyDataTypes(structuredData) {
  _.forEach(LABELS, (label) => {
    // Clean number typed data because otherwise it may fail at _.toNumber
    let dataType = label.meta.data.type
    if (dataType === 'Number' || dataType === 'Integer') {
      _.set(structuredData, label.slug, helpers.clean(_.get(structuredData, label.slug)))
    }

    // Apply type conversion
    let typeFn = _[`to${dataType}`]
    _.set(structuredData, label.slug, typeFn.call(null, _.get(structuredData, label.slug)))
  })

  return structuredData
}

function defaultValue(configLabel) {
  return (configLabel.meta.data.type === 'String' ? '' :
    configLabel.meta.data.type === 'Number' ||
    configLabel.meta.data.type === 'Integer' ? 0 : null
  )
}

function defaults() {
  return _.reduce(_.map(LABELS, (label) => {
    return {
      label: label.slug,
      value: defaultValue(label)
    }
  }), (accum, obj) => {
    accum[obj.label] = obj.value

    return accum
  }, {})
}

function parse(data) {
  try {
    return _.flow([
      flattenWords,
      pickDataRegions,
      conjLabels,
      mergeData,
      zipLabelsWithData,
      applyDataTypes
    ])(data.regions)
  } catch (e) {
    return defaults()
  }
}

module.exports = {
  flattenWords,
  pickDataRegions,
  conjLabels,
  mergeData,
  zipLabelsWithData,
  applyDataTypes,
  defaults,
  parse
}
