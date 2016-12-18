module.exports = {};

function randomise( answers ) {
	return answers[ Math.floor( Math.random() * answers.length ) ];
}
function randomiseAndSay( bot, from, to, message, who, answers ) {
	let msg = ( !!who ) ? who : from;
	msg += ': ' + randomise( answers );
	bot.say( message.args[0], msg );
}
/**
 * this is an array of objects.
 * each object needs a `name` parameter and a `handler` parameter.
 */
module.exports.commands = [
	{
		name: '8ball',
		handler: function( bot, from, to, message, who, str ) {
			let answers = [
				'Nope',
				'Fat chance',
				'Most definitely!',
				'Yep',
				'Try again later',
				'How the hell am I supposed to know?',
				'Most likely',
				'Indeed',
				'Not in this lifetime',
				'Pffft... what do you think?',
				'Obviously!'
			];
			randomiseAndSay( bot, from, to, message, who, answers );
		}
	},
	{
		name: 'bah',
		handler: function( bot, from, to, message, who, str ) {
			let answers = [
				'http://xn--rh8hj8g.ws/bah-bloody.gif',
				'http://xn--rh8hj8g.ws/bah-brave.gif'
			];
			randomiseAndSay( bot, from, to, message, who, answers );
		}
	},
	{
		name: 'bye',
		handler: function( bot, from, to, message, who, str ) {
			let answers = [
				'http://xn--rh8hj8g.ws/bye-jezebel.gif',
				'http://xn--rh8hj8g.ws/bye-jezebel.gif',
				'http://xn--rh8hj8g.ws/bye-bitch.gif',
				'http://xn--rh8hj8g.ws/bye-woody.gif',
				'http://xn--rh8hj8g.ws/bye-clarissa.gif',
				'http://xn--rh8hj8g.ws/bye-harrypotter.gif',
				'http://xn--rh8hj8g.ws/bye-random.gif'
			];
			randomiseAndSay( bot, from, to, message, who, answers );
		}
	},
	{
		name: 'facepalm',
		handler: function( bot, from, to, message, who, str ) {
			let answers = [
				'http://4.bp.blogspot.com/-mgnWPcZJcz0/U9K0TnmdyWI/AAAAAAAAD2Q/fpaFlMU5ZOo/s1600/homer_facepalm.jpg',
				'http://static.giantbomb.com/uploads/original/8/88747/1772665-pope_facepalm.jpg',
				'http://memesvault.com/wp-content/uploads/Extreme-Facepalm-Gif-06.png',
				'http://i.imgur.com/wY9Mn.png'
			];
			randomiseAndSay( bot, from, to, message, who, answers );
		}
	},
	{
		name: 'fine',
		handler: function( bot, from, to, message, who, str ) {
			let answers = [ 'http://xn--rh8hj8g.ws/fine-wednesday.gif' ];
			randomiseAndSay( bot, from, to, message, who, answers );
		}
	},
	{
		name: 'fml',
		handler: function( bot, from, to, message, who, str ) {
			let answers = [
				'http://s2.quickmeme.com/img/03/0353203cbc2e18150f8c7f45cb7d64efa57d8ac5bd1059add3576fc94ca702f2.jpg',
				'http://i3.kym-cdn.com/photos/images/facebook/000/089/506/128989967490130539.jpg',
				'http://img.memecdn.com/fml_o_577538.jpg',
				'http://img.memecdn.com/FML-horse_o_141347.jpg',
				'http://i0.kym-cdn.com/entries/icons/facebook/000/004/706/FML.jpg',
				'http://don.citarella.net/wp-content/uploads/2012/05/sml.jpg',
				'https://cdn.meme.am/instances/500x/55087958.jpg',
				'https://cdn.meme.am/instances/500x/10377021.jpg',
				'http://i2.kym-cdn.com/photos/images/list/000/478/993/5b1.jpg'
			];
			randomiseAndSay( bot, from, to, message, who, answers );
		}
	},
	{
		name: 'hi',
		handler: function( bot, from, to, message, who, str ) {
			let answers = [
				'http://xn--rh8hj8g.ws/hi-queen.gif',
				'http://xn--rh8hj8g.ws/hi-goofy.gif',
				'http://xn--rh8hj8g.ws/hi-forestgump.gif',
				'http://xn--rh8hj8g.ws/hi-picard.gif',
				'http://xn--rh8hj8g.ws/hi-ironman.gif'
			];
			randomiseAndSay( bot, from, to, message, who, answers );
		}
	},
	{
		name: ['trollolloll', 'trollsong', 'troll'],
		handler: function( bot, from, to, message, who, str ) {
			let answers = [ 'https://youtu.be/9zYP8_5IBmU?t=1m47s' ];
			randomiseAndSay( bot, from, to, message, who, answers );
		}
	},
	{
		name: [ 'pfft', 'pff', 'pft', 'pf' ],
		handler: function( bot, from, to, message, who, str ) {
			let answers = [
				'https://s-media-cache-ak0.pinimg.com/736x/a9/26/8f/a9268f451c95945e928121cd91c41281.jpg',
				'http://reactiongif.org/wp-content/uploads/GIF/2014/08/GIF-bfd-big-deal-dwight-meh-sarcastic-the-office-uncaring-whatever-GIF.gif',
				'https://static1.fjcdn.com/thumbnails/comments/Pfft+that+horrible+tattoo+does+_5e04cac8f2e8f5a827be0b3123a888b1.png',
				'http://data.whicdn.com/images/196440384/large.jpg',
				'https://coydavidson.files.wordpress.com/2012/06/pfft.jpg',
				'https://tromoticons.files.wordpress.com/2012/11/yao-ming-pff.png',
				'https://cdn.meme.am/instances/500x/50075843.jpg'
			];
			randomiseAndSay( bot, from, to, message, who, answers );
		}
	},
	{
		name: 'smh',
		handler: function( bot, from, to, message, who, str ) {
			let answers = [
				'http://xn--rh8hj8g.ws/smh-mjf.png',
				'http://xn--rh8hj8g.ws/smh-today.gif',
				'http://xn--rh8hj8g.ws/smh-kanye.gif',
				'http://xn--rh8hj8g.ws/smh-bbad.gif',
				'http://xn--rh8hj8g.ws/smh-drag.gif'
			];
			randomiseAndSay( bot, from, to, message, who, answers );
		}
	},
	{
		name: 'wat',
		handler: function( bot, from, to, message, who, str ) {
			let answers = [ 'http://xn--rh8hj8g.ws/wat-shrunkenface.jpg' ];
			randomiseAndSay( bot, from, to, message, who, answers );
		}
	},
	{
		name: 'wtf',
		handler: function( bot, from, to, message, who, str ) {
			let answers = [ 'http://xn--rh8hj8g.ws/wtf-baby.png' ];
			randomiseAndSay( bot, from, to, message, who, answers );
		}
	},
	{
		name: 'yas',
		handler: function( bot, from, to, message, who, str ) {
			let answers = [ 'http://xn--rh8hj8g.ws/yas-werk.gif' ];
			randomiseAndSay( bot, from, to, message, who, answers );
		}
	},
	{
		name: [ 'yay', 'yey' ],
		handler: function( bot, from, to, message, who, str ) {
			let answers = [ 'http://xn--rh8hj8g.ws/yay-homer.jpg' ];
			randomiseAndSay( bot, from, to, message, who, answers );
		}
	}
];

/**
 * this is an array of functions.
 */
module.exports.filters = [
	function( bot, from, to, message, who, text ) {
		// React to parts of their string if it contains certain text
		let msg = '';
		let prefix = ( !!who ) ? who + ': ' : '';
		let reactions = text.match( /(\w+)/g );

		for ( reaction of reactions ) {
			switch ( reaction ) {
				case 'hi':
				case 'waves':
				case 'hello':
				case 'greetings':
					let answers = [
						'http://xn--rh8hj8g.ws/hi-queen.gif',
						'http://xn--rh8hj8g.ws/hi-goofy.gif',
						'http://xn--rh8hj8g.ws/hi-forestgump.gif',
						'http://xn--rh8hj8g.ws/hi-picard.gif',
						'http://xn--rh8hj8g.ws/hi-ironman.gif'
					];
					msg += answer + ' ';
					break;
				case 'bye':
				case 'goodbye':
				case 'farewell':
					let answers = [
						'http://xn--rh8hj8g.ws/bye-jezebel.gif',
						'http://xn--rh8hj8g.ws/bye-jezebel.gif',
						'http://xn--rh8hj8g.ws/bye-bitch.gif',
						'http://xn--rh8hj8g.ws/bye-woody.gif',
						'http://xn--rh8hj8g.ws/bye-clarissa.gif',
						'http://xn--rh8hj8g.ws/bye-harrypotter.gif',
						'http://xn--rh8hj8g.ws/bye-random.gif'
					];
					msg += randomise( answers ) + ' ';
					break;
				case 'wtf':
				case 'dafuq':
					let answers = [ 'http://xn--rh8hj8g.ws/wtf-baby.png' ];
					msg += randomise( answers ) + ' ';
					break;
				case 'yas':
				case 'werk':
					let answers = [ 'http://xn--rh8hj8g.ws/yas-werk.gif' ]
					msg += randomise( answers ) + ' ';
					break;
				case 'smh':
					let answers = [
						'http://xn--rh8hj8g.ws/smh-mjf.png',
						'http://xn--rh8hj8g.ws/smh-today.gif',
						'http://xn--rh8hj8g.ws/smh-kanye.gif',
						'http://xn--rh8hj8g.ws/smh-bbad.gif',
						'http://xn--rh8hj8g.ws/smh-drag.gif'
					];
					msg += randomise( answers ) + ' ';
					break;
			}
		}
		if ( !!msg ) {
			bot.say( message[0], prefix + msg );
		}
	}
];
