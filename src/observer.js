import ut from './utils'
import cc from './consts'

const OB_KEY = cc.OB_KEY

function Observer() {
    // properties of the host that are referencing properties of other object
    this.referencing = {}
    // properties of the host that are referenced by other object
    this.referenced = {}
    // watches for properties of the host. The property must be original, not referencing other properties
    this.watches = {}

    // for array
    // parent object
    this.parent = null
    // property name in parent object
    this.key = null
}



function observe(obj, key, val) {
    if (!obj[OB_KEY]) {
        var ob = new Observer()
        Object.defineProperty(obj, OB_KEY, {
            enumerable: false,
            configurable: true,
            get: function () {
                return ob
            }
        })
    }
    if (typeof key !== 'undefined') {
        obj[OB_KEY].referenced[key] = []
    }
    if (ut.isObject(val)) {
        observe(val)
        val[OB_KEY].parent = obj
        val[OB_KEY].key = key
    }
}

function notify(obj, key, oldVal, newVal) {
    // console.log('notify', `${OB_KEY}.watches.${key}`)
    var watches = ut.getValue(obj, `${OB_KEY}.watches.${key}`)
    if (watches) {
        var toRemove = []
        for (var i in watches) {
            var prop = ut.getProperty(watches[i].obj, watches[i].key)
            if (prop && prop.enumerable) {
                if (prop.enumerable) {
                    if (watches[i].name == cc.DEF_SETTER) {
                        watches[i].fn.call(watches[i].obj, newVal)
                    } else {
                        watches[i].fn.call(watches[i].obj, oldVal, newVal)
                    }
                }
            } else { // remove watch if property is removed
                toRemove.push(i)
            }
        }
        for (var j = toRemove.length - 1; j > -1; j--) {
            watches.splice(toRemove[j], 1)
        }
    }
}

function notifyParent(obj, oldVal, newVal) {
    if (obj[OB_KEY] && obj[OB_KEY].parent && obj[OB_KEY].key) {
        notify(obj[OB_KEY].parent, obj[OB_KEY].key, oldVal, newVal)
    }
}

function isObserved(obj) {
    return ut.isObject(obj) && obj[OB_KEY]
}

function addWatch(obj, key, name, fn) {
    var rootObj = findRootRef(obj, key)
    // add watch to root obj
    var watches = rootObj.obj[OB_KEY].watches
    watches[rootObj.key] = watches[rootObj.key] || []
    var watchesOnKey = watches[rootObj.key]
    for (var i in watchesOnKey) {
        if (watchesOnKey[i].name == name) {
            console.warn(`There is already a watch named ${name}. Will override it`)
            watchesOnKey[i].fn = fn
            watchesOnKey[i].obj = obj
            watchesOnKey[i].key = key
            return
        }
    }

    // new watch
    watchesOnKey.push({
        name: name,
        fn: fn,
        obj: obj,
        key: key
    })
}

function removeWatch(obj, key, name) {
    var rootObj = findRootRef(obj, key)
    // remove watch from root obj
    var watchesOnKey = rootObj.obj[OB_KEY].watches[rootObj.key]
    if (watchesOnKey) {
        if (typeof name !== 'undefined') {
            for (var i = watchesOnKey.length - 1; i > -1; i--) {
                if (watchesOnKey[i].name == name) {
                    watchesOnKey.splice(i, 1)
                    return
                }
            }
        } else {
            watchesOnKey.splice(0, watchesOnKey.length)
        }
    }
}

function findRootRef(obj, key) {
    var refObjects = [{
        obj: obj,
        key: key
    }]
    var currObj = obj
    var currKey = key
    // find root ref
    var rootObj
    while (rootObj = getReferencing(currObj, currKey)) {
        refObjects.unshift(rootObj)
        currObj = rootObj.obj
        currKey = rootObj.key
    }

    return refObjects[0]
}

/**
 * Return the referencing obj and property for the argumenrts
 * @param {object} obj 
 * @param {string} key 
 */
function getReferencing(obj, key) {
    return ut.getValue(obj, `${OB_KEY}.referencing.${key}`)
}

function setReferencing(successorObj, successorKey, predecessorObj, predecessorKey) {
    successorObj[OB_KEY].referencing[successorKey] = {
        obj: predecessorObj,
        key: predecessorKey
    }
}

function setReferenced(successorObj, successorKey, predecessorObj, predecessorKey) {
    for (var i in predecessorObj[OB_KEY].referenced[predecessorKey]) {
        var ref = predecessorObj[OB_KEY].referenced[predecessorKey][i]
        if (ref.obj == successorObj && ref.key == successorKey) {
            return
        }
    }
    predecessorObj[OB_KEY].referenced[predecessorKey].push({
        obj: successorObj,
        key: successorKey
    })
}

function setReference(successorObj, successorKey, predecessorObj, predecessorKey) {
    setReferencing(successorObj, successorKey, predecessorObj, predecessorKey)
    setReferenced(successorObj, successorKey, predecessorObj, predecessorKey)
}

const ob = {
    observe,
    notify,
    notifyParent,
    isObserved,
    addWatch,
    removeWatch,
    setReference,
    setReferenced,
    setReferencing,
    getReferencing,
}

export default ob