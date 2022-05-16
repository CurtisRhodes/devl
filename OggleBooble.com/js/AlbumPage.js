let currentFolderId, currentImagelinkId;
const posterFolder = 'https://ogglebooble.com/danni/posters/';

function loadAlbumPage(folderId, islargeLoad) {
    currentFolderId = folderId;
    getAlbumImages(folderId, islargeLoad);
    getAlbumPageInfo(folderId, islargeLoad);
    verifyUser("album page");
}

/*-- php -----------------------------------*/
let getAlbumImagesFail = 0;
function getAlbumImages(folderId, islargeLoad) {
    try {
        $('#albumPageLoadingGif').css("height", "27px");
        $('#albumPageLoadingGif').show();
        $('#imageContainer').html("");
        let sql = "select * from VwLinks where FolderId=" + folderId + " order by SortOrder";
        if (islargeLoad)
            sql = "select * from VwLinks where FolderId in (select Id from CategoryFolder where Parent=" + folderId + ")";

        $.getJSON('php/yagdrasselFetchAll.php?query=' + sql,
            function (data) {
                if (data.indexOf("Failed") > -1) {
                    if (++getAlbumImagesFail > 5)
                        logOggleError("AJX", catfolder, "getAlbumImages failed to connect", "getAlbumImages");
                    else
                        getAlbumImages(folderId, islargeLoad);
                }
                // let vlinks = JSON.parse(data);
                $.each(data, function (idx, vLink) {
                    loadaSingleImage(vLink, islargeLoad);
                });
                if (islargeLoad)
                    $('#albumPageLoadingGif').hide();
                else
                    getSubFolders(folderId);
            });
    }
    catch (e) {
        $('#albumPageLoadingGif').hide();
        logOggleError("CAT", folderId, e, "getAlbumImages");
    }
}

function loadaSingleImage(vLink, islargeLoad) {
    let imgSrc = 'https://common.ogglebooble.com/img/redballon.png';
    try {
        if (!isNullorUndefined(vLink.FileName))
            imgSrc = settingsImgRepo + "/" + vLink.FileName.replace(/'/g, '%27');

        if (vLink.FileName.endsWith("mpg") || vLink.FileName.endsWith("mp4")) {
            $('#imageContainer').append(`
            <div class='intividualImageContainer' oncontextmenu='oggleContextMenu("video","` + vLink + `)'>
              <video id='" + vLink.LinkId + "' controls='controls' class='thumbImage' poster='` + posterFolder + vLink.Poster + `'>
               <source src='` + imgSrc + `' type='video/mp4' label='label'></video></div>`);
        }
        else {
            $('#imageContainer').append(`<div id='` + vLink.LinkId + `' class='intividualImageContainer'>
            <img id='lt'`+ vLink.LinkId + `' class='thumbImage' src='` + imgSrc + `' onerror='imageError(` + vLink.FolderId + `,"` + vLink.LinkId + `","album")'
            oncontextmenu='oggleContextMenu("image","` + vLink.LinkId + `",` + vLink.FolderId + `,"` + imgSrc + `")'
            onclick='viewImage("` + imgSrc + `","` + vLink.LinkId + `",` + islargeLoad + `)'/></div>`);
            if (vLink.FolderId !== vLink.SrcId) {
                $('#' + vLink.LinkId + '').append(`<div class='knownModelIndicator'>
                <img src='https://common.ogglebooble.com/img/foh01.png' title='`+ vLink.SrcFolder + `' 
                    onclick='window.open(\"https://ogglebooble.com/album.html?folder=` + vLink.SrcId + `\")'/></div>`);
            }
        }
    } catch (e) {
        logOggleError("CAT", vLink.Id, e, "load a single image");
    }
}

function getSubFolders(folderId) {
    try {
        $.getJSON("php/yagdrasselFetchAll.php?query=select * from VwDirTree where Parent=" + folderId +
            " order by SortOrder,FolderName", function (data) {
                $.each(data, function (index, obj) {
                    let randomId = create_UUID();
                    let folderCounts = "(" + Number(obj.FileCount).toLocaleString() + ")";
                    if (obj.SubFolderCount > 0)
                        folderCounts = "(" + obj.SubFolderCount + "/" + Number(obj.FileCount + obj.TotalChildFiles).toLocaleString() + ")";

                    let imgSrc = 'https://common.ogglebooble.com/img/RenStimpy8.jpg'
                    if (!isNullorUndefined(obj.FolderImage))
                        imgSrc = settingsImgRepo + "/" + obj.FolderImage.replace(/'/g, '%27');
                    $('#imageContainer').append(`<div class='subFolderContainer'
                        oncontextmenu='oggleContextMenu("subfolder","","` + obj.Id + `","` + imgSrc + `")'
                        onclick='folderClick(` + obj.Id + `,` + obj.IsStepChild + `)'>
                        <img id='` + randomId + `' class='folderImage' alt='' src='` + imgSrc + `' onerror=
                            'imageError(` + folderId + `,"` + obj.linkId + `","` + imgSrc + `","subFolder")'/>
                        <div class='defaultSubFolderImage'>` + obj.FolderName + `</div>
                        <span Id='fc` + obj.FolderId + `'>` + folderCounts + `</span></div>`);
                });
                resizeAlbumPage();
                //resizeAlbumPage();
            });
    } catch (e) {
        $('#albumPageLoadingGif').hide();
        logOggleError("CAT", folderId, e, "get subFolders");
    }
}

async function getAlbumPageInfo(folderId, islargeLoad) {
    try {
        let infoStart = Date.now();
        if (isNullorUndefined(folderId)) {
            alert("get AlbumPage info: folderId.isNullorUndefined: " + folderId);
            return;
        }
        $.ajax({
            url: 'php/yagdrasselFetch.php?query=Select * from CategoryFolder where Id=' + folderId,
            success: function (data) {
                let catfolder = JSON.parse(data);
                // let catfolder = data;
                $('#albumPageLoadingGif').hide();
                $('#albumTopRow').show();
                $('#seoPageName').html(catfolder.FolderName);

                displayHeader(catfolder.RootFolder);
                displayFooter(catfolder.RootFolder);

                setColors(catfolder.RootFolder, catfolder.FolderName);

                setBreadcrumbs(catfolder);

                addTrackbackLinks(folderId);

                showPageHits(folderId);

                $('#footerPageType').html(catfolder.FolderType);

                // BottomfileCount
                switch (catfolder.FolderType) {
                    case "multiFolder":
                    case "singleParent":
                        $('#slideShowClick').hide();
                        $('#largeLoadButton').show();
                        $('#deepSlideshowButton').show();
                        if (catfolder.Files > 0)
                            $('#albumBottomfileCount').html("{" + catfolder.Files + "}" + catfolder.SubFolders + "/" + Number(catfolder.TotalChildFiles).toLocaleString());
                        else
                            $('#albumBottomfileCount').html(catfolder.SubFolders + "/" + Number(catfolder.TotalChildFiles).toLocaleString());
                        break;
                    case "singleModel":
                    case "multiModel":
                    case "singleChild":
                        $('#largeLoadButton').hide();
                        $('#deepSlideshowButton').hide();
                        $('#albumBottomfileCount').html(catfolder.Files);
                        break;
                }

                if (islargeLoad) {
                    $('#largeLoadButton').hide();
                }

                $('#largeLoadButton').on("click", function () { getAlbumImages(folderId, true) });
                $('#deepSlideshowButton').on("click", function () { showSlideshowViewer(folderId, 0, true) });
                $('#slideShowClick').on("click", function () { showSlideshowViewer(folderId, 0, false) });

                $('#albumBottomfileCount').show();
                $('#albumBottomfileCount').on("click", function () { updateFolderCount(folderId, catfolder.FolderPath) });

                $('#feedbackButton').on("click", function () {
                    showFeedbackDialog(folderId, catfolder.FolderName);
                });

                logPageHit(folderId);
            },
            error: function (jqXHR) {
                $('#albumPageLoadingGif').hide();
                logOggleError("XHR", folderId, getXHRErrorDetails(jqXHR), "get albumPage info");
            }
        });
        let delta = (Date.now() - infoStart) / 1000;
        console.log("get AlbumPageInfo took: " + delta.toFixed(3));
    } catch (e) {
        logOggleError("CAT", folderId, e, "get albumPage info");
    }
}

let breadcrumbFetchFail = 0;
function setBreadcrumbs(catfolder) {
    try {
        //$('#aboveImageContainerMessageArea').html('loading breadcrumbs');
        $('#breadcrumbContainer').html("<img style='height:27px' src='https://common.ogglebooble.com/img/loader.gif'/>");
        $.ajax({
            url: "php/yagdrasselFetchAll.php?query=Select * from VwDirTree",
            success: function (data) {
                if (data == false) {
                    if (++breadcrumbFetchFail > 5) {
                        logOggleError("AJX", catfolder, "setBreadcrumbs data==false", "setBreadcrumbs");
                        $('#breadcrumbContainer').html("setBreadcrumbs data==false");
                    }
                    else
                        setBreadcrumbs(catfolder);
                }
                if (data.indexOf("Failed") > -1) {
                    if (++breadcrumbFetchFail > 5) {
                        $('#breadcrumbContainer').html("setBreadcrumbs failed to connect");
                        logOggleError("AJX", catfolder, "setBreadcrumbs failed to connect", "setBreadcrumbs");
                    }
                    else
                        setBreadcrumbs(catfolder);
                }
                else {
                    let dirTreeArray = JSON.parse(data);
                    let breadcrumbItem = dirTreeArray.filter(function (item) { return (item.Id === catfolder.Id) && (item.IsStepChild == 0); });
                    if (breadcrumbItem.length == 0) {
                        $('#breadcrumbContainer').html("no good");
                        return;
                    }

                    switch (catfolder.FolderType) {
                        case "singleModel":
                        case "singleParent":  // showFileDetailsDialog
                            $('#breadcrumbContainer').html("<div class='inactiveBreadCrumb' " +
                                "onclick='showFileDetailsDialog(" + catfolder.Id + ")'>" + breadcrumbItem[0].FolderName + "</div>");
                            break;
                        default: // showFolderInfoDialog
                            $('#breadcrumbContainer').html("<div class='inactiveBreadCrumb' " +
                                "onclick='showFolderInfoDialog(" + catfolder.Id + ")'>" + breadcrumbItem[0].FolderName + "</div>");
                    }

                    let parent = breadcrumbItem[0].Parent;

                    while (parent > 0) {
                        breadcrumbItem = dirTreeArray.filter(function (item) { return (item.Id === parent) && (item.IsStepChild == 0); });
                        if (isNullorUndefined(breadcrumbItem)) {
                            parent = 99;
                            $('#breadcrumbContainer').prepend("item: " + parent + " isNullorUndefined");
                        }
                        else {
                            if (breadcrumbItem.length == 0) {
                                $('#breadcrumbContainer').prepend("no good " + parent + " length == 0");
                                parent = 99;
                            }
                            else {
                                //addBreadcrumb(parent, breadcrumbItem[0].FolderName, "activeBreadCrumb"));
                                $('#breadcrumbContainer').prepend("<div class='activeBreadCrumb' " +
                                    "onclick='window.location.href=\"https://ogglebooble.com/album.html?folder=" +
                                    breadcrumbItem[0].Id + "\"'>" + breadcrumbItem[0].FolderName + "</div>");
                                parent = breadcrumbItem[0].Parent;
                            }
                        }
                    }

                    switch (catfolder.RootFolder) {
                        case "playboy":
                        case "centerfold":
                        case "cybergirl":
                        case "magazine":
                        case "muses":
                        case "plus":
                            $('.inactiveBreadCrumb').css({ "color": "wheat" });
                            $('.activeBreadCrumb').css("color", "#f2e289");
                            break;
                    }
                }
            },
            error: function (jqXHR) {
                $('#albumPageLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                $('#breadcrumbContainer').html(errMsg);
            }
        });
    } catch (e) {
        logOggleError("CAT", folderId, e, "set breadcrumbs");
    }
}

function setColors(rootFolder, folderName) {
    switch (rootFolder) {
        case "playboy":
        case "centerfold":
        case "magazine":
        case "muses":
        case "plus":
            document.title = folderName + " : OggleBooble";
            $('body').css({ "background-color": "#bdbeb8", "color": "#fff" });
            $('.inactiveBreadCrumb').css({ "color": "wheat" });
            $('.activeBreadCrumb').css("color", "#f2e289");
            $('#topRowLeftContainer').css({ "color": "wheat" });
            $('#oggleHeader').css("background-color", "#ff6600");
            $('#carouselContainer').css("background-color", "#bdbeb8");
            break;
        case "cybergirl":
            document.title = folderName + " : OggleBooble";
            $('body').css({ "background-color": "rebeccapurple", "color": "#fff" });
            $('.inactiveBreadCrumb').css({ "color": "wheat" });
            $('.activeBreadCrumb').css("color", "#f2e289");
            $('#topRowLeftContainer').css({ "color": "wheat" });
            $('#oggleHeader').css("background-color", "purple");
            break;
        case "bond":
            document.title = folderName + " : OggleBooble";
            displayHeader("bond");
            displayFooter("porn");
            $('#oggleHeader').css("background-color", "#ffcc66");
            $('body').css({ "background-color": "#000", "color": "#fff" });
            break;
        case "porn":
            document.title = folderName + " : OgglePorn";
            $('#oggleHeader').css("background-color", "darkorange");
            $('body').css({ "background-color": "darksalmon", "color": "#fff" });
            $('#carouselContainer').css("background-color", "darksalmon");
            //$('#topHeaderRow').css("color", "#f2e289");
            //$('#activeBreadCrumb').css("color", "#f2e289");
            //$('#carouselContainer').css("background-color", "darksalmon");
            displayHeader("porn");
            displayFooter("porn");
            break;
        case "sluts":
            document.title = folderName + " : OggleSluts";
            $('#oggleHeader').css("background-color", "deeppink");
            $('body').css("background-color", "palevioletred");
            displayHeader("sluts");
            displayFooter("porn");
            break;
        case "soft":
            document.title = folderName + " : OggleSoftcore";
            $('#oggleHeader').css("background-color", "deeppink");
            $('body').css({ "background-color": "darksalmon", "color": "#fff" });
            displayHeader("soft");
            displayFooter("porn");
            break;
        default:
            document.title = folderName + " : OggleBooble";
            displayHeader("oggleAlbum");
            displayFooter("oggleAlbum");
    }
}

function addTrackbackLinks(folderId) {
    try {
        $.ajax({
            url: 'php/yagdrasselFetchAll.php?query=Select * from TrackbackLink where CatFolderId=' + folderId,
            success: function (data) {
                let trackBackItems = JSON.parse(data);
                if ((trackBackItems.length > 0)) {
                    $('#trackbackContainer').css("display", "inline-block");
                    $.each(trackBackItems, function (idx, obj) {
                        if (obj.LinkStatus != "hide") {
                            switch (obj.SiteCode) {
                                case "FRE":
                                    $('#trackbackLinkArea').append("<div class='trackBackLink'><a href='" + obj.Href + "' target=\"_blank\">" + albumInfo.FolderName + " Free Porn</a></div>");
                                    break;
                                case "BAB":
                                    $('#trackbackLinkArea').append("<div class='trackBackLink'><a href='" + obj.Href + "' target=\"_blank\">Babepedia</a></div>");
                                    break;
                                case "BOB":
                                    $('#trackbackLinkArea').append("<div class='trackBackLink'><a href='" + obj.Href + "' target=\"_blank\">Boobpedia</a></div>");
                                    break;
                                case "IND":
                                    $('#trackbackLinkArea').append("<div class='trackBackLink'><a href='" + obj.Href + "' target=\"_blank\">Indexxx</a></div>");
                                    break;
                                default:
                                    logError("SWT", folderId, "site code: " + obj.SiteCode, "getAlbumPageInfo/TrackBackItems");
                            }
                        }
                    });
                }
            },
            error: function (jqXHR) {
                logOggleError("XHR", folderId, getXHRErrorDetails(jqXHR), "add trackback links");
            }
        });
    } catch (e) {
        logOggleError("CAT", folderId, e, "add trackback links");
    }
}

function folderClick(folderId, isStepChild) {
    try {
        if (isStepChild == 1)
            window.open("https://ogglebooble.com/album.html?folder=" + folderId, "_blank");  // open in new tab
        else {
            // report event pare hit
            window.location.href = "https://ogglebooble.com/album.html?folder=" + folderId;  //  open page in same window
        }
        //" onclick='rtpe(\"SUB\",\"called from: " + folderId + "\",\"" + folder.DirectoryName + "\"," + folder.FolderId + ")'>\n" +
    } catch (e) {
        logOggleError("CAT", folderId, e, "folder click");
    }
}

