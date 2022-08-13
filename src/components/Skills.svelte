<script>
    import { fly } from '../transitions'
    import { inview } from 'svelte-inview'

    const skills = [
        {
            title: 'Laravel/PHP',
            logo: 'laravel.png',
            rating: 80,
        },
        {
            title: 'C#',
            logo: 'csharp.png',
            rating: 70,
        },
        {
            title: 'Java',
            logo: 'java.png',
            rating: 50,
        },
        {
            title: 'Javascript',
            logo: 'javascript.png',
            rating: 90,
        },
        {
            title: 'Typescript',
            logo: 'typescript.png',
            rating: 75,
        },
        {
            title: 'HTML',
            logo: 'html.png',
            rating: 95,
        },
        {
            title: 'CSS',
            logo: 'css.png',
            rating: 85,
        },
        {
            title: 'Tailwind',
            logo: 'tailwind.png',
            rating: 95,
        },
        {
            title: 'Angular',
            logo: 'angular.png',
            rating: 70,
        },
        {
            title: 'Svelte',
            logo: 'svelte.png',
            rating: 90,
        },
        {
            title: 'Github',
            logo: 'github.png',
            rating: 85,
        },
        {
            title: 'Bitbucket',
            logo: 'bitbucket.png',
            rating: 95,
        },
        {
            title: 'Jira',
            logo: 'jira.png',
            rating: 90,
        },
        {
            title: 'Jenkins',
            logo: 'jenkins.png',
            rating: 60,
        },
        {
            title: 'SQL',
            logo: 'sql.png',
            rating: 65,
        },
        {
            title: 'GraphQL',
            logo: 'graphql.png',
            rating: 80,
        },
        {
            title: 'RavenDB',
            logo: 'ravendb.png',
            rating: 60,
        },
    ]

    let inView = false
</script>

<div class="flex flex-col space-y-4"
     class:min-h-screen={!inView}
     on:enter|once={() => inView = true}
     use:inview
>
    {#if inView}
        {#each skills as skill, index}
            <div class="space-y-2" transition:fly={{ x: '75%', delay: index * 50 }}>
                <div class="flex items-center space-x-4">
                    <img class="w-6 rounded-sm" src="images/{skill.logo}" alt={skill.logo} loading="lazy">
                    <p>{skill.title}</p>
                </div>
                <div class="relative self-stretch h-1">
                    <div class="absolute left-0 w-full h-full bg-gray-100"></div>
                    <div class="absolute left-0 h-full bg-blue-600" style="width: {skill.rating}%"></div>
                </div>
            </div>
        {/each}
    {/if}
</div>