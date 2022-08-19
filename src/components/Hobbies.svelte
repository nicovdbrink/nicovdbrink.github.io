<script>
    import Icon from './Icon.svelte'
    import { fly } from '../transitions'
    import { inview } from 'svelte-inview'

    const hobbies = [
        {
            icon: 'futbol',
            title: 'Voetbal'
        },
        {
            icon: 'biking',
            title: 'Fietsen'
        },
        {
            icon: 'gamepad',
            title: 'Gamen'
        },
        {
            icon: 'headphones-simple',
            title: 'Muziek'
        },
        {
            icon: 'running',
            title: 'Hardlopen'
        },
    ]

    let inView = false
</script>

<div class="grid grid-cols-2 gap-4 px-4 h-max"
     class:min-h-screen={!inView}
     on:enter|once={() => inView = true}
     use:inview
>
    {#if inView}
        {#each hobbies as hobby, index}
            <div class="flex flex-col justify-center items-center w-full"
                 transition:fly={{ x: '75%', delay: index * 75 }}
                 class:col-span-2={hobbies.length === (index + 1)}>
                <Icon name={hobby.icon}/>
                <p>{hobby.title}</p>
            </div>
        {/each}
    {/if}
</div>
