<script lang="ts">
    import { fade } from "svelte/transition";

    export let text: string
</script>

{#if text}
    <div class="notify" transition:fade>
        {text}
    </div>
{/if}

<style>
    .notify {
        font-family: Mont;
        position: absolute;
        right: 0.9rem;
        z-index: 5;
        background-color: blueviolet;
        border-radius: 0.5rem;
        border: 1px solid lightgray;
        padding: 1rem 2rem;
        bottom: 1rem;
        max-width: fit-content;
        color: white;
    }
</style>