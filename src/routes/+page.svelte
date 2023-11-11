<script lang="ts">
    import { Activities, DateMenuNew, Modal, Notify, Statistic } from '$components'
    import { choosedDateInStore } from '$lib/stores';
    import type { IActivity, IFood, IModal, IStep } from '$lib/types'
    import { getStats } from '$lib/utils'
    import type { PageData } from './$types'

    let modal: IModal
    export let data: PageData

    let activities: IActivity[] = data.activities
    let allActivities: IActivity[] = data.allActivities
    let foodsByDate: IFood[] = data?.foodsByDate || []
    let steps: IStep[] = data?.steps || []

    let message = ''

    let currentDate: Date = activities.length > 0 ? new Date(activities[0]?.date) : new Date()

    let stats = getStats(allActivities, foodsByDate, steps, currentDate)
    let averageReceivedCalories = stats.averageReceivedCalories
    let averageSpentCalories = stats.averageSpentCalories

    const showActivitiesByDate = (event: any) => {
        modal.close()
        activities = event.detail.activitiesByDate
        currentDate = event.detail.choosedDate

        stats = getStats(allActivities, foodsByDate, steps, currentDate)
        averageReceivedCalories = stats.averageReceivedCalories
        averageSpentCalories = stats.averageSpentCalories

        console.log('showActivitiesByDate currentDate: ', currentDate.toLocaleDateString())
    }

    const getAllActivities = async () => {
        let response = await fetch('/api/database', {
            method: 'GET',
            headers: { accept: 'application/json' },
        })

        let responseSteps = await fetch('/api/steps', {
            method: 'GET',
            headers: { accept: 'application/json' },
        })

        let responseFoods = await fetch('/api/calories', {
            method: 'GET',
            headers: { accept: 'application/json' },
        })

        // TODO: Переделать логику с проверкой содержимого message, добавить error = false/true в Notify
        if (response.ok && responseSteps.ok && responseFoods.ok) {
            allActivities = await response.json()
            steps = await responseSteps.json()
            foodsByDate = await responseFoods.json()

            let stats = getStats(allActivities, foodsByDate, steps, currentDate)
            averageReceivedCalories = stats.averageReceivedCalories
            averageSpentCalories = stats.averageSpentCalories

            console.log('Должна обновиться статистика')
        } else {
            message = 'Возникла ошибка при получении всех активностей'
            setTimeout(() => message = '', 2500)
        }
    }

    const updateSteps = (event: any) => {
        console.log('updateStepsEvent target steps = ' + event.detail.steps)
    
        let currentStep: any = steps.find(s => new Date(s.date).toLocaleDateString() == currentDate.toLocaleDateString())
        if (currentStep)
            currentStep.steps = event.detail.steps
    }

    const updateCalories = (event: any) => {
        console.log('updateCalories target calories = ' + event.detail.calories)
    
        let currentFood: any = foodsByDate.find(f => new Date(f.date).toLocaleDateString() == currentDate.toLocaleDateString())
        if (currentFood)
            currentFood.calories = event.detail.calories
    }

    const notifyHandler = (event: any) => {
        message = event.detail.message
        setTimeout(() => message = '', 2500)
    }

    let currentDateForStats: Date = new Date()
    const changeMonthHandler = (event: any) => {
        currentDateForStats = event.detail.choosedDate
        let stats = getStats(allActivities, foodsByDate, steps, currentDateForStats)
        averageReceivedCalories = stats.averageReceivedCalories
        averageSpentCalories = stats.averageSpentCalories
    }
</script>

<Modal bind:this={modal} hasFooter={false} title={'Modal'}>
    <DateMenuNew choosedDate={currentDate} on:update={showActivitiesByDate} on:month={changeMonthHandler}>
        <Statistic {currentDateForStats} {averageReceivedCalories} {averageSpentCalories} type="calendar" />
    </DateMenuNew>
</Modal>

<section class="main">     
    <div class="container">
        <Activities {activities} {currentDate} {steps} foods = {foodsByDate} 
            on:added={getAllActivities} 
            on:updated={getAllActivities} 
            on:updatesteps={updateSteps} 
            on:updatefood={updateCalories}
            on:notify={notifyHandler}
            on:calendar={modal.open}
        />
    </div>
</section>

<Notify text={message} />