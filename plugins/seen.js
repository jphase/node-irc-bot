var config = require( '../config' );

module.exports = {};

var seen = [];

/**
 * this is an array of objects.
 * each object needs a `name` parameter and a `handler` parameter.
 */
module.exports.commands = [
	{
		name: 'seen',
		handler: function( bot, from, to, message, who, str ) {
			if ( from != str ) {
				var none = true;
				if ( config.debug ) {
					console.log( '[Seen search] for: ' + str );
					console.log( bot.chans );
					console.log( 'search through:' );
					console.log( config.channels );
				}
				// Check channels first
				config.channels.forEach( function( pvalue, pindex, parray ) {
					// Normalize the case of each user for case insensitive checking
					var chanusers = [];
					for ( var user in bot.chans[ pvalue ].users ) {
						chanusers.push( user.toLowerCase() );
					}

					// Loop through case normalized usernames
					for ( var user in bot.chans[ pvalue ].users ) {
						if ( none && bot.chans[ pvalue ].users.hasOwnProperty( str ) ) {
							bot.say( to, who ? who + ': ' + str + ' is currently in ' + pvalue : from + ': ' + str + ' is currently in ' + pvalue );
							none = false;
						}
					}
				});
				// search through seen array
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
						bot.say( to, msg );
						none = false;
					}
				});
				if ( none ) bot.say( to, who ? who + ': ' + 'I haven\'t seen ' + str : from + ': ' + 'I haven\'t seen ' + str );
			} else {
				bot.say( to, 'That\'s hilarious ' + from + '...' );
			}
		}
	}
];

module.exports.listen = function(bot) {
	bot.addListener('part', function(channel, who) {
		// Add parting user to the seen array
		seen.push({
			event: 'part',
			nick: who,
			channel: channel,
			time: moment().tz( 'America/New_York' ).format( 'MMMM Do YYYY, h:mm:ss a z' )
		});
	});

	bot.addListener( 'quit', function( nick, reason, channels, message ) {
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

	bot.addListener( 'nick', function ( oldnick, newnick, channels, message ) {
		seen.push({
			event: 'nick',
			nick: oldnick,
			newnick: newnick,
			channel: channels,
			message: message,
			time: moment().tz( 'America/New_York' ).format( 'MMMM Do YYYY, h:mm:ss a z' )
		});
	});
}
