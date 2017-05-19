import * as config from '../../config';
import * as console from 'console';
import * as irc from 'irc';

export default (bot: irc.Client) => {
	return ([nick, reason, channels, message]: [string, string, string, string]) => {
		if (config.debug) {
			console.log(message);
		}
	};
};
