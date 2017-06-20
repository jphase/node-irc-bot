/*
 *	This file handles 'quit' events from the irc client
 */

// Includes
var bot = require( '../bot' );

// Quit events
bot.client.addListener( 'quit', function( nick, reason, channels, message ) {
	if ( bot.config.debug ) console.log( message );
	// Add parting user to the seen array
	bot.seen.add({
		event: 'quit',
		nick: nick,
		channel: channels,
		reason: reason,
		message: message,
		time: bot.moment().tz( 'America/New_York' ).format( 'MMMM Do YYYY, h:mm:ss a z' )
	});
});