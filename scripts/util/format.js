export function float(number, decimals = 2) {
    const divider = parseInt("1" + "0".repeat(decimals))
    return Math.round(number * divider) / divider
}

//function that formats a number to 2 fractions
export function formatNumber(number) {
    // Use the toLocaleString method to add suffixes to the number
    return number.toLocaleString('en-US', {
        // add suffixes for thousands, millions, and billions
        // the maximum number of decimal places to use
        maximumFractionDigits: 2,
        // specify the abbreviations to use for the suffixes
        notation: 'compact',
        compactDisplay: 'short'
    })
}

export function format_time(time) {
    let ms = time % 1000
    let ss = Math.floor(time / 1000) % 60
    let mm = Math.floor(time / 1000 / 60) % 60
    let hh = Math.floor(time / 1000 / 60 / 60)
    return `${hh}:${mm}:${ss}`
}