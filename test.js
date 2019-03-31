const test = require('ava')
const TextMaker = require('./index')

test('importing TextMaker', t => {
  const TextMaker = require('./index')
  t.assert(TextMaker)
  t.is(typeof TextMaker, 'function')
  t.throws(TextMaker)
})

test('instanciating TextMaker without params', t => {
  const textMaker = new TextMaker()
  t.assert(textMaker)
  t.is(typeof textMaker, 'object')
  t.is(typeof textMaker.generate, 'function')
})

test('instanciating TextMaker with description', t => {
  const textMaker = new TextMaker({
    description: 'description'
  })
  t.is(textMaker.description, 'description')
})

test('instanciating TextMaker with seed', t => {
  const sameseed1 = new TextMaker({
    seed: 'SAME SEED'
  })
  const sameseed2 = new TextMaker({
    seed: 'SAME SEED'
  })
  const otherseed = new TextMaker({
    seed: 'OTHER SEED'
  })
  for (let i = 10; i--;) {
    const a = [sameseed1.__random(), sameseed2.__random(), otherseed.__random()]
    t.is(a[0], a[1])
    t.not(a[0], a[2])
  }
})

test('setVariables', t => {
  const textMaker = new TextMaker()

  textMaker.variables = {}

  textMaker.txt = 'foo((clave:valor))bar((otraClave:otroValor))buz'

  textMaker.setVariables()

  t.is(textMaker.txt, 'foobarbuz')

  t.deepEqual(textMaker.variables, {
    clave: 'valor',
    otraClave: 'otroValor'
  })
})

test('variableSustitution', t => {
  const textMaker = new TextMaker()

  textMaker.variables = {
    clave: 'valor',
    otraClave: 'otroValor'
  }

  textMaker.txt = 'foo%clave %otraClave'

  textMaker.variableSustitution()

  t.is(textMaker.txt, 'foovalor otroValor')
})

test('simpleChoice', t => {
  const textMaker = new TextMaker()

  textMaker.random = (e) => 0

  textMaker.txt = 'foo [[bar-buz]]'

  textMaker.simpleChoice()

  t.is(textMaker.txt, 'foo bar')
})

test('sustitutions', t => {
  const textMaker = new TextMaker({
    description: {
      $foo: ['bar'],
      $bar: ['buz']
    }
  })

  textMaker.random = (e) => 0

  textMaker.txt = '$foo and $bar'

  textMaker.sustitutions()

  t.is(textMaker.txt, 'bar and buz')
})

test('generate', t => {
  const textMaker = new TextMaker({
    description: {
      templates: [
        '$articulo%genero $vehiculo $adjetivo%genero $sintagmaverbal$voz',
        '---',
        '---'
      ],
      $vehiculo: [
        'coche((genero:masculino))',
        'moto((genero:femenino))'
      ],
      $articulomasculino: [
        'el'
      ],
      $articulofemenino: [
        'la'
      ],
      $adjetivomasculino: [
        'rojo'
      ],
      $adjetivofemenino: [
        'roja'
      ],
      $participiomasculino: [
        'encontrado'
      ],
      $participiofemenino: [
        'encontrada'
      ],
      $voz: [
        'activa',
        'pasiva'
      ],
      $sintagmaverbalactiva: [
        'es bonito'
      ],
      $sintagmaverbalpasiva: [
        'ha sido $participio%genero'
      ]
    },
    seed: 'hola'
  })

  const txt = textMaker.generate()

  t.is(txt, 'el coche rojo ha sido encontrado')
})
