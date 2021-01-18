// const http = require('http');
// const port = process.env.PORT || 8002;
// const host = '192.168.6.2';



// const client1 = new http.Agent(opions = {setEncoding : 'utf8', keepAlive : true});
// client1.createConnection({ 'port': 8030, 'host':"192.168.6.2" }, onClientConnection);


// var cronObject = {

//     "commandsArray": ['#set$201013450@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$202018332@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$202018642@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013344@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013306@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013376@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$202018443@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013323@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013362@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013438@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013419@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013406@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013310@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013403@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013462@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013415@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013387@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013385@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013300@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013357@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013473@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013331@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013454@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013476@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013291@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013392@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013363@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013413@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013348@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013475@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013424@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013425@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013446@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013428@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013287@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013472@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013338@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013439@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013408@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013337@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$201013373@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n',
//     '#set$202018373@aquila123#PUSH_UART1:0,0,14,DDA50400FFFC77*\r\n'],

//     "batteryIMEIArray": ['201013450',
//     '202018332',
//     '202018642',
//     '201013344',
//     '201013306',
//     '201013376',
//     '202018443',
//     '201013323',
//     '201013362',
//     '201013438',
//     '201013419',
//     '201013406',
//     '201013310',
//     '201013403',
//     '201013462',
//     '201013415',
//     '201013387',
//     '201013385',
//     '201013300',
//     '201013357',
//     '201013473',
//     '201013331',
//     '201013454',
//     '201013476',
//     '201013291',
//     '201013392',
//     '201013363',
//     '201013413',
//     '201013348',
//     '201013475',
//     '201013424',
//     '201013425',
//     '201013446',
//     '201013428',
//     '201013287',
//     '201013472',
//     '201013338',
//     '201013439',
//     '201013408',
//     '201013337',
//     '201013373',
//     '202018373']
// }

// var cronString = "cron__" + JSON.stringify(cronObject)

// let p1 =  new Promise((resolve1,reject1)=>{

//     client1.write("ass", "UTF8", function(){

//         console.log("entered in 2")
//         resolve1()
//     });
  

// })

// Promise.all([p1]).then(function(){

//     // client.end()

//     res.status(200).send('batteriesCellVoltage command sent');
//     return;

// }).catch(function(err){



// })


// // const server = net.createServer(onClientConnection);
// // //Start listening with the server on given port and host.
// // server.listen(port,host,function(){
// //     console.log(`Server started on port ${port} at ${host}`); 
// //  });
 
// // //Declare connection listener function
// function onClientConnection(sock){

//     console.log("socket conencted", sock)

//     // sock.on('data',function(data){
//     //     //Log data from the client
//     //     console.log(data)

//     // });


//     // //Handle client connection termination.
//     // sock.on('close',function(){
// 	// 	console.log(`closed the connection`);
		

//     // });
//     // //Handle Client connection error.
//     // sock.on('error',function(error){
// 	// 	console.error(`Connection Error`);

//     // });

//     // sock.on('end',function(){
//     //     console.log(`ended the connection`);
//     // });
// };

// // server.on('close', () => {console.log("closing stream")})

// // server.on('error', (e) => {console.log("server error", e)}) 

const http = require('http');
const NanoTimer = require('nanotimer');
const timer = new NanoTimer();
const speed  = 0.001;

console.log(`at speed ${1000/ speed} messages/second`)

timer.setInterval(() => {
    var options = {
        host: '192.168.6.2',
        port: 8002,
        path: '/connections/3934bd34-23d0-4003-b5ad-e5cba6dbc317/send-message',
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
      req.write(JSON.stringify({"content": "ass"}));
      req.end();
      console.log("sent")
}, '', `${speed}m`);


