<script lang="ts">
    import {fly} from './transitions'
    import Tailwindcss from './Tailwindcss.svelte'
    import Experience from './components/Experience.svelte'
    import AboutMe from './components/AboutMe.svelte'
    import Hobbies from './components/Hobbies.svelte'
    import Skills from './components/Skills.svelte'

    const contactInfo = {
        name: 'Nico van den Brink',
        title: 'Software developer',
        email: 'nicovdbrink@hotmail.com',
        linkedIn: 'https://www.linkedin.com/in/nico-van-den-brink-52b757194/'
    }

    const experience = {
        title: 'Werkervaring',
        items: [
            {
                level: 'medior',
                title: 'full-stack developer',
                place: 'Maxilia',
                location: 'Rhenen',
                description: 'Werkzaamheden: herschrijven van interne applicaties voor de  inrichting van een nieuwe klant omgeving en documenteren van gemaakte keuzes en veranderingen.\n\n' +
                    'Behaalde resultaten: Interne applicaties opgesplitst in meerdere databases, schrijven en lezen d.m.v. GraphQL.\n\n' +
                    'Gewerkt met: PHP (laravel), HTML, CSS (tailwind), Svelte, Jira, Bitbucket, Gitlab, Docker, GraphQL, MYSQL, PlantUML, SQS en S3.',
                period: 'nov 2021 - heden',
                logo: 'maxilia.png'
            },
            {
                level: 'junior',
                title: 'full-stack developer',
                place: 'Maxilia',
                location: 'Rhenen',
                description: 'Werkzaamheden: het uitvoeren van projecten die de interne processen bevorderen.\n\n' +
                    'Behaalde resultaten: twee verschillende webapplicaties, ontwikkelt voor het gebruik van interne afdelingen, waardoor interne processen zijn verbeterd/geautomatiseerd.\n\n' +
                    'Gewerkt met: PHP (laravel), HTML, CSS (tailwind), Svelte, Jira, Bitbucket, Jenkins, MYSQL, SQS en S3.',
                period: 'sep 2020 - okt 2021',
                logo: 'maxilia.png'
            },
            {
                level: 'junior',
                title: 'full-stack developer',
                place: 'Sneleentaxi',
                location: 'Utrecht',
                description: 'Werkzaamheden: het oppakken van projecten en bugs op het platform.\n\n' +
                    'Behaalde resultaten: o.a. een gamificatie systeem, een facturatiesysteem gekoppeld met Moneybird en andere projecten binnen het platform.\n\n' +
                    'Gewerkt met: C#, HTML, SCSS, Angular, Jira, Github, RavenDB, API’s en webhook',
                period: 'jan 2019 - aug 2020',
                logo: 'sneleentaxi.png'
            },
            {
                level: 'STAGIAIR',
                title: 'front-end developer',
                place: 'Sneleentaxi',
                location: 'Utrecht',
                description: 'Werkzaamheden: de voorkant van een nieuwe partneromgeving ontwerpen en realiseren met het Angular framework.\n\n' +
                    'Behaalde resultaten: Een nieuwe omgeving voor de partners van sneleentaxi, met als eindbeoordeling een 7,8.',
                period: 'sep 2018 - dec 2018',
                logo: 'sneleentaxi.png'
            },
        ]
    }

    const studies = {
        title: 'Opleidingen',
        items: [
            {
                title: 'Bachelor\n' + 'HBO-ICT software engineering',
                place: 'Hogeschool Utrecht',
                location: 'Utrecht',
                period: 'sep 2016 - aug 2020',
                description:
                    'Minor: E-Marketing & Social Media \n\n' +
                    'Scriptie: De effecten van gamificatie, met als eindbeoordeling een 8.\n\n' +
                    'Diploma: Ja',
                logo: 'hu.png'
            },
            {
                title: 'Havo',
                place: 'Ichthus college',
                location: 'Veenendaal',
                period: 'sep 2011 – mei 2016',
                description:
                    'Examenvakken: Nederlands, Engels, wiskunde A, economie, geschiedenis, informatica, management & organisatie.\n\n' +
                    'Diploma: Ja',
                logo: 'ichthus.png'
            }
        ]
    }

    const skills = {
        title: 'Vaardigheden'
    }

    const hobbies = {
        title: 'Interesses'
    }
</script>

<Tailwindcss/>
<main class="my-8 space-y-8">
    <div class="flex px-4 mx-auto space-x-4 max-w-xl xl:space-x-8">
        <div class="w-44 xl:w-72 h-full xl:h-42" transition:fly={{ y: '75%' }}>
            <img alt="profielfoto" class="h-full rounded-md shadow-xl" loading="lazy" src="public/images/profielfoto.png">
        </div>
        <div class="flex flex-wrap content-between tracking-wide xl:tracking-widest">
            <div class="flex flex-col">
                <h1 class="text-blue-700">{contactInfo.name}</h1>
                <h2 class="font-semibold text-blue-600">{contactInfo.title}</h2>
            </div>
            <div class="flex space-x-4 items-end">
                <button on:click={() => window.open(contactInfo.linkedIn)}>
                    <img class="h-6 xl:h-8" src="public/images/linkedIn.png" alt="linkedIn">
                </button>
                <p class="text-xs xl:text-base"><a href="mailto:{contactInfo.email}">{contactInfo.email}</a></p>
            </div>
        </div>
    </div>

    <div class="blue-bar">
        <h1 class="text-white">{experience.title}</h1>
    </div>
    <div>
        {#each experience.items as item, index}
            <Experience {item} delay={index * 75}/>
        {/each}
    </div>

    <div class="blue-bar">
        <h1 class="text-white">{studies.title}</h1>
    </div>
    <div class="pb-4">
        {#each studies.items as item, index}
            <Experience {item} delay={index * 75}/>
        {/each}
    </div>

    <hr>
    <AboutMe/>

    <div class="blue-bar">
        <div class="flex justify-between px-4 mx-auto w-full xl:w-1/2">
            <h1 class="text-white">{skills.title}</h1>
            <h1 class="text-white">{hobbies.title}</h1>
        </div>
    </div>

    <div class="flex justify-between px-4 mx-auto w-full xl:w-1/2">
        <Skills/>
        <Hobbies/>
    </div>

</main>

<style lang="less">
    h1 {
    @apply text-2xl xl:text-4xl;
    }

    h2 {
    @apply text-xl xl:text-3xl;
    }

    .blue-bar {
    @apply flex justify-center pb-1 w-screen bg-blue-600 h-min;
    }
</style>