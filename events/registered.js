/*
 *	This file handles 'registered' events from the irc client
 */

// Includes
var bot = require( '../bot' );

// Connected events
bot.client.addListener( 'registered', function ( message ) {
	bot.nickserv.identify( bot.config.pass, function( err ) {
		if ( err && bot.config.debug ) console.log( 'nickserv error: ' + err );
		bot.config.channels.forEach( function( value, index, array ) {
			bot.client.join( value + ' ' + bot.config.pass );
			bot.client.send( '/msg chanserv op ' + value + ' ' + bot.config.name );
		});
	});
});