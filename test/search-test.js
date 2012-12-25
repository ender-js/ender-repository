var buster                 = require('buster')
  , assert                 = buster.assert
  , repository             = require('../')
  , RepositoryCommandError = require('../lib/errors').RepositoryCommandError

buster.testCase('search()', {
    setUp: function () {
      // we have to replace npm.commands because all properties on the original object
      // are defined with only getters (via defineProperty) so can't be mocked as they are
      this.npm = require('npm')
      this.npmCommandsOriginal = this.npm.commands
      this.npm.commands = this.npmCommands = {
          search: function () {}
      }
    }
  , tearDown: function () {
      this.npm.commands = this.npmCommandsOriginal
    }

  , 'test search() throws RepositorySetupError if setup() has not been called': function () {
      assert.exception(repository.search, 'RepositorySetupError')
    }

  , 'test search() calls npm.commands.search()': function (done) {
      var npmMock = this.mock(this.npm)
        , npmCommandsMock = this.mock(this.npmCommands)
        , keywords = 'keywords argument'
        , finish = function () {
            repository.packup(false, done)
          }

      npmMock.expects('load').once().callsArg(1)
      npmCommandsMock.expects('search').once().withArgs(keywords, true).callsArg(2)

      repository.setup(function () {
        repository.search(keywords, finish)
      })

      assert(true) // required, buster issue #62
    }

  , 'test npm.commands.search error': function (done) {
      var npmMock = this.mock(this.npm)
        , npmCommandsMock = this.mock(this.npmCommands)
        , keywords = 'keywords argument'
        , errArg = new Error('this is an error')

      npmMock.expects('load').once().callsArg(1)
      npmCommandsMock.expects('search').once().withArgs(keywords, true).callsArgWith(2, errArg)

      repository.setup(function () {
        repository.search(keywords, function (err) {
          assert(err)
          assert(err instanceof RepositoryCommandError)
          assert.same(err.cause, errArg)
          assert.same(err.message, errArg.message)
          repository.packup(false, done)
        })
      })
    }
})