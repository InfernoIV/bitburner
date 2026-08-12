https://bitburner-fork-oddiz.readthedocs.io/en/stable/advancedgameplay/hackingalgorithms.html

every cycle: (hacking level & augments changes timing and amount)
	check if previous hack has finished
	select biggest execution server
	select target server with highest money (also looking at time / security?)

	Get server to max money and min security (and take hack chance into account)
	calculate H W G W timing and amount (base threads and max for the RAM available)
		calculate base threads
			Hack -> impact security, impact money
			Weaken -> correct security (of hack)
			Grow -> correct money, impact security
			Weaken -> correct security (of grow)
		increase hack amount to check threads and ram cost to get max amount possible
		calculate timings
			both execute and delay (and set a start time and end time)
		fire scripts on best server (set start time for each script)
		
HackingFormulas			Hacking formulas
https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.hackingformulas.md


//Get information about the player.
const player = ns.getPlayer()	

//TODO: determine the max ram that can be used
const max_ram = 0

//save the ram costs per function as global
const ram_hack = 0
const ram_weaken = 0
const ram_grow = 0
	
//keep track of previous hacking level
var hack_hacking_level_previous = 0

//save best server
var server_target = null

var server_execute = ""

//save best money
var best_money = -1

//save the max money
var money_hacked_max = -1
var flag_ready = false
	
	
	
function hack_init() {
	//reset values
	hack_previous_hacking_level = 0
	server_target = null
	server_execute = ""
	best_money = -1
	money_hacked_max = -1
}


//function that executes the hack, needs player information
function hack_execute(ns, player) {
	//if change in hacking level
	if (player.skills.hacking > hack_hacking_level_previous) {
		//update the previous value
		hack_hacking_level_previous = player.skills.hacking
		
		//get best exec server
		var server_exec = ..

		//get new target
		var server_targ = ..
		
		//if change in target or execute
		if !(server_execute == server_exec && server_target == server_targ)  {
			//kill all simple hack scripts on other servers
			
			//start simple hack script on all other servers
			
			//update the servers
			server_execute = server_exec
			server_target = server_targ
			//set flag to prep server
			flag_ready = false
		}
	//no change in target
	} else {
		//if server is not ready (we should only check this once, before launching the hack)
		if (!flag_ready) {
			
			
			//max_ram
			
			//weaken server
			//grow server
		} else {
			//check if we can take action (both timing and RAM -> how to handle multiple hacking servers and 1 target?)
			if (true) {
				//check if the server is ready
				if
			} 
		}
}

select_hacking_target(ns, player, max_ram) (requires formulas.exe)


	//for each server that can be hacked
	for (server in rooted_servers) {
		//get server
		const server_obj = await run_eval("ns.getServer('" + server + "')")
		//Get the maximum money available on a server.
		const money_server = server_obj.moneyMax	//await run_eval("ns.getServerMaxMoney('" + server + '")")
		//Calculate hack percent for one thread. (Ex: 0.25 would steal 25% of the server's current value.)
		const hack_percentage = ns.formulas.hacking.hackPercent(server, player)		
		//Calculate hack chance. (Ex: 0.25 would indicate a 25% chance of success.)
		const hack_chance = ns.formulas.hacking.hackChance(server, player)	
		//calculate the money per hack
		const money_per_hack = money_server * hack_percentage * hack_chance
		//compare vs saved
		if (money_per_hack > best_money) {
			//save the server
			best_server_name = server_obj
			//save the money
			best_money = money
			//save the max money
			money_hacked_max = money_server
		}
	}
	
	
Threads

	
	//create a server object
	server = ns.
	
	//Calculate hack percent for one thread. (Ex: 0.25 would steal 25% of the server's current value.)
	money_hacked_percent = formulas.hacking.hackPercent(best_server, player)
	
	//we already have max hack
	//money_hacked_max = best_money
	
	
	

	formulas.hacking.growThreads(server, player, targetMoney, cores)

	formulas.hacking.weakenEffect(threads, cores)	Calculate the security decrease from a weaken operation. Unlike other hacking formulas, weaken effect depends only on thread count and core count, not on server or player properties. The core bonus formula is 1 + (cores - 1) / 16.
	
	formulas.hacking.growAmount(server, player, threads, cores)	Calculate the amount of money a grow action will leave a server with. Starting money is server.moneyAvailable. Note that when simulating the effect of grow, what matters is the state of the server and player when the grow *finishes*, not when it is started. The growth amount depends both linearly *and* exponentially on threads; see grow for more details. The inverse of this function is formulas.hacking.growThreads, although it rounds up to integer threads.
	
	formulas.hacking.growPercent(server, threads, player, cores) Calculate the growth multiplier constant for a given server and threads. The actual amount of money grown depends both linearly *and* exponentially on threads; this is only giving the exponential part that is used for the multiplier. See grow for more details. As a result of the above, this multiplier does *not* depend on the amount of money on the server. Changing server.moneyAvailable and server.moneyMax will have no effect. For the most common use-cases, you probably want either formulas.hacking.growThreads or formulas.hacking.growAmount instead.
	
	formulas.hacking.growThreads(server, player, targetMoney, cores)		Calculate how many threads it will take to grow server to targetMoney. Starting money is server.moneyAvailable. Note that when simulating the effect of grow, what matters is the state of the server and player when the grow *finishes*, not when it is started. The growth amount depends both linearly *and* exponentially on threads; see grow for more details. The inverse of this function is formulas.hacking.growAmount, although it can work with fractional threads.

Timing
	//weaken > grow > hack (time needed)
	/*
				<------->			hack = weaken - hack - buffer
	<-------------------->			weaken = 0
	        <------------->			grow = weaken - grow + buffer
	  <-------------------->		weaken = 0 + (2 * buffer)
	*/
	
	//buffer time (120 ms? range between 20ms and 200ms)
	const buffer_time = 120
	//Calculate weaken time
	const time_weaken = formulas.hacking.weakenTime(best_server, player)		
	//Calculate hack time
	const time_hack = formulas.hacking.hackTime(best_server, player)
	//Calculate grow time
	const time_grow = formulas.hacking.growTime(best_server, player)
	
	const start_hack = time_weaken - time_hack - buffer_time
	const start_weaken_hack = 0
	const start_grow = time_weaken - time_grow + buffer_time
	const start_weaken_grow = 0 + (2 * buffer_time)
	

	
HackingMultipliers		Hack related multipliers
https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.hackingmultipliers.md