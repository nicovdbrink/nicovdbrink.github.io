<script>
    import { fly } from '../transitions'
    import { inview } from 'svelte-inview'

    export let
        item = {},
        delay = 0

    let inView = false
</script>

<div class="flex justify-center w-full" class:min-h-screen={!inView}
     on:enter|once={() => inView = true}
     use:inview
>
    {#if inView}
        <div class="grid grid-cols-4 gap-8 w-full xl:w-2/3 pl-4" transition:fly={{ x: '75%', delay }}>
            <div class="flex flex-col text-left xl:text-right text-gray-900 uppercase -mt-1.5 text-xs xl:text-base">
                {#if item.level}
                    <p>{item.level}</p>
                {/if}
                <p class="whitespace-pre-line">{item.title}</p>
                <p class="text-xxs xl:text-sm opacity-60">{item.period}</p>
            </div>
            <div class="flex relative flex-col col-span-3 pl-8 pr-4 pb-8 border-l border-gray-200">
                <div class="absolute -top-2 -left-3">
                    <img alt="{item.logo}" class="py-1 w-6 bg-white" loading="lazy" src="public/images/{item.logo}">
                </div>
                <div class="-mt-1.5 space-y-1 relative">
                    <div class="flex items-center space-x-1">
                        <p class="font-medium text-blue-600">{`${item.place}, ${item.location}`}</p>
                    </div>
                    <p class="whitespace-pre-line">{item.description}</p>
                </div>
            </div>
        </div>
    {/if}
</div>