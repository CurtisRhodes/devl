 let currentFolderId, currentImagelinkId, currentIsLargeLoad;
const posterFolder = 'https://ogglebooble.com/danni/posters/';

function loadAlbumPage(folderId, islargeLoad, calledFrom) {
    currentFolderId = folderId;
    currentIsLargeLoad = islargeLoad;
    getAlbumImages(folderId, islargeLoad);
    getAlbumPageInfo(folderId, islargeLoad);
    verifyUser(folderId, calledFrom);
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
            sql = `select * from VwLinks where FolderId = ` + folderId + ` union
                   select * from VwLinks where Parent = ` + folderId + ` union
                   select * from VwLinks where gParent = ` + folderId;

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
                        folderCounts = "(" + obj.SubFolderCount + "/" + (Number(obj.FileCount) + Number(obj.TotalChildFiles)).toLocaleString() + ")";

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

                //displayHeader(numericPageContext);
                $('header').html(headerHtml());
                displayFooter(catfolder.RootFolder);

                setColors(catfolder.RootFolder, catfolder.FolderName);

                setBreadcrumbs(catfolder);

                addTrackbackLinks(folderId);

                showPageHits(folderId);

                $('#footerPageType').html(catfolder.FolderType);

                showBottomFileCounts(catfolder.FolderType, catfolder.Files, catfolder.SubFolders, catfolder.TotalChildFiles);

                if (islargeLoad) {
                    $('#largeLoadButton').hide();
                }

                $('#largeLoadButton').on("click", function () { loadAlbumPage(folderId, true, "self") });
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

                    if (currentIsLargeLoad) {
                        $('#breadcrumbContainer').html("<div class='inactiveBreadCrumb' " +
                            "onclick='loadAlbumPage(" + catfolder.Id + ",false,\"self\")'>return to " + breadcrumbItem[0].FolderName + "</div>");
                    }
                    else {
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
                        case "magazine":
                        case "muses":
                        case "plus":
                            $('.inactiveBreadCrumb').css({ "color": "wheat" });
                            $('.activeBreadCrumb').css("color", "#f2e289");
                            break;
                        case "cybergirl":
                            $('.inactiveBreadCrumb').css({ "color": "#000" });
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

function setTopHeaderRow(pageContext) {
    switch (pageContext) {
        case "OggleDashboard": {
            $('#breadcrumbContainer').html("<a class='activeBreadCrumb' href=\"javascript:setLeftMenu('normal');showDefaultWorkArea()\">Add Images</a>");
            $('#breadcrumbContainer').append("<a class='activeBreadCrumb' href=\"javascript:setLeftMenu('admin');showDefaultWorkArea()\">Admin</a>");
            $('#breadcrumbContainer').append("<a class='activeBreadCrumb' href=\"javascript:showReportsSection();\">Reports</a>");
            break;
        }
        case "admin":
            //$('#breadcrumbContainer').html("<a class='activeBreadCrumb' href=\"javascript:setLeftMenu('normal');showDefaultWorkArea()\">Brucheum live page</a>");
            //$('#breadcrumbContainer').append("<a class='activeBreadCrumb' href=\"javascript:setLeftMenu('admin');showDefaultWorkArea()\">OggleBooble</a>");
            //$('#breadcrumbContainer').append("<a class='activeBreadCrumb' href=\"javascript:showReportsSection();\">Intelligent Design</a>");
            break;
        case "cybergirl":
            $('#topRowLeftContainer').html(
                "<span onclick='headerMenuClick(\"cybergirl\",1132)'>centerfolds, </span>\n" +
                "<span onclick='headerMenuClick(\"cybergirl\",6368)'>playboy plus, </span>\n" +
                "<span onclick='headerMenuClick(\"cybergirl\",6095)'>muses, </span>\n" +
                "<span onclick='headerMenuClick(\"cybergirl\",3128)'>international, </span>\n" +
                "<span onclick='headerMenuClick(\"cybergirl\",9306)'>more</span>\n"
            );
            break;
        case "playboy":
            $('#topRowLeftContainer').html(
                "<span onclick='headerMenuClick(\"playboy\",3796)'>cybergirls, </span>\n" +
                "<span onclick='headerMenuClick(\"playboy\",6368)'>playboy plus, </span>\n" +
                "<span onclick='headerMenuClick(\"playboy\",6095)'>muses, </span>\n" +
                "<span onclick='headerMenuClick(\"playboy\",3128)'>international, </span>\n" +
                //"<span onclick='headerMenuClick(\"playboyIndex\",6076)'>specials, </span>\n" +
                //"<span onclick='headerMenuClick(\"playboyIndex\",3393)'>lingerie, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",9306)'>more</span>\n"
            );
            break;
        case "playboyIndex":
            $('#topRowLeftContainer').html(
                "<span onclick='headerMenuClick(\"playboyIndex\",3796)'>cybergirls, </span>\n" +
                //"<span onclick='headerMenuClick(\"playboyIndex\",4015)'>pictorials, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",6368)'>playboy plus, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",6095)'>muses, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",3128)'>international, </span>\n" +
                //"<span onclick='headerMenuClick(\"playboyIndex\",6076)'>specials, </span>\n" +
                //"<span onclick='headerMenuClick(\"playboyIndex\",3393)'>lingerie, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",9306)'>more</span>\n"
            );
            $('#breadcrumbContainer').html(
                "<span onclick='headerMenuClick(\"playboyIndex\",621)'>1950's, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",638)'>1960's, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",639)'>1970's, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",640)'>1980's, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",628)'>1990's, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",641)'>2000's, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",513)'>2010's, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",4128)'>2020's </span>\n"
            );
            //"<a href='javascript:rtpe(\"PBB\",72,\"magazine covers\",1986)'>magazine covers</a>,\n" +
            //"<a href='javascript:rtpe(\"PBB\",72,\"Pmoy\",4013)'>Pmoy</a>,\n" +
            //"<a href='javascript:rtpe(\"PBB\",72,\"Pmoy\",4932)'>just centerfolds</a>\n");
            //$('#breadcrumbContainer').html(
            //"<span onclick='headerMenuClick(\"centerfold\",3796)'>cybergirls, </span>\n"

            //    "<span onclick='headerMenuClick('playboyCarousel',4015)'>pictorials, </span>\n" +
            //    "<a href='javascript:rtpe(\"PYC\",72,\"Playboy\",472)'>Playboy</a>,\n" +
            //    "<a href='javascript:rtpe(\"PYC\",72,\"1950\",621)'>1950's</a>,\n" +
            //    "<a href='javascript:rtpe(\"PYC\",72,\"1960\",638)'>1960's</a>,\n" +
            //    "<a href='javascript:rtpe(\"PYC\",72,\"1970\",639)'>1970's</a>,\n" +
            //    "<a href='javascript:rtpe(\"PYC\",72,\"1980\",640)'>1980's</a>,\n" +
            //    "<a href='javascript:rtpe(\"PYC\",72,\"1990\",628)'>1990's</a>,\n" +
            //    "<a href='javascript:rtpe(\"PYC\",72,\"2000\",641)'>2000's</a>,\n" +
            //    "<a href='javascript:rtpe(\"PYC\",72,\"2010\",513)'>2010's</a>,\n" +
            //    "<a href='javascript:rtpe(\"PYC\",72,\"2020\",4128)'>2020's</a>\n");
            // <div id='badgesContainer' class='badgesSection'></div>\n" +
            // <div id='hdrBtmRowSec3' class='hdrBtmRowOverflow'></div>\n" +
            break;
        default: {
            console.log("no top header row set for: " + headerContext);
        }
    }
}

function setColors(rootFolder, folderName) {
    switch (rootFolder) {
        case "archive":
            document.title = folderName + " : OggleBooble";
            $('#fancyHeaderTitle').html("OggleBooble");
            $('#topRowLeftContainer').html("Home of the Big Naturals");
            $('#topRowRightContainer').append(bannerLink('every playboy centerfold', 'https://ogglebooble.com/index.html?spa=playboy'));
            break;
        case "playboy":
        case "centerfold":
        case "magazine":
            document.title = folderName + " : Playboy Centerfolds : OggleBooble";
            $('#fancyHeaderTitle').html("Every Playboy Centerfold");
            $('body').css({ "background-color": "#538DA1", "color": "#fff" });
            $('#topRowLeftContainer').css({ "color": "wheat" });
            $('#oggleHeader').css("background-color", "#3F8293");
            $('#carouselContainer').css("background-color", "#bdbeb8");
            break;
        case "plus":
            document.title = folderName + " : Playboy Plus : OggleBooble";
            $('body').css({ "background-color": "#99cc00", "color": "#fff" });
            $('#oggleHeader').css("background-color", "#d2ff4d");
            break;
        case "muses":
            document.title = folderName + " : Playboy Muses : OggleBooble";
            $('#fancyHeaderTitle').html("Every Playboy Centerfold");
            break;
        case "cybergirl":
            document.title = folderName + " : Cybergirls : OggleBooble";
            $('#fancyHeaderTitle').html("Playboy Cybergirls");
            $('body').css({ "background-color": "#E18C2F", "color": "#fff" });
            $('#oggleHeader').css("background-color", "#F0B76A");
            break;
        case "bond":
            document.title = folderName + " : Bond Girls : OggleBooble";
            $('#divSiteLogo').attr("src", "https://common.ogglebooble.com/img/boogle007.png");
            $('#fancyHeaderTitle').html("Bond Girls");
            $('#topRowRightContainer').append(bannerLink('back to OggleBooble', 'https://ogglebooble.com/index.html'));
            $('#topRowRightContainer').append(bannerLink('every playboy centerfold', 'https://ogglebooble.com/index.html?spa=playboy'));
            changeFavoriteIcon("bond");
            $('#oggleHeader').css("background-color", "#ffcc66");
            $('body').css({ "background-color": "#000", "color": "#fff" });
            break;
        case "sluts":
            document.title = folderName + " : OggleSluts";
            $('#fancyHeaderTitle').html("sluts ");
            $('#oggleHeader').css("background-color", "deeppink");
            $('body').css("background-color", "palevioletred");
            $('#divSiteLogo').attr("src", "https://common.ogglebooble.com/img/csLips02.png");
            $('#hdrBtmRowSec3').append(bannerLink('back to OgglePorn', 'https://ogglebooble.com/index.html?spa=porn'));
            $('#hdrBtmRowSec3').append(bannerLink('back to OggleBooble', 'https://ogglebooble.com/index.html'));
            changeFavoriteIcon("porn");
            $('#topRowLeftContainer').html(
                "<span onclick='headerMenuClick(\"porn\",1174)'>big titters gone bad, </span>\n" +
                "<span onclick='headerMenuClick(\"porn\",3728)'>blonde cocksuckers, </span>\n" +
                "<span onclick='headerMenuClick(\"porn\",4271)'>retro porn stars, </span>\n" +
                "<span onclick='headerMenuClick(\"porn\",3739)'>exploited teens<span>\n");
            //"<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"sluts\",2677)'>cocksucker lipps</a>,\n" +
            //"<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"sluts\",3730)'>amatures</a>,\n" +
            //"<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"sluts\",3731)'>sweet nasty girls</a>,\n" +
            //"<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"sluts\",4022)'>big girls</a>,\n" +
            //"<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"sluts\",4198)'>milf cocksuckers</a>,\n" +
            break;
        case "soft":
            document.title = folderName + " : OggleSoftcore";
            $('#divSiteLogo').attr("src", "https://common.ogglebooble.com/img/redwoman.png");
            $('#fancyHeaderTitle').html("Oggle softcore");
            $('#hdrBtmRowSec3').append(bannerLink('back to OggleBooble', 'https://ogglebooble.com'));
            $('#hdrBtmRowSec3').append(bannerLink('OgglePorn', 'https://ogglebooble.com/index.html?spa=porn'));
            $('#oggleHeader').css("background-color", "deeppink");
            $('body').css({ "background-color": "darksalmon", "color": "#fff" });
            $('#topRowLeftContainer').html(
                "<span onclick='headerMenuClick(\"soft\",379)'>pussy, </span>\n" +
                "<span onclick='headerMenuClick(\"soft\",420)'>boob suckers, </span>\n" +
                "<span onclick='headerMenuClick(\"soft\",498)'>big tit lezies, </span>\n" +
                "<span onclick='headerMenuClick(\"soft\",357)'>fondle, </span>\n" +
                "<span onclick='headerMenuClick(\"soft\",397)'>kinky, </span>\n" +
                "<span onclick='headerMenuClick(\"soft\",411)'>naughty behaviour</span>\n");
            break;
        default:
            document.title = folderName + " : OggleBooble";
    }
}

function showBottomFileCounts(folderType, fileCount, subfolderCount, childFilesCount) {
    switch (folderType) {
        case "multiFolder":
        case "singleParent":
            $('#slideShowClick').hide();
            $('#largeLoadButton').show();
            $('#deepSlideshowButton').show();
            if (fileCount > 0)
                $('#albumBottomfileCount').html("{" + fileCount + "}  " + subfolderCount + "/" + Number(childFilesCount).toLocaleString());
            else
                $('#albumBottomfileCount').html(subfolderCount + "/" + Number(childFilesCount).toLocaleString());
            break;
        case "singleModel":
        case "multiModel":
        case "singleChild":
            $('#largeLoadButton').hide();
            $('#deepSlideshowButton').hide();
            $('#albumBottomfileCount').html(fileCount);
            break;
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

