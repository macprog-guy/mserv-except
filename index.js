'use strict'

module.exports = function(service, options) {

	let extname  = options.extension || 'except',
		handlers = []

	if (options && options.handler && typeof options.handler === 'function')
		handlers.push(options.handler)

	service.extend(extname, function(service, options){
		return function(genFunc) {
			handlers.push(genFunc)
		}
	})


	return function*(next, options) {
		try {
			return yield next
		}
		catch(err) {

			// The handler list is handlers + action
			let handlerList   = handlers,
				actionHandler = options

			if (options && typeof options !== 'function')
				actionHandler = options.handler

			if (actionHandler && typeof actionHandler === 'function')
				handlerList = handlerList.concat([actionHandler])

			// We call handlers in reverse order
			handlerList = handlerList.reverse()

			// Call the all handlers and let them add stuff to ctx
			for (let i in handlerList) {
				let handler = handlerList[i],
					result
				try {
					if (isGeneratorFunction(handler))
						result = yield* handler.call(this, err)
					else
						result = handler.call(this, err)

					if (result !== undefined)
						this.res = result
					
					return // Stop bubbling the error
				} 
				catch(newErr) {
					err = newErr
				}
			}
			
			// If we get here then we re-throw
			throw err
		}
	}
}

/**

  Extracted directly from the co library.

 */
function isGeneratorFunction(obj) {
  var constructor = obj.constructor;
  if (!constructor) return false;
  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true;
  return isGenerator(constructor.prototype);
}

function isGenerator(obj) {
  return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}
