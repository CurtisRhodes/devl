function getLatestUpdatedGalleries(pageContext) {
    try {
        rebuildLatestUpdatedGalleriesCache(pageContext);
        //if (!isNullorUndefined(localStorage.latestGalleries)) {
        //    localStorage.latestGalleries = null;
        //}
        //if (isNullorUndefined(localStorage["latestGalleries" + pageContext])) {
        //    rebuildLatestUpdatedGalleriesCache(pageContext);
        //}
        //else {
        //    let updatedGalleries = JSON.parse(localStorage["latestGalleries" + pageContext]);
        //    //updatedGalleries.forEach(updatedGallery => {
        //    for (i = 0; i < updatedGalleriesCount; i++) {
        //        updatedGallery = updatedGalleries[i];
        //        latestUpdatesContainer.insertAdjacentHTML("beforeend", `<div class='latestContentBox'>
        //        <div class='latestContentBoxLabel'>` + updatedGallery.AlbumName + `</div>
        //        <img class='latestContentBoxImage' alt='https://common.ogglebooble.com/img/redBalloon.png'
        //        src='` + settingsImgRepo + updatedGallery.FileName + `'
        //        onclick='latestUpdatesClick(` + updatedGallery.Id + `)'/>
        //        <div class='latestContentBoxDateLabel'><span>updated: ` + updatedGallery.Acquired + `</span></div></div>`);
        //    };
        //}
    } catch (e) {
        logOggleError("CAT", e, "get latest updated galleries");
        rebuildLatestUpdatedGalleriesCache(pageContext);
    }
}

function rebuildLatestUpdatedGalleriesCache(pageContext) {
    let filter = "";
    switch (pageContext) {
        case "porn": filter = "('porn','sluts','soft')"; break;
        case "boobs": filter = "('archive','soft','boobs','bond','celebrity','gent')"; break;
        case "playboy": filter = "('playboy','centerfold','cybergirls','international','adult','muses','plus','busty','magazine','lingerie')"; break;
    }
    let latestObj = {};
    let sql = "select * from vwLatestTouched where RootFolder in " + filter + " limit 69";
    getDataFromServer("php/fetchAll.php?schema=oggleboo_Danni&query=" + sql, latestObj);
    let latestIntrvl = setInterval(function () {
        if (ready(latestObj.data)) {
            clearInterval(latestIntrvl);
            if (latestObj.data.indexOf("error") > -1) {
                //displayStatusMessage("error", latestObj.data);
                latestUpdatesContainer.insertAdjacentHTML("beforeend", "unable to connect to database " + latestObj.data);
                //displayStatusMessage("error", "max_user_connections. reload (F5)");
            }
            else {
                const latestUpdatesContainer = ele('latestUpdatesContainer');
                removeContents(latestUpdatesContainer);
                let updatedGalleries = JSON.parse(latestObj.data);
                //updatedGalleries.forEach(updatedGallery => {
                for (i = 0; i < updatedGalleriesCount; i++) {
                    updatedGallery = updatedGalleries[i];
                    latestUpdatesContainer.insertAdjacentHTML("beforeend", `<div class='latestContentBox'>
                        <div class='latestContentBoxLabel'>` + updatedGallery.AlbumName + `</div>
                        <img class='latestContentBoxImage' alt='https://common.ogglebooble.com/img/redBalloon.png'
                        src='` + settingsImgRepo + updatedGallery.FileName + `'
                        onclick='latestUpdatesClick(`+ updatedGallery.Id + `,"` + updatedGallery.FileName + `")'/>
                        <div class='latestContentBoxDateLabel'><span>updated: ` + updatedGallery.Acquired + `</span></div></div>`);
                };

                localStorage["latestGalleries" + pageContext] = JSON.stringify(updatedGalleries);
            }
        };
    }, 222);
}

function latestUpdatesClick(folderId, fileName) {
    logOggleEvent("LUP", "(" + folderId + ") " + fileName);
    window.location.href = "album.html?folder=" + folderId;
}

function checkLatestUpdatedStatus(pageContext) {
    let latestUpdatesObj = {};
    getDataFromServer("php/fetch.php?schema=oggleboo_Danni&query=select LatestUpdate from vwLatestUpdate where PageContext='" + pageContext + "'", latestUpdatesObj);
    let lastestUpdatedDateIntrvl = setInterval(function () {
        if (ready(latestUpdatesObj.data)) {
            clearInterval(lastestUpdatedDateIntrvl);
            if (latestUpdatesObj.data == "false") {
                rebuildLatestUpdatedGalleriesCache(pageContext);
            }
            else {
                let serverCacheObj = {};
                getDataFromServer("php/fetch.php?schema=oggleboo_Stats&query=select DataValue from ServerCache where DataType='latestUpdates" + pageContext + "'", serverCacheObj);
                let serverCacheObjIntrvl = setInterval(function () {
                    if (ready(latestUpdatesObj.data)) {
                        clearInterval(serverCacheObjIntrvl);
                        if (serverCacheObj.data == "false") {
                            rebuildLatestUpdatedGalleriesCache(pageContext);
                        }
                        else {
                            if (latestUpdatesObj.data.indexOf("error") > -1) {
                                displayStatusMessage("error", latestUpdatesObj.data);
                                //displayStatusMessage("error", "max_user_connections. reload (F5)");
                            }
                            else {
                                try {
                                    let l1 = JSON.parse(serverCacheObj.data);
                                    let dvCol = JSON.parse(latestUpdatesObj.data);
                                    checkCacheStatus("lastestUpdatedDate", pageContext);
                                } catch (e) {
                                    rebuildLatestUpdatedGalleriesCache(pageContext);
                                }
                            }
                        }
                    }
                }, 234);
            }
        }
    }, 123);
}

    // ------------- global server cache  ---------------------------------------------------------------------------------------------------------
function updateLatestUpdatesCache(updatedGalleries, pageContext) {
    var LatestUpdatedFormData = new FormData();
    LatestUpdatedFormData.append('editMode', 'update');
    LatestUpdatedFormData.append('dataType', "latestUpdates" + pageContext);
    LatestUpdatedFormData.append('dataValue', JSON.stringify(updatedGalleries));
    let latestUpdatedObj = {};
    postDataToServer("php/postServerCache.php", LatestUpdatedFormData, latestUpdatedObj);
    let latestUpdatedIntrvl = setInterval(() => {
        if (ready(latestUpdatedObj.data)) {
            clearInterval(latestUpdatedIntrvl);
            if (latestUpdatedObj.data.trim() == "ok") {
                displayStatusMessage("ok", "server cache updated");

                //    (localStorage.latestGalleries + pageContext) = JSON.stringify(updatedGalleries);

            }
            else {
                displayStatusMessage("error", latestUpdatedObj.data);
            }
        }
    }, 322);
}

/* -------------------------------- getRandomGalleriesFromCache ------------------------------------------------*/{

    function getRandomGalleriesFromCache(pageContext) {
        try {
            let randDataObj = {};
            getDataFromServer("php/fetch.php?schema=oggleboo_Stats&query=select DataValue from ServerCache where DataType='randomGalleries" + pageContext + "'", randDataObj);
            let randDataIntrvl = setInterval(function () {
                if (ready(randDataObj.data)) {
                    clearInterval(randDataIntrvl);
                    if (randDataObj.data === "error:503") {
                        randomGalleriesContainer.insertAdjacentHTML("beforeend", "unable to connect to database " + randDataObj.data);
                    }
                    else {
                        if (randDataObj.data == "false") {
                            rebuildRandomGalleryCache(pageContext);
                        }
                        else {
                            if (randDataObj.data.indexOf("error") > -1) {
                                displayStatusMessage("error", randDataObj.data);
                                //displayStatusMessage("error", "max_user_connections. reload (F5)");
                            }
                            else {
                                try {
                                    if (randDataObj.data.indexOf("error") > -1) {
                                        // displayStatusMessage("error", randDataObj.data);
                                        randomGalleriesContainer.insertAdjacentHTML("beforeend", "unable to connect to database " + randDataObj.data);
                                        //displayStatusMessage("error", "max_user_connections. reload (F5)");
                                    }

                                    if (!randDataObj.data) {
                                        rebuildRandomGalleryCache(pageContext);
                                    }
                                    else {
                                        let dvCol = JSON.parse(randDataObj.data);
                                        let randomGalleries = JSON.parse(dvCol.DataValue);
                                        for (i = 0; i < randomGalleriesCount; i++) {
                                            randomGallery = randomGalleries[i];
                                            randomGalleriesContainer.insertAdjacentHTML("beforeend", `<div class='latestContentBox'>
                                        <div class='latestContentBoxLabel'>` + randomGallery.AlbumName + `</div>
                                        <img class='latestContentBoxImage' alt='Images/redballon.png' src='` + settingsImgRepo + randomGallery.FileName + `'
                                        onclick='openSelectedRandomPage(` + randomGallery.FolderId + `)'/></div>`);
                                        };

                                        checkCacheStatus("randomGalleries", pageContext);
                                    }
                                } catch (e) {
                                    rebuildRandomGalleryCache(pageContext);
                                }
                            }
                        }
                    }
                }
            }, 211);
        } catch (e) {
            rebuildRandomGalleryCache(pageContext);
            logOggleError("CAT", e, "get random  galleries");
        }
    }

    function openSelectedRandomPage(folderId) {
        logOggleEvent("RIC", "pageContext: " + currentPageContext);  // random image clicked
        window.location.href = "album.html?folder=" + folderId;
    }

    function rebuildRandomGalleryCache(pageContext) {
        ele("imgRandomGalleries").src = "https://common.ogglebooble.com/img/loader.gif";
        let filter = "";
        switch (pageContext) {
            case "porn": filter = "('porn','sluts','soft')"; break;
            case "boobs": filter = "('archive','soft','boobs','bond','celebrity','gent')"; break;
            case "playboy": filter = "('playboy','centerfold','cybergirls','international','adult','muses','plus','busty','magazine','college girls')"; break;
        }
        let randRowData = {};
        let sql = "select * from vwRandomFolders where RootFolder in " + filter + " limit 55";
        getDataFromServer("php/fetchAll.php?schema=oggleboo_Danni&query=" + sql, randRowData);
        let randRowIntrvl = setInterval(() => {
            if (ready(randRowData.data)) {
                clearInterval(randRowIntrvl);
                if (randRowData.data.indexOf("error") > -1) {
                    displayStatusMessage("error", randRowData.data);
                    //displayStatusMessage("error", "max_user_connections. reload (F5)");
                }
                else {
                    const randomGalleriesContainer = ele("randomGalleriesContainer");
                    removeContents(randomGalleriesContainer);

                    let randomGalleries = JSON.parse(randRowData.data);
                    for (i = 0; i < randomGalleriesCount; i++) {
                        randomGallery = randomGalleries[i];
                        randomGalleriesContainer.insertAdjacentHTML("beforeend", `<div class='latestContentBox'>
                        <div class='latestContentBoxLabel'>` + randomGallery.AlbumName + `</div>
                        <img class='latestContentBoxImage' alt='Images/redballon.png' src='` + settingsImgRepo + randomGallery.FileName + `'
                        onclick='openSelectedRandomPage(` + randomGallery.FolderId + `)'/></div>`);
                    };
                    ele("imgRandomGalleries").src = "img/refresh02.png";



                    // -- refresh cache
                    var randomGalleriesFormData = new FormData();
                    randomGalleriesFormData.append('editMode', 'update');
                    randomGalleriesFormData.append('dataType', "randomGalleries" + pageContext);
                    randomGalleriesFormData.append('dataValue', JSON.stringify(randomGalleries));
                    let postCacheGObj = {};
                    postDataToServer("php/postServerCache.php", randomGalleriesFormData, postCacheGObj);
                    let postCacheGIntrvl = setInterval(() => {
                        if (ready(postCacheGObj.data)) {
                            clearInterval(postCacheGIntrvl);
                            if (postCacheGObj.data.trim() == "ok") {
                                displayStatusMessage("ok", "server cache updated");
                            }
                            else {
                                displayStatusMessage("error", postCacheGObj.data);
                            }

                            var lastRandRefreshData = new FormData();
                            lastRandRefreshData.append('editMode', 'update');
                            lastRandRefreshData.append('dataType', 'lastRandRefresh' + pageContext);
                            lastRandRefreshData.append('dataValue', todayString());
                            postDataToServer("php/postServerCache.php", lastRandRefreshData, {});
                            let postCacheDObj = {};
                            postDataToServer("php/postServerCache.php", randomGalleriesFormData, postCacheDObj);
                            let postCacheDIntrvl = setInterval(() => {
                                if (ready(postCacheDObj.data)) {
                                    clearInterval(postCacheDIntrvl);
                                    if (postCacheGObj.data.trim() == "ok") {
                                        displayStatusMessage("ok", "server cache updated");
                                    }
                                    else {
                                        displayStatusMessage("error", postCacheDObj.data);
                                    }
                                }
                            }, 322);
                        }
                    }, 322);
                }
            }
        }, 212);
    }
}

function checkCacheStatus(cacheType, pageContext) {
    try {
        // get date of last refresh
        let cacheStatusObj = {};
        getDataFromServer("php/fetch.php?schema=oggleboo_Stats&query=select DataValue from ServerCache where DataType='" + cacheType + pageContext + "'", cacheStatusObj);
        let cacheStatusIntrvl = setInterval(function () {
            if (ready(cacheStatusObj.data)) {
                clearInterval(cacheStatusIntrvl);
                if (cacheStatusObj.data != "false") {
                    let dvCol = JSON.parse(cacheStatusObj.data);
                    let lastRandRefresh = dvCol.DataValue;
                    const d2 = new Date(lastRandRefresh);
                    let d2T = d2.getTime();
                    const d1 = new Date();
                    let d1T = d1.getTime();
                    let difference_In_Time = (d1T - d2T) / (1000 * 3600 * 24);
                    if (difference_In_Time > 1.1) {
                        switch (pageContext) {
                            case "RandomGalleries": rebuildRandomGalleryCache(pageContext); break;
                            case "latestUpdates": rebuildLatestUpdatedGalleriesCache(pageContext); break;
                        }
                    }
                }
            }
        }, 211);
    } catch (e) {
        logOggleError("CAT", e, "check CacheStatus");
    }
}
