$(document).on("click", "a[asl]", function(e){

	console.log("SHIT");
	var queue = [];

	var word = $(e.target).attr("asl").replace(/\W/g, '').toLowerCase();
	for(char c : word.toCharArray()) {
		console.log(c);
	}

});

name = name.toLowerCase()
var alphabet = new Array('a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z');
//console.log('alph',alphabet)
alp = alphabet;
word_loc = -1;
videoPlayer = document.getElementById("homevideo");

function run(){
				word_loc++;
				alphLoc = getLetterIndex(word_loc);
				if (word_loc == name.length) window.location = "http://localhost:3000";
				var nextVideo = "video/"+alp[alphLoc]+".mp4";
				videoPlayer.src = nextVideo;
				videoPlayer.play();
	 };

function getLetterIndex(a) {
	var letter = name.charAt(a)
	var loc = alp.indexOf(letter);
	console.log(loc)
	return loc
}
