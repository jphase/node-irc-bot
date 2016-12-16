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
		name: 'spotify',
		handler: function( bot, from, to, message, who, str ) {
			if ( config.debug ) console.log( '[Spotify search] for: ' + str );
			google( str + ' site:open.spotify.com', function ( err, next, links ) {
				if ( err && config.debug ) console.error( err );
				if ( config.debug ) console.log( links );
				// Show the search results
				if ( links.length ) {
					bot.say( to, who ? who + ': ' + links[0].link : from + ': ' + links[0].link );
				}
			});
		}
	},
	/**
	 * futher commands as needed for this plugin
	 */
	{
		name: 'spotifyuri',
		handler: function( bot, from, to, message, who, str ) {
			if ( config.debug ) console.log( '[Spotify URI search] for: ' + str );
			google( str + ' site:open.spotify.com', function ( err, next, links ) {
				if ( err && config.debug ) console.error( err );
				if ( config.debug ) console.log( links );
				// Show the search results
				if ( links.length ) {
					var link = links[0].link.split('/');
					link = 'spotify:track:' + link[ link.length - 1 ];
					bot.say( to, who ? who + ': ' + link : from + ': ' + link );
				}
			});
		}
	}
];

/**
 * this is an array of functions.
 */
module.exports.filters = [];
