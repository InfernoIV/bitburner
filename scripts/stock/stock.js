//imports
import * as CONSTANTS from "./constants.js"
import * as CONFIG from "./config.js"
//log
import * as log from "scripts/util/log.js"
import { formatNumber } from "scripts/util/format.js"

// Declaration
export class stock_obj {
    constructor() {
        //CONSTANTS.COMMISSION_FEE
        //CONFIG.FORECAST_MIN
    }


    init(ns) {
        //disable logging
        log.disable(ns, CONFIG.DISABLE_LOGGING)
        //create port
        this.port = ns.getPortHandle(CONSTANTS.PORT.HACK_REQUEST)
        //remove the data from the port
        this.port.clear()
        //if we have the accounts
        if (ns.stock.hasWseAccount() && ns.stock.hasTixApiAccess()) {
            let message_long = ""
            let message_short = ""
            //for each order
            for (const symbol of CONSTANTS.STOCK_SYMBOLS) { //ns.stock.getSymbols()) {
                //get stocks
                const [sharesLong, avgLongPrice, sharesShort, avgShortPrice] = ns.stock.getPosition(symbol)
                //if there are longs
                if (sharesLong > 0) {
                    //if there are entries
                    if (message_long != "") {
                        //add a comma
                        message_long += ", "
                    }
                    //add the data
                    message_long += sharesLong + " * " + symbol
                }
                //if there are short
                if (sharesShort > 0) {
                    //if there are entries
                    if (message_short != "") {
                        //add a comma
                        message_short += ", "
                    }
                    //add the data
                    message_short += sharesShort + " * " + symbol
                }
            }
            if (message_long != "") {
            //log
            log.info(ns, "Stocks", "Longs: " + message_long, true)
            }
            if (message_short != "") {
                //log
                log.info(ns, "Stocks", "Shorts: " + message_short, true)
            }
        }
        //log
        log.info(ns, "Stocks", "Init complete", true)
    }


    /*
    stock.getForecast   2.5
    stock.hasWseAccount 0.05
    Stock.sellStock     2.5
    Stock.getPosition   2
    */
    manage(ns) {
        //if we're allowed to trade
        if (ns.stock.hasWseAccount() && ns.stock.hasTixApiAccess()) {
            //get the data
            const data = this.port.peek()
            //if there is port data pending
            if (data != CONSTANTS.PORT.NO_DATA) {            
                //if it is for us
                if (data.request == "complete") {
                    //get stocks for this symbol (amount can be changed)
                    const [sharesLong, avgLongPrice, sharesShort, avgShortPrice] = ns.stock.getPosition(data.symbol)

                    //if long
                    if (data.type == "long") {
                        //sell
                        const profit = ns.stock.sellStock(data.symbol, sharesLong)
                        //log
                        log.success(ns, "Stock", "Sold longs: '" + data.symbol + "' * " + sharesLong +
                            " for a profit of " + formatNumber(profit),
                            true)

                        //if shorts
                    } else if (data.type == "short") {
                        //sell
                        const profit = ns.stock.sellStock(data.symbol, sharesShort)
                        //log
                        log.success(ns, "Stock", "Sold shorts: '" + data.symbol + "' * " + sharesShort +
                            " for a profit of " + formatNumber(profit),
                            true)

                        //invalid type
                    } else {
                        //log
                        log.error(ns, "Stock", "manage - uncaught type: '" + data.type + "'", true)
                    }

                    //remove the message
                    this.port.read()
                }
                //not waiting on hack
            } else {
                //try
                try {
                    //for each order
                    for (const symbol of CONSTANTS.STOCK_SYMBOLS) { 
                        //get stocks
                        const [sharesLong, avgLongPrice, sharesShort, avgShortPrice] = ns.stock.getPosition(symbol)
                        //if we have longs
                        if (sharesLong > 0) {
                            //get hostnames of symbol
                            const hostnames = this.get_server_hostnames(symbol)
                            //for each hostname
                            for (const hostname of hostnames) {
                                //get the server
                                const server = ns.getServer(hostname)
                                //write data
                                this.port.tryWrite({
                                    "request": "hack",
                                    "hostname": hostname,
                                    "symbol": symbol,
                                    "type": "long",
                                })
                                //log
                                log.info(ns, "Stock", "Send hack request for '" + hostname + "' (" + symbol + ")",
                                    true)
                                //stop and wait for hack to reply
                                return
                            }
                        }
                        /*
                        //if we have longs
                        if (sharesShort > 0) {
                            //get hostnames of symbol
                            const hostnames = this.get_server_hostnames(symbol)
                            //for each hostname
                            for (const hostname of hostnames) {
                                //get the server
                                const server = ns.getServer(hostname)
                                //write data
                                this.port.tryWrite({
                                    "request": "hack",
                                    "hostname": hostname,
                                    "symbol": symbol,
                                    "type": "short",
                                })
                                //log
                                log.info(ns, "Stock", "Send hack request for '" + hostname + "' (" + symbol + ")",
                                    true)
                                //stop and wait for hack to reply
                                return
                            }
                        }
                        */
                    }
                } catch (err) {
                    log.error(ns, "Stock", "manage - Error: " + err, true)
                }
            }
        }
    }


    is_server_empty(ns, hostname) {
        //get the server
        const server = ns.getServer(hostname)
        //check if current money = 0
        return server.moneyAvailable == 0
    }


    get_server_hostnames(symbol) {
        //depending on the symbols, return the corresponding hostnames
        switch (symbol) {
            case "ECP":
                return ["ecorp"] //"Ecorp"
            case "MGCP":
                return ["megacorp"] //"MegaCorp"
            case "BLD":
                return ["blade"] //"Blade"
            case "CLRK":
                return ["clarkinc"] //"Clarke Incorporated"
            case "OMTK":
                return ["omnitek"] //"OmniTek Incorporated"
            case "FSIG":
                return ["4sigma"] //"Four Sigma"
            case "KGI":
                return ["kuai-gong"] //"KuaiGong International"
            case "FLCM":
                return ["fulcrumtech", "fulcrumassets"] //"Fulcrum Technologies"
            case "STM":
                return ["stormtech"] //"Storm Technologies"
            case "DCOMM":
                return ["defcomm"] //"DefComm"
            case "HLS":
                return ["helios"] //"Helios Labs"
            case "VITA":
                return ["vitalife"] //"VitaLife"
            case "ICRS":
                return ["icarus"] //"Icarus Microsystems"
            case "UNV":
                return ["univ-energy"] //"Universal Energy"
            case "AERO":
                return ["aerocorp"] //"AeroCorp"
            case "OMN":
                return ["omnia"] //"Omnia Cybersystems"
            case "SLRS":
                return ["solaris"] //"Solaris Space Systems"
            case "GPH":
                return ["global-pharm"] //"Global Pharmaceuticals"
            case "NVMD":
                return ["nova-med"] //"Nova Medical"
            case "LXO":
                return ["lexo-corp"] //"LexoCorp"
            case "RHOC":
                return ["rho-construction"] //"Rho Construction"
            case "APHE":
                return ["alpha-ent"] //"Alpha Enterprises"
            case "SYSC":
                return ["syscore"] //"SysCore Securities"
            case "CTK":
                return ["computek"] //"CompuTek"
            case "NTLK":
                return ["netlink"] //"NetLink Technologies"
            case "OMGA":
                return ["omega-net"] //"Omega Software"
            case "FNS":
                return ["foodnstuff"] //"FoodNStuff"
            case "JGN":
                return ["joesguns"] //"Joe's Guns"
            case "SGC":
                return ["sigma-cosmetics"] //"Sigma Cosmetics"
            case "CTYS":
                return ["catalyst"] //"Catalyst Ventures"
            case "MDYN":
                return ["microdyne"] //"Microdyne Technologies"
            case "TITN":
                return ["titan-labs"] //"Titan Laboratories"

                //No server avaialable
            case "WDS": //"Watchdog Security",
            default:
                return []
        }
    }
}


/*
ns.stock.hasWseAccount      -> covered in stock
ns.stock.hasTixApiAccess    -> covered in stock
ns.stock.getPosition        -> covered in stock
ns.stock.sellStock          -> covered in stock
*/
export function sell_all_stocks(ns) {
    //if we're allowed to trade
    if (ns.stock.hasWseAccount() && ns.stock.hasTixApiAccess()) {
        try {
            //for each order
            for (const symbol of CONSTANTS.STOCK_SYMBOLS) {
                //get stocks
                const [sharesLong, avgLongPrice, sharesShort, avgShortPrice] = ns.stock.getPosition(symbol)
                //if we have longs
                if (sharesLong > 0) {
                    //just sell
                    const profit = ns.stock.sellStock(symbol, shares)
                }
                if (sharesShort > 0) {
                    //TODO
                }
            }
        } catch (err) {
            log.error(ns, "Stock", "Error: " + err, true)
        }
    }
}
