const slideShowImgRepo = 'https://ogglefiles.com/danni/';
const slideShowSpeed = 5000;

let imageArray, imageViewerIndex = 0,
    albumFolderId = 0,
    spSessionCount = 0,
    slideshowImgSrc = new Image(),
    tempImgSrc = new Image(),
    slideShowButtonsActive = false,
    islargeLoad = false, spSlideShowRunning, imageViewerIntervalTimer,
    imageViewerFolderName;


/*
    ssVisitorId;
*/

function startSlideShow(folderId, startLink, largeLoad) {
    islargeLoad = largeLoad;
    albumFolderId = folderId;

    displayFooter("slideshow");
    $('#galleryContentArea').fadeOut();
    $('#slideshowContent').show().fadeIn();
    spSessionCount = 0;
    if (islargeLoad)
        loadParentSlideshowItems();
    else
        loadSlideshowItems(folderId, startLink);
}

function loadSlideshowItems(folderId, startLink) {
    try {
        let infoStart = Date.now();
        $('#galleryTopRow').show();
        $('#aboveImageContainerMessageArea').html('loading');
        $.ajax({
            url: 'php/customQuery.php?query=select * from VwLinks where FolderId=' + folderId,
            success: function (data) {
                if (data.substring(20).indexOf("error") > 0) {
                    $('#blogListArea').html(data);
                }
                else {
                    imageArray = JSON.parse(data);
                    initialExplode(startLink);
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                alert("getGalleryPageInfo: " + errMsg);
                //if (!checkFor404(errMsg, folderId, "chargeCredits")) logError("XHR", folderId, errMsg, "chargeCredits");
            }
        });
        let delta = (Date.now() - infoStart) / 1000;
        console.log("getGalleyInfo took: " + delta.toFixed(3));
    } catch (e) {
        logCatch("getGalleryPageInfo", e);
    }
}

function initialExplode(startLink) {
    imageViewerIndex = imageArray.findIndex(node => node.LinkId == startLink);
    $('#viewerImage').attr("src", slideShowImgRepo + imageArray[imageViewerIndex].FileName);
    $('#viewerImage').show();
    getFolderDetails();
    imageViewerIntervalTimer = setInterval(function () {
        slide('next');
    }, slideShowSpeed);
    spSlideShowRunning = true;
    slideShowButtonsActive = true;
}

function getFolderDetails() {
    $.ajax({
        url: 'php/customQuery.php?query=select f.FolderName, p.FolderName as ParentName ' +
            ' from CategoryFolder f join CategoryFolder p on f.Parent = p.Id where f.Id=' + albumFolderId,
        success: function (data) {
            if (data.substring(20).indexOf("error") > 0) {
                alert(data);
            }
            else {
                let thisCatFolder = JSON.parse(data)[0];
                $('#breadcrumbContainer').html("<span sytle='font-size:19px'>" + thisCatFolder.ParentName +
                    "/" + thisCatFolder.FolderName + "</span>");
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            alert("getGalleryPageInfo: " + errMsg);
            //if (!checkFor404(errMsg, folderId, "chargeCredits")) logError("XHR", folderId, errMsg, "chargeCredits");
        }
    });


}

function runSlideShow(action) {
    //console.log("run slideShow action: " + action + "  txtStartSlideShow: " + $('#txtStartSlideShow').html());
    //alert("run slideShow action: " + action + "  txtStartSlideShow: " + $('#txtStartSlideShow').html());
    if (action === 'start') {
        if ($('#txtStartSlideShow').html() === "stop slideshow") {
            spSlideShowRunning = false;
            clearInterval(imageViewerIntervalTimer);
            $('#txtStartSlideShow').html("start slideshow");
            return;
        }
        if ($('#txtStartSlideShow').html() === "start slideshow") {
            $('#txtStartSlideShow').html("stop slideshow");
            if (spSlideShowRunning)
                slide('next');
            else {
                // here is where we really start the slideshow
                imageViewerIntervalTimer = setInterval(function () {
                    slide('next');
                }, slideShowSpeed);
                spSlideShowRunning = true;
            }
        }
    }
    if (action === 'stop') {
        if (spSlideShowRunning) {
            $('#txtStartSlideShow').html("start slideshow");
            clearInterval(imageViewerIntervalTimer);
            spSlideShowRunning = false;
        }
        return;
    }
    if (action === 'pause') {
        if (spSlideShowRunning) {
            clearInterval(imageViewerIntervalTimer);
            $('#txtStartSlideShow').html("||");
        }
    }
    if (action === 'resume') {
        if (spSlideShowRunning) {
            $('#txtStartSlideShow').html("stop slideshow");
            slide('next');
            imageViewerIntervalTimer = setInterval(function () {
                slide('next');
            }, slideShowSpeed);
        }
    }
}

function adjustSlideshowSpeed(action) {
    if (slideShowSpeed === 0) {
        slideShowSpeed = 5000;
    }
    if (action === "faster") {
        slideShowSpeed -= 1000;
    }
    if (action === "slower") {
        slideShowSpeed += 1000;
    }
    //if (slideShowSpeed <= 0) {
    //    $('#showSlideshow').attr("Title", "start slideshow");
    //    slideShowRunning = false;
    //    clearInterval(imageViewerIntervalTimer);
    //}
    //$('#fasterSlideshow').attr("Title", "slideshow " + 10 - (slideShowSpeed / 1000) + "x");
    //$('#slowerSlideShow').attr("Title", "slideshow " + 10 - (slideShowSpeed / 1000) + "x");

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

function slide(direction) {
    try {
        if (isNullorUndefined(imageArray[imageViewerIndex]))
            logError("SLA", albumFolderId, "", "slideshow.slide");
        else {
            $('#copycatDiv').hide();
            let showLoadingGif = true;
            setTimeout(function () {
                if (showLoadingGif)
                    $('#slideshowLoadingGif').show()
            }, 500);

            tempImgSrc.onload = function () {
                showLoadingGif = false;
                $('#slideshowLoadingGif').hide();
                //setTimeout(function () { $('#albumPageLoadingGif').hide() }, 502);
                //let startLoadTime = Date.now();
                //imgSrc.onload = function () {

                $('#viewerImage').css("transform", "translateX(0)");
                // SLIDE OUT OF VIEW
                if (direction === 'next') {  // LEFT TO RIGHT OUT THE RIGHT SIDE
                    $('#viewerImage').css("transform", "translateX(1500px)", slideShowSpeed);
                }
                else { // 'prev'        
                    $('#viewerImage').css("transform", "translateX(-1500px)", slideShowSpeed);
                }
                $('.slideshowNavgArrows').css('visibility', 'hidden');
                $('#slideshowImageLabel').fadeOut();
                $('#thumbImageContextMenu').fadeOut();

                setTimeout(function () {
                    $('#viewerImage').hide();
                    if (direction === 'next') {
                        $('#viewerImage').css("transform", "translateX(-3200px)");
                    }
                    else {
                        $('#viewerImage').css("transform", "translateX(3200px)");
                    }
                    setTimeout(function () {
                        slideshowImgSrc.src = tempImgSrc.src;
                        $('#viewerImage').attr("src", slideshowImgSrc.src);
                        $('#viewerImage').show();
                        $('#viewerImage').css("transform", "translateX(0)", slideShowSpeed);
                        setTimeout(function () {
                            $('.slideshowNavgArrows').css('visibility', 'visible').fadeIn();
                        }, 600);

                        if (islargeLoad)
                            $('#breadcrumbContainer').html(imageViewerFolderName + "/" + imageArray[imageViewerIndex].ImageFolderName).fadeIn();
                        else {
                            $('#breadcrumbContainer').html(imageArray[imageViewerIndex].ImageFolderName).fadeIn();
                            if (albumFolderId != imageArray[imageViewerIndex].ImageFolderId) {
                                $('#slideshowImageLabel').html(imageArray[imageViewerIndex].ImageFolderName).fadeIn();
                            }
                            //else {
                            //    if (isInRole("sert", "slide")) {
                            //        $.ajax({
                            //            type: "GET",
                            //            url: settingsArray.ApiServer + "api/Links/GetLinkCount?imageLinkId=" + imageArray[imageViewerIndex].LinkId,
                            //            success: function (linkCount) {
                            //                if (linkCount < 2)
                            //                    $('#copycatDiv').fadeIn();
                            //            },
                            //            error: function (jqXHR) {
                            //                $('#albumPageLoadingGif').hide();
                            //                let errMsg = getXHRErrorDetails(jqXHR);
                            //                if (!checkFor404(errMsg, folderId, "getSlideshowItems")) logError("XHR", folderId, errMsg, "getSlideshowItems");
                            //            }
                            //        });
                            //    }
                            //}
                        }
                        $('#headerMessage').html(imageViewerIndex + " / " + imageArray.length);
                    }, 400);
                }, 300);
                resizeSlideshow();
            };

            if (direction === 'next') {
                if (++imageViewerIndex >= imageArray.length)
                    imageViewerIndex = 0;
            }
            else {
                if (--imageViewerIndex < 0)
                    imageViewerIndex = imageArray.length - 1;
            }
            tempImgSrc.src = slideShowImgRepo + imageArray[imageViewerIndex].FileName;
            spSessionCount++;
            $('#footerMessage').html("image: " + imageViewerIndex + " of: " + imageArray.length);
            //$('#headerMessage').html(imageViewerIndex + " / " + imageArray.length);

            //    if (typeof logImageHit === 'function')
            //        logImageHit(imageArray[imageViewerIndex].LinkId, albumFolderId, false);
            //    else {
            //        logSSImageHit(imageArray[imageViewerIndex].LinkId, albumFolderId, false);
            //    }
        }
    } catch (e) {
        logCatch("slide", e);
    }
}

$(document).keydown(function (event) {
    if (slideShowButtonsActive) {
        switch (event.which) {
            case 27:                        // esc
                closeSlideShow("escape key");
                break;
            //case 38: scrollTabStrip('foward'); break;
            //case 33: scrollTabStrip('foward'); break;
            case 34:                        // pg down
            case 40:                        // dowm arrow
            case 37:                        // left arrow
                slideClick('prev');
                break;
            case 13:                        // enter
            case 38:                        // up arrow
            case 39:                        // right arrow
                event.preventDefault();
                window.event.returnValue = false;
                slideClick('next');
                break;
            //case 122:                       // F11
            //    $('#standardHeader').hide();
            //    break;
            //default:
            //  $('#expandoBannerText').html("event.which: " + event.which)
            //  alert("event.which: " + event.which)
        }
    }
});

function slideshowContextMenu() {
    runSlideShow("pause");
    pos.x = event.clientX;
    pos.y = event.clientY;
    showContextMenu("Slideshow", pos,
        slideShowImgRepo + imageViewerArray[imageViewerIndex].FileName,
        imageViewerArray[imageViewerIndex].LinkId,
        imageViewerArray[imageViewerIndex].FolderId,
        imageViewerArray[imageViewerIndex].FolderName);
}

function closeSlideShow() {
    //window.location.href = "/album.html?folder=" + albumFolderId;
    //displayFooter("slideshow");
    $('#slideshowContent').fadeOut();
    $('#galleryContentArea').fadeIn();
}

function resizeSlideshow() {

}