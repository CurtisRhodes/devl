const slideShowImgRepo = 'https://ogglefiles.com/danni/';
const transitionSpeed = 250;

let slideShowSpeed = 5000,
    imageArray = [],
    imageViewerIndex = 0,
    albumFolderId = 0,
    spSessionCount = 0,
    slideshowImgSrc = new Image(),
    tempImgSrc = new Image(),
    slideShowButtonsActive = false,
    spSlideShowRunning,
    imageViewerIntervalTimer,
    imageViewerFolderName,
    slideShowAvailable;

function startSlideShow(folderId, startLink, largeLoad) {
    islargeLoad = largeLoad;
    albumFolderId = folderId;

    displayFooter("slideshow");
    showSlideshowHeader();

    $('#albumContentArea').fadeOut();
    $('#slideshowContent').show().fadeIn();

    slideShowButtonsActive = true;
    spSessionCount = 0;
    loadSlideshowItems(folderId, startLink);
}

function loadSlideshowItems(folderId, startLink) {
    try {
        let infoStart = Date.now();        
        $('#aboveImageContainerMessageArea').html('loading');
        let asyncFlag = false;
        if (islargeLoad) {
            $.ajax({
                url: "php/customQuery.php?query=Select * from CategoryFolder where Parent=" + folderId,
                success: function (data) {
                    let childFolders = JSON.parse(data);
                    $.each(childFolders, function (idx, childFolder) {
                        $.getJSON('php/customQuery.php?query=select * from VwLinks where FolderId=' + childFolder.Id + ' order by SortOrder',
                            function (data) {
                                $.each(data, function (idx, obj) {
                                    imageArray.push(obj);

                                if ((imageArray.length > 10) && (!asyncFlag)) {
                                    asyncFlag = true;
                                    imageViewerIndex = 0;
                                    slideShowAvailable = true;
                                    slide('next');
                                    if (isNullorUndefined(imageViewerIntervalTimer)) {
                                        imageViewerIntervalTimer = setInterval(function () {
                                            slide('next');
                                        }, slideShowSpeed);
                                    }
                                    $('#largeLoadButton').hide();
                                    $('#deepSlideshowButton').hide();
                                    }
                                });
                            });
                    });
                }
            });
        }
        else {
            $.ajax({
                url: 'php/customQuery.php?query=select * from VwLinks where FolderId=' + folderId,
                success: function (data) {
                    if (data.substring(20).indexOf("error") > 0) {
                        $('#blogListArea').html(data);
                    }
                    else {
                        imageArray = JSON.parse(data);
                        // initialExplode
                        imageViewerIndex = imageArray.findIndex(node => node.LinkId == startLink);
                        getFolderDetails();
                        slideShowAvailable = true;
                        spSlideShowRunning = true;

                        tempImgSrc.src = slideShowImgRepo + imageArray[imageViewerIndex].FileName;
                        slide('next');
                        imageViewerIntervalTimer = setInterval(function () {
                            slide('next');
                        }, slideShowSpeed);
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    alert("getAlbumPageInfo: " + errMsg);
                    //if (!checkFor404(errMsg, folderId, "chargeCredits")) logError("XHR", folderId, errMsg, "chargeCredits");
                }
            });
        }
        let delta = (Date.now() - infoStart) / 1000;
        console.log("getGalleyInfo took: " + delta.toFixed(3));
    } catch (e) {
        logCatch("getAlbumPageInfo", e);
    }
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
                $('#headerBottomRow').html("<span sytle='font-size:19px'>" + thisCatFolder.ParentName +
                    "/" + thisCatFolder.FolderName + "</span>");
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            alert("getAlbumPageInfo: " + errMsg);
            //if (!checkFor404(errMsg, folderId, "chargeCredits")) logError("XHR", folderId, errMsg, "chargeCredits");
        }
    });
}

function runSlideShow(action) {
    //console.log("run slideShow action: " + action + "  txtStartSlideShow: " + $('#txtStartSlideShow').html());
    //alert("run slideShow action: " + action + "  txtStartSlideShow: " + $('#txtStartSlideShow').html());
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
        if (slideShowAvailable) {
            slideShowAvailable = false;
            if (isNullorUndefined(imageArray[imageViewerIndex])) {
                imageViewerIndex = Math.floor(Math.random() * imageArray.length);
                //logOggleError("SLA", albumFolderId, "", "slideshow.slide");
            }
            else {
                $('#copycatDiv').hide();
                let showLoadingGif = true;
                setTimeout(function () {
                    if (showLoadingGif)
                        $('#slideshowLoadingGif').show()
                }, 500);
                tempImgSrc.onload = function () {
                    showLoadingGif = false;
                    slideshowImgSrc.onload = function () {
                        $('#slideshowLoadingGif').hide();
                        $('#thumbImageContextMenu').fadeOut();
                        $('.slideshowNavgArrows').css('visibility', 'hidden');
                        $('#slideshowImageLabel').fadeOut();

                        // SLIDE OUT OF VIEW
                        if (direction == 'next') {  // LEFT TO RIGHT OUT THE RIGHT SIDE
                            $('#slideshowImage').css("transform", "translateX(5000px)", transitionSpeed);
                        }
                        else { // 'prev'        
                            $('#slideshowImage').css("transform", "translateX(-5000Px)", transitionSpeed);
                        }
                        // SLIDE BVACK INTO VIEW
                        setTimeout(function () {
                            $('#slideshowImage').hide();
                            if (direction == 'next') {  // RIGHT TO LEFT SLIDE IN FROM THE LEFT SIDE
                                $('#slideshowImage').css("left", "translateX(-15000px)");
                                $('#slideshowImage').css("transform", "translateX(-15000px)");
                            }
                            else {
                                $('#slideshowImage').css("transform", "translateX(5000px)");
                            }
                            slideshowImgSrc.src = tempImgSrc.src;
                            $('#slideshowImage').attr("src", slideshowImgSrc.src);
                            if (direction == 'next')
                                $('#slideshowImage').css("left", "-5000px");
                            else
                                $('#slideshowImage').css("right", "5000px");

                            $('#slideshowImage').css("transform", "translateX(0)", slideShowSpeed);
                            $('.slideshowNavgArrows').css('visibility', 'visible').fadeIn();
                            slideShowAvailable = true;
                            resizeSlideshow();
                        }, 1400);

                        if (islargeLoad)
                            $('#headerBottomRow').html(imageViewerFolderName + "/" + imageArray[imageViewerIndex].ImageFolderName).fadeIn();
                        else {
                            $('#headerBottomRow').html(imageArray[imageViewerIndex].ImageFolderName).fadeIn();
                        }

                        if (albumFolderId != imageArray[imageViewerIndex].ImageFolderId) {
                            // we have a link
                            $('#slideshowImageLabel').html(imageArray[imageViewerIndex].ImageFolderName).fadeIn();
                        }
                        if (direction === 'next') {
                            if (++imageViewerIndex >= imageArray.length)
                                imageViewerIndex = 0;
                        }
                        else {
                            if (--imageViewerIndex < 0)
                                imageViewerIndex = imageArray.length - 1;
                        }
                        tempImgSrc.src = slideShowImgRepo + imageArray[imageViewerIndex].FileName;
                    };
                }
                spSessionCount++;
                $('#footerMessage').html("image: " + imageViewerIndex + " of: " + imageArray.length);
            }
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
    window.location.href = "album.html?folder=" + albumFolderId;
    //displayFooter("slideshow");
    $('#slideshowContent').fadeOut();
    $('#AlbumContentArea').fadeIn();
}


function txtSlideShowClick() {
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
            slide('next');
            imageViewerIntervalTimer = setInterval(function () {
                slide('next');
            }, slideShowSpeed);
            spSlideShowRunning = true;
        }
    }
}


function explodeImage() {

}

function showSlideshowHeader() {

    //$('#headerMessage').html("");
    //$('#breadcrumbContainer').html("");
    //$('#badgesContainer').html("");
    //$('#hdrBtmRowSec3').html("");
    $('#topRowRightContainer').html($('#breadcrumbContainer').html());
    displayHeader("slideshow");

    $('#headerBottomRow').html(`
        <div class='flexbox'>
            <div class='floatRight clickable' onclick='closeViewer("click");'>
                <img class='slideshowHeaderButton' title='you may use the {esc} key'
                    src='https://common.ogglefiles.com/img/close.png'/>
            </div>
            <div class='floatRight clickable' onclick='explodeImage();'>
                <img class='slideshowHeaderButton' title='explode image'
                    src='https://common.ogglefiles.com/img/close.png'/>
            </div>

            <div id='slideshowMessageArea' class='wideCententer'></div>

            <div class='slideshowSpeedControls class='floatRight'>
                <div class='clickable' onclick='runSlideShow("faster")'>
                    <img id='fasterSlideshow' title='faster' src='https://common.ogglefiles.com/imgspeedDialFaster.png'/>
                </div>
                <div id='txtSlideShow' class='clickable' style='padding-top:4px' onclick='txtSlideShowClick();'>start slideshow</div>
                <div class='clickable' onclick='runSlideShow("slower")'>
                    <img id='slowerSlideShow' title='slower' src='https://common.ogglefiles.com/img/speedDialSlower.png'/>
                </div>
            </div>
            <div class='floatLeft clickable'>
                <img id='imgGoHome' class='slideshowHeaderButton' title='home'
                    onclick='window.location.href="album.html?folder=`+ albumFolderId + `"'
                    src='https://common.ogglefiles.com/img/redballon.png'/>
            </div>
        </div >`
    );

    //$('#topRowRightContainer').html("");


        //"   <div id='viewerButtonsRow' class='imageViewerHeaderRow' > \n" +
        //    "       <div><</div>\n" +
        //    "       <div id='ssHeaderCount' class='ssHeaderCount'></div>\n" +
        //    "       <div><img id='imgComment' class='imgCommentButton' title='comment' onclick='showImageViewerCommentDialog()' src='/Images/comment.png'/></div>\n" +
        //    "       <div id='imageViewerHeaderTitle' class='imageViewerTitle'></div> \n" +
        //    "       \n" +
        //    "       \n" +
        //    "       <div class='floatRight clickable' onclick='blowupImage()'><img class='popoutBox' title='open image in a new window' src='/Images/expand02.png'/> </div>\n" +
    //    "       
        //    "   </div>\n" +




        //$('#badgesContainer').html("len1: " + len1 + " imageIndex: " + imageIndex + "  len2: " + len2 + "  new index: " + popimageIndex);
        //if (carouselDebugMode) $('#hdrBtmRowSec3').html("indx: " + indx);
        //alert("indx[" + imageHistory.length + "]: " + indx);

        //$('#thisCarouselImage').attr('src', popimage).load(function () {
        //    $('#carouselFooter').fadeIn();
        //    //$('#carouselImageContainer').fadeIn(intervalSpeed, function () { resizeCarousel(); });
        //    //$('#footerMessage').html("image " + imageIndex.toLocaleString() + " of " + carouselItemArray.length.toLocaleString());
        //    //alert("image " + imageIndex.toLocaleString() + " of " + carouselItemArray.length.toLocaleString());
        //});
        //alert("img1: " + img1 + "\npopimage: " + popimage);



}

function resizeSlideshow() {
    $('#slideshowImage').css("height", $('#visableArea').height());
}