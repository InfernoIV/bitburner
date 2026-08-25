export async function main(ns) {
    let i = 0
    while(true) {
        await ns.sleep(1000)
        ns.tprint(i)
        i += 1
    }
}