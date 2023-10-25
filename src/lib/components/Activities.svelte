<script lang="ts">
    import type { IActivity } from "$lib/types"
    import { fade } from "svelte/transition"

    export let activities: IActivity[] = []

    $: date = new Date(activities[0].date).toLocaleDateString()
    $: totalCalories = calculateTotalCalories(activities)

    let message = ''

    const calculateBurnedCalories = (duration: number, speed: number) => {
        const met = interpolate(speed, [4.8, 8.5], [2.5, 4.9])
        return Math.round(48 * met * 0.0175 * duration)
    }

    // Функция интерполяции
    const interpolate = (value: number, inputRange: [number, number], outputRange: [number, number]) => {
        const [inputMin, inputMax] = inputRange
        const [outputMin, outputMax] = outputRange
        return outputMin + ((outputMax - outputMin) * (value - inputMin)) / (inputMax - inputMin);
    }

    const calculateTotalCalories = (activities: IActivity[]) => {
        let totalCalories = 0   
        activities.forEach((activity) => {
            totalCalories += calculateBurnedCalories(activity.duration, activity.speed)
        })
        return totalCalories;
    }

    const deleteActivityById = async (id: string) => {
        let response = await fetch(`/api/database/${id}`, {
            method: 'DELETE',
            headers: { accept: 'application/json' }
        })

        if (response.ok) {
            activities = activities.filter(x => x.id != id)
        } else {
            console.error('Произошла ошибка при удалении активности, попробуйте выполнить запрос позже')
            setTimeout(() => message = '', 2500)
        }
    }

    let form: HTMLFormElement

    const updateActivity = async (e) => {
        const formData = new FormData(e.target)
        formData.append("id", currentId);

        let response = await fetch(`/api/database/${currentId}`, {
            method: 'PUT',
            headers: { accept: 'application/json' },
            body: formData
        })

        // TODO: Переделать логику с проверкой содержимого message, добавить error = false/true в Notify
        if (response.ok) {
            const updated = await response.json()
            const index = activities.findIndex(x => x.id == updated.id);
            if (index !== -1) {
                activities[index].speed = updated.speed;
                activities[index].duration = updated.duration;
                console.log(activities[index])
            }
        } else {
            console.error('Возникла ошибка при добавлении активности');
            setTimeout(() => message = '', 2500)
        }
    }

    let currentId = ''
    const updateHandler = (id: string) => {
        currentId = id
        console.log(currentId, id)
        form.requestSubmit()
    }
</script>

<div class="activities">
    <h2>Ваша активность {date == new Date().toLocaleDateString() ? `сегодня, ${date}` : date}</h2>
    <div class="activity">
        <p class="head">Продолжительность</p>
        <p class="head">Скорость</p>
        <p class="head">Сожжено</p>
    </div>
    {#each activities as activity}
        <form on:submit|preventDefault={updateActivity} bind:this={form}>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="activity" transition:fade>
                <input class="activity__input" name="duration" type="text" value={activity.duration} on:change={() => updateHandler(activity.id)}/>
                <input class="activity__input" name="speed" type="text" value={activity.speed} on:change={() => updateHandler(activity.id)}/>
                <p class="calories">{calculateBurnedCalories(activity.duration, activity.speed)} ккал.</p>
                <div class="delete" on:click={() => deleteActivityById(activity.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 30 30">
                        <path d="M 14.984375 2.4863281 A 1.0001 1.0001 0 0 0 14 3.5 L 14 4 L 8.5 4 A 1.0001 1.0001 0 0 0 7.4863281 5 L 6 5 A 1.0001 1.0001 0 1 0 6 7 L 24 7 A 1.0001 1.0001 0 1 0 24 5 L 22.513672 5 A 1.0001 1.0001 0 0 0 21.5 4 L 16 4 L 16 3.5 A 1.0001 1.0001 0 0 0 14.984375 2.4863281 z M 6 9 L 7.7929688 24.234375 C 7.9109687 25.241375 8.7633438 26 9.7773438 26 L 20.222656 26 C 21.236656 26 22.088031 25.241375 22.207031 24.234375 L 24 9 L 6 9 z"></path>
                    </svg>
                </div>
            </div>
        </form>
    {/each}
    <p class="total">Всего за день потрачено {totalCalories} ккал.</p>
</div>

<style>
    h2 {
        font-weight: 600;
        text-align: center;
        font-size: 1.3rem;
        margin-bottom: 2rem;
    }

    .total {
        text-align: center;
        margin-top: 1.5rem;
        font-size: 1.1rem;
    }

    .activities {
        margin-top: 3rem;
    }

    .activity {
        padding: 1rem;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        text-align: center;
        position: relative;
    }

    .delete {
        position: absolute;
        right: 0;
        width: 1.7rem;
        height: 1.7rem;
        cursor: pointer;

        top: 50%;
        transform: translateY(-50%);
    }

    .delete:hover {
        fill: red;
    }

    .activity {
        border-bottom: 1px solid rgba(137, 43, 226, 0.164);
    }

    .activity:not(:first-child) {
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
    }

    .head {
        padding-bottom: 0.5rem;
        font-weight: 600;
    }

    .activity__input {
        padding: 0.2rem;
        border-radius: 0.2rem;
        display: inline-block;
        margin: 0 auto;
        text-align: center;
        max-width: 4rem;
        border: 1px solid white;
    }

    .activity__input:focus, .activity__input:hover {
        border: 1px solid blueviolet;
    }
</style>