#!/usr/bin/env node

const enderRepository = require('../')

var args = process.argv.slice(2)
  , cmd = args.shift()

  , exec = {
        install   : enderRepository.install.bind(enderRepository)
      , uninstall : enderRepository.uninstall.bind(enderRepository)
      , search    : function (args, callback) {
          enderRepository.search(args, function (err, data) {
            if (err) return callback(err)
            console.log(Object.keys(data).map(function (key) {
              return data[key].name + '\t' + data[key].description
            }).join('\n'))
            callback()
          })
        }
    }

if (exec[cmd] && args.length) {
  return enderRepository.setup(function (err) {
    if (err) throw err
    exec[cmd](args, function (err) {
      if (err) throw err
      enderRepository.packup()
    })
  })
}

console.error(
    'Usage:'
  + '\n\tender-repository search <keywords>'
  + '\n\tender-repository install <packages>'
  + '\n\tender-repository uninstall <packages>'
)