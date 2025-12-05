const startHeight = 15, startLeft = 3, imageBottomMargin = 20; explodeSpeed = 22, heightIncrement = 22;
let viewerH, viewerL, viewerMaxH;


function showImageViewer(initialImg, sortOrder) {
    currentAlbumItemIndex = sortOrder;

    let oggleViewer = ele('oggleViewer')
    if (!ready(oggleViewer)) {
        createOggleViewer();
    }

    viewerH = startHeight;
    viewerL = startLeft;
    oggleViewer.style.top = startHeight + "px";
    oggleViewer.style.height = startLeft + "px";
    oggleViewer.style.left = startLeft + "px";

    const viewerImage = ele("viewerImage");

    viewerImage.style.height = startHeight + "px";
    viewerImage.style.left = startLeft + "px";
    viewerMaxH = (screen.height - imageBottomMargin);

    // imageViewerContainer.addEventListener("click", (event) => { window.open(viewerImage.src, "_blank"); });
    // imageViewerContainer.addEventListener("click", (event) => { customExplode() });

    ele("nextImageArrow").addEventListener("click", () => { ImageViewerMove('next'); });
    ele("backImageArrow").addEventListener("click", () => { ImageViewerMove('previous'); });

    ele("vailShell").style.display = "block";
    ele("vailShell").addEventListener("click", () => { closeImageViewer() });
    ele("viewerCloseButton").addEventListener("click", () => { closeImageViewer() });

    imageViewerVisible = true;
    showElement(imageViewerContainer);

    viewerImage.src = initialImg;
    explodeImage();

    window.addEventListener("resize", resizeImageViewer());        
}

function createOggleViewer() {
    oggleViewer = document.createElement('div');
    replaceHtml(oggleViewer, `
        <div id="imageViewerContainer" class="explodingImageContainer">
            <img id='backImageArrow' class='singleImageBoxArrow singleImageBoxArrowLeft' title='previous image (you may use arrow keys)' alt='back' src='https://common.ogglebooble.com/img/backfull.png' />
            <div id="divSlideshowButton" class="slideshowButton" onclick="showSlideshow()">slideshow</div>
            <div id="divSlideshowButton"class="slideshowButton" onclick="showSlideshow()">
                <img title='more' class="moreButton" alt='move' style="height:45px;cursor:pointer" src='https://common.ogglebooble.com/img/more.png' />
                <div id="imageMenu" class="displayHidden">
                <ul>
                    <li>show slideshow</li>
                    <li>explode</li>
                    <li>copy</li>
                    <li>link</li>
                </ul>
            </div>
            <img id='oggleViewerImage' class='explodeCusor viewerImage' alt='viewer image'/>
            <img id='viewerCloseButton' class='floatingCloseButton'
                 src="https://common.ogglebooble.com/img/close.png" onclick="closeImageViewer()" title='close viewer' alt='close' />
            <img id='nextImageArrow' class='singleImageBoxArrow' title='next image (you may use arrow keys)' alt='next' src='https://common.ogglebooble.com/img/nextfull.png' />

            <div id="divSlideshowButton" class="slideshowButton" onclick="showSlideshow()">slideshow</div>
        </div>
    </div>`);
}


function explodeImage() {
    const oggleViewer = ele("oggleViewer");
    fade(ele(oggleViewer), "in");
    let explodeInerval = setInterval(() => { 
        if (viewerH < viewerMaxH) {
            viewerH += heightIncrement;
            oggleViewer.style.height = viewerH + "px";
            viewerImage.style.height = viewerH + "px";
            if (viewerL < ((window.innerWidth / 2) - (viewerImage.width / 2))) {
                viewerL += heightIncrement;
                imageViewerContainer.style.left = viewerL + "px";
                viewerImage.style.left = viewerL + "px";
            }
        }
        else {
            clearInterval(explodeInerval);
            oggleViewer.style.height = viewerMaxH + "px";
            oggleViewer.style.left = ((window.innerWidth / 2) - (viewerImage.width / 2)) + "px";
            showElement(ele("backImageArrow"));
            ele("nextImageArrow").style.left = oggleViewer.offsetWidth + "px";
            showElement(ele("nextImageArrow"));

        }
    }, explodeSpeed);
}

function closeImageViewer() {
    const oggleViewer = ele("oggleViewer");
    fade(oggleViewer, "out");
    ele("vailShell").style.display = "none";
    imageViewerVisible = false;
}

function ImageViewerMove(direction) {
    try {
        if (direction == "next") {
            currentAlbumItemIndex++;
            if (currentAlbumItemIndex >= albumImagesArray.length)
                currentAlbumItemIndex = 0;
        }
        else {
            --currentAlbumItemIndex;
            if (currentAlbumItemIndex < 0)
                currentAlbumItemIndex = albumImagesArray.length - 1;
        }
        viewerImage.src = albumImagesArray[currentAlbumItemIndex];
        imageViewerContainer.style.left = ((window.innerWidth / 2) - (viewerImage.width / 2)) + "px";
        ele("nextImageArrow").style.left = imageViewerContainer.offsetWidth + "px";
        imageViewerContainer.style.left = ((window.innerWidth / 2) - (viewerImage.width / 2)) + "px";
        ele("backImageArrow").style.right = imageViewerContainer.style.left + "px";

    } catch (e) {
        logOggleError("CAT", currentFolderId, e, "Image viewer move");
    }
}

function showSlideshow() {
    try {

        showElement(ele("imageMenu"));

        ele("imageMenu").addEventListener("blur", () => { hideElement(ele("imageMenu")) });

        //closeImageViewer();


        //let currentImagelinkId = imgSrc.substr(jpgName.lastIndexOf("_") + 1, 36);
        //showSlideshowViewer(currentFolderId, currentImagelinkId);
    } catch (e) {
        logOggleError("CAT", -874, e, "show slideshow")
    }
}

function customExplode() {


}

function resizeImageViewer() {
//    const imageViewerContainer = ele("imageViewerContainer");
//    if (imageViewerContainer.style.display == "block") {
//        window.scrollTo(0, 0);
//        centerLeft = window.innerWidth * .44;
//        imageBottomMargin = screen.height * 0.15;
//        viewerMaxH = screen.height - startHeight - imageBottomMargin;})
}
