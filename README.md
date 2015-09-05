# Introduction
mserv-except is an error and exception handling middleware for [mserv](https://github.com/macprog-guy/mserv). It's simply catches exceptions that are thrown in the middleware + action pipeline and redirects them to a custom handler.

# Installation

	$ npm i --save mserv-except

# Usage

```js

var except  = require('mserv-except'),
	service = require('mserv')()

service.use('except', except, {
	handler: function(err) {
		console.error(err.stack)
		this.res = 'error'
	}
})

```

# Action Specific Handlers

Actions can have their own exception handlers that get executed after the global handler.
There are two ways to declare custom exception handlers. Either with a key whose value is
a function or an object with a `handler` key whose value is a function.

```js

service.action({
	name: 'foo',
	except: function(err) {
		// Do something specific to the action.
	},
	handler: function*() {

	}
})

service.action({
	name: 'bar',
	except: {
		handler: function(err) {
			// Do something specific to the action.
		}
	},
	handler: function*() {

	}
})


```