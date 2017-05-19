import * as config from '../../config';
import { getCommand } from '../commands';
import * as console from 'console';
import * as irc from 'irc';
import * as request from 'request';

export default (bot: irc.Client) => {
	return ([from, to, text, message]: [string, string, string, object]) => {
		return new Promise<any[]>((resolve, reject) => {
			let [cmd, who, trimmed] = getCommand(text);

			if (!cmd || cmd !== 'bitcoin' && !cmd.startsWith('bitcoin:')) {
				return resolve([from, to, text, message]);
			}

			if (config.debug) {
				console.log('[Bitcoin Exchange Rate]');
			}

			let currency: string = 'USD';
			// Check if they want a specific exchange rate
			if (text.indexOf('.bitcoin:') === 0) {
				let s = text.split(' ');
				s = s[0].split(':');
				currency = s[1].toUpperCase();
			}

			// Grab the blockchain information for the current currency type
			request('https://blockchain.info/ticker', (error, response, body) => {
				if (error) {
					resolve([from, to, text, message]);
					return;
				}

				let msg = `Unable to read blockchain information for the "${currency}" currency type. Please try again later :(`;

				body = JSON.parse(body);
				if (body.hasOwnProperty(currency)) {
					body = body[currency];
					msg = `Current ${currency} Bitcoin Value: ${body.symbol}${body.last}. [Buy @ ${body.symbol}${body.buy} and Sell @ ${body.symbol}${body.sell}]`;
				}

				const replyTo: string = who || from;
				bot.say(to, `${replyTo}: ${msg}`);

				resolve([from, to, text, message]);
			});
		})
	}
}
