<script>
    import { fly } from '../transitions'
    import { inview } from 'svelte-inview'

    let inView = false
    const aboutMe = {
        title: 'Over mij',
        description: 'Ik heb een positieve houding en breng altijd een glimlach op de werkvloer. ' +
            'Gebruiksvriendelijkheid stel ik voorop bij het ontwerpen en/of realiseren van online-omgevingen. ' +
            'Om dit te bereiken heb ik een goed en creatief inlevingsvermogen en streef ' +
            'ik ernaar dat iedereen tevreden is met de producten die ik oplever. ' +
            'Ik heb mijn liefde voor programmeren omgevormd in een carrière, waarbij ik veel energie krijg bij ' +
            'de afronding van taken of projecten. Ik zal dan ook elke nieuwe uitdaging met open armen ontvangen, ' +
            'het liefst doe ik dit in teamverband, waardoor ik en mijn collega’s van elkaar kunnen leren.'
    }
</script>

<div class="flex justify-center w-full"
     on:enter|once={() => inView = true}
     use:inview>
    {#if inView}
        <div class="flex flex-col py-4 mx-auto space-y-4 xl:w-1/2 px-4" transition:fly={{ x: '75%' }}>
            <h1 class="text-4xl text-blue-700">{aboutMe.title}</h1>
            <p>{aboutMe.description}</p>
        </div>
    {/if}
</div>