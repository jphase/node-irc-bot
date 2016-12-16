var config = require( '../config' );

var request = require( 'request' );

module.exports = {};

/**
 * this is an array of objects.
 * each object needs a `name` parameter and a `handler` parameter.
 */
module.exports.commands = [
	{
		name: 'math',
		handler: function( bot, from, to, message, who, str ) {
			if ( config.debug ) console.log( '[Math Command]' );
			// Get the endpoint
			var endpoint = 'http://api.mathjs.org/v1/?expr=' + encodeURIComponent( str );
			// Grab the blockchain information for the current currency type
			request( endpoint, function( error, response, body ) {
				if ( ! error) {
					var msg = body;
					bot.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
				}
			});
		}
	}
];
