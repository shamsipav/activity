import { query } from "$lib/db";
import type { IActivity, IFood } from "$lib/types";

export async function load() {
    try {

        const result: IActivity[] = await query('SELECT * FROM public.activities WHERE date = CURRENT_DATE');
        const activitiesByDate: IActivity[] = await query('SELECT DISTINCT date FROM public.activities ORDER BY date DESC');
        const foodsByDate: IFood[] = await query('SELECT * FROM public.foods ORDER BY date DESC');

        return {
            activities: result.rows,
            activitiesByDate: activitiesByDate.rows,
            foodsByDate: foodsByDate.rows
        }
    } 
    catch(error) 
    {
        console.log(error)
        return {
            activities: {},
            activitiesByDate: {},
            foodsByDate: {}
        }
    }
}