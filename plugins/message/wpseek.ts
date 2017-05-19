import * as config from '../../config';
import { getCommand } from '../commands';
import * as console from 'console';
import * as google from 'google';
import * as irc from 'irc';

google.resultsPerPage = 1;

export default (bot: irc.Client) => {
	return ([from, to, text, message]: [string, string, string, object]) => {
		return new Promise<any[]>((resolve, reject) => {
			let [cmd, who, trimmed] = getCommand(text);

			if (cmd !== 'wps' && cmd !== 'wpseek') {
				return resolve([from, to, text, message]);;
			}

			if (config.debug) {
				console.log(`[wpseek.com search] for: ${trimmed}`);
			}

			const query = `${trimmed} site:wpseek.com`;
			google.query(resolve, bot, query, from, to, who, text, message)
		});
	}
}
