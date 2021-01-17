const fs = require('fs');
var coap        = require('coap');
const now = require('performance-now');

// config
const resultJsonPath = 'results/results_subscriber.json';
const resumeLastTest = false;

const serverUrl = 'coap://localhost:5683';

async function init() {
  console.log('coap test server (subscriber)')
  console.log(`${(new Date()).toISOString()} | connecting to ${serverUrl} ..`);
  var server      = coap.createServer()
  server.listen(function() {})

  let results = [];
  if (resumeLastTest && fs.existsSync(resultJsonPath)) {
    results = JSON.parse(fs.readFileSync(resultJsonPath));
  }

  let messageCount = 0;
  let oldMessageCount = 0;
  let start = null;

  server.on('request', function(req, res) {
    messageCount += 1;
    if (!start) {
      start = now();
      console.log(`${(new Date()).toISOString()} | test started`);
    }
    res.end('Hello ' + req.url.split('/')[1] + '\n')
  })

  setInterval(() => {
    const diff = messageCount - oldMessageCount;
    oldMessageCount = messageCount;
    if (diff === 0 && start) {
      const allReceivedInMs = now() - start;
      start = null;
      results.push({
        allReceivedInMs,
        messagesPerSecondReceived: messageCount / (allReceivedInMs / 1000),
      });
      fs.writeFileSync(resultJsonPath, JSON.stringify(results));
      messageCount = 0;
      oldMessageCount = 0;
      console.log(`${(new Date()).toISOString()} | test done`);
    }
  }, 100);
}

init();
