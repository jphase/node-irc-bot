var config = require( '../config' );

module.exports = {};

var tell = [];

/**
 * this is an array of objects.
 * each object needs a `name` parameter and a `handler` parameter.
 */
module.exports.commands = [
	{
		name: 'inbox',
		handler: function( bot, from, to, message, who, str ) {
			// Check for pending .tell commands for this user
			var msg = '';
			var told = [];
			var inbox = [];

			// Loop through each message and build one big message to deliver to the user
			tell.forEach( function( value, index, array ) {
				if ( value.from == from && told.length < 4 ) {
					if ( config.debug ) console.log( 'Delivering .tell message #' + index + ' to ' + from );
					msg = '[' + value.from + ' ' + value.date + ']: ' + value.message;
					inbox.push( msg );
					told.push( index );
				}
			});

			// Display their messages without flooding the channel
			if ( inbox.length > 4 ) {
				if ( config.debug ) console.log( '> 4 messages in inbox' );
				for ( var i = 0; i < 4; i++ ) {
					bot.say( message.args[0], from + ': ' + inbox[ i ] );
				}
				for ( var i = 0; i < 4; i++ ) {
					inbox.shift();
				}
			} else if ( ! inbox.length ) {
				bot.say( message.args[0], from + ': you have no messages in your inbox' );
			} else {
				if ( config.debug ) console.log( inbox.length + ' messages in inbox' );
				inbox.forEach( function( value, index, array ) {
					bot.say( message.args[0], from + ': ' + inbox[ index ] );
				});
			}

			// Remove the messages that have been delivered
			if ( told.length ) {
				told.forEach( function( value, index, array ) {
					tell.splice( value, 1 );
				});
			}
		}
	},
	{
		name: 'tell',
		handler: function( bot, from, to, message, who, str ) {
			// Tell command
			// Make sure their message is setup correctly
			var sendto = str.split(' ')[0];
			// Add .tell message to the tell array
			if ( config.debug ) console.log( '[Tell ' + sendto + '] ' + str  );
			if ( tell.length ) {
				var already = false;
				tell.forEach( function( value, index, array ) {
					if ( value.from == from && value.message == str ) {
						already = true;
					}
				});
				if ( ! already ) {
					msg = 'I\'ll deliver your message to ' + sendto + ' the next time they join.';
					tell.push({ from: from, message: str.replace( sendto + ' ', '' ), date: moment().tz( 'America/New_York' ).format( 'M/DD/YY h:mm:ssa z' ) });
				}
			} else {
				msg = 'I\'ll deliver your message to ' + sendto + ' the next time they join.';
				tell.push({ from: from, message: str.replace( sendto + ' ', '' ), date: moment().tz( 'America/New_York' ).format( 'M/DD/YY h:mm:ssa z' ) });
			}
			var msg = who ? who + ': ' + msg : from + ': ' + msg;
			bot.say( message.args[0], msg );
		}
	}
];

/**
 * this is an array of functions.
 */
module.exports.filters = [];

module.exports.listen = function(bot) {
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
}
