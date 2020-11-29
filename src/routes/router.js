import Vue from 'vue';
import VueRouter from 'vue-router';
import routes from './routes';

Vue.use(VueRouter);

// configure router
const router = new VueRouter({
  routes, // short for routes: routes
  linkActiveClass: 'active',
  scrollBehavior: (to, from ,savedPosition) => {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      return { selector: to.hash };
    }
    return { x: 0, y: 0 };
  }
});
// router.beforeEach((to, from, next) => {
//   let auth_state = localStorage.getItem('auth_state');
//   console.log("AUTH STATE ",auth_state);
//   if (auth_state === null ) {
//     next('/login')
//   }
//   next();
// })

export default router;
