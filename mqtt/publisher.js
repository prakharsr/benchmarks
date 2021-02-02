const crypto = require('crypto');
const mqtt = require('mqtt');
const Blob = require("cross-blob");
const NanoTimer = require('nanotimer');
const now = require('performance-now');
const fs = require('fs');

// config
const resultJsonPath = 'results/results.json';
const latencyJsonPath = 'results/latency.json';
const paramsJsonPath = 'params.json';
const resumeLastTest = false;
const testDurationInSeconds = 10;
const payloadSizeInByte = [0, 46, 238, 490]
const messagesPerSecond = [10, 50, 100, 500, 1000, 5000, 10000]
const bytePerSecondCap = 50 * Math.pow(1024, 2);
var globSent = 0;
var globReceived = 0;
var globTotalLatency = 0;
var globMinLatency = 0;
var globMaxLatency = 0;
// const bytePerSecondCap = Number.POSITIVE_INFINITY;

const serverUrl = 'tcp://192.168.7.1:1883';

const byteSize = str => new Blob([str]).size;

console.log(`Trying to connect to ${serverUrl}`);

async function init () {
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
        const result = await runTest(param.payloadSizeInByte, param.messagesPerSecond);
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
            if(((globSent - globReceived)/ 500) >= 600) {
                console.log(`sleeping for 600 seconds`)
                await sleep(600);}
            else {
                console.log(`sleeping for ${(globSent - globReceived)/ 500} seconds`)
                await sleep((globSent - globReceived)/ 500);
            }
        }
        // await sleep(1); // so we can distinguish tests in the subscriber based on no messages received
    }
}

async function runTest (currentPayloadSizeInByte, currentMessagesPerSecond) {
    console.log(`${(new Date()).toISOString()} | Starting test with payload size ${currentPayloadSizeInByte} B and ${currentMessagesPerSecond} msg/s`);
    const messageCount = Math.ceil(testDurationInSeconds * currentMessagesPerSecond);
    const intervalInMilliseconds = 1000 / currentMessagesPerSecond;

    let start = now();
    let startx = null;
    let minLatency = 99999999999999999999999999;
    let maxLatency = 0;
    let avgLatency = 0;
    let totalLatency = 0;
    let totalReceivedMessages = 0;
    let totalSentMessages = 0;
    globSent = 0;
    globReceived = 0;
    globTotalLatency = 0;
    globMinLatency = 99999999999999999999999999;
    globMaxLatency = 0;
    // generate test data
    var data = Array(messageCount).fill().map(() => ({"content": encodeURIComponent(crypto.randomBytes(currentPayloadSizeInByte).toString('hex')), "time": ""}));
    const dataGenerationInMs = now() - start;

    const timer = new NanoTimer();
    // data[0]["time"] = now()
    // console.log(JSON.stringify(data[0]))

    const client = mqtt.connect(serverUrl);
    await new Promise(resolve => {
        client.on('connect', ()=> {
            return resolve();
        });
    }).catch((e)=>console.log(e));

    client.subscribe('data');
    client.on('message', (topic, message) => {
        let data = JSON.parse(message.toString('utf8'));
        totalReceivedMessages++;
        if(totalReceivedMessages > globReceived) globReceived = totalReceivedMessages;
        let latency = Math.abs(now() - data["time"]);
        globTotalLatency += latency;
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
        // console.log("currentPayloadSizeInByte, currentMessagesPerSecond ", currentPayloadSizeInByte, " ", currentMessagesPerSecond, " ", Math.abs(now() - data["time"]))
    });


    start = now();
    await new Promise((resolve) => {
        let counter = 0;
        const sendData = () => {
            data[counter]["time"] = now()
            client.publish('data', JSON.stringify(data[counter]), {
                qos: 2,
            });
            counter++;
            totalSentMessages++;
            if(totalSentMessages > globSent) globSent = totalSentMessages; 
        };
        sendData();
        timer.setInterval(() => {
            if (counter >= data.length) {
                timer.clearInterval();
                return resolve();
            }
            sendData();
        }, '', `${intervalInMilliseconds}m`);
    });
    const executionInMs = now() - start;

    // // mqttjs stores incoming and outgoing messages in stores and sending is deferred
    await new Promise(resolve => {
        client.end(false, resolve);
    });

    const allSentInMs = now() - start;
    if(totalReceivedMessages) {
        avgLatency = totalLatency/ totalReceivedMessages;
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
