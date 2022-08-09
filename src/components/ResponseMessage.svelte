<script>
    import { onMount } from 'svelte'
    import Icon from '../components/Icon.svelte'

    export let
        response,
        messages = []

    onMount(async () => {
        if (messages.length) {
            if (!Array.isArray(messages)) {
                messages = [messages]
            }
            return
        }

        await initMessages()
    })

    async function initMessages () {
        if (response?.ok) {
            return messages[0] = 'success'
        }

        if (response?.status === 422) {
            const data = await response.json()
            if (data?.errors?.message) {
                messages = Object.values(data.errors.message).flat()
            }
        }

        return messages[0] = 'failed'
    }

    function clearMessages () {
        messages = []
    }
</script>

{#if messages.length}
    <div class="h-min shadow rounded-md flex items-center space-x-2 justify-between px-4 py-2 text-base text-white {response?.ok ? 'bg-green-500' : 'bg-red-500'}">
        <div>
            {#each messages as message}
                <div>{message}</div>
            {/each}
        </div>
        <button class="hover:opacity-80" on:click={clearMessages}>
            <Icon name="times"/>
        </button>
    </div>
{/if}