const slideShowImgRepo = 'https://ogglefiles.com/danni/';
const transitionSpeed = 250;

let slideShowSpeed = 5000,
    imageArray = [],
    imageViewerIndex = 0,
    albumFolderId = 0,
    spSessionCount = 0,
    tempImgSrc = new Image(),
    slideShowButtonsActive = false,
    imageViewerIntervalTimer,
    slideshowParentName,
    slideShowAvailable = true;

function showSlideshowViewer(folderId, startLink, isLargeLoad) {
    albumFolderId = folderId;

    displayFooter("slideshow");
    showSlideshowHeader();
    getFolderDetails();

    $('#albumContentArea').fadeOut();
    $('#slideshowContent').show().fadeIn();

    slideShowButtonsActive = true;
    spSessionCount = 0;
    loadSlideshowItems(folderId, startLink, isLargeLoad);
    resizeSlideshow();
}

function loadSlideshowItems(folderId, startLink, isLargeLoad) {
    try {
        let infoStart = Date.now();
        $('#slideshowMessageArea').html('loading');
        if (isLargeLoad) {
            $.ajax({
                url: "php/customFetchAll.php?query=select f.Id, p.FolderName from CategoryFolder f " +
                    "join CategoryFolder p on f.Parent = p.Id where f.Parent=" + folderId,
                success: function (data) {
                    let childFolders = JSON.parse(data);
                    slideshowParentName = childFolders[0].FolderName;
                    $.each(childFolders, function (idx, childFolder) {
                        $.getJSON('php/customFetchAll.php?query=select * from VwLinks where FolderId=' +
                            childFolder.Id + ' order by SortOrder', function (data) {
                            $.each(data, function (idx, obj) {
                                imageArray.push(obj);

                                if (imageArray.length > 10) {
                                    $('#slideshowImage').attr("src", imageArray[0].FileName);
                                    $('#slideshowMessageArea').html(imageArray[imageViewerIndex].SrcFolder);
                                }
                            });
                            $('#sldeshowNofN').html(imageViewerIndex + " / " + imageArray.length);
                        });
                    });
                }
            });
        }
        else { 
            $.ajax({
                url: 'php/customFetchAll.php?query=select * from VwLinks where FolderId=' + folderId,
                success: function (data) {
                    if (data.substring(20).indexOf("error") > 0) {
                        $('#blogListArea').html(data);
                    }
                    else {
                        imageArray = JSON.parse(data);
                        imageViewerIndex = imageArray.findIndex(node => node.LinkId == startLink);
                        $('#slideshowImage').attr("src", slideShowImgRepo + imageArray[imageViewerIndex].FileName);
                        $('#slideshowMessageArea').html(imageArray[imageViewerIndex].SrcFolder);
                        $('#sldeshowNofN').html(imageViewerIndex + " / " + imageArray.length);
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
        logCatch("load slideshow items", e);
    }
}

function getFolderDetails() {
    $.ajax({
        url: 'php/customFetchAll.php?query=select f.FolderName, p.FolderName as ParentName ' +
            ' from CategoryFolder f join CategoryFolder p on f.Parent = p.Id where f.Id=' + albumFolderId,
        success: function (data) {
            if (data.substring(20).indexOf("error") > 0) {
                alert(data);
            }
            else {
                let thisCatFolder = JSON.parse(data)[0];
                $('#slideshowMessageArea').html("<span sytle='font-size:19px'>" + thisCatFolder.ParentName +
                    "/" + thisCatFolder.FolderName + "</span>");
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            alert("get folder details: " + errMsg);
            //if (!checkFor404(errMsg, folderId, "chargeCredits")) logError("XHR", folderId, errMsg, "chargeCredits");
        }
    });
}

function runSlideShow(action) {
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

let imagePos, slideshowImageZeroPos, slideDirection, laps = 0;
let imageWidth, windowWidth;
const slideSpeed = 50, slideIncrement = 22;

function slide(direction) {
    try {
        if (slideShowAvailable) {
            slideShowAvailable = false;
            let showLoadingGif = true;
            setTimeout(function () {
                if (showLoadingGif)
                    $('#slideshowLoadingGif').show()
            }, 250);

            // increment/decrement imageViewerIndex
            if (direction == 'next') {
                if (++imageViewerIndex >= imageArray.length)
                    imageViewerIndex = 0;
                slideDirection = 'to the right';
            }
            else {
                if (--imageViewerIndex == 0)
                    imageViewerIndex = imageArray.length;
                slideDirection = 'to the left';
            }

            imageWidth = slideshowImageZeroPos = $('#slideshowImage').width();
            windowWidth = $(window).width();





            if (direction == 'next') {

                slideDirection = 'from the left';
                imagePos = 7000;
            }


            imagePos = slideshowImageZeroPos = $('#slideshowImage').css("left");
            tempImgSrc.src = slideShowImgRepo + imageArray[imageViewerIndex].FileName;
            tempImgSrc.onload = function () {
                showLoadingGif = false;
                $('#slideshowLoadingGif').hide();
                $('#thumbImageContextMenu').fadeOut();
                $('.slideshowNavgArrows').css('visibility', 'hidden');
                $('#slideshowImageLabel').fadeOut();

                slideOutofView(direction);

                $('#slideshowImage').attr("src", tempImgSrc.src);

                setTimeout(function () { // SLIDE BACK INTO VIEW
                    if (direction == 'next') {
                        $('#slideshowImage').css("left", windowWidth + imageWidth + 100);
                        slideDirection = 'from the right';
                    }
                    else { // 'prev' move image far to the right
                        $('#slideshowImage').css("left", -(imageWidth + 100));
                        slideDirection = 'from the left';
                    }
                    slideBackIntoView();
                    

                    $('.slideshowNavgArrows').css('visibility', 'visible').fadeIn();
                    slideShowAvailable = true;
                    resizeSlideshow();

                    if (albumFolderId != imageArray[imageViewerIndex].ImageFolderId) {
                        // we have a link
                        $('#slideshowImageLabel').html(imageArray[imageViewerIndex].ImageFolderName).fadeIn();
                    }

                    //      $('#slideshowMessageArea').html(slideshowParentName + "/" + imageArray[imageViewerIndex].ImageFolderName).fadeIn();
                    //  else
                    $('#slideshowMessageArea').html(imageArray[imageViewerIndex].ImageFolderName).fadeIn();

                    spSessionCount++;
                    $('#sldeshowNofN').html(imageViewerIndex + " / " + imageArray.length);

                    $('#footerMessage').html("image: " + imageViewerIndex + " of: " + imageArray.length);
                }, 450);
            };
        }
    } catch (e) {
        logCatch("slide", e);
    }
}

function slideOutofView() {
    if (slideDirection == 'to the right') {
        if (imagePos < (imageWidth + windowWidth + 100)) {
            setTimeout(function () {
                imagePos += slideIncrement;
                $("#singleImageOuterContainer").css("left", imagePos);
                slideOutofView();
            }, slideSpeed);
        }
    }
    else {
        if (imagePos > -(imageWidth + 100)) {
            setTimeout(function () {
                imagePos -= slideIncrement;
                $("#singleImageOuterContainer").css("left", imagePos);
                slideOutofView();
            }, slideSpeed);
        }
    }
}

function slideBackIntoView() {
    if (slideDirection == 'from the left') {
        if (imagePos < slideshowImageZeroPos) {
            setTimeout(function () {
                imagePos += slideIncrement;
                $("#singleImageOuterContainer").css("left", imagePos);
                slideOutofView();
            }, slideSpeed);
        }
    }
    else {
        if (imagePos > slideshowImageZeroPos) {
            setTimeout(function () {
                imagePos -= slideIncrement;
                $("#singleImageOuterContainer").css("left", imagePos);
                slideOutofView();
            }, slideSpeed);
        }
    }
}


$(document).keydown(function (event) {
    if (slideShowButtonsActive) {
        switch (event.which) {
            case 27:                        // esc
                closeSlideShow();
                break;
            //case 38: scrollTabStrip('foward'); break;
            //case 33: scrollTabStrip('foward'); break;
            case 34:                        // pg down
            case 40:                        // dowm arrow
            case 37:                        // left arrow
                slide('prev');
                break;
            case 13:                        // enter
            case 38:                        // up arrow
            case 39:                        // right arrow
                event.preventDefault();
                window.event.returnValue = false;
                slide('next');
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

$('#rightClickArea').dblclick(function () {
    startSlideShow();
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
    //window.location.href = "album.html?folder=" + albumFolderId;
    //displayFooter("slideshow");
    $('#slideshowContent').fadeOut();
    $('#albumContentArea').fadeIn();

    displayHeader("oggleIndex");
    displayFooter("oggleAlbum");

}

function txtSlideShowClick() {
    if ($('#txtStartSlideShow').html() == "start slideshow") {
        startSlideShow();
        $('#txtStartSlideShow').html("stop slideshow");
    }
    else {
        clearInterval(imageViewerIntervalTimer);
        $('#txtStartSlideShow').html("start slideshow");
    }
}

function startSlideShow() {
    if (imageViewerIntervalTimer == null) {
        imageViewerIntervalTimer = setInterval(function () {
            slide('next');
        }, slideShowSpeed);
    }

    //FolderId	    int(11) 	    NO
    //Parent	    int(11)	        NO
    //SrcId	        int(11)	        NO		0
    //RootFolder	varchar(20)	    NO
    //LinkId	    varchar(36)	    NO
    //FileName	    varchar(501)	YES
    //SrcFolder	    varchar(150)	NO
    //Orientation	varchar(1)	    NO
    //IsLink    	int(1)	        NO		0
    //SortOrder	    int(11)	        NO
    //Poster    	varchar(600)	YES

}

function explodeImage() {

}

function showSlideshowHeader() {

    //$('#headerMessage').html("");
    //$('#breadcrumbContainer').html("");
    //$('#badgesContainer').html("");
    //$('#hdrBtmRowSec3').html("");

    let tempd = document.createElement('div');
    tempd.innerHTML = $('#breadcrumbContainer').html();

    displayHeader("slideshow");
    $('#topRowRightContainer').html(tempd.innerHTML);

    $('#headerBottomRow').html(`
      <div class="fullWidthFlexContainer">
        <div id='sldeshowNofN' class='sldeshowHeaderTextContainer'></div>

        <div class='slideshowHeaderButtonContainer' onclick='explodeImage();'>
            <img class='slideshowHeaderButton' title='explode image'
                src='https://common.ogglefiles.com/img/expand02.png'/>
        </div>

        <div id='slideshowMessageArea' class='inline wideCententer'></div>

        <div class='flexContainer'>
            <div class='inline clickable' onclick='adjustSlideshowSpeed("faster")'>
                <img id='fasterSlideshow' class='slideshowHeaderButton' title='faster'
                        src='https://common.ogglefiles.com/img/speedDialFaster.png'/>
            </div>

            <div id='txtSlideShow' class='sldeshowHeaderTextContainer clickable' onclick='txtSlideShowClick()'>
                start slideshow
            </div>

            <div class='clickable' onclick='adjustSlideshowSpeed("slower")'>
                <img id='slowerSlideShow' class='slideshowHeaderButton' title='slower'
                        src='https://common.ogglefiles.com/img/speedDialSlower.png'/>
            </div>
        </div>
        <div class='inline floatRight clickable' onclick='closeSlideShow();'>
            <img class='slideshowHeaderButton' title='you may use the {esc} key'
                    src='https://common.ogglefiles.com/img/close.png' />
        </div>
      </div>`
    );
}

function resizeSlideshow() {
    $('#slideshowImage').css("height", $('#visableArea').height());

    //$('#viewerImage').css('left', ($(window).width() - $('#viewerImage').width()) / 2);
    //$('#leftClickArea').css('left', 0);
    $('#rightClickArea').css('left', $(window).width() / 2);
    //$('#viewerImage').height($(window).height() - 30);
    $('.slideshowNavgArrows img').height($(window).height() - 30);
    //$('#slideShowContainer').css('width', "100%");
    $(window).scrollTop(0);


}