var dns = require('dns'),
    url = require('url'),
    net = require('net');

var pluginOpts = {
  blacklist: [],
  proxy: process.env.http_proxy
};
/*
function dnsCheck(uri, callback) {
  if(typeof uri !== 'string') {
    return callback(new Error('URI is not a string'));
  }
  
  uri = url.parse(uri);
  if(!uri.host) {
    return callback(new Error('URI does not contain a host'));
  }
  
  if(net.isIP(uri.host)) {
    
  } else {
    dns.resolve(uri.host);
  }
};

var lastRequestTime;*/

function requestProxy(options, callback) {
  var requestTime = new Date();
  if(typeof callback !== 'function') {
    callback = function() {};
  }
  
  callback = this.runner.addCallback(callback);
  // Limit the pace of requests per second
  /*if(!lastRequestTime) {
    lastRequestTime = new Date();
  } else {
    if(requestTime-lastRequestTime < 1000) {
      return setTimeout(requestProxy.bind(this, options, callback), 1000-(requestTime-lastRequestTime))
    } else {
      lastRequestTime = requestTime;
    }
  }*/
  
  var request = require('request').defaults(pluginOpts);
   
  request(options, function(err, res, body) {
    if(err) {
      return callback(err);
    }
    
    if(body) {
      return callback(null, {
        statusCode: res.statusCode,
        body: body
      }, body);
    }
  })
}

exports.name = 'request';

exports.attach = function(opts) {
  pluginOpts = opts;
  
  exports.init = function(done) {
    var code = requestProxy.bind(this)
    this.emit('shovel::module::request', code);
  };
};

