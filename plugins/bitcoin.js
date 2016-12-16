var config = require( '../config' );

var request = require( 'request' );

module.exports = {};

/**
 * this is an array of objects.
 * each object needs a `name` parameter and a `handler` parameter.
 */
module.exports.commands = [
	{
		name: 'bitcoin',
		handler: function( bot, from, to, message, who, str ) {
			if ( config.debug ) console.log( '[Bitcoin Exchange Rate]' );
			// Check if they want a specific exchange rate
			if ( str.indexOf('.bitcoin:') == 0 ) {
				var currency = str.split(' ');
				currency = currency[0].split(':');
				currency = currency[1].toUpperCase();
			} else {
				var currency = 'USD';
			}
			// Grab the blockchain information for the current currency type
			request( 'https://blockchain.info/ticker', function( error, response, body ) {
				if ( ! error) {
					body = JSON.parse( body );
					if ( body.hasOwnProperty( currency ) ) {
						body = body[ currency ];
						var msg = 'Current ' + currency + ' Bitcoin Value: ' + body.symbol + body.last + '. [Buy @ ' + body.symbol + body.buy + ' and Sell @ ' + body.symbol + body.sell + ']';
					} else {
						var msg = 'Unable to read blockchain information for the "' + currency + '" currency type. Please try again later :(';
					}
					bot.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
				}
			});
		}
	}
];
