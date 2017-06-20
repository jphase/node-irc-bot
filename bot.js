// Includes
var config = require( './config' );
var irc = require( 'irc' );
var nickserv = require( 'nickserv' );
var google = require( 'google' );
var request = require( 'request' );
var jsdom = require( 'jsdom' );
var moment = require( 'moment-timezone' );

// Initialize global bot variables
google.resultsPerPage = 1;
var tell = [];
var seen = [];
var flood = [];

// Create the bot
var bot = new irc.Client( config.server, config.name, {
	// channels: config.channels,
	// localAddress: config.localAddress,
	realName: config.realName,
	autoRejoin: true
});

// Instantiate nickserv to handle communication between bot and services
var ns = new nickserv( config.name, {
	password: config.pass,
	email: config.email
});
ns.attach( 'irc', bot );

// Export
module.exports = {
	config: config,
	client: bot,
	nickserv: ns,
	moment: moment,
	request: request,
	google: google,
	dom: jsdom,
	seen: seen,
	tell: tell
}

// Load events
var normalizedPath = require( 'path' ).join( __dirname, 'events' );
require( 'fs' ).readdirSync( normalizedPath ).forEach( function( file ) {
	require( './events/' + file );
});