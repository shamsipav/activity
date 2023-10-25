import { writable } from 'svelte/store'

export const mobileMenu = writable<{ open: () => void, close: () => void }>(undefined)

export const isMobile = writable(false)