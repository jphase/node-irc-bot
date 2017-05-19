import * as config from '../../config';
import { getCommand } from '../commands';
import * as console from 'console';
import * as google from '../googleHelper';
import * as irc from 'irc';

export default (bot: irc.Client) => {
	return ([from, to, text, message]: [string, string, string, object]) => {
		return new Promise<any[]>((resolve, reject) => {
			let [cmd, who, trimmed] = getCommand(text);

			if (cmd !== 'y' && cmd !== 'youtube') {
				return resolve([from, to, text, message]);
			}

			if (config.debug) {
				console.log(`[YouTube search] for: ${trimmed}`);
			}

			const query = `${trimmed} site:youtube.com`;
			google.query(resolve, bot, query, from, to, who, text, message)
		});
	}
}