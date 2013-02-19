mocha.setup('bdd')
var expect = chai.expect

spoke.handlers = {
	read: {
		"GHFS://*": function(req,fn) { return fn(null,req); }
	},
	write: {
		"GHFS://*": function(req,fn) { return fn(null, req); }
	}
};


describe("spoke.handle", function() {
	console.log(expect);
	it("executes a handler", function(done) {
		var pass = false;
		spoke.handle({
			verb: "read",
			noun: "GHFS://itsjoesullivan/GitHubFS/README.md"
		}, function(err,dat) { 
			pass = true;
			expect(pass).to.equal(true);
			done();
		});
	});
});

mocha.run();
