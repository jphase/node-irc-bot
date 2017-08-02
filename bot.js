// Includes
var config = require( './config' );
var irc = require( 'irc' );
var nickserv = require( 'nickserv' );
var google_search = require( 'google-search' );
var request = require( 'request' );
var jsdom = require( 'jsdom' );
var moment = require( 'moment-timezone' );

// Initialize global bot variables
// google.resultsPerPage = 1;
var tell = [];
var seen = [];
var watch = [];

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

// Instantiate Google search API
var google = new google_search({
	key: config.google_api_key,
	cx: config.google_cx
});

// Export
module.exports = {
	config: config,
	client: bot,
	nickserv: ns,
	moment: moment,
	request: request,
	google: false,
	dom: jsdom,
	search: function( sites, chan, who, from, str ) {
		// var scrape = new scraper({
		// 	keyword: str,
		// 	language: 'us',
		// 	tld: 'us',
		// 	results: 100
		// });
		// scrape.getGoogleLinks.then(function( links ) {
		// 	return links;
		// }).catch(function( err ) {
		// 	if ( config.debug ) console.error( err );
		// });

		var prefix = who ? who + ': ' : from + ': ';
		var options = {
			q: str,
			start: 1,
			fileType: '',
			gl: 'us',
			lr: 'lang_en', 
			context: '',
			num: 10
		};
		if ( sites != '' ) {
			sites = typeof sites == 'object' ? sites.join(':') : sites;
			options.siteSearch = sites;
		} else {
			options.siteSearch = '';
		}
		var url = google._generateUrl( options );
		if ( typeof url == 'object' ) {
			if ( config.debug ) console.log( 'The URL is: ' + url.href );
			request( url.href, function( error, response, body ) {
				if ( error && config.debug ) console.error( error );
				var search = JSON.parse( body );
				if ( typeof search == 'object' && search.items.length ) {
					bot.say( chan, prefix + search.items[0].link );
				}
			});
		}
	},
	seen: {
		list: function() {
			return seen;
		},
		add: function( nick ) {
			return seen.push( nick );
		},
		search: function( nick, chan, who, from ) {
			var seenchans = [];

			if ( config.debug ) {
				console.log( '[Seen search] for: ' + nick );
			}

			// Check channels first
			for ( var chan in bot.chans ) {
				// Normalize the case of each user for case insensitive checking
				if ( config.debug ) console.log( 'Checking chan: ' + chan );
				for ( var user in bot.chans[ chan ].users ) {
					if ( user.toLowerCase() == nick.toLowerCase() ) {
						if ( config.debug ) console.log( 'Found ' + nick + ' in ' + chan );
						seenchans.push( chan );
					}
				}
			}

			if ( seenchans.length ) {
				bot.say( chan, nick + ' is currently in: ' + seenchans.join( ', ' ) );
				return true;
			} else {
				// Search through seen array
				seen.forEach( function( value, index, array ) {
					if ( value.nick == nick ) {
						// Setup the seen message
						var msg = 'Last seen ' + value.nick + ' ';
						var time = ' on ' + value.time;
						switch ( value.event ) {
							case 'nick':
								msg += 'changing their nick to ' + value.newnick + time;
								break;
							case 'part':
								msg += 'parting ' + value.channel + time;
								if ( value.message ) msg += ' with the message: ' + value.message;
								break;
							case 'quit':
								msg += 'quitting IRC with the message: "' + value.reason + '"' + time;
								break;
						}
						return msg;
					}
				});
				bot.say( chan, msg );
				return true;
			}
			var msg = who ? who + ': ' + 'I haven\'t seen ' + nick : from + ': I haven\'t seen ' + nick;
			bot.say( chan, msg );
			return false;
		},
		remove: function( nick ) {
			if ( seen.indexOf( nick ) > -1 ) {
				while ( seen.indexOf( nick ) > -1 ) {
					seen.splice( seen.indexOf( nick ), 1 );
				}
				return true;
			}
			return false;
		}
	},
	tell: {
		list: function() {
			return tell;
		},
		add: function( from, to, message ) {
			if ( config.debug ) console.log( 'bot.tell.add( "' + from + '", "' + to + '", "' + message + '" );' );
			return tell.push({
				from: from,
				to: to,
				message: message,
				date: moment().tz( 'America/New_York' ).format( 'MMMM Do YYYY, h:mm:ss a z' )
			});
		},
		check: function( who, channel ) {
			if ( config.debug ) {
				console.log( 'bot.tell.check( "' + who + '" )' );
				console.log( tell );
			}

			// Check for pending .tell commands for this user
			var msg = '';
			var told = [];
			var inbox = [];
			var different = [];

			// Loop through each message and build one big message to deliver to the user
			tell.forEach( function( value, index, array ) {
				if ( value.to == who ) {
					if ( config.debug ) console.log( 'Delivering .tell message #' + index + ' to ' + who );
					var date = moment( value.date ).tz( 'America/New_York' ).format( 'MMMM Do YYYY, h:mm:ss a z' );
					msg = '[' + value.from + ' ' + date + ']: ' + value.message;
					inbox.push( msg );
					told.push( index );
					if ( different.indexOf( value.from ) < 0 ) different.push( value.from );
				}
			});

			// Display their messages without flooding the channel
			if ( inbox.length > 4 ) {
				var plural = {
					inbox: ( inbox.length > 1 ? 's' : '' ),
					different: ( different.length > 1 ? 's' : '' )
				};
				var msg = 'You have ' + inbox.length + ' message' + plural.inbox + ' in your inbox from ' + different.length + ' user' + plural.different + '. Type .inbox to access your messages one page at a time while trying not to flood the channel ;)';
				bot.say( channel, msg );
			} else {
				inbox.forEach( function( value, index, array ) {
					bot.say( channel, who + ': ' + value );
				});
			}

			// Remove the messages that have been delivered
			var remove = this.remove( told );
			console.log( remove );
		},
		remove: function( indices ) {
			if ( config.debug ) console.log( 'bot.tell.remove( ' + indices.join(',') + ' )' );
			if ( indices.length ) {
				indices.forEach( function( value, index, array ) {
					tell.splice( value, 1 );
				});
				return true;
			}
			return false;
		}
	},
	watch: {
		add: function( url, selector, value, interval, type, filter, channel ) {
			watch.push({
				url: url,
				selector: selector,
				value: value,
				interval: interval,
				type: 'text',
				filter: filter,
				channel: channel,
				result: false
			});
		},
		remove: function( url, selector, value ) {
			for ( var item in watch ) {
				if ( item.url == url && item.selector == selector && item.value == value ) {
					watch.splice( item, 1 );
				}
			}
		},
		check: function( interval ) {
			var i = 0;
			for ( var item in watch ) {
				if ( item.interval == interval ) {
					if ( config.debug ) {
						console.log( 'checking watched item: ', item );
					}
					// Scrape the site for contents from selector
					request( item.url, function( error, response, body ) {
						if ( ! error ) {
							// Load bot.dom for DOM parsing
							jsdom.env(
								body,
								[ 'http://code.jquery.com/jquery-2.2.3.min.js' ],
								function( err, window ) {
									// Get remote content
									if ( err ) console.log( 'jsdom err: ', err );
									var $ = window.jQuery;
									console.log( 'body:', $('body').html() );
									switch ( item.type ) {
										case 'text':
											var result = $( item.selector ).text();
											break;
										case 'html':
											var result = $( item.selector ).html();
											break;
									}

									// Parse remote content
									if ( result != item.result ) {
										// Update watch list
										bot.say( message.args[0], who ? who + ': ' + msg : msg );
									}
								}
							);
						} else {
							console.log( error );
						}
					});
				}
				i++;
			}
			return false;
		}
	}
}

// Load events
var normalizedPath = require( 'path' ).join( __dirname, 'events' );
require( 'fs' ).readdirSync( normalizedPath ).forEach( function( file ) {
	require( './events/' + file );
});