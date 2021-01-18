const fs = require('fs');
const http = require('http');
const now = require('performance-now');

// config
const resultJsonPath = 'results/results_subscriber.json';
const resumeLastTest = false;

const serverUrl = '127.0.0.1:3500';

const hostname = '127.0.0.1';
const port = 3500;

async function init() {
  console.log('aries test server (subscriber)')
  console.log(`${(new Date()).toISOString()} | connecting to ${serverUrl} ..`);
  var server = http.createServer()
  
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

  let results = [];
  if (resumeLastTest && fs.existsSync(resultJsonPath)) {
    results = JSON.parse(fs.readFileSync(resultJsonPath));
  }

  let messageCount = 0;
  let oldMessageCount = 0;
  let start = null;

  server.on('request', function(req, res) {console.log(req)
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
