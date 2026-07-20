//requires no SF to use
import * as CONSTANTS from "scripts/constants.js"
import * as log from "scripts/sub/log.js"
import * as evaluate from "scripts/sub/evaluate.js"


// Declaration
export class stock_obj {
    constructor() {
    }

    
    init(ns) {
        
    }
}


/*
https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.stock.md
Stock 	Stock market API

buyShort(sym, shares)										Short stocks.
buyStock(sym, shares)										Buy stocks.
cancelOrder(sym, shares, price, orderType, positionType)	Cancel order for stocks.
getAskPrice(sym)											Returns the ask price of that stock.
getBidPrice(sym)											Returns the bid price of that stock.
getBonusTime()												Get Stock Market bonus time.
getConstants()												Get game constants for the stock market mechanic.
getForecast(sym)											Returns the probability that the specified stock’s price will increase (as opposed to decrease) during the next tick.
getMaxShares(sym)											Returns the maximum number of shares of a stock.
getOrders()													Returns your order book for the stock market.
getOrganization(sym)										Returns the organization associated with a stock symbol.
getPosition(sym)											Returns the player’s position in a stock.
getPrice(sym)												Returns the price of a stock.
getPurchaseCost(sym, shares, positionType)					Calculates cost of buying stocks.
getSaleGain(sym, shares, positionType)						Calculate profit of selling stocks.
getSymbols()												Returns an array of the symbols of the tradable stocks
getVolatility(sym)											Returns the volatility of the specified stock.
has4SData()													Returns true if the player has access to the 4S Data
has4SDataTixApi()											Returns true if the player has access to the 4SData TIX API
hasTixApiAccess()											Returns true if the player has access to the TIX API
hasWseAccount()												Returns true if the player has access to a WSE Account
nextUpdate()												Sleep until the next Stock Market price update has happened.
placeOrder(sym, shares, price, orderType, positionType)		Place order for stocks.
purchase4SMarketData()										Purchase 4S Market Data UI access (UI only).
You need to have a WSE account. Note that this feature only unlocks access to 4S Market Data in the Stock Market UI. If you want to access 4S Market Data via NS APIs, you have to unlock "4S Market Data TIX API access" via purchase4SMarketDataTixApi, which is unrelated to this feature.

purchase4SMarketDataTixApi()								Purchase 4S Market Data TIX API access (NS APIs only).
You need to have TIX API access. Note that this feature only unlocks access to 4S Market Data via NS APIs.

purchaseTixApi()											Purchase TIX API access.
You need to have TIX API access to perform actions via NS APIs. Note that you can buy TIX API access without a WSE account.

purchaseWseAccount()										Purchase a WSE account.
You need to have this account to perform actions via the Stock Market UI. Note that if you want to perform actions via NS APIs, you need to have TIX API access, not this account.

sellShort(sym, shares)										Sell short stock.
sellStock(sym, shares)										Sell stocks.


https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.stockmarketconstants.md
MarketData4SCost		Cost of the 4S Market Data
MarketDataTixApi4SCost	Cost of the 4S Market Data TIX API integration
msPerStockUpdate		Normal time in ms between stock market updates
msPerStockUpdateMin		Minimum time in ms between stock market updates if there is stored offline/bonus time
StockMarketCommission	Commission fee for transactions
TicksPerCycle			An internal constant used while determining when to flip a stock's forecast
TixApiCost				Cost of the TIX API
WseAccountCost			Cost of the WSE account
*/