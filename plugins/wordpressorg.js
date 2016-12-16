var config = require( '../config' );

var request = require( 'request' );
var google = require( 'google' );
google.resultsPerPage = 1;

module.exports = {};

/**
 * this is an array of objects.
 * each object needs a `name` parameter and a `handler` parameter.
 */
module.exports.commands = [
	{
		name: [ 'codex', 'c' ],
		handler: function( bot, from, to, message, who, str ) {
			if ( config.debug ) console.log( '[Codex search] for: ' + str );

			// // Scrape the site for contents from selector
			// var site = 'http://google.com/search?q=' + encodeURIComponent( str + ' site:wordpress.org inurl:("codex.wordpress.org"|"developer.wordpress.org")' );
			// request( site, function( error, response, body ) {
			// 	if ( ! error) {
			// 		// Load jsdom for DOM parsing
			// 		jsdom.env(
			// 			body,
			// 			[ 'http://code.jquery.com/jquery-2.2.3.min.js' ],
			// 			function( err, window ) {
			// 				if ( err ) console.log( 'err:', err );
			// 				var $ = window.jQuery;
			// 				console.log($('#ires .g:first .kv'));
			// 				var msg = $('#ires .g:first .kv').text();
			// 				bot.say( message.args[0], who ? who + ': ' + msg : msg );
			// 			}
			// 		);
			// 	} else {
			// 		console.log( error );
			// 	}
			// });


			google( str + ' site:wordpress.org inurl:("codex.wordpress.org"|"developer.wordpress.org")', function ( err, next, links ) {
				if ( err && config.debug ) console.error( err );
				// Show the search results
				if ( links && links[0].hasOwnProperty('link') ) {
					bot.say( to, who ? who + ': ' + links[0].link : from + ': ' + links[0].link );
				} else {
					bot.say( to, from + ': weird... your search for: "' + str + ' site:wordpress.org inurl:("codex.wordpress.org"|"developer.wordpress.org")" yielded this: ' + JSON.stringify( links ) );
				}
			});
		}
	},
	{
		name: 'count',
		handler: function( bot, from, to, message, who, str ) {
			if ( config.debug ) console.log( '[WordPress Count]' );
			request( 'https://wordpress.org/download/counter/?ajaxupdate=1', function( error, response, body ) {
				if ( ! error) {
					var msg = 'WordPress has been downloaded ' + body + ' times.';
					bot.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
				}
			});
		}
	},
	{
		name: 'p',
		handler: function( bot, from, to, message, who, str ) {
			if ( config.debug ) console.log( '[Plugin search] for: ' + str );
			google( str + ' wordpress plugin site:https://wordpress.org/plugins', function ( err, next, links ) {
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
