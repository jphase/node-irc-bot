import { getCommand } from '../commands';
import * as irc from 'irc';

export default (bot: irc.Client) => {
	return ([from, to, text, message]: [string, string, string, object]) => {
		return new Promise<any[]>((resolve, reject) => {
			let [cmd, who, trimmed] = getCommand(text);

			if (cmd !== 'flip' && cmd !== 'flip!') {
				return resolve([from, to, text, message]);
			}

			let prefix = '';
			if (who) {
				prefix = `${who}: `;
			}

			let msg = '';
			if (cmd === 'flip!') {
				msg = '┻━┻︵  \\(°□°)/ ︵ ┻━┻';
			} else if (cmd === 'flip') {
				msg = '(╯°□°）╯︵ ┻━┻';
			}

			bot.say(to, `${prefix}${msg}`);
			resolve([from, to, text, message]);
		});
	}
}
