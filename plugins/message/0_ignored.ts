import * as config from '../../config';
import * as irc from 'irc';

export default (bot: irc.Client, isAdmin: boolean) => {
	return ([from, to, text, message]: [string, string, string, object]) => {
		// Admins are never ignored
		if (isAdmin) {
			return [from, to, text, message];
		}

		from = from.trim().toLowerCase();

		// Check for ignored
		if (config.ignore.indexOf(from) > -1) {
			return Promise.reject(`${from} has been ignored by an admin`);
		}

		// Check for muted
		if (config.muted.indexOf(from) > -1) {
			return Promise.reject(`${from} has been automatically muted`);
		}

		return Promise.resolve([from, to, text, message]);
	};
};
