var github = new Github(credentials);

var repos = {};
/** 
 * Retrieve a specific repo, creating the reference if none exists yet.
 *
 * @param repoAddress {Mixed} obj
 * @api private
 */
getRepo = function(repoAddress) {
	var hash = JSON.stringify({
		user: repoAddress.user,
		repo: repoAddress.repo
	});
	if(!(hash in repos)) {
		repos[hash] = github.getRepo(repoAddress.user,repoAddress.repo);
	}
	return repos[hash];
};

/**
 * Parse a GitHub file path
 * @param path string "GHFS://{{user}}/{{repo}}/{{path}}
 * @returns {obj}
 */
parsePath = function(path) {
	if(path.indexOf('GHFS://') === 0) {
		path = path.substring(7);
	}
	var pathArr = path.split('/');
	return {
		user: pathArr.shift(),
		repo: pathArr.shift(),
		path: pathArr.join('/')
	}
}


/** 
 * Register a file-read. Grab the repo, read the file, pass the result to the callback.
 *
 * A GitHub file read looks like:
 *   {
 *   	"verb": "read",
 *   	"noun": "GHFS://itsjoesullivan/GitHubFS/README.md",
 *   	["branch": _branch-name_]
 *   }
 */
spoke.register({
	verb: "read",
	noun: "GHFS://*"
}, function(req,fn) {
	var path = parsePath(req.noun);
	var repo = getRepo(path);
	if(path.path.lastIndexOf(".") > path.path.lastIndexOf("/")) {
		repo.read("master" || req.branch, path.path, function(err,data) {
			if(err) {
				fn(new Error(err));
			} else {
				fn(data);
			}
		});
	} else {
		repo.contents("master" || req.branch, path.path, function(err,data) {
			if(err) {
				fn(new Error(err));
			} else {
				fn(data);
			}
		});
	}
});

/**
 * Register a file-write. Grab the repo, write the file, pass the result to the callback.
 *
 * A GitHub file write looks like:
 *  {
 *  	"verb" : "write",
 *  	"noun" : "GHFS://itsjoesullivan/GitHubFS/README.md",
 *	"data" : "This is the new contents of the file.",
 *	"message" : "This is the commit message.",
 *	["branch": _branch-name_]
 *  }
 */
spoke.register({
	verb: "write",
	noun: "GHFS://*"
}, function(req,fn) {
	repo.write("master" || req.branch, req.noun.substring(7), req.data, req.message, res);
});

//launch the app on launch.
chrome.app.runtime.onLaunched.addListener(function() {
	chrome.app.window.create('window/index.html', {
	});
});

//attempt to handle app requests internally; otherwise send them to spoke.
chrome.runtime.onMessage.addListener(function(req,sender,fn) {
	if(!spoke.handle(req,fn)) {
		spoke(req,fn);
	}
	return true;
});

