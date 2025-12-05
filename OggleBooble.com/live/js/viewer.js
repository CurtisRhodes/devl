const startHeight = 35, startLeft = 3, explodeSpeed = 22, explodeIncrement = 22;
let viewerMaxH, viewerIndex;

function showImageViewer(initialImg, sortOrder) {

    viewerIndex = sortOrder;
    window.scrollTo(0, 0);
    searchActive = false;
    const imageViewerContainer = ele("imageViewerContainer");
    replaceHtml(imageViewerContainer, imageViewerHtml());

    ele("viewerImage").src = initialImg;
    viewerMaxH = (window.innerHeight * .94);

    ele("viewerImage").addEventListener("click", (event) => { window.open(ele("viewerImage").src, "_blank"); });
    ele("nextImageArrow").addEventListener("click", () => { ImageViewerMove('next'); });
    ele("backImageArrow").addEventListener("click", () => { ImageViewerMove('previous'); });
    ele("vailShell").style.display = "block";
    ele("vailShell").addEventListener("click", () => { closeImageViewer() });
    ele("viewerCloseButton").addEventListener("click", () => { closeImageViewer() });

    imageViewerContainer.style.top = "35px";
    imageViewerContainer.style.left = "35px";
    fade(imageViewerContainer, "in");
    imageViewerVisible = true;

    explodeImage();

    window.addEventListener("resize", () => { resizeImageViewer() });
}

function explodeImage() {
    var viewerL = startLeft;
    var viewerH = startHeight;
    const viewerImage = ele("viewerImage");
    const imageViewerContainer = ele("imageViewerContainer");

    var maxleft = ((window.innerWidth / 2) - (viewerImage.width / 2));
    //var actualW = viewerImage.width;

    let explodeInerval = setInterval(() => {
        viewerImage.height = viewerH;
        viewerImage.style.left = viewerL;

        if (viewerH < viewerMaxH) {
            viewerL += explodeIncrement;
            viewerH += explodeIncrement;
            viewerImage.height = viewerH;
            if (viewerL < maxleft)
                imageViewerContainer.style.left = viewerL + "px";
        }
        else {
            clearInterval(explodeInerval);
            imageViewerContainer.style.left = ((window.innerWidth / 2) - (viewerImage.width / 2)) + "px";
            //viewerImage.width
            showElement(ele("backImageArrow"));
            ele("nextImageArrow").style.left = viewerImage.offsetWidth + "px";
            showElement(ele("nextImageArrow"));
            window.scrollTo(0, 0);
        }
    }, explodeSpeed);
}

function ImageViewerMove(direction) {
    try {
        const imageViewerContainer = ele("imageViewerContainer");
        const viewerImage = ele("viewerImage");
        if (direction == "next") {
            viewerIndex++;
            if (viewerIndex >= albumImagesArray.length)
                viewerIndex = 0;
        }
        else {
            --viewerIndex;
            if (viewerIndex < 0)
                viewerIndex = albumImagesArray.length - 1;
        }
        viewerImage.src = albumImagesArray[viewerIndex];

        if (viewerImage.height > viewerMaxH)
            viewerImage.height = viewerMaxH;

        imageViewerContainer.style.left = ((window.innerWidth / 2) - (viewerImage.width / 2)) + "px";
        ele("nextImageArrow").style.left = imageViewerContainer.offsetWidth + "px";
        ele("backImageArrow").style.right = imageViewerContainer.style.left + "px";
        showElement(ele("backImageArrow"));
        showElement(ele("nextImageArrow"));
        window.scrollTo(0, 0);
    } catch (e) {
        logOggleError("CAT", e, "Image viewer move");
    }
}

function imageViewerSlideshow() {
    try {
        showElement(ele("imageMenu"));
        ele("imageMenu").addEventListener("blur", () => { hideElement(ele("imageMenu")) });
        //closeImageViewer();
        //let currentImagelinkId = imgSrc.substr(jpgName.lastIndexOf("_") + 1, 36);
        //showSlideshowViewer(currentFolderId, currentImagelinkId);
    } catch (e) {
        logOggleError("CAT", e, "show slideshow")
    }
}

function closeImageViewer() {
    const imageViewerContainer = ele("imageViewerContainer");
    fade(imageViewerContainer, "out");
    ele("vailShell").style.display = "none";
    imageViewerVisible = false;
}

function imageViewerHtml() {
    return `
        <img id='backImageArrow' class='singleImageBoxArrow singleImageBoxArrowLeft' title='previous image (you may use arrow keys)' alt='back' src='img/backfull.png' />
        <div id="divSlideshowButton"class="slideshowButton" onclick="showSlideshow()">
        <img title='more' class="moreButton" alt='move' style="height:45px;cursor:pointer" src='img/more.png' />
        <div id="imageMenu" class="displayHidden">
            <ul>
                <li>show slideshow</li>
                <li>explode</li>
            </ul>
        </div>
        </div>
        <img id='viewerImage' class='explodeCusor viewerImage' alt='viewer image'/>
        <img id='viewerCloseButton' class='floatingCloseButton'
            src="img/close.png" onclick="closeImageViewer()" title='close viewer' alt='close'/>
        <img id='nextImageArrow' class='singleImageBoxArrow' title='next image (you may use arrow keys)' alt='next' src='img/nextfull.png'/>`;
}

function resizeImageViewer() {
    const imageViewerContainer = ele("imageViewerContainer");
   viewerMaxH = (window.innerHeight * .87);
    imageViewerContainer.style.top = startHeight + "px";
    imageViewerContainer.style.left = ((window.innerWidth / 2) - (viewerImage.width / 2)) + "px";
    explodeImage();
}
