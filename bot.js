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

// Part events
bot.addListener( 'part', function( channel, who ) {
	if ( config.debug ) {
		console.log( 'Part Handler!!' );
		console.log( channel );
	}
});

// Quit events
bot.addListener( 'quit', function( nick, reason, channels, message ) {
	if ( config.debug ) console.log( message );
});

// Allow plugins to set-up their own listeners for events
for (let plugin of plugins) {
	if (!!plugin.listen) {
		plugin.listen(bot);
	}
}

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
			for (plugin of plugins) {
				if (!!filters) {
					for (filter of plugin.filters) {
						if (typeof filter === 'function') {
							filter(bot, from, to, message);
						}
					}
				}
			}
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
