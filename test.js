'use strict'

var chai    = require('chai'),
	should  = chai.should(),
	mserv   = require('mserv'),
    except  = require('.'),
    co      = require('co'),
	array   = []


// Helper function makes tests less verbose
function wrappedTest(generatorFunc) {
	return function(done) {
		try {
			co(generatorFunc)
			.then(
				function()   { done()    },
				function(err){ done(err) }
			)
		}
		catch(err) {
			done(err)
		}
	}
}




describe('mserv-except', function(){

	let service = mserv({amqp:false})
		
	service
	// Root error handler stop the bubbling of the error (yield will never throw)
	.use('except', except, {
		handler: function(err) {
			array.push(err.message)
			return 'error'
		}
	})

	.action({
		name: 'noop',
		handler: function*() {
		}
	})

	// Action level handler that pushes message before other handlers can manipulate the error.
	.action({
		name: 'catchAndRethrow1',
		except: function(err) {
			array.push(err.message)
			throw err
		},
		handler: function*() {
			throw new Error('test')
		}
	})

	// Action level handler that pushes message before other handlers can manipulate the error.
	.action({
		name: 'catchAndRethrow2',
		except: {
			handler: function(err) {
				array.push(err.message)
				throw err
			}
		},
		handler: function*() {
			throw new Error('test')
		}
	})


	// Global handler that modifies the error
	service.ext.except(function(err){
		err.message = err.message + '!'
		err.payload = Math.random()
		throw err
	})





	beforeEach(function(done){
		array = []
		done()
	})

	it('should execute the function without catching anything', wrappedTest(function*(){
		yield service.invoke('noop')
		array.should.eql([])
	}))


	it('should execute the function, catch and run all handlers', wrappedTest(function*(){
		let result = yield service.invoke('catchAndRethrow1')
		result.should.equal('error')
		array.should.eql(['test','test!'])
	}))


	it('should execute the function, catch and run all handlers also', wrappedTest(function*(){
		let result = yield service.invoke('catchAndRethrow1')
		result.should.equal('error')
		array.should.eql(['test','test!'])
	}))

})