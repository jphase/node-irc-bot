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
		name: [ 'g', 'google' ],
		handler: function( bot, from, to, message, who, str ) {
			if ( config.debug ) console.log( '[Google search] for: ' + str );
			google( str, function ( err, next, links ) {
				if ( err && config.debug ) console.error( err );
				// Show the search results
				if ( links && links[0].hasOwnProperty('link') ) {
					var msg = who ? who + ': ' + links[0].link : from + ': ' + links[0].link;
				} else {
					var msg = who ? who + ': no Google results found for "' + str + '"' : from + ': no Google results found for "' + str + '"';
				}
				bot.say( to, msg );
			});
		}
	},
	{
		name: ['l', 'lmgtfy'],
		handler: function( bot, from, to, message, who, str ) {
			if ( config.debug ) console.log( '[lmgtfy.com search] for: ' + str );
			// Show the search results
			var link = 'http://lmgtfy.com/?q=' + encodeURIComponent( str );
			bot.say( to, who ? who + ': ' + link : from + ': ' + link );
		}
	}
];

/**
 * this is an array of functions.
 */
module.exports.filters = [];
