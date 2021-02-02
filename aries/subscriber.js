const fs = require('fs');
const http = require('http');
const now = require('performance-now');

// config
const resultJsonPath = 'results/results_subscriber.json';
const resumeLastTest = false;

const serverUrl = '127.0.0.1:3500';

const hostname = '127.0.0.1';
const port = 3500;

var finalJSON = {
  "1000": {
    "0": {"noOfMessageReceived": 0, "totalLatency": 0, "minLatency": 99999999999999999999999999, "maxLatency": 0},
    "46": {"noOfMessageReceived": 0, "totalLatency": 0, "minLatency": 99999999999999999999999999, "maxLatency": 0},
    "238": {"noOfMessageReceived": 0, "totalLatency": 0, "minLatency": 99999999999999999999999999, "maxLatency": 0},
    "490": {"noOfMessageReceived": 0, "totalLatency": 0, "minLatency": 99999999999999999999999999, "maxLatency": 0}
  },
  "11000": {
    "0": {"noOfMessageReceived": 0, "totalLatency": 0, "minLatency": 99999999999999999999999999, "maxLatency": 0},
    "46": {"noOfMessageReceived": 0, "totalLatency": 0, "minLatency": 99999999999999999999999999, "maxLatency": 0},
    "238": {"noOfMessageReceived": 0, "totalLatency": 0, "minLatency": 99999999999999999999999999, "maxLatency": 0},
    "490": {"noOfMessageReceived": 0, "totalLatency": 0, "minLatency": 99999999999999999999999999, "maxLatency": 0}
  },
  "21000": {
    "0": {"noOfMessageReceived": 0, "totalLatency": 0, "minLatency": 99999999999999999999999999, "maxLatency": 0},
    "46": {"noOfMessageReceived": 0, "totalLatency": 0, "minLatency": 99999999999999999999999999, "maxLatency": 0},
    "238": {"noOfMessageReceived": 0, "totalLatency": 0, "minLatency": 99999999999999999999999999, "maxLatency": 0},
    "490": {"noOfMessageReceived": 0, "totalLatency": 0, "minLatency": 99999999999999999999999999, "maxLatency": 0}
  },
  "31000": {
    "0": {"noOfMessageReceived": 0, "totalLatency": 0, "minLatency": 99999999999999999999999999, "maxLatency": 0},
    "46": {"noOfMessageReceived": 0, "totalLatency": 0, "minLatency": 99999999999999999999999999, "maxLatency": 0},
    "238": {"noOfMessageReceived": 0, "totalLatency": 0, "minLatency": 99999999999999999999999999, "maxLatency": 0},
    "490": {"noOfMessageReceived": 0, "totalLatency": 0, "minLatency": 99999999999999999999999999, "maxLatency": 0}
  },
  "41000": {
    "0": {"noOfMessageReceived": 0, "totalLatency": 0, "minLatency": 99999999999999999999999999, "maxLatency": 0},
    "46": {"noOfMessageReceived": 0, "totalLatency": 0, "minLatency": 99999999999999999999999999, "maxLatency": 0},
    "238": {"noOfMessageReceived": 0, "totalLatency": 0, "minLatency": 99999999999999999999999999, "maxLatency": 0},
    "490": {"noOfMessageReceived": 0, "totalLatency": 0, "minLatency": 99999999999999999999999999, "maxLatency": 0}
  }
};

async function init() {

  console.log('aries test server (subscriber)')
  console.log(`${(new Date()).toISOString()} | connecting to ${serverUrl} ..`);
  let prevPayload = "";
  var server = http.createServer()
  
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });

  let start = null;

  server.on('request', function(req, res) {
    let body='';
    req.on('data', (chunk)=> {
        body+=chunk;
        
        try {
          console.log(body)
          // if(body) {
          //   try {
          //     let data = JSON.parse(body)["content"];
          //     let splitData = data.split("_");
          //     if(splitData.length > 2) {
          //       let timestamp = splitData[0];
          //       let counter = splitData[1];
          //       let currentPayloadSizeInByte = splitData[2];
          //       let currentMessagesPerSecond = splitData[3];
          //       let latency = Math.abs(now() - parseFloat(timestamp));
          //       console.log("currentMessagesPerSecond: ", currentMessagesPerSecond, " currentPayloadSizeInByte: ", currentPayloadSizeInByte,  " timestamp", parseFloat(timestamp), " now ", now(), " latency: ", latency)
          //       if(!prevPayload) prevPayload = currentPayloadSizeInByte;
          //       finalJSON[currentMessagesPerSecond][currentPayloadSizeInByte]["noOfMessageReceived"] = counter;
          //       finalJSON[currentMessagesPerSecond][currentPayloadSizeInByte]["totalLatency"] += latency;
          //       if(latency<finalJSON[currentMessagesPerSecond][currentPayloadSizeInByte]["minLatency"]) finalJSON[currentMessagesPerSecond][currentPayloadSizeInByte]["minLatency"] = latency;
          //       if(latency>finalJSON[currentMessagesPerSecond][currentPayloadSizeInByte]["maxLatency"]) finalJSON[currentMessagesPerSecond][currentPayloadSizeInByte]["maxLatency"] = latency;
          //       if(prevPayload != currentPayloadSizeInByte) {
          //         fs.writeFileSync(resultJsonPath, JSON.stringify(finalJSON));
          //         console.log(finalJSON)
          //       }
          //       prevPayload = currentPayloadSizeInByte;
          //     }
          //   }
          //   catch(e) {
          //     console.log(e)
          //   }
          // }
        }
        catch(e) {console.log(e)}
    })

    res.statusCode = 200;
    res.end()
  })

}

init();
