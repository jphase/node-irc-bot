module.exports = {};

/**
 * this is an array of objects.
 * each object needs a `name` parameter and a `handler` parameter.
 */
module.exports.commands = [
	{
		name: 'kick',
		handler: function( bot, from, to, message, who, str ) {
			// if ( isAdmin ) {
			// 	// Grab the kick message from the end of the string
			// 	msg = str.split(' ');
			// 	if ( msg.length > 1 ) {
			// 		str = msg[0];
			// 		msg.splice( 0, 1 );
			// 		msg = msg.join(' ');
			// 	}

			// 	// Kick the user
			// 	console.log( 'KICK ' + message.args[0] + ' ' + str + ' ' + msg );
			// 	bot.send( 'KICK ' + message.args[0] + ' ' + str + ' ' + msg );
			// }
		}
	}
];

/**
 * this is an array of functions.
 */
module.exports.filters = [];
