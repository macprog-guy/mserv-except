# Introduction
mserv-except is an error and exception handling middleware for [mserv](https://github.com/macprog-guy/mserv). It's simply catches exceptions that are thrown in the middleware + action pipeline and redirects them to a custom handler.

Normally when an error is thrown it gets propagated back to caller. This might not always what's wanted.
mserv-except allow you to capture these errors and respond accordingly. You can even decide to rethrow the error when you are done.

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

# Global Handlers

As of version `0.2.1`, mserv-except can also register additional global handlers via an extension.
By default the extension name is `except` but can be changed to anything else.

```js
service.use('onError',except,{
	extension: 'onError'
	handler: function(err){
		console.log(err.stack)
		this.res = 'error'
	}
})

service.ext.onError(function*(err){
	yield /* ... insert error in a database */
	throw err
})

Error handlers are called in the reverse order they are registered but after action-level handlers. It's good measure to re-throw the error (or a modified error) unless you specifically don't want the error to bubble up to other error handlers. 

```


# Action Specific Handlers

Actions can have their own exception handlers that get executed before any global handler.
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