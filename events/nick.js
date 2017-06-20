/*
 *	This file handles 'nick' events from the irc client
 */

// Includes
var bot = require( '../bot' );

// Nick change events
bot.client.addListener( 'nick', function ( oldnick, newnick, channels, message ) {
	// Update seen array if necessary
	bot.seen.push({
		event: 'nick',
		nick: oldnick,
		newnick: newnick,
		channel: channels,
		message: message,
		time: moment().tz( 'America/New_York' ).format( 'MMMM Do YYYY, h:mm:ss a z' )
	});
});