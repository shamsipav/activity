<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte'
    import { fade } from 'svelte/transition'
    import { clickOutside } from '$lib/actions'
    
    export let closable = true
    export let hasFooter = true
    export let title = 'Modal'

    let ready = false
    let visible = false
    const TRANSITION_DELAY = 50
    const TRANSITION_DURATION = 50
    const dispatch = createEventDispatcher()

    export const open = () => {
        if (visible) return
        visible = true
        setTimeout(() => ready = true, (TRANSITION_DELAY + TRANSITION_DURATION))
        dispatch('open')
    }

    export const close = () => {
        if (!visible) return
        if (closable && ready) {
            visible = false
            setTimeout(() => ready = false, (TRANSITION_DELAY + TRANSITION_DURATION))
            dispatch('close')
        }
    }

    export const toggle = () => visible ? close() : open()

    onMount(() => {
        document.addEventListener('keyup', (event: KeyboardEvent) => {
            if (event.key == 'Escape') {
                close()
            }
        })
    })
</script>

{#if visible}
    <div class="modal" in:fade="{{ duration: TRANSITION_DURATION }}" out:fade="{{ delay: TRANSITION_DELAY, duration: TRANSITION_DURATION }}">
        <div class="modal__content" use:clickOutside={close}>
            <div class="modal__header">
                <!-- <h5 class="modal__title">{ title }</h5> -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <svg class="modal__close" on:click={close} width="67" height="67" viewBox="0 0 67 67" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M53.2316 13.7685C64.1295 24.6665 64.1295 42.3335 53.2316 53.2336C42.3336 64.1337 24.6665 64.1316 13.7665 53.2336C2.8664 42.3335 2.8664 24.6686 13.7665 13.7685C24.6665 2.86844 42.3315 2.87053 53.2316 13.7685ZM15.3472 51.6528C25.3575 61.663 41.6447 61.663 51.655 51.6528C61.6652 41.6426 61.6652 25.3553 51.655 15.3451C41.6447 5.33487 25.3575 5.33487 15.3472 15.3451C5.33702 25.3553 5.33912 41.6426 15.3472 51.6528Z" fill="black" fill-opacity="0.5"/>
                    <path d="M44.5507 20.8726L46.1294 22.4512L35.0786 33.5021L46.0771 44.5005L44.4984 46.0792L33.4999 35.0807L22.5014 46.0792L20.9227 44.5005L31.9212 33.5021L20.8704 22.4512L22.4491 20.8726L33.4999 31.9234L44.5507 20.8726Z" fill="black" fill-opacity="0.5"/>
                    </svg>
            </div>
            <div class="modal__body">
                <slot />
            </div>
            {#if hasFooter}
                <div class="modal__footer">
                    <button
                        type="button"
                        class="btn btn-secondary"
                        on:click={close}
                        >Отмена</button>
                    <button type="button" class="btn btn-primary" on:click={() => dispatch('confirm')}>Подтвердить</button>
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        display: block;
        background-color: rgba(125, 125, 125, 0.5);
        height: 100vh;
        width: 100vw;
        z-index: 10;

        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal__header {
        position: relative;
        text-align: center;
    }

    .modal__close {
        position: absolute;
        width: 3rem;
        fill: var(--gray-color);
        top: 110%;
        right: 0.8rem;
        z-index: 5;
        cursor: pointer;
    }

    @media (max-width: 768px) {
        .modal__content {
            padding: 0 15px;
            width: 100%;
        }
    }
</style>
