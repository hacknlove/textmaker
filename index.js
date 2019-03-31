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

const regexSetVariable = /\(\([\w]+:((?!\[\[).)*?\)\)/

const regexVariableSustitution = /%[\w]+/

class TextMaker {
  constructor (options) {
    this.description = options.description || {
      templates: []
    }
    this.__random = seedrandom(options.seed)
  }

  setVariables () {
    var unfinished = true
    while (unfinished) {
      unfinished = false
      this.txt = this.txt.replace(regexSetVariable, match => {
        unfinished = true
        const v = match.substr(2, match.length - 4).split('-')
        this.variables[v[0]] = v[1]
        return ''
      })
    }
    this.next = this.variableSustitution
  }

  variableSustitution () {
    Object.keys(this.variables).forEach(k => {
      const regex = new RegExp(`%${k}`, 'g')
      this.txt.replace(regex, this.variables[k])
    })
    this.next = this.simpleChoice
  }

  simpleChoice () {
    var unfinished = true
    var sustitutions = false
    while (unfinished) {
      unfinished = false
      this.txt = this.txt.replace(regexSimpleChoice, (match) => {
        unfinished = true
        sustitutions = true
        return choice(match.substr(2, match.length - 4).split('-'), this.random)
      })
    }
    if (sustitutions) {
      this.next = this.setVariables
    } else {
      this.next = this.sustitutions
    }
  }

  sustitutions () {
    var unfinished = true
    var sustitutions = false
    while (unfinished) {
      unfinished = false
      this.txt = this.txt.replace(regexSustitution, (match) => {
        unfinished = true
        sustitutions = true
        if (!this.description[match]) {
          console.log(match)
          return '#' + match.substr(1)
        }
        return choice(this.description[match], this.random)
      })
    }
    if (sustitutions) {
      this.next = this.setVariables
    } else {
      this.next = false
    }
  }

  procesar () {
    while (this.next) {
      this.next()
    }
  }

  generate (seed) {
    this.random = seed ? seedrandom(seed) : this.__random

    this.variables = {}

    this.txt = choice(this.description.templates, this.random)

    this.next = this.setVariables
    this.procesar()

    return this.txt
  }
}

module.exports = TextMaker
