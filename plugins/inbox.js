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
