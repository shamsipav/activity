import { writable } from 'svelte/store'

export const mobileMenu = writable<{ open: () => void, close: () => void }>(undefined)

export const modal = writable<{ open: () => void, close: () => void }>(undefined)

export const choosedDateInStore = writable(new Date())

export const isMobile = writable(false)