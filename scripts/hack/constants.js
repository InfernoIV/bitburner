import { PORT, HANDLE, SCRIPT } from "scripts/constants.js"
import { RAM } from "scripts/ram/constants.js"
export { PORT, HANDLE, RAM, SCRIPT }

//enum to keep track of server status
export const STATE = {
    HACK: "HACK",
    GROW: "GROW",
    WEAKEN: "WEAKEN"
}