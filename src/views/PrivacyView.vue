<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const privacyCopy = {
  es: {
    eyebrow:'PRIVACIDAD', title:'Privacidad de las solicitudes', intro:'Información sobre el tratamiento de los datos que envías mediante los formularios de esta web.',
    purpose:'Finalidad y base jurídica', purposeText:'Los datos se utilizan exclusivamente para valorar el proyecto, responder la solicitud y realizar su seguimiento precontractual. La base jurídica es tu petición y el consentimiento expresado en el formulario.',
    retention:'Conservación y destinatarios', retentionText:'Se conservarán mientras la solicitud esté activa y durante los plazos necesarios para atender responsabilidades legales. Los proveedores técnicos de alojamiento, base de datos y correo solo tratan los datos para prestar esos servicios.',
    contact:'Responsable y contacto', rights:'Tus derechos', rightsText:'Puedes solicitar el acceso, rectificación, supresión, oposición, limitación o portabilidad escribiendo a la dirección indicada.'
  },
  ca: {
    eyebrow:'PRIVACITAT', title:'Privacitat de les sol·licituds', intro:'Informació sobre el tractament de les dades que envies mitjançant els formularis d’aquesta web.',
    purpose:'Finalitat i base jurídica', purposeText:'Les dades s’utilitzen exclusivament per valorar el projecte, respondre la sol·licitud i fer-ne el seguiment precontractual. La base jurídica és la teva petició i el consentiment expressat al formulari.',
    retention:'Conservació i destinataris', retentionText:'Es conservaran mentre la sol·licitud estigui activa i durant els terminis necessaris per atendre responsabilitats legals. Els proveïdors tècnics d’allotjament, base de dades i correu només tracten les dades per prestar aquests serveis.',
    contact:'Responsable i contacte', rights:'Els teus drets', rightsText:'Pots sol·licitar l’accés, rectificació, supressió, oposició, limitació o portabilitat escrivint a l’adreça indicada.'
  },
  en: {
    eyebrow:'PRIVACY', title:'Privacy of enquiries', intro:'How we handle the information you send through this website’s forms.',
    purpose:'Purpose and legal basis', purposeText:'We use your information only to assess your project, respond to your enquiry and follow up before a potential contract. The legal basis is your request and the consent you give in the form.',
    retention:'Retention and recipients', retentionText:'We keep your information while your enquiry is active and for as long as needed to meet legal obligations. Hosting, database and email providers process it only to provide those services.',
    contact:'Data controller and contact', rights:'Your rights', rightsText:'You can request access, correction, deletion, objection, restriction or portability by writing to the address above.'
  }
}
const copy = computed(() => privacyCopy[route.meta.locale] || privacyCopy.es)
</script>

<template>
  <main class="privacy page-wrapper container fade-in">
    <span class="eyebrow">LEGAL / {{ copy.eyebrow }}</span>
    <h1>{{ copy.title }}</h1>
    <p class="intro">{{ copy.intro }}</p>
    <section><h2>{{ copy.contact }}</h2><p>Àlex Casanova · <a href="mailto:hola@alexcasanova.es">hola@alexcasanova.es</a></p></section>
    <section><h2>{{ copy.purpose }}</h2><p>{{ copy.purposeText }}</p></section>
    <section><h2>{{ copy.retention }}</h2><p>{{ copy.retentionText }}</p></section>
    <section><h2>{{ copy.rights }}</h2><p>{{ copy.rightsText }}</p></section>
  </main>
</template>

<style scoped>
.privacy{max-width:1080px;padding-block:clamp(45px,8vw,110px)}.eyebrow{font-size:.65rem;letter-spacing:.14em;color:var(--text-secondary)}h1{margin:22px 0 28px}.intro{font-size:1.35rem;margin-bottom:65px;max-width:720px}.privacy section{display:grid;grid-template-columns:minmax(180px,280px) 1fr;gap:clamp(35px,8vw,100px);padding:32px 0;border-top:1px solid var(--border-color)}.privacy section h2{font-size:.9rem}.privacy section p{font-size:1rem;max-width:650px}.privacy a{text-decoration:underline;text-underline-offset:3px}@media(max-width:650px){.privacy section{grid-template-columns:1fr;gap:10px}}
.privacy h1 { font-size: clamp(2rem, 3.5vw, 3rem); line-height: 1.15; text-wrap: balance; }
.privacy .intro { font-size: 1.0625rem; line-height: 1.7; margin-bottom: 40px; }
</style>
