import * as config from '../../config';
import * as console from 'console';
import * as irc from 'irc';
import * as nickserv from 'nickserv';

export default (bot: irc.Client) => {
	// Instantiate nickserv to handle communication between bot and services
	const ns: nickserv = new nickserv(config.name, {
		password: config.pass,
		email: config.email
	});
	ns.attach('irc', bot);

	return ([message]: [string]) => {
		ns.identify(config.pass, function (err) {
			if (err && config.debug) {
				console.log(`nickserv error: ${err}`);
			}
			config.channels.forEach(function (value, index, array) {
				bot.join(`${value} ${config.pass}`);
				bot.send(`/msg chanserv op ${value} ${config.name}`);
			});
		});
	};
};
