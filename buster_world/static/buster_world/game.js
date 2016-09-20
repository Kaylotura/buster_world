 /**
 * Buster World: The Game.
 * This file uses Phaser 2.6.2 to create a bubble busting game to be rendered
 * over a google map.
 *
 * Eventually, the idea will be to use Google Map API data to render portions
 * of the game, so that the game and the map relate to one another.
 *
 * Its worth noting that 'use strict; doesn't seem to play nicely with phaser's
 * methods.
 */


// 'use strict';
//
// /**
//   * Silences Linter on Library Variables
//   */
// if (!window) {
//   var Phaser;
//   var preload;
//   var create;
//   var update;
//   var render;
//   var girlIcon;
//   var tallChainIcon;
//   var wideChainIcon;
//   var bubbleIcon;
//   var shieldIcon;
//   var setPosition;
//   var x;
// }


// This Initiates the game, using the preload, create, update,
// and render functions.
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {preload: preload,
  create: create, update: update, render: render}, true);


/**
 * A Phaser.js specific function that contains all of the information that the
 * game will need to parse before it renders.
 */
function preload() {
  game.load.image('player', girlIcon);
  game.load.image('tallChain', tallChainIcon);
  game.load.image('wideChain', wideChainIcon);
  game.load.image('bubble', bubbleIcon);
  game.load.image('shield', shieldIcon);
}


// The list of variables that the game will use
var player;
var cursors;
var chains;
var bubbles;
var ball;
var smallBall1;
var smallBall2;
var hook;
var chainCount = false;
var chainGrow;
var score = 0;
var scoreText;
var scoreString;
var resolve;
var resolveString;
var comboTracker = {'size': 0, 'combo': 0};
var fireButton;
var facing = {'chainDirection': {x: 1, y: -20}, 'chainAngle': 'tallChain',
'chainPopY': -20, 'chainPopX': 0};

/**
 * Finds the Player's Location.
 */
function getPlayerLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(setPosition);
  } else {
    x.innerHTML = 'Geolocation is not supported by this browser.';
  }
}

/**
 * Sets the player's position to xLat and yLong.
 */
function setPosition(position) {
  var xLat = position.coords.latitude;
  var yLong = position.coords.longitude;
}


/**
 * A Phaser.js specific function that contains all of the information that the
 * game will need to create aparent objects and effects.
 */
function create() {

  // Creates the Player
  player = game.add.sprite(400, 300, 'player');
  game.physics.arcade.enable(player);
  player.body.collideWorldBounds = true;

  // Creates a Bubbles Group
  bubbles = game.add.physicsGroup(Phaser.Physics.ARCADE);

  // Creats a Chains Group
  chains = game.add.physicsGroup(Phaser.Physics.ARCADE);

  // The Game's Controls
  cursors = game.input.keyboard.createCursorKeys();
  fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  //  The Score
  scoreString = 'Catharsis : ';
  scoreText = game.add.text(10, 10, scoreString + score, {font: '34px Ariel',
  fill: '#CC3300'});

  //  Player's Resolve
  resolve = game.add.group();
  resolveString = 'Resolve';
  var resolveText = game.add.text(game.world.width - 150, 10,
    resolveString, {font: '34px Ariel', fill: '#CC3300'});
  for (var i = 0; i < 3; i++) {
    var shield = resolve.create(game.world.width - 142 + 50 * i, 60, 'shield');
    shield.anchor.setTo(0.5, 0.5);
  }

// //  Player's Combo
//   comboString = 'Combo[Size/String] : ';
//   comboText = game.add.text(game.world.width -500, 50, comboString + comboTracker['size']+ comboTracker['combo'],
//     { font: '34px Ariel', fill: '#CC3300' });

/**
 * Populates the game screen with bubbles.
 */
  function createBall() {
    //  A bouncey ball sprite just to visually see what's going on.
    ball = bubbles.create(
      player.x + game.rnd.integerInRange(50, 400),
      player.y + game.rnd.integerInRange(50, 400),
      'bubble'
    );
    ball.body.velocity.set(game.rnd.integerInRange(-60, 60),
      game.rnd.integerInRange(-60, 60));
    ball.scale.setTo(game.rnd.pick([2, 2, 2, 2, 1, 1, 1, 0.5, 0.5]));
    ball.tint = Math.random() * 0xffffff;
  }

  // Creates a Game-Time Event that Creates Bubbles!
  game.time.events.repeat(Phaser.Timer.SECOND * 5, 100, createBall, this);

}

/**
 * A Phaser.js specific function that contains all of the information that the
 * game will process while its running, in order to update the game live.
 */
function update() {
  bubbles.setAll('body.collideWorldBounds', true);
  bubbles.setAll('body.bounce.x', 1);
  bubbles.setAll('body.bounce.y', 1);
  game.physics.arcade.collide(bubbles);
  game.physics.arcade.overlap(player, bubbles, bubbleHurtsPlayer, null, this);
  game.physics.arcade.overlap(bubbles, chains, chainPopsBubble, null, this);

  game.physics.arcade.moveToXY(player, 45, 122);

  /**
  * Removes the chain sprite after it's reached the zennith of its animation.
  */
  function killChain() {
    hook.kill();
    chainCount = false;
  }

  /**
   * Handles the Chain Launching action.
   */
  function launchHook() {
    if (chainCount === false) {
      hook = chains.create(player.x, player.y, facing['chainAngle']);
      hook.body.immovable = true;
      game.physics.arcade.enable(hook);
      chainGrow = game.add.tween(hook.scale).to(facing['chainDirection'],
        2000, Phaser.Easing.Linear.None, true);
      chainGrow.onComplete.add(killChain, this);
      chainCount = true;
    }
  }


  //Game Spacebar
  if (fireButton.isDown) {
    launchHook();
  }

  // Game Controls for Facing
  if (cursors.up.isDown) {
    facing = {'chainDirection': {x: 1, y: -20}, 'chainAngle': 'tallChain',
    'chainPopY': -400, 'chainPopX': 0};
  } else if (cursors.left.isDown) {
    facing = {'chainDirection': {x: -20, y: 1}, 'chainAngle': 'wideChain',
      'chainPopY': 0, 'chainPopX': -400};
  } else if (cursors.right.isDown) {
    facing = {'chainDirection': {x: 20, y: 1}, 'chainAngle': 'wideChain',
      'chainPopY': 0, 'chainPopX': 400};
  }else if (cursors.down.isDown) {
    facing = {'chainDirection': {x: 1, y: 20}, 'chainAngle': 'tallChain',
      'chainPopY': 400, 'chainPopX': 0};
  }

 /**
 * Manages sprite collision between the chain and any given bubble.
 */
  function chainPopsBubble(ball, chain) {

    //  Remove the chain, and set the chainCount to False.
    chain.kill();
    chainCount = false;

  // make children bubbles if parent bubble wasn't too small
    if (ball.scale.x > .25) {
      smallBall1 = bubbles.create(ball.world.x, ball.world.y, 'bubble');
      smallBall1.scale.setTo(ball.scale.x / 2, ball.scale.y / 2);
      smallBall1.body.velocity.set(ball.body.velocity.x * 1.5,
        ball.body.velocity.y * -1.5);
      smallBall1.tint = ball.tint;
      smallBall2 = bubbles.create(ball.world.x, ball.world.y, 'bubble');
      smallBall2.scale.setTo(ball.scale.x / 2, ball.scale.y / 2);
      smallBall2.body.velocity.set(ball.body.velocity.x * -1.5,
        ball.body.velocity.y * 1.5);
      smallBall1.tint = ball.tint;
    }

    // Track Combo
    if (ball.scale.x === comboTracker['size']) {
      if (comboTracker['combo'] < 4) {
        comboTracker['combo'] += 1;
      }
    } else {
      comboTracker['combo'] = 1;
      comboTracker['size'] = ball.scale.x;
    }

  // comboText.text = comboString + comboTracker['size'] + '||' + comboTracker['combo'];


    // Increase the Score
    score += 1 / ball.scale.x * comboTracker['combo'] * 100;
    scoreText.text = scoreString + score;
    ball.kill();
  }


  /**
   * Takes in a class as an argument and removes the invisble class from all
   * elements that have the given input class.
   */
  function unhideField(inputclass) {
    $(inputclass).removeClass('invisible');
  }


  /**
   * Takes in a field id as an argument and removes the invisble class from all
   * elements that have the given input class.
   */
  function hideField(inputid) {
    $(inputid).addClass('invisible');
  }


  /**
   * Returns the game time in 100th of seconds.
   */
  function getPrettyTime() {
    var time = this.game.time.totalElapsedSeconds();
    var workingTime = time * 10;
    var stillWorkingTime = Math.floor(workingTime);
    var prettyTime = stillWorkingTime / 10;
    return prettyTime;
  }


  /**
   * When the game is lost, or quit, this function is called. It removes the player icon, and displays the "Game Over"
   * text and uses jquery to unhide and populate the game-over form.
   */
  function gameOver() {
    var time = getPrettyTime();
    player.kill();
    bubbles.callAll('kill');
    $('#player_score').val(score);
    $('#player_time').val(time);
    hideField('#map');
    hideField('#game');
    unhideField('.game_over');
  }


 /**
  * Manages sprite collision between the chain and any given bubble.
  */
  function bubbleHurtsPlayer(player, ball) {

  //  When a bubble hits the player, one point of resolve is taken away, and the bubble is destroyed.
  // If the player has 0 resolve, they die!
    ball.kill();
    var firstShield = resolve.getFirstAlive();
    if (firstShield) {
      firstShield.kill();
    }
    if (chainCount === true) {
      hook.kill();
      chainCount = false;
    }
    //  Decreases the score
    score -= 50;
    scoreText.text = scoreString + score;

    // When the player loses all of their resolve
    if (resolve.countLiving() < 1) {
      gameOver();
    }
  }
}


/**
 * Phaser Js Function, not needed yet, but prepared. Usually used for debugging.
 */
function render() {
}

$(document).ready(getPlayerLocation);
