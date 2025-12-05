let albumInfo = {};

function getAlbumPageInfo() {
    try {
        let catFldrObj = {};
        getDataFromServer("php/fetch.php?schema=oggleboo_Danni&query=select * from vwAblumInfo where FolderId=" + currentFolderId, catFldrObj);
        let catFldrUntrvl = setInterval(function () {
            if (ready(catFldrObj.data)) {
                clearInterval(catFldrUntrvl);
                if (catFldrObj.data.indexOf("connection Failed") > -1) {
                    displayStatusMessage("error", "max_user_connections. reload (F5)");
                }
                else {
                    albumInfo = JSON.parse(catFldrObj.data);
                    
                    displayCommonHeader(albumInfo);

                    setBreadcrumbs(albumInfo);
                    customizeAlbumFooter();
                    addTrackbackLinks();
                    showLogin();

                    //setAlbumPageColor(albumInfo.RootFolder);

                    if (albumInfo.FolderType == "singleChild")
                        replaceHtml(ele("seoPageName"), albumInfo.ParentName + "/" + albumInfo.FolderName);
                    else
                        replaceHtml(ele("seoPageName"), albumInfo.FolderName);

                    showLastStaticPageUpdate();

                    showBottomFileCounts(albumInfo);

                    showElement(albumPageFooter);

                    //hideElement(ele("slideshowBottomRowSection"));
                    ele('largeLoadButton').addEventListener('click', function onClick() { loadAlbumPage(currentFolderId, true, "self") });
                    ele('deepSlideshowButton').addEventListener('click', function onClick() { showSlideshowViewer(albumInfo, 0, true) });
                    ele('slideShowClick').addEventListener('click', function onClick() { showSlideshowViewer(albumInfo, 0, false) });
                    ele('albumBottomfileCount').addEventListener('click', () => { updateFolderCount(currentFolderId, albumInfo.FolderPath) });
                    ele('folderCommentButton').addEventListener('click', () => { showFolderCommentsDialog(currentFolderId, albumInfo.FolderName); });
                    ele('folderUpButton').addEventListener('click', () => { getNavg( 'up'); });
                    ele('nextButton').addEventListener('click', () => { getNavg('next'); });
                    ele('backButton').addEventListener('click', () => { getNavg('previous'); });

                    // if ((albumInfo.RootFolder == "porn") || (albumInfo.RootFolder == "sluts")) { determinePornStatus(); };
                }
            }
        }, 32);
    } catch (e) {
        logOggleError("CAT", e, "get albumPage info");
    }
}

function getNavg(direction) {
    try {
        let navr = new Object;
        getDataFromServer("php/getNextPreviousAlbum.php?folderId=" + currentFolderId + "&direction=" + direction, navr);
        let navintrv = setInterval(() => {
            if (!isNullorUndefined(navr.data)) {
                clearInterval(navintrv); 
                let navgData = JSON.parse(navr.data);
                window.location.href = "album.html?folder=" + navgData;
            }
        }, 200);
    } catch (e) {
        logOggleError("CAT", e, "get NextPrevious Album. direction: " + direction);
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
        logOggleError("CAT", e, "set breadcrumbs");
    }
}

function customizeAlbumFooter() {    
    replaceHtml(ele("albumPageFooter"), `    
    <div class='flexContainer'>
        <div id='footerCol1' class='footerCol'></div>
        <div id='footerCol2' class='footerCol'>
            <div class='clickable' onclick='window.location.href="mailto:curtishrhodes@hotmail.com"'>email site developer</div>
        </div>
        <div id='footerCol3' class='footerCol'>
            <div class='clickable' onclick='showOggleFeedbackDialog()'>Feedback</div>
        </div>
        <div id='footerCol4' class='footerCol'>
        </div>
        <div id='footerCol5' class='footerCol'>
        </div>
        <div id='footerCol6' class='footerCol'>
        </div>
        <div id='footerCol7' class='footerCol rightMostfooterColumn'>
        </div>
    </div>
    <div class='footerFooter'>
        <div class='footerFooterMessage' id='footerMessage1'></div>
        <div class='footerFooterMessage' id='footerMessage2'></div>
        <div class='forceRight'>
            <div>
                Copyright &copy; 2025 Ogglebooble.com
                <div class='inline clickable' onclick='callIntelDesign()' ">Intelligent Design SoftWare</div>
        </div>
    </div>`); 

    replaceHtml(ele("footerCol4"), `<div class='clickable' onclick='showCategoryList("footer")'>Category List</div>`);
    replaceHtml(ele("footerCol4"), "<div class='clickable' onclick='sortAlbum()'>Sort</div>"); 
    //<div class='clickable' onclick='footerItemClick(3)'>Babes List</div>
    //<div class='clickable' onclick='helpMe()'>help me</div>
    //<div class='clickable' onclick='oggleIsFree("footer")'>OggleBooble is free</div>
    //<div class='clickable' onclick='window.location.href=\"index.html?spa=porn'>OgglePorn</div>
    //<div class='clickable' onclick='window.location.href=\"index.html?spa=playboy' '_blank'>Centerfolds</div>
    //<div class='clickable' onclick='sortAlbum()'>sort</div>
    //<div id='footerCol3' class='footerCol'><div class='clickable' onclick='showOggleFeedbackDialog()'>Feedback</div>

    if (sessionStorage.VisitorId == adminVisitorId) {
        showPageHits(currentFolderId)
        // ele('footerSortItem').addEventListener('click', () => { sortAlbum() });
        // ele("footerCol3").insertAdjacentHTML("beforeend", "<div class='clickable' onclick='showOggleFeedbackDialog(" + a lbumInfo.Id + ")'>Feedback</div>");
    }
}

function showBottomFileCounts(albumInfo) {   
    var txtNode = albumInfo.FolderType;
    // if (isNullorUndefined(albumInfo.Links)) linksCount = 0;
    switch (albumInfo.FolderType) {
        case "multiFolder":
        case "singleParent":
        case "multiChild":
        case "stepParent":
            ele('slideShowClick').style.display = "none";
            let tt = Number((Number(albumInfo.TotalChildFiles) + Number(albumInfo.Links)));
            let sf = Number((Number(albumInfo.SubFolders) + Number(albumInfo.Stepchildren)));
            if (albumInfo.Files == "0") {
                if (tt != 0) {
                    txtNode = sf.toLocaleString() + "/" + tt.toLocaleString();
                }
                else {
                    txtNode = sf.toLocaleString();
                }
            }
            // txtNode = Number(albumInfo.SubFolders) + "/" + Number((Number(albumInfo.TotalChildFiles) + Number(albumInfo.Links))).toLocaleString();
            else {
                txtNode = "{" + albumInfo.Files + "}  " + albumInfo.SubFolders + "/" + Number((Number(albumInfo.TotalChildFiles) + Number(albumInfo.Links))).toLocaleString();
                //txtNode = "{" + albumInfo.Files + "}  " + albumInfo.SubFolders + "/" + Number((Number(albumInfo.TotalChildFiles) + Number(albumInfo.Links))).toLocaleString();
            }
            break;
        case "multiModel":
        case "singleModel":
        case "stepChild":
        case "singleChild":
            txtNode = (Number(albumInfo.Files) + Number(albumInfo.Links)).toLocaleString();
            break;
        default:
            txtNode = "error: " + albumInfo.FolderType;  
    }
    replaceHtml(ele('albumBottomfileCount'), txtNode);
    //albumBottomfileCount.appendChild(document.createTextNode(txtNode));
    //txtNode = Number(childFilesCount) + Number(linksCount).toLocaleString();
}

function addTrackbackLinks() {
    try {
        let trkbk = new Object;
        getDataFromServer('php/fetchAll.php?schema=oggleboo_Danni&query=Select * from TrackbackLink where CatFolderId=' + currentFolderId, trkbk);
        let wait = setInterval(function () {
            if (ready(trkbk.data)) {
                clearInterval(wait);
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
                                    logOggleError("SWT", "site code: " + obj.SiteCode, "getAlbumPageInfo/TrackBackItems");
                            }
                        }
                    });
                }
            }
        }, 200);
    } catch (e) {
        logOggleError("CAT", e, "add trackback links");
    }
}

function showLastStaticPageUpdate() {
    try {
        let lspu = new Object;
        getDataFromServer("php/fetch.php?schema=oggleboo_Danni&query=select StaticFile, date_format(StaticFileUpdate,'%m %d %y') Updated from FolderDetail where FolderId=" + currentFolderId, lspu);
        let stpuiv = setInterval(() => {
            if (ready(lspu.data)) {
                clearInterval(stpuiv);
                if (lspu.data.lastIndexOf("error") > - 1) {
                    logOggleError("AJX", e, "folder click");
                }
                else {
                    let staticFileData = JSON.parse(lspu.data);
                    if (staticFileData.Updated != null)
                        document.createElement("footerCol5").appendChild(document.createTextNode("<div class='clickable' onclick='window.open(\"" +
                            staticFileData.StaticFile + "\")'>last updated: " + staticFileData.Updated + "</div>"));
                }
            }
        }, 200);
    } catch (e) {
        logOggleError("CAT", e, "show static page");
    }
}

function updateFolderCount() { }