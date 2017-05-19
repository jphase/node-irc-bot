import * as config from '../../config';
import * as console from 'console';
import * as irc from 'irc';
import * as moment from 'moment';

export default (bot: irc.Client) => {
	return ([from, to, text, message]: [string, string, string, object]) => {
		// Debug incoming messages
		if (config.debug) {
			console.log('============ From ============');
			console.log(from);
			console.log('============  To  ============');
			console.log(to);
			console.log('============ Text ============');
			console.log(text);
			console.log('============ MESG ============');
			console.log(message);
			console.log('==============================');
		}

		// Log all channel messages
		if (config.log) {
			console.log(`[${to}] ${from}: ${text} - ${moment().format()}`);
		}

		return Promise.resolve([from, to, text, message]);
	};
};
