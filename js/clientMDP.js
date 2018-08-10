/* 
	Basic functionality for BURLAP gridworld MDP for testing on client.
*/

var ClientMDP = function (gridworld) {
	this.gridworld = gridworld;
}

ClientMDP.prototype.inGoal = function (location, agent) {
	for (var g = 0 ; g < this.gridworld.goals.length; g++) {
		var goal = this.gridworld.goals[g];
		if (String(goal.location) == String(location) && goal.agent == agent) {
			return true
		}
	}
	return false
}

ClientMDP.prototype.getNextIntendedLocation = function (start, action) {
	var end = start;
	switch (action) {
		case 'left':
			end = [start[0] -1, start[1]]
			break
		case 'right':
			end = [start[0] + 1, start[1]]
			break
		case 'up':
			end = [start[0], start[1] + 1]
			break
		case 'down':
			end = [start[0], start[1] - 1]
			break
		case 'wait':
			end = start
			break
	}
	return end
}

ClientMDP.prototype.getTransition = function (state, action) {
	var nextIntendedLocations = {};
	for (var agent in state) {
		if (state[agent].type !== 'agent') {
			continue
		}
		nextIntendedLocations[agent] = this.getNextIntendedLocation(state[agent].location, action[agent]);
	}

	var nextState = {};

	//find agents going to the same state - no collisions
	var agentsByLocation = {};
	for (var agent in nextIntendedLocations) {
		if (typeof agentsByLocation[nextIntendedLocations[agent]] == 'undefined') {
			agentsByLocation[nextIntendedLocations[agent]] = []	
		}
		agentsByLocation[nextIntendedLocations[agent]].push(agent);
	}
	for (var loc in agentsByLocation) {
		if (agentsByLocation[loc].length > 1) {
			for (var a = 0 ; a < agentsByLocation[loc].length; a++) {
				var agent = agentsByLocation[loc][a];
				nextState[agent] = state[agent]
			}
		}
	}

	//hitting walls or edge of world
	for (var agent in nextIntendedLocations) {
		if (nextIntendedLocations[agent][0] >= this.gridworld.width ||
			nextIntendedLocations[agent][0] < 0 ||
			nextIntendedLocations[agent][1] >= this.gridworld.height ||
			nextIntendedLocations[agent][1] < 0) {
			nextState[agent] = state[agent];
		}

		for (var w = 0; w < this.gridworld.walls.length; w++) {
			var wall = this.gridworld.walls[w];
			//2D walls
			if (wall.length == 2 && String(wall) == String(nextIntendedLocations[agent])) {
				nextState[agent] = state[agent];
			}
			//1D walls
			if (wall.length == 3 && String(wall.slice(0,2)) == String(state[agent].location) && wall[2] == action[agent]) {
				nextState[agent] = state[agent];
			}
		}
	}

	//you cannot go where someone else must be
	//and you cannot go where someone else was if they're going where you were
	var cannotMove = {};
	
	for (var agent in nextIntendedLocations) {
		for (var oldagent in nextState) {
			if (agent == oldagent) {
				continue
			}
			if (String(nextIntendedLocations[agent]) == String(nextState[oldagent].location)) {
				cannotMove[agent] = state[agent];
			}
		}

		for (var oldagent in state) {
			if (String(nextIntendedLocations[agent]) == String(state[oldagent].location) &&
				String(nextIntendedLocations[oldagent]) == String(state[agent].location)) {
				cannotMove[agent] = state[agent];
			}
		}
	}
	$.extend(nextState, cannotMove);

	//otherwise, go wherever you want
	for (var agent in nextIntendedLocations) {
		if (typeof nextState[agent] == 'undefined') {
			nextState[agent] = {name : agent, location : nextIntendedLocations[agent], type : 'agent'};
		}
	}

	return nextState
}