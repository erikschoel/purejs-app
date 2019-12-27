function allItemsMapper($store, $pure) {
  return $pure.utils.walk(function(v, k, x, i) {
    if (typeof v === 'object') {
      return {
        title: k,
        groups: {
          items: Object.keys(v).map((key, index) => {
            return { title: key, ref: [ k, key ], index: [ i, index ] }
          })
        }
      };
    } else {
      return {
        title: k,
        ref: [ k ]
      };
    }
  });
}
function allItemsMap(mapper) {
  return function(state, getters, rootGetters) {
    const result = mapper(rootGetters.allItemsNamespaced);
    console.log(result);
    return result;
  }
}

export default {
  allItemsMap($store, $pure) {
    return allItemsMap(allItemsMapper($store, $pure));
  }
}
