import { LayersMangager } from "./layers-manager";

export interface Point {
    x: number,
    y: number
}
export interface Line {
    id: string, 
    author: string,
    coords: Point[],
    color: string,
    width: number,
    layerId: string
}
export interface LineCollection{
    id: string,
    lines: {[key: string]: Line},
    lineIds: string[],
    undoneLines: Line[]
}

export class LinesManager{
    public userLineCollection: {[key: string]: LineCollection};
    //public allLinesCollection: {[key: string]: Line};
    public layersMgr: LayersMangager;
    private linesAdded: number;

    constructor(){
        this.userLineCollection = {};
        //this.allLinesCollection = {};
        this.layersMgr = new LayersMangager();
        this.layersMgr.addLayer();
        this.linesAdded = 0;
    }

    public addNewUser(id:string){
        this.userLineCollection[id] = {
            id: id,
            lines: {},
            lineIds: [],
            undoneLines: []
        }
    }

    public deleteUser(id:string){
        if (this.userLineCollection.hasOwnProperty(id)){
            delete this.userLineCollection[id];
        }
    }

    public addLine(id:string, line:Line): Line{
        if (this.userLineCollection.hasOwnProperty(id)){
            line.id = 'line' + this.linesAdded;
            this.linesAdded++;
            line.author = id;
            this.userLineCollection[id].lines[line.id] = line;
            this.userLineCollection[id].lineIds.push(line.id);
            this.userLineCollection[id].undoneLines = [];
            // this.allLinesCollection[line.id] = line;
            this.layersMgr.addLine(line);
            return line;
        }
        return null;
    }

    public deleteLine(id:string, lineId:string){
        if (this.userLineCollection.hasOwnProperty(id) && lineId != null && this.userLineCollection[id].lines.hasOwnProperty(lineId)){
            let line = this.userLineCollection[id].lines[lineId];
            delete this.userLineCollection[id].lines[lineId];
            let index = this.userLineCollection[id].lineIds.indexOf(lineId);
            this.userLineCollection[id].lineIds.splice(index, 1);
            // delete this.allLinesCollection[lineId]; 
            this.layersMgr.deleteLine(line.layerId, lineId);
        }
        
    }

    public deleteLinesRelatedToLayer(layerId:string){
        let layer = this.layersMgr.getLayer(layerId);
        if (layer != null){
            Object.keys(layer.lines).forEach((lineId) => {
                let line = layer.lines[lineId];
                delete this.userLineCollection[line.author].lines[line.id];
                let index = this.userLineCollection[line.author].lineIds.indexOf(line.id);
                this.userLineCollection[line.author].lineIds.splice(index, 1);
            });
        }
    }

    public undoLine(id:string): Line{
        if (this.userLineCollection.hasOwnProperty(id) && this.userLineCollection[id].lineIds.length > 0){
            let lineId = this.userLineCollection[id].lineIds.pop();
            var line = this.userLineCollection[id].lines[lineId];
            // delete this.allLinesCollection[lineId]; 
            this.layersMgr.deleteLine(line.layerId, lineId);
            this.userLineCollection[id].undoneLines.push(this.userLineCollection[id].lines[lineId]);
            delete this.userLineCollection[id].lines[lineId];
        }
        return line;
    }
    public redoLine(id:string): Line{
        if (this.userLineCollection.hasOwnProperty(id) && this.userLineCollection[id].undoneLines.length > 0){
            var line = this.userLineCollection[id].undoneLines.pop();
            while (this.layersMgr.getLayer(line.layerId) == null) {
                if (this.userLineCollection[id].undoneLines.length == 0) {
                    return null;
                }
                line = this.userLineCollection[id].undoneLines.pop();
            }
            this.userLineCollection[id].lineIds.push(line.id);
            this.userLineCollection[id].lines[line.id] = line;
            // this.allLinesCollection[line.id] = line;
            this.layersMgr.addLine(line);
        }
        return line;
    }
}
