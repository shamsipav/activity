<script lang="ts">
    import type { IActivity } from '$lib/types'
    import { createEventDispatcher } from 'svelte'
    import { onMount } from 'svelte'

    const dispatch = createEventDispatcher()

    let activitiesByDate: IActivity[] = []

    let show = false

    export let choosedDate: Date = new Date()
    const getActivitiesByDate = async (date: Date) => {
        choosedDate = date

        let response = await fetch(`/api/date/${new Date(date).toLocaleDateString()}`, {
            method: 'GET',
        })

        if (response.ok) {
            activitiesByDate = await response.json()
            dispatch('update', { activitiesByDate, choosedDate })
        }
    }

    let dates: Date[] = []

    // Функция для генерации списка дат за месяц
    function generateDates() {
        const currentDate = new Date()
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const numDays = new Date(year, month + 1, 0).getDate() // Получаем количество дней в текущем месяце
    
        // Генерируем список дат
        dates = Array(numDays).fill().map((_, index) => new Date(year, month, index + 1))
    }

    // Вызываем функцию генерации дат на момент монтирования компонента
    onMount(generateDates)
</script>

<div class="calendar" class:show>
    <div class="row">
        <p class="month">Октябрь {choosedDate.getFullYear()}</p>
    </div>
    <div class="dates">
        {#each dates as date}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="date" on:click={() => getActivitiesByDate(date)} class:active={choosedDate.toLocaleDateString() == date.toLocaleDateString()}>
                <p>{date.getDate()}</p>
            </div>
        {/each}
    </div>
    <slot />
</div>

<style>
    .row {
        display: inline-flex;
        align-items: center;
        margin: 0 auto 1rem auto;
    }

    .month, .choosed {
        font-size: 1.5rem;
        font-weight: 200;
    }

    .month {
        margin-right: 1rem;
        margin-bottom: 1rem;
        font-size: 2rem;
    }
    .calendar {
        padding: 2rem;
        text-align: center;
        transition: 0.15s ease;
        background-color: white;
        border-radius: 1.5rem;
    }

    .dates {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1.2rem;
        max-width: fit-content;
        background-color: white;
        margin: 0 auto;
        column-gap: 1.8rem;
    }

    .date {
        padding: 0.2em 0.8rem;
        font-size: 2rem;
        font-weight: 600;
        border-radius: 1rem;
        color: white;
        cursor: pointer;
        background-color: #C2BDF385;
        color: black;
        transition: 0.15s ease;
    }

    .date:hover, .date.active {
        background-color: blueviolet;
        color: white;
    }
</style>