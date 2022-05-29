const slideSpeed = 33, slideIncrement = 88;

let slideShowSpeed = 5000, imageArray = [], imageViewerIndex = 0, spSessionCount = 0, tempImgSrc = new Image(), folderId,
    isPaused = false, imageViewerIntervalTimer = null, slideshowFolderName, isSiding = false, largeLoad = false;

function showSlideshowViewer(ssfolderId, startLink, isLargeLoad) {
    slideshowVisible = true;
    folderId = ssfolderId;
    largeLoad = isLargeLoad;
    displayFooter("slideshow");
    showSlideshowHeader(folderId);
    //getFolderDetails(folderId);

    $('#albumContentArea').fadeOut();        
    $('#slideshowContent').show();
    $('#slideshowContent').show();
    $("#vailShell").hide();
    $('#slideshowContent').css('opacity', 1);
    spSessionCount = 0;
    loadSlideshowItems(folderId, startLink, isLargeLoad);
    resizeSlideshow();
}

function doSlideShowKdownEvents(event) {
    if (!isPaused) {
        switch (event.which) {
            case 27:                        // esc
                closeSlideshow();
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
        }
    }
}

function toggleSlideshow() {
    if (isNullorUndefined(imageViewerIntervalTimer)) {
        slide('next');
        $('#txtSlideshow').html("stop slideshow");
        imageViewerIntervalTimer = setInterval(function () {
            slide('next');
        }, slideShowSpeed);
    }
    else {
        clearInterval(imageViewerIntervalTimer);
        imageViewerIntervalTimer = null;
        $('#txtSlideshow').html("start slideshow");
    }
}

function loadSlideshowItems(folderId, startLink, isLargeLoad) {
    try {
        $('.slideshowNavgArrows').css('visibility', 'hidden');
        let infoStart = Date.now();
        $('#albumPageLoadingGif').show();
        $('#slideshowMessageArea').html('loading');
        let sql = "select * from VwLinks where FolderId=" + folderId;
        if (isLargeLoad) {
            sql = `select * from VwLinks where FolderId = ` + folderId + ` union
                   select * from VwLinks where Parent = ` + folderId + ` union
                   select * from VwLinks where gParent = ` + folderId +` order by LinkId`;
        }
        $.ajax({
            url: "php/yagdrasselFetchAll.php?query=" + sql,
            success: function (data) {
                imageArray = JSON.parse(data);
                if (imageArray.length > 0) {
                    $('#albumPageLoadingGif').hide();
                    getFolderDetails(folderId);
                    imageViewerIndex = imageArray.findIndex(node => node.LinkId === startLink);

                    if (imageViewerIndex < 0) imageViewerIndex = 0;
                    while (imageArray[imageViewerIndex].FileName.endsWith("mpg")
                        || imageArray[imageViewerIndex].FileName.endsWith("mp4")) {
                        imageViewerIndex++;
                    }

                    tempImgSrc.src = settingsImgRepo + imageArray[imageViewerIndex].FileName;
                    tempImgSrc.onload = function () {
                        $('#slideshowImage').attr("src", tempImgSrc.src);
                        let imageWidth = $('#slideshowImageContainer').outerWidth();
                        $('#slideshowImageContainer').css('left', 0 - imageWidth / 2);
                        $('#albumPageLoadingGif').hide();
                    };

                    let delta = (Date.now() - infoStart) / 1000;
                    console.log("getGalleyInfo took: " + delta.toFixed(3));
                    toggleSlideshow();
                    $('#albumPageLoadingGif').hide();
                }
                else {
                    $('#albumPageLoadingGif').hide();
                    displayStatusMessage("warning", "no images found");
                    logOggleError("AJX", folderId, "no images found", "load slideshow items");
                }
            },
            error: function (jqXHR) {
                $('#albumPageLoadingGif').hide();
                logOggleError("XHR", folderId, getXHRErrorDetails(jqXHR), "load slideshow items");
            }
        });
    } catch (e) {
        $('#albumPageLoadingGif').hide();
        logOggleError("CAT", folderId, e, "load slideshow items");
    }
}

function getFolderDetails(folderId) {
    try {

        $.ajax({
            url: 'php/yagdrasselFetch.php?query=select f.*, p.FolderName ParentFolderName from CategoryFolder f join CategoryFolder p on f.Parent = p.Id where f.Id=' + folderId,
            success: function (data) {
                if (data == false) {
                    logOggleError("AJX", folderId, "folder not found?", "get folder details");
                }
                else {
                    let thisCatFolder = JSON.parse(data);
                    if (largeLoad) {
                        $('#slideshowMessageArea').html("<span sytle='font-size:19px'>loading</span>");
                        slideshowFolderName = thisCatFolder.FolderName;
                    }
                    else {
                        slideshowFolderName = thisCatFolder.ParentFolderName + "/" + thisCatFolder.FolderName;
                        $('#slideshowMessageArea').html("<span sytle='font-size:19px'>" + slideshowFolderName + "</span>");
                    }
                    $('#leftClickArea').on("click", function () {
                        if (isNullorUndefined(imageViewerIntervalTimer))
                            slide("prev", folderId);
                        else
                            toggleSlideshow();
                    });
                    //$('#topRowMiddleContainer').html("<div class='activeBreadCrumb' " + "onclick='closeSlideshow()'>" + slideshowFolderName + "</div>");

                    $('#rightClickArea').on("click", function () { slide("next", folderId) });
                    $('.hiddenClickArea').on("dblclick", function () { toggleSlideshow(); });
                    $('.hiddenClickArea').on("contextmenu", function () { slideshowContextMenu() });
                }
            },
            error: function (jqXHR) {
                logOggleError("XHR", folderId, getXHRErrorDetails(jqXHR), "get folder details");
            }
        });
    } catch (e) {
        logOggleError("CAT", folderId, e, "get folder details");
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
    if (slideShowSpeed <= 0) {
        if (!isNullorUndefined(imageViewerIntervalTimer))
            toggleSlideshow();
    }
}

let imagePos, slideshowImageZeroPos, slidingDone;
function slide(direction) {
    if (isPaused) return;
    try {
        if (!isSiding) {
            isSiding = true;
            let showLoadingGif = true;
            setTimeout(function () {
                if (showLoadingGif)
                    $('#slideshowLoadingGif').show()
            }, 250);
            incrementIndex(direction);
            tempImgSrc.src = settingsImgRepo + imageArray[imageViewerIndex].FileName;
            tempImgSrc.onload = function () {
                showLoadingGif = false;
                $('#slideshowLoadingGif').hide();
                $('#thumbImageContextMenu').fadeOut();
                $('.slideshowNavgArrows').css('visibility', 'hidden');
                $('#slideshowImageLabel').fadeOut();
                let centeringOffset = $('#leftClickArea').width();
                let imageWidth = $('#slideshowImageContainer').outerWidth();

                let slideshowImageDestinationPos = 0;
                if (direction == 'next') {
                    slideshowImageDestinationPos = centeringOffset + imageWidth;
                }
                else {  //  direction == 'prev'
                    slideshowImageDestinationPos = 0 - centeringOffset - imageWidth;
                } 
                imagePos = 0 - imageWidth / 2;
                // tbv
                $('#slideshowImageContainer').css('left', 0 - imageWidth / 2);
                slidingDone = false;
                ////////////////////////////////////////////////////////////
                slideOutofView(direction, slideshowImageDestinationPos);
                ////////////////////////////////////////////////////////////
                let jsWhile1 = setInterval(function () { //while (sliding) {
                    if (slidingDone) {
                        clearInterval(jsWhile1);

                        $('#slideshowImage').attr("src", tempImgSrc.src);

                        $('#slideshowImage').css("height", $('#visableArea').height());
                        imageWidth = $('#slideshowImageContainer').width();
                        //let centeringOffset = $('#leftClickArea').width();

                        if (direction == 'next') {
                            imagePos = -10 - centeringOffset - imageWidth;
                            $('#slideshowImageContainer').css("left", imagePos);
                        }
                        else {
                            imagePos = 10 + centeringOffset + imageWidth;
                            $('#slideshowImageContainer').css('left', imagePos);
                        }
                        slideshowImageZeroPos = 0 - imageWidth / 2;

                        slidingDone = false;
                        ////////////////////////////////////////////////////////////
                        slideBackIntoView(direction);
                        ////////////////////////////////////////////////////////////

                        let jsWhile2 = setInterval(function () {
                            if (slidingDone) {
                                clearInterval(jsWhile2);
                                $("#blinker").html("");
                                slidingDone = true;

                                resizeSlideshow();
                                $('.slideshowNavgArrows').css('visibility', 'visible').fadeIn();

                                //if (imageArray[imageViewerIndex].FolderId != imageArray[imageViewerIndex].SrcId) {
                                //    // we have a link
                                //    $('#slideshowImageLabel').html(imageArray[imageViewerIndex].SrdFolder).fadeIn()
                                //        .on("click", window.location.href = 'album.html?folderId="+imageArray[imageViewerIndex].SrcId,"_blank"');
                                //}
                                if (largeLoad)
                                    $('#slideshowMessageArea').html(slideshowFolderName + "/" + imageArray[imageViewerIndex].SrcFolder).fadeIn();

                                spSessionCount++;
                                $('#sldeshowNofN').html((imageViewerIndex + 1) + " / " + Number(imageArray.length).toLocaleString());
                                $('#txtSlideshow').focus();
                                $('#footerMessage').html("image: " + imageViewerIndex + " of: " + imageArray.length);
                                isSiding = false;
                            }
                        }, 450);
                    }
                }, 450);
            }
        }
    } catch (e) {
        logOggleError("CAT", imageArray[imageViewerIndex].FolderId, e, "slide");
    }
}

function slideOutofView(direction, slideshowImageDestinationPos) {

    if (direction == 'next') {
        if (imagePos < slideshowImageDestinationPos) {
            setTimeout(function () {
                imagePos += slideIncrement;
                $('#slideshowImageContainer').css("left", imagePos);
                slideOutofView(direction, slideshowImageDestinationPos);
            }, slideSpeed);
        }
        else
            slidingDone = true;
    }
    else {
        if (imagePos > slideshowImageDestinationPos) {
            setTimeout(function () {
                imagePos -= slideIncrement;
                $('#slideshowImageContainer').css("left", imagePos);
                slideOutofView(direction, slideshowImageDestinationPos);
            }, slideSpeed);
        }
        else
            slidingDone = true;
    }
}

function slideBackIntoView(direction) {
    if (direction == 'next') {
        if (imagePos <= slideshowImageZeroPos) {
            setTimeout(function () {
                imagePos += slideIncrement;
                $('#slideshowImageContainer').css("left", imagePos);
                slideBackIntoView(direction);
            }, slideSpeed);
        }
        else {
            $('#slideshowImageContainer').css('left', slideshowImageZeroPos);
            slidingDone = true;
        }
    }
    else {
        if (imagePos + slideIncrement >= slideshowImageZeroPos) {
            setTimeout(function () {
                imagePos -= slideIncrement;
                $('#slideshowImageContainer').css("left", imagePos);
                slideBackIntoView(direction);
            }, slideSpeed);
        }
        else {
            $('#slideshowImageContainer').css('left', slideshowImageZeroPos);
            slidingDone = true;
        }
    }
}

function incrementIndex(direction) {
    if (direction == 'next') {
        if (++imageViewerIndex >= imageArray.length)
            imageViewerIndex = 0;
    }
    else {
        if (--imageViewerIndex < 0)
            imageViewerIndex = imageArray.length - 1;
    }
    while (imageArray[imageViewerIndex].FileName.endsWith("mpg")
        || imageArray[imageViewerIndex].FileName.endsWith("mp4")) {
        incrementIndex(direction)
    }
}

function slideshowContextMenu() {
    isPaused = true;
    pos = {};
    pos.x = event.clientX;
    pos.y = event.clientY;
    oggleContextMenu("slideshow", pos,
        settingsImgRepo + imageArray[imageViewerIndex].FileName,
        imageArray[imageViewerIndex].LinkId,
        imageArray[imageViewerIndex].FolderId,
        imageArray[imageViewerIndex].FolderName);
}

function resumeSlideshow() {
    toggleSlideshow();
}

function closeSlideshow() {
    $('#slideshowContent').fadeOut();
    $('#albumContentArea').fadeIn();
    loadAlbumPage(folderId, false, "self");
    //displayHeader("oggleIndex");
    displayFooter("oggleAlbum");
    slideshowVisible = false;
}

function showSlideshowHeader() {

    displayHeader("slideshow");

    //let tempd = document.createElement('div');
    //tempd.innerHTML = $('#breadcrumbContainer').html();

    $('#headerBottomRow').html(`
      <div class="fullWidthFlexContainer">
        <div id='sldeshowNofN' class='sldeshowHeaderTextContainer'></div>
        <div id='slideshowMessageArea' class='inline wideCententer' onclick='closeSlideshow()'></div>
        <div class='flexContainer'>
            <div class='inline clickable' onclick='adjustSlideshowSpeed("faster")'>
                <img id='fasterSlideshow' class='slideshowHeaderButton' title='faster'
                        src='https://common.ogglebooble.com/img/speedDialFaster.png'/>
            </div>
            <div id='txtSlideshow' class='sldeshowHeaderTextContainer clickable'
                title='double click toggles slideshow' onclick='toggleSlideshow()'>start slideshow</div>
            <div class='clickable' onclick='adjustSlideshowSpeed("slower")'>
                <img id='slowerSlideshow' class='slideshowHeaderButton' title='slower'
                        src='https://common.ogglebooble.com/img/speedDialSlower.png'/>
            </div>
        </div>
        <div class='slideshowHeaderButtonContainer'>
            <img id='btnExplodeImage' class='slideshowHeaderButton' title='explode image' onclick='explodeCarouselImage()'
                src='https://common.ogglebooble.com/img/expand02.png'/>
        </div>
        <div class='slideshowHeaderButtonContainer' onclick='closeSlideshow()'>
            <img class='slideshowHeaderButton' title='you may use the {esc} key'
                    src='https://common.ogglebooble.com/img/close.png' />
        </div>
      </div>`
    );
}

function explodeCarouselImage() {
    window.open(settingsImgRepo + imageArray[imageViewerIndex].FileName);
}

function resizeSlideshow() {
    $('#rightClickArea').css('left', $(window).width() / 2);
    $('#slideshowImage').css("height", $('#visableArea').height());
    $('.slideshowNavgArrows img').height($(window).height() - 30);
    $(window).scrollTop(0);
}