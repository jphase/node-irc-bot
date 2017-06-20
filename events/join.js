/*
 *	This file handles 'join' events from the irc client
 */

// Includes
var bot = require( '../bot' );

// Join events
bot.client.addListener( 'join', function( channel, who ) {
	if ( bot.config.debug ) console.log( who + ' joined ' + channel );
	// When other users join the channel (not the bot)
	if ( bot.client.nick != who ) {
		// Check for pending .tell commands for this user
		var msg = '';
		var told = [];
		var inbox = [];
		var different = [];

		// Loop through each message and build one big message to deliver to the user
		tell.forEach( function( value, index, array ) {
			if ( value.from == who ) {
				if ( bot.config.debug ) console.log( 'Delivering .tell message #' + index + ' to ' + who );
				var date = bot.moment().tz( 'America/New_York' ).format( 'M/DD/YY h:mm:ssa z' );
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
			bot.client.say( channel, msg );
		} else {
			inbox.forEach( function( value, index, array ) {
				bot.client.say( channel, who + ': ' + value );
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
