var _ = require('lodash')

module.exports = {
  clean: (text) => {
    return _.replace(_.trim(_.toLower(text)), /[.,\/#!$%\^&\*;:{}\[\]"=\-_`'~()]/g, "")
  }
}
