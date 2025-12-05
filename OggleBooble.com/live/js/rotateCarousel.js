const rotationSpeed = 6000, carouselDebugMode = false, maxArraySize = 1110, fadeInSpeed = 99, stopCarousel = false, chunkSize = 40;
const spinningGears = 'https://common.ogglebooble.com/img/ingranaggi3.gif';
const loadingCacheGears = 'https://common.ogglebooble.com/img/gearsCache.gif';

let carouselFooterHeight = 40, carouselPaused = false, avaliableToSwap = true, pageContext,
    image0 = {}, image1 = {}, imagesViewed = 0, currentCarousellndex = 0, rotateOk = true,
    carouselArray = [], imageHistory = [], vCarouselInterval = null,
    previousBadLink, mainImageClickId, knownModelLabelClickId, imageTopLabelClickId,
    footerLabelClickId, marginOffsetWidth = 0, arryItemsShownCount = 0;

function launchCarousel(paramContext) {
    try {
        pageContext = paramContext;
        loadFromCache(paramContext);
        arryItemsShownCount = 0;
        image0 = ele("image0");
        image1 = ele("image1");
        image0.src = image1.src = spinningGears;
        //image1.removeEventListener("contexMenu", showContextMenu);
        image1.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            carouselPause();
            mousePos.x = e.clientX;
            mousePos.y = e.clientY;
            showContextMenu('carousel', carouselArray[currentCarousellndex].FolderId, carouselArray[currentCarousellndex].LinkId, carouselArray[currentCarousellndex].FolderName);
        });
        image1.addEventListener("click", () => { clickViewAlbum(1) });
        resizeCarousel("launch carousel");
        seeIfCacheNeedsUpdating(pageContext);
        if (isNullorUndefined(sessionStorage.rowsShown)) sessionStorage.rowsShown = 0;
        document.addEventListener("resize", () => { resizeCarousel("resize") });

        if (carouselArray.length == 0) {
            setTimeout(() => { launchCarousel(paramContext) }, 4000);
        }
        else {
            currentCarousellndex = Math.floor(Math.random() * carouselArray.length);
            image0.src = settingsImgRepo + carouselArray[currentCarousellndex].ImageFileName;
            intervalBody();
            let carouselInterval = setInterval(() => {

                intervalBody();

                if (stopCarousel)
                    clearInterval(carouselInterval);

            }, rotationSpeed);
        }    
    }
    catch (e) {
        if (sessionStorage.VisitorId == adminVisitorId)
            alert("BUG launch carousel: " + e);
        logOggleError("BUG", e, "launch carousel");
    }
}

function intervalBody() {
    try {
        if (carouselPaused) {
            const carouselPauseButton = ele("carouselPauseButton");
            replaceHtml(carouselPauseButton, "|");
            setTimeout(function () { replaceHtml(carouselPauseButton, "|"); }, 700);
        }
        else {
            if (avaliableToSwap) {
                let nextIndex = Math.floor(Math.random() * carouselArray.length);
                //checkWithinLast100();
                imageHistory.forEach((item) => {
                    if (item === nextIndex) {
                        loadMoreImages(pageContext, chunkSize)
                        logOggleActivity("RMC", "image already shown: " + nextIndex + " in carousel array: " + carouselArray.length);
                        //intervalBody();
                        return;
                    }
                });
                image1.src = settingsImgRepo + carouselArray[currentCarousellndex].ImageFileName;
                currentCarousellndex = nextIndex;
                imageHistory.push(currentCarousellndex);
                image0.src = settingsImgRepo + carouselArray[currentCarousellndex].ImageFileName;
                image0.onerror = () => {
                    image0.src = spinningGears;
                    avaliableToSwap = true;
                    processCaroselImageFail(carouselArray[currentCarousellndex]);
                    return;
                };
                replaceHtml(ele("footerMessage1"), "image " + currentCarousellndex.toLocaleString() + " of " + carouselArray.length.toLocaleString());
                swapImages(image0, image1);
            }
            //    else {
            //        if (sessionStorage.VisitorId == adminVisitorId)
            //            alert("not avaliable to swap");
            //        logOggleError("BUG", "not avaliable to swap", "interval body");
            //    }
        }
    } catch (e) {
        if (sessionStorage.VisitorId == adminVisitorId)
            alert("carousel interval: " + e);
        logOggleError("CAT", e, "interval body");
    }
}

function swapImages(image0, image1) {
    try {
        avaliableToSwap = false;
        let labelsChanged = false;
        image1.style.opacity = 1;
        image0.style.opacity = 0;
        let imageFadeInterval = setInterval(function () {
            if (Number(image0.style.opacity) < 1.0) {
                image0.style.opacity = Number(image0.style.opacity) + 0.05;
                image1.style.opacity = Number(image1.style.opacity) - 0.05;
                if (!labelsChanged) {
                    if (Number(image0.style.opacity) > 0.45) {
                        setLabelLinks();
                        positionLabelLinks();
                        labelsChanged = true;
                        resizeCarousel("swap images");
                        replaceHtml(ele("footerMessage2"), "");
         }
                }
            }
            else {
                clearInterval(imageFadeInterval);
                imageFadeInterval = null;
                avaliableToSwap = true;
            }
        }, fadeInSpeed);
    } catch (e) {
        if (sessionStorage.VisitorId == adminVisitorId)
            alert("CAT Error \ncarousel swap images: " + e);
        logOggleError("CAT", e, "carousel swap images");
    }
}

function setLabelLinks() {
    try {
        const knownModelLabel = ele("knownModelLabel");
        const carouselFooterLabel = ele("carouselFooterLabel");
        const imageTopLabel = ele("imageTopLabel");

        let carouselItem = carouselArray[currentCarousellndex];
        if (carouselItem.FolderId == carouselItem.ImageFolderId) {
            switch (carouselItem.RealRoot) {
                case "centerfold":
                    if (carouselItem.FolderType == "singleChild") {
                        replaceHtml(imageTopLabel, "Playboy Playmate " + carouselItem.CenterfoldYear + ": " + carouselItem.FolderParentName);
                        imageTopLabelClickId = carouselItem.FolderParentId;
                    }
                    else {
                        replaceHtml(imageTopLabel, "Playboy Playmate " + carouselItem.CenterfoldYear + ": " + carouselItem.FolderName);
                        imageTopLabelClickId = carouselItem.FolderId;
                    }
                    break;
                case "Playboy adult star":
                case "cybergirl":
                case "cybergirls":
                case "international":
                case "magazine":
                case "muses":
                case "playboy":
                case "plus":
                    if (carouselItem.FolderType == "singleChild") {
                        replaceHtml(imageTopLabel, carouselItem.FolderParentName);
                        imageTopLabelClickId = carouselItem.FolderParentId;
                    }
                    else {
                        replaceHtml(imageTopLabel, carouselItem.FolderName);
                        replaceHtml(imageTopLabel, carouselItem.FolderParentName);
                        imageTopLabelClickId = carouselItem.FolderId;
                    }
                    break;
                default:
                    if (carouselItem.FolderType == "singleChild") {
                        replaceHtml(imageTopLabel, carouselItem.FolderParentName);
                        imageTopLabelClickId = carouselItem.FolderParentId;
                    }
                    else {
                        replaceHtml(imageTopLabel, carouselItem.FolderName);
                        //replaceHtml(imageTopLabel, carouselItem.FolderParentName);
                        imageTopLabelClickId = carouselItem.FolderId;
                    }
            }


            replaceHtml(knownModelLabel, carouselItem.FolderName);
            knownModelLabelClickId = carouselItem.FolderId;
            if (carouselItem.FolderType == "singleChild") {
                mainImageClickId = carouselItem.FolderParentId;
                replaceHtml(carouselFooterLabel, carouselItem.FolderGPName);
                footerLabelClickId = carouselItem.FolderGPId;
            }
            else {
                mainImageClickId = carouselItem.FolderId;
                replaceHtml(carouselFooterLabel, carouselItem.FolderParentName);
                footerLabelClickId = carouselItem.FolderParentId;
            }
        }
        else {
            // we have a link from archive
            if (carouselItem.FolderType == 'singleChild') {
                replaceHtml(imageTopLabel, "clink " + carouselItem.FolderParentName);

                replaceHtml(knownModelLabel, carouselItem.FolderName);
                replaceHtml(carouselFooterLabel, carouselItem.FolderGPName);
                mainImageClickId = carouselItem.FolderParentId;
                imageTopLabelClickId = carouselItem.FolderGPId;
                knownModelLabelClickId = carouselItem.ImageFolderId;
                footerLabelClickId = carouselItem.FolderGPId;
            }
            else {
                replaceHtml(imageTopLabel, carouselItem.FolderName);
                replaceHtml(knownModelLabel, carouselItem.ImageFolderName);
                replaceHtml(carouselFooterLabel, carouselItem.FolderParentName);
                knownModelLabelClickId = carouselItem.ImageFolderId;
                footerLabelClickId = carouselItem.FolderParentId;
                mainImageClickId = carouselItem.FolderId;
                imageTopLabelClickId = carouselItem.FolderId;
            }
        }

    } catch (e) {
        logOggleError("CAT", carouselArray[currentCarousellndex].FolderId, e, "set label links");
    }
}

function positionLabelLinks() {
    const imageContainer = ele("carouselImageDoubleContainer");
    const knownModelLabel = ele("knownModelLabel");
    const carouselFooterLabel = ele("carouselFooterLabel");
    const imageTopLabel = ele("imageTopLabel");

    let containerTop = imageContainer.offsetTop;
    //let containerLeft = (window.innerWidth * .23);
    let calcCenter = (window.innerWidth / 2) - (ele("image0").scrollWidth / 2);
    let containerLeft = calcCenter;

    containeroffsetHeight = imageContainer.offsetHeight;
    let containerHeight = ele("image0").clientHeight;

    // let containerBottom = containerHeight - carouselLabelHeight;
    //let containerBottom = containerTop + containerHeight - (knownModelLabel.clientHeight);
    let containerBottom = containerTop + containerHeight - (knownModelLabel.clientHeight * .75);

    imageTopLabel.style.top = containerTop + "px";
    imageTopLabel.style.left = containerLeft + "px";
    fade(imageTopLabel, "in");
    carouselFooterLabel.style.top = containerBottom + "px";
    carouselFooterLabel.style.left = containerLeft + "px";
    fade(carouselFooterLabel, "in");

    knownModelLabel.style.top = containerBottom + "px";
    //const image0 = ele("image0")
    containerWidth = ele("image0").clientWidth;
    knownModelLabel.style.left = (containerLeft + containerWidth - knownModelLabel.clientWidth) + "px";
    fade(knownModelLabel, "in");

    // imageTopLabel.style.top = (carouselContainer.style.top + "px");
    //knownModelLabel.clientTop = 0; // (carouselContainer.style.top + "px");
    //knownModelLabel.clientLeft = centeredImage0Left;
}

function assuranceArrowClick(direction) {
    if (direction === "foward") {
        carouselResume();
    }
    else {
        if (imageHistory.length > 1) {
            carouselPause();
            let imageHistoryIndex = imageHistory[imageHistory.length - 2];
            let popimage = settingsImgRepo + carouselArray[imageHistoryIndex].ImageFileName;
            image0.src = popimage;
            setLabelLinks(imageHistoryIndex);
        }
    }
}

function clickViewAlbum(labelClick) {
    let clickFolderId = 0;
    try {
        switch (labelClick) {
            case 1: clickFolderId = mainImageClickId; carouselButtonClicked = "main image"; break;// carousel main image
            case 2: clickFolderId = imageTopLabelClickId; carouselButtonClicked = "top Label"; break;// top imageTopLabel
            case 3: clickFolderId = knownModelLabelClickId; carouselButtonClicked = "knownModelLabel"; break;// knownModelLabel
            case 4: clickFolderId = footerLabelClickId; carouselButtonClicked = "footerLabel"; break;// footer 
        }
        carouselPause();
        if (arryItemsShownCount > 10)
            logOggleEvent("IIC", clickFolderId, "carousel items viewed: " + arryItemsShownCount); // carousel image clicked

        logOggleEvent("CIC", clickFolderId, "image: " + carouselArray[currentCarousellndex].ImageFileName); // carousel image clicked


        window.location.href = "album.html?folder=" + clickFolderId;  //  open page in same window
    } catch (e) {
        logOggleError("CAT", clickFolderId, e, "click view album");
    }
}

/*-------- CarouelSettingsDialog ----------------------------*/{
    function showCarouelSettingsDialog() {
        carouselPause();

        let jsCarouselSettings = {
            includeCenterfolds: false,
            includeArchive: true,
            includePoses: true,
            includePorn: false,
            includeSoftcore: false,
            includeLandscape: true,
            includePortrait: false
        }
        logOggleEvent("CSD", "carousel settings dialog opened");

        if (sessionStorage.VisitorId == adminVisitorId) {
            sendEmailTest();
        }


        else {
            const carouselSettingsDialog = ele("carouselSettingsDialog");
            carouselSettingsDialog.clientWidth = "300px";
            carouselSettingsDialog.clientTop = clientY - 75;;
            carouselSettingsDialog.clientLeft = clientX - 100;
            carouselSettingsDialog.draggable().fadeIn();

            const carouselCheckboxs = document.querySelectorAll('.carouselSettingCheckbox');
            carouselCheckboxs.forEach(carouselCheckbox => { carouselCheckbox.addEventListener('change', jsCarouselSettings(this)) });
        }
    }

    function clickCarouselSpeed(speed) {
        if (speed === "faster")
            rotationSpeed = Math.max(rotationSpeed - 800, 800);
        if (speed === 'slower')
            rotationSpeed += 800;
    }

    function toggleCarouselPause() {
        if (carouselPaused) {
            carouselResume();
            carouselPaused = false;
        }
        else {
            carouselPause();
            carouselPaused = true;
        }
    }

    function carouselPause() {
        replaceHtml(ele("carouselPauseButton"), ">");
        carouselPaused = true;
    }

    function carouselResume() {
        replaceHtml(ele("carouselPauseButton"), "||");
        carouselPaused = false;
    }
}

function processCaroselImageFail(carouselRow) {
    try {
        let imgFailObj = {};
        getDataFromServer("php/fetch.php?schema=oggleboo_Danni&query=select * from ImageFile where Id='" + carouselRow.LinkId + "'", imgFailObj);
        let imgFailIntrvl = setInterval(function () {
            if (ready(imgFailObj.data)) {
                clearInterval(imgFailIntrvl);
                if (imgFailObj.data.trim() != "false") {
                    logOggleActivity("SFE", carouselRow.LinkId); // says image exists  
                }
                else {
                    //if (sessionStorage.VisitorId == adminVisitorId)
                    //    alert("image not found: " + carouselRow.LinkId + " in carousel row: " + carouselRow.FolderId + " " + carouselRow.FolderName);
                    //else {
                    //    logOggleError("INF", carouselRow.FolderId + " " + carouselRow.FolderName, "imageId: " + carouselRow.LinkId + " not found", "carousel"); // image not found
                    //    logOggleActivity("NTG", "'" + carouselArrayItem.LinkId + "'");
                    //}
                    // remove from Carousel                     
                    let remObj = {};
                    getDataFromServer("php/fetch.php?schema=oggleboo_Danni&query=delete from Carousel where LinkId='" + carouselRow.LinkId + "'", remObj);
                    let remInterval = setInterval(() => {
                        if (ready(remObj.data)) {
                            clearInterval(remInterval);
                            if (remObj.data.trim() == "ok") {
                                logOggleActivity("RFC", currentFolderId, imageId);
                            }
                            else {
                                if (sessionStorage.VisitorId == adminVisitorId)
                                    alert("remove from carousel: " + remObj.data);
                                logOggleError("AJX", currentFolderId, remObj.data, "remove from carousel");
                            }
                        }
                    }, 23);
                }
            }
        }, 35);
    } catch (e) {
        logOggleError("CAT", e, "process carosel image fail");
    }
}

function resizeCarousel(calledFrom) {
    try {
        f2 = calledFrom;
        var carouselContainer = ele("carouselContainer");
        carouselContainer.style.height = ((window.innerHeight * .62) + "px");

        var imageContainer = ele("carouselImageDoubleContainer");
        imageContainer.style.height = ((window.innerHeight * .62) + "px");

        ele("image0").style.height = ele("image1").style.height = ((window.innerHeight * .62) + "px");

        // ele("image0").style.left = ele("image1").style.left = ((window.innerWidth * .23) + "px");
        let calcCenter = (window.innerWidth / 2) - (ele("image0").scrollWidth / 2);
        ele("image0").style.left = calcCenter + "px";
        ele("image1").style.left = calcCenter + "px";

        positionLabelLinks();

        // carouselControls
        const carouselControls = ele("carouselControls");
        var rect = imageContainer.getBoundingClientRect();
        carouselControls.style.top = (rect.bottom + "px");
        carouselControls.style.left = ele("image0").scrollLeft + "px";
        carouselControls.style.width = ((Math.max(ele("image0").scrollWidth, 350)) + "px");

    } catch (e) {
        logOggleError("CAT", e, "resize carousel");
    }
}
