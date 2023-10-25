<script lang="ts">
    import type { IActivity } from "$lib/types"
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher()

    export let activities: IActivity[] = []

    let activitiesByDate: IActivity[] = []

    const getActivitiesByDate = async (date: Date) => {
        let response = await fetch(`/api/date/${new Date(date).toLocaleDateString()}`, {
            method: 'GET',
        })

        if (response.ok) {
            activitiesByDate = await response.json()
            dispatch('update', activitiesByDate)
        }
    }
</script>


<div class="dates">
    {#each activities as activity}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="date" on:click={() => getActivitiesByDate(activity.date)} 
            class:active={new Date(activitiesByDate[0]?.date).toLocaleDateString() == new Date(activity.date).toLocaleDateString() || 
            activitiesByDate.length == 0 && new Date().toLocaleDateString() == new Date(activity.date).toLocaleDateString()}
        >
            <p>{new Date(activity.date).toLocaleDateString()}</p>
        </div>
    {/each}
</div>

<style>
    .dates {
        margin: 3rem auto 0 auto;
        max-width: fit-content;
    }

    .date {
        display: inline-block;
        padding: 0.5em 1.4rem;
        font-size: 1.2rem;
        border-radius: 0.2rem;
        color: white;
        cursor: pointer;
        border: 1px solid blueviolet;
        color: blueviolet;
        transition: 0.15s ease;
    }

    .date:not(:last-child) {
        margin-right: 0.5rem;
    }

    .date:hover, .date.active {
        background-color: blueviolet;
        color: white;
    }
</style>