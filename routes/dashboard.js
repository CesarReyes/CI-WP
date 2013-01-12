/*
 * GET users listing.
 */

global.ticker = {};
global.company = null;
global.tweets = {};
global.error = null;

var xml2js = require('xml2js')
	, http = require("http");

exports.index = function(req, res) {

	var uname = req.session.oauth.uname;
	var symbol = req.param('symbol', null);

	if (symbol) {// Perform the search
		search_ticker(symbol);
	}
	
	setTimeout(function() {
		res.render('dashboard', {
			uname : uname,
			company : global.company,
			ticker : global.ticker,
			tweets : global.tweets,
			error : global.error
		});	
		
		//console.log(global.tweets);
		global.tweets = {};
		global.ticker = {};
		global.error = null;
		global.company = null;
	}, 3000);		
	
	
};


search_ticker = function(symbol, res) {

	var parser = new xml2js.Parser({
		mergeAttrs: true
	});

	var options = {
		host : 'www.google.com',
		port : 80,
		path : '/ig/api?stock=' + symbol,
		method : 'GET',
		headers : {
			'Content-Type' : 'text/xml, application/xml'
		}
	};
	
	var ticker = {};
	
	var r = http.request(options, function(rx){
		var xml = '';
		
		
		rx.setEncoding('utf8');

        rx.on('data', function (chunk) {
        	xml += chunk;
        });

        rx.on('end', function() {
        	parser.parseString(xml, parseTicker);
        });
	});
	
	r.end();
	
};

parseTicker = function (err, result){
	//var inspect = require('eyes').inspector({maxLength: false})
	//inspect(result.xml_api_reply.finance[0]);
	//console.dir(JSON.stringify(result.xml_api_reply.finance[0]));
	        		
	var finance = result.xml_api_reply.finance[0];
	var company = finance['company'][0].data;
	
	//Cleaning the answer
	for(var attributename in finance){
		if(typeof finance[attributename] === 'object' && finance[attributename][0].data){
			ticker[attributename] = finance[attributename][0].data;
		}
	}
	
	if(!ticker.company){
		global.error = 'Stock Symbol not found.';
	}else{
		getTweets(ticker.company);
	}
	
	global.ticker = ticker;	
}

getTweets = function (word){
	var Twit = require('twit')

	var T = new Twit({
	    consumer_key:         'r99giJLGZ559nptkuVFZog'
	  , consumer_secret:      'bVt7HetK0k6SK7tiF4yntZBKtd1rmUeCWsWJ8WadZOE'
	  , access_token:         '342257644-ekcvFYgLtAuUVucAUQUije9O8dKqAl8rJ28nqWU1'
	  , access_token_secret:  'u4wdiqm44WyIOM6xgB7A9RMryGgUoDOeJK1vwvWA'
	});
	
	T.get('search/tweets', { q: ticker.company + ' since:2013-01-01' }, function(err, reply) {
		//var inspect = require('eyes').inspector({maxLength: false})
		//inspect(reply.statuses);
		
		global.tweets = reply.statuses;
	})

}