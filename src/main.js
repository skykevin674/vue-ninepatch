import Vue from 'vue'
import App from './App.vue'
// import NinePatch from 'nine'
import component from './components'

Vue.config.productionTip = false
Vue.use(component)
new Vue({
  render: h => h(App),
}).$mount('#app')
