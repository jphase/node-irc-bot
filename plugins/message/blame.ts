import * as config from '../../config';
import { getCommand } from '../commands';
import * as console from 'console';
import * as irc from 'irc';

export default (bot: irc.Client) => {
	return ([from, to, text, message]: [string, string, string, object]) => {
		return new Promise<any[]>((resolve, reject) => {
			let [cmd, who, trimmed] = getCommand(text);

			if (cmd !== 'jquery') {
				return resolve([from, to, text, message]);
			}

			if (config.debug) {
				console.log(`[jQuery API search] for: ${trimmed}`);
			}

			let prefix = '';
			if (who) {
				prefix = `${who}: `;
			}

			let msg = `${prefix}It's all ${trimmed}'s fault!`;
			if (trimmed === bot.nick) {
				msg = "That's hilarious...";
			}

			bot.say(to, msg);
			resolve([from, to, text, message])
		})
	}
}
