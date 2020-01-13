import Vue from 'vue';

if (!Vue.prototype.$bus) {
  Object.defineProperty(Vue.prototype, '$bus', {
    get() {
      return this.$root.bus;
    }
  });
}

export default function() {
  return new Vue({});
};
