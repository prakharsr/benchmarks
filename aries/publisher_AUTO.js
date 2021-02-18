const crypto = require('crypto');
const http = require('http');
const Blob = require("cross-blob");
const NanoTimer = require('nanotimer');
const now = require('performance-now');
const fs = require('fs');
const { exec } = require('child_process');
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

var globalConnections = [];
// const bytePerSecondCap = Number.POSITIVE_INFINITY;

// const serverUrl = 'coap://192.168.7.1:5683';

// console.log(`Trying to connect to ${serverUrl}`);
const byteSize = str => new Blob([str]).size;


async function init () {

    var clearCommand = `ps -aux | grep aca-py | awk '{print $2}'`;
    exec(clearCommand, (err, stdout, stderr) => {
        if (err) {
        console.error(`exec error: ${err}`);
        return;
        }
        let pids = stdout.split("\n");
        for(let i=0; i<pids.length; i++) {
            if(pids[i]) {
                exec(`kill -9 ${pids[i]}`, (err, stdout, stderr) => {})
            }
        }
    })

    await sleep(2);

    var command = `cd /home/prakhar/projects/MTP/code/aries-cloudagent-python-0.5.6 && source env/bin/activate && aca-py start --inbound-transport http 127.0.0.1 8000 --outbound-transport http --genesis-url http://127.0.0.1:9000/genesis --wallet-storage-type postgres_storage --wallet-storage-config {"url":"http://127.0.0.1:5432"} --admin 0.0.0.0 8002 --admin-insecure-mode -e http://127.0.0.1:8000`;
        
    exec(command, (err, stdout, stderr) => {
        if (err) {
        console.error(`exec error: ${err}`);
        return;
        }
        console.log(`process started at port 8000`);
    })

    await sleep(3);


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
        await createConnections(param.messagesPerSecond);
        await sleep(10);
        const result = await runTest(param.payloadSizeInByte, param.messagesPerSecond).catch((e)=>console.log(e))
        param.done = true;
        globSent = 0;
        globReceived = 0;
        globTotalLatency = 0;
        globMinLatency = 99999999999999999999;
        globMaxLatency = 0;

        for(let i=0; i<param.messagesPerSecond; i++) {
            globSent += globalConnections[i]["globSent"];
            globReceived += globalConnections[i]["globReceived"];
            globTotalLatency += globalConnections[i]["globTotalLatency"];
            if(globalConnections[i]["globMinLatency"] < globMinLatency) globMinLatency = globalConnections[i]["globMinLatency"];
            if(globalConnections[i]["globMaxLatency"] > globMaxLatency) globMaxLatency = globalConnections[i]["globMaxLatency"];
        }
        result["totalReceivedMessages"] = globReceived;
        result["totalSentMessages"] = globSent;
        result["totalLatency"] = globTotalLatency;
        result["minLatency"] = globMinLatency;
        result["maxLatency"] = globMaxLatency;
        result["avgLatency"] = globTotalLatency/ globSent;
        results.push(result);
        fs.writeFileSync(resultJsonPath, JSON.stringify(results));
        fs.writeFileSync(paramsJsonPath, JSON.stringify(params));
        while(!repeated) {
            results.pop();
            globSent = 0;
            globReceived = 0;
            globTotalLatency = 0;
            globMinLatency = 99999999999999999999;
            globMaxLatency = 0;

            for(let i=0; i<param.messagesPerSecond; i++) {
                globSent += globalConnections[i]["globSent"];
                globReceived += globalConnections[i]["globReceived"];
                globTotalLatency += globalConnections[i]["globTotalLatency"];
                if(globalConnections[i]["globMinLatency"] < globMinLatency) globMinLatency = globalConnections[i]["globMinLatency"];
                if(globalConnections[i]["globMaxLatency"] > globMaxLatency) globMaxLatency = globalConnections[i]["globMaxLatency"];
            }
            result["totalReceivedMessages"] = globReceived;
            result["totalSentMessages"] = globSent;
            result["totalLatency"] = globTotalLatency;
            result["minLatency"] = globMinLatency;
            result["maxLatency"] = globMaxLatency;
            result["avgLatency"] = globTotalLatency/ globSent;
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
                console.log(`sleeping for ${(globSent - globReceived)/ 50} seconds`)
                await sleep((globSent - globReceived)/ 50);
            }
        }
         // so we can distinguish tests in the subscriber based on no messages received
    }
}

async function createConnections(numberOfConnections) {
    try {

        while(globalConnections.length < numberOfConnections) {

            await sleep(1);

            var portNumber = (globalConnections.length+1) + 8012;
    
            var command = `cd /home/prakhar/projects/MTP/code/aries-cloudagent-python-0.5.6 && source env/bin/activate && aca-py start --inbound-transport http 127.0.0.1 ${(globalConnections.length+1) + 8010} --outbound-transport http --genesis-url http://127.0.0.1:9000/genesis --wallet-storage-type postgres_storage --wallet-storage-config {"url":"http://127.0.0.1:5432"} --admin 0.0.0.0 ${(globalConnections.length+1) + 8012} --admin-insecure-mode -e http://127.0.0.1:${(globalConnections.length+1) + 8010}`;
    
            exec(command, (err, stdout, stderr) => {
                if (err) {
                    console.error(`exec error: ${err}`);
                    return;
                }
                console.log(`process started at port ${(globalConnections.length+1) + 8010}`);
                })
    
            await sleep(1).then(() => {
                
                globalConnections.push({"port": (globalConnections.length+1) + 8010, "connection_id": ""});
                // create-invitation
                
                var create_invitation_req = http.request({
                    host: '127.0.0.1',
                    port: portNumber,
                    path: '/connections/create-invitation',
                    method: 'POST',
                    accept: 'application/json'
                    }, function(res) {
                        res.on('data', function (chunk) {
                            let data = '';
                            data += chunk;
                            var invitation_data = JSON.parse(data);
                            var invitation = invitation_data["invitation"];

                            // receive-invitation
    
                            var receive_invitation_req = http.request({
                                host: '127.0.0.1',
                                port: 8002,
                                path: '/connections/receive-invitation',
                                method: 'POST',
                                accept: 'application/json'
                                }, function(res) {
                                    res.on('data', function (chunk) {
                                        let data = '';
                                        data += chunk;
                                        var connection_id_data = JSON.parse(data);
                                        var connection_id = connection_id_data["connection_id"];
    
                                        // /connections/{conn_id}/accept-invitation
    
                                        var accept_invitation_req = http.request({
                                            host: '127.0.0.1',
                                            port: 8002,
                                            path: `/connections/${connection_id}/accept-invitation`,
                                            method: 'POST',
                                            accept: 'application/json'
                                            }, function(res) {});
    
                                            accept_invitation_req.end(JSON.stringify(invitation));
    
    
                                            // get_connections
    
                                            var get_connections = http.request({
                                                host: '127.0.0.1',
                                                port: portNumber,
                                                path: `/connections`,
                                                method: 'GET',
                                                accept: 'application/json'
                                                }, function(res) {
                                                    res.on('data', chunk => {
                                                        var connections_data = JSON.parse(chunk);
                                                        var connection_id_for_process = connections_data["results"][0]["connection_id"];
                                                        globalConnections[globalConnections.length -1]["connection_id"] = connection_id_for_process;
                                                        // /connections/{conn_id}/accept-request
    
                                                        var accept_request = http.request({
                                                            host: '127.0.0.1',
                                                            port: portNumber,
                                                            path: `/connections/${connection_id_for_process}/accept-request`,
                                                            method: 'POST',
                                                            accept: 'application/json'
                                                            }, function(res) {});
                                                        accept_request.end(); 

                                                        // var send_message_request = http.request({
                                                        //     host: '127.0.0.1',
                                                        //     port: portNumber,
                                                        //     path: `/connections/${connection_id_for_process}/send-message`,
                                                        //     method: 'POST'
                                                        // }, function(res) {
                                                        //     res.on('data', function (chunk) {
                                                        //         let data = '';
                                                        //         data += chunk;
                                                        //         console.log(data);
                                                        //     });
                                                        // });
                                                        // send_message_request.end(JSON.stringify({
                                                        //     "content": "Hello"
                                                        //   }));
                                                    })
                                                });
                                            get_connections.end(); 
                                        });
    
                                    });
                            receive_invitation_req.end(JSON.stringify(invitation));
                        });
                    });
                create_invitation_req.end()
    
            })
    
        }
    }

    catch (e) {
        console.log(e)
    }

}

async function runTest (currentPayloadSizeInByte, currentMessagesPerSecond) {
    console.log(globalConnections);
    for(let i=0; i<globalConnections.length; i++) {
        globalConnections[i]["globSent"] = 0;
        globalConnections[i]["globReceived"] = 0;
        globalConnections[i]["globTotalLatency"] = 0;
        globalConnections[i]["globMinLatency"] = 99999999999999999999999999;
        globalConnections[i]["globMaxLatency"] = 0;
    }
    console.log(`${(new Date()).toISOString()} | Starting test with payload size ${currentPayloadSizeInByte} B and ${currentMessagesPerSecond} msg/s`);
    const messageCount = Math.ceil(testDurationInSeconds * currentMessagesPerSecond);
    const intervalInMilliseconds = 1000 / currentMessagesPerSecond;
    globSent = 0;
    globReceived = 0;
    let start = now();
    let startx = null;
    // generate test data
    var data = Array(messageCount).fill().map(() => ({"content": encodeURIComponent(crypto.randomBytes(currentPayloadSizeInByte).toString('hex'))}));
    const dataGenerationInMs = now() - start;

    const timer = new NanoTimer();

    start = now();
    var promisesArray = [];

    for(let i=0; i<currentMessagesPerSecond; i++) {
        let prom = new Promise((resolve) => {
            let counter = 0;
            let minLatency = 99999999999999999999999999;
            let maxLatency = 0;
            let avgLatency = 0;
            let totalLatency = 0;
            let totalReceivedMessages = 0;
            let totalSentMessages = 0;
            globTotalLatency = 0;
            globMinLatency = 99999999999999999999999999;
            globMaxLatency = 0;
            const sendData = () => {
                try {
                    var options = {
                        host: '127.0.0.1',
                        port: globalConnections[i]["port"],
                        path: `/connections/${globalConnections[i]["connection_id"]}/send-message`,
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
                  // console.log(JSON.stringify(data[counter])) 
                        // console.log(JSON.stringify(data[counter])) 
                                
                        req.end(JSON.stringify(data[counter]))
                        counter++;
                        totalSentMessages++;    
  
                        if(totalSentMessages > globalConnections[i]["globSent"]) globalConnections[i]["globSent"] = totalSentMessages; 
        
                        req.on('response', function(res) {
                        //   console.log(res["req"])
                            
                            // console.log(totalReceivedMessages, totalSentMessages)
                            totalReceivedMessages++;
                            if(totalReceivedMessages > globalConnections[i]["globReceived"]) globalConnections[i]["globReceived"] = totalReceivedMessages;
                            
                            // console.log(requestsArray.indexOf(res["req"]))
                            let latency = Math.abs(now() - requestsTimesArray[requestsArray.indexOf(res["req"])]);
                            globalConnections[i]["globTotalLatency"] += latency;
                            // console.log("latency ", latency, " timestamp ", requestsTimesArray[requestsArray.indexOf(res["req"])], " now ", now())
                            if(latency < minLatency) minLatency = latency;
                            if(latency > maxLatency) maxLatency = latency;
                            totalLatency += latency;
    
                            if(globalConnections[i]["globMaxLatency"] < maxLatency) globalConnections[i]["globMaxLatency"] = maxLatency;
                            if(globalConnections[i]["globMinLatency"] > minLatency) globalConnections[i]["globMinLatency"] = minLatency;
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
        })
    
        promisesArray.push(prom);
    }

    Promise.all(promisesArray).then(()=> {

    })

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
