//get ui elements
const wnd = eval("window")
const doc = wnd["document"]

export async function main(ns) {
    const element = click(get_element("p", "Active Scripts").parentElement.parentElement)
    await ns.sleep(100)
    click(get_element("button", "Kill All Scripts"))

    ns.atExit(() => {
        const wnd = eval("window")
        const doc = wnd["document"]
        click(get_element("p", "Active Scripts").parentElement.parentElement.parentElement.firstChild)
        ns.tprint("Back to console")
    })
}


function get_element(type, text = "") {
    //get the buttons
    const elements = doc.getElementsByTagName(type)
    //if we have only 1 element
    if (elements.length == 1) {
        return elements[0]
    }
    //for each button found
    for (const element of elements) {
        //if the correct button
        if (element.innerText.includes(text)) {
            //return the element
            return element
        }
    }
    return null
}


const click = async elem => {
    //click the element
    await elem[Object.keys(elem)[1]].onClick({
        isTrusted: true
    })
    //if we chose to wait: wait
    //if (CLICK_SLEEP_TIME) await ns.sleep(CLICK_SLEEP_TIME)
}