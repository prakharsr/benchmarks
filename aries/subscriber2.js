const fs = require('fs');
const http = require('http');
const now = require('performance-now');

// config
const resultJsonPath = 'results/results_subscriber.json';
const resumeLastTest = false;

const serverUrl = '127.0.0.1:3510';

const hostname = '127.0.0.1';
const port = 3510;

async function init() {
  console.log('aries test server (subscriber)')
  console.log(`${(new Date()).toISOString()} | connecting to ${serverUrl} ..`);
  var server = http.createServer()
  
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

  let results = [];

  let messageCount = 0;
  let oldMessageCount = 0;
  let start = null;
  var options = {
    host: '127.0.0.1',
    port: 8012,
    path: '/connections/bf56e94e-22fe-4be6-9e0e-3fcad7d38643/send-message',
    method: 'POST'
  };

  server.on('request', function(req, res) {      

    var body='';
    req.on('data', (chunk)=> {
        body+=chunk;
        console.log(body)
        // let data = JSON.parse(body)["content"]
        // try {
        //   let datax = data.split("_");
        //   if(datax.length > 2) {
        //     let reqx = http.request(options, function(res) {
        //       res.on('data', function (chunk) {
        //       });
        //     });
        //     reqx.end(JSON.stringify({"content": data}))
        //   }
        // } catch(e) {
        //   console.log(e)
        // }
    })
    // console.log(req)
    messageCount += 1;
    console.log(messageCount)
    res.statusCode = 200;
    res.end()

  })
}

init();
