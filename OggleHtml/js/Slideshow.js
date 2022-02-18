let exploderInterval, slideShowSpeed = 5000, viewerH = 50, viewerW = 50, viewerT = 0, viewerL = 0,
    windowW = $(window).width(), windowH = $(window).height(),
    Xincrimentor = 15, Yincrimentor = 10,
    exploderSpeed = 18, slideshowSpped = 570,
    imageViewerArray = {},
    spSessionCount = 0, imageViewerIndex = 0, imageViewerIntervalTimer,
    imageViewerFolderId, imageViewerFolderName, albumFolderId,
    spSlideShowRunning=false, slideShowButtonsActive = false, spIncludeSubFolders=false,
    slideshowImgSrc = new Image(), tempImgSrc = new Image(), ssVisitorId;


function viewImage(imgSrc, linkId) {

    $('#viewerImage').attr("src", imgSrc);
    $('#singleImageOuterContainer').show();


    let parentPos = $('#visableArea').offset();

    $("viewerImage").css({ top: parentPos.top, left: parentPos.left + 200 });

    let visAreaH = $('#visableArea').height();
    let vieweriH = $("viewerImage").height();
    $("hdrBtmRowSec3").html("visAreaH" + visAreaH + "  vieweriH: " + vieweriH);
    while (vieweriH < visAreaH) {
        setTimeout(function () {
            visAreaH += 22;
            $("viewerImage").css("height", visAreaH);
            $("hdrBtmRowSec3").html("visAreaH" + visAreaH + "  vieweriH: " + $("viewerImage").height());
        }, 1000);
    }
    $("viewerImage").css("height", $("visableArea").height());


    // incrimentExplode();
    // $("#viewerImage").css({ position: 'relative' });
    
    
    //$("#mydiv").css({ top: 200, left: 200, position: 'absolute' });



/*
    <div id="singleImageOuterContainer" class="explodingImageContainer">
        <div id="singleImageContainer" class="explodingImageContainer">
            <img id='viewerImage' class='explodingViewerImage'/>
        </div>
    </div>
 */







//    $('#singleImageContainer').height(viewerH);
//    $('#viewerImage').removeClass('redSides');
//    $('#viewerButtonsRow').hide();

//    setTimeout(function () { $('#albumPageLoadingGif').show() }, 500);
//    tempImgSrc.onload = function () {
//        $('#albumPageLoadingGif').hide();
//        setTimeout(function () { $('#albumPageLoadingGif').hide() }, 500);
//        exploderInterval = setInterval(function () {
//            incrimentExplode();
//        }, exploderSpeed);
//        $('#ssHeaderCount').html(imageViewerIndex + " / " + imageViewerArray.length);
//    };
//    tempImgSrc.src = settingsImgRepo + imageViewerArray[imageViewerIndex].FileName;
//    if (spIncludeSubFolders) {
//        runSlideShow("start");
//        console.log("runSlideShow(start)");
//    }
}

function incrimentExplode() {
    if (viewerT !== 0) {
        viewerT -= Yincrimentor;
        if (viewerT < 0) viewerT = 0;
    }
    if (viewerL !== 0) {
        viewerL -= Xincrimentor;
        if (viewerL < 0) viewerL = 0;
    }
    if (viewerH !== windowH) {
        viewerH += Yincrimentor;
        if (viewerH > windowH) { viewerH = windowH; }
    }
    if (viewerW !== windowW) {
        viewerW += Xincrimentor * 2;
        if (viewerW > windowW) { viewerW = windowW; }
    }
    $('#singleImageContainer').css('top', viewerT);
    $('#singleImageContainer').css('left', viewerL);
    $('#singleImageContainer').height(viewerH);
    $('#singleImageContainer').width(viewerW);
    //$('#viewerImageContainer').height(viewerH);
    //$('#viewerImageContainer').css('left', ($('#slideShowContainer').width() - $('#viewerImage').width()) / 2);
    //   alert("dlgW: " + $('#slideShowContainer').width() + "imgW: " + $('#viewerImage').width());

    if ((viewerT === 0) && (viewerL === 0) && (viewerH === windowH) && (viewerW === windowW)) {
        $('#viewerButtonsRow').show();
        clearInterval(exploderInterval);
        $('#singleImageContainer').css('top', 0);
        $('#singleImageContainer').css('left', 0);

        //$('#slideshowImageLabel').hide();
        //if (imageViewerArray[imageViewerIndex].FolderId !== imageViewerArray[imageViewerIndex].ImageFolderId) {
        //    $('#slideshowImageLabel').html(imageViewerArray[imageViewerIndex].ImageFolderName).fadeIn();
        //}
        //resizeViewer();
    }
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
