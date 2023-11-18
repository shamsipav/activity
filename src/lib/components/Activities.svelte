<script lang="ts">
    import type { IActivity, IFood, IStep } from '$lib/types'
    import { fade } from 'svelte/transition'
    import { createEventDispatcher } from 'svelte'
    import { getLocalISOTimeString, replaceCommaWithDot } from '$lib/utils';

    const dispatch = createEventDispatcher()

    export let activities: IActivity[] = []
    export let steps: IStep[] = []
    export let foods: IFood[] = []
    export let currentDate: Date

    $: trainCalories = calculateTotalCalories(activities)

    $: currentDateSteps = steps.find(x => new Date(x.date).toLocaleDateString() == currentDate.toLocaleDateString())?.steps
    $: currentDateFoodCalories = foods.find(x => new Date(x.date).toLocaleDateString() == currentDate.toLocaleDateString())?.calories

    $: stepsCalories = currentDateSteps ? Math.round(0.5 * 48 * currentDateSteps) : 0

    $: totalBurnedOfDay = trainCalories + stepsCalories

    let message = ''
    
    let speedInputValue: string
    let durationInputValue: string

    const calculateBurnedCalories = (duration: number, speed: number) => {
        speed = +replaceCommaWithDot(speed)
        const met = interpolate(speed, [4.8, 8.5], [2.5, 4.9])
        return Math.round(48 * met * 0.0175 * duration)
    }

    // Функция интерполяции
    const interpolate = (value: number, inputRange: [number, number], outputRange: [number, number]) => {
        const [inputMin, inputMax] = inputRange
        const [outputMin, outputMax] = outputRange
        return outputMin + ((outputMax - outputMin) * (value - inputMin)) / (inputMax - inputMin)
    }

    const calculateTotalCalories = (activities: IActivity[]) => {
        let totalCalories = 0
        activities.forEach((activity) => {
            totalCalories += calculateBurnedCalories(activity.duration, activity.speed)
        })
        return totalCalories
    }

    const deleteActivityById = async (id: string) => {
        let response = await fetch(`/api/database/${id}`, {
            method: 'DELETE',
            headers: { accept: 'application/json' }
        })

        if (response.ok) {
            activities = activities.filter(x => x.id != id)
            dispatch('notify', { message: 'Активность успешно удалена' })
        } else {
            dispatch('notify', { message: 'Произошла ошибка при удалении активности' })
            setTimeout(() => message = '', 2500)
        }
    }

    let stepForm: HTMLFormElement
    let caloriesForm: HTMLFormElement

    const updateActivity = async (activity: IActivity) => {
        const formData = new FormData()
        formData.append('id', activity.id)
        formData.append('speed', activity.speed.toString())
        formData.append('duration', activity.duration.toString())

        let response = await fetch(`/api/database/${activity.id}`, {
            method: 'PUT',
            headers: { accept: 'application/json' },
            body: formData
        })

        // TODO: Переделать логику с проверкой содержимого message, добавить error = false/true в Notify
        if (response.ok) {
            const updated = await response.json()
            const index = activities.findIndex(x => x.id == updated.id)
            if (index !== -1) {
                activities[index].speed = updated.speed
                activities[index].duration = updated.duration
            }
            console.log('updateActivity = ', updated)
            dispatch('updated')
            dispatch('notify', { message: 'Активность успешно обновлена' })
        } else {
            dispatch('notify', { message: 'Возникла ошибка при обновлении активности' })
        }
    }

    const updateHandler = async (activity: IActivity) => {
        console.log('updateHandler ' + JSON.stringify(activity))
        await updateActivity(activity)
    }

    const handleSubmit = async (e: any) => {
        const formData = new FormData(e.target)
        formData.append('date', getLocalISOTimeString(currentDate))

        let response = await fetch('/api/database', {
            method: 'POST',
            headers: { accept: 'application/json' },
            body: formData
        })

        // TODO: Переделать логику с проверкой содержимого message, добавить error = false/true в Notify
        if (response.ok) {
            speedInputValue = null;
            durationInputValue = null;
            e.target.reset()

            const newActivity = await response.json()
            activities = [...activities, newActivity]

            dispatch('added')
            dispatch('notify', { message: `Активность (${newActivity.date.toLocaleDateString()}) успешно добавлена!` })
        } else {
            dispatch('notify', { message: 'Возникла ошибка при добавлении активности' })
        }
    }

    const handleStepForm = async (e: any) => {
        const formData = new FormData(e.target)
        formData.append('date', getLocalISOTimeString(currentDate))

    
        let response = await fetch('/api/steps', {
            method: 'POST',
            headers: { accept: 'application/json' },
            body: formData
        })

        // TODO: Переделать логику с проверкой содержимого message, добавить error = false/true в Notify
        if (response.ok) {
            const newSteps: IStep = await response.json()
            console.log(newSteps)
            dispatch('updated')
            dispatch('updatesteps', { steps: newSteps.steps })
            dispatch('notify', { message: `Шаги (${newSteps.date.toLocaleDateString()}) успешно добавлены!` })

            stepsCalories = 0.5 * 48 * newSteps.steps

        } else {
            dispatch('notify', { message: 'Возникла ошибка при добавлении шагов' })
        }
    }

    const handleCaloriesSubmit = async (e) => {
        const formData = new FormData(e.target)
        formData.append('date', getLocalISOTimeString(currentDate))

        let response = await fetch('/api/calories', {
            method: 'POST',
            headers: { accept: 'application/json' },
            body: formData
        })

        // TODO: Переделать логику с проверкой содержимого message, добавить error = false/true в Notify
        if (response.ok) {
            const newCalories: IFood = await response.json()
            dispatch('updated')
            dispatch('updatefood', { calories: newCalories.calories })
            dispatch('notify', { message: `Калории (${newCalories.date.toLocaleDateString()}) успешно обновлены!` })
        } else {
            dispatch('notify', { message: 'Возникла ошибка при обновлении калорий' })
        }
    }
</script>

<div class="row-wrapper">
    <div class="row">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <svg class="calendar" on:click={() => dispatch('calendar')} width="70" height="70" viewBox="0 0 51 54" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M36.8333 5.66667H14.1667V7.08333C14.1667 7.86574 13.5324 8.5 12.75 8.5C11.9676 8.5 11.3333 7.86574 11.3333 7.08333V5.66667H7.08333C4.73612 5.66667 2.83333 7.56946 2.83333 9.91667V17H48.1667V9.91667C48.1667 7.56946 46.2639 5.66667 43.9167 5.66667H39.6667V7.08333C39.6667 7.86574 39.0324 8.5 38.25 8.5C37.4676 8.5 36.8333 7.86574 36.8333 7.08333V5.66667ZM39.6667 2.83333H43.9167C47.8287 2.83333 51 6.00465 51 9.91667V46.7708C51 50.6828 47.8287 53.8542 43.9167 53.8542H7.08333C3.17132 53.8542 0 50.6828 0 46.7708V9.91667C0 6.00465 3.17132 2.83333 7.08333 2.83333H11.3333V1.41667C11.3333 0.634263 11.9676 0 12.75 0C13.5324 0 14.1667 0.634263 14.1667 1.41667V2.83333H36.8333V1.41667C36.8333 0.634263 37.4676 0 38.25 0C39.0324 0 39.6667 0.634263 39.6667 1.41667V2.83333ZM48.1667 19.8333H2.83333V46.7708C2.83333 49.118 4.73612 51.0208 7.08333 51.0208H43.9167C46.2639 51.0208 48.1667 49.118 48.1667 46.7708V19.8333ZM5.66667 24.0833C5.66667 23.3009 6.30093 22.6667 7.08333 22.6667H12.75C13.5324 22.6667 14.1667 23.3009 14.1667 24.0833V29.75C14.1667 30.5324 13.5324 31.1667 12.75 31.1667H7.08333C6.30093 31.1667 5.66667 30.5324 5.66667 29.75V24.0833ZM8.5 25.5V28.3333H11.3333V25.5H8.5Z" fill="#9C97D1"/>
        </svg>            
        <div class="check">
            <svg width="57" height="58" viewBox="0 0 57 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_334_53)">
                <path d="M55.4725 13.2392L55.3751 13.1418C54.1103 11.877 51.8726 11.877 50.6077 13.1418L45.5485 18.2984C45.2566 18.5903 44.8675 18.5903 44.5755 18.2984L37.473 11.6825C36.7919 11.0986 35.9163 10.7095 34.9433 10.7095H24.3382C24.0463 10.7095 23.8517 10.8068 23.7544 10.9041L14.8033 19.466C13.5384 20.8282 13.4411 22.9686 14.6086 24.2334C15.1924 24.9145 16.068 25.3036 17.041 25.3036C18.014 25.3036 18.8895 24.9145 19.4734 24.2334L25.7974 17.5202H28.0352L13.2467 34.0601H4.10107C1.86336 34.0601 0.112021 35.7141 0.0147003 37.7573C-0.0826205 38.8275 0.306553 39.8978 1.0849 40.6761C1.86324 41.3572 2.83623 41.8436 3.90643 41.8436H17.5277C17.8196 41.8436 18.0142 41.7463 18.2087 41.5518L25.214 34.0602L31.0516 40.1897L29.3002 51.4759C28.8137 53.4217 29.7867 55.2704 31.4407 56.0487C32.0245 56.3406 32.5109 56.4379 33.0947 56.4379C33.6786 56.4379 34.2623 56.3406 34.8461 56.0487C35.8191 55.5622 36.5974 54.5894 36.8893 53.4217L39.9053 37.1736C39.9053 36.8817 39.808 36.4925 39.6135 36.2979L31.538 28.2225L37.9595 21.8011L42.435 26.2766C43.6998 27.5415 45.8404 27.5415 47.1051 26.2766L55.4724 17.9093C56.7373 16.6444 56.7373 14.504 55.4725 13.2392ZM54.1103 16.5472L45.743 24.9145C45.1592 25.4009 44.2837 25.4009 43.7972 24.9145L38.6406 19.7579C38.2514 19.3687 37.6676 19.3687 37.2784 19.7579L29.4949 27.5415C29.3002 27.7361 29.203 27.9306 29.203 28.2225C29.203 28.5143 29.3003 28.709 29.5922 29.0008L37.9595 37.3681L35.0406 53.0325C34.846 53.5189 34.4568 54.0054 33.9704 54.2973C33.4839 54.4919 32.9002 54.5891 32.3164 54.2973C31.4407 53.9081 31.0516 52.9351 31.2462 51.8649L33.0947 39.995C33.0947 39.7031 32.9974 39.4112 32.8029 39.2166L25.895 32.0169C25.7003 31.8222 25.5058 31.725 25.214 31.725C24.9221 31.725 24.6301 31.8224 24.5329 32.0169L17.1385 39.8977H3.90654C3.32273 39.8977 2.83634 39.703 2.44717 39.3139C2.15532 38.9247 1.96068 38.4382 1.96068 37.8545C1.96068 36.7843 2.93366 36.0059 4.10118 36.0059H13.636C13.9278 36.0059 14.1225 35.9086 14.317 35.9086L30.857 17.4227C31.1489 17.1309 31.1489 16.7417 31.0517 16.3525C30.9543 15.9634 30.5652 15.7687 30.176 15.7687H25.3113C25.1166 15.7687 24.8248 15.866 24.6303 16.0606L18.0142 23.0658C17.8196 23.3577 17.4304 23.5523 17.0412 23.5523C16.652 23.5523 16.2629 23.3577 15.971 23.0658C15.4845 22.482 15.4845 21.6064 16.0683 21.0226L24.7276 12.7527H35.0407C35.4299 12.7527 35.9164 12.9473 36.2082 13.2392L43.3107 19.8552C44.3809 20.8282 46.0349 20.7309 47.0079 19.7579L52.0672 14.6013C52.5537 14.1148 53.5266 14.1148 54.0131 14.6013L54.1104 14.6986C54.5968 15.185 54.5968 16.0607 54.1103 16.5472Z" fill="black"/>
                <path d="M44.7701 13.6284C47.9808 13.6284 50.6078 11.0015 50.6078 7.79072C50.6078 4.57991 47.9808 1.95312 44.7701 1.95312C41.5594 1.95312 38.9324 4.58002 38.9324 7.79083C38.9324 11.0016 41.5594 13.6284 44.7701 13.6284ZM44.7701 3.89899C46.9106 3.89899 48.6618 5.65032 48.6618 7.79072C48.6618 9.93123 46.9105 11.6825 44.7701 11.6825C42.6297 11.6825 40.8783 9.93112 40.8783 7.79072C40.8783 5.65032 42.6297 3.89899 44.7701 3.89899Z" fill="black"/>
                </g>
                <defs>
                <clipPath id="clip0_334_53">
                <rect width="56.4211" height="56.4211" fill="white" transform="translate(0 0.985107)"/>
                </clipPath>
                </defs>
            </svg>                            
            <p class="spent">{totalBurnedOfDay? totalBurnedOfDay : 0} ккал</p>
        </div>
        <form class="check calories__form" on:submit|preventDefault={handleCaloriesSubmit} bind:this={caloriesForm}>
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_359_14)">
                <path d="M29.8703 50.3511C18.6484 50.3511 9.51869 41.2217 9.51869 30.0003C9.51869 18.7784 18.6484 9.64868 29.8703 9.64868C41.0917 9.64868 50.2211 18.7784 50.2211 30.0003C50.2211 41.2219 41.0917 50.3511 29.8703 50.3511ZM29.8703 11.1189C19.4592 11.1189 10.9889 19.589 10.9889 30.0003C10.9889 40.411 19.459 48.8809 29.8703 48.8809C40.281 48.8809 48.7509 40.411 48.7509 30.0003C48.7509 19.589 40.281 11.1189 29.8703 11.1189ZM5.18636 49.5087H3.10679C2.70072 49.5087 2.3717 49.1795 2.3717 48.7736V25.8987C0.970761 25.2754 0 23.938 0 22.3924V12.072C0 11.6661 0.329027 11.3369 0.73509 11.3369C1.14115 11.3369 1.47018 11.6661 1.47018 12.072V21.6573H2.27408V12.072C2.27408 11.6661 2.6031 11.3369 3.00917 11.3369C3.41523 11.3369 3.74426 11.6661 3.74426 12.072V21.6573H4.54903V12.072C4.54903 11.6661 4.87806 11.3369 5.28412 11.3369C5.69019 11.3369 6.01922 11.6661 6.01922 12.072V21.6573H6.82326V12.072C6.82326 11.6661 7.15228 11.3369 7.55835 11.3369C7.96441 11.3369 8.29344 11.6661 8.29344 12.072V22.3924C8.29344 23.938 7.32253 25.2754 5.9216 25.8989V48.7736C5.92145 49.1795 5.59242 49.5087 5.18636 49.5087ZM3.84188 48.0385H4.45141V26.2725H3.84188V48.0385ZM1.5975 23.1274C1.94343 24.0981 2.95536 24.8024 4.14665 24.8024C5.33793 24.8024 6.34986 24.0981 6.69579 23.1274H1.5975ZM56.5565 49.3192H54.4101C54.004 49.3192 53.675 48.99 53.675 48.5841V11.6499C53.675 11.3466 53.8614 11.0742 54.1441 10.9645C54.4276 10.8547 54.7481 10.9301 54.9529 11.1541C55.1178 11.3348 59.0003 15.648 59.693 21.7617C60.3672 27.7063 59.7239 37.5143 59.6961 37.9289C59.6702 38.315 59.3496 38.6151 58.9626 38.6151H57.2915V48.5841C57.2916 48.99 56.9626 49.3192 56.5565 49.3192ZM55.1453 47.849H55.8216V38.6151H55.1453V47.849ZM55.1453 37.1449H58.2709C58.4056 34.7804 58.7912 26.8532 58.2325 21.9273C57.8396 18.4608 56.2876 15.5678 55.1453 13.848V37.1449ZM29.8703 43.9677C22.1681 43.9677 15.9021 37.7019 15.9021 30.0003C15.9021 22.2981 22.1681 16.0321 29.8703 16.0321C37.5719 16.0321 43.8377 22.2983 43.8377 30.0003C43.8377 37.7019 37.5719 43.9677 29.8703 43.9677ZM29.8703 17.5022C22.9788 17.5022 17.3722 23.1088 17.3722 30.0003C17.3722 36.8913 22.9788 42.4975 29.8703 42.4975C36.7613 42.4975 42.3675 36.8913 42.3675 30.0003C42.3675 23.1088 36.7613 17.5022 29.8703 17.5022ZM15.4082 20.7262C15.2768 20.7262 15.1437 20.6911 15.0238 20.6171C14.6778 20.4044 14.5702 19.9516 14.783 19.6058C17.2148 15.6541 21.7069 13.5527 21.8969 13.4653C22.2657 13.2953 22.7024 13.4566 22.8722 13.8255C23.0419 14.194 22.8809 14.6304 22.5124 14.8003C22.47 14.82 18.2292 16.8108 16.035 20.3763C15.896 20.602 15.6549 20.7262 15.4082 20.7262Z" fill="black"/>
                </g>
                <defs>
                <clipPath id="clip0_359_14">
                <rect width="60" height="60" fill="white"/>
                </clipPath>
                </defs>
                </svg>                              
            <input 
                class="calories__input" type="text" name="calories" required autocomplete="off" 
                on:change={() => caloriesForm.requestSubmit()} value={currentDateFoodCalories ? currentDateFoodCalories : ''}
            >
            <p>ккал</p>
        </form>
    </div>
</div>

<div class="activities">
    <p class="date">{currentDate.toLocaleDateString()}</p>
    <h2 class="activities__heading">Активность</h2>
    <div class="activity">
        <p class="head">Скорость, км/ч</p>
        <p class="head">Время, мин</p>
        <p class="head">Калории</p>
    </div>
    {#each activities as activity}
        <div>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="activity" transition:fade>
                <input class="activity__input" name="speed" type="text" bind:value={activity.speed} on:change={() => updateHandler(activity)}/>
                <input class="activity__input" name="duration" type="text" bind:value={activity.duration} on:change={() => updateHandler(activity)}/>
                <p class="calories">{calculateBurnedCalories(activity.duration, activity.speed)}</p>
                <div class="delete" on:click={() => deleteActivityById(activity.id)}>
                    <svg viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M27.9774 13.783L26.8074 29.0206C26.8074 29.6536 26.5559 30.2606 26.1084 30.7081C25.6609 31.1556 25.0539 31.4071 24.421 31.4071H14.5801C13.9472 31.4071 13.3402 31.1556 12.8926 30.7081C12.4451 30.2606 12.1937 29.6536 12.1937 29.0206L11.0237 13.783" stroke="#020202" stroke-width="0.5" stroke-miterlimit="10" stroke-linecap="round"/>
                        <path d="M23.4351 12.2491H16.3293" stroke="#020202" stroke-width="0.5" stroke-miterlimit="10" stroke-linecap="round"/>
                        <path d="M13.7112 12.2492H8.65796V10.7714C8.65796 10.4818 8.77301 10.2041 8.9778 9.99928C9.18259 9.79449 9.46034 9.67944 9.74996 9.67944H17.0956C17.0956 9.67554 17.0956 9.67203 17.0956 9.66852C17.0956 8.52192 18.1724 7.59216 19.5004 7.59216C20.8283 7.59216 21.9051 8.52192 21.9051 9.66852C21.9051 9.67203 21.9051 9.67554 21.9051 9.67944H29.25C29.5396 9.67944 29.8173 9.79449 30.0221 9.99928C30.2269 10.2041 30.342 10.4818 30.342 10.7714V12.2492H26.1834" stroke="#020202" stroke-width="0.5" stroke-miterlimit="10" stroke-linecap="round"/>
                        <path d="M15.4971 17.7695V27.3288" stroke="#020202" stroke-width="0.5" stroke-miterlimit="10" stroke-linecap="round"/>
                        <path d="M19.5 17.7695V27.3288" stroke="#020202" stroke-width="0.5" stroke-miterlimit="10" stroke-linecap="round"/>
                        <path d="M23.5029 17.7695V27.3288" stroke="#020202" stroke-width="0.5" stroke-miterlimit="10" stroke-linecap="round"/>
                    </svg>
                </div>
            </div>
        </div>
    {/each}
    <form class="activity" transition:fade on:submit|preventDefault={handleSubmit}>
        <input class="activity__input" type="text" name="speed" on:change={(e) => speedInputValue = e.target.value} required autocomplete="off">
        <input class="activity__input" type="text" name="duration" on:change={(e) => durationInputValue = e.target.value} required autocomplete="off">
        <p class="calories">{durationInputValue && speedInputValue ? calculateBurnedCalories(durationInputValue, speedInputValue) : 0}</p>
        <button class="create">         
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_312_58)">
                <path d="M14 0C6.28075 0 0 6.28075 0 14C0 21.7192 6.28075 28 14 28C21.7192 28 28 21.7192 28 14C28 6.28075 21.7192 0 14 0ZM14 27.125C6.76288 27.125 0.875 21.2371 0.875 14C0.875 6.76288 6.76288 0.875 14 0.875C21.2371 0.875 27.125 6.76288 27.125 14C27.125 21.2371 21.2371 27.125 14 27.125Z" fill="#6B6D73"/>
                <path d="M20.5625 14H14.875V7.4375C14.875 7.196 14.679 7 14.4375 7C14.196 7 14 7.196 14 7.4375V14H7.4375C7.196 14 7 14.196 7 14.4375C7 14.679 7.196 14.875 7.4375 14.875H14V20.5625C14 20.804 14.196 21 14.4375 21C14.679 21 14.875 20.804 14.875 20.5625V14.875H20.5625C20.804 14.875 21 14.679 21 14.4375C21 14.196 20.804 14 20.5625 14Z" fill="#6B6D73"/>
                </g>
                <defs>
                <clipPath id="clip0_312_58">
                <rect width="28" height="28" fill="white"/>
                </clipPath>
                </defs>
            </svg>
        </button>
    </form>
    <p class="total">Потраченные калории за тренировку: <span class="value">{trainCalories}</span></p>
    <form class="step__form" on:submit|preventDefault={handleStepForm} bind:this={stepForm}>
        <p class="total">Пройдено за день, км:</p>
        <input 
            class="activity__input" type="text" name="steps" required autocomplete="off" 
            on:change={() => stepForm.requestSubmit()} value={currentDateSteps ? currentDateSteps : ''}
        >
        <p class="steps-calories">{stepsCalories ? stepsCalories : 0}</p>
    </form>
</div>

<style>
    .activities__heading {
        font-size: 48px;
        text-align: center;
        margin-bottom: 2rem;
    }

    .create, .delete {
        position: absolute;
        right: 0;
        width: 2.5rem;
        height: 2.53rem;
        cursor: pointer;
        transform: translateY(-50%);
    }

    .create {
        top: 55%;
    }

    .create svg {
        position: relative;
        right: 0.3rem;
    }

    .date {
        text-align: right;
        font-size: 48px;
    }

    .total {
        margin-top: 2rem;
        font-size: 2.3rem;
        margin-bottom: 1rem;
    }

    .activities {
        max-width: 900px;
        margin: 0 auto;
        font-size: 2rem;
        padding: 1rem 3rem;
        border-radius: 35px;
        margin-top: 3rem;
        background: linear-gradient(180deg, rgba(194,189,243,1) 0%, rgba(233,235,242,1) 100%);
    }

    .activity {
        padding: 0.5rem 0;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        text-align: center;
        position: relative;
    }

    .delete {
        top: 50%;
    }

    .delete:hover {
        fill: red;
    }

    .activity {
        border-bottom: 1px solid rgba(0, 0, 0, 0.486) ;
    }
    .head {
        padding-bottom: 0.5rem;
        font-weight: 600;
    }

    .activity__input {
        line-height: 1;
        font-size: 2.3rem;
        border-radius: 0.2rem;
        display: inline-block;
        margin: 0 auto;
        text-align: center;
        max-width: 4rem;
        background-color: transparent;
        border: 1px solid rgba(0, 0, 0, 0.486)    
    }

    .calories {
        font-size: 2.3rem;
    }

    .value {
        margin-left: 11.6rem;
        line-height: 1;
        display: inline-block;
        background-color: transparent;
    }

    .item {
        display: flex;
        align-items: center;
        justify-content: right;
    }

    .activity__input:focus, .activity__input:hover {
        border: 1px solid black;
    }

    .step__form {
        display: flex;
        align-items: center;
    }

    .step__form .total {
        margin-top: 0;
    }

    .steps-calories {
        font-size: 2.3rem;
        margin-right: 7.1rem;
    }

    .check {
        display: flex;
        align-items: center;
        font-size: 2.3rem;
    }

    .check input {
        border: 1px solid #000;
        padding: 0 0.6rem;
        border-radius: 0.5rem;
        margin-left: 1rem;
        background: transparent;
        max-width: 5rem;
        text-align: center;
        font-size: 2.3rem;
    }

    .check p {
        margin-left: 0.5rem;
    }

    .calendar {
        padding: 0.5rem 0.7rem;
        border-radius: 0.5rem;
        cursor: pointer;
        margin-right: 4rem;
        background-color: #F5FCA5;
    }

    .row {
        display: flex;
        align-items: center;
    }

    .check:not(:last-child) {
        margin-right: 4rem;
    }

    .row-wrapper {
        display: flex;
        justify-content: center;
    }
</style>