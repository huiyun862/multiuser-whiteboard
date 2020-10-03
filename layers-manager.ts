import { Line, LineCollection, LinesManager } from "./lines-manager";

export interface Layer{
    id: string,
    opacity: number, 
    lines: {[key: string]: Line},
    order?: number
}

export class LayersMangager{
    // public layersCollection: {[key:string]:{[key:string]:Line}};
    public layersCollection: {[key:string]:Layer};
    private layersAdded: number;
    
    
    constructor(){
        this.layersCollection = {};
        this.layersAdded= 0;
    }

    public getLayer(layerId:string): Layer{
        if (this.layersCollection.hasOwnProperty(layerId)){
            let layer = this.layersCollection[layerId];
            return layer;
        }
        return null;
        
    };

    public addLayer(): Layer{
        let id = 'layer' + this.layersAdded;
        this.layersAdded++;
        this.layersCollection[id] = {
            id: id,
            opacity: 100,
            lines: {}

        };
        return this.layersCollection[id];
    }
    public deleteLayer(layerId:string): Layer{
        if (this.layersCollection.hasOwnProperty(layerId)){
            let layer = this.layersCollection[layerId];
            delete this.layersCollection[layerId];
            return layer;
        }
        return null;
        
    }
    public addLine(line:Line){
        if (this.layersCollection.hasOwnProperty(line.layerId)){
            this.layersCollection[line.layerId].lines[line.id] = line;
        }
    }
    public deleteLine(layerId:string, lineId:string){
        if (this.layersCollection.hasOwnProperty(layerId) && this.layersCollection[layerId].lines.hasOwnProperty(lineId)){
            delete this.layersCollection[layerId].lines[lineId];
        }
    }
    public setOpacity(layerId:string, val:number){
        if (this.layersCollection.hasOwnProperty(layerId)){
            if (val >= 0 && val<= 100){
                this.layersCollection[layerId].opacity = val;
            }
        }
    }
    









}