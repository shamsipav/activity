<script lang="ts">
    import { fade } from 'svelte/transition'

    export let text: string
</script>

{#if text}
    <div class="notify" transition:fade>
        {text}
    </div>
{/if}

<style>
    .notify {
        position: fixed;
        right: 0.9rem;
        z-index: 5;
        font-size: 1.8rem;
        background-color: #F5FCA5;
        border-radius: 0.5rem;
        padding: 0.3rem 1rem;
        bottom: 1rem;
        max-width: fit-content;
    }
</style>