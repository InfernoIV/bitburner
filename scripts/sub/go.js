//requires no SF. GoCheat requires SF 14.2
/*
Go				IPvGO api
https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.go.md
GoAnalysis		Tools to analyze the IPvGO subnet.
https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.goanalysis.md
GoCheat			Illicit and dangerous IPvGO tools. Not for the faint of heart. Requires Source-File 14.2 to use.
https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gocheat.md
*/
import * as CONSTANTS from "scripts/constants.js"
import * as evaluate from 'scripts/sub/evaluate.js'
import * as log from 'scripts/sub/log.js'


// Declaration
export class go_obj {
    constructor() {
    }


	//getting the game to a steady state
	async init(ns) {
		/*
		Pass the player's turn rather than making a move, and await the opponent's response. 
		This ends the game if the opponent passed on the previous turn, or if the opponent passes on their following turn.
		This can also be used if you pick up the game in a state where the opponent needs to play next. 
		For example: if BitBurner was closed while waiting for the opponent to make a move, you may need to call passTurn() to get them to play their move on game start.
		*/
		await evaluate.exec(ns, "ns.go.passTurn()")
		//get game state
		const state_game = await evaluate.exec(ns, "ns.go.getGameState()")
		//save board size
		this.board_size = state_game.length
	}


	//play the game
	async play(ns) {
		//Returns the color of the current player ("White" | "Black"), or 'None' if the game is over.
		const current_player = await evaluate.exec(ns, "ns.go.getCurrentPlayer()")
		//if not our turn
		if (current_player == "White") {
			//stop
			return
		}		
		//if game is over
		if (current_player == "None") {
			//start a new game
			await start_new_game(ns)	
			//it should be our turn, so make a move		
		}
		//make a move
		await make_move(ns)
	}


	//start a new game: select an opponent and a board size
	async start_new_game(ns) {
		//in order of difficulty
		const opponent_list = ["Netburners", "Slum Snakes", "The Black Hand", "Tetrads", "Daedalus", "Illuminati", "????????????"] //| "No AI"
		//Returns the name of the opponent faction in the current subnet.
		const opponent_current = await evaluate.exec(ns, "ns.go.getOpponent()")
		//default to same opponent
		var opponent_next = opponent_current
		/*
		bonusDescription	string	Description of stat boost
		bonusPercent		number	Stat boost
		highestWinStreak	number	Highest winstreak since last reset
		losses				number	Number of losses since last reset
		rep					number	Favor gain from winstreaks, calculated as converted rep
		wins				number	Number of wins since last reset
		winStreak			number	Current winstreak
		*/
		const stats = await evaluate.exec(ns, "ns.go.analysis.getStats()")
		//if we have gotten a winstreak of 2, resulting in rep to favor conversion
		if (stats[opponent_current].winStreak >= 2) {
			//determine the next index
			opponent_index = opponent_list.indexOf(opponent_current) + 1
			//check if out of bounds
			//TODO: integrate strategies for each opponent
			if (opponent_index >= 0) { //opponent_list.length) {
				//set to 1st index
				opponent_index = 0
			}
			//set opponent
			opponent_next = opponent_list[opponent_index]
			//debug
			log.success(ns, "Go", "Won 2x against '" + opponent_current + "', next opponent: '" + opponent_next + "'")
		}
		
		//default size
		var board_size = 5 //5 | 7 | 9 | 13
		//depending on the opponent, decide the size
		//TODO: decide on size
		switch (opponent_next) {
			case "Netburners":
				//TODO: decide board size
				break
			case "Slum Snakes": 
				//TODO: decide board size
				break
			case "The Black Hand":
				//TODO: decide board size
				break
			case "Tetrads":
				//TODO: decide board size
				break
			case "Daedalus": 
				//TODO: decide board size
				break
			case "Illuminati": 
				//TODO: decide board size
				break
			case "????????????":
				//TODO: decide board size
				break
			default:
				//board size is already set
		}			
		/*
		Gets new IPvGO subnet with the specified size owned by the listed faction, ready for the player to make a move. 
		This will reset your win streak if the current game is not complete and you have already made moves.
		Note that some factions will have a few routers already on the subnet after a reset.
		*/
		await evaluate.exec(ns, "ns.go.resetBoardState('" + opponent_next + "','" + board_size + "')")	
		//reset stats to easily see if we have won 2x
		await evaluate.exec(ns, "ns.go.analysis.resetStats(true)")
		//save the board size
		this.board_size = board_size
	}


	//make a move
	async make_move(ns) {
		/* Shows if each point on the board is a valid move for the player. By default, analyzes the current board state. Takes an optional boardState (and an optional prior-move boardState, if desired) to analyze a custom board.
		The true/false validity of each move can be retrieved via the X and Y coordinates of the move.
		const validMoves = ns.go.analysis.getValidMoves();
		const moveIsValid = validMoves[x][y];
		Note that the [0][0] point is shown on the bottom-left on the visual board (as is traditional), and each string represents a vertical column on the board. In other words, the printed example above can be understood to be rotated 90 degrees clockwise compared to the board UI as shown in the IPvGO subnet tab.
		Also note that, when given a custom board state, only one prior move can be analyzed. This means that the superko rules (no duplicate board states in the full game history) is not supported; you will have to implement your own analysis for that.
		The current valid moves for white can also be seen by simply calling ns.go.analysis.getValidMoves(true). */
		const moves_valid = await evaluate.exec(ns, "ns.go.analysis.getValidMoves()")
		//if there are no valid moves
		if (moves_valid.length == 0) {
			//pass to finish the game
			await evaluate.exec(ns, "ns.go.passTurn()")
			//stop
			return
		}
		/*
		Gets the status of the current game. 
		Shows the current player, current score, and the previous move coordinates. 
		Previous move will be null for a pass, or if there are no prior moves.
		*/
		const state_game = await evaluate.exec(ns, "ns.go.getGameState()")
		/*
		Returns all the prior moves in the current game, as an array of simple board states.	
		For example, a single 5x5 prior move board might look like this:
		[	"XX.O.",
			"X..OO",
			".XO..",
			"XXO.#",
			".XO.#",	]
		*/
		const previous_moves = await evaluate.exec(ns, "ns.go.getMoveHistory()")
		//if there have been moves and the previous move is a pass
		if (previous_moves != null && state_game == null) {
			//pass to finish the game
			await evaluate.exec(ns, "ns.go.passTurn()")
			//stop
			return
		}
		//gather information
		var information = await gather_information(ns)
		//add current information
		information.previous_moves = previous_moves
		information.state_game = state_game
		information.moves_valid = moves_valid
		//Returns the name of the opponent faction in the current subnet.
		const opponent = await evaluate.exec(ns, "ns.go.getOpponent()")
		//play depending on the opponent
		switch (opponent) {
			default:
				//not defined: brute force it
				await brute_force(ns, information)
		}
	}


	//just play the 1st move available
	async brute_force(ns, information) {
		for (var x = 0; x < this.board_size; x++) {
			for (var y = 0; y < this.board_size; y++) {
				//if a valid move
				if (information.moves_valid[x][y]) {
					/*Make a move on the IPvGO subnet game board, and await the opponent's response. 
					x:0 y:0 represents the bottom-left corner of the board in the UI.*/
					await evaluate.exec(ns, "ns.go.makeMove(" + x + "," + y + ")")	
					//stop
					return
				}				
			}
		}
	}


	//TODO: play aggressively
	async play_aggressive(ns, information) {
		//TODO
		var x = 0
		var y = 0
		
		//only cheat when you need to!
		//if we can 100% cheat
		if(information.cheat_chance == 1) {
			/* Attempts to destroy an empty node, leaving an offline dead space that does not count as territory or provide open node access to adjacent routers.
			Success chance can be seen via ns.go.cheat.getCheatSuccessChance()
			Warning: if you fail to play a cheat move, your turn will be skipped. 
			After your first cheat attempt, if you fail, there is a small (~10%) chance you will instantly be ejected from the subnet. */
			await evaluate.exec(ns, "ns.go.cheat.destroyNode(" + x + "," + y + ")")	

			/*Attempts to remove an existing router, leaving an empty node behind.	
			Success chance can be seen via ns.go.cheat.getCheatSuccessChance()
			Warning: if you fail to play a cheat move, your turn will be skipped. 
			After your first cheat attempt, if you fail, there is a small (~10%) chance you will instantly be ejected from the subnet.*/
			await evaluate.exec(ns, "removeRouter(" + x + "," + y + ")")		
			
			/*Attempts to repair an offline node, leaving an empty playable node behind.
			Success chance can be seen via ns.go.cheat.getCheatSuccessChance()
			Warning: if you fail to play a cheat move, your turn will be skipped. 
			After your first cheat attempt, if you fail, there is a small (~10%) chance you will instantly be ejected from the subnet.*/
			await evaluate.exec(ns, "repairOfflineNode(" + x + "," + y + ")")
			
			var x1 = x
			var x2 = x
			var y1 = y
			var y2 = y
			/*Attempts to place two routers at once on empty nodes. 
			Note that this ignores other move restrictions, so you can suicide your own routers if they have no access to empty ports and do not capture any enemy routers.
			Success chance can be seen via ns.go.cheat.getCheatSuccessChance()
			Warning: if you fail to play a cheat move, your turn will be skipped. 
			After your first cheat attempt, if you fail, there is a small (~10%) chance you will instantly be ejected from the subnet.*/
			await evaluate.exec(ns, "playTwoMoves(" + x1 + "," + y1 + "," + x2 + "," + y2)

		} else {
			/*Make a move on the IPvGO subnet game board, and await the opponent's response. 
			x:0 y:0 represents the bottom-left corner of the board in the UI.*/
			await evaluate.exec(ns, "ns.go.makeMove(" + x + "," + y + ")")	
			//stop
			return
		}
	}


	//gather all information, to be used to determine actions
	async gather_information(ns) {
		//variable to fill
		var information = {}
		/*Retrieves a simplified version of the board state. "X" represents black pieces, "O" white, and "." empty points. 
		"#" are dead nodes that are not part of the subnet. (They are not territory nor open nodes.)
		For example, a 5x5 board might look like this:
		[	"XX.O.",
			"X..OO",
			".XO..",
			"XXO.#",
			".XO.#",	]
		Each string represents a vertical column on the board, and each character in the string represents a point.
		Traditional notation for Go is e.g. "B,1" referring to second ("B") column, first rank. This is the equivalent of index [1][0].
		Note that the [0][0] point is shown on the bottom-left on the visual board (as is traditional), and each string represents a vertical column on the board. 
		In other words, the printed example above can be understood to be rotated 90 degrees clockwise compared to the board UI as shown in the IPvGO subnet tab.*/
		information.state_board = await evaluate.exec(ns, "ns.go.getBoardState()")
		/*Returns 'X' for black, 'O' for white, or '?' for each empty point to indicate which player controls that empty point. 
		If no single player fully encircles the empty space, it is shown as contested with '?'. "#" are dead nodes that are not part of the subnet.
		Takes an optional boardState argument; by default uses the current board state.	
		Filled points of any color are indicated with '.'
		In this example, white encircles some space in the top-left, black encircles some in the top-right, and between their routers is contested space in the center:
		[	"OO..?",
			"OO.?.",
			"O.?.X",
			".?.XX",
			"?..X#",	]*/
		information.nodes_controlled_empty = await evaluate.exec(ns, "ns.go.analysis.getControlledEmptyNodes()")		
		/*Returns an ID for each point. All points that share an ID are part of the same network (or "chain"). Empty points are also given chain IDs to represent continuous empty space. Dead nodes are given the value null.
		Takes an optional boardState argument; by default uses the current board state.
		The data from getChains() can be used with the data from getBoardState() to see which player (or empty) each chain is
		For example, a 5x5 board might look like this. There is a large chain #1 on the left side, smaller chains 2 and 3 on the right, and a large chain 0 taking up the center of the board.
		[	[   0,0,0,3,4],
			[   1,0,0,3,3],
			[   1,1,0,0,0],
			[null,1,0,2,2],
			[null,1,0,2,5],	]*/
		information.chains = await evaluate.exec(ns, "ns.go.analysis.getChains()")

		/*Returns a number for each point, representing how many open nodes its network/chain is connected to. Empty nodes and dead nodes are shown as -1 liberties.
		Takes an optional boardState argument; by default uses the current board state.
		For example, a 5x5 board might look like this. The chain in the top-left touches 5 total empty nodes, and the one in the center touches four. The group in the bottom-right only has one liberty; it is in danger of being captured!
		[	[-1, 5,-1,-1, 2],
			[ 5, 5,-1,-1,-1],
			[-1,-1, 4,-1,-1],
			[ 3,-1,-1, 3, 1],
			[ 3,-1,-1, 3, 1],	]*/
		information.liberties = await evaluate.exec(ns, "ns.go.analysis.getLiberties()")

		//temp until we have SF 14.2
		information.cheat_chance = 0
		/*Returns your chance of successfully playing one of the special moves in the ns.go.cheat API. 
		Scales up with your crime success rate stat. Scales down with the number of times you've attempted to cheat in the current game.
		Warning: if you fail to play a cheat move, your turn will be skipped. 
		After your first cheat attempt, if you fail, there is a small (~10%) chance you will instantly be ejected from the subnet.*/
		//information.cheat_chance = await evaluate.exec(ns, "ns.go.cheat.getCheatSuccessChance()")
		
		//return the information
		return information
	}
}

