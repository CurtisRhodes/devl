const rotationSpeed = 6000, carouselDebugMode = false, maxArraySize = 1110, fadeInSpeed = 99, chunkSize = 40, quickStartSize = 15, maxcacheSize = 145;
const spinningGears = 'https://common.ogglebooble.com/img/ingranaggi3.gif';
const loadingCacheGears = 'https://common.ogglebooble.com/img/gearsCache.gif';

let carouselFooterHeight = 40, carouselPaused = false, avaliableToSwap = true, pageContext,
    image0 = {}, image1 = {}, imagesViewed = 0, currentCarousellndex = 0, rotateOk = true,
    carouselArray = [], imageHistory = [],
    loadingMoreImages = false, 
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
        if (isNullorUndefined(sessionStorage.rowsShown)) sessionStorage.rowsShown = 0;
        document.addEventListener("resize", () => { resizeCarousel("resize") });
        if (ready(sessionStorage["carouselHistory" + pageContext])) {
            imageHistory = JSON.parse(sessionStorage["carouselHistory" + pageContext]);
        }

        if (carouselArray.length > 0) {
            currentCarousellndex = Math.floor(Math.random() * carouselArray.length);
            if (currentCarousellndex >= carouselArray.length) {
                currentCarousellndex = 0; 
            }
            image0.src = settingsImgRepo + carouselArray[currentCarousellndex].ImageFileName;
        }

        if (carouselArray.length < maxcacheSize) {
            if (!loadingMoreImages) {
                loadingMoreImages = true;
                loadMoreImages(pageContext, chunkSize);
            }
        }

        showElement(ele("carouselControls"));

        intervalBody();
        setInterval(() => {
            intervalBody();
        }, rotationSpeed);
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
                image1.src = settingsImgRepo + carouselArray[currentCarousellndex].ImageFileName;
                currentCarousellndex = Math.floor(Math.random() * carouselArray.length);
                //----------  checkWithinLast100 ---------------------
                imageHistory.forEach((item) => {
                        if (item === carouselArray[currentCarousellndex].LinkId) {
                            carouselArray.splice(currentCarousellndex, 1);
                            logOggleActivity("RMC", "image already shown: " + currentCarousellndex + " in carousel array: " + carouselArray.length);
                            if (!loadingMoreImages) {
                                loadingMoreImages = true;
                                loadMoreImages(pageContext, chunkSize);
                            }
                            image0.src = spinningGears;
                            return;
                        }
                    });
            
                if (isNullorUndefined(carouselArray[currentCarousellndex])) {
                    image0.src = spinningGears;
                    return;
                }
                imageHistory.push(carouselArray[currentCarousellndex].LinkId); // add current image to history
                while (imageHistory.length > 100) {
                    imageHistory.shift(); // remove oldest image from history
                }
                sessionStorage["carouselHistory" + pageContext] = JSON.stringify(imageHistory);
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

/*-------- Carousel settings dialog ----------------------------*/

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

/*-------- carouel cache ----------------------------*/

function loadFromCache(pageContext) {
    try {
        carouselPaused = true;
        if (isNullorUndefined(pageContext)) {
            logOggleError("BUG", "page context undefined", "load from carousel cache");
            buildCacheFromScratch(pageContext);
        }
        else {
            let contextArray = localStorage["carouselCache" + pageContext];
            if (isNullorUndefined(contextArray)) {
                // logOggleError("BUG", "local storage carouselCache" + pageContext + " undefined", "load from carousel cache");
                buildCacheFromScratch(pageContext);
            }
            else {
                carouselArray = JSON.parse(contextArray);
                if (Array.isArray(carouselArray)) {
                    seeIfCacheNeedsUpdating(pageContext);
                    carouselPaused = false;
                }
                else {
                    logOggleError("BUG", "local storage carouselCache" + pageContext + " not an array", "load from carousel cache");
                    loadingMoreImages = true;
                    buildCacheFromScratch(pageContext);
                }
            }
        }
    }
    catch (e) {
        loadMoreImages(pageContext, 50);
        logOggleError("CAT", e, "load from cache");
    }
}

function buildCacheFromScratch(pageContext) {
    try {
        let limit = maxcacheSize;
        if (carouselArray.length == 0)
            limit = quickStartSize;

        let sql = "select * from Carousel where PageContext = '" + pageContext + "' and (Width > Height) order by rand() limit " + limit;
        let cacheObj = {};
        getDataFromServer("php/fetchAll.php?schema=oggleboo_Danni&query=" + sql, cacheObj);
        let omgIntrvl = setInterval(() => {
            if (ready(cacheObj.data)) {
                clearInterval(omgIntrvl);
                //localStorage["carouselCache" + pageContext] = JSON.stringify(cacheObj.data);
                localStorage["carouselCache" + pageContext] = cacheObj.data;
                loadingMoreImages = false;
                if (carouselArray.length < quickStartSize) {
                    carouselArray = JSON.parse(cacheObj.data);
                    localStorage["carouselCache" + pageContext] = JSON.stringify(carouselArray);

                    //test
                    loadFromCache(pageContext);
                }

                replaceHtml(ele("footerMessage2"), "cache rebuilt");
                logOggleActivity("RC0", "pageContext: " + pageContext);
            }
        }, 23);
    } catch (e) {
        logOggleError("CAT", e, "build cache from scratch");
    }
}

function loadMoreImages(pageContext, chunkSize) {
    try {
        let startTime = Date.now();
        //let offset = Math.min(Math.floor(Math.random() * (carouselArray.length - chunkSize)), carouselArray.length - chunkSize);
        let rowsAdded = 0;
        let getmoreObj = {};
        let sql = "select * from Carousel where PageContext = '" + pageContext + "' and (Width > Height) order by rand() limit " + chunkSize;
        getDataFromServer("php/fetchAll.php?schema=oggleboo_Danni&query=" + sql, getmoreObj);
        let loadMoreIntrvl = setInterval(() => {
            if (ready(getmoreObj.data)) {
                clearInterval(loadMoreIntrvl);
                let newRows = JSON.parse(getmoreObj.data);
                let alreadyIn = false;
                for (var i = 0; i < newRows.length; i++) {
                    newRow = newRows[i];
                    alreadyIn = false;
                    for (let ii = 0; ii < carouselArray.length; ii++) {
                        if (carouselArray[ii].LinkId == newRow.LinkId) {
                            alreadyIn = true;
                            break;
                        }
                    };
                    if (!alreadyIn) {
                        rowsAdded++;
                        carouselArray.push(newRows[i]);
                    }
                };

                // rebuild cache
                if (carouselArray.length > maxcacheSize) {
                    buildCacheFromScratch(pageContext);
                }
                else {
                    localStorage["carouselCache" + pageContext] = JSON.stringify(carouselArray);
                }
                replaceHtml(ele("footerMessage2"), "added " + rowsAdded + " images");
                let delta = (Date.now() - startTime) / 1000;
                console.log("loading images took: " + delta.toFixed(3));
                loadingMoreImages = false;
            };
        }, 23);
    } catch (e) {
        logOggleError("CAT", e, "load carousel images catch");
    }
}

function seeIfCacheNeedsUpdating(pageContext) {
    try {
        if (!isNullorUndefined(localStorage["lastCarouselCacheRefresh" + pageContext])) {
            localStorage["lastCarouselCacheRefresh" + pageContext] = todayString();
        }
        else {
            let lastCacheRefreshDate = localStorage["lastCarouselCacheRefresh" + pageContext];
            const d2 = new Date(lastCacheRefreshDate);
            let d2T = d2.getTime();
            const d1 = new Date();
            let d1T = d1.getTime();
            let difference_In_Time = (d1T - d2T) / (1000 * 3600 * 24);
            if (difference_In_Time > 1.1) {
                localStorage["lastCarouselCacheRefresh" + pageContext] = todayString();
                buildCacheFromScratch(pageContext)
                console.log("refreshed " + pageContext + " cache");
            }
        }
    } catch (e) {
        logOggleError("CAT", e, "see if cache needs updating");
    }
}

/*-------- Carousel dupe check ----------------------------*/

function processCaroselImageFail(carouselRow) {
    try {
        let updtCarouselObj = {};
        getDataFromServer("php/updateCarousel.php?parentId=" + carouselRow.FolderParentId, updtCarouselObj)
        let updtCarouselIntrvl = setInterval(() => {
            if (ready(updtCarouselObj.data)) {
                clearInterval(updtCarouselIntrvl);
                if (updtCarouselObj.data.trim() == "ok") {
                    logOggleActivity("RFC", currentFolderId, imageId); // Carousel updated
                }
                else {
                    if (sessionStorage.VisitorId == adminVisitorId)
                        alert("remove from carousel: " + updtCarouselObj.data);
                    logOggleError("AJX", currentFolderId, updtCarouselObj.data, "remove from carousel");
                }
            }
        }, 23);
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
        carouselControls.style.top = (rect.bottom + 10) + "px";
        carouselControls.style.left = calcCenter + "px";
        carouselControls.style.width = ((Math.max(ele("image0").scrollWidth, 350)) + "px");

    } catch (e) {
        logOggleError("CAT", e, "resize carousel");
    }
}

