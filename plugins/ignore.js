var config = require( '../config' );

module.exports = {};

/**
 * this is an array of objects.
 * each object needs a `name` parameter and a `handler` parameter.
 */
module.exports.commands = [
	{
		name: 'ignore',
		handler: function( bot, from, to, message, who, str ) {
			// if ( isAdmin ) {
			// 	var msg = '';
			// 	// Ignore the ignore request if they're trying to ignore an admin
			// 	if ( config.admins.length ) {
			// 		config.admins.forEach( function( value, index, array ) {
			// 			if ( value.trim().toLowerCase() == str.toLowerCase() ) {
			// 				msg = str + ' is an admin and admins cannot be ignored';
			// 			}
			// 		});
			// 	}

			// 	// Ignore them if they're not an admin, let the user know they're already ignored otherwise
			// 	if ( ! msg.length && config.ignore.length ) {
			// 		if ( config.ignore.indexOf( str ) > -1 ) {
			// 			msg = str + ' is already being ignored';
			// 		} else {
			// 			config.ignore.push( str );
			// 			msg = str + ' is now being ignored';
			// 		}
			// 	}

			// 	// Send ignored message
			// 	bot.say( message.args[0], msg );
			// }
		}
	},
	{
		name: 'unignore',
		handler: function( bot, from, to, message, who, str ) {
			// if ( isAdmin ) {
			// 	var msg = '';
			// 	// Ignore the ignore request if they're trying to ignore an admin
			// 	if ( config.admins.length ) {
			// 		config.admins.forEach( function( value, index, array ) {
			// 			if ( value.trim().toLowerCase() == str.toLowerCase() ) {
			// 				msg = str + ' is an admin and admins cannot be ignored';
			// 			}
			// 		});
			// 	}

			// 	// Unignore them if they're not an admin, let the user know they're already unignored otherwise
			// 	if ( ! msg.length && config.ignore.length ) {
			// 		if ( config.ignore.indexOf( str ) > -1 ) {
			// 			config.ignore.splice( config.ignore.indexOf( str ), 1 );
			// 			msg = str + ' is no longer being ignored';
			// 		} else {
			// 			msg = str + ' is not being ignored';
			// 		}
			// 	}

			// 	// Send ignored message
			// 	bot.say( message.args[0], msg );
			// }
		}
	}
];

/**
 * this is an array of functions.
 */
module.exports.filters = [];
