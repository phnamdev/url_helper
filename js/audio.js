//Audio object
var Audio = {};
Audio.audio = {
	AudioPlayState : false,
	checkForValidUrl : function(tabId, changeInfo, tab) {
		return true;
	},
};

var adl = {
	audiolist : new Object(),
	urllist : new Object(),
	urlPlaying : new Object(),
	downloadlist : new Object(),
	audioHandler : [{
		mime : "mp3",
		urlParts : ["mp3"],
		isAudio : true,
		priority : 1
	}, {
		mime : "wma",
		urlParts : [""],
		isAudio : true,
		priority : 1
	}, {
		mime : "wav",
		urlParts : ["wav"],
		isAudio : true,
		priority : 1
	}, {
		mime : "ogg",
		urlParts : [""],
		isAudio : true,
		priority : 1
	}, {
		mime : "mpeg",
		urlParts : ["mp3"],
		isAudio : true,
		priority : 1
	}, {
		mime : "octet-stream",
		urlParts : ["mp3", "wav"],
		isAudio : true,
		priority : 1
	}]
};
