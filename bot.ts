import Plugins from './plugins';
import * as irc from 'irc';
import * as moment from 'moment';
import * as config from './config';

let bot: irc.Client;
Plugins().then((plugins) => {
	// Create the bot
	var bot = new irc.Client(config.server, config.name, {
		// channels: config.channels,
		localAddress: config.localAddress,
		realName: config.realName,
		autoRejoin: true
	});

	for (let messageType in plugins) {
		if (config.debug) {
			console.log(`registering plugins for ${messageType}`)
		}
		bot.addListener(messageType, (...args) => {
			var isAdmin = false;
			if (config.admins.length) {
				config.admins.forEach(function (value, index, array) {
					if (value.trim().toLowerCase() === args[0].trim().toLowerCase()) {
						isAdmin = true;
					}
				});
			}

			const p: Promise<any[]> = Promise.resolve(args);
			for (let plugin of plugins[messageType]) {
				p.then(plugin(bot, isAdmin));
			}
		});
	}
}, (reason) => {
	console.log(`Failed to load any plugins, quitting: ${reason}`);
});
