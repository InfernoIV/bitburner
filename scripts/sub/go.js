//requires no SF. GoCheat requires SF 14.2
/*
Go				IPvGO api
https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.go.md
GoAnalysis		Tools to analyze the IPvGO subnet.
https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.goanalysis.md
GoCheat			Illicit and dangerous IPvGO tools. Not for the faint of heart. Requires Source-File 14.2 to use.
https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gocheat.md

https://github.com/bitburner-official/bitburner-src/blob/2e456f5a9c179fbb989b6bbc6b8990e259912fbe/src/Documentation/doc/en/programming/go_algorithms.md
*/


import * as CONSTANTS from "scripts/constants.js"
import * as log from 'scripts/sub/log.js'


// Declaration
export class go_obj {
    constructor() {
        this.available = true
        this.can_analyse = false
        this.can_cheat = false
    }


    //getting the game to a steady state
    init(ns) {
        //disable logging
        ns.disableLog("go.makeMove")
        ns.disableLog("go.passTurn")
        ns.disableLog("go.resetBoardState")
        //Returns the color of the current player ("White" | "Black"), or 'None' if the game is over.
        const current_player = ns.go.getCurrentPlayer()
        //if not our turn
        if (current_player == "White") {
            /*
            Pass the player's turn rather than making a move, and await the opponent's response. 
            This ends the game if the opponent passed on the previous turn, or if the opponent passes on their following turn.
            This can also be used if you pick up the game in a state where the opponent needs to play next. 
            For example: if BitBurner was closed while waiting for the opponent to make a move, you may need to call passTurn() to get them to play their move on game start.
            */
            try {
                ns.go.passTurn()
            } catch (err) {
                //ignore
            }
        }
        //get board state
        const board_state = ns.go.getBoardState()
        //save board size
        this.board_size = board_state.length
        //save wins
        this.wins = 0
        //save losses
        this.losses = 0
        //save loss streak
        this.loss_streak = 0
        //keep track of factions
        this.opponent_list = [
            "Netburners", //increased hacknet production
            "Slum Snakes", //crime success rate
            "The Black Hand", //hacking money
            "Tetrads", //strength, defense, dexterity, and agility levels
            "Daedalus", //reputation gain
            "Illuminati", //faster hack(), grow(), and weaken()
        ] //| "No AI"
        //reset stats to easily see if we have won 2x
        ns.go.analysis.resetStats(true)
        //log
        log.info(ns, "Go", "Init complete")
    }


    //play the game
    manage(ns) {
        //Returns the color of the current player ("White" | "Black"), or 'None' if the game is over.
        const current_player = ns.go.getCurrentPlayer()
        //if not our turn
        if (current_player == "White") {
            //stop
            return
        }
        //if game is over
        if (current_player == "None") {
            //start a new game
            this.start_new_game(ns)
            //it should be our turn, so make a move		
        }
        //make a move
        this.make_move(ns)
    }

    /*
    go.getStats     0
    */
    //start a new game: select an opponent and a board size
    start_new_game(ns) {
        //debug
        //log.info(ns, "Go", "Starting new game")
        //in order of difficulty
        

        //Returns the name of the opponent faction in the current subnet.
        const opponent_current = ns.go.getOpponent()
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
        const stats = ns.go.analysis.getStats()
        //if we won a match
        if (stats[opponent_current].wins > this.wins) {
            //save the win
            this.wins = stats[opponent_current].wins
            //reset loss streak
            this.loss_streak = 0
            //toast message
            ns.toast("Go: Won a match vs " + opponent_current)
            //log.success(ns, "Go", "Won a match vs " + opponent_current, true)
        }
        //if we lost a match
        if (stats[opponent_current].losses > this.losses) {
            //save the win
            this.losses = stats[opponent_current].losses
            this.loss_streak += 1
            //log message
            //log.warning(ns, "Go", "Lost a match vs " + opponent_current + " (" + this.loss_streak + ")", true)
        }
        var change_opponent = false
        var change_message = ""
        //if we have gotten a winstreak of 2, resulting in rep to favor conversion
        if (stats[opponent_current].winStreak >= 2) {
            //go to next
            change_opponent = true
            //set message
            change_message = "Won 2x in a row"
        } else if (this.loss_streak >= 10) {
            //go to next
            change_opponent = true
            //set message
            change_message = "Lost 10x in a row"
        }
        //if we want to change opponent
        if (change_opponent) {
            //determine the next index
            var opponent_index = this.opponent_list.indexOf(opponent_current) + 1
            //check if out of bounds
            //TODO: integrate strategies for each opponent
            if (opponent_index >= 2) { //this.opponent_list.length) { //) {
                //set to 1st index
                opponent_index = 0
            }
            //set opponent
            opponent_next = this.opponent_list[opponent_index]
            if(change_message.includes("Won")) {
                //debug
                log.success(ns, "Go", change_message + " against " + opponent_current + ", next opponent: " + opponent_next, true)
            } else {
                //debug
                log.warning(ns, "Go", change_message + " against " + opponent_current + ", next opponent: " + opponent_next, true)
            }
            //reset stats to easily see if we have won 2x
            //ns.go.analysis.resetStats(true)
            //set wins back to 0
            this.wins = stats[opponent_next].wins //0
            this.losses = stats[opponent_next].losses// 0
            this.loss_streak = 0
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
            //case "????????????":
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
        ns.go.resetBoardState(opponent_next, board_size)

        //save the board size
        this.board_size = board_size
    }


    //make a move
    make_move(ns) {
        /* Shows if each point on the board is a valid move for the player. By default, analyzes the current board state. Takes an optional boardState (and an optional prior-move boardState, if desired) to analyze a custom board.
        The true/false validity of each move can be retrieved via the X and Y coordinates of the move.
        const validMoves = ns.go.analysis.getValidMoves();
        const moveIsValid = validMoves[x][y];
        Note that the [0][0] point is shown on the bottom-left on the visual board (as is traditional), and each string represents a vertical column on the board. In other words, the printed example above can be understood to be rotated 90 degrees clockwise compared to the board UI as shown in the IPvGO subnet tab.
        Also note that, when given a custom board state, only one prior move can be analyzed. This means that the superko rules (no duplicate board states in the full game history) is not supported; you will have to implement your own analysis for that.
        The current valid moves for white can also be seen by simply calling ns.go.analysis.getValidMoves(true). */
        const moves_valid = ns.go.analysis.getValidMoves()
        //flag if we can play a move
        var flag_valid_move = false
        //for each row
        for (const row of moves_valid) {
            //if it includes a valid move (true)
            if (row.includes(true)) {
                //set flag to true
                flag_valid_move = true
                //stop
                break
            }
        }
        //if there are no valid moves
        if (flag_valid_move == false) {
            //pass to finish the game
            ns.go.passTurn()
            //stop
            return
        }
        /*
        Gets the status of the current game. 
        Shows the current player, current score, and the previous move coordinates. 
        Previous move will be null for a pass, or if there are no prior moves.
        */
        const state_game = ns.go
            .getGameState() //{"currentPlayer":"Black","whiteScore":1.5,"blackScore":0,"previousMove":null,"komi":1.5,"bonusCycles":0}
        /*
        Returns all the prior moves in the current game, as an array of simple board states.	
        For example, a single 5x5 prior move board might look like this:
        [	"XX.O.",
        	"X..OO",
        	".XO..",
        	"XXO.#",
        	".XO.#",	]
        */
        const previous_moves = ns.go.getMoveHistory()

        //if there have been moves and the previous move is a pass
        if (previous_moves.length > 0 && state_game.previousMove == null) {
            //pass to finish the game
            ns.go.passTurn()
            //debug
            //log.info(ns, "Go", "Passing to finish the game")
            //stop
            return
        }
        //gather information
        var information = this.gather_information(ns)
        //add current information
        information.previous_moves = previous_moves
        information.state_game = state_game
        information.moves_valid = moves_valid
        //Returns the name of the opponent faction in the current subnet.
        const opponent = ns.go.getOpponent()
        //play depending on the opponent(?)
        switch (opponent) {
            default:
                //not defined: brute force it
                this.brute_force(ns, information)
        }
    }


    //just play the 1st move available
    brute_force(ns, information) {
        //try to play in the middle first
        if (information.moves_valid[2][2]) {
            //play in the middle
            ns.go.makeMove(2, 2)
        }
        if(this.can_analyse) {
            //use analysis information
            //TODO
        }
        //check if we can cheat
        if(this.can_cheat && information.cheat_chance == 1) {
            //TODO
        }
        //start from 1 from corner first?
        //This idea can also be improved to focus on a specific area or corner first, rather than spread across the whole board right away.
        //from left to right 
        for (var x = 0; x < this.board_size; x++) {
            //from top to bottom
            for (var y = 0; y < this.board_size; y++) {
                //if a valid move
                const valid_move = information.moves_valid[x][y]
                // Leave some spaces to make it harder to capture our pieces. -> We don't want to run out of empty node connections!
                const isNotReservedSpace = x % 2 === 1 || y % 2 === 1;
                //if a valid move and not reserved
                if (valid_move && isNotReservedSpace) {
                    /*Make a move on the IPvGO subnet game board, and await the opponent's response. 
                    x:0 y:0 represents the bottom-left corner of the board in the UI.*/
                    try {
                        ns.go.makeMove(x, y)
                    } catch (e) {}
                    
                    //debug
                    //log.info(ns, "Go", "Made a move on " + x + "," + y)
                    //stop
                    return
                }
            }
        }
        //we need to play in reserved space
        for (var x = 0; x < this.board_size; x++) {
            //from top to bottom
            for (var y = 0; y < this.board_size; y++) {
                //if a valid move
                const valid_move = information.moves_valid[x][y]
                //if a valid move and not reserved
                if (valid_move) {
                    /*Make a move on the IPvGO subnet game board, and await the opponent's response. 
                        x:0 y:0 represents the bottom-left corner of the board in the UI.*/
                    try {
                        ns.go.makeMove(x, y)
                    } catch (e) {}
                    //debug
                    //log.info(ns, "Go", "Made a move on " + x + "," + y)
                    //stop
                    return
                }
            }
        }
    }


    //TODO: play aggressively
    play_aggressive(ns, information) {

        //TODO
        var x = 0
        var y = 0

        //only cheat when you need to!
        //if we can 100% cheat
        if (information.cheat_chance == 1) {
            /* Attempts to destroy an empty node, leaving an offline dead space that does not count as territory or provide open node access to adjacent routers.
            Success chance can be seen via ns.go.cheat.getCheatSuccessChance()
            Warning: if you fail to play a cheat move, your turn will be skipped. 
            After your first cheat attempt, if you fail, there is a small (~10%) chance you will instantly be ejected from the subnet. */
            //ns.go.cheat.destroyNode(x,y)

            /*Attempts to remove an existing router, leaving an empty node behind.	
            Success chance can be seen via ns.go.cheat.getCheatSuccessChance()
            Warning: if you fail to play a cheat move, your turn will be skipped. 
            After your first cheat attempt, if you fail, there is a small (~10%) chance you will instantly be ejected from the subnet.*/
            //ns.go.cheat.removeRouter(x,y)

            /*Attempts to repair an offline node, leaving an empty playable node behind.
            Success chance can be seen via ns.go.cheat.getCheatSuccessChance()
            Warning: if you fail to play a cheat move, your turn will be skipped. 
            After your first cheat attempt, if you fail, there is a small (~10%) chance you will instantly be ejected from the subnet.*/
            //ns.go.cheat.repairOfflineNode(x,y)

            var x1 = x
            var x2 = x
            var y1 = y
            var y2 = y
            /*Attempts to place two routers at once on empty nodes. 
            Note that this ignores other move restrictions, so you can suicide your own routers if they have no access to empty ports and do not capture any enemy routers.
            Success chance can be seen via ns.go.cheat.getCheatSuccessChance()
            Warning: if you fail to play a cheat move, your turn will be skipped. 
            After your first cheat attempt, if you fail, there is a small (~10%) chance you will instantly be ejected from the subnet.*/
            //ns.go.cheat.playTwoMoves(x1, y1, x2, y2)
        } else {
            /*Make a move on the IPvGO subnet game board, and await the opponent's response. 
            x:0 y:0 represents the bottom-left corner of the board in the UI.*/
            //await evaluate.exec(ns, "ns.go.makeMove(" + x + "," + y + ")")
            //stop
            return
        }
    }


    //gather all information, to be used to determine actions
    gather_information(ns) {
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
        information.state_board = ns.go.getBoardState()

        //if we can analyse
        if(this.can_analyse) {
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
            information.nodes_controlled_empty = ns.go.analysis.getControlledEmptyNodes()
            /*Returns an ID for each point. All points that share an ID are part of the same network (or "chain"). Empty points are also given chain IDs to represent continuous empty space. Dead nodes are given the value null.
            Takes an optional boardState argument; by default uses the current board state.
            The data from getChains() can be used with the data from getBoardState() to see which player (or empty) each chain is
            For example, a 5x5 board might look like this. There is a large chain #1 on the left side, smaller chains 2 and 3 on the right, and a large chain 0 taking up the center of the board.
            [	[   0,0,0,3,4],
                [   1,0,0,3,3],
                [   1,1,0,0,0],
                [null,1,0,2,2],
                [null,1,0,2,5],	]*/
            information.chains = ns.go.analysis.getChains()

            /*Returns a number for each point, representing how many open nodes its network/chain is connected to. Empty nodes and dead nodes are shown as -1 liberties.
            Takes an optional boardState argument; by default uses the current board state.
            For example, a 5x5 board might look like this. The chain in the top-left touches 5 total empty nodes, and the one in the center touches four. 
            The group in the bottom-right only has one liberty; it is in danger of being captured!
            [	[-1, 5,-1,-1, 2],
                [ 5, 5,-1,-1,-1],
                [-1,-1, 4,-1,-1],
                [ 3,-1,-1, 3, 1],
                [ 3,-1,-1, 3, 1],	]*/
            information.liberties = ns.go.analysis.getLiberties()
        }

        //set default value
        information.cheat_chance = 0
        //check if we can cheat
        if (this.can_cheat) {
            /*Returns your chance of successfully playing one of the special moves in the ns.go.cheat API. 
            Scales up with your crime success rate stat. Scales down with the number of times you've attempted to cheat in the current game.
            Warning: if you fail to play a cheat move, your turn will be skipped. 
            After your first cheat attempt, if you fail, there is a small (~10%) chance you will instantly be ejected from the subnet.*/
            information.cheat_chance = ns.go.cheat.getCheatSuccessChance()
        }

        //return the information
        return information
    }
}


/*
Go
Go.getMoveHistory()						0
Go.getOpponent()						0
Go.makeMove()							0
Go.opponentNextTurn()					0
Go.passTurn()							0
Go.resetBoardState()					0
Go.getCurrentPlayer()					0
Go.getGameState()						0
Go.getBoardState()						4

analysis
GoAnalysis.clearAllPointHighlights()	0
GoAnalysis.clearPointHighlight()		0
GoAnalysis.getStats()					0
GoAnalysis.highlightPoint()				0
GoAnalysis.resetStats()					0
GoAnalysis.setTestingBoardState()		4
GoAnalysis.getValidMoves()				8
GoAnalysis.getChains()					16
GoAnalysis.getControlledEmptyNodes()	16
GoAnalysis.getLiberties()				16

cheat (SF14.2)
GoCheat.getCheatCount() 				1
GoCheat.getCheatSuccessChance()			1
GoCheat.destroyNode()					8
GoCheat.playTwoMoves()					8
GoCheat.removeRouter()					8
GoCheat.repairOfflineNode()				8

/*
Adding network expansion moves
	Just playing random moves is not very effective, though. The next step is to use the board state to try and take over territory.
	ns.go.getBoardState() returns a simple grid representing what the current board looks like. The player's routers are marked with X, and the opponents with O.
	Example 5x5 board state, with a number of networks for each player:
	[  "XX.O.",
	"X..OO",
	".XO..",
	"XXO..",
	".XOO.", ]
	The board state can be used to look at all the nodes touching a given point, by looking at an adjacent pair of coordinates.
	For example, the point to the 'north' of the current point x, y can be retrieved with board[x + 1]?.[y]. If it is a friendly router it will have value "X". (It will be undefined if x,y is on the north edge of the subnet)
	That info can be used to make decisions about where to place routers.
	In order to expand the area that is controlled by the player's networks, connecting to friendly routers (when possible) is a strong move. This can be done with a very similar implementation to getRandomMove(), with the additional check of looking for a neighboring friendly router. For each point on the board:
	Detect expansion moves:
	For each point on the board:
		* If the empty point is a valid move, and
		* If the point is not an open space reserved to protect the network [see getRandomMove()], and
		* If a point to the north, south, east, or west is a friendly router
		Then, the move will expand an existing network
	When possible, an expansion move like this should be used over a random move. When neither can be found, pass turn.
	This idea can be improved: reserved spaces can be skipped if the nodes are in different networks. Se ns.go.analysis.getChains()
	After implementing this, the script will consistently get points on the subnet against most opponents (at least on the larger boards), and will sometimes even get lucky and win against the easiest factions.

 
Next Steps
	There is a lot we can still do to improve the script. For one, it currently only plays one game, and must be restarted each time! Also, it does not re-set the subnet upon game completion yet.
	In addition, the script only knows about a few types of moves, and does not yet know how to capture or defend networks.
 
Killing duplicate scripts
	Because there is only one subnet active at any time, you do not want multiple copies of your scripts running and competing with each other. 
	It may be helpful to kill any other scripts with the same name as your IPvGO script on startup. 
	This can be done using ns.getRunningScript() to get the script details and ns.kill() to remove old copies of the script.

 
Move option: Capturing the opponent's networks
	If the opposing faction's network is down to its last open port, placing a router in that empty node will capture and destroy that entire network.
	To find out what networks are in danger of capture, ns.go.analysis.getLiberties() shows how many empty nodes / open ports each network has. As with getBoardState() and getValidMoves() , the number of liberties (open ports) for a given point's network can be retrieved via its coordinates [x][y] on the grid returned by getLiberties()
	Detect moves to capture the opponent's routers:
	For each point on the board:
		* If the empty point is a valid move, and
		* If a point to the north, south, east, or west is a router with exactly 1 liberty [via its coordinates in getLiberties()], and
		* That point is controlled by the opponent [it is a "O" via getBoardState()]
		Then, playing that move will capture the opponent's network.

 
Move option: Defending your networks from capture
	getLiberties() can also be used to detect your own networks that are in danger of being captured, and look for moves to try and save it.
	Detect moves to defend a threatened network:
	For each point on the board:
		* If the empty point is a valid move, and
		* If a point to the north, south, east, or west is a router with exactly 1 liberty [via its coordinates in getLiberties()], and
		* That point is controlled by the player [it is a "X" via getBoardState()]
		Then, that network is in danger of being captured.
	To detect if that network can be saved:
	* Ensure the new move will not immediately allow the opponent to capture:
		* That empty point ALSO has two or more empty points adjacent to it [a "." via getBoardState()], OR
		* That empty point has a friendly network adjacent to it, and that network has 3 or more liberties [via getLiberties()]
		Then, playing that move will prevent your network from being captured (at least for a turn or two)

 
Move option: Smothering the opponent's networks
	In some cases, an opponent's network cannot YET be captured, but by placing routers all around it, the network can be captured on a future move. (Or at least you force the opponent to spend moves defending their network.)
	There are many ways to approach this, but the simplest is to look for any opposing network with the fewest liberties remaining (ideally 2), and find a safe point to place a router that touches it.
	To make sure the move will not immediately get re-captured, make sure the point you play on has two adjacent empty nodes, or is touching a friendly network with three+ liberties. (This is the same as the check in the move to defend a friendly chain.)

Move option: Expanding your networks' connections to empty nodes
	The more empty nodes a network touches, the stronger it is, and the more territory it influences. Thus, placing routers that touch a friendly network and also to as many open nodes as possible is often a strong move.
	This is similar to the logic for defending your networks from immediate capture. Look for a friendly network with the fewest open ports, and find an empty node adjacent to it that touches multiple other empty nodes.

Move option: Encircling space to control empty nodes
	A key part of the strategy of Go is fully encircling groups of empty nodes. The examples at the start of this doc simply leave out specific nodes and hope they stay empty, but this can be done in much better ways.
	As a simple approach, look for possible moves that are:
		adjacent to two separate empty nodes (open areas it will divide up)
		adjacent a friendly piece and the edge of a board (or a second friendly piece from a different chain than the first)
	This will find moves which are connecting your chains together, or connecting to the edge of the board, and dividing up empty space in the process. This allows you to control space, making it harder to capture your chains in the process.

Choosing a good move option
	Having multiple plausible moves to select from is helpful, but choosing the right option is important to making a strong Go script. In some cases, if a move type is available, it is almost always worth playing (such as defending your network from immediate capture, or capturing a vulnerable enemy network)
	Each of the IPvGO factions has a few moves they will almost always choose (The Black hand will always capture if possible, for example). Coming up with a simple prioritized list is a good start to compete with these scripts. Experiment to see what works best!
	This idea can be improved, however, by including information such as the size of the network that is being threatened or that is vulnerable to capture. It is probably worth giving up one router in exchange for capturing a large enemy network, for example. Adding two new open ports to a large network is helpful, but limiting an opponent's network to one open port might be better.
 
Other types of move options
	Preparing to invade the opponent
		Empty areas that are completely surrounded and controlled by a single player can be seen via ns.go.analysis.getControlledEmptyNodes(). However, just because the area is currently controlled by the opponent does not mean it cannot be attacked! Start by surrounding an opponent's network from the outside, then it can be captured by attacking the space it surrounds and controls. (Note that this only works on networks that have a single interior empty space: if they have multiple inner empty points, the suicide rule prevents you from filling any of them)
	Wrapping empty space
		The starting script uses some very simple logic to leave open empty nodes inside its networks (simply excluding points with x % 2 === 0 && y % 2 === 0). However, it is very strong to look for ways to actively surround empty space.
		Look for moves that connect a network to the edge of a board that touch an empty node, or look for moves that connect two networks and touch an empty node. Or, look for a move that touches a friendly network and splits apart a chain of empty nodes.
	Jumps and Knights' move
		The factions currently only look at moves directly connected to friendly or enemy networks in most cases. however, especially on the larger board, playing a router a few spaces away from an existing line/network allows the player to influence more territory, compared to slower moves that connect one adjacent node at a time. Consider skipping a node or two, or playing diagonally, or combining them to make L shaped jumps (like a knight's move in chess)
	Pattern Matching
		There are a lot of strong shapes in Go, that are worth attempting to re-create. The factions look for ways to slip diagonally between the players' networks and cut them apart. They also look for ways to wrap around isolated opposing routers. Consider making a small library of strong shapes, then looking to match them on the board (or their rotations or mirrors). The exact shapes will require some research into Go, but there is a lot of good documentation online about this idea.
	Creating "Eyes"
		If a single network fully encloses two different disconnected empty nodes, it can never be taken. (If it only had one inner airspace, the opponent could eventually surround and then fill it to capture the network. If there is two, however, the suicide rule prevents them from filling either inner empty space.) Detecting moves that make figure-8 type shapes, or split an encircled empty node chain into two smaller ones, are very strong.
		In addition, if the opponent has only a single such move, playing there first to block it is often extremely disruptive, and can even lead to their network being captured.

	A deeper dive into this idea will involve making your own code to identify chains of pieces (and continuous empty nodes).
		Find all moves that divide up empty space and connect two chains or a chain and the edge as in the 'encircling empty space' idea above
		Apply the move on a sample board in memory, one at a time
		Identify all chains and continuous groups of empty nodes in the resulting board, and which color pieces surround the new empty node groups
		Prioritize the move that makes the most empty node groups fully surrounded by your player color.
		Alternatively, count how many empty node groups each friendly chain is touching, and prioritize moves that create a second of these "eyes" for friendly chains
*/