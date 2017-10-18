'use strict';

// Do this as the very first thing.
var agent = require('@google-cloud/trace-agent').start();
var traceApi = require('@google-cloud/trace-agent').get();

var bunyan = require('bunyan');

var LoggingBunyan = require('@google-cloud/logging-bunyan');
var loggingBunyan = LoggingBunyan();

var winston = require('winston');
var transport = require('@google-cloud/logging-winston');
winston.add(transport);

var express = require('express');
var app = express();

var bunyanLogger = bunyan.createLogger(
    {name: 'my-service', streams: [loggingBunyan.stream('info')]});

var metadata = {resource: {type: 'global'}};

app.get('/', function(req, res) {
  winston.info('See Winston ...', null);
  bunyanLogger.info('See Bunyan ...');

  var childSpan = traceApi.createChildSpan({name: 'Custom span'});

  setTimeout(function() {
    winston.info('... log entries ...', {extra: 'info'});
    winston.info(
        'Winston custom trace ID', {[transport.LOGGING_TRACE_KEY]: 'trace1'});
    bunyanLogger.info('... log entries ...');
    bunyanLogger.info(
        {[LoggingBunyan.LOGGING_TRACE_KEY]: 'trace2'},
        'Bunyan custom trace ID');
    bunyanLogger.info('Superduperlonglogentry'.repeat(20));
    childSpan.endSpan();
  }, 5);

  setTimeout(function() {
    winston.error('... among trace spans!', null);
    bunyanLogger.error('... among trace spans!');
    res.end('Hello world\n');
  }, (10.0 + Math.random() * 50.0));
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('Example app listening on port ' + PORT);
})
