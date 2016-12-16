var fs = require( 'fs' );

var files = fs.readdirSync( __dirname );

module.exports = []

var re = /\.js$/;
files.forEach( function(file) {
	if ( file.match( re ) ) {
		module.exports.push( require( './' + file ) );
	}
} );
