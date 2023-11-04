export const clickOutside = (element: Element, callbackFunction: () => void) => {
    function onClick(event: Event) {
        if (!element.contains(event.target as Node)) {
            callbackFunction()
        }
    }

    document.body.addEventListener('click', onClick)

    return {
        update(newCallbackFunction: () => void) {
            callbackFunction = newCallbackFunction
        },
        destroy() {
            document.body.removeEventListener('click', onClick)
        }
    }
}