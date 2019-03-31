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

const regexSustitution1 = /^.*?\$[\w%$]+/
const regexSustitution2 = /\$[^$]+$/

const regexSetVariable = /\(\(([\w]+):(((?!\(\().)*?)\)\)/

class TextMaker {
  constructor (options) {
    options = options || {}
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
        const v = match.match(regexSetVariable)
        this.variables[v[1]] = v[2]
        return ''
      })
    }
  }

  variableSustitution () {
    Object.keys(this.variables).forEach(k => {
      const regex = new RegExp(`%${k}`, 'g')
      this.txt = this.txt.replace(regex, this.variables[k])
    })
  }

  simpleChoice () {
    var unfinished = true
    while (unfinished) {
      unfinished = false
      this.txt = this.txt.replace(regexSimpleChoice, (match) => {
        unfinished = true
        return choice(match.substr(2, match.length - 4).split('-'), this.random)
      })
    }
  }

  sustitutions () {
    this.unfinished = false
    const processed = []
    console.log(this.txt)
    while (true) {
      const match = this.txt.match(regexSustitution1)
      console.log(match)
      if (!match) {
        this.txt = processed.join('') + this.txt
        console.log(this.txt)
        return
      }
      console.log('ok')
      if (match[0].includes('%')) {
        processed.push(match[0])
        this.txt = this.txt.substr(match[0].length)
        continue
      }
      this.unfinished = true
      const match2 = match[0].match(regexSustitution2)

      processed.push(match[0].substr(0, match2.index))

      if (this.description[match2[0]]) {
        processed.push(this.description[match2[0]] ? choice(this.description[match2[0]], this.random) : match2[0])
      }

      this.txt = this.txt.substr(match[0].length)

      continue
    }
  }

  generate (seed) {
    this.random = seed ? seedrandom(seed) : this.__random

    this.variables = {}

    this.txt = choice(this.description.templates, this.random)

    this.next = this.setVariables
    this.unfinished = true
    while (this.unfinished) {
      console.log(this.txt)
      this.setVariables()
      console.log(this.txt)
      this.variableSustitution()
      console.log(this.txt)
      this.simpleChoice()
      console.log(this.txt)
      this.sustitutions()
      console.log(this.txt)
    }

    return this.txt
  }
}

module.exports = TextMaker
