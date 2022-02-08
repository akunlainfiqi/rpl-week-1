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
    if(req.url === '/'){
        fs.readFile("pages/index.html", (error, data) => {
            if (error){
                res.end(404);
                console.log(error);
            } else {
                res.writeHead(200, {
                    contentType: 'text/html',
                }).end(data);
            }
        })
    } else if(req.url == '/contact'){
        fs.readFile("pages/contact.html", (error, data) => {
            if (error){
                res.end(404);
                console.log(error);
            } else {
                res.writeHead(200, {
                    contentType: 'text/html',
                }).end(data);
            }
        })
    } else if(req.url.match(".css")){
        fs.readFile(path.join("pages",req.url), (error, data) => {
            if (error){
                res.end(404);
                console.log(error);
            } else {
                res.writeHead(200, {
                    contentType: 'text/css',
                }).end(data);
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
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
        res.end()
    })
}