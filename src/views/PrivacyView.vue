<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const ca = computed(() => route.meta.locale === 'ca')
</script>

<template>
  <main class="privacy page-wrapper container fade-in">
    <span class="eyebrow">LEGAL / {{ ca ? 'PRIVACITAT' : 'PRIVACIDAD' }}</span>
    <h1>{{ ca ? 'Privacitat de les sol·licituds' : 'Privacidad de las solicitudes' }}</h1>
    <p class="intro">{{ ca ? 'Informació sobre el tractament de les dades que envies mitjançant els formularis d’aquesta web.' : 'Información sobre el tratamiento de los datos que envías mediante los formularios de esta web.' }}</p>
    <section><h2>{{ ca ? 'Responsable i contacte' : 'Responsable y contacto' }}</h2><p>Àlex Casanova · <a href="mailto:hola@alexcasanova.tech">hola@alexcasanova.tech</a></p></section>
    <section><h2>{{ ca ? 'Finalitat i base jurídica' : 'Finalidad y base jurídica' }}</h2><p>{{ ca ? 'Les dades s’utilitzen exclusivament per valorar el projecte, respondre la sol·licitud i fer-ne el seguiment precontractual. La base jurídica és la teva petició i el consentiment expressat al formulari.' : 'Los datos se utilizan exclusivamente para valorar el proyecto, responder la solicitud y realizar su seguimiento precontractual. La base jurídica es tu petición y el consentimiento expresado en el formulario.' }}</p></section>
    <section><h2>{{ ca ? 'Conservació i destinataris' : 'Conservación y destinatarios' }}</h2><p>{{ ca ? 'Es conservaran mentre la sol·licitud estigui activa i durant els terminis necessaris per atendre responsabilitats legals. Els proveïdors tècnics d’allotjament, base de dades i correu només tracten les dades per prestar aquests serveis.' : 'Se conservarán mientras la solicitud esté activa y durante los plazos necesarios para atender responsabilidades legales. Los proveedores técnicos de alojamiento, base de datos y correo solo tratan los datos para prestar esos servicios.' }}</p></section>
    <section><h2>{{ ca ? 'Els teus drets' : 'Tus derechos' }}</h2><p>{{ ca ? 'Pots sol·licitar l’accés, rectificació, supressió, oposició, limitació o portabilitat escrivint a l’adreça indicada.' : 'Puedes solicitar el acceso, rectificación, supresión, oposición, limitación o portabilidad escribiendo a la dirección indicada.' }}</p></section>
  </main>
</template>

<style scoped>
.privacy{max-width:1080px;padding-block:clamp(45px,8vw,110px)}.eyebrow{font-size:.65rem;letter-spacing:.14em;color:var(--text-secondary)}h1{margin:22px 0 28px}.intro{font-size:1.35rem;margin-bottom:65px;max-width:720px}.privacy section{display:grid;grid-template-columns:minmax(180px,280px) 1fr;gap:clamp(35px,8vw,100px);padding:32px 0;border-top:1px solid var(--border-color)}.privacy section h2{font-size:.9rem}.privacy section p{font-size:1rem;max-width:650px}.privacy a{text-decoration:underline;text-underline-offset:3px}@media(max-width:650px){.privacy section{grid-template-columns:1fr;gap:10px}}
.privacy h1 { font-size: clamp(2rem, 3.5vw, 3rem); line-height: 1.15; text-wrap: balance; }
.privacy .intro { font-size: 1.0625rem; line-height: 1.7; margin-bottom: 40px; }
</style>
