'use strict';

// Includes
var config = require( './config' );
var irc = require( 'irc' );
var nickserv = require( 'nickserv' );

var request = require( 'request' );
var cheerio = require( 'cheerio' );
var jsdom = require( 'jsdom' );
var moment = require( 'moment-timezone' );
var async = require( 'async' );

var plugins = require( './plugins' );

// Initialize global bot variables
var flood = [];

// Create the bot
var bot = new irc.Client( config.server, config.name, {
	// channels: config.channels,
	localAddress: config.localAddress,
	realName: config.realName,
	autoRejoin: true
});

// Instantiate nickserv to handle communication between bot and services
var ns = new nickserv( config.name, {
	password: config.pass,
	email: config.email
});
ns.attach( 'irc', bot );

// Connected events
bot.addListener( 'registered', function ( message ) {
	ns.identify( config.pass, function( err ) {
		if ( err && config.debug ) console.log( 'nickserv error:' + err );
		config.channels.forEach( function( value, index, array ) {
			bot.join( value + ' ' + config.pass );
			bot.send( '/msg chanserv op ' + value + ' ' + config.name );
		});
	});
});

// Error handler
bot.addListener( 'error', function ( message ) {
	if ( config.log ) {
		console.log( 'BOT ERROR: ' );
		console.log( message );
	}
});

// Join events
bot.addListener( 'join', function( channel, who ) {
	if ( config.debug ) console.log( who + ' joined ' + channel );
	// When other users join the channel (not the bot)
	if ( bot.nick != who ) {
		// Check for pending .tell commands for this user
		var msg = '';
		var told = [];
		var inbox = [];
		var different = [];
		// Loop through each message and build one big message to deliver to the user
		tell.forEach( function( value, index, array ) {
			if ( value.from == who ) {
				if ( config.debug ) console.log( 'Delivering .tell message #' + index + ' to ' + who );
				var date = moment().tz( 'America/New_York' ).format( 'M/DD/YY h:mm:ssa z' );
				msg = '[' + value.from + ' ' + date + ']: ' + value.message;
				inbox.push( msg );
				told.push( index );
				if ( different.indexOf( value.from ) < 0 ) different.push( value.from );
			}
		});

		// Display their messages without flooding the channel
		if ( inbox.length > 4 ) {
			var plural = {
				inbox: ( inbox.length > 1 ? 's' : '' ),
				different: ( different.length > 1 ? 's' : '' )
			};
			var msg = 'You have ' + inbox.length + ' message' + plural.inbox + ' in your inbox from ' + different.length + ' user' + plural.different + '. Type .inbox to access your messages one page at a time while trying not to flood the channel ;)';
			bot.say( channel, msg );
		} else {
			inbox.forEach( function( value, index, array ) {
				bot.say( channel, who + ': ' + value );
			});
		}

		// Remove the messages that have been delivered
		if ( told.length ) {
			told.forEach( function( value, index, array ) {
				tell.splice( value, 1 );
			});
		}
	} else {
		// Actions to perform when the bot joins the channel
	}
});

// Part events
bot.addListener( 'part', function( channel, who ) {
	if ( config.debug ) {
		console.log( 'Part Handler!!' );
		console.log( channel );
	}
	// Add parting user to the seen array
	seen.push({
		event: 'part',
		nick: who,
		channel: channel,
		time: moment().tz( 'America/New_York' ).format( 'MMMM Do YYYY, h:mm:ss a z' )
	});
});

// Quit events
bot.addListener( 'quit', function( nick, reason, channels, message ) {
	if ( config.debug ) console.log( message );
	// Add parting user to the seen array
	seen.push({
		event: 'quit',
		nick: nick,
		channel: channels,
		reason: reason,
		message: message,
		time: moment().tz( 'America/New_York' ).format( 'MMMM Do YYYY, h:mm:ss a z' )
	});
});

// Nick change events
bot.addListener( 'nick', function ( oldnick, newnick, channels, message ) {
	// Update seen array if necessary
	seen.push({
		event: 'nick',
		nick: oldnick,
		newnick: newnick,
		channel: channels,
		message: message,
		time: moment().tz( 'America/New_York' ).format( 'MMMM Do YYYY, h:mm:ss a z' )
	});
});

// Message events
bot.addListener( 'message', function( from, to, text, message ) {
	// Debug incoming messages
	if ( config.debug ) {
		console.log( '============ From ============' );
		console.log( from );
		console.log( '============  To  ============' );
		console.log( to );
		console.log( '============ Text ============' );
		console.log( text );
		console.log( '============ MESG ============' );
		console.log( message );
		console.log( '==============================' );
	}

	// Check messages
	if ( to == bot.nick ) {
		// Private message handler
		if ( config.debug ) console.log( 'Private Message Handler!!' );
		bot.say( from, 'Hey ' + from + '... I\'m a bot and I\'m not currently programmed to handle your private messages. Check back soon.' );
	} else {
		// Public message handler

		// Check for flooding
		// floodCheck( message );

		// Check for admin
		var isAdmin = false;
		if ( config.admins.length ) {
			config.admins.forEach( function( value, index, array ) {
				if ( value.trim().toLowerCase() == from.trim().toLowerCase() ) {
					isAdmin = true;
				}
			});
		}

		// Check for ignored
		var isIgnored = false;
		if ( config.ignore.length ) {
			config.ignore.forEach( function( value, index, array ) {
				if ( value.trim().toLowerCase() == from.trim().toLowerCase() ) {
					isIgnored = true;
				}
			});
		}

		// Break up command string
		var command = text.match( /^\.(\w+)/ );
		if ( config.debug ) console.log( 'Public Message Handler!!' );
		if ( config.debug ) console.log( command );

		// Log all channel messages
		if ( config.log ) console.log( '[' + to + '] ' + from + ': ' + text + ' - ' + moment().format() );

		// Check if this message needs to be ignored
		if ( ( isIgnored && ! isAdmin ) || config.muted.indexOf( message.args[0] ) > -1 ) {
			return;
		} else if ( config.debug ) {
			console.log( 'ignored:', isIgnored, 'admin:', isAdmin );
		}

		// Parse commands
		if ( command && command.length && command[0].charAt(0) == '.' ) {
			// Initialize
			var cmd = command[1];
			var str = command.input.replace( command[0] + ' ', '' );
			var who = str.split( '> ' );
			if ( who.length == 1 ) {
				who = false;
			} else {
				who = who.pop();
				str = str.replace( ' > ' + who, '' );
			}

			// Debug
			if ( config.debug ) {
				console.log( 'cmd: ' + cmd );
				console.log( 'str: ' + str );
				console.log( 'who: ' + who );
			}

			for ( var plugin of plugins ) {
				if ( !! plugin['commands'] ) {
					for ( var command of plugin.commands ) {
						if ( !! command['name'] ) {
							if ( command.name === cmd || ( command.name instanceof Array && command.name.findIndex( cmd ) > -1 ) ) {
								command.handler( bot, from, to, message, who, str );
							}
						}
					}
				}
			}

			if ( cmd === 'help' ) {
				var commands = [ '.g', '.c', '.p', '.seen', '.tell', '.first', '.paste', '.hierarchy', '._', '.blame', '.ask', '.say' ];
				var helpstr = 'Available Commands: ' + commands.join( ', ' );
				bot.say( who ? who : from, helpstr );
				console.log( 'sending help message to: ' + who ? who : from );
			}
		} else {
			// React to parts of their string if it contains certain text
			var msg = '';
			var prefix = who ? who + ': ' : '';
			var reactions = text.match( /(\w+)/g );
			if ( reactions !== null && reactions.length ) {
				reactions.forEach( function( value, index, array ) {
					// In case we need to check the next word too
					var nextword = reactions[ index + 1 ];
					// Loop through all words encompassed in colons :something: like :this: in the whole string
					switch ( value.toLowerCase() ) {
						case 'cry':
						case 'tear':
						case 'tears':
						case ':~(':
						case ':(':
							msg += msg.length ? ' (╯︵╰,)' : '(╯︵╰,)';
							break;
						case 'party':
						case 'dance':
						case 'boogie':
							msg += msg.length ? ' ┏(-_-)┛┗(-_-﻿)┓┗(-_-)┛┏(-_-)┓' : '┏(-_-)┛┗(-_-﻿)┓┗(-_-)┛┏(-_-)┓';
							break;
						case 'fuck':
						case 'finger':
							if ( value != 'fuck' || ( nextword == 'you' || nextword == 'off' ) ) {
								msg += msg.length ? ' ╭∩╮（︶︿︶）╭∩╮' : '╭∩╮（︶︿︶）╭∩╮';
							} else if ( value == 'fuck' && ( nextword == 'this' || nextword == 'life' ) ) {
								msg += msg.length ? ' (╯°□°）╯︵ ┻━┻' : '(╯°□°）╯︵ ┻━┻';
							} else if ( value == 'fuck' ) {
								msg += msg.length ? ' 🍆🍆' : '🍆🍆';
							}
							break;
						case 'poop':
						case 'crap':
						case 'shit':
						case 'crappy':
						case 'shitty':
							msg += msg.length ? ' 💩💩' : '💩💩';
							break;
						case 'dead':
						case 'skull':
						case 'skulls':
							msg += msg.length ? ' 💀💀' : '💀💀';
							break;
						case 'troll':
						case 'trolls':
						case 'trolling':
							if ( msg.indexOf('https://youtu.be/9zYP8_5IBmU?t=1m47s') == -1 ) {
								msg += msg.length ? ' ' : 'https://youtu.be/9zYP8_5IBmU?t=1m47s';
							}
							break;
						case 'shade':
						case 'shades':
							msg += msg.length ? ' 😎😎' : '😎😎';
							break;
						case 'ghost':
						case 'ghosts':
						case 'halloween':
							msg += msg.length ? ' 👻👻' : '👻👻';
							break;
						case 'nerd':
						case 'nerds':
						case 'nerdy':
							msg += msg.length ? ' 🤓🤓' : '🤓🤓';
							break;
						case 'bah':
						case 'frustrated':
							msg += msg.length ? ' (╯°□°）╯︵ ┻━┻' : '(╯°□°）╯︵ ┻━┻';
							break;
						case 'chill':
						case 'calm':
							if ( ( value == 'calm' && nextword == 'down' ) || ( value == 'chill' && nextword == 'out' ) || value == 'chill' ) {
								msg += msg.length ? ' ┬──┬ ノ(゜-゜ノ)' : '┬──┬ ノ(゜-゜ノ)';
							}
							break;
						case 'hmm':
						case 'wonder':
						case 'thinking':
							msg += msg.length ? ' 🤔🤔' : '🤔🤔';
							break;
						case 'angel':
						case 'innocent':
						case 'harmless':
							msg += msg.length ? ' 😇😇' : '😇😇';
							break;
						case 'shrug':
						case 'shrugs':
							msg += msg.length ? ' ¯\\_(ツ)_/¯' : '¯\\_(ツ)_/¯';
							break;
						case 'yolo':
							msg += msg.length ? ' Yᵒᵘ Oᶰˡʸ Lᶤᵛᵉ Oᶰᶜᵉ' : 'Yᵒᵘ Oᶰˡʸ Lᶤᵛᵉ Oᶰᶜᵉ';
							break;
						case 'hi':
						case 'waves':
						case 'hello':
						case 'greetings':
							var answers = [ 'http://xn--rh8hj8g.ws/hi-queen.gif', 'http://xn--rh8hj8g.ws/hi-goofy.gif', 'http://xn--rh8hj8g.ws/hi-forestgump.gif', 'http://xn--rh8hj8g.ws/hi-picard.gif', 'http://xn--rh8hj8g.ws/hi-ironman.gif' ];
							var answer = answers[ Math.floor( Math.random() * answers.length ) ];
							msg += msg.length ? ' ' + answer : answer;
							break;
						case 'bye':
						case 'goodbye':
						case 'farewell':
							var answers = [ 'http://xn--rh8hj8g.ws/bye-jezebel.gif', 'http://xn--rh8hj8g.ws/bye-jezebel.gif', 'http://xn--rh8hj8g.ws/bye-bitch.gif', 'http://xn--rh8hj8g.ws/bye-woody.gif', 'http://xn--rh8hj8g.ws/bye-clarissa.gif', 'http://xn--rh8hj8g.ws/bye-harrypotter.gif', 'http://xn--rh8hj8g.ws/bye-random.gif' ];
							var answer = answers[ Math.floor( Math.random() * answers.length ) ];
							msg += msg.length ? ' ' + answer : answer;
							break;
						case 'wtf':
						case 'dafuq':
							var answers = [ 'http://xn--rh8hj8g.ws/wtf-baby.png' ];
							var answer = answers[ Math.floor( Math.random() * answers.length ) ];
							msg += msg.length ? ' ' + answer : answer;
							break;
						case 'yas':
						case 'werk':
							var answers = [ 'http://xn--rh8hj8g.ws/yas-werk.gif' ];
							var answer = answers[ Math.floor( Math.random() * answers.length ) ];
							msg += msg.length ? ' ' + answer : answer;
							break;
						case 'smh':
							var answers = [ 'http://xn--rh8hj8g.ws/smh-mjf.png', 'http://xn--rh8hj8g.ws/smh-today.gif', 'http://xn--rh8hj8g.ws/smh-kanye.gif', 'http://xn--rh8hj8g.ws/smh-bbad.gif', 'http://xn--rh8hj8g.ws/smh-drag.gif' ];
							var answer = answers[ Math.floor( Math.random() * answers.length ) ];
							msg += msg.length ? ' ' + answer : answer;
							break;
					}
				});
			}
			// bug reporting
			var bugs = text.match( /(#|(bug\s+)|(https?:\/\/core\.trac\.wordpress\.org\/ticket\/))(\d+)/ig );
			if ( bugs !== null && bugs.length ) {
				if ( config.debug ) console.log( bugs );
				bugs.forEach( function( bug ) {
					if ( config.debug ) console.log(bug);
					bug = bug.replace( /(#|(bug\s+)|(https?:\/\/core\.trac\.wordpress\.org\/ticket\/))/i, '' );
					request( 'https://core.trac.wordpress.org/ticket/' + bug + '?format=rss', function( error, response, body ) {
						if ( error ) {
							return;
						}
						var title = body.match( /<title>(.*?)<\/title>/i );
						if ( config.debug ) console.log( title[1] );
						bot.say( message.args[0], title[1] );
					});
				});
			}
			if ( msg.length ) bot.say( message.args[0], msg );
		}
	}
});

// Flood protection function (under construction)
function floodCheck( msg ) {
	if ( Array.isArray( flood ) && Array.isArray( flood[ msg.nick ] ) ) {
		var msgs = flood[ msg.nick ];
		// console.log( 'CHECKING EXISTING FLOOD ITEMS' );
		// if ( msgs.length + 1 == config.floodMessages ) {
		// 	// Kick the user or something and clear the array
		// } else {
		// 	// Make an array of times for testing against duration
		// 	var times = [];
		// 	msgs.forEach( function( value, index, array ) {
		// 		times.push( value.time );
		// 	});

		// 	console.log( times );
		// }
	} else {
		// console.log( 'ADDING NEW FLOOD ITEM' );
		flood[ msg.nick ] = [];
		flood[ msg.nick ].push({ time: moment(), nick: msg.nick, user: msg.user, host: msg.host, args: msg.args });
	}
	if ( config.debug ) {
		// console.log( '==============================' );
		// console.log( flood );
	}
}
