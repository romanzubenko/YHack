(function(window){
	'use strict'
	window.list = {}


	$(document).ready(function(){
		var socket = window.socket || io.connect();
		window.socket = socket;

		window.socket.on("PHRASE",function(data) {
			console.log("data.phrase")
			console.log(data.phrase)
			if (list[data.phrase] == undefined) {
				var WORD = {
					pointer : null,
					phrase : data.phrase,
					score : data.score
				}
				//console.log("WORD")
				//console.log(WORD)
				var b = $("<li>",{html: "<a node=\"" +WORD.phrase + " \">" +WORD.phrase +"</a><a asl=\"" +WORD.phrase + " \">" +WORD.phrase[1] +"</a>"}).appendTo("#list");
				WORD.pointer = b;
				window.list[WORD.phrase] = WORD;
			} else {
				var WORD = list[phrase.phrase];
				WORD.score  = WORD.score + phrase.score;
				list.WORD.pointer.html(WORD.phrase + " score : " + (WORD.score + data.score));
			}

			if (data.phrase.split(" ").length > 2) {
				window.socket.emit("bing-search",data.phrase);
			}

			var trans = {
				target : window.lang,
				q : data.phrase
			}
			window.socket.emit("translate",trans);


		});
		window.socket.on("translateComplete", function(data) {
			console.log(data[0])
			console.log(window.list)
			
			window.list[data[0]].pointer.append("<a class=\"translation\">Translation : " + data[1] +"</a>");
		});


	});





	function BFS(node,nodes,edges,mass,top) {
		console.log('BFS received')
		console.log(node);
		var CLR = {
			branch:"#b2b19d",
			code:"orange",
			doc:"#922E00",
			demo:"#a7af00"
		};
		var topcolor = "#228FFF",
		color;
		if (top) {
			color =	topcolor;
		} else {
			color = "#77DDFD";
		}
		if (!(typeof node === 'string')) { // if it is node
			console.log("node")
			var label = Object.keys(node)[0],
			child;

			nodes[label] = {color:color, shape:"dot", alpha:1,link:'http://www.bing.com/search?q=' + label, mass : mass};
			top = false;
			edges[label] = {};
			for (var i = node[label].length - 1; i >= 0; i--) {
				child = BFS(node[label][i],nodes,edges,mass - 1,top); // get all children
				edges[label][child] = {length: 0.01}
			};
			return label;

		} else { // if it is leaf
			var leaf = node;
			nodes[leaf] = {color:color, shape:"dot", alpha:1,link:'http://www.bing.com/search?q=' + leaf};
			return leaf;
		}
	}



})(window);
