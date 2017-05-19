import * as config from '../config';
import * as console from 'console';
import * as fs from 'fs';

class PluginFuncs {
	[key: string]: Function[];
}

export default function() {
	const re = /(\.js)$/;

	return new Promise<PluginFuncs>((resolve, reject) => {
		fs.readdir(__dirname, (err, files) => {
			if (err) {
				reject(err);
				return;
			}

			let promises: Promise<PluginFuncs>[] = new Array<Promise<PluginFuncs>>();

			files.forEach((file) => {
				promises.push(new Promise<PluginFuncs>((resolve, reject) => {
					const filepath = `${__dirname}/${file}`;
					fs.stat(filepath, (err, stats) => {
						if (err) {
							if (config.debug) {
								console.log(`${filepath}: ${err}`)
							}
							resolve();
							return;
						}

						if (stats.isDirectory()) {
							fs.readdir(filepath, (err, files) => {
								if (err) {
									if (config.debug) {
										console.log(`${filepath}: ${err}`)
									}
									resolve();
									return;
								}

								let plugins: PluginFuncs = new PluginFuncs();
								files.forEach((plugin) => {
									if (plugin.match(re)) {
										if (config.debug) {
											console.log(`adding plugin ${file}/${plugin}`);
										}
										if (!plugins[file]) {
											plugins[file] = new Array<Function>();
										}
										plugins[file].push(require(`./${file}/${plugin}`).default);
									}
								});
								resolve(plugins);
							});
						} else {
							resolve();
						}
					});
				}));
			});

			Promise.all(promises).then((values) => {
				let plugins = new PluginFuncs();
				for (let p of values) {
					for (let key in p) {
						if (key && p[key]) {
							plugins[key] = p[key];
						}
					}
				}
				resolve(plugins);
			}).catch((reason) => {
				reject(reason);
			});
		});
	})
}
