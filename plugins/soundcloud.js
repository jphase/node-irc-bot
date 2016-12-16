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
		name: 'soundcloud',
		handler: function( bot, from, to, message, who, str ) {
			if ( config.debug ) console.log( '[SoundCloud search] for: ' + str );
			google( str + ' site:soundcloud.com', function ( err, next, links ) {
				if ( err && config.debug ) console.error( err );
				if ( config.debug ) console.log( links );
				// Show the search results
				if ( links.length ) {
					bot.say( to, who ? who + ': ' + links[0].link : from + ': ' + links[0].link );
				}
			});
		}
	}
];

/**
 * this is an array of functions.
 */
module.exports.filters = [];
