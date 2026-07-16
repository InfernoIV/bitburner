/** @param {NS} ns */
export async function main(ns) {
    //get port
    const port = ns.args[0] //2
    //get ram
    const ram = ns.args[1] //2
    //get command
    const command = ns.args[2] //ns.args[0]

    //TODO: (how) to make dynamic? or just take the highest ram usage?
    ns.ramOverride(ram)

    //debug
    ns.print("trying to execute: '" + command + "'")
    //execute the command
    var result = await eval(command)
    //debug
    ns.print(command + " = '" + JSON.stringify(result) + "'")
    //failsafe
    if (result == undefined || result == null) {
        //set to any value
        result = "NOK"
    }
    ns.print("'" + command + "' resulted into '" + result + "'")
    //write to port
    ns.getPortHandle(port).tryWrite(JSON.stringify(result))
}