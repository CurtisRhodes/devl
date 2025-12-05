const slideSpeed = 66, slideIncrement = 77, viewWait = 1800;
let slideshowImageIndex = 0, spSessionCount = 0,
    isSliding = false, imageArray = [], cancelSlideshowInterval = false,
    slideDirection = "next", autoSlideRunning = false;

function showSlideshowViewer() {
    try {
        spSessionCount = 0;
        slideshowVisible = true;

        if (ready(albumInfo)) {
            //replaceHtml(ele("slideshowmessageArea"), 'loading');

            loadSlideshowItems();

        }
        else {
            displayStatusMessage("warning", "album info not ready");
        }


        // fade(ele("slideshowContentArea"), "in");

        //hideElement(ele("hdrTopMenu"));
        //hideElement(ele("albumTopRow"));
        //hideElement(ele("albumPageFooter"));
        //hideElement(ele("breadcrumbContainer"));
        //hideElement(ele("folderUpButton"));
        //hideElement(ele("backButton"));
        //hideElement(ele("nextButton"));        
        //hideElement(ele("albumBottomContainer"));

        replaceHtml(ele("hdrMiddleSection"), slideshowHeaderHTML())
        ele("imageContainer").style.minHeight = screen.height + "px"; // set min height to screen height

        //    < div id = "albumContentArea" class="unfloatable" >
        // document.addEventListener('cl', handleSearchKeyPress);
        // document.addEventListener('keydown', handleSlideshowKeyPress);

        window.addEventListener("resize", () => {
            // if (sessionStorage.VisitorId == adminVisitorId) {}
            resizeSlideshow();
        });
        resizeSlideshow();
    }
    catch (e) {
        loadingGif("hide");
        logOggleError("CAT", e, "load Slideshow Viewer");
    }
}

function slideShowDblclick() {
    toggleSlideshow();
    // if (sessionStorage.VisitorId == adminVisitorId) {
    //     ele("headerTopRowCol1").innerHTML = "dblclick slideshow";
}

function slideshowHeaderHTML() {    
    return `
        <div class="slideshowHeader">
            <div Id="slideshowmessageArea" style="padding:3px;"></div>
            <div class="slideshowHeaderNavgRow">
                <img id='fasterSlideshow' class='slideshowHeaderButton' title='faster'
                    onclick="adjustSlideshowSpeed('faster')" src='img/speedDialFaster.png'/>
                <span id='txtAutoSlide' class='sldeshowHeaderTextContainer clickable' title='double click toggles slideshow'
                    onclick='toggleSlideshow()'>pause slideshow</span>
                <img id='slowerSlideshow' class='slideshowHeaderButton' title='slower'
                    onclick="adjustSlideshowSpeed('slower')" src='img/speedDialSlower.png'/>
                <img id='btnExplodeImage' class='slideshowHeaderButton' title='explode image'
                    onclick='explodeSlideShowImage()' src='img/expand02.png'/>
                <img id='btnCloseSlideshow' class='slideshowHeaderButton' title='you may use the {esc} key'
                    onclick='closeSlideshow()' src='img/close.png'/>
            </div>
        </div>`;
}

function slideshowBodyHTML() {
    let html = `
    <div Id="slideShowContainer" class="slideShowOuterContainer" onclick='handleSlideshowClick("slideShowContainer")'>
        <div id='slidingImageContainer' class='slidingContainer'>
            <img id='leftNavgArrow' class='slideshowNavgArrow' tabindex='-1' onclick='handleSlideshowClick("leftNavgArrow")'
                src='img/leftArrowOpaque02.png' title='previous image'/>

                <img id='slideshowImage' onclick='handleSlideshowClick("mainImage")'/>

                <img id='rightNavgArrow' class='slideshowNavgArrow' tabindex='-1' onclick='handleSlideshowClick("rightNavgArrow")'
                src='img/rightArrowOpaque02.png' title='next image'/>
        </div>
    </div>`
    return html;
}

function handleSlideshowClick(elementName) {
    switch (elementName) {
        case "slideShowContainer":
            // if (sessionStorage.VisitorId == adminVisitorId) { }
            break;
        case "leftNavgArrow":
            if (autoSlideRunning) {
                slideDirection = "prev";
                interruptSlide();
            }
            else {
                incrementIndex();
                slide;
            }
            break;
        case "rightNavgArrow":
            if (autoSlideRunning) {
                slideDirection = "next";
                interruptSlide();
            }
            else {
                incrementIndex();
                slide;
            }
            break;
        case "mainImage":
            toggleSlideshow();
            break;
    }
}

function handleSlideshowKeyPress(elementId) {
    switch (elementId) {
        case 27: // Esc
            closeSlideshow();
            break;
        case 37: // left arrow
            if (autoSlideRunning) {
                slideDirection = "prev";
                interruptSlide();
            }
            else {
                incrementIndex();
                slide();
            }
            break;
        case 39: // right arrow
            if (autoSlideRunning) {
                slideDirection = "next";
                interruptSlide();
            }
            else {
                incrementIndex();
                slide();
            }
            break;
        case 32: // space bar
            toggleSlideshow();
            break;
        default: {
            if (sessionStorage.VisitorId == adminVisitorId) {
                ele("slideshowmessageArea").innerHTML = "clicked: " + elementId;
            }
        }
    }
}

function toggleSlideshow() {
    if (autoSlideRunning) {
        autoSlideRunning = false;
        replaceHtml(ele("txtAutoSlide"), "run slideshow");
    }
    else {
        replaceHtml(ele("txtAutoSlide"), "pause slideshow");
        autoSlideRunning = true;
    }
}

function interruptSlide() {
    incrementIndex();
    if (!autoSlideRunning) {
        slide();
    }
}

function adjustSlideshowSpeed(action) {
    if (action === "faster") {
        slideShowSpeed -= 1000;
    }
    if (action === "slower") {
        slideShowSpeed += 1000;
    }
    if (slideShowSpeed >= 11000) {
        slideShowSpeed = 1000;
    }
    if (slideShowSpeed <= 1000) {
        slideShowSpeed = 1000;
    }
    if (sessionStorage.visititorId == adminVisitorId) {
        ele("headerTopRowCol1").innerHTML = "slideShowSpeed: " + slideShowSpeed;
    }

}

function runSlideshow() { // runslideshowInterval = setInterval(() => { slide(); }, 633);
    try {
        let slideshowInterval = setInterval(() => {
            if (cancelSlideshowInterval) {
                clearInterval(slideshowInterval);
            }
            else {
                if (autoSlideRunning) {
                    if (!isSliding) {
                        slide();
                    }
                }
            }
        }, 500);
    } catch (e) {
        logOggleError("CAT", imageArray[slideshowImageIndex].FolderId, e, "slide");
    }
}

function loadSlideshowItems() {
    try {
        loadingGif("show");
        let sql = "select * from vwSlideshow where FolderId=" + currentFolderId + " order by SortOrder";
        let slideshowFolderName = albumInfo.FolderName;
        if ((albumInfo.FolderType == "singleParent")
            || (albumInfo.FolderType == "multiFolder")
            || (albumInfo.FolderType == "multiChild")) {
            sql = "select * from vwSlideshow where Parent=" + currentFolderId + " order by SortOrder";
            slideshowFolderName = albumInfo.ParentName;
            logOggleEvent("SBC", "show slideshow viewer"); // entering slideshow
        }
        if (albumInfo.FolderType == "multiParent") {
            sql = "select * from vwSlideshow where gp=" + currentFolderId + " order by SortOrder";
            logOggleEvent("DSC", "show slideshow viewer"); // entering deep slideshow
        }
        let slideShowResults = {};

        getDataFromServer("php/fetchAll.php?schema=oggleboo_Danni&query=" + sql, slideShowResults);
        let dataIncr = setInterval(function () {
            if (ready(slideShowResults.data))
            {
                clearInterval(dataIncr);
                replaceHtml(ele("slideshowmessageArea"), "<span sytle='font-size:19px'>" + slideshowFolderName + "</span>");
                imageArray = JSON.parse(slideShowResults.data);
                loadingGif("hide");

                if (imageArray.length > 0) {
                    
                    ele("divSiteLogo").style.height = "44px";
                    const slideshowContentArea = ele("slideshowContentArea");
                    replaceHtml(slideshowContentArea, slideshowBodyHTML());

                    showElement(slideshowContentArea);
                    hideElement(ele("albumContentArea"));

                    slideshowContentArea.addEventListener("dblclick", () => {
                        slideShowDblclick();
                    });

                    autoSlideRunning = true;
                    runSlideshow();
                }
                else {
                    displayStatusMessage("warning", "no images found");
                    // logOggleError("AJX", currentFolderId, "no images found", "load slideshow items");
                }
            }
        }, 200);
    } catch (e) {
        loadingGif("hide");
        alert
        logOggleError("CAT", e, "load slideshow items");
    }
}

function slide() {
    if (!isSliding) {
        const slideshowImage = ele("slideshowImage");
        if (isNullorUndefined(slideshowImage)) {
            return;
        }
        isSliding = true;
        const slidingImageContainer = ele("slidingImageContainer");

        slideshowImage.style.height = (window.innerHeight * .87) + "px";
        slideshowImage.src = settingsImgRepo + imageArray[slideshowImageIndex].src;
        slidingImageContainer.style.left = (0 - slideshowImage.width) + "px";

        let imageLeft = (0 - slideshowImage.width - ele("rightNavgArrow").clientWidth);
        let tryCenter = window.innerWidth * .45; // center
        // slide in from the left
        let slideinFromLeftInterval = setInterval(() => {
            imageLeft += slideIncrement;
            slidingImageContainer.style.left = imageLeft + "px";
            tryCenter = (window.innerWidth - slidingImageContainer.clientWidth) * .5;
            if (slidingImageContainer.offsetLeft >= tryCenter) {
                clearInterval(slideinFromLeftInterval);
                slidingImageContainer.style.left = tryCenter + "px"; //centered
                setTimeout(() => { // view wait
                    // now slide out
                    if (autoSlideRunning) {
                        let slideOutofViewInterval = setInterval(() => {
                            imageLeft += slideIncrement;
                            slidingImageContainer.style.left = imageLeft + "px";
                            if (slidingImageContainer.offsetLeft >= window.innerWidth) {
                                clearInterval(slideOutofViewInterval);
                                incrementIndex();
                                isSliding = false;
                            }
                        }, slideSpeed);
                    }
                    else
                        isSliding = false;
                }, viewWait);
            }
        }, slideSpeed);
    }
}

function slideInFromLeft() { }
function slideInFromRight() { }
function slideOutToLeft() { }
function slideOutToRight() { }

function incrementIndex() {
    if (slideDirection == 'next') {
        if (++slideshowImageIndex >= imageArray.length)
            slideshowImageIndex = 0;
    }
    else { // slideDirection == 'prev'
        if (--slideshowImageIndex < 0)
            slideshowImageIndex = imageArray.length - 1;
    }
    while (imageArray[slideshowImageIndex].src.endsWith("mpg")
        || imageArray[slideshowImageIndex].src.endsWith("mp4")) {
        incrementIndex()
    }
}

function slideshowImageContextMenu() {
    if (sessionStorage.VisitorId == adminVisitorId) {
        alert("slideshowImageContextMenu");
    }
}

function closeSlideshow() {
    fade(ele("slideshowContentArea"), "out");
    cancelSlideshowInterval = true;
    slideshowVisible = false;
    location.href = "album.html?folder=" + currentFolderId;
}

function explodeCarouselImage() {
    window.open(settingsImgRepo + imageArray[slideshowImageIndex].FileName);
}

function resizeSlideshow() {
    try {
        ele("slideShowContainer").style.minHeight = screen.height + "px";
        //ele("slideShowContainer").maxWidth = (window.innerWidth * .87);
        ele("slideshowImage").style.height = (window.innerHeight * .87) + "px";
    //    var navgArrows = document.getElementsByClassName('slideshowNavgArrow');
    //    for (var i = 0; i < navgArrows.length; i++) {
    //        navgArrows[i].style.height = slideshowImage.height + "px";
    //    };844.590.0797
    } catch (e) {
        logOggleError("CAT", e, "resize slideshow");
    }
}
