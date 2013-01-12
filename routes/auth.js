OAuth = require('oauth').OAuth;

var oa = new OAuth(
		"https://api.twitter.com/oauth/request_token",
		"https://api.twitter.com/oauth/access_token",
		"r99giJLGZ559nptkuVFZog",
		"bVt7HetK0k6SK7tiF4yntZBKtd1rmUeCWsWJ8WadZOE",
		"1.0",
		"http://127.0.0.1:3000/auth/callback",
		"HMAC-SHA1"
	);

exports.auth = function(req, res){
	
	oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
		if (error) {
			console.log(error);
			//Connection Error
			res.send("Connection Error.")
		}
		else {
			req.session.oauth = {};
			req.session.oauth.token = oauth_token;
			console.log('oauth.token: ' + req.session.oauth.token);
			req.session.oauth.token_secret = oauth_token_secret;
			console.log('oauth.token_secret: ' + req.session.oauth.token_secret);
			res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token)
	}
	});
}

exports.callback = function(req, res, next){
	if (req.session.oauth) {
		req.session.oauth.verifier = req.query.oauth_verifier;
		var oauth = req.session.oauth;

		oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier, 
		function(error, oauth_access_token, oauth_access_token_secret, results){
			if (error){
				console.log(error);
				res.send("Connection Error.");
			} else {
				req.session.oauth.access_token = oauth_access_token;
				req.session.oauth.access_token_secret = oauth_access_token_secret;
				req.session.oauth.uname = results.screen_name;
				//console.log(results);
				
				res.redirect('dashboard');
			}
		}
		);
	} else
		res.redirect('/');
};

exports.logout = function(req, res){
	req.session.destroy();
	res.redirect('/');
}