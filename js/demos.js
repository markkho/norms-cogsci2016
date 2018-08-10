var GridWorldDemo = function (gridworld, initState, key_handler, initText, task_display, text_display) {
	this.gridworld = gridworld;
	this.initState = initState;
	this.task_display = document.getElementById('task_display');
	this.text_display = $(text_display);
	this.state = initState;
	this.key_handler = (function (context, key_handler) {
							return function (event) {
								key_handler.call(context, event);
							}
						})(this, key_handler);
	this.initText = initText;

	this.MIN_CONTINUE_TIME = 5000;
}

GridWorldDemo.prototype.start = function () {
	this.mdp = new ClientMDP(this.gridworld);
	this.painter = new GridWorldPainter(this.gridworld);

	$(document).bind('keydown.gridworld', this.key_handler);

	this.text_display.html(this.initText);
	this.painter.init(this.task_display);
	$(this.painter.paper.canvas).css({display : 'block', margin : 'auto'}); //center the task
	this.painter.drawState(this.state);
}

GridWorldDemo.prototype.end = function () {
	this.painter.remove();
	$(document).unbind('keydown.gridworld');
}

//Practicing moving around
$(document).ready(function () {
	var gridWorld_single_actions = function (event) {
								var action;
								switch (event.which) {
									case 37:
										action = 'left';
										break
									case 38:
										action = 'up';
										break
									case 39:
										action = 'right';
										break
									case 40:
										action = 'down';
										break
									case 32:
										action ='wait';
										break
									default:
										return
								}
								//choose random actions for other agents
								var agentActions = {};
								var availableActions = ['left','up','right','down','wait']
								for (var agent in this.state) {
									if (this.state[agent].type == 'agent' && agent == 'agent2') {
										if (typeof this.agent2Policy !== 'undefined') {
											agentActions[agent] = this.agent2Policy[this.state['agent2'].location];
										}
										else {
											agentActions[agent] = availableActions[Math.floor(Math.random()*availableActions.length)]
										}
									}
								}
								agentActions['agent1'] = action;

								var nextState = this.mdp.getTransition(this.state, agentActions);
								var animation_time = this.painter.drawTransition(this.state, agentActions, nextState, this.mdp);
								this.state = nextState;

								$(document).unbind('keydown.gridworld');
									
								//note: you need a closure in order to properly reset
								var reset_key_handler = (function (key_handler) {
									return function () {
										$(document).bind('keydown.gridworld', key_handler);
									}
								})(this.key_handler);
								var th = setTimeout(reset_key_handler, animation_time - this.painter.REWARD_DISPLAY_TIME);
								$.subscribe('killtimers', (function (th) {
												return function () {clearTimeout(th)}
											})(th)
										)
							}

	var gridWorld_game_actions = function (event) {
								var action;
								switch (event.which) {
									case 37:
										action = 'left';
										break
									case 38:
										action = 'up';
										break
									case 39:
										action = 'right';
										break
									case 40:
										action = 'down';
										break
									case 32:
										action ='wait';
										break
									default:
										return
								}
								//choose random actions for other agents
								var agentActions = {};
								//var availableActions = ['left','up','right','down','wait']
								//for (var agent in this.state) {
								//	if (this.state[agent].type == 'agent' && agent !== 'agent1') {
								//		agentActions[agent] = availableActions[Math.floor(Math.random()*availableActions.length)]
								//	}
								//}
								agentActions['agent2'] = this.agent2Policy[this.state['agent2'].location];
								agentActions['agent1'] = action;

								var nextState = this.mdp.getTransition(this.state, agentActions);

								var goal_callback = (
									function (demo) {
										return function (painter, location, agent) {
											painter.showReward(location, agent, 'Home!');
											if (typeof demo.points === 'undefined') {
												demo.points = {agent1 : 0, agent2 :0}
											}
											demo.points[agent]++;
											if (demo.points['agent1'] > 0) {
												demo.text_display.html('You and your teammate ONLY receive points when you BOTH reach your homes.<br>For each point, you get $0.10 each<br>Team points: '+demo.points['agent1']+'<br>Press "Enter" to continue.');
											}
											//
											//reset the round if it hasn't been scheduled to reset already
											if (typeof demo.resetRound === 'undefined') {
												demo.resetRound = true;
												var resetRound = (function (demo) {
													return function () {
														demo.state = demo.initState;
														demo.painter.drawState(demo.initState);
														demo.resetRound = undefined;
													}
												})(demo)
												var th = setTimeout(resetRound, painter.ACTION_ANIMATION_TIME+painter.REWARD_DISPLAY_TIME-200);
												$.subscribe('killtimers', (function (th) {
														return function () {clearTimeout(th)}
													})(th))
											}
										}
									})(this)

								var animation_time = this.painter.drawTransition(this.state, agentActions, nextState, this.mdp, goal_callback);
								this.state = nextState;

								$(document).unbind('keydown.gridworld');
									
								//note: you need a closure in order to properly reset
								var reset_key_handler = (function (key_handler) {
									return function () {
										$(document).bind('keydown.gridworld', key_handler);
									}
								})(this.key_handler);
								var th = setTimeout(reset_key_handler, animation_time);
								$.subscribe('killtimers', (function (th) {
												return function () {clearTimeout(th)}
											})(th)
										)
							}

	demo0 = new GridWorldDemo(
		//gridworld
		{
			height : 3,
			width : 3,
			walls : [],
			goals : [],
			agents : [{name : 'agent1'}]
		},
		//initial state
		{
			agent1 : {name : 'agent1', location : [1,1], type : 'agent'}
		}, 
		function (event) {}
		,
		//initial text, display id, message id
		'Welcome to the demo! This is your agent. It can move to different tiles on the board. <br> Press enter to continue demo',
		'#task_display',
		'#messages'
	);
	demo0.MIN_CONTINUE_TIME = 1;

	demo1 = new GridWorldDemo(
		//gridworld
		{
			height : 3,
			width : 3,
			walls : [],
			goals : [],
			agents : [{name : 'agent1'}]
		},
		//initial state
		{
			agent1 : {name : 'agent1', location : [1,1], type : 'agent'}
		}, 
		gridWorld_single_actions
		,
		//initial text, display id, message id
		'Arrow keys move you around, and the <u>spacebar</u> makes you wait. Try it! <br> Press enter to continue demo',
		'#task_display',
		'#messages'
	);

	demo2 = new GridWorldDemo(
		//gridworld
		{
			height : 3,
			width : 3,
			walls : [],
			goals : [{agent:'agent1', location: [0,0]}],
			agents : [{name : 'agent1'}]
		},
		//initial state
		{
			agent1 : {name : 'agent1', location : [2,2], type : 'agent'}
		}, 
		gridWorld_single_actions
		,
		//initial text, display id, message id
		'The orange tile is your home tile.<br>Try going home! <br> Press enter to continue demo',
		'#task_display',
		'#messages'
	);

	demo3 = new GridWorldDemo(
		//gridworld
		{
			height : 3,
			width : 3,
			walls : [],
			goals : [{agent:'agent1', location: [0,0]}, {agent:'agent2', location: [2,2]}],
			agents : [{name : 'agent1'}, {name : 'agent2'}]
		},
		//initial state
		{
			agent1 : {name : 'agent1', location : [2,0], type : 'agent'},
			agent2 : {name : 'agent2', location : [0,2], type : 'agent'}
		}, 
		gridWorld_single_actions
		,
		//initial text, display id, message id
		'Other agents also have their own home tiles! <br><br> Press enter to continue demo',
		'#task_display',
		'#messages'
	);

	demo4 = new GridWorldDemo(
		//gridworld
		{
			height : 1,
			width : 3,
			walls : [],
			goals : [{agent : 'agent1', location : [1,0]}, {agent : 'agent2', location : [2,0]}],
			agents : [{name : 'agent1'}, {name : 'agent2'}]
		},
		//initial state
		{
			agent1 : {name : 'agent1', location : [2,0], type : 'agent'},
			agent2 : {name : 'agent2', location : [0,0], type : 'agent'}
		}, 
		gridWorld_single_actions
		,
		//initial text, display id, message id
		'Only one agent is allowed on each tile. <br> When 2 agents collide, nobody moves. Try waiting (spacebar) <br> Press enter to continue demo',
		'#task_display',
		'#messages'
	);
	
	demo4.agent2Policy = {'0,0':'right', '1,0':'left'};

	demo5 = new GridWorldDemo(
		//gridworld
		{
			height : 3,
			width : 4,
			walls : [],
			goals : [{agent:'agent1', location: [1,2]}, {agent:'agent2', location: [3,1]}],
			agents : [{name : 'agent1'}, {name : 'agent2'}]
		},
		//initial state
		{
			agent1 : {name : 'agent1', location : [1,0], type : 'agent'},
			agent2 : {name : 'agent2', location : [0,1], type : 'agent'}
		}, 
		gridWorld_game_actions
		,
		//initial text, display id, message id
		'Agents play rounds together.<br> Each round ends when one or both agents reach their home tile<br>Sometimes you have to wait (spacebar) for the other person to go.',
		'#task_display',
		'#messages'
	);

	demo5.agent2Policy = {'0,1':'right', '1,1':'right', '2,1' :'right'}

	endDemo = new GridWorldDemo(
		//gridworld
		{
			height : 0,
			width : 1,
			walls : [],
			goals : [],
			agents : [{name : 'agent1'}]
		},
		//initial state
		{
			agent1 : {name : 'agent1', location : [0,0], type : 'agent'}
		}, 
		gridWorld_single_actions
		,
		//initial text, display id, message id
		"That's the end of the demo! In the task, you will play <b>20 rounds</b> with <b>another Turker</b>.<br>REMEMBER: YOU BOTH NEED TO REACH HOME TO WIN A BONUS<br> Press Enter to start the task.",
		'#task_display',
		'#messages'
	);
	endDemo.end = function () {
		console.log('end of demo');
		console.log('redirect:' + redirect_link)
		$(window).unbind('beforeunload');
		window.location.replace(redirect_link);
	}
})
