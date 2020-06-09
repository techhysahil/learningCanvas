function fakeAjax(url,cb) {
	var fake_responses = {
		"file1": "The first text",
		"file2": "The middle text",
		"file3": "The last text"
	};
	var randomDelay = (Math.round(Math.random() * 1E4) % 8000) + 1000;

	console.log("Requesting: " + url);

	setTimeout(function(){
		cb(fake_responses[url]);
	},randomDelay);
}

function output(text) {
	console.log(text);
}

// **************************************
// The old-n-busted callback way

let store = {};
let incomingQueue = [];
let outputQueue = [];

function getFile(file) {
	incomingQueue.push(file);
	fakeAjax(file,function(text){
		// what do we do here?
		store[file] = text;
		outputQueue.push(file);

		//Checking and output
		checkAndLog(file);
	});
}

function checkAndLog(file){
	if(file === incomingQueue[0]){
		output(store[file]);
		outputQueue.pop();
		incomingQueue.shift();

		if(incomingQueue.length === 0){
			output('complete')
		}

		while(outputQueue.length > 0 && outputQueue[outputQueue.length-1] === incomingQueue[0]){
			checkAndLog(outputQueue[outputQueue.length-1])
		}		
	}
}

// request all files at once in "parallel"
getFile("file1");
getFile("file2");
getFile("file3");
