/*
 *	This file handles 'part' events from the irc client
 */

// Includes
var bot = require( '../bot' );

// Part events
bot.client.addListener( 'part', function( channel, who ) {
	if ( bot.config.debug ) {
		console.log( '!!Part Handler!!' );
		console.log( channel );
	}
	// Add parting user to the seen array
	bot.seen.add({
		event: 'part',
		nick: who,
		channel: channel,
		time: bot.moment().tz( 'America/New_York' ).format( 'MMMM Do YYYY, h:mm:ss a z' )
	});
});