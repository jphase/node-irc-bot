var config = require( '../config' );

var google = require( 'google' );
google.resultsPerPage = 1;

module.exports = {};

/**
 * this is an array of objects.
 * each object needs a `name` parameter and a `handler` parameter.
 */
module.exports.commands = [
	{
		name: ['wps', 'wpseek'],
		handler: function( bot, from, to, message, who, str ) {
			if ( config.debug ) console.log( '[wpseek.com search] for: ' + str );
			google( str + ' site:wpseek.com', function ( err, next, links ) {
				if ( err && config.debug ) console.error( err );
				// Show the search results
				if ( links && links[0].hasOwnProperty('link') ) {
					var msg = links[0].link;
				} else {
					var msg = 'weird... I had troubles getting a link for "' + str + ' site:wpseek.com"';
				}
				bot.say( to, who ? who + ': ' + msg : from + ': ' + msg );
			});
		}
	}
];

/**
 * this is an array of functions.
 */
module.exports.filters = [];
