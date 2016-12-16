module.exports = {};

function sayit( msg ) {  {
	return funtion( bot, from, to, message, who, str ) {
		if (!msg) {
			msg = str;
		}
		bot.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
	}
}
/**
 * this is an array of objects.
 * each object needs a `name` parameter and a `handler` parameter.
 */
module.exports.commands = [
	{ name: '_',                          handler: sayit('Check out the Underscores base theme http://underscores.me') },
	{ name: 'ask',                        handler: sayit('Go ahead and ask your question and someone will assist if they are able.') },
	{ name: 'asking',                     handler: sayit('When asking a question make sure to include the following information: 1) What you want to achieve. 2) How you are attempting to achieve it. 3) What you expect to happen. 4) What is actually happening.') },
	{ name: 'cry',                        handler: sayit('(╯︵╰,)') },
	{ name: 'fart',                       handler: sayit('💩💨💨💨💨') },
	{ name: 'finger',                     handler: sayit('╭∩╮（︶︿︶）╭∩╮') },
	{ name: 'first',                      handler: sayit('Please attempt to disable all plugins, and use one of the default (Twenty*) themes. If the problem goes away, enable them one by one to identify the source of your troubles.') },
	{ name: 'hierarchy',                  handler: sayit('Please refer to the WordPress template hierarchy https://developer.wordpress.org/themes/basics/template-hierarchy/') },
	{ name: 'inspect',                    handler: sayit('Please use the built-in Developer Tools of your browser to fix problems with your website. Right click your page and pick Inspect Element (Cr, FF, Op) or press F12-button (IE) to track down CSS problems. Use the console to see JavaScript bugs.') },
	{ name: 'linking',                    handler: sayit('When linking to your website while asking for help, please tell us specifically where to look on the website and what to click to initiate the interaction you are trying to fix') },
	{ name: 'paste',                      handler: sayit('Please use http://wpbin.io to paste your multi-line code samples') },
	{ name: 'poop',                       handler: sayit('💩') },
	{ name: 'say',                        handler: sayit(false) },
	{ name: 'shrug',                      handler: sayit('¯\\_(ツ)_/¯') },
	{ name: 'wmojis',                     handler: sayit('😀😬😁😂😃😄😅😆😌😋🙃🙂😊😉😇😍😘😗😙😚😜😝😛😑😐😶😏🤗😎🤓🤑😒🙄🤔😳😞😟😠😡😩😫😖😣☹🙁😕😔😤😮😱😨😰😯😦😧😢😥😪😓😭😵😲🤐👿😈💩💤😴🤕🤒😷👹👺💀👻👽🤖😺😸🙌😾😿🙀😽😼😻😹🙌🏻🙌🏼🙌🏽🙌🏾🙌🏿👏👏🏻👏🏼👏🏽👏🏾👏🏿') },
	{ name: 'yolo',                       handler: sayit('Yᵒᵘ Oᶰˡʸ Lᶤᵛᵉ Oᶰᶜᵉ') },
	{ name: ['calm', 'chill'],            handler: sayit('┬──┬ ノ(゜-゜ノ)') },
	{ name: ['dance', 'party', 'boogie'], handler: sayit('┏(-_-)┛┗(-_-﻿)┓┗(-_-)┛┏(-_-)┓') },
	{ name: ['moving', 'move'],           handler: sayit('If you rename the WordPress directory on your server, switch ports or change the hostname http://codex.wordpress.org/Moving_WordPress applies') },

	{
		name: 'blame',
		handler: function(bot, from, to, message, who, str) {
			if ( str == bot.nick ) {
				var msg = "That's hilarious...";
			} else {
				var msg = who ? who + ': ' + 'It\'s all ' + str + '\'s fault!' : 'It\'s all ' + str + '\'s fault!';
			}
			bot.say( message.args[0], msg );
		}
	},
	{
		name: 'flip',
		handler: function(bot, from, to, message, who, str) {
			var prefix = who ? who + ': ' : '';
			if ( str == '.flip!' ) {
				var msg = prefix + '┻━┻︵  \\(°□°)/ ︵ ┻━┻';
			} else {
				var msg = prefix + '(╯°□°）╯︵ ┻━┻';
			}
			bot.say( message.args[0], msg );
		}
	}
];

/**
 * this is an array of functions.
 */
module.exports.filters = [];
