//config
import { DISABLE_LOGGING, FORECAST_MIN } from "./config.js"


//constants
import { COMMISSION_FEE, STOCK_SYMBOLS, SERVER_HOSTNAMES } from "./constants.js"
import { PORT } from "scripts/constants/ports.js"

//functions
import * as log from "scripts/util/log.js"
import * as format from "scripts/util/format.js"


// Declaration
export class stock_obj {
    constructor() {
        //COMMISSION_FEE
        //FORECAST_MIN
    }


    init(ns) {
        //disable logging
        log.disable(ns, DISABLE_LOGGING)
        //create port
        this.port = ns.getPortHandle(PORT.HACK_REQUEST)
        //remove the data from the port
        this.port.clear()
        //if we have the accounts
        if (ns.stock.hasWseAccount() && ns.stock.hasTixApiAccess()) {
            let message_long = ""
            let message_short = ""
            //for each order
            for (const symbol of STOCK_SYMBOLS) {
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
            if (data != PORT.NO_DATA) {            
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
                            " for a profit of " + format.number(profit),
                            true)

                        //if shorts
                    } else if (data.type == "short") {
                        //sell
                        const profit = ns.stock.sellStock(data.symbol, sharesShort)
                        //log
                        log.success(ns, "Stock", "Sold shorts: '" + data.symbol + "' * " + sharesShort +
                            " for a profit of " + format.number(profit),
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
                    for (const symbol of STOCK_SYMBOLS) { 
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
        //if there is no hostname for this symbol
        if (!SERVER_HOSTNAMES.has(symbol)) {
            //return empy
            return []
        }
        //get the hostname from the map
        return SERVER_HOSTNAMES.get(symbol)
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
            for (const symbol of STOCK_SYMBOLS) {
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
