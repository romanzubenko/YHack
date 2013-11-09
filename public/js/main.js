(function(){
	'use strict'

	$(document).ready(function(){
		window.socket = io.connect();

		window.socket.on("bing-searchComplete",function(data) {
			console.log("result arrived");
			console.log(data);
		})
	});


	$("#bing-search").submit(function(e){
		e.preventDefault();
		
		var query = $($(this).find("input")).val();
		console.log(query);
		if (query != "") {
			window.socket.emit("bing-search",query);
		}
	});



})(window);



