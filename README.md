# textmaker

[![HowTo](https://asciinema.org/a/mIAGbQ5zX9lAV8p1ZJ4391kh9.png)](https://asciinema.org/a/mIAGbQ5zX9lAV8p1ZJ4391kh9)

## Instalation
```
  npm install @hacknlove/textmaker
```

## Usage

```
  import TextMaker from { 'textmaker' }
  // // or
  // const TextMaker = require('textmaker')

  const textMaker = new TextMaker({
    description: ObjectWithTheTextsDescriptions,
    seed: "Some string, if you want your text to be predictable and replicable"
  })

  var text = textMaker.generate()
```

## Text description

The text description is a Javascrit Object that contains an array with the templates,  a bunch of sustitution arrays with more templates

you can check [example.json](example.json)

It contains string templates that includes plain text, **direct sustitutions** and **referenced sustitutions**

### Set variable
The template `"...((name: value))..."` will set a variable called `name` with the value `value`

The value can be any template, but direct nesting is not allowed.

* `...((foo:...((bar:buz))...))...` is not allowed.
* `...((foo:...$bar))` it is always allowed even if `$bar` can be sustituted with `...((bar:buz))...`

### Variable substitutions
The template ``"...%name..." will generate `...value...` where `value` is the value of the variable called `name`

### Direct sustitutions

The template ``"I want [[cake-fruit-pie]]"`` will generate
* *I want cake*
* *I want fruit*
* *I want pie*

They can have as many options as you need, but if you need a lot of options you should consider using **referenced sustitutions** to keep your templates human readable.

They could be anidated so ``"I want [[some fresh [[fruit-juice]]-a piece of [[cake-pie]]"`` will generate
* *I want some fresh fruit*
* *I want some fresh juice*
* *I want a piece of cake*
* *I want a piece of pie*

You can nest as many options as you need, but you should consider using **referenced sustitutions** if you feel that you are loosing the vision of what is going there.

**Direct sustitutions** should be used to define quick simple choices.

### Referenced sustitutions

Direct sustitutions are words formed only by characters from `a-z`, `A-Z`, `0-9`, including the `_` (underscore), that starts with a `$`

For instance `"$foo"`, `"$bar"` `"$foo_bar"`

They match the javascript regexp `/\$[\w]+/` that is equivalent to `/\$[a-z0-9_]+/i`

They are sustituted for a random template of the array in `description` whose `key` matchs

#### Examples

```
  description = {
    templates: [
      "I want $dessert"
    ],
    $dessert: [
      "cake",
      "fruit",
      "pie"
    ]
  }
```

```
  description = {
    templates: [
      "I want $dessert"
    ],
    $dessert: [
      "some fresh $healthyDesert",
      "a piece of $unhealthyDessert"
    ],
    "$healthyDesert": [
      "fruit",
      "juice"
    ],
    "$unhealthyDesert": [
      "cake",
      "pie"
    ]
  }
```

### description.templates
This array contains the fist level templates, those that the generator picks in the first step.

It could be as complicated as you want, but it is preferable to keep them as simple as possible so they could be an index to the human eyes, so you can know at a glance what each one generates.

### Process flow

The transformations are done in 4 steps:

1. variable setting
2. variable sustitutions
3. simple sustitutions
4. reference sustitutions

Each step is done iteratively until there is no more setting or substitutions to do

If one o more substitutions were done in the 4th step, the process start again from the first step. Otherwise the process ends.
