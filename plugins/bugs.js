var config = require( '../config' );

var request = require( 'request' );

module.exports.filters = [];

module.exports.filters.push( function( bot, message, text ) {
	var bugs = text.match( /(#|(bug\s+)|(https?:\/\/core\.trac\.wordpress\.org\/ticket\/))(\d+)/ig );
	if ( bugs !== null && bugs.length ) {
		if ( config.debug ) console.log( bugs );
		bugs.forEach( function( bug ) {
			if ( config.debug ) console.log(bug);
			bug = bug.replace( /(#|(bug\s+)|(https?:\/\/core\.trac\.wordpress\.org\/ticket\/))/i, '' );
			request( 'https://core.trac.wordpress.org/ticket/' + bug + '?format=rss', function( error, response, body ) {
				if ( error ) {
					return;
				}
				var title = body.match( /<title>(.*?)<\/title>/i );
				if ( config.debug ) console.log( title[1] );
				bot.say( message.args[0], title[1] );
			});
		});
	}
});
