var request = require( 'request' );

module.exports = {};

/**
 * this is an array of objects.
 * each object needs a `name` parameter and a `handler` parameter.
 */
module.exports.commands = [
	{
		name: 'scrape',
		handler: function( bot, from, to, message, who, str ) {
			// if ( isAdmin ) {
			// 	// Setup site and selector
			// 	var selector = str.match( /'(.*)'/ );
			// 	selector = selector[1];
			// 	var site = str.split( ' ' );
			// 	site = site[0];

			// 	// Scrape the site for contents from selector
			// 	request( site, function( error, response, body ) {
			// 		if ( ! error) {
			// 			// Load jsdom for DOM parsing
			// 			jsdom.env(
			// 				body,
			// 				[ 'http://code.jquery.com/jquery-2.2.3.min.js' ],
			// 				function( err, window ) {
			// 					if ( err ) console.log( 'err:', err );
			// 					var $ = window.jQuery;
			// 					console.log( 'body:', $('body').html() );
			// 					var msg = $( selector ).text();
			// 					bot.say( message.args[0], who ? who + ': ' + msg : msg );
			// 				}
			// 			);
			// 		} else {
			// 			console.log( error );
			// 		}
			// 	});
			// }
		}
	}
];

/**
 * this is an array of functions.
 */
module.exports.filters = [];
