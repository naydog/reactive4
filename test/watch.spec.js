describe("Watch method suite:", function () {
    var a
    var watchVal
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
        watchVal = ''
    })

    it("Watch directly", function () {
        r4.watch(a, 'aa', 'waa', function(o, n) {
            watchVal += `${o}|${n}`
        });
        r4.set(a, 'aa', 4)
        expect(watchVal).toEqual('1|4')
    })

    fit("Watch indirectly", function () {
        r4.watch(a, 'bb.aaa', 'waa', function(o, n) {
            watchVal += `${o}|${n}`
        });
        r4.set(a, 'bb.aaa', 4)
        expect(watchVal).toEqual('2|4')
    })
})