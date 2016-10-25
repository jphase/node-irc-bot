// Includes
var config = require( './config' );
var irc = require( 'irc' );
var nickserv = require( 'nickserv' );
var google = require( 'google' );
var request = require( 'request' );
var cheerio = require( 'cheerio' );
var jsdom = require( 'jsdom' );
var moment = require( 'moment-timezone' );
var async = require( 'async' );

// Initialize global bot variables
google.resultsPerPage = 1;
var tell = [];
var seen = [];
var flood = [];

// Create the bot
var bot = new irc.Client( config.server, config.name, {
	// channels: config.channels,
	localAddress: config.localAddress,
	realName: config.realName,
	autoRejoin: true
});

// Instantiate nickserv to handle communication between bot and services
var ns = new nickserv( config.name, {
	password: config.pass,
	email: config.email
});
ns.attach( 'irc', bot );

// Connected events
bot.addListener( 'registered', function ( message ) {
	ns.identify( config.pass, function( err ) {
		if ( err && config.debug ) console.log( 'nickserv error:' + err );
		config.channels.forEach( function( value, index, array ) {
			bot.join( value + ' ' + config.pass );
			bot.send( '/msg chanserv op ' + value + ' ' + config.name );
		});
	});
});

// Error handler
bot.addListener( 'error', function ( message ) {
	if ( config.log ) {
		console.log( 'BOT ERROR: ' );
		console.log( message );
	}
});

// Join events
bot.addListener( 'join', function( channel, who ) {
	if ( config.debug ) console.log( who + ' joined ' + channel );
	// When other users join the channel (not the bot)
	if ( bot.nick != who ) {
		// Check for pending .tell commands for this user
		var msg = '';
		var told = [];
		var inbox = [];
		var different = [];
		// Loop through each message and build one big message to deliver to the user
		tell.forEach( function( value, index, array ) {
			if ( value.from == who ) {
				if ( config.debug ) console.log( 'Delivering .tell message #' + index + ' to ' + who );
				var date = moment().tz( 'America/New_York' ).format( 'M/DD/YY h:mm:ssa z' );
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
		if ( told.length ) {
			told.forEach( function( value, index, array ) {
				tell.splice( value, 1 );
			});
		}
	} else {
		// Actions to perform when the bot joins the channel
	}
});

// Part events
bot.addListener( 'part', function( channel, who ) {
	if ( config.debug ) {
		console.log( 'Part Handler!!' );
		console.log( channel );
	}
	// Add parting user to the seen array
	seen.push({
		event: 'part',
		nick: who,
		channel: channel,
		time: moment().tz( 'America/New_York' ).format( 'MMMM Do YYYY, h:mm:ss a z' )
	});
});

// Quit events
bot.addListener( 'quit', function( nick, reason, channels, message ) {
	if ( config.debug ) console.log( message );
	// Add parting user to the seen array
	seen.push({
		event: 'quit',
		nick: nick,
		channel: channels,
		reason: reason,
		message: message,
		time: moment().tz( 'America/New_York' ).format( 'MMMM Do YYYY, h:mm:ss a z' )
	});
});

// Nick change events
bot.addListener( 'nick', function ( oldnick, newnick, channels, message ) {
	// Update seen array if necessary
	seen.push({
		event: 'nick',
		nick: oldnick,
		newnick: newnick,
		channel: channels,
		message: message,
		time: moment().tz( 'America/New_York' ).format( 'MMMM Do YYYY, h:mm:ss a z' )
	});
});

// Message events
bot.addListener( 'message', function( from, to, text, message ) {
	// Debug incoming messages
	if ( config.debug ) {
		console.log( '============ From ============' );
		console.log( from );
		console.log( '============  To  ============' );
		console.log( to );
		console.log( '============ Text ============' );
		console.log( text );
		console.log( '============ MESG ============' );
		console.log( message );
		console.log( '==============================' );
	}

	// Check messages
	if ( to == bot.nick ) {
		// Private message handler
		if ( config.debug ) console.log( 'Private Message Handler!!' );
		bot.say( from, 'Hey ' + from + '... I\'m a bot and I\'m not currently programmed to handle your private messages. Check back soon.' );
	} else {
		// Public message handler

		// Check for flooding
		// floodCheck( message );

		// Check for admin
		var isAdmin = false;
		if ( config.admins.length ) {
			config.admins.forEach( function( value, index, array ) {
				if ( value.trim().toLowerCase() == from.trim().toLowerCase() ) {
					isAdmin = true;
				}
			});
		}

		// Check for ignored
		var isIgnored = false;
		if ( config.ignore.length ) {
			config.ignore.forEach( function( value, index, array ) {
				if ( value.trim().toLowerCase() == from.trim().toLowerCase() ) {
					isIgnored = true;
				}
			});
		}

		// Break up command string
		var command = text.match( /^\.(\w+)/ );
		if ( config.debug ) console.log( 'Public Message Handler!!' );
		if ( config.debug ) console.log( command );

		// Log all channel messages
		if ( config.log ) console.log( '[' + to + '] ' + from + ': ' + text + ' - ' + moment().format() );

		// Check if this message needs to be ignored
		if ( ( isIgnored && ! isAdmin ) || config.muted.indexOf( message.args[0] ) > -1 ) {
			return;
		} else if ( config.debug ) {
			console.log( 'ignored:', isIgnored, 'admin:', isAdmin );
		}

		// Parse commands
		if ( command && command.length && command[0].charAt(0) == '.' ) {
			// Initialize
			var cmd = command[1];
			var str = command.input.replace( command[0] + ' ', '' );
			var who = str.split( '> ' );
			if ( who.length == 1 ) {
				who = false;
			} else {
				who = who.pop();
				str = str.replace( ' > ' + who, '' );
			}

			// Debug
			if ( config.debug ) {
				console.log( 'cmd: ' + cmd );
				console.log( 'str: ' + str );
				console.log( 'who: ' + who );
			}

			// Process command
			switch ( cmd ) {
				// Scrape
				case 'scrape':
					// if ( isAdmin ) {
					// 	// Setup site and selector
					// 	var selector = str.match( /'(.*)'/ );
					// 	selector = selector[1];
					// 	var site = str.split( ' ' );
					// 	site = site[0];

					// 	// Scrape the site for contents from selector
					// 	request( site, function( error, response, body ) {
					// 		if ( ! error) {
					// 			// Load jsdom for DOM parsing
					// 			jsdom.env(
					// 				body,
					// 				[ 'http://code.jquery.com/jquery-2.2.3.min.js' ],
					// 				function( err, window ) {
					// 					if ( err ) console.log( 'err:', err );
					// 					var $ = window.jQuery;
					// 					console.log( 'body:', $('body').html() );
					// 					var msg = $( selector ).text();
					// 					bot.say( message.args[0], who ? who + ': ' + msg : msg );
					// 				}
					// 			);
					// 		} else {
					// 			console.log( error );
					// 		}
					// 	});
					// }
					break;

				// Ignore
				case 'ignore':
					// if ( isAdmin ) {
					// 	var msg = '';
					// 	// Ignore the ignore request if they're trying to ignore an admin
					// 	if ( config.admins.length ) {
					// 		config.admins.forEach( function( value, index, array ) {
					// 			if ( value.trim().toLowerCase() == str.toLowerCase() ) {
					// 				msg = str + ' is an admin and admins cannot be ignored';
					// 			}
					// 		});
					// 	}

					// 	// Ignore them if they're not an admin, let the user know they're already ignored otherwise
					// 	if ( ! msg.length && config.ignore.length ) {
					// 		if ( config.ignore.indexOf( str ) > -1 ) {
					// 			msg = str + ' is already being ignored';
					// 		} else {
					// 			config.ignore.push( str );
					// 			msg = str + ' is now being ignored';
					// 		}
					// 	}

					// 	// Send ignored message
					// 	bot.say( message.args[0], msg );
					// }
					break;

				// Unignore
				case 'unignore':
					// if ( isAdmin ) {
					// 	var msg = '';
					// 	// Ignore the ignore request if they're trying to ignore an admin
					// 	if ( config.admins.length ) {
					// 		config.admins.forEach( function( value, index, array ) {
					// 			if ( value.trim().toLowerCase() == str.toLowerCase() ) {
					// 				msg = str + ' is an admin and admins cannot be ignored';
					// 			}
					// 		});
					// 	}

					// 	// Unignore them if they're not an admin, let the user know they're already unignored otherwise
					// 	if ( ! msg.length && config.ignore.length ) {
					// 		if ( config.ignore.indexOf( str ) > -1 ) {
					// 			config.ignore.splice( config.ignore.indexOf( str ), 1 );
					// 			msg = str + ' is no longer being ignored';
					// 		} else {
					// 			msg = str + ' is not being ignored';
					// 		}
					// 	}

					// 	// Send ignored message
					// 	bot.say( message.args[0], msg );
					// }
					break;

				// Kick
				case 'kick':
					// if ( isAdmin ) {
					// 	// Grab the kick message from the end of the string
					// 	msg = str.split(' ');
					// 	if ( msg.length > 1 ) {
					// 		str = msg[0];
					// 		msg.splice( 0, 1 );
					// 		msg = msg.join(' ');
					// 	}

					// 	// Kick the user
					// 	console.log( 'KICK ' + message.args[0] + ' ' + str + ' ' + msg );
					// 	bot.send( 'KICK ' + message.args[0] + ' ' + str + ' ' + msg );
					// }
					break;

				// Inbox
				case 'inbox':
					// Check for pending .tell commands for this user
					var msg = '';
					var told = [];
					var inbox = [];

					// Loop through each message and build one big message to deliver to the user
					tell.forEach( function( value, index, array ) {
						if ( value.from == from && told.length < 4 ) {
							if ( config.debug ) console.log( 'Delivering .tell message #' + index + ' to ' + from );
							msg = '[' + value.from + ' ' + value.date + ']: ' + value.message;
							inbox.push( msg );
							told.push( index );
						}
					});

					// Display their messages without flooding the channel
					if ( inbox.length > 4 ) {
						if ( config.debug ) console.log( '> 4 messages in inbox' );
						for ( var i = 0; i < 4; i++ ) {
							bot.say( message.args[0], from + ': ' + inbox[ i ] );
						}
						for ( var i = 0; i < 4; i++ ) {
							inbox.shift();
						}
					} else if ( ! inbox.length ) {
						bot.say( message.args[0], from + ': you have no messages in your inbox' );
					} else {
						if ( config.debug ) console.log( inbox.length + ' messages in inbox' );
						inbox.forEach( function( value, index, array ) {
							bot.say( message.args[0], from + ': ' + inbox[ index ] );
						});
					}

					// Remove the messages that have been delivered
					if ( told.length ) {
						told.forEach( function( value, index, array ) {
							tell.splice( value, 1 );
						});
					}
					break;

				// Help
				case 'help':
					var commands = [ '.g', '.c', '.p', '.seen', '.tell', '.first', '.paste', '.hierarchy', '._', '.blame', '.ask', '.say' ];
					var helpstr = 'Available Commands: ' + commands.join( ', ' );
					bot.say( who ? who : from, helpstr );
					console.log( 'sending help message to: ' + who ? who : from );
					break;

				// Codex search
				case 'c':
				case 'codex':
					if ( config.debug ) console.log( '[Codex search] for: ' + str );

					// // Scrape the site for contents from selector
					// var site = 'http://google.com/search?q=' + encodeURIComponent( str + ' site:wordpress.org inurl:("codex.wordpress.org"|"developer.wordpress.org")' );
					// request( site, function( error, response, body ) {
					// 	if ( ! error) {
					// 		// Load jsdom for DOM parsing
					// 		jsdom.env(
					// 			body,
					// 			[ 'http://code.jquery.com/jquery-2.2.3.min.js' ],
					// 			function( err, window ) {
					// 				if ( err ) console.log( 'err:', err );
					// 				var $ = window.jQuery;
					// 				console.log($('#ires .g:first .kv'));
					// 				var msg = $('#ires .g:first .kv').text();
					// 				bot.say( message.args[0], who ? who + ': ' + msg : msg );
					// 			}
					// 		);
					// 	} else {
					// 		console.log( error );
					// 	}
					// });


					google( str + ' site:wordpress.org inurl:("codex.wordpress.org"|"developer.wordpress.org")', function ( err, next, links ) {
						if ( err && config.debug ) console.error( err );
						// Show the search results
						if ( links && links[0].hasOwnProperty('link') ) {
							bot.say( to, who ? who + ': ' + links[0].link : from + ': ' + links[0].link );
						} else {
							bot.say( to, from + ': weird... your search for: "' + str + ' site:wordpress.org inurl:("codex.wordpress.org"|"developer.wordpress.org")" yielded this: ' + JSON.stringify( links ) );
						}
					});
					break;

				// CSS search
				case 'css':
					if ( config.debug ) console.log( '[CSS search] for: ' + str );
					google( str + ' site:https://developer.mozilla.org/en-US/docs/Web/CSS', function ( err, next, links ) {
						if ( err && config.debug ) console.error( err );
						// Show the search results
						bot.say( to, who ? who + ': ' + links[0].link : from + ': ' + links[0].link );
					});
					break;

				// JS search
				case 'js':
					if ( config.debug ) console.log( '[JS search] for: ' + str );
					google( str + ' site:https://developer.mozilla.org/en-US/docs/Web/JavaScript/', function ( err, next, links ) {
						if ( err && config.debug ) console.error( err );
						// Show the search results
						bot.say( to, who ? who + ': ' + links[0].link : from + ': ' + links[0].link );
					});
					break;

				// BAH command
				case 'bah':
					var answers = [ 'http://xn--rh8hj8g.ws/bah-bloody.gif', 'http://xn--rh8hj8g.ws/bah-brave.gif' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.say( message.args[0], msg );
					break;

				// YAY command
				case 'yay':
					var answers = [ 'http://xn--rh8hj8g.ws/yay-homer.jpg' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.say( message.args[0], msg );
					break;

				// Fine command
				case 'fine':
					var answers = [ 'http://xn--rh8hj8g.ws/fine-wednesday.gif' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.say( message.args[0], msg );
					break;

				// FML command
				case 'fml':
					var answers = [ 'http://s2.quickmeme.com/img/03/0353203cbc2e18150f8c7f45cb7d64efa57d8ac5bd1059add3576fc94ca702f2.jpg', 'http://i3.kym-cdn.com/photos/images/facebook/000/089/506/128989967490130539.jpg', 'http://img.memecdn.com/fml_o_577538.jpg', 'http://img.memecdn.com/FML-horse_o_141347.jpg', 'http://i0.kym-cdn.com/entries/icons/facebook/000/004/706/FML.jpg', 'http://don.citarella.net/wp-content/uploads/2012/05/sml.jpg', 'https://cdn.meme.am/instances/500x/55087958.jpg', 'https://cdn.meme.am/instances/500x/10377021.jpg', 'http://i2.kym-cdn.com/photos/images/list/000/478/993/5b1.jpg' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.say( message.args[0], msg );
					break;

				// Google search
				case 'g':
					if ( config.debug ) console.log( '[Google search] for: ' + str );
					google( str, function ( err, next, links ) {
						if ( err && config.debug ) console.error( err );
						// Show the search results
						if ( links && links[0].hasOwnProperty('link') ) {
							var msg = who ? who + ': ' + links[0].link : from + ': ' + links[0].link;
						} else {
							var msg = who ? who + ': no Google results found for "' + str + '"' : from + ': no Google results found for "' + str + '"';
						}
						bot.say( to, msg );
					});
					break;

				// Hookr.io search
				case 'h':
				case 'hookr':
					if ( config.debug ) console.log( '[Hookr search] for: ' + str );
					google( str + ' site:hookr.io', function ( err, next, links ) {
						if ( err && config.debug ) console.error( err );
						// Show the search results
						bot.say( to, who ? who + ': ' + links[0].link : from + ': ' + links[0].link );
					});
					break;

				// JetPack search
				case 'jetpack':
					if ( config.debug ) console.log( '[JetPack search] for: ' + str );
					google( str + ' site:developer.jetpack.com', function ( err, next, links ) {
						if ( err && config.debug ) console.error( err );
						// Show the search results
						if ( typeof links[0] == 'undefined' ) {
							var msg = who ? who + ': no results found for "' + str + '" on developer.jetpack.com' : from + ': no results found for "' + str + '" on developer.jetpack.com';
						} else {
							var msg = who ? who + ': ' + links[0].link : from + ': ' + links[0].link;
						}
						bot.say( to, msg );
					});
					break;

				// jQuery API search
				case 'jquery':
					if ( config.debug ) console.log( '[jQuery API search] for: ' + str );
					google( str + ' site:api.jquery.com', function ( err, next, links ) {
						if ( err && config.debug ) console.error( err );
						// Show the search results
						bot.say( to, who ? who + ': ' + links[0].link : from + ': ' + links[0].link );
					});
					break;

				// jQuery UI API search
				case 'jqueryui':
					if ( config.debug ) console.log( '[jQuery UI API search] for: ' + str );
					google( str + ' site:jqueryui.com', function ( err, next, links ) {
						if ( err && config.debug ) console.error( err );
						// Show the search results
						bot.say( to, who ? who + ': ' + links[0].link : from + ': ' + links[0].link );
					});
					break;

				// lmgtfy.com search
				case 'l':
				case 'lmgtfy':
					if ( config.debug ) console.log( '[lmgtfy.com search] for: ' + str );
					// Show the search results
					var link = 'http://lmgtfy.com/?q=' + encodeURIComponent( str );
					bot.say( to, who ? who + ': ' + link : from + ': ' + link );
					break;

				// Plugin search
				case 'p':
					if ( config.debug ) console.log( '[Plugin search] for: ' + str );
					google( str + ' wordpress plugin site:https://wordpress.org/plugins', function ( err, next, links ) {
						if ( err && config.debug ) console.error( err );
						if ( config.debug ) console.log( links );
						// Show the search results
						if ( links.length ) {
							bot.say( to, who ? who + ': ' + links[0].link : from + ': ' + links[0].link );
						}
					});
					break;

				// Plugin search
				case 'php':
					if ( config.debug ) console.log( '[PHP search] for: ' + str );
					google( str + ' site:http://php.net', function ( err, next, links ) {
						if ( err && config.debug ) console.error( err );
						if ( config.debug ) console.log( links );
						// Show the search results
						if ( links.length ) {
							bot.say( to, who ? who + ': ' + links[0].link : from + ': ' + links[0].link );
						}
					});
					break;

				// Soundcloud command
				case 'soundcloud':
					if ( config.debug ) console.log( '[SoundCloud search] for: ' + str );
					google( str + ' site:soundcloud.com', function ( err, next, links ) {
						if ( err && config.debug ) console.error( err );
						if ( config.debug ) console.log( links );
						// Show the search results
						if ( links.length ) {
							bot.say( to, who ? who + ': ' + links[0].link : from + ': ' + links[0].link );
						}
					});
					break;

				// Spotify command
				case 'spotify':
					if ( config.debug ) console.log( '[Spotify search] for: ' + str );
					google( str + ' site:open.spotify.com', function ( err, next, links ) {
						if ( err && config.debug ) console.error( err );
						if ( config.debug ) console.log( links );
						// Show the search results
						if ( links.length ) {
							bot.say( to, who ? who + ': ' + links[0].link : from + ': ' + links[0].link );
						}
					});
					break;

				// Spotify command
				case 'spotifyuri':
					if ( config.debug ) console.log( '[Spotify URI search] for: ' + str );
					google( str + ' site:open.spotify.com', function ( err, next, links ) {
						if ( err && config.debug ) console.error( err );
						if ( config.debug ) console.log( links );
						// Show the search results
						if ( links.length ) {
							var link = links[0].link.split('/');
							link = 'spotify:track:' + link[ link.length - 1 ];
							bot.say( to, who ? who + ': ' + link : from + ': ' + link );
						}
					});
					break;

				// wpseek.com search
				case 'wps':
				case 'wpseek':
					if ( config.debug ) console.log( '[wpseek.com search] for: ' + str );
					google( str + ' site:wpseek.com', function ( err, next, links ) {
						if ( err && config.debug ) console.error( err );
						// Show the search results
						if ( links && links[0].hasOwnProperty('link') ) {
							var msg = links[0].link;
						} else {
							var msg = 'weird... I had troubles getting a link for "' + str + ' site:wpseek.com"';
						}
						bot.say( to, who ? who + ': ' + msg : from + ': ' + msg );
					});
					break;

				// YouTube search
				case 'y':
				case 'youtube':
					if ( config.debug ) console.log( '[YouTube search] for: ' + str );
					google( str + ' site:youtube.com', function ( err, next, links ) {
						if ( err && config.debug ) console.error( err );
						if ( config.debug ) console.log( links );
						// Show the search results
						if ( links[0].link ) {
							bot.say( to, who ? who + ': ' + links[0].link : from + ': ' + links[0].link );
						} else {
							bot.say( to, from + ': weird... your search for: "' + str + ' site:youtube.com" yielded this: ' + JSON.stringify( links ) );
						}
					});
					break;

				// Seen command
				case 'seen':
					if ( from != str ) {
						var none = true;
						if ( config.debug ) {
							console.log( '[Seen search] for: ' + str );
							console.log( bot.chans );
							console.log( 'search through:' );
							console.log( config.channels );
						}
						// Check channels first
						config.channels.forEach( function( pvalue, pindex, parray ) {
							// Normalize the case of each user for case insensitive checking
							var chanusers = [];
							for ( var user in bot.chans[ pvalue ].users ) {
								chanusers.push( user.toLowerCase() );
							}

							// Loop through case normalized usernames
							for ( var user in bot.chans[ pvalue ].users ) {
								if ( none && bot.chans[ pvalue ].users.hasOwnProperty( str ) ) {
									bot.say( to, who ? who + ': ' + str + ' is currently in ' + pvalue : from + ': ' + str + ' is currently in ' + pvalue );
									none = false;
								}
							}
						});
						// search through seen array
						seen.forEach( function( value, index, array ) {
							if ( value.nick == str ) {
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
								bot.say( to, msg );
								none = false;
							}
						});
						if ( none ) bot.say( to, who ? who + ': ' + 'I haven\'t seen ' + str : from + ': ' + 'I haven\'t seen ' + str );
					} else {
						bot.say( to, 'That\'s hilarious ' + from + '...' );
					}
					break;

				// SMH command
				case 'smh':
					var answers = [ 'http://xn--rh8hj8g.ws/smh-mjf.png', 'http://xn--rh8hj8g.ws/smh-today.gif', 'http://xn--rh8hj8g.ws/smh-kanye.gif', 'http://xn--rh8hj8g.ws/smh-bbad.gif', 'http://xn--rh8hj8g.ws/smh-drag.gif' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.say( message.args[0], msg );
					break;

				// Tell command
				case 'tell':
					// Make sure their message is setup correctly
					var sendto = str.split(' ')[0];
					// Add .tell message to the tell array
					if ( config.debug ) console.log( '[Tell ' + sendto + '] ' + str  );
					if ( tell.length ) {
						var already = false;
						tell.forEach( function( value, index, array ) {
							if ( value.from == from && value.message == str ) {
								already = true;
							}
						});
						if ( ! already ) {
							msg = 'I\'ll deliver your message to ' + sendto + ' the next time they join.';
							tell.push({ from: from, message: str.replace( sendto + ' ', '' ), date: moment().tz( 'America/New_York' ).format( 'M/DD/YY h:mm:ssa z' ) });
						}
					} else {
						msg = 'I\'ll deliver your message to ' + sendto + ' the next time they join.';
						tell.push({ from: from, message: str.replace( sendto + ' ', '' ), date: moment().tz( 'America/New_York' ).format( 'M/DD/YY h:mm:ssa z' ) });
					}
					var msg = who ? who + ': ' + msg : from + ': ' + msg;
					bot.say( message.args[0], msg );
					break;

				// Bitcoin command
				case 'bitcoin':
					if ( config.debug ) console.log( '[Bitcoin Exchange Rate]' );
					// Check if they want a specific exchange rate
					if ( str.indexOf('.bitcoin:') == 0 ) {
						var currency = str.split(' ');
						currency = currency[0].split(':');
						currency = currency[1].toUpperCase();
					} else {
						var currency = 'USD';
					}
					// Grab the blockchain information for the current currency type
					request( 'https://blockchain.info/ticker', function( error, response, body ) {
						if ( ! error) {
							body = JSON.parse( body );
							if ( body.hasOwnProperty( currency ) ) {
								body = body[ currency ];
								var msg = 'Current ' + currency + ' Bitcoin Value: ' + body.symbol + body.last + '. [Buy @ ' + body.symbol + body.buy + ' and Sell @ ' + body.symbol + body.sell + ']';
							} else {
								var msg = 'Unable to read blockchain information for the "' + currency + '" currency type. Please try again later :(';
							}
							bot.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
						}
					});
					break;

				// Math command
				case 'math':
					if ( config.debug ) console.log( '[Math Command]' );
					// Get the endpoint
					var endpoint = 'http://api.mathjs.org/v1/?expr=' + encodeURIComponent( str );
					// Grab the blockchain information for the current currency type
					request( endpoint, function( error, response, body ) {
						if ( ! error) {
							var msg = body;
							bot.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
						}
					});
					break;

				// // Weather command
				// case 'weather':
				// 	if ( config.hasOwnProperty('openweathermap_api_key') ) {
				// 		if ( config.debug ) console.log( '[Weather Command]' );
				// 		// Set the API endpoint
				// 		var endpoint = 'http://api.openweathermap.org/data/2.5/weather?q=London&APPID=' + config.openweathermap_api_key;
				// 		// Grab the blockchain information for the current currency type
				// 		request( endpoint, function( error, response, body ) {
				// 			if ( ! error) {
				// 				body = JSON.parse( body );
				// 				if ( body.hasOwnProperty('name') ) {
				// 					var wind = body.wind.speed;
				// 					var msg = 'Current weather for ' + body.name + ': '
				// 					var msg = 'Current ' + currency + ' Bitcoin Value: ' + body.symbol + body.last + '. [Buy @ ' + body.symbol + body.buy + ' and Sell @ ' + body.symbol + body.sell + ']';
				// 				} else {
				// 					var msg = 'Unable to read blockchain information for the "' + currency + '" currency type. Please try again later :(';
				// 				}
				// 				bot.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
				// 			}
				// 		});
				// 	}
				// 	break;

				// Count command
				case 'count':
					if ( config.debug ) console.log( '[WordPress Count]' );
					request( 'https://wordpress.org/download/counter/?ajaxupdate=1', function( error, response, body ) {
						if ( ! error) {
							var msg = 'WordPress has been downloaded ' + body + ' times.';
							bot.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
						}
					});
					break;

				// Facepalm command
				case 'facepalm':
					var answers = [ 'http://4.bp.blogspot.com/-mgnWPcZJcz0/U9K0TnmdyWI/AAAAAAAAD2Q/fpaFlMU5ZOo/s1600/homer_facepalm.jpg', 'http://static.giantbomb.com/uploads/original/8/88747/1772665-pope_facepalm.jpg', 'http://memesvault.com/wp-content/uploads/Extreme-Facepalm-Gif-06.png', 'http://i.imgur.com/wY9Mn.png' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.say( message.args[0], msg );
					break;

				// First command
				case 'first':
					var msg = 'Please attempt to disable all plugins, and use one of the default (Twenty*) themes. If the problem goes away, enable them one by one to identify the source of your troubles.';
					bot.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
					break;

				// Moving command
				case 'moving':
				case 'move':
					var msg = 'If you rename the WordPress directory on your server, switch ports or change the hostname http://codex.wordpress.org/Moving_WordPress applies';
					bot.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
					break;

				// Inspect command
				case 'inspect':
					var msg = 'Please use the built-in Developer Tools of your browser to fix problems with your website. Right click your page and pick Inspect Element (Cr, FF, Op) or press F12-button (IE) to track down CSS problems. Use the console to see JavaScript bugs.';
					bot.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
					break;

				// Paste command
				case 'paste':
					var msg = 'Please use http://wpbin.io to paste your multi-line code samples';
					bot.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
					break;

				// Asking command
				case 'asking':
					var msg = 'When asking a question make sure to include the following information: 1) What you want to achieve. 2) How you are attempting to achieve it. 3) What you expect to happen. 4) What is actually happening.';
					bot.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
					break;

				// Linking command
				case 'linking':
					var msg = 'When linking to your website while asking for help, please tell us specifically where to look on the website and what to click to initiate the interaction you are trying to fix';
					bot.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
					break;

				// Hierarchy command
				case 'hierarchy':
					var msg = 'Please refer to the WordPress template hierarchy https://developer.wordpress.org/themes/basics/template-hierarchy/';
					bot.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
					break;

				// Underscores command
				case '_':
					var msg = 'Check out the Underscores base theme http://underscores.me';
					bot.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
					break;

				// 8ball
				case '8ball':
					var answers = [ 'Nope', 'Fat chance', 'Most definitely!', 'Yep', 'Try again later', 'How the hell am I supposed to know?', 'Most likely', 'Indeed', 'Not in this lifetime', 'Pffft... what do you think?', 'Obviously!' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.say( message.args[0], msg );
					break;

				// Cry command
				case 'cry':
					var prefix = who ? who + ': ' : '';
					var msg = prefix + '(╯︵╰,)';
					bot.say( message.args[0], msg );
					break;

				// Blame command
				case 'blame':
					if ( str == bot.nick ) {
						var msg = "That's hilarious...";
					} else {
						var msg = who ? who + ': ' + 'It\'s all ' + str + '\'s fault!' : 'It\'s all ' + str + '\'s fault!';
					}
					bot.say( message.args[0], msg );
					break;

				// Flip command
				case 'flip':
					var prefix = who ? who + ': ' : '';
					if ( str == '.flip!' ) {
						var msg = prefix + '┻━┻︵  \\(°□°)/ ︵ ┻━┻';
					} else {
						var msg = prefix + '(╯°□°）╯︵ ┻━┻';
					}
					bot.say( message.args[0], msg );
					break;

				// Chill command
				case 'calm':
				case 'chill':
					var prefix = who ? who + ': ' : '';
					var msg = prefix + '┬──┬ ノ(゜-゜ノ)';
					bot.say( message.args[0], msg );
					break;

				// Shrug command
				case 'shrug':
					var prefix = who ? who + ': ' : '';
					var msg = prefix + '¯\\_(ツ)_/¯';
					bot.say( message.args[0], msg );
					break;

				// YOLO command
				case 'yolo':
					var prefix = who ? who + ': ' : '';
					var msg = prefix + 'Yᵒᵘ Oᶰˡʸ Lᶤᵛᵉ Oᶰᶜᵉ';
					bot.say( message.args[0], msg );
					break;

				// Pfft command
				case 'pfft':
				case 'pff':
				case 'pft':
				case 'pf':
					var answers = [ 'https://s-media-cache-ak0.pinimg.com/736x/a9/26/8f/a9268f451c95945e928121cd91c41281.jpg', 'http://reactiongif.org/wp-content/uploads/GIF/2014/08/GIF-bfd-big-deal-dwight-meh-sarcastic-the-office-uncaring-whatever-GIF.gif', 'https://static1.fjcdn.com/thumbnails/comments/Pfft+that+horrible+tattoo+does+_5e04cac8f2e8f5a827be0b3123a888b1.png', 'http://data.whicdn.com/images/196440384/large.jpg', 'https://coydavidson.files.wordpress.com/2012/06/pfft.jpg', 'https://tromoticons.files.wordpress.com/2012/11/yao-ming-pff.png', 'https://cdn.meme.am/instances/500x/50075843.jpg' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.say( message.args[0], msg );
					break;

				// Hi command
				case 'hi':
					var answers = [ 'http://xn--rh8hj8g.ws/hi-queen.gif', 'http://xn--rh8hj8g.ws/hi-goofy.gif', 'http://xn--rh8hj8g.ws/hi-forestgump.gif', 'http://xn--rh8hj8g.ws/hi-picard.gif', 'http://xn--rh8hj8g.ws/hi-ironman.gif' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.say( message.args[0], msg );
					break;

				// Bye command
				case 'bye':
					var answers = [ 'http://xn--rh8hj8g.ws/bye-jezebel.gif', 'http://xn--rh8hj8g.ws/bye-jezebel.gif', 'http://xn--rh8hj8g.ws/bye-bitch.gif', 'http://xn--rh8hj8g.ws/bye-woody.gif', 'http://xn--rh8hj8g.ws/bye-clarissa.gif', 'http://xn--rh8hj8g.ws/bye-harrypotter.gif', 'http://xn--rh8hj8g.ws/bye-random.gif' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					// This allows the user to add a message on top of
					// msg = ( str ? str + ' ' : '' ) + msg;
					bot.say( message.args[0], msg );
					break;

				// Party command
				case 'dance':
				case 'party':
				case 'boogie':
					var prefix = who ? who + ': ' : '';
					var msg = prefix + '┏(-_-)┛┗(-_-﻿)┓┗(-_-)┛┏(-_-)┓';
					bot.say( message.args[0], msg );
					break;

				// Finger command
				case 'finger':
					var prefix = who ? who + ': ' : '';
					var msg = prefix + '╭∩╮（︶︿︶）╭∩╮';
					bot.say( message.args[0], msg );
					break;

				// Emojis #1
				case 'emojis':
					var msg = '😀😬😁😂😃😄😅😆😌😋🙃🙂😊😉😇😍😘😗😙😚😜😝😛😑😐😶😏🤗😎🤓🤑😒🙄🤔😳😞😟😠😡😩😫😖😣☹🙁😕😔😤😮😱😨😰😯😦😧😢😥😪😓😭😵😲🤐👿😈💩💤😴🤕🤒😷👹👺💀👻👽🤖😺😸🙌😾😿🙀😽😼😻😹🙌🏻🙌🏼🙌🏽🙌🏾🙌🏿👏👏🏻👏🏼👏🏽👏🏾👏🏿';
					bot.say( message.args[0], msg );
					break;

				// Poop emoji
				case 'poop':
					var prefix = who ? who + ': ' : '';
					var msg = prefix + '💩';
					bot.say( message.args[0], msg );
					break;

				// Fart emojis
				case 'fart':
					var prefix = who ? who + ': ' : '';
					var msg = prefix + '💩💨💨💨💨';
					bot.say( message.args[0], msg );
					break;	

				// Trollollolloll
				case 'trollolloll':
				case 'trollsong' : 
				case 'troll' :
					var prefix = who ? who + ': ' : '';
					var msg = prefix + 'https://youtu.be/9zYP8_5IBmU?t=1m47s';
					bot.say( message.args[0], msg );
					break;					
					
				// Ask command
				case 'ask':
					var msg = 'Go ahead and ask your question and someone will assist if they are able.';
					bot.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
					break;

				// Just a say command
				case 'say':
					bot.say( message.args[0], who ? who + ': ' + str : str );
					break;

				// WAT command
				case 'wat':
					var answers = [ 'http://xn--rh8hj8g.ws/wat-shrunkenface.jpg' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.say( message.args[0], msg );
					break;

				// WTF command
				case 'wtf':
					var answers = [ 'http://xn--rh8hj8g.ws/wtf-baby.png' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.say( message.args[0], msg );
					break;

				// Yas command
				case 'yas':
					var answers = [ 'http://xn--rh8hj8g.ws/yas-werk.gif' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.say( message.args[0], msg );
					break;

			}
		} else {
			// React to parts of their string if it contains certain text
			var msg = '';
			var prefix = who ? who + ': ' : '';
			var reactions = text.match( /(\w+)/g );
			if ( reactions !== null && reactions.length ) {
				reactions.forEach( function( value, index, array ) {
					// In case we need to check the next word too
					var nextword = reactions[ index + 1 ];
					// Loop through all words encompassed in colons :something: like :this: in the whole string
					switch ( value.toLowerCase() ) {
						case 'cry':
						case 'tear':
						case 'tears':
						case ':~(':
						case ':(':
							msg += msg.length ? ' (╯︵╰,)' : '(╯︵╰,)';
							break;
						case 'party':
						case 'dance':
						case 'boogie':
							msg += msg.length ? ' ┏(-_-)┛┗(-_-﻿)┓┗(-_-)┛┏(-_-)┓' : '┏(-_-)┛┗(-_-﻿)┓┗(-_-)┛┏(-_-)┓';
							break;
						case 'fuck':
						case 'finger':
							if ( value != 'fuck' || ( nextword == 'you' || nextword == 'off' ) ) {
								msg += msg.length ? ' ╭∩╮（︶︿︶）╭∩╮' : '╭∩╮（︶︿︶）╭∩╮';
							} else if ( value == 'fuck' && ( nextword == 'this' || nextword == 'life' ) ) {
								msg += msg.length ? ' (╯°□°）╯︵ ┻━┻' : '(╯°□°）╯︵ ┻━┻';
							} else if ( value == 'fuck' ) {
								msg += msg.length ? ' 🍆🍆' : '🍆🍆';
							}
							break;
						case 'poop':
						case 'crap':
						case 'shit':
						case 'crappy':
						case 'shitty':
							msg += msg.length ? ' 💩💩' : '💩💩';
							break;
						case 'dead':
						case 'skull':
						case 'skulls':
							msg += msg.length ? ' 💀💀' : '💀💀';
							break;
						case 'troll':
						case 'trolls':
						case 'trolling':
							if ( msg.indexOf('https://youtu.be/9zYP8_5IBmU?t=1m47s') == -1 ) {
								msg += msg.length ? ' ' : 'https://youtu.be/9zYP8_5IBmU?t=1m47s';
							}
							break;
						case 'shade':
						case 'shades':
							msg += msg.length ? ' 😎😎' : '😎😎';
							break;
						case 'ghost':
						case 'ghosts':
						case 'halloween':
							msg += msg.length ? ' 👻👻' : '👻👻';
							break;
						case 'nerd':
						case 'nerds':
						case 'nerdy':
							msg += msg.length ? ' 🤓🤓' : '🤓🤓';
							break;
						case 'bah':
						case 'frustrated':
							msg += msg.length ? ' (╯°□°）╯︵ ┻━┻' : '(╯°□°）╯︵ ┻━┻';
							break;
						case 'chill':
						case 'calm':
							if ( ( value == 'calm' && nextword == 'down' ) || ( value == 'chill' && nextword == 'out' ) || value == 'chill' ) {
								msg += msg.length ? ' ┬──┬ ノ(゜-゜ノ)' : '┬──┬ ノ(゜-゜ノ)';
							}
							break;
						case 'hmm':
						case 'wonder':
						case 'thinking':
							msg += msg.length ? ' 🤔🤔' : '🤔🤔';
							break;
						case 'angel':
						case 'innocent':
						case 'harmless':
							msg += msg.length ? ' 😇😇' : '😇😇';
							break;
						case 'shrug':
						case 'shrugs':
							msg += msg.length ? ' ¯\\_(ツ)_/¯' : '¯\\_(ツ)_/¯';
							break;
						case 'yolo':
							msg += msg.length ? ' Yᵒᵘ Oᶰˡʸ Lᶤᵛᵉ Oᶰᶜᵉ' : 'Yᵒᵘ Oᶰˡʸ Lᶤᵛᵉ Oᶰᶜᵉ';
							break;
						case 'hi':
						case 'waves':
						case 'hello':
						case 'greetings':
							var answers = [ 'http://xn--rh8hj8g.ws/hi-queen.gif', 'http://xn--rh8hj8g.ws/hi-goofy.gif', 'http://xn--rh8hj8g.ws/hi-forestgump.gif', 'http://xn--rh8hj8g.ws/hi-picard.gif', 'http://xn--rh8hj8g.ws/hi-ironman.gif' ];
							var answer = answers[ Math.floor( Math.random() * answers.length ) ];
							msg += msg.length ? ' ' + answer : answer;
							break;
						case 'bye':
						case 'goodbye':
						case 'farewell':
							var answers = [ 'http://xn--rh8hj8g.ws/bye-jezebel.gif', 'http://xn--rh8hj8g.ws/bye-jezebel.gif', 'http://xn--rh8hj8g.ws/bye-bitch.gif', 'http://xn--rh8hj8g.ws/bye-woody.gif', 'http://xn--rh8hj8g.ws/bye-clarissa.gif', 'http://xn--rh8hj8g.ws/bye-harrypotter.gif', 'http://xn--rh8hj8g.ws/bye-random.gif' ];
							var answer = answers[ Math.floor( Math.random() * answers.length ) ];
							msg += msg.length ? ' ' + answer : answer;
							break;
						case 'wtf':
						case 'dafuq':
							var answers = [ 'http://xn--rh8hj8g.ws/wtf-baby.png' ];
							var answer = answers[ Math.floor( Math.random() * answers.length ) ];
							msg += msg.length ? ' ' + answer : answer;
							break;
						case 'yas':
						case 'werk':
							var answers = [ 'http://xn--rh8hj8g.ws/yas-werk.gif' ];
							var answer = answers[ Math.floor( Math.random() * answers.length ) ];
							msg += msg.length ? ' ' + answer : answer;
							break;
						case 'smh':
							var answers = [ 'http://xn--rh8hj8g.ws/smh-mjf.png', 'http://xn--rh8hj8g.ws/smh-today.gif', 'http://xn--rh8hj8g.ws/smh-kanye.gif', 'http://xn--rh8hj8g.ws/smh-bbad.gif', 'http://xn--rh8hj8g.ws/smh-drag.gif' ];
							var answer = answers[ Math.floor( Math.random() * answers.length ) ];
							msg += msg.length ? ' ' + answer : answer;
							break;
					}
				});
			}
			if ( msg.length ) bot.say( message.args[0], msg );
		}
	}
});

// Flood protection function (under construction)
function floodCheck( msg ) {
	if ( Array.isArray( flood ) && Array.isArray( flood[ msg.nick ] ) ) {
		var msgs = flood[ msg.nick ];
		// console.log( 'CHECKING EXISTING FLOOD ITEMS' );
		// if ( msgs.length + 1 == config.floodMessages ) {
		// 	// Kick the user or something and clear the array
		// } else {
		// 	// Make an array of times for testing against duration
		// 	var times = [];
		// 	msgs.forEach( function( value, index, array ) {
		// 		times.push( value.time );
		// 	});

		// 	console.log( times );
		// }
	} else {
		// console.log( 'ADDING NEW FLOOD ITEM' );
		flood[ msg.nick ] = [];
		flood[ msg.nick ].push({ time: moment(), nick: msg.nick, user: msg.user, host: msg.host, args: msg.args });
	}
	if ( config.debug ) {
		// console.log( '==============================' );
		// console.log( flood );
	}
}
