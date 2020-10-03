const socket = io();

var layersCollection = {};
var selecting = true;
var color = '#000000';
var width = 4;
var pointRadius = 7;
var colorSelecting = false;
var widthSelecting = false;
var canvas;
var layerSelected = null;
var rightPanelOpen = false;

socket.on('config', (CONFIG) => {
	width = CONFIG.STARTING_LINE_WIDTH;
	$('#width-display').html(width);
	pointRadius = CONFIG.POINT_DISTANCE_RADIUS;
});
socket.on('layersCollection', (layerClctn) => {
	layersCollection = layerClctn;
	layerSelected = Object.keys(layersCollection)[0];
	clearCanvas();
	redrawCanvas();
	reselectColor();
	loadNewLayers();
});
socket.on('line', (line) => {
	layersCollection[line.layerId].lines[line.id] = line;
	if (line.author != socket.id) {
		drawLine(line);
	}
});
socket.on('undoLine', (line) => {
	clearCanvas();
	delete layersCollection[line.layerId].lines[line.id];
	redrawCanvas();
});
socket.on('redoLine', (line) => {
	layersCollection[line.layerId].lines[line.id] = line;
	drawLine(line);
});
socket.on('addLayer', (layer) => {
	layersCollection[layer.id] = layer;
	loadNewLayers();
});
socket.on('deleteLayer', (layer) => {
	delete layersCollection[layer.id];
	layerSelected = Object.keys(layersCollection)[0];
	loadNewLayers();
	redrawCanvas();
});
function undo(){
	socket.emit('undo');
};
function redo(){
	socket.emit('redo');
};
function sendLineToServer(linepoints){
	var line= {
		id: null,
		coords: linepoints,
		color: color,
		width: width,
		layerId: layerSelected
	};
	socket.emit('line', line);
};
function goToLocation(x, y){
	ctx = canvas.getContext('2d');
	ctx.strokeStyle = color;
	ctx.lineWidth = width;
	ctx.beginPath();
	ctx.moveTo(x, y);
}
function drawLineTo(x, y){
	ctx = canvas.getContext('2d');
	ctx.lineTo(x, y);
	// ctx.strokeStyle = '#000000';
	ctx.lineWidth = width;
	ctx.stroke();
}
// function drawLine(linepoints){
// 	ctx = canvas.getContext('2d');
// 	ctx.beginPath();
// 	ctx.moveTo(linepoints[0].x, linepoints[0].y); 
// 	for(let i=1; i<linepoints.length; i++){
// 		ctx.lineTo(linepoints[i].x, linepoints[i].y);
// 	}
// 	ctx.strokeStyle = '#000000';
// 	ctx.lineWidth = 4;
// 	ctx.stroke();
// }
function reselectColor(){
	ctx = canvas.getContext('2d');
	ctx.strokeStyle = color;
}
function clearCanvas(){
	ctx = canvas.getContext('2d');
	ctx.clearRect(0,0,canvas.width, canvas.height);
}
function drawLine(line){
	ctx = canvas.getContext('2d');
	// ctx.globalAlpha = .1 ;
	ctx.beginPath();
	ctx.moveTo(line.coords[0].x, line.coords[0].y); 
	for(let i=1; i<line.coords.length; i++){
		ctx.lineTo(line.coords[i].x, line.coords[i].y);
	}
	ctx.strokeStyle = line.color;
	ctx.lineWidth = line.width;
	ctx.stroke();
}
function getDistance(coords1, coords2) {
	return Math.sqrt(Math.pow(coords1.x - coords2.x, 2) + Math.pow(coords1.y - coords2.y, 2));
}
var line = null;
var previouscords=null; 

var mouseDown=false;
function initializeMousehandlers() {
	$('#owo-board').mousedown((e) => {
		if(mouseDown||selecting){
			return;
		}
		mouseDown = true;
		previouscords = {x:e.clientX, y:e.clientY};
		line = [previouscords];
		goToLocation(e.clientX,e.clientY);
	});
	$('#owo-board').on('vmousedown',(e) => {
		if(mouseDown||selecting){
			return;
		}
		mouseDown = true;
		previouscords = {x:e.clientX, y:e.clientY};
		line = [previouscords];
		goToLocation(e.clientX,e.clientY);
	});

	$('#owo-board').mouseup((e) => {
		if(!mouseDown||selecting){
			return;
		}
		mouseDown = false;
		sendLineToServer(line);
	});
	$('#owo-board').on('vmouseup',(e) => {
		if(!mouseDown||selecting){
			return;
		}
		mouseDown = false;
		sendLineToServer(line);
	});
	$('#owo-board').mouseleave((e) => {
		if(!mouseDown||selecting){
			return;
		}
		mouseDown = false;
		sendLineToServer(line);
	});
	$('#owo-board').on('vmouseout',(e) => {
		if(!mouseDown||selecting){
			return;
		}
		mouseDown = false;
		sendLineToServer(line);
	});
	$('#owo-board').mousemove((e) => {
		if(selecting){
			return;
		}
		if(mouseDown && getDistance(previouscords,{x:e.clientX, y:e.clientY})>=pointRadius){
			drawLineTo(e.clientX,e.clientY);
			previouscords = {x:e.clientX, y:e.clientY};
			line.push(previouscords);
		}
	});
	$('#owo-board').on('vmousemove',(e) => {
		if(selecting){
			return;
		}
		if(mouseDown && getDistance(previouscords,{x:e.clientX, y:e.clientY})>=pointRadius){
			drawLineTo(e.clientX,e.clientY);
			previouscords = {x:e.clientX, y:e.clientY};
			line.push(previouscords);
		}
	});
	
	$('#owo-board').dblclick((e) => {
		//console.log('double click');
		//$(initializeDrawTool).hide();
	
	});
}

function initializeToolBar(){
	$('#selector').click((e) => {
		selecting = true;
	});
	$('#draw-tool').click((e) => {
		selecting = false;
	});
	$('#color-selector').click((e) => {
		if(colorSelecting==true){
			$('#color-selection').css('display','none');
			colorSelecting = false;
		}
		else{
			$('#color-selection').css('display','block');
			colorSelecting = true;
		}
	});
	$('#color-red').click((e) => {
		color = '#ff0000';
	});
	$('#color-orange').click((e) => {
		color = '#ff9933';
	});
	$('#color-yellow').click((e) => {
		color = '#ffff66';
	});
	$('#color-green').click((e) => {
		color = '#009900';
	});
	$('#color-blue').click((e) => {
		color = '#0000ff';
	});
	$('#color-purple').click((e) => {
		color = '#660066';
	});
	$('#color-pink').click((e) => {
		color = '#ff6699';
	});
	$('#color-lime').click((e) => {
		color = '#00ff00';
	});
	$('#color-cyan').click((e) => {
		color = '#00ffff';
	});
	$('#color-black').click((e) => {
		color = '#000000';
	});
	$('#color-white').click((e) => {
		color = '#ffffff';
	});
	$('#color-gray').click((e) => {
		color = '#444444';
	});
	$('#width-selector').click((e) => {
		if(widthSelecting==true){
			$('#width-selection').css('display','none');
			widthSelecting = false;
		}
		else{
			$('#width-selection').css('display','block');
			widthSelecting = true;
		}
	});
	$('#width-inc').click((e) => {
		width++;
		$('#width-display').html(width);
	});
	$('#width-dec').click((e) => {
		if(width <= 1){
			return;
		}
		width--;
		$('#width-display').html(width);
	});
}


function initializeRightConfigPanel(){
	$('#trigger-right-panel').click((e) => {
		let openLoc = $('.tool-layer').width() - 150;
		if(rightPanelOpen){
			$('#right-config-panel')
				.css({left: openLoc})
				.animate({left:'100%'}, 400, () => {
					rightPanelOpen = false;
					console.log('hidden');
				});
		}
		else{
			$('#right-config-panel')
				.css({left:'100%'})
				.animate({left: openLoc}, 400, () => {
					rightPanelOpen = true;
					console.log('open');
				});
		}

	});
	$('#layer-adder').click((e) => {
		socket.emit('add-layer');

	});
	$('#layer-deletor').click((e) => {
		socket.emit('delete-layer', layerSelected);

	});
}
function loadNewLayers(){
	let layersList = document.getElementById('layer-list');
	layersList.innerHTML = '';
	Object.keys(layersCollection).forEach((layerKey) => {
		let listElement = document.createElement('li');
		listElement.setAttribute('class', 'clickable');
		listElement.addEventListener('click',()=> {
			layerSelected = layerKey; 
			console.log(layerSelected);
		});
		listElement.innerHTML = layerKey;
		layersList.appendChild(listElement);
	});
}
function redrawCanvas(){
	document.getElementById("owo-board").width = window.innerWidth;
	document.getElementById("owo-board").height = window.innerHeight;
	Object.keys(layersCollection).forEach((layerKey) => {
		Object.keys(layersCollection[layerKey].lines).forEach((lineKey) => {
			drawLine(layersCollection[layerKey].lines[lineKey]);
		});	
	});
	reselectColor();
}
function repositionTools(){
	//right-config-panel
	let openLoc = $('.tool-layer').width() - 150;
	if(rightPanelOpen){
		$('#right-config-panel')
			.css('left', openLoc);
	}
	else{
		$('#right-config-panel')
			.css('left','100%');
	}
}
$(document).ready(() => {
	console.log ('ready');
	initializeMousehandlers();
	initializeToolBar();
	initializeRightConfigPanel();
	canvas = document.getElementById('owo-board');
	//initializeDrawTool();
	document.getElementById("owo-board").width = window.innerWidth;
    document.getElementById("owo-board").height = window.innerHeight;
    $(window).resize(() => {
		redrawCanvas();
		repositionTools();
	});
	$(document).keydown(function(e){
		if( e.which === 90 && e.ctrlKey && e.shiftKey ){
			redo();
		}
		else if( e.which === 90 && e.ctrlKey ){
			undo();
		}          
  }); 
});