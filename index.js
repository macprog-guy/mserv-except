'use strict'

module.exports = function(service, options) {

	let handler = options && options.handler

	return function*(next, options) {
		try {
			return yield next
		}
		catch(err) {
			
			if (handler)
				handler.call(this, err)

			if (options && typeof options === 'function')
				options.call(this, err)
			else if (options.handler && typeof options.handler === 'function')
				options.handler.call(this, err)
		}
	}
}
