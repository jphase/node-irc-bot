import * as config from '../../config';
import * as console from 'console';
import * as irc from 'irc';

export default (bot: irc.Client) => {
	return ([message]: [string]) => {
		if (config.log) {
			console.log('BOT ERROR: ');
			console.log(message);
		}
	};
};
