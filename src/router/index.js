import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import CodeBrowser from '@/components/Content/CodeBrowser';
import FlowDesigner from '@/components/Content/FlowDesigner';

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      children: [
        { name: 'CodeBrowser', path: 'code-browser', component: CodeBrowser },
        { name: 'FlowDesigner', path: 'flow-designer', component: FlowDesigner }
      ]
    }
  ]
})
