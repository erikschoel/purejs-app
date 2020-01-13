import Vue from 'vue';
import Vuex from 'vuex';
import Api from '@/api';
import pure from 'purejs-node';
import config from '../../config';
import lib from '@/lib';

Vue.prototype.$pure = pure;
Vuex.Store.prototype.$pure = pure;
Vue.prototype.$empty = pure.utils.empty();
Vue.prototype.$id = Vuex.Store.prototype.$id = pure.$id = pure.utils.counter(1000000);

if (config.env === 'development') {
  window.$pure = pure;
}

Vue.use(Vuex);

Vuex.Store.prototype.makeAction = function(info, func) {
  return Api().then((api) => {
    this.commit('busy', info);
    return func(api);
  }).then((result) => {
    setTimeout(() => {
      this.commit('complete');
      setTimeout(() => {
        this.commit('none');
      }, 500);
    }, 500);
    return result;
  }).catch((error) => {
    this.commit('error', error);
    return error;
  });
}
Vuex.Store.prototype.makeNamespace = function(ns) {
  return this.$pure.namespace().$get(ns).of(this.getters['items/makeNamespace'][ns]);
}
const store = new Vuex.Store({
  state: {
    allItems: {},
    allItemsNamespaced: {},
    currentItemRef: [],
    info: []
  },
  getters: {
    allItems(state) {
      return state.allItems;
    },
    allItemsNamespaced(state) {
      return state.allItemsNamespaced;
    },
    currentItemRef(state) {
      return state.currentItemRef;
    },
    info(state) {
      return state.info;
    },
    status(state) {
      return state.info.length ? state.info[state.info.length - 1] : {};
    },
    busy(state, getters) {
      return getters['status']['type'] === 'busy';
    },
    error(state, getters) {
      return getters['status']['type'] === 'error';
    },
    complete(state, getters) {
      return getters['status']['type'] === 'complete';
    }
  },
  mutations: {
    busy(state, info) {
      state.info.push(Object.assign({ type: 'busy' }, info || {}));
    },
    error(state, info) {
      state.info.push(Object.assign({ type: 'error' }, info || {}));
    },
    complete(state, info) {
      Vue.set(this.getters['status'], 'type', 'complete');
    },
    none(state, info) {
      if (state.info.length) state.info.pop();
    },
    setItem(state, item) {
      if (state.allItems[item.id]) {
        Object.keys(item).forEach((key) => {
          if (key !== 'id') Vue.set(state.allItems[item.id], key, item[key]);
        });
      } else {
        Vue.set(state.allItems, item.id, item);
      }
    },
    setItemNamespaced(state, data) {
      Vue.set(state.allItemsNamespaced, data.namespace, data.items);
    },
    addItemNamespaced(state, data) {
      state.allItemsNamespaced[data.namespace].push(data.id);
    },
    removeItem(state, item) {
      this.commit('unsetCurrentItemRef', item.id);

      const idx = state.allItemsNamespaced[item.namespace].indexOf(item.id);
      if (idx > -1) {
        state.allItemsNamespaced[item.namespace].splice(idx, 1);
      }
      Vue.delete(state.allItems, item.id);
    },
    setCurrentItemRef(state, ref) {
      state.currentItemRef.splice(0);
      state.currentItemRef.push(...ref);
    },
    addCurrentItemRef(state, item) {
      state.currentItemRef.splice(1);
      state.currentItemRef.push(item);
    },
    unsetCurrentItemRef(state, value) {
      const idx = state.currentItemRef.indexOf(value);
      if (idx > -1) {
        state.currentItemRef.splice(idx, 1);
      }
    },
    resetCurrentItemRef(state) {
      state.currentItemRef.splice(0);
    }
  },
  actions: {
    async getData({ commit, getters }) {
      return Api().then((api) => {
        return api.get('data.php');
      }).then((data) => {
        this.$pure.namespace().$keys().filter(ns => !(/(classes|utils)/).test(ns)).forEach((ns) => {
          if (!data[ns]) data[ns] = {};
          if (data.$name) delete data.$name;
        });
        if (data.$name) delete data.$name;
        return data;
      }).then((data) => {
        const store = this;
        return this.$pure.utils.walk((v, k, x, i) => {
          if (typeof v === 'object' && v.namespace) {
            var item = Object.assign({}, v);// { id: store.$id(), key: k, value: v };
            item.id = store.$id(item.id ? item.id.replace('DB', '') : '');
            commit('setItem', item);
            return item.id;
          }
          return v;
        })(data);
      }).then((data) => {
        Object.keys(data).map((name) => {
          commit('setItemNamespaced', {
            namespace: name,
            items: Object.values(data[name]).map((id) => {
              commit('setItem', { id: id, namespace: name });
              return id;
            })
          });
        });
        return data;
      }).catch((error) => {
        console.log(error);
      });
    },
    async saveData(state, data) {
      return this.makeAction({ action: 'xhr', type: 'busy' }, (api) => {
        return api.post('data.php', data);
      });
    }
  }
});

store.registerModule('items', {
  getters: {
    allItemsMap: lib.allItemsMap(store, pure),
    makeNamespace(state, getters, rootGetters) {
      return Object.keys(rootGetters.allItemsNamespaced).filter(ns => ns.indexOf('$') !== 0).reduce((result, ns) => {
        result[ns] = (rootGetters.allItemsNamespaced[ns] || []).reduce((acc, key) => {
          const item = rootGetters.allItems[key];
          acc[item.key] = item.value;
          return acc;
        }, {});
        return result;
      }, {});
    },
    isInternal(state, getters) {
      return getters.currentNamespace === 'classes' || getters.currentNamespace === 'utils';
    },
    currentItemTitle(state, getters) {
      return getters.currentNamespace + (getters.currentItemName ? (': ' + getters.currentItemName) : '');
    },
    currentNamespace(state, getters, rootGetters) {
      return rootGetters.currentItemRef.length ? rootGetters.currentItemRef[0] : '-';
    },
    currentNamespaceItems(state, getters, rootGetters) {
      return getters.isInternal ? store.$pure.$get(getters.currentNamespace) : rootGetters.allItems;
    },
    current(state, getters, rootGetters) {
      if (rootGetters.currentItemRef.length > 1) {
        if (getters.isInternal) {
          return store.$pure.$get([ getters.currentNamespace ].concat(rootGetters.currentItemRef.slice(1).slice(-1)).join('.'));
        } else {
          return rootGetters.allItems[getters.currentItemId];
        }
      }
    },
    currentValue(state, getters, rootGetters) {
      const current = getters.current;
      if (current) {
        return getters.isInternal ? store.$pure.utils.toString(getters.currentNamespace === 'classes' ? current.prototype : current) : current.value;
      }
    },
    currentItems(state, getters, rootGetters) {
      return Object.keys(getters.makeNamespace[getters.currentNamespace].map(id => rootGetters.allItems[id]));
    },
    currentItem(state, getters, rootGetters) {
      return rootGetters.currentItemRef.length ? store.$pure.namespace().$get(rootGetters.currentItemRef[0]) : '';
    },
    currentItemId(state, getters, rootGetters) {
      return rootGetters.currentItemRef.length > 1 ? rootGetters.currentItemRef.slice(-1).pop() : '';
    },
    currentItemName(state, getters, rootGetters) {
      const current = getters.current;
      return current ? current.key : '-';
    },
    currentItemObject(state, getters, rootGetters) {
      return rootGetters.currentItemRef.length ? getters.current : null;
    },
    hasCurrentItem(state, getters, rootGetters) {
      return rootGetters.currentItemRef.length > 0;
    }
  },
  namespaced: true,
  preserveState: true
});

export default store;
