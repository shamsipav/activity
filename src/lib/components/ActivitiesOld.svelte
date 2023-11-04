<script lang="ts">
    import type { IActivity } from '$lib/types'
    import { fade } from 'svelte/transition'

    export let activities: IActivity[] = []

    // Группировка активностей по дате
    const groupActivitiesByDate = () => {
        const groupedActivities = new Map()
    
        activities.forEach((activity) => {
            const date = new Date(activity.date).toLocaleDateString()
    
            if (!groupedActivities.has(date)) {
                groupedActivities.set(date, [])
            }
            groupedActivities.get(date).push(activity)
        })

        return groupedActivities
    }

    // Получение массива дат
    const getDates = () => {
        return Array.from(groupedActivities.keys())
    }

    const calculateBurnedCalories = (duration: number, speed: number) => {
        const met = interpolate(speed, [6.5, 8.5], [3.6, 4.9])
        return Math.round(48 * met * 0.0175 * duration)
    }

    // Функция интерполяции
    const interpolate = (value: number, inputRange: [number, number], outputRange: [number, number]) => {
        const [inputMin, inputMax] = inputRange
        const [outputMin, outputMax] = outputRange
        return outputMin + ((outputMax - outputMin) * (value - inputMin)) / (inputMax - inputMin)
    }

    // Получение активностей по дате
    const getActivitiesByDate = (date) => {
        return groupedActivities.get(date)
    }

    // Вычисление общего количества потраченных калорий за день
    const calculateTotalCalories = (activities: IActivity[]) => {
        let totalCalories = 0
        activities.forEach((activity) => {
            totalCalories += calculateBurnedCalories(activity.duration, activity.speed)
        })
        return totalCalories
    }

    const groupedActivities = groupActivitiesByDate()
</script>

<div class="activities">
    <!-- Вывод активностей по датам -->
    {#each getDates() as date}
            <p class="total">За {date == new Date().toLocaleDateString() ? `сегодня, ${date}` : date} потрачено {calculateTotalCalories(getActivitiesByDate(date))} ккал.</p>
    {/each}
</div>


  <style>
    .total {
        text-align: center;
        margin-top: 1.5rem;
        margin-bottom: 1rem;
        font-size: 1.1rem;
    }
  </style>