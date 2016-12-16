var config = require( '../config' );

var request = require( 'request' );

module.exports = {};

/**
 * this is an array of objects.
 * each object needs a `name` parameter and a `handler` parameter.
 */
module.exports.commands = [
	{
		name: 'weather',
		handler: function( bot, from, to, message, who, str ) {
			// 	if ( config.hasOwnProperty('openweathermap_api_key') ) {
			// 		if ( config.debug ) console.log( '[Weather Command]' );
			// 		// Set the API endpoint
			// 		var endpoint = 'http://api.openweathermap.org/data/2.5/weather?q=London&APPID=' + config.openweathermap_api_key;
			// 		// Grab the blockchain information for the current currency type
			// 		request( endpoint, function( error, response, body ) {
			// 			if ( ! error) {
			// 				body = JSON.parse( body );
			// 				if ( body.hasOwnProperty('name') ) {
			// 					var wind = body.wind.speed;
			// 					var msg = 'Current weather for ' + body.name + ': '
			// 					var msg = 'Current ' + currency + ' Bitcoin Value: ' + body.symbol + body.last + '. [Buy @ ' + body.symbol + body.buy + ' and Sell @ ' + body.symbol + body.sell + ']';
			// 				} else {
			// 					var msg = 'Unable to read blockchain information for the "' + currency + '" currency type. Please try again later :(';
			// 				}
			// 				bot.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
			// 			}
			// 		});
			// 	}
		}
	}
];
