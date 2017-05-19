import * as config from '../../config';
import * as console from 'console';
import * as irc from 'irc';

export default (bot: irc.Client) => {
	return ([channel, who]: [string, string]) => {
		if (config.debug) {
			console.log('Part Handler!!');
			console.log(channel);
		}
	};
};