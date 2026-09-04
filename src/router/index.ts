import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import { useAuthStore } from '../stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true },
  },
  {
    path: '/tags',
    name: 'tags',
    // route level code-splitting
    // this generates a separate chunk (About.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../components/tags/TagList.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/periods',
    name: 'periods',
    // route level code-splitting
    // this generates a separate chunk (About.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../components/periods/PeriodList.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/recurrences',
    name: 'recurrences',
    component: () => import('../components/recurrences/RecurrenceList.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (About.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/AboutView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Déjà connecté et on tente d'aller sur /login : renvoyer à l'accueil
  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'home' }
  }
})

export default router
