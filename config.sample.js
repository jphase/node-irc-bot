// Config (see https://github.com/martynsmith/node-irc/blob/master/lib/irc.js for full config options)
module.exports = {
	localAddress: '1.2.3.4',        // IP address to bind to (if there are multiple ip addresses on your server you can specify this, otherwise comment it out)
	admins: [ 'adminNick1' ],       // A list of admin users (beta - doesn't do anything but check the nick right now - need to add ident check)
	ignore: [ 'ignoredNick1' ],     // List of nicknames to ignore commands from
	channels: [ '#yourchannel' ],   // List of channels to join
	muted: [ '#mutedchannel1' ],    // List of channels to not watch for commands
	server: 'irc.freenode.net',     // IRC server
	name: 'your-bot-nick',          // The nickname of your bot
	pass: 'your-bots-password',     // The password of your bot
	email: 'your-bots@email.com',   // The email address of your bot
	floodMessages: 3,               // How many messages trigger the flood control (beta - doesn't do anything yet)
	floodTimeout: 3000,             // The timeout between messages. This combined with floodMessages will determine the flood threshold
	autoRejoin: true,				// Optional boolean to toggle auto rejoin on kick
	log: true,                      // Optional boolean to toggle logging
	debug: false                    // Optional boolean to toggle debug logging
};