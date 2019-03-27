var seedrandom = require('seedrandom')

/**
 * new TextMaker({
 *   description: Object,
 *   seed: string
 * })
 */

const choice = function choice (array, random) {
  return array[Math.floor(random() * array.length)]
}

const regexSimpleChoice = /\[\[((?!\[\[).)*?\]\]/

const regexSustitution = /\$[\w]+/

class TextMaker {
  constructor (options) {
    this.description = options.description || {
      templates: []
    }
    this.random = seedrandom(options.seed)
  }

  generate (seed) {
    const random = seed ? seedrandom(seed) : this.random

    var txt = choice(this.description.templates, random)

    var unfinished = true

    while (unfinished) {
      unfinished = false
      txt = txt.replace(regexSimpleChoice, (match) => {
        unfinished = true
        return choice(match.substr(2, match.length - 4).split('-'), random)
      })
      txt = txt.replace(regexSustitution, (match) => {
        unfinished = true
        if (!this.description[match]) {
          console.log(match)
          return '#' + match.substr(1)
        }
        return choice(this.description[match], random)
      })
    }
    return txt
  }
}

module.exports = TextMaker
