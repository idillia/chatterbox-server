/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var fs = require("fs");
var jsonMessages = {
  results: [
  ],
  lastId: 0
};

var storageFile = "messages.json";
fs.readFile(storageFile, function(err, data) {
  if (err) {
    fs.writeFile(storageFile, JSON.stringify(jsonMessages));
  }
  else {
    jsonMessages = JSON.parse(data);
  }

});

var postMethod = function(request,response){
  var statusCode = 201;
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'text/plain';
  response.writeHead(statusCode, headers);
  var data = "";
  request.on('data', function(chuncks){
    data += chuncks;
  });
  request.on('end', function(){
    var newMessage = JSON.parse(data);
    newMessage.objectId = jsonMessages.lastId;
    jsonMessages.lastId++;
    jsonMessages.results.push(newMessage);

    fs.writeFile(storageFile, JSON.stringify(jsonMessages));

    console.log(newMessage);
    response.end('');
  });

};

module.exports.requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log("Serving request type " + request.method + " for url " + request.url);
  
  if (request.url.match(/^\/classes\/messages/)) {
    var statusCode = 200;
    var headers = defaultCorsHeaders;
    headers['Content-Type'] = "application/json";

    if (request.method === "GET") {
      response.writeHead(statusCode, headers);
      response.end(JSON.stringify(jsonMessages));

    } else if (request.method === "POST") {
      postMethod(request,response);
    } else {
      response.writeHead(statusCode, headers);
      response.end('');
    }
  } else if (request.url.match(/^\/send/)) {
    postMethod(request,response);
  } else if (request.url.match(/^\/classes\/room/)) {
    var statusCode = 200;
    var headers = defaultCorsHeaders;
    headers['Content-Type'] = "application/json";

    if (request.method === "GET") {
      response.writeHead(statusCode, headers);
      response.end(JSON.stringify(jsonMessages));
    }
    else if (request.method === "POST") {
      postMethod(request,response);
    }

  } else if (request.url === "/") {
    var statusCode = 200;
    var headers = defaultCorsHeaders;
    headers['Content-Type'] = "text/html";
    response.writeHead(statusCode, headers);

    fs.readFile('client/index.html', function(err, data){
      if (err) throw err;
      response.end(data);
    });

  } else {
    fs.readFile('client' + request.url, function(err, data){
      if (err) {
        // The outgoing status.
        var statusCode = 404;

        // See the note below about CORS headers.
        var headers = defaultCorsHeaders;

        // Tell the client we are sending them plain text.
        //
        // You will need to change this if you are sending something
        // other than plain text, like JSON or HTML.
        headers['Content-Type'] = "text/plain";

        // .writeHead() writes to the request line and headers of the response,
        // which includes the status and all headers.
        response.writeHead(statusCode, headers);

        // Make sure to always call response.end() - Node may not send
        // anything back to the client until you do. The string you pass to
        // response.end() will be the body of the response - i.e. what shows
        // up in the browser.
        //
        // Calling .end "flushes" the response's internal buffer, forcing
        // node to actually send all the data over to the client.
        response.end("Not found!");

      }
      else {
        var mimeTypes = {js:"application/javascript", css:"text/css", gif: "image/gif"};
        var statusCode = 200;
        var headers = defaultCorsHeaders;
        headers['Content-Type'] = "text/html";

        var extension = request.url.split('.').pop();
        if (mimeTypes.hasOwnProperty(extension)){
          headers['Content-Type'] = mimeTypes[extension];
        }

        response.writeHead(statusCode, headers);
        response.end(data);
      }
    });  
  }
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};
