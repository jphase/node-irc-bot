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
		name: 'jquery',
		handler: function( bot, from, to, message, who, str ) {
			if ( config.debug ) console.log( '[jQuery API search] for: ' + str );
			google( str + ' site:api.jquery.com', function ( err, next, links ) {
				if ( err && config.debug ) console.error( err );
				// Show the search results
				bot.say( to, who ? who + ': ' + links[0].link : from + ': ' + links[0].link );
			});
		}
	},
	{
		name: 'jqueryui',
		handler: function( bot, from, to, message, who, str ) {
			if ( config.debug ) console.log( '[jQuery UI API search] for: ' + str );
			google( str + ' site:jqueryui.com', function ( err, next, links ) {
				if ( err && config.debug ) console.error( err );
				// Show the search results
				bot.say( to, who ? who + ': ' + links[0].link : from + ': ' + links[0].link );
			});
		}
	}
];

/**
 * this is an array of functions.
 */
module.exports.filters = [];
