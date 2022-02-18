let explodeSpeed = 88,
    heightIncrease = 22,
    visAreaH, viewerH,
    laps = 0,
    currentExpodedImage;


function viewImage(imgSrc, linkId) {
    currentExpodedImage = linkId;
    $('#viewerImage').attr("src", imgSrc);
    $('#singleImageOuterContainer').show();
    viewerH = 50;
    visAreaH = $('#visableArea').height() - 22;
    let parentPos = $('#visableArea').offset();
    $("#singleImageOuterContainer").css({ top: parentPos.top, left: parentPos.left + 200 });
    $("#viewerImage").css({ "height": 50, "width": 50 });

    $("#hdrBtmRowSec3").html("visAreaH" + visAreaH + "  viewerH: " + viewerH);
    incrementExplode();
}

function incrementExplode() {
    $("#hdrBtmRowSec3").html("visableArea height: " + visAreaH + "  viewerImage height: " + viewerH + " lap: " + laps);
    if (viewerH + 50 < visAreaH) {
        setTimeout(function () {
            viewerH += heightIncrease;
            laps++;
            $("#viewerImage").css({ "height": viewerH, "min-width": viewerH });
            incrementExplode();
        }, explodeSpeed);
    }
    else {
        $("#hdrBtmRowSec3").append("  done");
        $("#singleImageOuterContainer").css("height", visAreaH);
        $("#divShowSlideshow").show();
        $("#viewerCloseButton").show();
        if (event.keyCode === 27) {
            alert("keydown 27");
            closeImageViewer();
        }
    }
}

function closeImageViewer() {
    $('#singleImageOuterContainer').show();
    $("#divShowSlideshow").show();
    $("#viewerCloseButton").show();
}

function showSlideshow() {

    alert("show Slideshow");

    //$("#viewerImage").css("height", visAreaH);
    //$("#hdrBtmRowSec3").html("");

}

function slideClick(direction) {
    if (!event.detail || event.detail === 1) {//activate on first click only to avoid hiding again on double clicks
        if (spSlideShowRunning) {
            $('#txtStartSlideShow').html("start slideshow");
            clearInterval(imageViewerIntervalTimer);
            if (direction === 'next') {
                runSlideShow('start');
            }
            else
                spSlideShowRunning = false;
        }
        else {
            slide(direction);
        }
    }
}


