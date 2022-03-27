﻿const rotationSpeed = 7000, carouselDebugMode = false;
let carouselFooterHeight = 40, intervalReady = true, initialImageLoad = false, isPaused = false,
    imageIndex = 0, carouselRows = [], imageHistory = [], absolueStartTime,
    vCarouselInterval = null, lastImageIndex = 0, lastErrorThrown = 0,
    mainImageClickId, knownModelLabelClickId, imageTopLabelClickId, footerLabelClickId,
    jsCarouselSettings, arryItemsShownCount = 0, totalArryItemsShownCount = 0,
    cacheSize = 45, carouselRoot;

function launchCarousel(pageContext) {
    try {
        carouselRoot = pageContext;
        if (pageContext == "oggleIndex")
            carouselRoot = "boobs";
        if (pageContext == "playboy")
            carouselRoot = "centerfold";

        absolueStartTime = Date.now();
        window.addEventListener("resize", resizeCarousel);

        $('#carouselContainer').html(carouselHtml());
        loadFromCache();
        resizeCarousel();
        $(window).resize(function () {
            resizeCarousel();
        });
    } catch (e) {
        logOggleError("BUG", -355, e, "launch carousel");
    }
}

function loadFromCache() {
    try {
        let cacheArray = [];
        if (isNullorUndefined(window.localStorage)) {
            loadImages(false);
            console.warn("window.localStorage undefined");
            return;
        }
        if (isNullorUndefined(window.localStorage[carouselRoot])) {
            loadImages(true);
            displayStatusMessage("error", "no " + carouselRoot + " cache found. Please wait...");
            console.log("no " + carouselRoot + " cache found");
            return;
        }
        cacheArray = JSON.parse(window.localStorage[carouselRoot]);
        if (isNullorUndefined(cacheArray)) {
            loadImages(true);
            console.log("cache may be corrupt");
            return;
        }
        carouselRows = cacheArray;
        startCarousel("cache");
        console.log("loaded " + carouselRows.length + " from " + carouselRoot + " cache");
    }
    catch (e) {
        logOggleError("BUG", -355, e, "load from cache");
    }
}

function startCarousel(calledFrom) {
    try {
        if (!initialImageLoad) {
            loadImages(false);
        }
        if (vCarouselInterval) {
            logOggleError("BUG", 618510, "carousel interval already started. Called from: " + calledFrom, "start carousel");
        }
        else {
            if (carouselRows.length > 10) {
                $('#footerMessage1').html("started carousel from: " + calledFrom);
                $('#carouselImageInnerContainer').show();
                intervalReady = true;

                setLabelLinks(imageIndex);
                intervalBody();
                vCarouselInterval = setInterval(function () {
                    intervalBody();
                }, rotationSpeed);
            }
            else {
                logOggleError("BUG", -355, "failed to start carousel. carouselRows.length: " + carouselRows.length(), "start carousel");
            }
        }
    } catch (e) {
        logOggleError("BUG", -355, e, "start carousel");
    }
}

function intervalBody() {
    try {
        if (!isPaused) {
            if (intervalReady) {
                intervalReady = false;
                imageIndex = Math.floor(Math.random() * carouselRows.length);

                if (arryItemsShownCount > carouselRows.length) {
                    if (confirm("items shown: " + arryItemsShownCount + "  carouselRows.length: " + carouselRows.length + "\nadd more images")) {
                        loadImages(true);
                        imageIndex = Math.floor(Math.random() * carouselRows.length);
                    }
                    totalArryItemsShownCount += arryItemsShownCount;
                    arryItemsShownCount = 0;
                }
                let loadFunctionHandled = false;
                $('#thisCarouselImage').attr('src', settingsImgRepo + carouselRows[imageIndex].ImageFileName).fadeIn("slow").load(function () {
                    if (!loadFunctionHandled) {
                        loadFunctionHandled = true;
                        arryItemsShownCount++;
                        resizeCarousel();
                        setLabelLinks(imageIndex);
                        $('#footerMessage1').html("image " + imageIndex.toLocaleString() + " of " + carouselRows.length.toLocaleString());
                        imageHistory.push(imageIndex);
                        intervalReady = true;
                    }
                });
            }
        }
        else {
            $('#pauseButton').html("|");
            intervalReady = true;
            setTimeout(function () { $('#pauseButton').html(">") }, 700);
        }
    } catch (e) {
        logOggleError("CAT", carouselRows[imageIndex].FolderId, e, "interval body");
    }
}

function setLabelLinks(llIdx) {
    try {
        //$("#imageTopLabel").fadeOut();
        //$("#carouselFooterLabel").fadeOut();
        //$("#knownModelLabel").fadeOut();
                
        let carouselItem = carouselRows[llIdx];
        if (carouselItem.carouselRoot == "centerfold") {
            if (carouselItem.RealRoot == "centerfold")
                $('#imageTopLabel').html("Playboy Playmate: " + carouselItem.PlayboyYear);
            else {
                if (carouselItem.RealRoot == "playboy")
                    $('#imageTopLabel').html(carouselItem.FolderParentName + ": " + carouselItem.FolderName);
                else {
                    $('#imageTopLabel').html(carouselItem.RealRoot + ": " + carouselItem.FolderName);
                    //pause();
                }
            }

            if (carouselItem.FolderType == 'singleChild') {
                $('#knownModelLabel').html(carouselItem.FolderParentName);
                $('#carouselFooterLabel').html(carouselItem.FolderGPName);
                mainImageClickId = carouselItem.FolderParentId;
                imageTopLabelClickId = carouselItem.FolderGPId;
                knownModelLabelClickId = carouselItem.FolderId;
                footerLabelClickId = carouselItem.FolderGPId;
            }
            else {
                $('#knownModelLabel').html(carouselItem.FolderName);
                $('#carouselFooterLabel').html(carouselItem.FolderParentName);
                mainImageClickId = carouselItem.FolderId;
                imageTopLabelClickId = carouselItem.FolderParentId;
                knownModelLabelClickId = carouselItem.FolderId;
                footerLabelClickId = carouselItem.FolderParentId;
            }
        }
        else {
            if (carouselItem.FolderId != carouselItem.ImageFolderId) {
                // we have a link from archive
                if (carouselItem.FolderType == 'singleChild') {
                    $('#imageTopLabel').html("clink " + carouselItem.FolderParentName);
                    $('#knownModelLabel').html(carouselItem.FolderName);

                    $('#carouselFooterLabel').html(carouselItem.FolderGPName);
                    mainImageClickId = carouselItem.FolderParentId;
                    imageTopLabelClickId = carouselItem.FolderGPId;
                    knownModelLabelClickId = carouselItem.ImageFolderId;
                    footerLabelClickId = carouselItem.FolderGPId;
                }
                else {
                    $('#imageTopLabel').html(carouselItem.FolderName);
                    $('#knownModelLabel').html(carouselItem.ImageFolderName);
                    $('#carouselFooterLabel').html(carouselItem.FolderParentName);
                    knownModelLabelClickId = carouselItem.ImageFolderId;
                    footerLabelClickId = carouselItem.FolderParentId;
                    mainImageClickId = carouselItem.FolderId;
                    imageTopLabelClickId = carouselItem.FolderId;
                }
            }
            else {
                // not a link
                if (carouselItem.FolderType == 'singleChild') {
                    $('#imageTopLabel').html(carouselItem.FolderParentName);
                    $('#knownModelLabel').html(carouselItem.FolderName);
                    $('#carouselFooterLabel').html(carouselItem.FolderGPName);

                    mainImageClickId = carouselItem.FolderParentId;
                    imageTopLabelClickId = carouselItem.FolderParentId;
                    knownModelLabelClickId = carouselItem.FolderId;
                    footerLabelClickId = carouselItem.FolderGPId;
                }
                else {
                    $('#imageTopLabel').html(carouselItem.FolderName);
                    $('#knownModelLabel').html(carouselItem.FolderParentName);
                    $('#carouselFooterLabel').html(carouselItem.FolderGPName);

                    mainImageClickId = carouselItem.FolderId;
                    imageTopLabelClickId = carouselItem.FolderId;
                    knownModelLabelClickId = carouselItem.FolderParentId;
                    footerLabelClickId = carouselItem.FolderGPId;;
                }
            }
        }
        setLabelLinksPositions()
    } catch (e) {
        logOggleError("CAT", carouselRows[llIdx].FolderId, e, "set label links");
    }
}

function setLabelLinksPositions() {
    let containerTop = $('#carouselImageInnerContainer').offset().top;
    let containerBottom = $('#thisCarouselImage').height() + $('#carouselImageInnerContainer').offset().top - $('#carouselFooterLabel').height() - 10;

    $("#imageTopLabel").offset({
        top: containerTop,
        left: $('#carouselImageInnerContainer').offset().left
    }).fadeIn("slow");

    $('#carouselFooterLabel').offset({
        top: containerBottom,
        left: $('#carouselImageInnerContainer').offset().left
    }).fadeIn("slow");

    $('#knownModelLabel').offset({
        top: containerBottom,
        left: $('#carouselImageInnerContainer').offset().left + $('#carouselImageInnerContainer').width() - 100
    }).fadeIn("slow");
}

function loadImages(forceCacheRefresh) {
    try {
        let startTime = Date.now();
        initialImageLoad = true;
        let limit = 600;
        let sql = "select * from VwCarouselImages where Width > Height and RootFolder='" +
            carouselRoot + "' order by rand() limit " + limit;
        $.ajax({
            type: "GET",
            url: "php/yagdrasselFetchAll.php?query=" + sql,
            success: function (data) {
                if (data.indexOf("Fatal error") > 0) {
                    $('#carouselContainer').html(data);
                }
                else {
                    let newRows = JSON.parse(data);
                    if (carouselRows.length == 0)
                        carouselRows = newRows;
                    else {
                        $.each(newRows, function (idx, obj) {
                            carouselRows.push(obj);
                        });
                    }
                    console.log("added " + newRows.length + " images");
                    if (!vCarouselInterval) {
                        startCarousel("load Images");
                    }
                    let delta = (Date.now() - startTime) / 1000;
                    console.log("loading images took: " + delta.toFixed(3));
                    refreshCache(forceCacheRefresh);
                }
            },
            error: function (jqXHR) {
                $('#albumPageLoadingGif').hide();
                logOggleError("XHR", -88854, getXHRErrorDetails(jqXHR), "load carousel images");
            }
        });
    } catch (e) {        
        logOggleError("CAT", -88854, e, "load carousel images");
    }
}

function refreshCache(forceRefresh) {
    try {
        if ((isNullorUndefined(window.localStorage)) && (isNullorUndefined(window.localStorage))) {
            logOggleError("SST", 1222, "this user should be flaged", "refresh carousle cache"); // NO SESSION STATE AVAILABLE
            $('#footerMessage2').html("no session state cache available");
            return;
        }
        let doit = forceRefresh;
        if (isNullorUndefined(window.localStorage[carouselRoot + "lastCacheRefreshDate"])) {
            window.localStorage[carouselRoot + "lastCacheRefreshDate"] = todayString();
            doit = true;
        }
        else {
            let lastCacheRefreshDate = window.localStorage[carouselRoot + "lastCacheRefreshDate"];
            const d2 = new Date(lastCacheRefreshDate);
            //$('#headerMessage').html("is valid date: " + (d2 instanceof Date && !isNaN(d2.valueOf())));

            let d2T = d2.getTime();
            const d1 = new Date();
            let d1T = d1.getTime();
            let difference_In_Time = (d1T - d2T) / (1000 * 3600 * 24);
            if (difference_In_Time > 1.1) {
                window.localStorage[carouselRoot + "lastCacheRefreshDate"] = todayString();
                doit = true;
            }
        }
        if (isNullorUndefined(window.localStorage[carouselRoot]))
            doit = true;

        if (doit) {
            let cacheArray = [];
            //window.localStorage.clear();
            for (i = 0; i < cacheSize; i++) {
                let r = Math.floor(Math.random() * carouselRows.length);
                cacheArray.push(carouselRows[r]);
            };
            window.localStorage[carouselRoot] = JSON.stringify(cacheArray);
            console.log("refreshed " + carouselRoot + " cache");
            $('#footerMessage2').html("refreshed " + carouselRoot + " cache");
        }
    } catch (e) {
        logOggleError("CAT", -88872, e, "refresh cache");
    }
}

function insureUnique100() {
    let alreadyShow = false;
    try {
        if (!isNullorUndefined(imageHistory.find(h => h == imageIndex))) {
            console.log(carouselRows[imageIndex].ImageFileName + " alreday shown");
            alreadyShow = true;
        }

    } catch (e) {
        console.warn(e);
    }
    return alreadyShow;
}

function clickSpeed(speed) {
    if (speed === "faster")
        rotationSpeed = Math.max(rotationSpeed - 800, 800);
    if (speed === 'slower')
        rotationSpeed += 800;
    clearInterval(vCarouselInterval);
    vCarouselInterval = null;
    //startCarousel("speed");
}

function togglePause() {
    if (isPaused) {
        resume();
        isPaused = false;
    }
    else {
        pause();
        isPaused = true;
    }
}

function pause() {
    $('#pauseButton').html(">");
}

function resume() {
    $('#pauseButton').html("||");
    isPaused = false;
    //startCarousel("resume");
}

function showCarouelSettingsDialog() {
    pause();

    $("#carouselSettingsDialog").css("width", 300);
    $('#carouselSettingsDialog').css("top", event.clientY - 75);
    $('#carouselSettingsDialog').css("left", event.clientX - 100);
    $("#carouselSettingsDialog").draggable().fadeIn();

    $('#ckCenterfold').prop("checked", jsCarouselSettings.includeCenterfolds);
    $('#ckArchive').prop("checked", jsCarouselSettings.includeArchive);
    $('#ckPorn').prop("checked", jsCarouselSettings.includePorn);
    $('#ckSofcore').prop("checked", jsCarouselSettings.includeSoftcore);
    $('#ckLandscape').prop("checked", jsCarouselSettings.includeLandscape);
    $('#ckPortrait').prop("checked", jsCarouselSettings.includePortrait);

    $("input[type='checkbox']").change(function () {
        if ($(this).prop("checked"))
            addItemsToArray($(this).attr("id"));
        else
            removeItemsFromArray($(this).attr("id"));

        updateCarouselSettings()
    });
}

function assuranceArrowClick(direction) {
    if (direction === "foward") {
        resume();
    }
    else {
        if (imageHistory.length > 1) {
            pause();
            let popimageIndex = imageHistory[imageHistory.length - 1];
            let popimage = settingsImgRepo + carouselRows[popimageIndex].ImageFileName;
            $('#thisCarouselImage').attr('src', popimage);
            setLabelLinks(popimageIndex);
        }
    }
}

function clickViewAlbum(labelClick) {
    try {
        event.preventDefault();
        window.event.returnValue = false;

        let clickFolderId = 0, carouselButtonClicked;
        switch (labelClick) {
            case 1: clickFolderId = mainImageClickId; carouselButtonClicked = "main image"; break;// carousel main image
            case 2: clickFolderId = imageTopLabelClickId; carouselButtonClicked = "top Label"; break;// top imageTopLabel
            case 3: clickFolderId = knownModelLabelClickId; carouselButtonClicked = "knownModelLabel"; break;// knownModelLabel
            case 4: clickFolderId = footerLabelClickId; carouselButtonClicked = "footerLabel"; break;// footer 
        }
        pause();
        window.location.href = "https://ogglefiles.com/beta/album.html?folder=" + clickFolderId;  //  open page in same window
    } catch (e) {
        logOggleError("CAT", -88845, e, "click view album");
    }
}

function carouselContextMenu() {
    pause();
    pos = {};
    pos.x = event.clientX;
    pos.y = event.clientY;
    showContextMenu("Carousel", pos,
        carouselRows[imageIndex].ImageFileName,
        carouselRows[imageIndex].LinkId,
        carouselRows[imageIndex].FolderId,
        carouselRows[imageIndex].FolderName);
}

function imgErrorThrown() {
    try {
        if (lastErrorThrown != imageIndex) {
            lastErrorThrown = imageIndex;

            $('#thisCarouselImage').attr('src', "https://common.ogglefiles.com/img/redballon.png");
            $('#thisCarouselImage').css('height', window.innerHeight * .5);

            //logOggleError("ILF", 11, carouselRows[imageIndex].ImageFileName + " not found", "carousel");
            //logOggleError("ILF", 11, carouselRows[imageIndex].ImageFileName+ " not found", "carousel");

        }
    } catch (e) {
        console.error("Ouh");
    }
}

function resizeCarousel() {
    try {
        $('#thisCarouselImage').css('height', window.innerHeight * .62);
        let marginOffsetWidth = ($('#carouselImageOutterContainer').width() / 2) - ($('#carouselImageInnerContainer').width() / 2);
        $('#carouselImageInnerContainer').css('margin-left', marginOffsetWidth);

        if (typeof carouselImageInnerContainer === 'object') {

            let imageW = $('#carouselImageInnerContainer').width();

            $('#carouselControls').css({
                "width": imageW - 100,
                "left": marginOffsetWidth + 50
            }).show();
        }
        else
            $('#carouselControls').hide();

        setLabelLinksPositions();

    } catch (e) {
        logOggleError("CAT", -88816, e, "resize carousel");
    }
}

function carouselHtml() {
    return "<div id='carouselImageOutterContainer' class='carouselImageContainer flexContainer'>\n" +
        "       <div Id='carouselImageInnerContainer'>\n" +
        "           <div id='knownModelLabel' class='categoryTitleLabel' onclick='clickViewAlbum(3)'></div>\n" +
        "           <div id='imageTopLabel' class='categoryTitleLabel' onclick='clickViewAlbum(2)'></div>\n" +
        "           <div id='carouselFooterLabel' class='categoryTitleLabel' onclick='clickViewAlbum(4)'></div>\n" +
        "           <img class='assuranceArrows' onclick='assuranceArrowClick(\"back\")' src='img/leftArrowOpaque02.png'/>\n" +
        "           <img id='thisCarouselImage' class='carouselImage' src='img/ingranaggi3.gif' " +
        "               onerror='imgErrorThrown()'" +
        "               oncontextmenu='carouselContextMenu()'" +
        "               onclick='clickViewAlbum(1)' />\n" +
        "           <img class='assuranceArrows' onclick='assuranceArrowClick(\"foward\")' src='img/rightArrowOpaque02.png'/>\n" +
        "       </div>\n" +
        "  </div>\n" +

        "<div id='carouselSettingsDialog' class='floatingDialogContainer'>\n" +
        "   <div class='floatingDialogHeader'>" +
        "       <div class='floatingDialogTitle'>Carousel Settings</div>" +
        "       <div class='dialogCloseButton'>" +
        "       <img src='https://common.ogglefiles.com/img/close.png' onclick='resume(); $(\"#carouselSettingsDialog\").hide();'/></div>\n" +
        "   </div>\n" +
        "   <div class='floatingDialogContents'>\n" +
        "       <input type='checkbox' id='ckCenterfold'></input> Include Centerfolds<br/>\n" +
        "       <input type='checkbox' id='ckArchive'></input> Include Big Naturals Archive<br/>\n" +
        "       <input type='checkbox' id='ckSoftcore'></input> Include softcore<br/>\n" +
        "       <input type='checkbox' id='ckPorn'></input> Include porn<br/>\n" +
        "       <input type='checkbox' id='ckLandscape'></input> allow landscape size<br/>\n" +
        "       <input type='checkbox' id='ckPortrait'></input> allow portrait size<br/>\n" +
        "   </div>\n" +
        "</div>\n";
}
