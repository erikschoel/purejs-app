import Vue from 'vue';
import Vuex from 'vuex';
import Api from '@/api';
import pure from 'purejs-node';
import config from '../../config';
import lib from '@/lib';

Vue.prototype.$pure = pure;
Vuex.Store.prototype.$pure = pure;
Vue.prototype.$empty = pure.utils.empty();

if (config.env === 'development') {
  window.$pure = pure;
}

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    allItems: {},
    currentItemRef: []
  },
  getters: {
    allItems(state) {
      return state.allItems;
    },
    currentItemRef(state) {
      return state.currentItemRef;
    }
  },
  mutations: {
    setItem(state, item) {
      if (!state.allItems[item.namespace]) {
        Vue.set(state.allItems, item.namespace, {});
      }
      Vue.set(state.allItems[item.namespace], item.key, item.value);
    },
    removeItem(state, item) {
      Vue.delete(state.allItems[item.namespace], item.key);
    },
    setCurrentItemRef(state, ref) {
      state.currentItemRef.splice(0);
      state.currentItemRef.push(...ref);
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
        return Object.keys(data).reduce((acc, key) => {
          acc.$get(key).assign(data[key]);
          return acc;
        }, this.$pure.namespace());
      }).then((data) => {
        return data.map((namespace, name) => {
          return Object.keys(namespace).reduce((acc, key) => {
            commit('setItem', { namespace: name, key: key, value: (acc[key] = namespace.wrap()) });
            return acc;
          }, {});
        }, {});
      }).catch((error) => {
        console.log(error);
      });
    },
    async saveData(state, data) {
      return Api().then((api) => {
        return api.post('data.php', data);
      }).catch((error) => {
        console.log(error);
      });
    }
  }
});

store.registerModule('items', {
  getters: {
    allItemsMap: lib.allItemsMap(store, pure),
    currentItemTitle(state, getters) {
      return getters.currentNamespace + (getters.currentItemName ? (': ' + getters.currentItemName) : '');
    },
    currentNamespace(state, getters, rootGetters) {
      return rootGetters.currentItemRef.length ? rootGetters.currentItemRef[0] : '-';
    },
    current(state, getters, rootGetters) {
      return getters.currentItemName === 'classes' || getters.currentItemName === 'utils' ? this.$pure.$get(rootGetters.currentItemRef.slice(0, -1).join('.')) : rootGetters.allItems[getters.currentItemName];
    },
    currentItem(state, getters, rootGetters) {
      return rootGetters.currentItemRef.length ? getters.current[getters.currentItemName] : '';
    },
    currentItemName(state, getters, rootGetters) {
      return rootGetters.currentItemRef.length > 1 ? rootGetters.currentItemRef.slice(-1).pop() : '';
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
