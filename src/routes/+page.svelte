<script lang="ts">
    import { Activities, DateMenuNew, Modal, Notify, Statistic } from '$components'
    import { choosedDateInStore } from '$lib/stores'
    import type { IActivity, IFood, IModal, IStep, IUnion } from '$lib/types'
    import { getStats } from '$lib/utils'
    import type { PageData } from './$types'

    let modal: IModal
    export let data: PageData

    let activities: IActivity[] = data.activities
    let allActivities: IActivity[] = data.allActivities
    let foodsByDate: IFood[] = data?.foodsByDate || []
    let steps: IStep[] = data?.steps || []

    console.log('+page.server.ts completed queries')
    console.log('activities: ', activities)
    console.log('allActivities: ', allActivities)
    console.log('foodsByDate: ', foodsByDate)
    console.log('steps: ', steps)
    console.log('')

    let message = ''

    let currentDate: Date = activities.length > 0 ? new Date(activities[0]?.date) : new Date()

    let stats = getStats(allActivities, foodsByDate, steps, currentDate)
    let averageReceivedCalories = stats.averageReceivedCalories
    let averageSpentCalories = stats.averageSpentCalories

    const showActivitiesByDate = (event: any) => {
        modal.close()
        const unionObject: IUnion = event.detail.unionObject
        activities = unionObject.activities
        currentDate = unionObject.date
        steps = unionObject.steps
        foodsByDate = unionObject.foods
    }

    const getAllActivities = async (date = currentDate) => {
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

            let stats = getStats(allActivities, foodsByDate, steps, date)
            averageReceivedCalories = stats.averageReceivedCalories
            averageSpentCalories = stats.averageSpentCalories
        }
        else
        {
            message = 'Возникла ошибка при получении всех активностей'
            console.log(message)
            setTimeout(() => message = '', 2500)
        }
    }

    const updateSteps = (event: any) => {
        let currentStep: any = steps.find(s => new Date(s.date).toLocaleDateString() == currentDate.toLocaleDateString())
        if (currentStep)
            currentStep.steps = event.detail.steps
    }

    const updateCalories = (event: any) => {
        let currentFood: any = foodsByDate.find(f => new Date(f.date).toLocaleDateString() == currentDate.toLocaleDateString())
        if (currentFood)
            currentFood.calories = event.detail.calories
    }

    const notifyHandler = (event: any) => {
        message = event.detail.message
        console.log('NOTIFY ' + message)
        setTimeout(() => message = '', 2500)
    }

    let currentDateForStats: Date = new Date()
    const changeMonthHandler = async (event: any) => {
        currentDateForStats = event.detail.choosedDate
        await getAllActivities(currentDateForStats)
    }

    const calendarHandler = async () => {
        await getAllActivities()
        modal.open()
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
            on:calendar={calendarHandler}
        />
    </div>
</section>

<Notify text={message} />