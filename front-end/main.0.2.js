var canvas, ctx, selectedPanel, panels, mouseDownL, picker;

var helper = {
    getOffset: (element) => {
        if (!element.getClientRects().length) {
            return { top: 0, left: 0 };
        }

        let rect = element.getBoundingClientRect();
        let win = element.ownerDocument.defaultView;
        return (
            {
                top: rect.top + win.pageYOffset,
                left: rect.left + win.pageXOffset
            });
    }
}

function initDocument() {
    panels = document.querySelectorAll('.panel');
    picker = document.getElementById('picker');
    mouseDownL = false;
    selectedPanel = 0;
    panels[selectedPanel].style.stroke = '#FFAAAA';
}

function initWheel() {
    canvas = document.getElementById('picker');
    ctx = canvas.getContext('2d');

    var image = new Image();
    image.src = "colorWheel.png"
    image.onload = function () {
        canvas.height = canvas.width;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }
}

function setPanelColorToWheel(e) {
    var canvasOffset = helper.getOffset(canvas);
    var canvasScale = canvas.width / canvas.offsetWidth;
    var canvasX = Math.floor((e.pageX - canvasOffset.left) * canvasScale);
    var canvasY = Math.floor((e.pageY - canvasOffset.top) * canvasScale);

    // get current pixel
    var imageData = ctx.getImageData(canvasX, canvasY, 1, 1);
    var pixel = imageData.data;

    var pixelColor = "rgb(" + pixel[0] + ", " + pixel[1] + ", " + pixel[2] + ")";
    panels[selectedPanel].style.fill = pixelColor;
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
}
