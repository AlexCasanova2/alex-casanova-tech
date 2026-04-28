import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProjectsView from '../views/ProjectsView.vue'
import ProjectDetailView from '../views/ProjectDetailView.vue'
import ContactView from '../views/ContactView.vue'
import AdminView from '../views/AdminView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/projects',
            name: 'projects',
            component: ProjectsView
        },
        {
            path: '/contact',
            name: 'contact',
            component: ContactView
        },
        {
            path: '/project/:id',
            name: 'project-detail',
            component: ProjectDetailView
        },
        {
            path: '/admin',
            name: 'admin',
            component: AdminView
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: () => import('../components/NotFound.vue')
        }
    ],
    scrollBehavior(to, from, savedPosition) {
        if (to.hash) {
            return {
                el: to.hash,
                behavior: 'smooth',
            }
        }
        return { top: 0 }
    }
})

export default router
