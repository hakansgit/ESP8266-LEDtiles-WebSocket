var canvas, ctx;

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

function wheelMouseMove(e) {
    // get coordinates of current position
    var canvasOffset = $(canvas).offset();
    var canvasScale = canvas.width / canvas.offsetWidth;
    var canvasX = Math.floor((e.pageX - canvasOffset.left) * canvasScale);
    var canvasY = Math.floor((e.pageY - canvasOffset.top) * canvasScale);

    // get current pixel
    var imageData = ctx.getImageData(canvasX, canvasY, 1, 1);
    var pixel = imageData.data;

    // update preview color
    var pixelColor = "rgb(" + pixel[0] + ", " + pixel[1] + ", " + pixel[2] + ")";
    $('#nextColor').css('backgroundColor', pixelColor);

    // // update controls
    // $('#rVal').val(pixel[0]);
    // $('#gVal').val(pixel[1]);
    // $('#bVal').val(pixel[2]);
    // $('#rgbVal').val(pixel[0] + ',' + pixel[1] + ',' + pixel[2]);

    // var dColor = pixel[2] + 256 * pixel[1] + 65536 * pixel[0];
    // $('#hexVal').val('#' + ('0000' + dColor.toString(16)).substr(-6));
}

function wheelClick(e) {
    $('#currentColor').css('backgroundColor', $('#nextColor').css('backgroundColor'));
}

var t;

function panelClick(e) {
    console.log($('#currentColor').css('backgroundColor'));
    t = $(e.target);
    $(e.target).css('fill', $('#currentColor').css('backgroundColor'));
}

$(function () {
    initWheel();
    $('#picker').on('mousemove', (e) => wheelMouseMove(e));
    $('#picker').on('click', (e) => wheelClick(e));
    $('.panel').on('click', (e) => panelClick(e));
})