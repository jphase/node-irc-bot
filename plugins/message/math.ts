import * as config from '../../config';
import { getCommand } from '../commands';
import * as console from 'console';
import * as irc from 'irc';
import * as request from 'request';

export default (bot: irc.Client) => {
	return ([from, to, text, message]: [string, string, string, object]) => {
		return new Promise<any[]>((resolve, reject) => {
			let [cmd, who, trimmed] = getCommand(text);

			if (cmd !== 'math') {
				return resolve([from, to, text, message]);
			}

			if (config.debug) {
				console.log('[Math Command]');
			}

			// Get the endpoint
			const query: string = encodeURIComponent(trimmed);
			const endpoint: string = `http://api.mathjs.org/v1/?expr=${query}`;
			// Grab the blockchain information for the current currency type
			request(endpoint, (error, response, body) => {
				if (error) {
					resolve([from, to, text, message]);
					return;
				}

				const replyTo: string = who || from;
				bot.say(from, `${replyTo}: ${body}`);
				resolve([from, to, text, message])
			});
		})
	}
}

