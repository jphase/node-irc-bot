/*
 *	This file handles 'message' events from the irc client
 */

// Includes
var bot = require( '../bot' );

// Message events
bot.client.addListener( 'message', function( from, to, text, message ) {
	// Debug incoming messages
	if ( bot.config.debug ) {
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
						selector = selector[1];
						var site = str.split( ' ' );
						site = site[0];

						// Scrape the site for contents from selector
						request( site, function( error, response, body ) {
							if ( ! error) {
								// Load bot.jsdom for DOM parsing
								bot.jsdom.env(
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
					}
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
							tell.splice( value, 1 );
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
						console.log( 'KICK ' + message.args[0] + ' ' + str + ' ' + msg );
						bot.send( 'KICK ' + message.args[0] + ' ' + str + ' ' + msg );
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
					bot.google( str + ' site:codex.wordpress.org OR site:developer.wordpress.org', function ( err, next, links ) {
						if ( err && bot.config.debug ) console.error( err );
						// Show the search results
						bot.client.say( to, who ? who + ': ' + links[0].link : from + ': ' + links[0].link );
					});
					break;

				// BAH command
				case 'bah':
					var answers = [ 'http://xn--rh8hj8g.ws/bah-bloody.gif', 'http://xn--rh8hj8g.ws/bah-brave.gif' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.client.say( message.args[0], msg );
					break;

				// Fine command
				case 'fine':
					var answers = [ 'http://xn--rh8hj8g.ws/fine-wednesday.gif' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.client.say( message.args[0], msg );
					break;

				// FML command
				case 'fml':
					var answers = [ 'http://s2.quickmeme.com/img/03/0353203cbc2e18150f8c7f45cb7d64efa57d8ac5bd1059add3576fc94ca702f2.jpg', 'http://i3.kym-cdn.com/photos/images/facebook/000/089/506/128989967490130539.jpg', 'http://img.memecdn.com/fml_o_577538.jpg', 'http://img.memecdn.com/FML-horse_o_141347.jpg', 'http://i0.kym-cdn.com/entries/icons/facebook/000/004/706/FML.jpg', 'http://don.citarella.net/wp-content/uploads/2012/05/sml.jpg', 'https://cdn.meme.am/instances/500x/55087958.jpg', 'https://cdn.meme.am/instances/500x/10377021.jpg', 'http://i2.kym-cdn.com/photos/images/list/000/478/993/5b1.jpg' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.client.say( message.args[0], msg );
					break;

				// Google search
				case 'g':
					if ( bot.config.debug ) console.log( '[Google search] for: ' + str );
					bot.google( str, function ( err, next, links ) {
						if ( err && bot.config.debug ) console.error( err );
						// Show the search results
						if ( links.length ) {
							var msg = who ? who + ': ' + links[0].link : from + ': ' + links[0].link;
						} else {
							var msg = who ? who + ': no Google results found for "' + str + '"' : from + ': no Google results found for "' + str + '"';
						}
						bot.client.say( to, msg );
					});
					break;

				// Hookr.io search
				case 'h':
				case 'hookr':
					if ( bot.config.debug ) console.log( '[Hookr search] for: ' + str );
					bot.google( str + ' site:hookr.io', function ( err, next, links ) {
						if ( err && bot.config.debug ) console.error( err );
						// Show the search results
						bot.client.say( to, who ? who + ': ' + links[0].link : from + ': ' + links[0].link );
					});
					break;

				// JetPack search
				case 'jetpack':
					if ( bot.config.debug ) console.log( '[JetPack search] for: ' + str );
					bot.google( str + ' site:developer.jetpack.com', function ( err, next, links ) {
						if ( err && bot.config.debug ) console.error( err );
						// Show the search results
						if ( typeof links[0] == 'undefined' ) {
							var msg = who ? who + ': no results found for "' + str + '" on developer.jetpack.com' : from + ': no results found for "' + str + '" on developer.jetpack.com';
						} else {
							var msg = who ? who + ': ' + links[0].link : from + ': ' + links[0].link;
						}
						bot.client.say( to, msg );
					});
					break;

				// jQuery API search
				case 'jquery':
					if ( bot.config.debug ) console.log( '[jQuery API search] for: ' + str );
					bot.google( str + ' site:api.jquery.com', function ( err, next, links ) {
						if ( err && bot.config.debug ) console.error( err );
						// Show the search results
						bot.client.say( to, who ? who + ': ' + links[0].link : from + ': ' + links[0].link );
					});
					break;

				// jQuery UI API search
				case 'jqueryui':
					if ( bot.config.debug ) console.log( '[jQuery UI API search] for: ' + str );
					bot.google( str + ' site:jqueryui.com', function ( err, next, links ) {
						if ( err && bot.config.debug ) console.error( err );
						// Show the search results
						bot.client.say( to, who ? who + ': ' + links[0].link : from + ': ' + links[0].link );
					});
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
					bot.google( str + ' wordpress plugin site:https://wordpress.org/plugins', function ( err, next, links ) {
						if ( err && bot.config.debug ) console.error( err );
						if ( bot.config.debug ) console.log( links );
						// Show the search results
						if ( links.length ) {
							bot.client.say( to, who ? who + ': ' + links[0].link : from + ': ' + links[0].link );
						}
					});
					break;

				// Plugin search
				case 'php':
					if ( bot.config.debug ) console.log( '[PHP search] for: ' + str );
					bot.google( str + ' site:http://php.net', function ( err, next, links ) {
						if ( err && bot.config.debug ) console.error( err );
						if ( bot.config.debug ) console.log( links );
						// Show the search results
						if ( links.length ) {
							bot.client.say( to, who ? who + ': ' + links[0].link : from + ': ' + links[0].link );
						}
					});
					break;

				// wpseek.com search
				case 'wps':
				case 'wpseek':
					if ( bot.config.debug ) console.log( '[wpseek.com search] for: ' + str );
					bot.google( str + ' site:wpseek.com', function ( err, next, links ) {
						if ( err && bot.config.debug ) console.error( err );
						// Show the search results
						bot.client.say( to, who ? who + ': ' + links[0].link : from + ': ' + links[0].link );
					});
					break;

				// YouTube search
				case 'y':
				case 'youtube':
					if ( bot.config.debug ) console.log( '[YouTube search] for: ' + str );
					bot.google( str + ' site:youtube.com', function ( err, next, links ) {
						if ( err && bot.config.debug ) console.error( err );
						if ( bot.config.debug ) console.log( links );
						// Show the search results
						if ( links[0].link ) {
							bot.client.say( to, who ? who + ': ' + links[0].link : from + ': ' + links[0].link );
						} else {
							bot.client.say( to, from + ': weird... your search for: "' + str + ' site:youtube.com" yielded this: ' + JSON.stringify( links ) );
						}
					});
					break;

				// Seen command
				case 'seen':
					if ( from != str ) {
						var none = true;
						if ( bot.config.debug ) {
							console.log( '[Seen search] for: ' + str );
							console.log( bot.chans );
							console.log( 'search through:' );
							console.log( bot.config.channels );
						}
						// Check channels first
						bot.config.channels.forEach( function( pvalue, pindex, parray ) {
							// Normalize the case of each user for case insensitive checking
							var chanusers = [];
							for ( var user in bot.chans[ pvalue ].users ) {
								chanusers.push( user.toLowerCase() );
							}

							// Loop through case normalized usernames
							for ( var user in bot.chans[ pvalue ].users ) {
								if ( none && bot.chans[ pvalue ].users.hasOwnProperty( str ) ) {
									bot.client.say( to, who ? who + ': ' + str + ' is currently in ' + pvalue : from + ': ' + str + ' is currently in ' + pvalue );
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
								bot.client.say( to, msg );
								none = false;
							}
						});
						if ( none ) bot.client.say( to, who ? who + ': ' + 'I haven\'t seen ' + str : from + ': ' + 'I haven\'t seen ' + str );
					} else {
						bot.client.say( to, 'That\'s hilarious ' + from + '...' );
					}
					break;

				// SMH command
				case 'smh':
					var answers = [ 'http://xn--rh8hj8g.ws/smh-mjf.png', 'http://xn--rh8hj8g.ws/smh-today.gif', 'http://xn--rh8hj8g.ws/smh-kanye.gif', 'http://xn--rh8hj8g.ws/smh-bbad.gif', 'http://xn--rh8hj8g.ws/smh-drag.gif' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.client.say( message.args[0], msg );
					break;

				// Spooge command
				case 'spooge':
					if ( who ) {
						var msgs = [ '8=👊=D💦', '        💦', '         💦', '        💦💦' ];
						var msg = '';
						// Top line
						for ( var i = 0; i < who.length + 3; i++ ) {
							msg += '💦';
						}
						// Push onto array
						msgs.push( msg );
						msg = '💦';
						// Spaces before name
						for ( var i = 0; i < ( who.length + 4 ) / 2; i++ ) {
							msg += ' ';
						}
						msg += who;
						// Spaces after name
						for ( var i = 0; i < ( who.length + 4 ) / 2; i++ ) {
							msg += ' ';
						}
						msg += '💦';
						// Push onto array
						msgs.push( msg );
						msg = '';
						// Bottom line
						for ( var i = 0; i < who.length + 3; i++ ) {
							msg += '💦';
						}
						msgs.push( msg );
						// Send message
						msgs.forEach( function( value, index, array ) {
							bot.client.say( message.args[0], value );
						});
					}
					break;

				// Tell command
				case 'tell':
					// Make sure their message is setup correctly
					var sendto = str.split(' ')[0];
					// Add .tell message to the tell array
					if ( bot.config.debug ) console.log( '[Tell ' + sendto + '] ' + str  );
					if ( tell.length ) {
						var already = false;
						tell.forEach( function( value, index, array ) {
							if ( value.from == from && value.message == str ) {
								already = true;
							}
						});
						if ( ! already ) {
							msg = 'I\'ll deliver your message to ' + sendto + ' the next time they join.';
							tell.push({ from: from, message: str.replace( sendto + ' ', '' ), date: bot.moment().tz( 'America/New_York' ).format( 'M/DD/YY h:mm:ssa z' ) });
						}
					} else {
						msg = 'I\'ll deliver your message to ' + sendto + ' the next time they join.';
						tell.push({ from: from, message: str.replace( sendto + ' ', '' ), date: bot.moment().tz( 'America/New_York' ).format( 'M/DD/YY h:mm:ssa z' ) });
					}
					var msg = who ? who + ': ' + msg : from + ': ' + msg;
					bot.client.say( message.args[0], msg );
					break;

				// Count command
				case 'count':
					if ( bot.config.debug ) console.log( '[WordPress Count]' );
					request( 'https://wordpress.org/download/counter/?ajaxupdate=1', function( error, response, body ) {
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
					var answers = [ 'https://s-media-cache-ak0.pinimg.com/736x/a9/26/8f/a9268f451c95945e928121cd91c41281.jpg', 'http://reactiongif.org/wp-content/uploads/GIF/2014/08/GIF-bfd-big-deal-dwight-meh-sarcastic-the-office-uncaring-whatever-GIF.gif', 'https://static1.fjcdn.com/thumbnails/comments/Pfft+that+horrible+tattoo+does+_5e04cac8f2e8f5a827be0b3123a888b1.png', 'http://data.whicdn.com/images/196440384/large.jpg', 'https://coydavidson.files.wordpress.com/2012/06/pfft.jpg', 'https://tromoticons.files.wordpress.com/2012/11/yao-ming-pff.png', 'https://cdn.meme.am/instances/500x/50075843.jpg' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.client.say( message.args[0], msg );
					break;

				// Hi command
				case 'hi':
					var answers = [ 'https://s-media-cache-ak0.pinimg.com/originals/7d/8c/8d/7d8c8d1fd7b01d033dcbad20ca6053a5.jpg', 'https://media.giphy.com/media/8vc2rMUDjhy6Y/giphy.gif', 'https://media.giphy.com/media/JGKwzgpKXVYaY/giphy.gif', 'http://p.fod4.com/p/media/15622856b6/YTKd82zSAuXVKbCHrGj5_Star%20Trek%20Patrick%20Stewart.gif', 'http://www.hellocreative.com/images/Hello-Funny.gif', 'https://media.giphy.com/media/rcE4NmvORkx9u/giphy.gif', 'http://p.fod4.com/p/media/15622856b6/blJcJsQKQjGARx7rLGQg_Whale%20Hello.gif' ];
					var answer = answers[ Math.floor( Math.random() * answers.length ) ];
					var msg = who ? who + ': ' + answer : from + ': ' + answer;
					bot.client.say( message.args[0], msg );
					break;

				// Bye command
				case 'bye':
					var answers = [ 'https://janeaustenrunsmylife.files.wordpress.com/2014/02/jezebel_buh-bye_wave-goodbye_brilliantsunrise-pb.gif', 'http://p.fod4.com/p/media/15622856b6/YTKd82zSAuXVKbCHrGj5_Star%20Trek%20Patrick%20Stewart.gif', 'http://25.media.tumblr.com/tumblr_lt3cwzIDoU1qipyqco1_500.gif', 'http://media3.popsugar-assets.com/files/thumbor/Kq9kVeZDktjN26PTW3rBFPtYX8A/fit-in/2048xorig/filters:format_auto.!!.:strip_icc.!!./2014/11/06/317/n/1922283/728c12978f2d92be_tumblr_mwji67R3w71sj1ltqo1_500/i/When-Woody-says-goodbye-you-SOBBED.gif', 'http://p.fod4.com/p/media/15622856b6/Qcz8AXFORCS4NkpouQiT_Clarissa.gif', 'http://lovelace-media.imgix.net/uploads/615/8cf94510-9dba-0133-a027-0e7c926a42af.gif', 'http://i.imgur.com/OZNYKGY.gif' ];
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

				// Emojis #2
				case 'emojis+':
					var msg = '';
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