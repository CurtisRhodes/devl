

function getAlbumPageInfo(folderId) {
    try {
        let catFldrObj = {};
        getDataFromServer("php/fetch.php?schema=oggleboo_Danni&query=select * from vwAblumInfo where FolderId=" + folderId, catFldrObj);
        let catFldrUntrvl = setInterval(function () {
            if (ready(catFldrObj.data)) {
                clearInterval(catFldrUntrvl);
                if (catFldrObj.data.indexOf("connection Failed") > -1) {
                    displayStatusMessage("error", "max_user_connections. reload (F5)");
                }
                else {
                    let albumInfo = JSON.parse(catFldrObj.data);

                    displayCommonHeader(albumInfo);

                    displayFooter(albumInfo);

                    setBreadcrumbs(albumInfo);

                    addTrackbackLinks(folderId);
                    showLogin();

                    //setAlbumPageColor(albumInfo.RootFolder);

                    if (albumInfo.FolderType == "singleChild")
                        replaceHtml(ele("seoPageName"), albumInfo.ParentName + "/" + albumInfo.FolderName);
                    else
                        replaceHtml(ele("seoPageName"), albumInfo.FolderName);

                    // showPageHits(folderId);

                    showLastStaticPageUpdate(folderId);

                    showBottomFileCounts(albumInfo);

                    showElement(albumPageFooter);

                    //hideElement(ele("slideshowBottomRowSection"));
                    ele('largeLoadButton').addEventListener('click', function onClick() { loadAlbumPage(folderId, true, "self") });
                    ele('deepSlideshowButton').addEventListener('click', function onClick() { showSlideshowViewer(folderId, 0, true) });
                    ele('slideShowClick').addEventListener('click', function onClick() { showSlideshowViewer(folderId, 0, false) });
                    ele('albumBottomfileCount').addEventListener('click', () => { updateFolderCount(folderId, albumInfo.FolderPath) });
                    ele('folderCommentButton').addEventListener('click', () => { showFolderCommentsDialog(folderId, albumInfo.FolderName); });


                    ele('folderUpButton').addEventListener('click', () => { getNavg(folderId, 'up'); });
                    ele('nextButton').addEventListener('click', () => { getNavg(folderId, 'next'); });
                    ele('backButton').addEventListener('click', () => { getNavg(folderId, 'previous'); });

                    ele('footerSortItem').addEventListener('click', () => { sortAlbum() });

                    // if ((albumInfo.RootFolder == "porn") || (albumInfo.RootFolder == "sluts")) { determinePornStatus(); };
                }
            }
        }, 32);
    } catch (e) {
        logOggleError("CAT", folderId, e, "BETA get albumPage info");
    }
}

function getNavg(folderId, direction) {
    try {
        let navr = new Object;
        getDataFromServer("php/getNextPreviousAlbum.php?folderId=" + folderId + "&direction=" + direction, navr);
        let navintrv = setInterval(() => {
            if (!isNullorUndefined(navr.data)) {
                clearInterval(navintrv); loadingGif("hide");
                let navgData = JSON.parse(navr.data);
                window.location.href = "album.html?folder=" + navgData;
            }
        }, 200);
    } catch (e) {
        logOggleError("CAT", folderId, e, "get NextPrevious Album. direction: " + direction);
    }
}

function setBreadcrumbs(albumInfo) {
    try {
        //('aboveImageContainerMessageArea').html('loading breadcrumbs');
        const breadcrumbContainer = ele("breadcrumbContainer");
        breadcrumbContainer.insertAdjacentHTML("beforeend", "<img id='bcloader' style='height:27px' src='https://common.ogglebooble.com/img/loader.gif'/>");
        let brdCrmbObj = {}, breadcrumbHtml = "";
        getDataFromServer("php/fetch.php?schema=oggleboo_Danni&query=select * from vwBreadCrumbTree where Id=" + albumInfo.FolderId, brdCrmbObj);
        let brdCrmbIntrvl = setInterval(function () {
            if (ready(brdCrmbObj.data)) {
                clearInterval(brdCrmbIntrvl);
                let brdCrmbData = JSON.parse(brdCrmbObj.data);
                let root = 0;
                if (!isNullorUndefined(brdCrmbData.fivegp) && (brdCrmbData.fivegpId > root)) {
                    breadcrumbHtml = "<div class='activeBreadCrumb' " +
                        " onclick='window.location.href =\"album.html?folder=" + brdCrmbData.fivegpId + "\"'>" + brdCrmbData.fivegp + "</div>";
                }
                if (!isNullorUndefined(brdCrmbData.fourgp) && (brdCrmbData.fourgpId > root)) {
                    breadcrumbHtml += "<div class='activeBreadCrumb' " +
                        " onclick='window.location.href =\"album.html?folder=" + brdCrmbData.fourgpId + "\"'>" + brdCrmbData.fourgp + "</div>";
                }
                if (!isNullorUndefined(brdCrmbData.threegp) && (brdCrmbData.threegpId > root)) {
                    breadcrumbHtml += "<div class='activeBreadCrumb' " +
                        " onclick='window.location.href =\"album.html?folder=" + brdCrmbData.threegpId + "\"'>" + brdCrmbData.threegp + "</div>";
                }
                if (!isNullorUndefined(brdCrmbData.twogp) && (brdCrmbData.twogpId > root)) {
                    breadcrumbHtml += "<div class='activeBreadCrumb' " +
                        " onclick='window.location.href =\"album.html?folder=" + brdCrmbData.twogpId + "\"'>" + brdCrmbData.twogp + "</div>";
                }
                if (!isNullorUndefined(brdCrmbData.gp) && (brdCrmbData.gpId > root)) {
                    breadcrumbHtml += "<div class='activeBreadCrumb' " +
                        " onclick='window.location.href =\"album.html?folder=" + brdCrmbData.gpId + "\"'>" + brdCrmbData.gp + "</div>";
                }
                if (!isNullorUndefined(brdCrmbData.p) && (brdCrmbData.pId > root)) {
                    breadcrumbHtml += "<div class='activeBreadCrumb' " +
                        " onclick='window.location.href =\"album.html?folder=" + brdCrmbData.pId + "\"'>" + brdCrmbData.p + "</div>";
                }

                breadcrumbHtml += `<div id='infoBreadcrumb' class='inactiveBreadCrumb' >` + brdCrmbData.FolderName + "</div>";

                replaceHtml(breadcrumbContainer, breadcrumbHtml);

                ele("infoBreadcrumb").addEventListener("click", (e) => {
                    e.preventDefault;
                    showAlbumDialog(albumInfo);
                });

            }
        }, 20);
    } catch (e) {
        ele('bcloader').style.display = "none";
        breadcrumbContainer.appendChild(document.createTextNode(e));
        logOggleError("CAT", folderId, e, "set breadcrumbs");
    }
}

function displayFooter(albumInfo) {
    /*
        <div class='clickable' onclick='showCategoryList("footer")'>Category List</div>
        <div class='clickable' onclick='footerItemClick(3)'>Babes List</div>
        <div class='clickable' onclick='helpMe()'>help me</div>`
        <div class='clickable' onclick='oggleIsFree("footer")'>OggleBooble is free</div>
        <div class='clickable' onclick='window.location.href=\"index.html?spa=porn'>OgglePorn</div>
        <div class='clickable' onclick='window.location.href=\"index.html?spa=playboy' '_blank'>Centerfolds</div>`
        <div class='clickable' onclick='sortFooterClick(`+ folderId + `)'>sort</div>`
        <div id='footerCol3' class='footerCol'>
                <div class='clickable' onclick='showOggleFeedbackDialog(`+ folderId + `)'>Feedback</div>
*/

    ele("footerCol3").insertAdjacentHTML("beforeend", "<div class='clickable' onclick='showOggleFeedbackDialog(" + albumInfo.Id + ")'>Feedback</div>");

}

function showBottomFileCounts(albumInfo) {   
    const albumBottomfileCount = ele('albumBottomfileCount');
    var txtNode;
    if (isNullorUndefined(albumInfo.Links))
        linksCount = 0;
    switch (albumInfo.FolderType) {
        case "multiFolder":
        case "singleParent":
        case "stepParent":
            ele('slideShowClick').style.display = "none";
            if (albumInfo.Files == "0")
                txtNode = Number(albumInfo.SubFolders) + "/" + Number((Number(albumInfo.TotalChildFiles) + Number(albumInfo.Links))).toLocaleString();
            else
                txtNode = "{" + albumInfo.Files + "}  " + albumInfo.SubFolders + "/" + Number((Number(albumInfo.TotalChildFiles) + Number(albumInfo.Links))).toLocaleString();
            break;
        case "multiModel":
        case "singleModel":
        case "stepChild":
        case "singleChild":
            txtNode = (Number(albumInfo.Files) + Number(albumInfo.Links)).toLocaleString();
            break;
    }
    replaceHtml(albumBottomfileCount, txtNode);
    //albumBottomfileCount.appendChild(document.createTextNode(txtNode));
    //txtNode = Number(childFilesCount) + Number(linksCount).toLocaleString();
}

function addTrackbackLinks(folderId) {
    try {
        let trkbk = new Object;
        getDataFromServer('php/fetchAll.php?schema=oggleboo_Danni&query=Select * from TrackbackLink where CatFolderId=' + folderId, trkbk);
        let wait = setInterval(function () {
            if (isNullorUndefined(trkbk.data))
                loadingGif("show");
            else {
                clearInterval(wait); loadingGif("hide");
                let trackBackItems = JSON.parse(trkbk.data);
                if ((trackBackItems.length > 0)) {
                    ele("trackbackContainer").style.display = "block";
                    const trackbackLinkArea = ele("trackbackLinkArea");
                    trackBackItems.forEach(trackBackItem => {
                        if (trackBackItem.LinkStatus != "hide") {
                            switch (trackBackItem.SiteCode) {
                                case "FRE":
                                    trackbackLinkArea.insertAdjacentHTML("beforeend", "<div><a href='" + trackBackItem.Href + "' target=\"_blank\">" + albumInfo.FolderName + " Free Porn</a></div>");
                                    break;
                                case "BAB":
                                    trackbackLinkArea.insertAdjacentHTML("beforeend", "<div><a href='" + trackBackItem.Href + "' target=\"_blank\">Babepedia</a></div>");
                                    break;
                                case "BOB":
                                    trackbackLinkArea.insertAdjacentHTML("beforeend", "<div><a href='" + trackBackItem.Href + "' target=\"_blank\">Boobpedia</a></div>");
                                    break;
                                case "IND":
                                    trackbackLinkArea.insertAdjacentHTML("beforeend", "<div><a href='" + trackBackItem.Href + "' target=\"_blank\">Indexxx</a></div>");
                                    break;
                                case "RBY":
                                    trackbackLinkArea.insertAdjacentHTML("beforeend", "<div><a href='" + trackBackItem.Href + "' target=\"_blank\">Indexxx</a></div>");
                                    break;
                                default:
                                    // alert("trackback link sitecode: " + obj.SiteCode + " not handled for folder: " + folderId);
                                    logOggleError("SWT", folderId, "site code: " + obj.SiteCode, "getAlbumPageInfo/TrackBackItems");
                            }
                        }
                    });
                }
            }
        }, 200);
    } catch (e) {
        logOggleError("CAT", folderId, e, "add trackback links");
    }
}

function showLastStaticPageUpdate(folderId) {
    try {
        let lspu = new Object;
        getDataFromServer("php/fetchAll.php?schema=oggleboo_Danni&query=select StaticFile, date_format(StaticFileUpdate,'%m %d %y') Updated from FolderDetail where FolderId=" + folderId, lspu);
        let stpuiv = setInterval(() => {
            if (ready(lspu.data)) {
                clearInterval(stpuiv);
                if (lspu.data.lastIndexOf("error") > - 1) {
                    logOggleError("AJX", folderId, e, "folder click");
                }
                else {
                    let staticFileData = JSON.parse(lspu.data);
                    if (staticFileData.StaticFile != null)
                        document.createElement("footerCol5").appendChild(document.createTextNode("<div class='clickable' onclick='window.open(\"" +
                            staticFileData.StaticFile + "\")'>last updated: " + staticFileData.Updated + "</div>"));
                }
            }
        }, 200);
    } catch (e) {
        logOggleError("CAT", folderId, e, "show static page");
    }
}

function buildPlayboyMenu() {
    let playboyHeader = "";
    let playboyHeaderArray = [
        [1132, "centerfolds,"],
        [6095, "muses,"],
        [3796, "cybergirls,"],
        [14264, "adult stars,"],
        [3128, "international,"],
        [3393, "lingerie,"],
        //[3796, "magazine covers"],
        [6368, "playboy plus,"],
        [33562, "more"]
    ];
    // [6076, "special editions"],
    // [4015, "pictorials"],
    for (i = 0; i < playboyHeaderArray.length; i++) {
        pbid = playboyHeaderArray[i][0];
        pbnm = playboyHeaderArray[i][1];

        if (playboyHeaderArray[i][0] == folderId)
            console.log(folderId + " removed from menu list");
        else
            playboyHeader += "<span class='clickable' onclick='headerMenuClick(" + playboyHeaderArray[i][0] + ")'>" +
                playboyHeaderArray[i][1] + "</span>\n";
    }
    return playboyHeader;
}