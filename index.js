import http from 'http';
import fs from 'fs';
import path from 'path';

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 8000;
const server = http.createServer((req, res) => {
    if(req.method === 'GET') {
        handleGet(req, res);
    } else if (req.method === 'POST') {
        handlePost(req, res);
    } else res.writeHead(405).end(`{"error":"${http.STATUS_CODES[405]}}`);
});

server.listen(port, () => {
    console.log(`listening on port ${port}`);
});

function handleGet(req, res) {
    if(req.url == "/") req.url = "/index.html";
    let filePath = 'pages' + req.url;

    let ext = path.extname(filePath);
    if(ext == "") filePath += ".html";
    let contentType = 'text/html';
    switch (ext) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;      
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.wav':
            contentType = 'audio/wav';
            break;
    }

    fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code == 'ENOENT'){
                res.writeHead(404);
                res.end();
            }
            else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                res.end(); 
            }
        }
        else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });

//     if(req.url === '/'){
//         fs.readFile("pages/index.html", (error, data) => {
//             if (error){
//                 res.end(404);
//                 console.log(error);
//             } else {
//                 res.writeHead(200, {
//                     contentType: 'text/html',
//                 }).end(data);
//             }
//         })
//     } else if(req.url == '/contact'){
//         fs.readFile("pages/contact.html", (error, data) => {
//             if (error){
//                 res.end(404);
//                 console.log(error);
//             } else {
//                 res.writeHead(200, {
//                     contentType: 'text/html',
//                 }).end(data);
//             }
//         })
//     } else if(req.url.match(".css$")){
//         fs.readFile(path.join("pages",req.url), (error, data) => {
//             if (error){
//                 res.end(404);
//                 console.log(error);
//             } else {
//                 res.writeHead(200, {
//                     contentType: 'text/css',
//                 }).end(data);
//             }
//         });
//     } else if(req.url.match(".css$")){
//         fs.readFile(path.join("pages",req.url), (error, data) => {
//             if (error){
//                 res.end(404);
//                 console.log(error);
//             } else {
//                 res.writeHead(200, {
//                     contentType: 'text/css',
//                 }).end(data);
//             }
//         });
//     } else {
//         res.writeHead(404);
//         res.end();
//     }
}

function handlePost(req, res){
    let body = []
    if (req.url != '/contact'){
        return res.writeHead(404).end();
    }
    req.on('data', (chunk) => {
        body.push(chunk);
    }).on('end', ()=>{
        body = Buffer.concat(body).toString();
        res.on('error',(err)=>{
            console.error(err);
        })

        res.writeHead(200,{
            'Content-Type': 'application/json',
        })
        console.log(body);
        const object = toObj(body);
        console.log(object);
        console.log(Object.keys(object).length);
        if(!object.name || !object.email || !object.message 
            || Object.keys(object).length != 3) {
            res.writeHead(406).end("Data Not Acceptable");
        }
        writeObj(object,"contact.json");
        // fs.readFile("pages/contact.html", (error, data) => {
        //     if (error){
        //         res.end(404);
        //         console.log(error);
        //     } else {
        //     res.writeHead(200, {
        //         contentType: 'text/html',
        //     }).end(data+"<p>submited</p>");
        // }
        res.writeHead(200).end("success");
    })
}

function toObj(data){
    const splitter = data.split('&').map(s => s.split('='));
    let dict = new Map();
    for(let i in splitter){
        dict.set(splitter[i][0], splitter[i][1]);
    }
    const toObj = Object.fromEntries(dict);
    return toObj;
}

function writeObj(object, file){
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.log(err);
        } else {
            let obj = [];
            obj = JSON.parse(data);
            obj.push(object);
            let json = JSON.stringify(obj);
            fs.writeFile(file ,json, 'utf8', err => {
                if(err)console.log(err);
            })
        }
    })
}