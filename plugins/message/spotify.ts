import * as config from '../../config';
import { getCommand } from '../commands';
import * as console from 'console';
import * as google from '../googleHelper';
import * as irc from 'irc';

export default (bot: irc.Client) => {
	return ([from, to, text, message]: [string, string, string, object]) => {
		return new Promise<any[]>((resolve, reject) => {
			let [cmd, who, trimmed] = getCommand(text);

			if (cmd !== 'spotify') {
				return resolve([from, to, text, message]);
			}

			if (config.debug) {
				console.log(`[Spotify search] for: ${trimmed}`);
			}

			const query = `${trimmed} site:open.spotify.com`;
			google.query(resolve, bot, query, from, to, who, text, message)
		})
	}
}
