<script lang="ts">
    import { mobileMenu } from '$lib/stores'
    import { MobileMenu } from '$components'

    let scroll = false

    const scrollHandler = () => {
        const currentScroll = window.scrollY
        const scrolled = currentScroll > 60
        if (scrolled) {
            scroll = true
        } else {
            scroll = false
        }
    }
</script>

<svelte:window on:scroll={scrollHandler}></svelte:window>

<MobileMenu bind:this={ $mobileMenu }>
    <ul>
        <li><a class="link" href="/statistic" on:click={$mobileMenu.close}>Статистика</a></li>
        <li><a class="link" href="/#link2" on:click={$mobileMenu.close}>Menu link #1</a></li>
        <li>
            <button>Button</button>
        </li>
    </ul>
</MobileMenu>

<header class:scroll>
    <div class="container">
        <a href="/">Activity</a>
        <nav class="l-hide">
            <ul>
                <li><a class="link" href="/statistic" on:click={$mobileMenu.close}>Статистика</a></li>
                <li><a class="link" href="/#link2" on:click={$mobileMenu.close}>Menu link #1</a></li>
            </ul>
        </nav>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="m-hide" on:click={$mobileMenu.open}>
            Open mobile menu
        </div>
    </div>
</header>

<style>
    header {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        padding: 20px 0;
        background-color: white;

        border-bottom: 1px solid black;

        transition: 0.2s;
        z-index: 5;
    }

    header.scroll {
        box-shadow: 0 20px 50px 0 rgba(0,0,0,.05);
        background-color: white;
        padding: 10px 0;
    }

    header .container {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    nav ul {
        display: flex;
        align-items: center;
    }

    nav ul li:not(:last-child) {
        margin-right: 2rem;
    }
</style>