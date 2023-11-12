<script lang="ts">
    import type { IActivity } from '$lib/types'
    import { createEventDispatcher } from 'svelte'
    import { onMount } from 'svelte'

    const dispatch = createEventDispatcher()

    let activitiesByDate: IActivity[] = []

    let show = false

    // For change mounths
    export let choosedDate: Date = new Date()

    let currentDate = choosedDate

    const getActivitiesByDate = async (date: Date, dispatched = true) => {
        choosedDate = date

        // TODO: Сделай так, чтобы в запросе к api/date/{date} возвращался объект, где есть
        // все активности за день, все шаги за день, и все калории полученные за день
        let response = await fetch(`api/date/${new Date(date).toLocaleDateString()}`, {
            method: 'GET',
        })

        if (response.ok) {
            activitiesByDate = await response.json()
            if (dispatched) {
                dispatch('update', { activitiesByDate, choosedDate })
            }
        }
    }

    let dates: Date[] = []

    // Функция для генерации списка дат за месяц
    function generateDates(year: number, month: number) {
        const numDays = new Date(year, month + 1, 0).getDate() // Получаем количество дней в указанном месяце

        // Генерируем список дат
        dates = Array(numDays).fill().map((_, index) => new Date(year, month, index + 1))
    }

    // Вызываем функцию генерации дат на момент монтирования компонента
    onMount(() => {
        const year = choosedDate.getFullYear()
        const month = choosedDate.getMonth()

        generateDates(year, month)
        //console.log('DateMenu mounted')
    })

    function changeMonth(month: number) {
        const year = choosedDate.getFullYear()
        let newDate = new Date(year, month)

        // if (choosedDate.getMonth() == newDate.getMonth()) {
        //     newDate = choosedDate
        // }

        generateDates(year, month)

        if (newDate.getMonth() === choosedDate.getMonth()) {
            getActivitiesByDate(choosedDate, false)
        } else {
            choosedDate = newDate
            dispatch('month', { choosedDate })
        }
    }
</script>

<div class="calendar" class:show>
    <div class="row">
        <button on:click={() => changeMonth(choosedDate.getMonth() - 1)}>       
            <svg width="30" height="25" viewBox="0 0 43 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M42 18L1 18M1 18L18.0833 35M1 18L18.0833 0.999997" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
        <p class="month">{choosedDate.toLocaleString('default', { month: 'long' })} {choosedDate.getFullYear()}</p>
        <button on:click={() => changeMonth(choosedDate.getMonth() + 1)}>           
            <svg width="30" height="25" viewBox="0 0 43 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 18H42M42 18L24.9167 1M42 18L24.9167 35" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
    </div>
    <!-- <p style="font-size: 2rem;">choosed: {choosedDate.toLocaleDateString()}</p> -->
    <div class="dates">
        {#each dates as date}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="date" on:click={() => getActivitiesByDate(date)} class:active={currentDate.toLocaleDateString() == date.toLocaleDateString()}>
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

    .month {
        font-size: 1.5rem;
        font-weight: 200;
    }

    .month {
        margin-right: 1rem;
        margin-left: 1rem;
        margin-bottom: 1rem;
        font-size: 2rem;
        text-transform: capitalize;
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
        background-color: #F5FCA5;
    }
</style>