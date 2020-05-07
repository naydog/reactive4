function isObject(obj) {
	return typeof obj == 'object' && !!obj
}

function isArray(obj) {
	return Array.isArray(obj)
}

/* istanbul ignore next */
function isPrimitive(value) {
	return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
}

function isNumber(value) {
	return typeof value === 'number'
}

function isString(value) {
	return typeof value === 'string'
}

function resolvePath(path) {
	var b, d = [];
	while (b = path.match(/[^\\]\./)) {
		var c = path.substr(0, b.index + 1);
		d = d.concat(resolveArray(c));
        path = path.substr(b.index + 2);
	}
	d = d.concat(resolveArray(path));
	return d.map(e => {
		if (typeof e == 'string') {
			return e.replace(/\\\./g, '.')
		} else { // number
			return e
		}
	});
}

function resolveArray(arrPath) {
	var a = arrPath.match(/(.*)\[(\d*)\]/);
	if (a) {
		if (a[1]) {
			return [a[1], Number(a[2])];
		} else {
			return Number(a[2]);
		}
	} else {
		return arrPath;
	}
}

/**
 * Get delegated object and key
 * e.g. 
 * 1) obj is 'a', key is 'b', then return {obj: a, key: 'b'}
 * 2) obj is 'a', key is 'b.c.d', then return {obj: a.b.c, key: 'd'}
 * @param {object} obj 
 * @param {string} key 
 */
function getLeaf(obj, key) {
	var props = typeof key === 'string' ? resolvePath(key) : key
	var currObj = obj
	for (var i = 0; i < props.length - 1; i++) {
		if (currObj[props[i]] instanceof Object) {
			currObj = currObj[props[i]]
		} else {
			return
		}
	}
	return {
		obj: currObj,
		key: props[props.length - 1]
	}
}

function getValue(obj, key) {
	var leaf = getLeaf(obj, key)
	return leaf && leaf.obj[leaf.key]
}

/** Get property descriptor */
function getProperty(obj, key) {
	var leaf = getLeaf(obj, key)
	return leaf && Object.getOwnPropertyDescriptor(leaf.obj, leaf.key)
}

const ut = {
	isObject,
	isArray,
	isPrimitive,
	isNumber,
	isString,
	getLeaf,
	getValue,
	getProperty,
	resolvePath
}

export default ut