<script lang="ts">
    import { ActivitiesOld } from "$components";
    import type { IActivity } from "$lib/types";
    import type { PageData } from './$types'

    export let data: PageData

    let activities: IActivity[] = data.activities
</script>

<section class="stat">
    <h1>Статистика</h1>
    <ActivitiesOld activities={activities} />
</section>

<style>
</style>