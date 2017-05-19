import * as config from '../config';

export function getCommand(text: any): [string, string, string] {
	// Break up command string
	const command = text.match(/^\.(\S+)/);
	if (config.debug) {
		console.log(command);
	}

	let cmd: string, str: string, who: string;

	// Parse commands
	if (command && command.length) {
		// Initialize
		cmd = command[1];
		str = command.input.replace(`${command[0]} `, '');
		[, who] = str.split('> ');
		if (who) {
			str = str.replace(` > ${who}`, '');
		}

		// Debug
		if (config.debug) {
			console.log('cmd: ' + cmd);
			console.log('str: ' + str);
			console.log('who: ' + who);
		}
	}

	return [cmd, who, str];
}
