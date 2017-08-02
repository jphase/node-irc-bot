/*
 *	This file handles 'message' events from the irc client
 */

// Includes
var bot = require( '../bot' );

// Message events
bot.client.addListener( 'message', function( from, to, text, message ) {
	// Debug incoming messages
	if ( false && bot.config.debug ) {
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
	if ( to == bot.client.nick ) {
		// Private message handler
		if ( bot.config.debug ) console.log( 'Private Message Handler!!' );
		bot.client.say( from, 'Hey ' + from + '... I\'m a bot and I\'m not currently programmed to handle your private messages. Check back soon.' );
	} else {
		// Public message handler

		// Check for flooding
		// floodCheck( message );

		// Check for admin
		var isAdmin = false;
		if ( bot.config.admins.length ) {
			bot.config.admins.forEach( function( value, index, array ) {
				if ( value.trim().toLowerCase() == from.trim().toLowerCase() ) {
					isAdmin = true;
				}
			});
		}

		// Check for ignored
		var isIgnored = false;
		if ( bot.config.ignore.length ) {
			bot.config.ignore.forEach( function( value, index, array ) {
				if ( value.trim().toLowerCase() == from.trim().toLowerCase() ) {
					isIgnored = true;
				}
			});
		}

		// Break up command string
		var command = text.match( /^\.(\w+)/ );
		if ( bot.config.debug ) console.log( 'Public Message Handler!!' );
		if ( bot.config.debug ) console.log( command );

		// Log all channel messages
		if ( bot.config.log ) console.log( '[' + to + '] ' + from + ': ' + text + ' - ' + bot.moment().format() );

		// Check if this message needs to be ignored
		if ( ( isIgnored && ! isAdmin ) || bot.config.muted.indexOf( message.args[0] ) > -1 ) {
			return;
		} else if ( bot.config.debug ) {
			console.log( 'ignored:', isIgnored );
			console.log( 'admin:', isAdmin );
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
			if ( bot.config.debug ) {
				console.log( 'cmd: ' + cmd );
				console.log( 'str: ' + str );
				console.log( 'who: ' + who );
			}

			// Process command
			switch ( cmd ) {
				// Scrape
				case 'scrape':
					if ( isAdmin ) {
						// Setup site and selector
						var selector = str.match( /'(.*)'/ );
						if ( selector != null ) {
							console.log( selector );
							selector = selector[1];
							var site = str.split( ' ' );
							site = site[0];

							// Scrape the site for contents from selector
							bot.request( site, function( error, response, body ) {
								if ( ! error) {
									// Load bot.jsdom for DOM parsing
									bot.dom.env(
										body,
										[ 'http://code.jquery.com/jquery-2.2.3.min.js' ],
										function( err, window ) {
											if ( err ) console.log( 'err:', err );
											var $ = window.jQuery;
											console.log( 'body:', $('body').html() );
											var msg = $( selector ).text();
											bot.client.say( message.args[0], who ? who + ': ' + msg : msg );
										}
									);
								} else {
									console.log( error );
								}
							});
						} else {
							console.log( selector )
						}
					}
					break;

				// Watch
				case 'watch':
					if ( isAdmin ) {

					}
					break;

				// Watch
				case 'ip':
					if ( isAdmin ) {
						console.log( bot.client );
					}
					break;

				// Inbox
				case 'inbox':
					// Check for pending .tell commands for this user
					var msg = '';
					var told = [];
					var inbox = [];

					// Loop through each message and build one big message to deliver to the user
					bot.tell.list().forEach( function( value, index, array ) {
						if ( value.from == from && told.length < 4 ) {
							if ( bot.config.debug ) console.log( 'Delivering .tell message #' + index + ' to ' + from );
							msg = '[' + value.from + ' ' + value.date + ']: ' + value.message;
							inbox.push( msg );
							told.push( index );
						}
					});

					// Display their messages without flooding the channel
					if ( inbox.length > 4 ) {
						if ( bot.config.debug ) console.log( '> 4 messages in inbox' );
						for ( var i = 0; i < 4; i++ ) {
							bot.client.say( message.args[0], from + ': ' + inbox[ i ] );
						}
						for ( var i = 0; i < 4; i++ ) {
							inbox.shift();
						}
					} else if ( ! inbox.length ) {
						bot.client.say( message.args[0], from + ': you have no messages in your inbox' );
					} else {
						if ( bot.config.debug ) console.log( inbox.length + ' messages in inbox' );
						inbox.forEach( function( value, index, array ) {
							bot.client.say( message.args[0], from + ': ' + inbox[ index ] );
						});
					}

					// Remove the messages that have been delivered
					if ( told.length ) {
						told.forEach( function( value, index, array ) {
							bot.tell.list().splice( value, 1 );
						});
					}
					break;

				// Ignore
				case 'ignore':
					if ( isAdmin ) {
						var msg = '';
						// Ignore the ignore request if they're trying to ignore an admin
						if ( bot.config.admins.length ) {
							bot.config.admins.forEach( function( value, index, array ) {
								if ( value.trim().toLowerCase() == str.toLowerCase() ) {
									msg = str + ' is an admin and admins cannot be ignored';
								}
							});
						}

						// Ignore them if they're not an admin, let the user know they're already ignored otherwise
						if ( ! msg.length && bot.config.ignore.length ) {
							if ( bot.config.ignore.indexOf( str ) > -1 ) {
								msg = str + ' is already being ignored';
							} else {
								bot.config.ignore.push( str );
								msg = str + ' is now being ignored';
							}
						}

						// Send ignored message
						bot.client.say( message.args[0], msg );
					}
					break;

				// Unignore
				case 'unignore':
					if ( isAdmin ) {
						var msg = '';
						// Ignore the ignore request if they're trying to ignore an admin
						if ( bot.config.admins.length ) {
							bot.config.admins.forEach( function( value, index, array ) {
								if ( value.trim().toLowerCase() == str.toLowerCase() ) {
									msg = str + ' is an admin and admins cannot be ignored';
								}
							});
						}

						// Unignore them if they're not an admin, let the user know they're already unignored otherwise
						if ( ! msg.length && bot.config.ignore.length ) {
							if ( bot.config.ignore.indexOf( str ) > -1 ) {
								bot.config.ignore.splice( bot.config.ignore.indexOf( str ), 1 );
								msg = str + ' is no longer being ignored';
							} else {
								msg = str + ' is not being ignored';
							}
						}

						// Send ignored message
						bot.client.say( message.args[0], msg );
					}
					break;

				// Op
				case 'op':
					if ( isAdmin ) {
						// Op the user
						var nick = str.length ? str : from;
						if ( bot.config.debug ) console.log( 'OP ' + message.args[0] + ' ' + nick + ' ' + msg );
						bot.client.send( 'OP ' + message.args[0] + ' ' + nick );
					}
					break;

				// Kick
				case 'kick':
					if ( isAdmin ) {
						// Grab the kick message from the end of the string
						msg = str.split(' ');
						if ( msg.length > 1 ) {
							str = msg[0];
							msg.splice( 0, 1 );
							msg = msg.join(' ');
						}

						// Kick the user
						if ( bot.config.debug ) console.log( 'KICK ' + message.args[0] + ' ' + str + ' ' + msg );
						bot.client.send( 'KICK ' + message.args[0] + ' ' + str + ' ' + msg );
					}
					break;

				// Help
				case 'help':
					var commands = [ '.g', '.c', '.p', '.seen', '.tell', '.first', '.paste', '.hierarchy', '._', '.blame', '.ask', '.say' ];
					var helpstr = 'Available Commands: ' + commands.join( ', ' );
					bot.client.say( who ? who : from, helpstr );
					console.log( 'sending help message to: ' + who ? who : from );
					break;

				// Codex search
				case 'c':
				case 'codex':
					if ( bot.config.debug ) console.log( '[Codex search] for: ' + str );
					bot.search( ['https://codex.wordpress.org', 'https://developer.wordpress.org'], message.args[0], who, from, str );
					break;

				// BAH command
				case 'bah':
					var answers = [ 'http://robido.com/img/bah-bloody.gif', 'http://robido.com/img/bah-brave.gif' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.client.say( message.args[0], msg );
					break;

				// Fine command
				case 'fine':
					var answers = [ 'http://robido.com/img/fine-wednesday.gif' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.client.say( message.args[0], msg );
					break;

				// FML command
				case 'fml':
					var answers = [ 'http://robido.com/img/fml-monkey.jpg', 'http://robido.com/img/fml-baby.png', 'http://robido.com/img/fml-horse.png', 'http://robido.com/img/fml.jpg', 'http://robido.com/img/fml-smurf.jpg', 'http://robido.com/img/fml-stupid.png', 'http://robido.com/img/fml-spongebob.png', 'http://robido.com/img/fml-flife.jpg' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.client.say( message.args[0], msg );
					break;

				// Google search
				case 'g':
					if ( bot.config.debug ) console.log( '[Google search] for: ' + str );
					var results = bot.search( '', message.args[0], who, from, str );
					console.log(results);

					// bot.google( str, function ( err, next, links ) {
					// 	if ( err && bot.config.debug ) console.error( err );
					// 	// Show the search results
					// 	if ( links.length ) {
					// 		var msg = who ? who + ': ' + links[0].link : from + ': ' + links[0].link;
					// 	} else {
					// 		var msg = who ? who + ': no Google results found for "' + str + '"' : from + ': no Google results found for "' + str + '"';
					// 	}
					// 	bot.client.say( to, msg );
					// });
					break;

				// Hookr.io search
				case 'h':
				case 'hookr':
					if ( bot.config.debug ) console.log( '[Hookr search] for: ' + str );
					bot.search( 'hookr.io', message.args[0], who, from, str );
					break;

				// JetPack search
				case 'jetpack':
					if ( bot.config.debug ) console.log( '[JetPack search] for: ' + str );
					bot.search( 'developer.jetpack.com', message.args[0], who, from, str );
					break;

				// jQuery API search
				case 'jquery':
					if ( bot.config.debug ) console.log( '[jQuery API search] for: ' + str );
					bot.search( 'api.jquery.com', message.args[0], who, from, str );
					break;

				// jQuery UI API search
				case 'jqueryui':
					if ( bot.config.debug ) console.log( '[jQuery UI API search] for: ' + str );
					bot.search( 'jqueryui.com', message.args[0], who, from, str );
					break;

				// lmgtfy.com search
				case 'l':
				case 'lmgtfy':
					if ( bot.config.debug ) console.log( '[lmgtfy.com search] for: ' + str );
					// Show the search results
					var link = 'http://lmgtfy.com/?q=' + encodeURIComponent( str );
					bot.client.say( to, who ? who + ': ' + link : from + ': ' + link );
					break;

				// Plugin search
				case 'p':
					if ( bot.config.debug ) console.log( '[Plugin search] for: ' + str );
					bot.search( 'wordpress.org/plugins', message.args[0], who, from, str );
					break;

				// PHP.net search
				case 'php':
					if ( bot.config.debug ) console.log( '[PHP search] for: ' + str );
					bot.search( 'php.net', message.args[0], who, from, str );
					break;

				// wpseek.com search
				case 'wps':
				case 'wpseek':
					if ( bot.config.debug ) console.log( '[wpseek.com search] for: ' + str );
					bot.search( 'wpseek.com', message.args[0], who, from, str );
					break;

				// soundcloud.com search
				case 'sc':
				case 'soundcloud':
					if ( bot.config.debug ) console.log( '[soundcloud.com search] for: ' + str );
					bot.search( 'soundcloud.com', message.args[0], who, from, str );
					break;

				// spotify.com search
				case 'sp':
				case 'spotify':
					if ( bot.config.debug ) console.log( '[spotify.com search] for: ' + str );
					bot.search( 'spotify.com', message.args[0], who, from, str );
					break;

				// YouTube search
				case 'y':
				case 'yt':
				case 'youtube':
					if ( bot.config.debug ) console.log( '[YouTube search] for: ' + str );
					bot.search( 'youtube.com', message.args[0], who, from, str );
					break;

				// Seen command
				case 'seen':
					if ( from != str ) {
						// Search for the user in the channels the bot is currently in
						bot.seen.search( str, message.args[0], who, from );
					} else {
						// Laugh at the user
						bot.client.say( to, 'That\'s hilarious ' + from + '...' );
					}
					break;

				// SMH command
				case 'smh':
					var answers = [ 'http://robido.com/img/smh-oprah.gif', 'http://robido.com/img/smh-office.gif', 'http://robido.com/img/smh-mjf.png', 'http://robido.com/img/smh-today.gif', 'http://robido.com/img/smh-kanye.gif', 'http://robido.com/img/smh-bbad.gif', 'http://robido.com/img/smh-drag.gif' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.client.say( message.args[0], msg );
					break;

				// Shade command
				case 'shade':
					var answers = [ 'http://robido.com/img/shade-allstars.gif', 'http://robido.com/img/shade-city.gif' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.client.say( message.args[0], msg );
					break;

				// Shame command
				case 'shame':
					var answers = [ 'http://robido.com/img/shame.png' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.client.say( message.args[0], msg );
					break;

				// Tell command
				case 'tell':
					// Make sure their message is setup correctly
					var sendto = str.split(' ')[0];
					// Add .tell message to the tell array
					if ( bot.config.debug ) console.log( '[Tell ' + sendto + '] ' + str  );
					if ( bot.tell.list().length ) {
						var already = false;
						bot.tell.list().forEach( function( value, index, array ) {
							if ( value.from == from && value.message == str ) {
								already = true;
							}
						});
						if ( ! already ) {
							msg = 'I\'ll deliver your message to ' + sendto + ' the next time they join.';
							bot.tell.add( from, sendto, str.replace( sendto + ' ', '' ) );
						}
					} else {
						msg = 'I\'ll deliver your message to ' + sendto + ' the next time they join.';
						bot.tell.add( from, sendto, str.replace( sendto + ' ', '' ) );
					}
					var msg = who ? who + ': ' + msg : from + ': ' + msg;
					bot.client.say( message.args[0], msg );
					break;

				// Count command
				case 'count':
					if ( bot.config.debug ) console.log( '[WordPress Count]' );
					bot.request( 'https://wordpress.org/download/counter/?ajaxupdate=1', function( error, response, body ) {
						if ( ! error) {
							var msg = 'WordPress has been downloaded ' + body + ' times.';
							bot.client.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
						}
					});
					break;

				// Facepalm command
				case 'facepalm':
					var answers = [ 'http://4.bp.blogspot.com/-mgnWPcZJcz0/U9K0TnmdyWI/AAAAAAAAD2Q/fpaFlMU5ZOo/s1600/homer_facepalm.jpg', 'http://static.giantbomb.com/uploads/original/8/88747/1772665-pope_facepalm.jpg', 'http://memesvault.com/wp-content/uploads/Extreme-Facepalm-Gif-06.png', 'http://i.imgur.com/wY9Mn.png' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.client.say( message.args[0], msg );
					break;

				// First command
				case 'first':
					var msg = 'Please attempt to disable all plugins, and use one of the default (Twenty*) themes. If the problem goes away, enable them one by one to identify the source of your troubles.';
					bot.client.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
					break;

				// Moving command
				case 'moving':
				case 'move':
					var msg = 'If you rename the WordPress directory on your server, switch ports or change the hostname http://codex.wordpress.org/Moving_WordPress applies';
					bot.client.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
					break;

				// Inspect command
				case 'inspect':
					var msg = 'Please use the built-in Developer Tools of your browser to fix problems with your website. Right click your page and pick Inspect Element (Cr, FF, Op) or press F12-button (IE) to track down CSS problems. Use the console to see JavaScript bugs.';
					bot.client.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
					break;

				// Paste command
				case 'paste':
					var msg = 'Please use http://wpbin.io to paste your multi-line code samples';
					bot.client.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
					break;

				// Asking command
				case 'asking':
					var msg = 'When asking a question make sure to include the following information: 1) What you want to achieve. 2) How you are attempting to achieve it. 3) What you expect to happen. 4) What is actually happening.';
					bot.client.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
					break;

				// Linking command
				case 'linking':
					var msg = 'When linking to your website while asking for help, please tell us specifically where to look on the website and what to click to initiate the interaction you are trying to fix';
					bot.client.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
					break;

				// Hierarchy command
				case 'hierarchy':
					var msg = 'Please refer to the WordPress template hierarchy https://developer.wordpress.org/themes/basics/template-hierarchy/';
					bot.client.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
					break;

				// Underscores command
				case '_':
					var msg = 'Check out the Underscores base theme http://underscores.me';
					bot.client.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
					break;

				// 8ball
				case '8ball':
					var answers = [ 'Nope', 'Fat chance', 'Most definitely!', 'Yep', 'Try again later', 'How the hell am I supposed to know?', 'Most likely', 'Indeed', 'Not in this lifetime', 'Pffft... what do you think?', 'Obviously!' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.client.say( message.args[0], msg );
					break;

				// Cry command
				case 'cry':
					var prefix = who ? who + ': ' : '';
					var msg = prefix + '(╯︵╰,)';
					bot.client.say( message.args[0], msg );
					break;

				// Meh command
				case 'meh':
				case 'glare':
					var prefix = who ? who + ': ' : '';
					var msg = prefix + 'ಠ_ಠ';
					bot.client.say( message.args[0], msg );
					break;

				// Blame command
				case 'blame':
					if ( str == bot.nick ) {
						var msg = "That's hilarious...";
					} else {
						var msg = who ? who + ': ' + 'It\'s all ' + str + '\'s fault!' : 'It\'s all ' + str + '\'s fault!';
					}
					bot.client.say( message.args[0], msg );
					break;

				// Flip command
				case 'flip':
					var prefix = who ? who + ': ' : '';
					if ( str == '.flip!' ) {
						var msg = prefix + '┻━┻︵  \\(°□°)/ ︵ ┻━┻';
					} else {
						var msg = prefix + '(╯°□°）╯︵ ┻━┻';
					}
					bot.client.say( message.args[0], msg );
					break;

				// Shrug command
				case 'shrug':
					var prefix = who ? who + ': ' : '';
					var msg = prefix + '¯\\_(ツ)_/¯';
					bot.client.say( message.args[0], msg );
					break;

				// YOLO command
				case 'yolo':
					var prefix = who ? who + ': ' : '';
					var msg = prefix + 'Yᵒᵘ Oᶰˡʸ Lᶤᵛᵉ Oᶰᶜᵉ';
					bot.client.say( message.args[0], msg );
					break;

				// Pfft command
				case 'pfft':
				case 'pff':
				case 'pft':
				case 'pf':
					var answers = [ 'http://robido.com/img/pff-baby.jpg', 'http://robido.com/img/pff-petergriffin.jpg', 'http://robido.com/img/pfft.jpg', 'http://robido.com/img/yaobama.png', 'http://robido.com/img/pff-dog.jpg' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.client.say( message.args[0], msg );
					break;

				// Hi command
				case 'hi':
					var answers = [ 'http://robido.com/img/hi-queen.gif', 'http://robido.com/img/hi-goofy.gif', 'https://robido.com/img/hi-forest.gif', 'http://robido.com/img/hi-picard.gif', 'http://robido.com/img/hi-ironman.gif', 'http://robido.com/img/hi-whale.gif' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.client.say( message.args[0], msg );
					break;

				// Bye command
				case 'bye':
					var answers = [ 'http://robido.com/img/bye-jezebel.gif', 'http://robido.com/img/bye-picard.gif', 'http://robido.com/img/bye-bitch.gif', 'http://robido.com/img/bye-woody.gif', 'http://robido.com/img/bye-clarissa.gif', 'http://robido.com/img/bye-harrypotter.gif', 'http://robido.com/img/bye-random.gif' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.client.say( message.args[0], msg );
					break;

				// Party command
				case 'dance':
				case 'party':
				case 'boogie':
					var prefix = who ? who + ': ' : '';
					var msg = prefix + '┏(-_-)┛┗(-_-﻿)┓┗(-_-)┛┏(-_-)┓';
					bot.client.say( message.args[0], msg );
					break;

				// Finger command
				case 'finger':
					var prefix = who ? who + ': ' : '';
					var msg = prefix + '╭∩╮(ಠ_ಠ)╭∩╮';
					bot.client.say( message.args[0], msg );
					break;

				// Emojis #1
				case 'emojis':
					var msg = '😀😬😁😂😃😄😅😆😌😋🙃🙂😊😉😇😍😘😗😙😚😜😝😛😑😐😶😏🤗😎🤓🤑😒🙄🤔😳😞😟😠😡😩😫😖😣☹🙁😕😔😤😮😱😨😰😯😦😧😢😥😪😓😭😵😲🤐👿😈💩💤😴🤕🤒😷👹👺💀👻👽🤖😺😸🙌😾😿🙀😽😼😻😹🙌🏻🙌🏼🙌🏽🙌🏾🙌🏿👏👏🏻👏🏼👏🏽👏🏾👏🏿';
					bot.client.say( message.args[0], msg );
					break;

				// Ask command
				case 'ask':
					var msg = 'Go ahead and ask your question. Asking to ask just takes extra time ;)';
					bot.client.say( message.args[0], who ? who + ': ' + msg : from + ': ' + msg );
					break;

				// Just a say command
				case 'say':
					bot.client.say( message.args[0], who ? who + ': ' + str : str );
					break;
			}
		}
	}
});