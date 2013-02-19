var github = new Github({
  username: "itsjoesullivan",
  password: "badpassword123",
  auth: "basic"
});

var repo = github.getRepo('itsjoesullivan', 'GitHubFS');

/*repo.show(function(err,repo) {
	console.log(arguments);
});*/

var showContents = function(contents) {
	contents.forEach(function(item) {
		$(".files").append("<li id=\"" + item.path + "\" class=" + item.type + ">" + item.name + "</li>");		
		console.log(item);
	});
	$("li").click(function(e) {
		var path = $(e.target).attr('id');
		console.log(e.target);
		console.log(path);
		repo.read("master", path, function(err,data) {
			console.log(data);
			$(".text").html(data);
		});
	});
}


repo.contents("master","", function(err,contents) { 
	showContents(contents);
});
//repo.read("/README.md", function(err,contents) { console.log(arguments); });

