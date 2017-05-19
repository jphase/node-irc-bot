import * as config from '../../config';
import { getCommand } from '../commands';
import * as console from 'console';
import * as google from '../googleHelper';
import * as irc from 'irc';

export default (bot: irc.Client) => {
	return ([from, to, text, message]: [string, string, string, object]) => {
		return new Promise<any[]>((resolve, reject) => {
			let [cmd, who, trimmed] = getCommand(text);

			if (cmd !== 'css') {
				return resolve([from, to, text, message]);
			}

			if (config.debug) {
				console.log(`[CSS search] for: ${trimmed}`);
			}

			const query = `${trimmed} site:https://developer.mozilla.org/en-US/docs/Web/CSS`;
			google.query(resolve, bot, query, from, to, who, text, message)
		});
	}
}
