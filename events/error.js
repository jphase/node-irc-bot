/*
 *	This file handles 'error' events from the irc client
 */

// Includes
var bot = require( '../bot' );

// Error handler
bot.client.addListener( 'error', function ( message ) {
	console.error( 'ERROR: ' );
	console.error( message );
});
