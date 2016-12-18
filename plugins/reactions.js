var config = require( '../config' );

module.exports.filters = [];

module.exports.filters.push( function( bot, from, to, message, who, text ) {
	// React to parts of their string if it contains certain text
	var msg = '';
	var prefix = who ? who + ': ' : '';
	var reactions = text.match( /(\w+)/g );

	function addMsg( text ) {
		if (!!text) {
			msg += text + ' ';
		}
	}

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
					addMsg('(╯︵╰,)');
					break;
				case 'party':
				case 'dance':
				case 'boogie':
					addMsg('┏(-_-)┛┗(-_-﻿)┓┗(-_-)┛┏(-_-)┓');
					break;
				case 'fuck':
				case 'finger':
					if ( value != 'fuck' || ( nextword == 'you' || nextword == 'off' ) ) {
						addMsg('╭∩╮（︶︿︶）╭∩╮');
					} else if ( value == 'fuck' && ( nextword == 'this' || nextword == 'life' ) ) {
						addMsg('(╯°□°）╯︵ ┻━┻');
					} else if ( value == 'fuck' ) {
						addMsg('🍆🍆');
					}
					break;
				case 'poop':
				case 'crap':
				case 'shit':
				case 'crappy':
				case 'shitty':
					addMsg('💩💩');
					break;
				case 'dead':
				case 'skull':
				case 'skulls':
					addMsg('💀💀');
					break;
				case 'troll':
				case 'trolls':
				case 'trolling':
					if ( msg.indexOf('https://youtu.be/9zYP8_5IBmU?t=1m47s') == -1 ) {
						addMsg('https://youtu.be/9zYP8_5IBmU?t=1m47s');
					}
					break;
				case 'shade':
				case 'shades':
					addMsg('😎😎');
					break;
				case 'ghost':
				case 'ghosts':
				case 'halloween':
					addMsg('👻👻');
					break;
				case 'nerd':
				case 'nerds':
				case 'nerdy':
					addMsg('🤓🤓');
					break;
				case 'bah':
				case 'frustrated':
					addMsg('(╯°□°）╯︵ ┻━┻');
					break;
				case 'chill':
				case 'calm':
					if ( ( value == 'calm' && nextword == 'down' ) || ( value == 'chill' && nextword == 'out' ) || value == 'chill' ) {
						addMsg('┬──┬ ノ(゜-゜ノ)');
					}
					break;
				case 'hmm':
				case 'wonder':
				case 'thinking':
					addMsg('🤔🤔');
					break;
				case 'angel':
				case 'innocent':
				case 'harmless':
					addMsg('😇😇');
					break;
				case 'shrug':
				case 'shrugs':
					addMSg('¯\\_(ツ)_/¯');
					break;
				case 'yolo':
					addMsg('Yᵒᵘ Oᶰˡʸ Lᶤᵛᵉ Oᶰᶜᵉ');
					break;
			}
		});
		if (!!msg) {
			bot.say( message[0], prefix + msg );
		}
	}
});
