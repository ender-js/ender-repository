var buster                 = require('buster')
  , assert                 = buster.assert
  , repository             = require('../')
  , RepositoryCommandError = require('../lib/errors').RepositoryCommandError

buster.testCase('install()', {
    setUp: function () {
      // see note for search() setUp
      this.npm = require('npm')
      this.npmCommandsOriginal = this.npm.commands
      this.npm.commands = this.npmCommands = {
          install: function () {}
      }
    }
  , tearDown: function () {
      this.npm.commands = this.npmCommandsOriginal
    }

  , 'test install() throws RepositorySetupError if setup() has not been called': function () {
      assert.exception(repository.install, 'RepositorySetupError')
    }

  , 'test install() calls npm.commands.install()': function (done) {
      var npmMock = this.mock(this.npm)
        , npmCommandsMock = this.mock(this.npmCommands)
        , packages = [ 'packages', 'argument' ]
        , finish = function () {
            repository.packup(false, done)
          }

      npmMock.expects('load').once().callsArg(1)
      npmCommandsMock.expects('install').once().withArgs(packages).callsArg(1)

      repository.setup(function () {
        repository.install(packages, finish)
      })

      assert(true) // required, buster issue #62
    }

    // disabled as the '.' special case has been moved into the main-build logic instead
    /*
  , 'test install() calls npm.commands.install() twice if "." package is specified': function (done) {
      var npmMock = this.mock(this.npm)
        , npmCommandsMock = this.mock(this.npmCommands)
        , packages = [ 'packages', 'argument', 'foo/..' ]
        , finish = function () {
            repository.packup(false, done)
          }

      npmMock.expects('load').once().callsArg(1)
      npmCommandsMock.expects('install').once().withArgs(packages.slice(0, 2)).callsArg(1)
      npmCommandsMock.expects('install').once().withArgs([ '.' ]).callsArg(1)

      repository.setup(function () {
        repository.install(packages, finish)
      })

      assert(true) // required, buster issue #62
    }
    */

  , 'test npm.commands.install error': function (done) {
      var npmMock = this.mock(this.npm)
        , npmCommandsMock = this.mock(this.npmCommands)
        , packages = [ 'packages', 'argument' ]
        , errArg = new Error('this is an error')

      npmMock.expects('load').once().callsArg(1)
      npmCommandsMock.expects('install').once().withArgs(packages).callsArgWith(1, errArg)

      repository.setup(function () {
        repository.install(packages, function (err) {
          assert(err)
          assert(err instanceof RepositoryCommandError)
          assert.same(err.cause, errArg)
          assert.same(err.message, errArg.message)
          repository.packup(false, done)
        })
      })
    }
})