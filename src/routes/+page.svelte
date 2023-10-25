<script lang="ts">
    import { Activities, DateMenu, Notify } from "$components";
    import type { IActivity, IFood } from "$lib/types";
    import type { PageData } from './$types'

    export let data: PageData

    let activities: IActivity[] = data.activities
    let activitiesByDate: IActivity[] = data.activitiesByDate
    let foodsByDate: IFood[] = data.foodsByDate

    let message = ''

    const handleSubmit = async (e) => {
        const formData = new FormData(e.target)
        formData.append("date", new Date(activities[0]?.date).toLocaleDateString());
        

        let response = await fetch('/api/database', {
            method: 'POST',
            headers: { accept: 'application/json' },
            body: formData
        })

        // TODO: Переделать логику с проверкой содержимого message, добавить error = false/true в Notify
        if (response.ok) {
            e.target.reset();

            const newActivity = await response.json()
            activities = [...activities, newActivity]

            message = `Активность (${newActivity.date}) успешно добавлена!`
            setTimeout(() => message = '', 2500)
        } else {
            message = 'Возникла ошибка при добавлении активности'
            setTimeout(() => message = '', 2500)
        }
    }

    const showActivitiesByDate = (event) => {
        activities = event.detail
        currentDate = new Date(activities[0]?.date).toLocaleDateString()
    }

    let currentDate = new Date(activities[0]?.date).toLocaleDateString()
    let caloriesForm: HTMLFormElement
    const handleCaloriesSubmit = async (e) => {
        const formData = new FormData(e.target)
        formData.append("date", currentDate);       

        let response = await fetch('/api/calories', {
            method: 'POST',
            headers: { accept: 'application/json' },
            body: formData
        })

        // TODO: Переделать логику с проверкой содержимого message, добавить error = false/true в Notify
        if (response.ok) {
            const newCalories: IFood = await response.json()

            message = `Калории (${newCalories.date}) успешно обновлены!`
            setTimeout(() => message = '', 2500)
        } else {
            message = 'Возникла ошибка при обновлении калорий'
            setTimeout(() => message = '', 2500)
        }
    }

    $: currentDateCalories = foodsByDate.find(x => new Date(x.date).toLocaleDateString() == currentDate)?.calories

</script>

<section class="main">
    <div class="container">
        <h1>Калькулятор активностей</h1>   
        <form class="main__form" on:submit|preventDefault={handleSubmit}>
            <input class="input" type="text" name="duration" placeholder="Время бега, мин." required autocomplete="off">
            <input class="input" type="text" name="speed" placeholder="Скорость бега, км/час." required autocomplete="off">
            <button class="button">Добавить</button>
        </form>
        {#if activities?.length > 0}           
            <Activities {activities} />
            <form class="calories__form" on:submit|preventDefault={handleCaloriesSubmit} bind:this={caloriesForm}>
                <p>Употреблено в пищу</p>
                <input 
                    class="calories__input" type="text" name="calories" placeholder="Количество ккал." required autocomplete="off" 
                    on:change={() => caloriesForm.requestSubmit()} value={currentDateCalories}
                >
                <span>ккал.</span>
            </form>
        {:else}
            <p class="label">Сегодня еще не было активностей</p>
        {/if}
        <DateMenu activities={activitiesByDate} on:update={showActivitiesByDate} />
    </div>
</section>

<Notify text={message} />

<style>
    .main__form {
        margin-top: 3rem;
        text-align: center;
    }

    .label {
        text-align: center;
        margin-top: 2rem;
        font-size: 1.1rem;
    }

    .calories__form {
        margin-top: 1rem;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .calories__input {
        font-size: 1.1rem;
        padding: 0.2rem;
        margin: 0 0.5rem;
        text-align: center;
        max-width: 4rem;
        border: 1px solid white;
        border-radius: 0.2rem;
    }

    .calories__input:focus, .calories__input:hover {
        border: 1px solid blueviolet;
    }
</style>