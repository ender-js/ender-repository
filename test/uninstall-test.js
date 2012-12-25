var buster                 = require('buster')
  , assert                 = buster.assert
  , repository             = require('../')
  , RepositoryCommandError = require('../lib/errors').RepositoryCommandError

buster.testCase('uninstall()', {
    setUp: function () {
      // we have to replace npm.commands because all properties on the original object
      // are defined with only getters (via defineProperty) so can't be mocked as they are
      this.npm = require('npm')
      this.npmCommandsOriginal = this.npm.commands
      this.npm.commands = this.npmCommands = {
          uninstall: function () {}
      }
    }
  , tearDown: function () {
      this.npm.commands = this.npmCommandsOriginal
    }

  , 'test uninstall() throws RepositorySetupError if setup() has not been called': function () {
      assert.exception(repository.uninstall, 'RepositorySetupError')
    }

  , 'test uninstall() calls npm.commands.uninstall()': function (done) {
      var npmMock = this.mock(this.npm)
        , npmCommandsMock = this.mock(this.npmCommands)
        , packages = [ 'packages', 'argument' ]
        , finish = function () {
            repository.packup(false, done)
          }

      npmMock.expects('load').once().callsArg(1)
      npmCommandsMock.expects('uninstall').once().withArgs(packages).callsArg(1)

      repository.setup(function () {
        repository.uninstall(packages, finish)
      })

      assert(true) // required, buster issue #62
    }

  , 'test npm.commands.uninstall error': function (done) {
      var npmMock = this.mock(this.npm)
        , npmCommandsMock = this.mock(this.npmCommands)
        , packages = [ 'packages', 'argument' ]
        , errArg = new Error('this is an error')

      npmMock.expects('load').once().callsArg(1)
      npmCommandsMock.expects('uninstall').once().withArgs(packages).callsArgWith(1, errArg)

      repository.setup(function () {
        repository.uninstall(packages, function (err) {
          assert(err)
          assert(err instanceof RepositoryCommandError)
          assert.same(err.cause, errArg)
          assert.same(err.message, errArg.message)
          repository.packup(false, done)
        })
      })
    }
})