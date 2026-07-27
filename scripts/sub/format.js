export function float(number, decimals = 2) {
    const divider = parseInt("1" + "0".repeat(decimals))
    return Math.round(number * divider) / divider
}