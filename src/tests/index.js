/* eslint-disable */
export default {
  freeBasicTest(name, logMod, nextMod, totalCount) {
    var free = this.$pure().klass('Free').of({ count: 0 });

    return free.bind(function(v) {
      if (v.count%logMod===0) console.log(name + ': ' + v.count);

      if (v.count%nextMod===0) {
        return this.next({ count: v.count + 1 });
      }else if (v.count >= totalCount) {
        console.log(name + ': DONE');
        return this.done('done');
      }else {
        v.count++;
        return this.cont();
      }
    });
  },
  freeParallelTest() {
    var free1 = this.freeBasicTest('free1', 1000000, 100, 10000000);
    var free2 = this.freeBasicTest('free2', 500000, 100, 5000000);

    return this.$pure().klass('IO').of(function() {
      free1.run();
      free2.run();
    });
  },
  freeContTest() {
    var free = this.freeBasicTest('free1', 1000000, 100, 10000000);

    var cont = free.cont().map(function(x) {
      console.log(x);
      return [ x, x ];
    });

    return this.$pure().klass('IO').of(function() {
      cont.run(function(x) {
        console.log(x);
      });
    });
  }
};
