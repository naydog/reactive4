describe("Assign method suite:", function () {
    var a
    beforeEach(function () {
        a = {
            a: 1,
            b: {
                c: 2,
                d: 3,
                f: {
                    h: 'aaa'
                },
                g: [4, 5, {
                    i: 6
                }]
            },
            c: [1, 2, {
                e: 3
            }]
        }
        for (var i in a) {
            r4.set(a, i, a[i])
        }
    })

    it("Assign direct property", function () {
        r4.set(a, 'd', 3)
        expect(a.d).toEqual(3)
    })

    it("Assign indirect property", function () {
        r4.set(a, 'b.c', 5)
        expect(a.b.c).toEqual(5)
    })

    it("Assign array element", function () {
        r4.set(a, 'c[3]', 5)
        expect(a.c[3]).toEqual(5)
    })

    it("Error assigning direct property for a primitive", function () {
        expect(function () {
            r4.set(a.a, 'd', 3)
        }).toThrow("Can't set property for a primitive type")
    })

    it("Error assigning indirect property for a primitive", function () {
        expect(function () {
            r4.set(a, 'a.d', 3)
        }).toThrow("Can't set property for a primitive type")
    })
})

describe("Re-assign method suite:", function () {
    var a
    beforeEach(function () {
        a = {
            aa: 1,
            bb: {
                aaa: 2,
                bbb: 3
            },
            cc: [1, 2, {
                ccc: 3
            }]
        }
        for (var i in a) {
            r4.set(a, i, a[i])
        }
    })

    // reassign primitive
    it("Reassign primitive to primitive", function () {
        r4.set(a, 'aa', 4)
        expect(a.aa).toEqual(4)
    })

    it("Reassign primitive to object", function () {
        r4.set(a, 'aa', {ddd: 3})
        expect(a.aa).toEqual({ddd: 3})
    })

    it("Reassign primitive to array", function () {
        r4.set(a, 'aa', [4, 5])
        expect(a.aa).toEqual([4, 5])
    })

    // reassign object
    it("Reassign object to primitive", function () {
        r4.set(a, 'bb', 3)
        expect(a.bb).toEqual(3)
    })

    it("Reassign object to object", function () {
        r4.set(a, 'bb', {ddd: 3})
        expect(a.bb).toEqual({ddd: 3})
    })
    
    it("Reassign object to array", function () {
        r4.set(a, 'bb', [4, 5])
        expect(a.bb).toEqual([4, 5])
    })

    // reassign array
    it("Reassign array to primitive", function () {
        r4.set(a, 'cc', 3)
        expect(a.cc).toEqual(3)
    })

    it("Reassign array to object", function () {
        r4.set(a, 'cc', {ddd: 3})
        expect(a.cc).toEqual({ddd: 3})
    })

    it("Reassign array to object", function () {
        r4.set(a, 'cc', {ddd: 3})
        expect(a.cc).toEqual({ddd: 3})
    })

    // reassign array element
    it("Reassign array element", function () {
        r4.set(a, 'cc[0]', 5)
        expect(a.cc[0]).toEqual(5)
    })
})