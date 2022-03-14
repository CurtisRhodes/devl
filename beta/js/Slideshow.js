const slideShowImgRepo = 'https://ogglefiles.com/danni/';
const slideSpeed = 33, slideIncrement = 88;

let slideShowSpeed = 5000,
    imageArray = [],
    imageViewerIndex = 0,
    spSessionCount = 0,
    tempImgSrc = new Image(),
    isPaused = false,
    imageViewerIntervalTimer,
    slideshowParentName,
    isSiding = false;



function showSlideshowViewer(folderId, startLink, isLargeLoad) {

    displayFooter("slideshow");
    //displayFooter("slideshow");
    //displayFooter("slideshow");
    //displayFooter("slideshow");
    //displayFooter("slideshow");
    showSlideshowHeader();
    getFolderDetails(folderId);

    $('#albumContentArea').fadeOut();        
    $('#slideshowContent').show();
    spSessionCount = 0;
    loadSlideshowItems(folderId, startLink, isLargeLoad);
    resizeSlideshow();
}

function toggleSlideshow() {
    if (imageViewerIntervalTimer == null) {
        slide('next');
        $('#txtSlideshow').html("stop slideshow");
        imageViewerIntervalTimer = setInterval(function () {
            slide('next');
        }, slideShowSpeed);
    }
    else {
        clearInterval(imageViewerIntervalTimer);
        $('#txtSlideshow').html("start slideshow");
    }
}

function loadSlideshowItems(folderId, startLink, isLargeLoad) {
    try {
        let infoStart = Date.now();
        $('#albumPageLoadingGif').show();
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

                                    if (imageArray.length == 10) {
                                        $('#slideshowImage').attr("src", imageArray[0].FileName);
                                        $('#slideshowMessageArea').html(imageArray[imageViewerIndex].SrcFolder);
                                        $('#sldeshowNofN').html((imageViewerIndex + 1) + " / " + imageArray.length);

                                        $('#slideshowImageContainer').css('left', ($('#slideshowImageContainer').outerWidth() / 2) - ($('#leftClickArea').width() / 2));
                                    }
                                });
                                $('#sldeshowNofN').html((imageViewerIndex + 1) + " / " + imageArray.length);
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
                        if (imageArray.length > 0) {
                            imageViewerIndex = imageArray.findIndex(node => node.LinkId == startLink);
                            if (imageViewerIndex < 0)
                                imageViewerIndex = 0;
                            $('#slideshowMessageArea').html(imageArray[imageViewerIndex].SrcFolder);
                            $('#sldeshowNofN').html((imageViewerIndex + 1) + " / " + imageArray.length);

                            let ttSrc = slideShowImgRepo + imageArray[imageViewerIndex].FileName;
                            tempImgSrc.src = ttSrc;
                            tempImgSrc.onload = function () {
                                // the magic center
                                $('#slideshowImage').attr("src", tempImgSrc.src);
                                let imageWidth = $('#slideshowImageContainer').outerWidth();
                                $('#slideshowImageContainer').css('left', 0 - imageWidth / 2);
                                $('#albumPageLoadingGif').hide();
                            };
                        }
                        else {
                            alert("no images found");
                        }
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

function getFolderDetails(folderId) {
    $.ajax({
        url: 'php/customFetch.php?query=select f.FolderName, p.FolderName as ParentName ' +
            ' from CategoryFolder f join CategoryFolder p on f.Parent = p.Id where f.Id=' + folderId,
        success: function (data) {
            if (data.substring(20).indexOf("error") > 0) {
                alert(data);
            }
            else {
                let thisCatFolder = JSON.parse(data);

                $('#slideshowMessageArea').html("<span sytle='font-size:19px'>" + thisCatFolder.ParentName +
                    "/" + thisCatFolder.FolderName + "</span>");

                $('#leftClickArea').on("click", function () {
                    if (imageViewerIntervalTimer != null) {
                        clearInterval(imageViewerIntervalTimer);
                        $('#txtSlideshow').html("start slideshow");
                    }
                    else
                        slide("prev", folderId);
                });
                $('#rightClickArea').on("click", function () { slide("next", folderId) });
                $('.hiddenClickArea').on("dblclick", function () {
                    toggleSlideshow();
                });
                $('.hiddenClickArea').on("contextmenu", function () { slideshowContextMenu() });

                // $('#btnExplodeImage').on('click', showMaxSizeViewer(slideShowImgRepo + imageArray[imageViewerIndex].FileName, 'slideshow'));
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            alert("get folder details: " + errMsg);
            //if (!checkFor404(errMsg, folderId, "chargeCredits")) logError("XHR", folderId, errMsg, "chargeCredits");
        }
    });
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
    //$('#slowerSlideshow').attr("Title", "slideshow " + 10 - (slideShowSpeed / 1000) + "x");

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
            tempImgSrc.src = slideShowImgRepo + imageArray[imageViewerIndex].FileName;
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

                                if (imageArray[imageViewerIndex].FolderId != imageArray[imageViewerIndex].SrcId) {
                                    // we have a link
                                    $('#slideshowImageLabel').html(imageArray[imageViewerIndex].SrdFolder).fadeIn()
                                        .on("click", window.location.href = 'album.html?folderId="+imageArray[imageViewerIndex].SrcId,"_blank"');
                                }
                                if (isNullorUndefined(slideshowParentName))
                                    $('#slideshowMessageArea').html(imageArray[imageViewerIndex].ImageFolderName).fadeIn();
                                else
                                    $('#slideshowMessageArea').html(slideshowParentName + "/" + imageArray[imageViewerIndex].ImageFolderName).fadeIn();

                                spSessionCount++;
                                $('#sldeshowNofN').html((imageViewerIndex + 1) + " / " + imageArray.length);
                                $('#footerMessage').html("image: " + imageViewerIndex + " of: " + imageArray.length);
                                isSiding = false;
                            }
                        }, 450);
                    }
                }, 450);
            }
        }
    } catch (e) {
        logCatch("slide", e);
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
}

$(document).keydown(function (event) {
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
});

function slideshowContextMenu() {
    isPaused = true;
    pos = {};
    pos.x = event.clientX;
    pos.y = event.clientY;
    showContextMenu("slideshow", pos,
        slideShowImgRepo + imageViewerArray[imageViewerIndex].FileName,
        imageViewerArray[imageViewerIndex].LinkId,
        imageViewerArray[imageViewerIndex].FolderId,
        imageViewerArray[imageViewerIndex].FolderName);
}

function resumeSlideshow() {
    $('#txtStartSlideshow').html("stop slideshow");
    slide('next');
    imageViewerIntervalTimer = setInterval(function () {
        slide('next');
    }, slideShowSpeed);
}

function closeSlideshow() {
    $('#slideshowContent').fadeOut();
    $('#albumContentArea').fadeIn();
    displayHeader("oggleIndex");
    displayFooter("oggleAlbum");
}

function showSlideshowHeader() {
    let tempd = document.createElement('div');
    tempd.innerHTML = $('#breadcrumbContainer').html();

    displayHeader("slideshow");
    $('#topRowRightContainer').html(tempd.innerHTML);

    $('#headerBottomRow').html(`
      <div class="fullWidthFlexContainer">
        <div id='sldeshowNofN' class='sldeshowHeaderTextContainer'></div>
        <div id='slideshowMessageArea' class='inline wideCententer'></div>
        <div class='flexContainer'>
            <div class='inline clickable' onclick='adjustSlideshowSpeed("faster")'>
                <img id='fasterSlideshow' class='slideshowHeaderButton' title='faster'
                        src='https://common.ogglefiles.com/img/speedDialFaster.png'/>
            </div>
            <div id='txtSlideshow' class='sldeshowHeaderTextContainer clickable' onclick='toggleSlideshow()'>start slideshow</div>
            <div class='clickable' onclick='adjustSlideshowSpeed("slower")'>
                <img id='slowerSlideshow' class='slideshowHeaderButton' title='slower'
                        src='https://common.ogglefiles.com/img/speedDialSlower.png'/>
            </div>
        </div>
        <div id='btnExplodeImage' class='slideshowHeaderButtonContainer'>
            <img class='slideshowHeaderButton' title='explode image'
                src='https://common.ogglefiles.com/img/expand02.png'/>
        </div>
        <div class='slideshowHeaderButtonContainer' onclick='closeSlideshow();'>
            <img class='slideshowHeaderButton' title='you may use the {esc} key'
                    src='https://common.ogglefiles.com/img/close.png' />
        </div>
      </div>`
    );
}

function resizeSlideshow() {
    $('#rightClickArea').css('left', $(window).width() / 2);
    $('#slideshowImage').css("height", $('#visableArea').height());
    $('.slideshowNavgArrows img').height($(window).height() - 30);
    $(window).scrollTop(0);
}