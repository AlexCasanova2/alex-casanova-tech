import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProjectsView from '../views/ProjectsView.vue'
import ProjectDetailView from '../views/ProjectDetailView.vue'
import ContactView from '../views/ContactView.vue'
import LeadLandingView from '../views/LeadLandingView.vue'
import ConfiguratorView from '../views/ConfiguratorView.vue'
import { weddingLandings } from '../config/weddingLanding'

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
            meta: { locale: 'es', leadPage: 'pricing', title: 'Precio de una página web corporativa', description: 'Descubre qué influye en el precio de una web corporativa y solicita una propuesta personalizada.', alternate: '/ca/preu-pagina-web' }
        },
        {
            path: '/ca/preu-pagina-web',
            name: 'web-pricing-ca',
            component: LeadLandingView,
            meta: { locale: 'ca', leadPage: 'pricing', title: 'Preu d’una pàgina web corporativa', description: 'Descobreix què influeix en el preu d’una web corporativa i sol·licita una proposta personalitzada.', alternate: '/es/precio-pagina-web' }
        },
        {
            path: '/es/presupuesto-web',
            name: 'web-budget-es',
            component: ConfiguratorView,
            meta: { locale: 'es', title: 'Solicita presupuesto para tu página web', description: 'Cuéntame qué necesita tu web corporativa y recibirás una propuesta personalizada tras revisar el alcance.', alternate: '/ca/pressupost-web' }
        },
        {
            path: '/es/web-para-bodas',
            name: 'wedding-web-es',
            component: () => import('../views/WeddingLandingView.vue'),
            meta: { locale:'es', title:weddingLandings.es.title.split(' | ')[0], brand:'Casanova studio', description:weddingLandings.es.description }
        },
        {
            path: '/ca/webs-per-a-casaments',
            name: 'wedding-web-ca',
            component: () => import('../views/WeddingLandingView.vue'),
            meta: { locale:'ca', title:weddingLandings.ca.title.split(' | ')[0], brand:'Casanova studio', description:weddingLandings.ca.description }
        },
        {
            path: '/en/wedding-websites',
            name: 'wedding-web-en',
            component: () => import('../views/WeddingLandingView.vue'),
            meta: { locale:'en', title:weddingLandings.en.title.split(' | ')[0], brand:'Casanova studio', description:weddingLandings.en.description }
        },
        {
            path: '/ca/pressupost-web',
            name: 'web-budget-ca',
            component: ConfiguratorView,
            meta: { locale: 'ca', title: 'Sol·licita pressupost per a la teva pàgina web', description: 'Explica’m què necessita la teva web corporativa i rebràs una proposta personalitzada després de revisar l’abast.', alternate: '/es/presupuesto-web' }
        },
        {
            path: '/es/privacidad',
            name: 'privacy-es',
            component: () => import('../views/PrivacyView.vue'),
            meta: { locale:'es', title:'Privacidad', description:'Información de privacidad de los formularios de alexcasanova.es.', alternate:'/ca/privacitat' }
        },
        {
            path: '/ca/privacitat',
            name: 'privacy-ca',
            component: () => import('../views/PrivacyView.vue'),
            meta: { locale:'ca', title:'Privacitat', description:'Informació de privacitat dels formularis d’alexcasanova.es.', alternate:'/es/privacidad' }
        },
        {
            path: '/en/privacy',
            name: 'privacy-en',
            component: () => import('../views/PrivacyView.vue'),
            meta: { locale:'en', title:'Privacy', description:'How enquiries submitted through alexcasanova.es are handled.' }
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
