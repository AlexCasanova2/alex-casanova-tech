import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProjectsView from '../views/ProjectsView.vue'
import ProjectDetailView from '../views/ProjectDetailView.vue'
import ContactView from '../views/ContactView.vue'
import LeadLandingView from '../views/LeadLandingView.vue'
import ConfiguratorView from '../views/ConfiguratorView.vue'

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
            path: '/es/diseno-web-empresas',
            name: 'web-design-es',
            component: LeadLandingView,
            meta: { locale: 'es', leadPage: 'service', title: 'Diseño web para empresas', description: 'Diseño y desarrollo de webs corporativas a medida para empresas. Proyectos desde 700 € antes de IVA.', alternate: '/ca/disseny-web-empreses' }
        },
        {
            path: '/ca/disseny-web-empreses',
            name: 'web-design-ca',
            component: LeadLandingView,
            meta: { locale: 'ca', leadPage: 'service', title: 'Disseny web per a empreses', description: 'Disseny i desenvolupament de webs corporatives a mida per a empreses. Projectes des de 700 € abans d’IVA.', alternate: '/es/diseno-web-empresas' }
        },
        {
            path: '/es/precio-pagina-web',
            name: 'web-pricing-es',
            component: LeadLandingView,
            meta: { locale: 'es', leadPage: 'pricing', title: 'Precio de una página web corporativa', description: 'Descubre cuánto cuesta una web corporativa y calcula una estimación según páginas, idiomas y funcionalidades.', alternate: '/ca/preu-pagina-web' }
        },
        {
            path: '/ca/preu-pagina-web',
            name: 'web-pricing-ca',
            component: LeadLandingView,
            meta: { locale: 'ca', leadPage: 'pricing', title: 'Preu d’una pàgina web corporativa', description: 'Descobreix quant costa una web corporativa i calcula una estimació segons pàgines, idiomes i funcionalitats.', alternate: '/es/precio-pagina-web' }
        },
        {
            path: '/es/presupuesto-web',
            name: 'web-budget-es',
            component: ConfiguratorView,
            meta: { locale: 'es', title: 'Calcula el presupuesto de tu página web', description: 'Configura tu web corporativa y obtén al momento una estimación orientativa antes de IVA.', alternate: '/ca/pressupost-web' }
        },
        {
            path: '/ca/pressupost-web',
            name: 'web-budget-ca',
            component: ConfiguratorView,
            meta: { locale: 'ca', title: 'Calcula el pressupost de la teva pàgina web', description: 'Configura la teva web corporativa i obtén al moment una estimació orientativa abans d’IVA.', alternate: '/es/presupuesto-web' }
        },
        {
            path: '/es/privacidad',
            name: 'privacy-es',
            component: () => import('../views/PrivacyView.vue'),
            meta: { locale:'es', title:'Privacidad', description:'Información de privacidad de los formularios de alexcasanova.tech.', alternate:'/ca/privacitat' }
        },
        {
            path: '/ca/privacitat',
            name: 'privacy-ca',
            component: () => import('../views/PrivacyView.vue'),
            meta: { locale:'ca', title:'Privacitat', description:'Informació de privacitat dels formularis d’alexcasanova.tech.', alternate:'/es/privacidad' }
        },
        {
            path: '/project/:id',
            name: 'project-detail',
            component: ProjectDetailView
        },
        {
            path: '/admin',
            name: 'admin',
            component: () => import('../views/AdminView.vue')
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
