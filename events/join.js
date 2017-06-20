/*
 *	This file handles 'join' events from the irc client
 */

// Includes
var bot = require( '../bot' );

// Join events
bot.client.addListener( 'join', function( channel, who ) {
	if ( bot.config.debug ) {
		console.log( '!!Join Handler!!' );
		console.log( who + ' joined ' + channel );
	}
	// When other users join the channel (not the bot)
	if ( bot.client.nick != who ) {
		// Check for .tell messages
		bot.tell.check( who, channel );
	} else {
		// Actions to perform when the bot joins the channel
	}
});
