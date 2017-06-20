// Includes
var config = require( './config' );
var irc = require( 'irc' );
var nickserv = require( 'nickserv' );
var google = require( 'google' );
var request = require( 'request' );
var jsdom = require( 'jsdom' );
var moment = require( 'moment-timezone' );

// Initialize global bot variables
google.resultsPerPage = 1;
var tell = [];
var seen = [];

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

// Export
module.exports = {
	config: config,
	client: bot,
	nickserv: ns,
	moment: moment,
	request: request,
	google: google,
	dom: jsdom,
	seen: {
		list: function() {
			return seen;
		},
		add: function( nick ) {
			return seen.push( nick );
		},
		search: function( nick ) {
			var seenchans = [];

			// Check channels first
			for ( var chan in bot.chans ) {
				// Normalize the case of each user for case insensitive checking
				console.log( 'CHAN:' );
				console.log( chan );
				for ( var user in bot.chans[ chan ].users ) {
					if ( user.toLowerCase() == nick ) {
						seenchans.push( chan );
					}
				}
			}

			if ( seenchans.length ) {
				return nick + ' is currently in: ' + seenchans.join( ', ' );
			} else {
				// Search through seen array
				seen.forEach( function( value, index, array ) {
					if ( value.nick == str ) {
						// Setup the seen message
						var msg = 'Last seen ' + value.nick + ' ';
						var time = ' on ' + value.time;
						switch ( value.event ) {
							case 'nick':
								msg += 'changing their nick to ' + value.newnick + time;
								break;
							case 'part':
								msg += 'parting ' + value.channel + time;
								if ( value.message ) msg += ' with the message: ' + value.message;
								break;
							case 'quit':
								msg += 'quitting IRC with the message: "' + value.reason + '"' + time;
								break;
						}
						return msg;
					}
				});
			}
			return false;
		},
		remove: function( nick ) {
			if ( seen.indexOf( nick ) > -1 ) {
				while ( seen.indexOf( nick ) > -1 ) {
					seen.splice( seen.indexOf( nick ), 1 );
				}
				return true;
			}
			return false;
		}
	},
	tell: {
		list: function() {
			return tell;
		},
		add: function( from, to, message ) {
			if ( config.debug ) console.log( 'bot.tell.add( "' + from + '", "' + to + '", "' + message + '" );' );
			return tell.push({
				from: from,
				to: to,
				message: message,
				date: moment().tz( 'America/New_York' ).format( 'M/DD/YY h:mm:ssa z' )
			});
		},
		check: function( who, channel ) {
			if ( config.debug ) {
				console.log( 'bot.tell.check( "' + who + '" )' );
				console.log( tell );
			}

			// Check for pending .tell commands for this user
			var msg = '';
			var told = [];
			var inbox = [];
			var different = [];

			// Loop through each message and build one big message to deliver to the user
			tell.forEach( function( value, index, array ) {
				if ( value.to == who ) {
					if ( config.debug ) console.log( 'Delivering .tell message #' + index + ' to ' + who );
					var date = moment( value.date ).tz( 'America/New_York' ).format( 'M/DD/YY h:mm:ssa z' );
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
			var remove = this.remove( told );
			console.log( remove );
		},
		remove: function( indices ) {
			if ( config.debug ) console.log( 'bot.tell.remove( ' + indices.join(',') + ' )' );
			if ( indices.length ) {
				indices.forEach( function( value, index, array ) {
					tell.splice( value, 1 );
				});
				return true;
			}
			return false;
		}
	}
}

// Load events
var normalizedPath = require( 'path' ).join( __dirname, 'events' );
require( 'fs' ).readdirSync( normalizedPath ).forEach( function( file ) {
	require( './events/' + file );
});