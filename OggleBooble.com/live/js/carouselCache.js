let cacheSize = 45;

function loadFromCache(pageContext) {
    try {
        if (isNullorUndefined(pageContext)) {
            logOggleError("BUG", "page context undefined", "load from carousel cache");
            loadMoreImages(pageContext, 11);
        }
        if(isNullorUndefined(localStorage["carouselCache" + pageContext])) {
            // logOggleError("BUG", "local storage carouselCache" + pageContext + " undefined", "load from carousel cache");
            loadMoreImages(pageContext, 15);
        }
        else {
            carouselArray = JSON.parse(localStorage["carouselCache" + pageContext]);
            seeIfCacheNeedsUpdating(pageContext);
        }
    }
    catch (e) {
        loadMoreImages(pageContext, 50);
        logOggleError("CAT", e, "load from cache");
    }
}

function seeIfCacheNeedsUpdating(pageContext) {
    try {
        if (isNullorUndefined(localStorage["lastCarouselCacheRefresh" + pageContext])) {
            updateCache(pageContext, cacheSize);
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
                localStorage["lastCacheRefreshDate" + pageContext] = todayString();
                updateCache(pageContext, cacheSize);
                console.log("refreshed " + pageContext + " cache");
            }
        }
    } catch (e) {
        logOggleError("CAT", e, "see if cache needs updating");
    }
}

function updateCache(pageContext, chunkSize) {
    try {
        let cacheObj = {};
        let sqlUrl = "php/fetchAll.php?schema=oggleboo_Danni&query=select * from Carousel where PageContext='" + pageContext + "' and (Width > Height) order by rand() limit " + chunkSize;
        getDataFromServer(sqlUrl, cacheObj);
        let omgIntrvl = setInterval(() => {
            if (ready(cacheObj.data)) {
                let cacheArray = [];
                clearInterval(omgIntrvl);
                let newRows = JSON.parse(cacheObj.data);
                newRows.forEach(newRow => {
                    cacheArray.push(newRow);
                });
                localStorage["carouselCache" + pageContext] = JSON.stringify(cacheArray);
                replaceHtml(ele("footerMessage2"), "cache updated");
                logOggleActivity("RC0", "pageContext: " + pageContext);
            }
        }, 23);
    } catch (e) {
        logOggleError("CAT", e, "update cache");
    }
}

function loadMoreImages(pageContext, chunkSize) {
    try {
        let startTime = Date.now();
        let sqlUrl = "php/fetchAll.php?schema=oggleboo_Danni&query=select * from Carousel where PageContext='" + pageContext + "' and (Width > Height) order by rand() limit " + chunkSize;
        let moreObj = {};
        getDataFromServer(sqlUrl, moreObj);
        let moreIntrvl = setInterval(() => {
            if (ready(moreObj.data)) {
                clearInterval(moreIntrvl);
                let newRows = JSON.parse(moreObj.data);
                loadCarouselArray(newRows);

                udateCache(pageContext, chunkSize);

                let delta = (Date.now() - startTime) / 1000;
                console.log("loading images took: " + delta.toFixed(3));
            }
        }, 23);
    } catch (e) {
        logOggleError("CAT", e, "load carousel images catch");
    }
}

function loadCarouselArray(newRows) {
    let goodRows = [];
    let alreadyIn = false;
    for (var i = 0; i < newRows.length; i++) {
        alreadyIn = false;
        if (isNullorUndefined(carouselArray)) {
            goodRows.push(newRows[i]);
        }
        else {
            for (let ii = 0; ii < carouselArray.length; ii++) {
                if (i != ii) {
                    if (carouselArray[ii].LinkId == newRows[i].LinkId) {
                        alreadyIn = true;
                        break;
                    }
                }
            };
            if (!alreadyIn) {
                goodRows.push(newRows[i]);
            }
        }
    };
    for (var j = 0; j < goodRows.length; j++) {
        if (carouselArray.length > maxArraySize) {
            carouselArray.shift(0);
            carouselArray.shift(0);
        }
        carouselArray.push(goodRows[j]);
    }
    localStorage["carouselCache" + pageContext] = JSON.stringify(carouselArray);
    replaceHtml(ele("footerMessage2"), "added " + goodRows.length + " images");
}

