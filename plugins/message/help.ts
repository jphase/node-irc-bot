import { getCommand } from '../commands';
import * as console from 'console';
import * as irc from 'irc';

export default (bot: irc.Client) => {
	return ([from, to, text, message]: [string, string, string, object]) => {
		let [cmd, who, trimmed] = getCommand(text);

		if (cmd === 'help') {
			const commands = ['.g', '.c', '.p', '.seen', '.tell', '.first', '.paste', '.hierarchy', '._', '.blame', '.ask', '.say'];
			const cmdStr = commands.join(', ');

			const replyTo: string = who || from;

			bot.say(replyTo, `Available Commands: ${cmdStr}`);
			console.log(`sending help message to: ${replyTo}`);
		}

		return Promise.resolve([from, to, text, message]);
	}
}
