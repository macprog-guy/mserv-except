var chai    = require('chai'),
	should  = chai.should(),
	service = require('mserv')({amqp:false}),
    except  = require('.'),
	array   = []

service.use('except', except, {
	handler: function(err) {
		array.push(1)
	}
})

service.action({
	name: 'noop',
	handler: function*() {
	}
})

service.action({
	name: 'throw1',
	except: function(err) {
		array.push(2)
	},
	handler: function*() {
		throw new Error('test')
	}
})

service.action({
	name: 'throw2',
	except: {
		handler: function(err) {
			array.push(2)
		}
	},
	handler: function*() {
		throw new Error('test')
	}
})


describe('mserv-except', function(){

	beforeEach(function(done){
		array = []
		done()
	})

	it('should execute the function without catching anything', function(done){
		service.script(function*(){
			try {
				yield this.invoke('noop')
				array.should.eql([])
				done()
			}
			catch(err) {
				done(err)
			}
		})
	})


	it('should execute the function, catch and run both handlers', function(done){
		service.script(function*(){
			try {
				yield this.invoke('throw1')
				array.should.eql([1,2])
				done()
			}
			catch(err) {
				done(err)
			}
		})
	})


	it('should execute the function, catch and run both handlers also', function(done){
		service.script(function*(){
			try {
				yield this.invoke('throw2')
				array.should.eql([1,2])
				done()
			}
			catch(err) {
				done(err)
			}
		})
	})
})