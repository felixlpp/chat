const http = require('http');
const url = require('url');
const Controller = require('./controller/user');
const controller = new Controller();

let starter = (request, response) => {
    let postData = "";
    let pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");

    request.setEncoding("utf8");
    // 设置监听器，接收数据
    request.addListener("data", function(postDataChunk) {
        console.log(postDataChunk);
        postData += postDataChunk;
        postDataChunk = JSON.parse(postDataChunk);
        // 将接收的数据存入request
        request.body = postDataChunk;
        console.log("Received POST data chunk '"+ postDataChunk + "'.");
    });
    // 数据接收完成监听器
    request.addListener("end", async function(data) {
        console.log(pathname);
        // 简单实现路由分发
        switch (pathname) {
            case "/regist":
                await controller.regist(request, response);
                break;
            case "/login":
                await controller.login(request, response);
                break;
            default:
                response.writeHead(404, {
                    'Content-Length': Buffer.byteLength('Not Found'),
                    'Content-Type': 'text/plain'
                })
               response.end('Not Found');
               break;
        }
    });
    process.on('uncaughtException', async (err) => {
      await controller.end(response, 500, 'server error', 'text/plain')
    });
    process.on('unhandledRejection', async (reason, p) => {
      await controller.end(response, 500, 'server error', 'text/plain')
    });
}
// 启动服务
http.createServer(starter).listen(65535);
