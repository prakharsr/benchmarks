const crypto = require('crypto');
const http = require('http');
const Blob = require("cross-blob");
const NanoTimer = require('nanotimer');
const now = require('performance-now');
const fs = require('fs');

// config
const resultJsonPath = 'results/results.json';
const paramsJsonPath = 'params.json';
const resumeLastTest = false;
const testDurationInSeconds = 10;
const payloadSizeInByte = [0, 46, 238, 490]
const messagesPerSecond = [10, 50, 100, 500, 1000, 5000, 10000]
const bytePerSecondCap = 50 * Math.pow(1024, 2);
var requestsArray = [];
var requestsTimesArray = [];
var globSent = 0;
var globReceived = 0;
var globTotalLatency = 0;
var globMinLatency = 0;
var globMaxLatency = 0;
// const bytePerSecondCap = Number.POSITIVE_INFINITY;

// const serverUrl = 'coap://192.168.7.1:5683';

// console.log(`Trying to connect to ${serverUrl}`);
const byteSize = str => new Blob([str]).size;


async function init () {
    console.log('aries test client (publisher)')
    let params = [];
    if (resumeLastTest && fs.existsSync(paramsJsonPath)) {
        params = JSON.parse(fs.readFileSync(paramsJsonPath));
    } else {
        params = generateParams();
        fs.writeFileSync(paramsJsonPath, JSON.stringify(params));
    }
    const paramsToTest = params.filter(param => !param.done);

    console.log(`Total execution will take at least: ${paramsToTest.length * testDurationInSeconds} seconds`);

    let results = [];
    if (resumeLastTest && fs.existsSync(resultJsonPath)) {
        results = JSON.parse(fs.readFileSync(resultJsonPath));
    }

    for (let param of paramsToTest) {
        let  repeated = 0;
        let prev = 0;
        const result = await runTest(param.payloadSizeInByte, param.messagesPerSecond).catch((e)=>console.log(e))
        results.push(result);
        param.done = true;
        fs.writeFileSync(resultJsonPath, JSON.stringify(results));
        fs.writeFileSync(paramsJsonPath, JSON.stringify(params));
        while(!repeated) {
            results.pop();
            result.totalReceivedMessages = globReceived;
            result.totalLatency = globTotalLatency;
            result.minLatency = globMinLatency;
            result.maxLatency = globMaxLatency;
            result.avgLatency = globTotalLatency/ globSent;
            results.push(result);
            fs.writeFileSync(resultJsonPath, JSON.stringify(results));
            fs.writeFileSync(paramsJsonPath, JSON.stringify(params));
            if((globSent - globReceived) == prev) repeated = 1;
            prev = globSent - globReceived;
            console.log(globReceived, globSent, param.payloadSizeInByte, param.messagesPerSecond)        
            if(((globSent - globReceived)/ 20) >= 600) {
                console.log(`sleeping for 600 seconds`)
                await sleep(600);}
            else {
                console.log(`sleeping for ${(globSent - globReceived)/ 20} seconds`)
                await sleep((globSent - globReceived)/ 20);
            }
        }
         // so we can distinguish tests in the subscriber based on no messages received
    }
}

async function runTest (currentPayloadSizeInByte, currentMessagesPerSecond) {
    console.log(`${(new Date()).toISOString()} | Starting test with payload size ${currentPayloadSizeInByte} B and ${currentMessagesPerSecond} msg/s`);
    const messageCount = Math.ceil(testDurationInSeconds * currentMessagesPerSecond);
    const intervalInMilliseconds = 1000 / currentMessagesPerSecond;
    globSent = 0;
    globReceived = 0;
    let start = now();
    let startx = null;
    let minLatency = 99999999999999999999999999;
    let maxLatency = 0;
    let avgLatency = 0;
    let totalLatency = 0;
    let totalReceivedMessages = 0;
    let totalSentMessages = 0;
    globTotalLatency = 0;
    globMinLatency = 99999999999999999999999999;
    globMaxLatency = 0;
    // generate test data
    var data = Array(messageCount).fill().map(() => ({"content": encodeURIComponent(crypto.randomBytes(currentPayloadSizeInByte).toString('hex'))}));
    const dataGenerationInMs = now() - start;

    const timer = new NanoTimer();

    start = now();
    await new Promise((resolve) => {
        let counter = 0;
        const sendData = () => {
            try {
                var options = {
                    host: '127.0.0.1',
                    port: 8002,
                    path: '/connections/1f18c51f-652a-4011-85d1-e7c48f033a60/send-message',
                    method: 'POST'
                  };
                  
                  var req = http.request(options, function(res) {
                    res.on('data', function (chunk) {
                    });
                  });
            
                  req.on('error', function(e) {
                    console.log('problem with request: ' + e.message);
                  });
    
                //   data[counter]["content"] = now() + "_" + counter + "_" + currentPayloadSizeInByte + "_" + currentMessagesPerSecond + "_" + data[counter]["content"]
                  data[counter]["time"] = now()
                //   console.log(requestsArray)
                  requestsArray.push(req);
                  requestsTimesArray.push(data[counter]["time"]);
                  // let x=byteSize(JSON.stringify(data[counter]).toString('utf8'))
                  // console.log(x)
                  // console.log(JSON.stringify(data[counter])) 
                         
                  req.end(JSON.stringify(data[counter]))
                  counter++;
                  totalSentMessages++;    
                  if(totalSentMessages > globSent) globSent = totalSentMessages; 
    
                  req.on('response', function(res) {
                    //   console.log(res["req"])
                       
                        // console.log(totalReceivedMessages, totalSentMessages)
                        totalReceivedMessages++;
                        if(totalReceivedMessages > globReceived) globReceived = totalReceivedMessages;
                        
                        // console.log(requestsArray.indexOf(res["req"]))
                        let latency = Math.abs(now() - requestsTimesArray[requestsArray.indexOf(res["req"])]);
                        globTotalLatency += latency;
                        // console.log("latency ", latency, " timestamp ", requestsTimesArray[requestsArray.indexOf(res["req"])], " now ", now())
                        if(latency < minLatency) minLatency = latency;
                        if(latency > maxLatency) maxLatency = latency;
                        totalLatency += latency;

                        if(globMaxLatency < maxLatency) globMaxLatency = maxLatency;
                        if(globMinLatency > minLatency) globMinLatency = minLatency;
                      //   console.log("currentPayloadSizeInByte, currentMessagesPerSecond ", currentPayloadSizeInByte, " ", currentMessagesPerSecond, " ", Math.abs(now() - data["time"]))
                        if (!startx) {
                          startx = now();
                          // console.log(`${(new Date()).toISOString()} | test started`);
                        }
                    })
            }
            catch (e) {
                console.log(e)
            }
 };
        sendData();
        // console.log(data.length, currentPayloadSizeInByte)
        timer.setInterval(() => {
            if (counter >= data.length) {
                timer.clearInterval();
                return resolve();
            }
            sendData();
        }, '', `${intervalInMilliseconds}m`);
    }).catch((e)=> console.log(e))
    const executionInMs = now() - start;

    // coapjs stores incoming and outgoing messages in stores and sending is deferred
    const allSentInMs = now() - start;
    if(totalReceivedMessages) {
        avgLatency = totalLatency/ totalSentMessages;
    }

    return {
        payloadSizeInByte: currentPayloadSizeInByte,
        messagesPerSecond: currentMessagesPerSecond,
        dataGenerationInMs,
        executionInMs,
        allSentInMs,
        minLatency,
        maxLatency,
        totalLatency,
        avgLatency,
        totalSentMessages,
        totalReceivedMessages 
    };
}   

function generateParams () {
    const params = [];
    for (let i = 0; i < messagesPerSecond.length; i++) {
        for (let j = 0; j < payloadSizeInByte.length; j++) {
            params.push({
                payloadSizeInByte: payloadSizeInByte[j],
                messagesPerSecond: messagesPerSecond[i],
            });
        }
    }
    console.log(params)
    return params;
}

function sleep (seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

init();
