<script lang="ts">
    import { fly } from 'svelte/transition'
    import { mobileMenu } from '$lib/stores'

    let visible = false

    export const open = () => {
        if (visible) return
        visible = true
    }

    export const close = () => {
        if (!visible) return
        visible = false
    }
</script>

{#if visible}
    <div class="mobile-menu" transition:fly={{ x: 300, duration: 300 }}>
        <div class="head">
            Brand
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="close-btn" on:click={$mobileMenu.close}>
                <!-- Иконка закрытия -->
                Close svg
            </div>
        </div>
        <nav>
            <slot />
        </nav>
        <div class="rainbow"></div>
    </div>
{/if}

<style>
    .mobile-menu {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        z-index: 6;
        padding: 20px 1em;
        background-color: white;
        visibility: visible;
        overflow-y: auto;
    }

    .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .mobile-menu nav {
        display: block;
        padding-top: 5rem;
    }

    :global(.mobile-menu nav > a) {
        margin: 0;
        font-size: 1.5em;
    }

    .mobile-menu .rainbow {
        display: block;
        position: fixed;
        bottom: 0;
        left: 0;
    }
</style>
