//the spoke app id
var spokeId = "asdf";
var appId = chrome.i18n.getMessage('@@extension_id');

/**
 * Send a request through spoke
 * @param req {obj}
 * @param fn {function}
 */
var spoke = function(req,fn) {
	//append our id
	req.id = appId;
	//send the message to spoke. 
	chrome.runtime.sendMessage(spokeId,req,fn);
};

var test = true;
if(test) {
	spoke = function(req,fn) {
		console.log(req);
		if(!req.register) fn(true);
	}
}

spoke.handlers = {};

/**
 * Register a handler through spoke
 * @param req {obj}
 * @param fn {function}
 */
spoke.register = function(req,fn) {
	//identify this as a registration request
	req.register = true;
	//store callback locally
	if(!(req.verb in spoke.handlers)) {
		spoke.handlers[req.verb] = {};
	}
	spoke.handlers[req.verb][req.noun] = fn;

	//send off the registration request. Spoke will then come back here when a request we can handle occurs, and we'll access our handler.
	spoke(req);
};

/**
 * Internal function for dealing with a spoke request. Identifies the handler, then executes it
 *
 * @param req {obj}
 * @param fn {function}
 */
spoke.handle = function(req, fn) {
	console.log('handle',req,fn);
	if(! (req.verb in spoke.handlers)) {
		fn(new Error("Verb: " + req.verb + " is not covered by local handlers"));
		return false;
	}
	for(var noun in spoke.handlers[req.verb]) {
		if(new RegExp(noun).exec(req.noun)) {
			spoke.handlers[req.verb][noun](req,fn);
			return true;
		}
	}
};

//Listen for messages from spoke, and handle such incoming messages.
/*chrome.runtime.onMessage.addListener(function(req, sender, fn) {
	if(sender.id === spokeId) {
		spoke.handle(req,fn);
	}
});*/
