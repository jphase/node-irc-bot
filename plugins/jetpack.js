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
		name: 'jetpack',
		handler: function( bot, from, to, message, who, str ) {
			if ( config.debug ) console.log( '[JetPack search] for: ' + str );
			google( str + ' site:developer.jetpack.com', function ( err, next, links ) {
				if ( err && config.debug ) console.error( err );
				// Show the search results
				if ( typeof links[0] == 'undefined' ) {
					var msg = who ? who + ': no results found for "' + str + '" on developer.jetpack.com' : from + ': no results found for "' + str + '" on developer.jetpack.com';
				} else {
					var msg = who ? who + ': ' + links[0].link : from + ': ' + links[0].link;
				}
				bot.say( to, msg );
			});
		}
	}
];

/**
 * this is an array of functions.
 */
module.exports.filters = [];
