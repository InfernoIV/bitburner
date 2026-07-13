//analysis	Tools to analyze the IPvGO subnet.
//cheat		Illicit and dangerous IPvGO tools. Not for the faint of heart. Requires Source-File 14.2 to use.
//https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.go.md

/*
	https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.go.md
	Go			IPvGO api
	
	getBoardState()		Retrieves a simplified version of the board state. "X" represents black pieces, "O" white, and "." empty points. "#" are dead nodes that are not part of the subnet. (They are not territory nor open nodes.)
	For example, a 5x5 board might look like this:
	[
	  "XX.O.",
	  "X..OO",
	  ".XO..",
	  "XXO.#",
	  ".XO.#",
	]
	Each string represents a vertical column on the board, and each character in the string represents a point.
	Traditional notation for Go is e.g. "B,1" referring to second ("B") column, first rank. This is the equivalent of index [1][0].
	Note that the [0][0] point is shown on the bottom-left on the visual board (as is traditional), and each string represents a vertical column on the board. In other words, the printed example above can be understood to be rotated 90 degrees clockwise compared to the board UI as shown in the IPvGO subnet tab.

	getCurrentPlayer()	Returns the color of the current player, or 'None' if the game is over.

	getGameState()		Gets the status of the current game. Shows the current player, current score, and the previous move coordinates. Previous move will be null for a pass, or if there are no prior moves.

	getMoveHistory()	Returns all the prior moves in the current game, as an array of simple board states.	
	For example, a single 5x5 prior move board might look like this:
	[
	  "XX.O.",
	  "X..OO",
	  ".XO..",
	  "XXO.#",
	  ".XO.#",
	]

	getOpponent()	Returns the name of the opponent faction in the current subnet.

	makeMove(x, y, playAsWhite)		Make a move on the IPvGO subnet game board, and await the opponent's response. x:0 y:0 represents the bottom-left corner of the board in the UI.

	opponentNextTurn(logOpponentMove, playAsWhite)	Returns a promise that resolves with the success or failure state of your last move, and the AI's response, if applicable. x:0 y:0 represents the bottom-left corner of the board in the UI.

	passTurn(passAsWhite)	Pass the player's turn rather than making a move, and await the opponent's response. This ends the game if the opponent passed on the previous turn, or if the opponent passes on their following turn.
	This can also be used if you pick up the game in a state where the opponent needs to play next. For example: if BitBurner was closed while waiting for the opponent to make a move, you may need to call passTurn() to get them to play their move on game start.

	resetBoardState(opponent, boardSize)	Gets new IPvGO subnet with the specified size owned by the listed faction, ready for the player to make a move. This will reset your win streak if the current game is not complete and you have already made moves.
	Note that some factions will have a few routers already on the subnet after a reset.
	
	
	GoAnalysis	Tools to analyze the IPvGO subnet.
	
		clearAllPointHighlights()	Removes all highlights from the board.

		clearPointHighlight(x, y)	Removes the highlight color and text from the specified node.

		getChains(boardState)		Returns an ID for each point. All points that share an ID are part of the same network (or "chain"). Empty points are also given chain IDs to represent continuous empty space. Dead nodes are given the value null.
		Takes an optional boardState argument; by default uses the current board state.
		The data from getChains() can be used with the data from getBoardState() to see which player (or empty) each chain is
		For example, a 5x5 board might look like this. There is a large chain #1 on the left side, smaller chains 2 and 3 on the right, and a large chain 0 taking up the center of the board.

		[
		  [   0,0,0,3,4],
		  [   1,0,0,3,3],
		  [   1,1,0,0,0],
		  [null,1,0,2,2],
		  [null,1,0,2,5],
		]

		getControlledEmptyNodes(boardState)		Returns 'X' for black, 'O' for white, or '?' for each empty point to indicate which player controls that empty point. If no single player fully encircles the empty space, it is shown as contested with '?'. "#" are dead nodes that are not part of the subnet.
		Takes an optional boardState argument; by default uses the current board state.	
		Filled points of any color are indicated with '.'
		In this example, white encircles some space in the top-left, black encircles some in the top-right, and between their routers is contested space in the center:
		[
		  "OO..?",
		  "OO.?.",
		  "O.?.X",
		  ".?.XX",
		  "?..X#",
		]

		getLiberties(boardState)		Returns a number for each point, representing how many open nodes its network/chain is connected to. Empty nodes and dead nodes are shown as -1 liberties.
		Takes an optional boardState argument; by default uses the current board state.
		For example, a 5x5 board might look like this. The chain in the top-left touches 5 total empty nodes, and the one in the center touches four. The group in the bottom-right only has one liberty; it is in danger of being captured!

		[
		  [-1, 5,-1,-1, 2],
		  [ 5, 5,-1,-1,-1],
		  [-1,-1, 4,-1,-1],
		  [ 3,-1,-1, 3, 1],
		  [ 3,-1,-1, 3, 1],
		]

		getStats()	Displays the game history, captured nodes, and gained bonuses for each opponent you have played against.

		getValidMoves(boardState, priorBoardState, playAsWhite)	Shows if each point on the board is a valid move for the player. By default, analyzes the current board state. Takes an optional boardState (and an optional prior-move boardState, if desired) to analyze a custom board.
		The true/false validity of each move can be retrieved via the X and Y coordinates of the move.
		const validMoves = ns.go.analysis.getValidMoves();
		const moveIsValid = validMoves[x][y];
		Note that the [0][0] point is shown on the bottom-left on the visual board (as is traditional), and each string represents a vertical column on the board. In other words, the printed example above can be understood to be rotated 90 degrees clockwise compared to the board UI as shown in the IPvGO subnet tab.
		Also note that, when given a custom board state, only one prior move can be analyzed. This means that the superko rules (no duplicate board states in the full game history) is not supported; you will have to implement your own analysis for that.
		The current valid moves for white can also be seen by simply calling ns.go.analysis.getValidMoves(true).

		highlightPoint(x, y, color, text)	Adds a colored circle indicator to the specified point. These indicators are removed once a move is played.

		resetStats(resetAll)	Reset all win/loss and winstreak records for the No AI opponent.

		setTestingBoardState(boardState, komi, nextPlayerIsWhite)	Starts a new game against the "No AI" opponent, and sets the initial board size, pieces, and offline nodes to the given board state. "X" represent black pieces, "O" white, and "." empty points. "#" are dead nodes that are not part of the subnet.
	
	
	
	GoCheat		Illicit and dangerous IPvGO tools. Not for the faint of heart. Requires Source-File 14.2 to use.
	
		destroyNode(x, y, playAsWhite)	Attempts to destroy an empty node, leaving an offline dead space that does not count as territory or provide open node access to adjacent routers.
		Success chance can be seen via ns.go.cheat.getCheatSuccessChance()
		Warning: if you fail to play a cheat move, your turn will be skipped. After your first cheat attempt, if you fail, there is a small (~10%) chance you will instantly be ejected from the subnet.

		getCheatCount(playAsWhite)
		Returns the number of times you've attempted to cheat in the current game.

		getCheatSuccessChance(cheatCount, playAsWhite)
		Returns your chance of successfully playing one of the special moves in the ns.go.cheat API. Scales up with your crime success rate stat. Scales down with the number of times you've attempted to cheat in the current game.
		Warning: if you fail to play a cheat move, your turn will be skipped. After your first cheat attempt, if you fail, there is a small (~10%) chance you will instantly be ejected from the subnet.

		playTwoMoves(x1, y1, x2, y2, playAsWhite)
		Attempts to place two routers at once on empty nodes. Note that this ignores other move restrictions, so you can suicide your own routers if they have no access to empty ports and do not capture any enemy routers.
		Success chance can be seen via ns.go.cheat.getCheatSuccessChance()
		Warning: if you fail to play a cheat move, your turn will be skipped. After your first cheat attempt, if you fail, there is a small (~10%) chance you will instantly be ejected from the subnet.

		removeRouter(x, y, playAsWhite)		Attempts to remove an existing router, leaving an empty node behind.	
		Success chance can be seen via ns.go.cheat.getCheatSuccessChance()
		Warning: if you fail to play a cheat move, your turn will be skipped. After your first cheat attempt, if you fail, there is a small (~10%) chance you will instantly be ejected from the subnet.

		repairOfflineNode(x, y, playAsWhite)
		Attempts to repair an offline node, leaving an empty playable node behind.
		Success chance can be seen via ns.go.cheat.getCheatSuccessChance()
		Warning: if you fail to play a cheat move, your turn will be skipped. After your first cheat attempt, if you fail, there is a small (~10%) chance you will instantly be ejected from the subnet.

*/