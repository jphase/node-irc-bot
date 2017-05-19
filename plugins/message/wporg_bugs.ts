import * as config from '../../config';
import * as console from 'console';
import * as irc from 'irc';
import * as request from 'request';

export default (bot: irc.Client) => {
	return ([from, to, text, message]: [string, string, string, object]) => {
		return new Promise<any[]>((resolve, reject) => {
			const bugs = text.match(/(#|(bug\s+)|(https?:\/\/core\.trac\.wordpress\.org\/ticket\/))(\d+)/ig);

			if (bugs === null || !bugs.length) {
				return Promise.resolve([from, to, text, message]);
			}

			if (config.debug) {
				console.log(bugs);
			}

			let promises: Promise<void>[] = new Array<Promise<void>>();
			bugs.forEach((bug) => {
				if (config.debug) {
					console.log(bug);
				}

				bug = bug.replace(/(#|(bug\s+)|(https?:\/\/core\.trac\.wordpress\.org\/ticket\/))/i, '');

				promises.push(new Promise<void>((resolve, reject) => {
					request(`https://core.trac.wordpress.org/ticket/${bug}?format=rss`, (error, response, body) => {
						if (error) {
							resolve();
							return;
						}

						var title = body.match(/<title>(.*?)<\/title>/i);
						if (config.debug) {
							console.log(title[1]);
						}

						bot.say(to, title[1]);
						resolve();
					});
				}))
			})

			Promise.all(promises).then(() => {
				return resolve([from, to, text, message]);
			});
		});
	}
}
