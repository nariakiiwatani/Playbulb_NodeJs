/*
Copyright 2017 nariakiiwatani

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/
'use strict';
var Playbulb = require('./playbulb');
var osc = require('osc');

var udpPort = new osc.UDPPort({
	localAddress: "0.0.0.0",
	localPort: 9000,
});

var pb = new Playbulb.Smart();
pb.ready(function () {
	var blightness_cache = 0;
	pb.setBlightness(0);
	console.log("playbulb ready");
	process.on("SIGINT", function() {
		pb.setBlightness(0);
		setTimeout(process.exit, 1000, 128+2);
	});

	var fade_timer;
	var fading = function(blightness, timef) {
		clearTimeout(fade_timer);
		blightness = Math.max(0,Math.min(20,blightness));
		var diff = blightness-blightness_cache;
		if(diff === 0) return;
		var deltatime = timef/(Math.abs(diff)-1);
		if(diff>0) {
			pb.increase(function(){ blightness_cache+=1; });
		}
		else {
			pb.decrease(function(){ blightness_cache-=1; });
		}
		fade_timer = setTimeout(fading, deltatime*1000, blightness, timef-deltatime);
	};
	var setBlightness = function(blightness) {
		clearTimeout(fade_timer);
		pb.setBlightness(blightness, function(){ blightness_cache = blightness; });
	}

	// Listen for incoming OSC bundles.
	udpPort.on("message", function (message, timeTag, info) {
		console.log("An OSC message just arrived for time tag", timeTag, ":", message);
		console.log("Remote info is: ", info);
		switch(message.address) {
			case "/fade":
				fading(message.args[0], message.args[1]);
				break;
			case "/set":
				setBlightness(message.args[0]);
				break;
		}
	});
});

// Open the socket.
udpPort.open();


