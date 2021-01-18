const crypto = require('crypto');
const http = require('http');
const NanoTimer = require('nanotimer');
const now = require('performance-now');
const fs = require('fs');

// config
const resultJsonPath = 'results/results.json';
const paramsJsonPath = 'params.json';
const resumeLastTest = false;
const testDurationInSeconds = 10;
const payloadSizeInByte = {
    start: 2,
    end: Math.pow(1024, 2),
    stepFactor: 8,
};
const messagesPerSecond = {
    start: 1000,
    end: 80000,
    stepSize: 10000,
};
const bytePerSecondCap = 50 * Math.pow(1024, 2);
// const bytePerSecondCap = Number.POSITIVE_INFINITY;

// const serverUrl = 'coap://192.168.7.1:5683';

// console.log(`Trying to connect to ${serverUrl}`);

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
        const result = await runTest(param.payloadSizeInByte, param.messagesPerSecond).catch((e)=>console.log(e))
        results.push(result);
        param.done = true;
        fs.writeFileSync(resultJsonPath, JSON.stringify(results));
        fs.writeFileSync(paramsJsonPath, JSON.stringify(params));
        await sleep(1); // so we can distinguish tests in the subscriber based on no messages received
    }
}

async function runTest (currentPayloadSizeInByte, currentMessagesPerSecond) {
    console.log(`${(new Date()).toISOString()} | Starting test with payload size ${currentPayloadSizeInByte} B and ${currentMessagesPerSecond} msg/s`);
    const messageCount = Math.ceil(testDurationInSeconds * currentMessagesPerSecond);
    const intervalInMilliseconds = 1000 / currentMessagesPerSecond;

    let start = now();
    // generate test data
    // var dat = Array(messageCount).fill().map(() => crypto.randomBytes(currentPayloadSizeInByte));
    var data = "";
    if(currentPayloadSizeInByte == 16) data="{'content':''}";
    else if(currentPayloadSizeInByte == 2) data="";
    else if(currentPayloadSizeInByte == 128) data="{'content':'dwewefhiucwcweiuiwecnwaiebciwuebiuwefiuwhfiuwefhiucnwiuebv ii ius iusd iuds biusb iusb iusdb iuu iusiu bius ubuu'}";
    else if(currentPayloadSizeInByte == 1024) data="{'content':'dwewefhiucwcweiuiwecnwaiebciwuebiuwefiuwhfiuwefhiucnwiuebv ii ius iusd iuds biusb iusb iusdb iuu iusiu bius ubuudwewefhiucwcweiuiwecnwaiebciwuebiuwefiuwhfiuwefhiucnwiuebv ii ius iusd iuds biusb iusb iusdb iuu iusiu bius ubuudwewefhiucwcweiuiwecnwaiebciwuebiuwefiuwhfiuwefhiucnwiuebv ii ius iusd iuds biusb iusb iusdb iuu iusiu bius ubuudwewefhiucwcweiuiwecnwaiebciwuebiuwefiuwhfiuwefhiucnwiuebv ii ius iusd iuds biusb iusb iusdb iuu iusiu bius ubuudwewefhiucwcweiuiwecnwaiebciwuebiuwefiuwhfiuwefhiucnwiuebv ii ius iusd iuds biusb iusb iusdb iuu iusiu bius ubuudwewefhiucwcweiuiwecnwaiebciwuebiuwefiuwhfiuwefhiucnwiuebv ii ius iusd iuds biusb iusb iusdb iuu iusiu bius ubuudwewefhiucwcweiuiwecnwaiebciwuebiuwefiuwhfiuwefhiucnwiuebv ii ius iusd iuds biusb iusb iusdb iuu iusiu bius ubuudwewefhiucwcweiuiwecnwaiebciwuebiuwefiuwhfiuwefhiucnwiuebv ii ius iusd iuds biusb iusb iusdb iuu iusiu bius ubuudwewefhiucwcweiuiwecnwaiebciwuebiuwefiuwhfiuwefhiucnwiuebv ii ius iusd iuds biusb iusb iusdb iuu iusiu bius ubuu'}"
    const dataGenerationInMs = now() - start;

    const timer = new NanoTimer();

    // console.log(data)

    start = now();
    await new Promise((resolve) => {
        let counter = 0;
        const sendData = () => {
            var options = {
                host: '192.168.6.2',
                port: 8002,
                path: '/connections/8c19b33f-775a-453b-87da-861bfd7a9657/send-message',
                method: 'POST'
              };
              
              var req = http.request(options, function(res) {
                res.on('data', function (chunk) {
                });
              });
        
          
              
              req.on('error', function(e) {
                console.log('problem with request: ' + e.message);
              });
            //   var message = {"content": data};
              // write data to request body
            //   console.log(JSON.stringify({"content": data[counter].toString()}))
              req.write(data);
              req.end();
            counter++;
        };
        sendData();
        timer.setInterval(() => {
            if (counter >= currentPayloadSizeInByte) {
                timer.clearInterval();
                return resolve();
            }
            sendData();
        }, '', `${intervalInMilliseconds}m`);
    }).catch((e)=> console.log(e))
    const executionInMs = now() - start;

    // coapjs stores incoming and outgoing messages in stores and sending is deferred

    const allSentInMs = now() - start;

    return {
        payloadSizeInByte: currentPayloadSizeInByte,
        messagesPerSecond: currentMessagesPerSecond,
        dataGenerationInMs,
        executionInMs,
        allSentInMs,
    };
}

function generateParams () {
    const params = [];
    for (let i = messagesPerSecond.start; i < messagesPerSecond.end; i += messagesPerSecond.stepSize) {
        for (let j = payloadSizeInByte.start; j < payloadSizeInByte.end; j *= payloadSizeInByte.stepFactor) {
            if (j * i > bytePerSecondCap) {
                continue;
            }
            params.push({
                payloadSizeInByte: j,
                messagesPerSecond: i,
            });
        }
    }

    return params;
}

function sleep (seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

init();