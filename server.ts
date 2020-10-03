import * as express from 'express';
import * as serveStatic from 'serve-static';
import * as path from 'path';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as sio from 'socket.io';
import {CONFIG} from './config';
import {
    Line,
    LinesManager
} from './lines-manager';



var app = express();
app.use(serveStatic(path.resolve(__dirname, 'public')));
var server = http.createServer(app);
var io = sio(server, {
    pingTimeout: 600000
});

console.log('owo');

console.log('Server is online!');


var lineMgr: LinesManager = new LinesManager();

io.on('connection',(socket) => {
    lineMgr.addNewUser(socket.id);
    socket.emit('config',CONFIG);
    // socket.emit('lineCollection', lineMgr.allLinesCollection);
    socket.emit('layersCollection', lineMgr.layersMgr.layersCollection);
    socket.on('line', (line: Line) => {
        if (line.coords == null){
            return;
        }
        line = lineMgr.addLine(socket.id, line);
        socket.broadcast.emit('line', line);
        socket.emit('line', line);
    });
    socket.on('undo', () => {
        let line = lineMgr.undoLine(socket.id);
        if (line){
            socket.broadcast.emit('undoLine', line);
            socket.emit('undoLine', line);
        }
    });
    socket.on('redo', () => {
        let line = lineMgr.redoLine(socket.id);
        if (line){
            socket.broadcast.emit('redoLine', line);
            socket.emit('redoLine', line);
        }
    });
    socket.on('add-layer', () => {
        let layer = lineMgr.layersMgr.addLayer();
        socket.broadcast.emit('addLayer', layer);
        socket.emit('addLayer', layer);
    });
    socket.on('delete-layer', (layerId) => {
        if (Object.keys(lineMgr.layersMgr.layersCollection).length > 1) {
            lineMgr.deleteLinesRelatedToLayer(layerId);
            let layer = lineMgr.layersMgr.deleteLayer(layerId);
            if (layer) {
                socket.broadcast.emit('deleteLayer', layer);
                socket.emit('deleteLayer', layer);
            }
        }
    });
});
server.listen(8000);