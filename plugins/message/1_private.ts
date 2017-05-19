import * as config from '../../config';
import * as console from 'console';
import * as irc from 'irc';

export default (bot: irc.Client, isAdmin: boolean) => {
	return ([from, to, text, message]: [string, string, string, object]) => {
		if (to === bot.nick) {
			// Private message handler
			if (config.debug) {
				console.log('Private Message Handler!!');
			}
			bot.say(from, `Hey ${from}... I'm a bot and I'm not currently programmed to handle your private messages. Check back soon.`);
			return Promise.reject('Private messages to the bot are not allowed.');
		}

		return Promise.resolve([from, to, text, message]);
	}
}
