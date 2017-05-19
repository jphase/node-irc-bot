import * as config from '../../config';
import { getCommand } from '../commands';
import * as console from 'console';
import * as irc from 'irc';

export default (bot: irc.Client) => {
	return ([from, to, text, message]: [string, string, string, object]) => {
		return new Promise<any[]>((resolve, reject) => {
			let [cmd, who, trimmed] = getCommand(text);

			if (cmd !== 'lmgtfy') {
				return resolve([from, to, text, message]);
			}

			if (config.debug) {
				console.log(`[lmgtfy.com search] for: ${trimmed}`);
			}

			// Show the search results
			const query: string = encodeURIComponent(trimmed);
			const link: string = `http://lmgtfy.com/?q=${query}`;
			const replyTo: string = who || from;

			bot.say(to, `${replyTo}: ${link}`);
			return resolve([from, to, text, message]);
		})
	}
}
