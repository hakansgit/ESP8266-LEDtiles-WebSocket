var canvas, ctx, selectedPanel, panels, mouseDownL, picker;
var wsConnection, remoteHost;

var config = {
    // remoteHost: location.hostname,
    remoteHost: "192.168.1.181",
    remotePort: 81,
}

var helper = {
    getOffset: (element) => {
        if (!element.getClientRects().length) {
            return {
                top: 0,
                left: 0
            };
        }

        let rect = element.getBoundingClientRect();
        let win = element.ownerDocument.defaultView;
        return ({
            top: rect.top + win.pageYOffset,
            left: rect.left + win.pageXOffset
        });
    },
    componentToHex: (c) => {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    },
    rgbToHex: (r, g, b) => {
        return "#" + helper.componentToHex(r) + helper.componentToHex(g) + helper.componentToHex(b);
    },
}

function initDocument() {
    panels = document.querySelectorAll('.panel');
    picker = document.getElementById('picker');
    mouseDownL = false;
    selectedPanel = 0;
    panels[selectedPanel].style.stroke = '#FFAAAA';
}

function initWebSocket() {
    wsConnection = new WebSocket('ws://' + config.remoteHost +
        ':' + config.remotePort + '/', ['arduino']);
    wsConnection.onopen = function () {
        wsConnection.send('Connect ' + new Date());
    };
    wsConnection.onerror = function (error) {
        console.log('WebSocket Error ', error);
    };
    wsConnection.onmessage = function (e) {
        console.log('Server: ', e.data);
        processRemoteMessage(e.data);
    };
    wsConnection.onclose = function () {
        console.log('WebSocket connection closed');
    };
}

function processRemoteMessage(data) {
    if (data[0] == "p") {
        panelNumber = parseInt(data[1]);
        panelColor = data.substr(3).padStart(6, "0");

        setPanelColor(panelNumber, "#" + panelColor);
    }
}

function sendPanelColor(panelNumber, hexColor) {
    rgb = panels[selectedPanel].style.fill.substr(4).replace(")", "")
        .split(", ").map(s => parseInt(s));
    wsConnection.send('p' + panelNumber + helper.rgbToHex(rgb[0], rgb[1], rgb[2]));
    // wsConnection.send(helper.rgbToHex(rgb[0], rgb[1], rgb[2]));
}

function initWheel() {
    canvas = document.getElementById('picker');
    ctx = canvas.getContext('2d');

    var image = new Image();
    image.src = "colorWheel3.jpg"
    image.onload = function () {
        canvas.height = canvas.width;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }
}

function setPanelColor(panelNumber, colorString) {
    panels[panelNumber].style.fill = colorString;
}

function setPanelColorToWheel(e) {
    var canvasOffset = helper.getOffset(canvas);
    var canvasScale = canvas.width / canvas.offsetWidth;
    var canvasX = Math.floor((e.pageX - canvasOffset.left) * canvasScale);
    var canvasY = Math.floor((e.pageY - canvasOffset.top) * canvasScale);

    // get current pixel
    var imageData = ctx.getImageData(canvasX, canvasY, 1, 1);
    var pixel = imageData.data;

    let pullDown = 30;
    let scale = 255 / (255 - pullDown);

    scaleColor = (c) => {
        pullDown = 50;
        return Math.round((c - pullDown) * 255 / (255 - pullDown));
    }

    var pixelColor = "rgb(" + scaleColor(pixel[0]) +
        ", " + scaleColor(pixel[1]) + ", " + scaleColor(pixel[2]) + ")";
    setPanelColor(selectedPanel, pixelColor);
    sendPanelColor(selectedPanel);
}

function panelClick(e) {
    panels[selectedPanel].style.stroke = '#BBBBBB';
    selectedPanel = e.target.attributes.pn.value;
    panels[selectedPanel].style.stroke = '#FFAAAA';
    console.log(selectedPanel);
}

function init() {
    initDocument();
    initWheel();
    picker.ontouchmove = (e) => setPanelColorToWheel(e.changedTouches[0]);
    picker.onmousemove = (e) => {
        if (mouseDownL) setPanelColorToWheel(e)
    };
    picker.onclick = (e) => {
        if (e.button == 0) setPanelColorToWheel(e)
    };
    picker.onmousedown = (e) => mouseDownL = (e.button == 0);
    picker.onmouseup = (e) => mouseDownL = false;
    for (var i = 0; i < panels.length; i++) {
        panels[i].addEventListener('click', panelClick);
    }
    initWebSocket();
}