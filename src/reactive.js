import ob from './observer'
import ut from './utils'
import cc from './consts'

// intercept method that update a array
var arrayMethodNames = [
	'push',
	'pop',
	'shift',
	'unshift',
	'splice',
	'sort',
	'reverse'
]
var arrayProto = Array.prototype
var arrayMethods = Object.create(arrayProto)
arrayMethodNames.forEach(function (method) {
	// cache original method
	var original = arrayProto[method]
	Object.defineProperty(arrayMethods, method, {
		enumerable: false,
		writable: true,
		configurable: true,
		value: function () {
			var args = [],
				len = arguments.length
			while (len--) args[len] = arguments[len]

			var oldVal = this.slice()
			var result = original.apply(this, args)
			var newItems
			switch (method) {
				case 'push':
				case 'unshift':
					newItems = args
					break
				case 'splice':
					newItems = args.slice(2)
					break
			}
			if (newItems) {
				for (var i in newItems) {
					toReactiveObject(newItems[i])
				}
			}
			// notify change 
			ob.notifyParent(this, oldVal, this)
			return result
		}
	})
})

function overrideArrayMethod(array) {
	for (var i in arrayMethodNames) {
		var method = arrayMethodNames[i]
		Object.defineProperty(array, method, Object.getOwnPropertyDescriptor(arrayMethods, method))
	}
}


function defineReactiveProperty(obj, key, val) {
	var property = Object.getOwnPropertyDescriptor(obj, key)
	if (property && property.configurable === false) {
		console.warn(`Property ${key} is not configurable.`)
		return
	}

	Object.defineProperty(obj, key, {
		enumerable: true,
		configurable: true,
		get: function () {
			return val
		},
		set: function (newVal) {
			var value = val
			if (newVal === value || (newVal !== newVal && value !== value)) {
				return
			}

			toReactiveObject(newVal)
			val = newVal
			ob.observe(obj, key, val)

			ob.notify(obj, key, value, newVal)
		}
	})

	ob.observe(obj, key, val)
}

function togglePropertyEnumable(obj, key, enumerable) {
	var property = Object.getOwnPropertyDescriptor(obj, key)
	if (property.enumerable !== !!enumerable) {
		property.enumerable = !!enumerable
		Object.defineProperty(obj, key, property)
	}
}

/**
 * Turn a json-like object to be reactive.
 * DO NOT turn an object including function as property to reactive.
 * @param {object} obj a json-like object
 */
function toReactiveObject(obj) {
	if (ut.isObject(obj)) {
		if (ut.isArray(obj)) {
			overrideArrayMethod(obj)
			for (var i in obj) {
				toReactiveObject(obj[i])
			}
		} else {
			for (var i in obj) {
				toReactiveProperty(obj, i, obj[i])
			}
		}
	}
}

function toReactiveProperty(obj, key, val) {
	defineReactiveProperty(obj, key, val)
	toReactiveObject(obj[key])
}

/**
 * Add new reactive property.
 * Using = to add new property won't make it reactive. Please use this method.
 * @param {object} obj an object
 * @param {string} key property name
 * @param {any} valOrSetter property value to set or setter if it's function
 */
function set(obj, key, valOrSetter) {
	// val is a function, then add val as watch
	if (typeof valOrSetter == 'function') {
		setValues(obj, key, null)
		watch(obj, key, cc.DEF_SETTER, valOrSetter) // TODO
	} else {
		setValues(obj, key, valOrSetter)
	}
}

function setValue(obj, key, val) {
	var prop = Object.getOwnPropertyDescriptor(obj, key)
	if (!prop || !prop.set) {
		toReactiveProperty(obj, key, val)
	} else {
		obj[key] = val
	}
}

// set values for a property path, create object if not exist
function setValues(obj, key, val) {
	let paths = typeof key === 'string' ? ut.resolvePath(key) : key
	let currObj = obj
	let unshifted = []
	while (paths.length > 1) {
		let path = paths.shift()
		_setValue(currObj, path)
		// if (!ut.isPrimitive(currObj)) {
		// 	// create object/array if not
		// 	if (!ut.isObject(currObj[path])) {
		// 		if (ut.isArray(currObj)) {
		// 			if (ut.isNumber(path)) {
		// 				setValue(currObj, path, ut.isString(paths[0]) ? {} : [])
		// 			} else {
		// 				throw `Can't set property for an array`
		// 			}
		// 		} else {
		// 			if (!ut.isNumber(path)) {
		// 				setValue(currObj, path, ut.isString(paths[0]) ? {} : [])
		// 			} else {
		// 				throw `Can't set index for a non-array object`
		// 			}
		// 		}
		// 	}
		// } else {
		// 	throw `Can't set property for a primitive type`
		// }

		unshifted.push(path)
		currObj = currObj[path]
	}
	if (paths.length > 0) {
		_setValue(currObj, paths[0], val, true)
	}

	function _setValue(_obj, _propertyName, _value, _leafFlag) {
		if (ut.isPrimitive(_obj) ||
			(ut.isPrimitive(_obj[_propertyName]) && !_leafFlag)) {
			throw `Can't set property for a primitive type`
		}

		_value = _leafFlag ? _value : (ut.isString(_propertyName) ? {} : [])
		// create object/array if not
		if (!ut.isObject(_obj[_propertyName])) {
			if (ut.isArray(_obj)) {
				if (ut.isNumber(_propertyName)) {
					setValue(_obj, _propertyName, _value)
				} else {
					throw `Can't set property for an array`
				}
			} else {
				if (!ut.isNumber(_propertyName)) {
					setValue(_obj, _propertyName, _value)
				} else {
					throw `Can't set index for a non-array object`
				}
			}
		} else {
			if (_leafFlag) {
				setValue(_obj, _propertyName, _value)
			}
		}
	}
}

/**
 * Watch a property change, and do something.
 * If a property is watched with a same name twice, only the latter watch function works
 * @param {object} obj object to watch
 * @param {string} key property name to watch
 * @param {string} name name. Can be omitted, then the 3rd parameter should be callback function
 * @param {function} fn do something
 * 		function(oldVal, newVal)
 */
function watch(obj, key, name, fn) {
	if (typeof name === 'function') {
		ob.addWatch(obj, key, cc.DEF_WATCH, name)
	} else {
		ob.addWatch(obj, key, name, fn)
	}
}

/**
 * Unwatch property change. If a name is passed, then remove watches has that name only
 * @param {object} obj object
 * @param {string} key property name to unwatch
 * @param {string} name watch name. If not passed, remove all watches.
 */
function unwatch(obj, key, name) {
	ob.removeWatch(obj, key, name)
}

/**
 * Assign by reference. Adaptable for reactive object
 * Reactive object must have an unenumerable property '_$ob$_', which saves the parent object and its property name in parent
 * @param {object} targetObj 
 * @param {string} targetKey 
 * @param {object} sourceObj obj to reference
 * @param {string} sourceKey key to reference. If not set, then reference sourceObj
 */
function setByRef(targetObj, targetKey, sourceObj, sourceKey) {
	// create path
	var keys = ut.resolvePath(targetKey)
	if (keys.length > 1) {
		setValues(targetObj, keys.slice(0, keys.length - 1), {})
	}

	var targetLeaf = ut.getLeaf(targetObj, keys)
	var sourceLeaf = ut.getLeaf(sourceObj, sourceKey)
	if (!sourceLeaf) {
		throw `Property "${sourceKey}" of object is not found`
	}
	targetObj = targetLeaf.obj
	targetKey = targetLeaf.key
	sourceObj = sourceLeaf.obj
	sourceKey = sourceLeaf.key
	var property = ut.getProperty(sourceObj, sourceKey)
	if (!property || typeof property.value !== 'undefined' || !ob.isObserved(sourceObj)) {
		throw `Property "${sourceKey}" of source object is not reactive`
	}

	// check circular reference
	var currObj = sourceObj
	var currKey = sourceKey
	var predecessor
	while (predecessor = ob.getReferencing(currObj, currKey)) {
		if (predecessor.obj == targetObj && predecessor.key == targetKey) {
			throw `Circular reference error`
		}
		currObj = predecessor.obj
		currKey = predecessor.key
	}

	Object.defineProperty(targetObj, targetKey, property)

	ob.observe(targetObj, targetKey)
	// save ref info in both source and target
	ob.setReference(targetObj, targetKey, sourceObj, sourceKey)
}


export default {
	set,
	setByRef,
	watch,
	unwatch,
}