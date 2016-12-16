module.exports = {};

/**
 * this is an array of objects.
 * each object needs a `name` parameter and a `handler` parameter.
 */
module.exports.commands = [
	{
		/**
		 * command invokation text without leading dot
		 */
		name: 'command',

		/**
		 * handler function to be executed for this command
		 */
		handler: function( bot, from, to, message, who, str ) {}
	},
	/**
	 * futher commands as needed for this plugin
	 */
	{
		name: 'command2',
		handler: function( bot, from, to, message, who, str ) {}
	}
];

/**
 * this is an array of functions.
 */
module.exports.filters = [
	/**
	 * handler function for filter
	 */
	function(bot, data) {},
	/**
	 * another filter function
	 */
	function(bot, data) {}
];
