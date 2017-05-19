import * as config from '../../config';
import { getCommand } from '../commands';
import * as console from 'console';
import * as irc from 'irc';
import * as request from 'request';

export default (bot: irc.Client) => {
	return ([from, to, text, message]: [string, string, string, object]) => {
		return new Promise<any[]>((resolve, reject) => {
			let [cmd, who, trimmed] = getCommand(text);

			if (cmd !== 'count') {
				return resolve([from, to, text, message]);
			}

			if (config.debug) {
				console.log('[WordPress Count]');
			}

			request('https://wordpress.org/download/counter/?ajaxupdate=1', (error, response, body) => {
				if (error) {
					resolve([from, to, text, message]);
					return;
				}

				const msg: string = `WordPress has been downloaded ${body} times.`;
				const replyTo: string = who || from;
				bot.say(to, `${replyTo}: ${msg}`);

				resolve([from, to, text, message]);
			});
		})
	}
}
