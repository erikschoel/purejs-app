// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store';
import config from '../config';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);

Vue.config.productionTip = false;

/* eslint-disable no-new */
(function(vue) {
  if (config.env === 'development') {
    window.$store = store;
    window.$vue = vue;
  }
})(new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
}));
