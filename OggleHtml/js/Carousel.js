
const rotationSpeed = 7000, carouselDebugMode = false;
let carouselFooterHeight = 40, intervalReady = true, initialImageLoad = false, isPaused = false,
    imageIndex = 0, carouselRows = [], imageHistory = [], absolueStartTime,
    vCarouselInterval = null,
    mainImageClickId, knownModelLabelClickId, imageTopLabelClickId, footerLabelClickId,
    jsCarouselSettings, arryItemsShownCount = 0,
    cacheSize = 45;

function launchCarousel(startRoot) {
    try {
        absolueStartTime = Date.now();
        window.addEventListener("resize", resizeCarousel);
        $('#carouselContainer').html(carouselHtml());
        loadFromCache(startRoot);
        $(window).resize(function () {
            resizeCarousel()
        });
    } catch (e) {
        logCatch("launchCarousel", e);
    }    //settingsImgRepo = settingsArray.ImageRepo;
}

function loadFromCache(carouselRoot) {
    try {
        let cacheArray = [];
        if (isNullorUndefined(window.localStorage)) {
            loadImages(carouselRoot, false);
            console.warn("window.localStorage undefined");
            return;
        }
        if (isNullorUndefined(window.localStorage[carouselRoot])) {
            loadImages(carouselRoot, true);
            console.log("no " + carouselRoot + " cache found");
            return;
        }
        cacheArray = JSON.parse(window.localStorage[carouselRoot]);
        if (isNullorUndefined(cacheArray)) {
            loadImages(carouselRoot, true);
            console.log("cache may be corrupt");
            alert("cache may be corrupt");
            return;
        }

        carouselRows = cacheArray;
        startCarousel(carouselRoot, " cache");
        //alert("loaded " + carouselRows.length + " from " + carouselRoot + " cache");
        console.log("loaded " + carouselRows.length + " from " + carouselRoot + " cache");
    }
    catch (e) {
        logCatch("loadFromCache", e);
        //loadImages(carouselRoot, true);
    }
}

function startCarousel(carouselRoot, calledFrom) {
    try {
        if (!initialImageLoad) {
            loadImages(carouselRoot);
        }
        if (vCarouselInterval) {
            alert("carousel interval already started. Called from: " + calledFrom);
            logError("BUG", 618510, "carousel interval already started. Called from: " + calledFrom, "start Carousel");
            //console.log("carousel interval already started. Called from: " + calledFrom);
        }
        else {
            if (carouselRows.length > 10) {
                resizeCarousel();
                $('#carouselImageInnerContainer').show();
                resizeCarousel();
                intervalBody(carouselRoot);
                $('#footerMessage1').html("started carousel from: " + calledFrom);
                imageIndex = 0; // Math.floor(Math.random() * carouselRows.length);
                //$('#thisCarouselImage').attr('src', settingsImgRepo + carouselRows[imageIndex].ImageFileName).fadeIn("slow");
                vCarouselInterval = setInterval(function () {
                    intervalBody(carouselRoot);
                }, rotationSpeed);
            }
            else {
                alert("failed to start carousel. carouselRows.length: " + carouselRows.length);
                $('#footerMessage1').html("failed to start carousel. carouselRows.length: " + carouselRows.length);
            }
        }
    } catch (e) {
        logCatch("startCarousel", e);
    }
}

function intervalBody(carouselRoot) {
    try {
        //if (!isPaused) {
            if (intervalReady) {
                intervalReady = false;
                if ((carouselRows.length - imageIndex++) < 2) {
                    if (confirm("imageIndex: " + imageIndex + "  carouselRows.length: " + carouselRows.length + "\nadd more images")) {
                        loadImages(carouselRoot);
                        imageIndex = Math.floor(Math.random() * 5);
                    }
                }
                if (carouselRows.length <= imageIndex) {
                    alert("imageIndex: " + imageIndex + ", carouselRows.length: " + carouselRows.length + "\nresetting carousel loop");
                    imageIndex = 0;
                }

                $('#thisCarouselImage').attr('src', settingsImgRepo + carouselRows[imageIndex].ImageFileName).fadeIn("slow").load(function () {
                    setLabelLinks(imageIndex);
                    resizeCarousel();

                    //setTimeout(function () {
                    //    let img = document.createElement('img');
                    //    img.src = $('#thisCarouselImage').attr('src');
                    //    if (img.height != 0) {
                    //        //img.crossOrigin = "Anonymous";
                    //        let rgb = averageColor(img);
                    //        $('#indexMiddleColumn').css("background-color", rgb)
                    //    }
                    //}, 500);
                    intervalReady = true;
                    $('#footerMessage1').html("image " + imageIndex.toLocaleString() + " of " + carouselRows.length.toLocaleString());
                    imageHistory.push(imageIndex);
                    arryItemsShownCount++;
                });
            }
      //  }
      //  else
      //      alert("pauseButton: " + $('#pauseButton').html());
      //      alert("pauseButton: " + $('#pauseButton').html());
      //      alert("pauseButton: " + $('#pauseButton').html());
    } catch (e) {
        logCatch("intervalBody", e);
    }
}

function resizeCarousel() {
    try {

        //let innerHeight = window.innerHeight * .62;
        //if ($('#thisCarouselImage').height() > innerHeight + 10) {
        //    alert("image height: " + $('#thisCarouselImage').height() + "  innerHeight: " + innerHeight);
        //}

        //if ($('#thisCarouselImage').width() > $('#carouselImageInnerContainer').width()){
        //    alert("image too wide");
        //}

        //$('#thisCarouselImage').css('max-height', ($('#carouselImageInnerContainer').height()));
        //$('#thisCarouselImage').css('max-with', ($('#carouselImageInnerContainer').width() - 100));

        $('#thisCarouselImage').css('height', window.innerHeight * .62);
        let marginOffsetWidth = ($('#carouselImageOutterContainer').width() / 2) - ($('#carouselImageInnerContainer').width() / 2);
        $('#carouselImageInnerContainer').css('margin-left', marginOffsetWidth);


        //let containerTop = $('#carouselImageInnerContainer').offset().top;
        //let containerBottom = $('#thisCarouselImage').height() + $('#carouselImageInnerContainer').offset().top - $('#carouselFooterLabel').height() - 10;
        //$("#imageTopLabel").offset({ top: containerTop, left: $('#carouselImageInnerContainer').offset().left }).fadeIn("slow");
        //$('#carouselFooterLabel').offset({
        //    top: containerBottom,
        //    left: $('#carouselImageInnerContainer').offset().left
        //}).fadeIn("slow");
        //$('#knownModelLabel').offset({
        //    top: containerBottom,
        //    left: $('#carouselImageInnerContainer').offset().left + $('#carouselImageInnerContainer').width()
        //}).fadeIn("slow");

        //$('#headerMessage').html("carouselImageInnerContainer.top: " + $('#carouselImageInnerContainer').offset().top + "  left: " + $('#carouselFooterLabel').offset().left);
    } catch (e) {
        logCatch("resizeCarousel", e);
    }
}

function setLabelLinks(llIdx) {
    try
    {
        //$("#imageTopLabel").hide();
        //$('#carouselFooterLabel').hide();
        //$('#knownModelLabel').hide();
        let carouselItem = carouselRows[llIdx];
        if (carouselItem.RootFolder == "centerfold") {
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

        let containerTop = $('#carouselImageInnerContainer').offset().top;
        let containerBottom = $('#thisCarouselImage').height() + $('#carouselImageInnerContainer').offset().top - $('#carouselFooterLabel').height() - 10;
        $("#imageTopLabel").offset({ top: containerTop, left: $('#carouselImageInnerContainer').offset().left }).fadeIn("slow");
        $('#carouselFooterLabel').offset({
            top: containerBottom,
            left: $('#carouselImageInnerContainer').offset().left
        }).fadeIn("slow");
        $('#knownModelLabel').offset({
            top: containerBottom,
            left: $('#carouselImageInnerContainer').offset().left + $('#carouselImageInnerContainer').width() - 100
        }).fadeIn("slow");

        //$('#headerMessage').html("carouselImageInnerContainer.top: " + $('#carouselImageInnerContainer').offset().top + "  left: " + $('#carouselFooterLabel').offset().left);
    } catch (e) {
        logCatch("setLabelLinks", e);
    }
}

function loadImages(carouselRoot, forceRefresh) {
    try {
        let startTime = Date.now();
        initialImageLoad = true;
        let limit = 600;
        let rootFolder = carouselRoot;
        $.ajax({
            type: "GET",
            url: "php/getCarouselImages.php?rootFolder=" + rootFolder + "&limit=" + limit,
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
                        startCarousel(carouselRoot, "loadImages");
                    }
                    let delta = (Date.now() - startTime) / 1000;
                    console.log("loading images took: " + delta.toFixed(3));
                    refreshCache(carouselRoot, forceRefresh);
                }
            },
            error: function (jqXHR) {
                $('#albumPageLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXH);
                alert("get albumImages: " + errMsg);
                // logError("XHR", folderId, errMsg, "get albumImages");
            }
        });
    } catch (e) {
        logCatch("loadImages", e);
    }
}

function refreshCache(carouselRoot, forceRefresh) {
    try {
        if ((isNullorUndefined(window.localStorage)) && (isNullorUndefined(window.localStorage))) {
            logError("SST", 1222, "this user should be flaged", "refresh carousle cache"); // NO SESSION STATE AVAILABLE
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

        if (doit)
        {
            let cacheArray = [];
            window.localStorage.clear();
            for (i = 0; i < cacheSize; i++) {
                let r = Math.floor(Math.random() * carouselRows.length);
                cacheArray.push(carouselRows[r]);
            };
            window.localStorage[carouselRoot] = JSON.stringify(cacheArray);
            console.log("refreshed " + carouselRoot + " cache");
            $('#footerMessage2').html("refreshed " + carouselRoot + " cache");
        }
    } catch (e) {
        logCatch("loadFromCache", e);
    }
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
    if ($('#pauseButton').html() == "||")
        pause();
    else {
        resume();
    }
}
function pause() {
    isPaused = true;
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
        pause();
        let popimageIndex = imageHistory[imageHistory.length--];
        //imageHistory.pop());
        //alert("imageIndex: " + imageIndex + " popimageIndex: " + popimageIndex);

        let popimage = settingsImgRepo + carouselRows[popimageIndex].ImageFileName;
        $('#thisCarouselImage').attr('src', popimage);
        setLabelLinks(popimageIndex);
    }
}

function clickViewGallery(labelClick) {
    try {
        event.preventDefault();
        window.event.returnValue = false;

        //if (arryItemsShownCount > 88)
            //alert("viewed " + arryItemsShownCount + " images");

        let clickFolderId = 0, carouselButtonClicked;
        switch (labelClick) {
            case 1: clickFolderId = mainImageClickId; carouselButtonClicked = "main image"; break;// carousel main image
            case 2: clickFolderId = imageTopLabelClickId; carouselButtonClicked = "top Label"; break;// top imageTopLabel
            case 3: clickFolderId = knownModelLabelClickId; carouselButtonClicked = "knownModelLabel"; break;// knownModelLabel
            case 4: clickFolderId = footerLabelClickId; carouselButtonClicked = "footerLabel"; break;// footer 
        }
        pause();
        window.location.href = "/gallery.html?album=" + clickFolderId;  //  open page in same window
    } catch (e) {
        logCatch("clickViewGallery", e);
    }
}

function carouselContextMenu() {
    pause();
    pos.x = event.clientX;
    pos.y = event.clientY;
    showContextMenu("Carousel", pos,
        carouselRows[imageIndex].ImageFileName,
        carouselRows[imageIndex].LinkId,
        carouselRows[imageIndex].FolderId,
        carouselRows[imageIndex].FolderName);
}

function imgErrorThrown() {

    $('#thisCarouselImage').attr('src', "img/redballon.png");
    $('#thisCarouselImage').css('height', window.innerHeight * .5);


//  alert("imgErrorThrown");
//    setTimeout(function () {
//        if ($('#thisCarouselImage').attr('src') == null) {
//            $('#thisCarouselImage').attr('src', "img/redballon.png");
//            logError("ILF", carouselRows[imageIndex].FolderId, "linkId: " + carouselRows[imageIndex].LinkId + " imgSrc: " + imgSrc, "Carousel");

//            if (document.domain == 'localhost') {
//                pause();
//                alert("image error\npage: " + carouselRows[imageIndex].FolderId +
//                    ",\nPageName: " + carouselRows[imageIndex].FolderName +
//                    ",\nLink: " + carouselRows[imageIndex].LinkId);

//                console.log("image error\npage: " + carouselRows[imageIndex].FolderId +
//                    ",\nPageName: " + carouselRows[imageIndex].FolderName +
//                    ",\nActivity: " + carouselRows[imageIndex].LinkId);
//            }
//        }
//    }, 600);
}

function carouselHtml() {
    return "<div id='carouselImageOutterContainer' class='carouselImageContainer flexContainer'>\n" +
        "       <div Id='carouselImageInnerContainer'>\n" +
        "           <div id='knownModelLabel' class='categoryTitleLabel' onclick='clickViewGallery(3)'></div>\n" +
        "           <div id='imageTopLabel' class='categoryTitleLabel' onclick='clickViewGallery(2)'></div>\n" +
        "           <div id='carouselFooterLabel' class='categoryTitleLabel' onclick='clickViewGallery(4)'></div>\n" +
        "           <img class='assuranceArrows' onclick='assuranceArrowClick(\"back\")' src='img/leftArrowOpaque02.png'/>\n" +
        "           <img id='thisCarouselImage' class='carouselImage' src='img/ingranaggi3.gif' " +
        "               onerror='imgErrorThrown()'" +
        "               oncontextmenu='carouselContextMenu()'" +
        "               onclick='clickViewGallery(1)' />\n" +
        "           <img class='assuranceArrows' onclick='assuranceArrowClick(\"foward\")' src='img/rightArrowOpaque02.png'/>\n" +
        //"           <div id='carouselFooter class='flexContainer' >\n" +
        //"               <img class='speedButton floatLeft' src='img/speedDialSlower.png' title='slower' onclick='clickSpeed(\"slower\")' />\n" +
        //"               <div id='pauseButton' class='pauseButtonArea' onclick='togglePause()'>||</div>\n" +
        //"               <img class='speedButton floatRight' src='img/speedDialFaster.png' title='faster' onclick='clickSpeed(\"faster\")' />\n" +
        ////"             <img class='speedButton floatRight' src='img/Settings-icon.png' title='carousel settings' onclick='showCarouelSettingsDialog()' />\n" +
        //"           </div>\n" +
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
