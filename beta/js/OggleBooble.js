﻿const settingsImgRepo = 'https://ogglefiles.com/danni/';
const messageBoxSlideSpeed = 66;
let busy = false,, itemIndex = -1, listboxActive = false, limit = 11, skip = 0;

/*-- click events -----------------------------------*/
function resetOggleHeader(folderId, rootFolder) {
    hdrFolderId = folderId;
    hdrRootFolder = rootFolder;
    $('#divLoginArea').show();
    //  $('#hdrBtmRowSec3').html("");
    $('#oggleHeaderTitle').html(rootFolder);
    switch (rootFolder) {
        case "boobs":
            $('#hdrBtmRowSec3').append(bannerLink(eventCode, goToFolderId, calledFromFolderId));
            $('#hdrBtmRowSec3').append(addPgLinkButton(3, "big naturals archive"));
            $('#hdrBtmRowSec3').append(addPgLinkButton(3, "big naturals archive"));
        case "root":
        case "index":
        case "archive": {
            //changeFavoriteIcon("redBallon");
            //console.log("changeFavoriteIcon redBallon 1")
            //$('#oggleHeader').switchClass('playboyHeader');
            $('#divSiteLogo').attr("src", "/img/redballon.png");
            $('#oggleHeaderTitle').html("OggleBooble");
            $('#topRowRightContainer').html(addRankerButton("010000000", "big naturals ranker"));
            setHeaderMenu("boobs");
            break;
        }
        case "playboyIndex":
            //$('#oggleHeader').switchClass('playboyHeader');
            document.title = "every Playboy Centerfold : OggleBooble";
            $('#divSiteLogo').attr("src", "/img/playboyBallon.png");
            $('#oggleHeaderTitle').html("<span style='color:#fff;'>every playboy centerfold</span>");
            $('#topRowRightContainer').append(addRankerButton("001000000", "centerfold ranker"));
            $('#hdrBtmRowSec3').append(addPgLinkButton(10326, "Bond Girls"));
            $('#hdrBtmRowSec3').append(bannerLink("back to OggleBooble", 0, folderId));
            //$('#hdrBtmRowSec3').append(addPgLinkButton(3, "big naturals archive"));
            $('#hdrBtmRowSec3').append(bannerLink("Oggle Porn", folderId));
            setHeaderMenu("playboyIndex");
            break;
        case "playboy":
            //$('#oggleHeader').switchClass('boobsHeader', 'playboyHeader');
            $('#oggleHeaderTitle').html("Playboy");
            $('#divSiteLogo').attr("src", "/img/playboyBallon.png");
            $('#topRowRightContainer').append(addRankerButton("001000000", "centerfold ranker"));
            $('#hdrBtmRowSec3').append(bannerLink("back to OggleBooble", folderId));
            //$('#hdrBtmRowSec3').append(addPgLinkButton(3, "big naturals archive"));
            //$('#hdrBtmRowSec3').append(bannerLink(3909, "Oggle Porn"));
            setHeaderMenu("playboy");
            break;
        case "cybergirl":
            //$('#oggleHeader').switchClass('boobsHeader', 'playboyHeader');
            $('#oggleHeaderTitle').html("Cybergirls");
            $('#divSiteLogo').attr("src", "/img/playboyBallon.png");
            $('#topRowRightContainer').append(addRankerButton("000100000", "Cybergirls ranker"));
            // bottom row
            $('#hdrBtmRowSec3').append(bannerLink("back to OggleBooble", folderId));
            $('#hdrBtmRowSec3').append(addPgLinkButton(3, "big naturals archive"));
            $('#hdrBtmRowSec3').append(bannerLink("Oggle Porn", folderId));
            //setHeaderMenu("playboy");
            $('#topHeaderRow').html(
                "<span onclick='headerMenuClick(\"cybergirl\",1132)'>centerfolds, </span>\n" +
                "<span onclick='headerMenuClick(\"cybergirl\",6095)'>muses, </span>\n" +
                "<span onclick='headerMenuClick(\"cybergirl\",6368)'>playboy plus, </span>\n" +
                "<span onclick='headerMenuClick(\"cybergirl\",3128)'>international, </span>\n" +
                "<span onclick='headerMenuClick(\"cybergirl\",9306)'>more</span>\n"
            );
            break;
        case "bond":
            //$('#oggleHeader').switchClass('boobsHeader', 'playboyHeader');
            $('#oggleHeaderTitle').html("Bond Girls");
            $('#divSiteLogo').attr("src", "/img/playboyBallon.png");
            $('#topRowRightContainer').append(addRankerButton("000010000", "Muses ranker"));
            // bottom row
            $('#badgesContainer').append(bannerLink(3908, "back to OggleBooble"));
            //$('#hdrBtmRowSec3').append(addPgLinkButton(3, "big naturals archive"));
            //$('#hdrBtmRowSec3').append(bannerLink(3909, "Oggle Porn"));
            //setHeaderMenu("playboy");
            $('#topHeaderRow').html(
                "<span onclick='headerMenuClick(\"muses\",1132)'>centerfolds, </span>\n" +
                "<span onclick='headerMenuClick(\"muses\",3796)'>cybergirls, </span>\n" +
                "<span onclick='headerMenuClick(\"muses\",6368)'>playboy plus, </span>\n" +
                "<span onclick='headerMenuClick(\"muses\",3128)'>international, </span>\n" +
                "<span onclick='headerMenuClick(\"muses\",9306)'>more</span>\n"
            );
            break;
        case "muses":
            //$('#oggleHeader').switchClass('boobsHeader', 'playboyHeader');
            $('#oggleHeaderTitle').html("muses");
            $('#divSiteLogo').attr("src", "/img/playboyBallon.png");
            $('#topRowRightContainer').append(addRankerButton("000010000", "Muses ranker"));
            // bottom row
            $('#badgesContainer').append(bannerLink("back to OggleBooble", folderId));
            //$('#hdrBtmRowSec3').append(addPgLinkButton(3, "big naturals archive"));
            //$('#hdrBtmRowSec3').append(bannerLink(3909, "Oggle Porn"));
            //setHeaderMenu("playboy");
            $('#topHeaderRow').html(
                "<span onclick='headerMenuClick(\"muses\",1132)'>centerfolds, </span>\n" +
                "<span onclick='headerMenuClick(\"muses\",3796)'>cybergirls, </span>\n" +
                "<span onclick='headerMenuClick(\"muses\",6368)'>playboy plus, </span>\n" +
                "<span onclick='headerMenuClick(\"muses\",3128)'>international, </span>\n" +
                "<span onclick='headerMenuClick(\"muses\",9306)'>more</span>\n"
            );
            break;
        case "plus":
            //$('#oggleHeader').switchClass('boobsHeader', 'playboyHeader');
            $('#oggleHeaderTitle').html("Playboy Plus");
            $('#divSiteLogo').attr("src", "/img/playboyBallon.png");
            $('#topRowRightContainer').append(addRankerButton("000001000", "Muses ranker"));
            // bottom row
            $('#badgesContainer').append(bannerLink("back to OggleBooble", folderId));
            //setHeaderMenu("playboy");
            $('#topHeaderRow').html(
                "<span onclick='headerMenuClick(\"playboyplus\",1132)'>centerfolds, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyplus\",3796)'>cybergirls, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyplus\",6095)'>muses, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyplus\",3128)'>international, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyplus\",9306)'>more</span>\n"
            );
            break;
        case "magazine":
        case "centerfold": {
            //$('#oggleHeader').switchClass('boobsHeader', 'playboyHeader');
            $('#oggleHeaderTitle').html("playboy centerfold");
            $('#divSiteLogo').attr("src", "/img/playboyBallon.png");
            $('#topRowRightContainer').append(addRankerButton("001000000", "centerfold ranker"));
            // bottom row
            $('#hdrBtmRowSec3').append(bannerLink("back to OggleBooble", folderId));
            setHeaderMenu("playboy");
            break;
        }
        case "soft": {
            $('#oggleHeader').switchClass('boobsHeader', 'oggleSoft');
            $('#divSiteLogo').attr("src", "/img/redwoman.png");
            document.title = "softcore : OggleBooble";
            changeFavoriteIcon("soft");
            $('#oggleHeaderTitle').html("OggleSoftcore 2");
            // bottom row
            $('#badgesContainer').append(bannerLink("back to OggleBooble", folderId));
            $('#badgesContainer').append(bannerLink("OgglePorn", folderId));
            $('#badgesContainer').append(addPgLinkButton(440, "porn actresses archive"));
            setHeaderMenu("soft");
            break;
        }
        case "porn": {
            changeFavoriteIcon("porn");
            //console.log("changeFavoriteIcon porn 2")
            $('#oggleHeader').switchClass('boobsHeader', 'pornHeader');
            $('#divSiteLogo').attr("src", "/img/csLips02.png");
            $('#oggleHeaderTitle').html("OgglePorn ");
            $('#topRowRightContainer').html(addRankerButton("000000010", "porn ranker"));
            // bottom row
            $('#badgesContainer').append(bannerLink("back to OggleBooble", folderId));
            $('#badgesContainer').append(addPgLinkButton(440, "porn actresses archive"));
            $('#badgesContainer').append(addPgLinkButton(5233, "softcore"));
            setHeaderMenu("porn");
            break;
        }
        case "sluts":
            changeFavoriteIcon("porn");
            $('#oggleHeader').switchClass('boobsHeader', 'pornHeader');
            $('#divSiteLogo').attr("src", "/img/csLips02.png");
            $('#oggleHeaderTitle').html("PornStar Archive ");
            $('#topRowRightContainer').html(addRankerButton("000000001", "porn star ranker"));
            // bottom row
            $('#badgesContainer').append(bannerLink("back to OggleBooble", folderId));
            $('#badgesContainer').append(bannerLink("back to porn", folderId));
            setHeaderMenu("sluts");
            break;
        default:
            logError("SWT", 1117705, "switch case: " + rootFolder, "reset OggleHeader");
            window.location.href = "Index.html";
    }
}
function addRankerButton(rankerType, labelText) {
    return "<div class='headerBannerButton'>\n" +
        "<div class='clickable' onclick='location.href=\"index.html?spa=3907&bp=" + rankerType + "\"'" +
        "title='Spin through the links to land on random portrait images.'>" + labelText + "</div>" +
        "</div>\n";
}
function addPgLinkButton(folderId, labelText) {
    return "<div class='headerBannerButton'>" +
        //"   <div class='clickable' onclick='location.href=\"album.html?folder=" + folderId + "\"'>" + labelText + "</div>" +
        "   <div class='clickable' onclick='rtpe(\"HB2\",\"" + hdrRootFolder + "\"," + hdrFolderId + "," + folderId + ")'>" + labelText + "</div>" +
        "</div>\n";
}
function setFolderImage(filinkId, folderId, level) {
    try {
        $.ajax({
            type: "GET",
            url: "php/updateFolderImage.php?folderImage='" + filinkId + "'&folderId=" + folderId + "&level=" + level,
            success: function (success) {
                if (success.trim().startsWith("ok")) {
                    displayStatusMessage("ok", level + " image set for " + folderId);
                    $("#imageContextMenu").fadeOut();
                }
                else {
                    logError("AJX", folderId, success, "setFolderImage");
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                alert("setFolderImage: " + errMsg);
            }
        });
    } catch (e) {
        logCatch("set Folder Image", e);
    }
}

/*-- exploding image view -------------------*/{
    const viewerOffsetTop = 44, explodeSpeed = 22, heightIncrement = 22;
    let viewerH, viewerMaxH;

    function showMaxSizeViewer(imgSrc, calledFrom) {
        //logEvent("EXP", pFolderId, pFolderName, pLinkId);
        //showMaxSizeViewer()
        if (calledFrom == 'slideshow') {
            $("#slideshowCtxMenuContainer").hide();
        }
        else {
            $("#imageContextMenu").hide();
            $('#viewerImage').attr("src", imgSrc);
        }
        $("#vailShell").show().on("click", function () { closeExploderDiv() });
        $('#singleImageOuterContainer').show();

        //replaceFullPage(pImgSrc);
    }

    function viewImage(imgSrc, linkId) {
        currentImagelinkId = linkId;
        viewerH = 50;
        let parentPos = $('#visableArea').offset();
        let startLeft = $('#visableArea').width() * .34;

        $("#singleImageOuterContainer").css({
            height: viewerH,
            top: parentPos.top - viewerOffsetTop,
            left: parentPos.left + startLeft
        });
        $("#viewerImage").css("height", viewerH);
        $("#vailShell").show().on("click", function () { closeImageViewer() });
        $('#viewerImage').attr("src", imgSrc);
        $('#singleImageOuterContainer').show();
        viewerMaxH = $('#visableArea').height() + viewerOffsetTop - 55;
        incrementExplode();

        $('#viewerImage').on('click', showMaxSizeViewer(imgSrc, 'album'));

        $('body').keydown(function (event) {
            if (event.keyCode === 27)
                closeImageViewer();
        });
    }

    function incrementExplode() {
        if (viewerH < viewerMaxH) {
            setTimeout(function () {
                viewerH += heightIncrement;
                $("#viewerImage").css("height", viewerH);

                let imgleft = $("#singleImageOuterContainer").css("left");

                $("#singleImageOuterContainer").css("left", imgleft - (heightIncrement / 2));
                incrementExplode();
            }, explodeSpeed);
        }
        else {
            $("#viewerImage").css("height", viewerMaxH);
            $("#divSlideshowButton").show();
            $("#viewerCloseButton").show();
            let visWidth = $('#visableArea').width();
            let imgWidth = $('#viewerImage').width();
            $("#singleImageOuterContainer").css("left", (visWidth / 2) - (imgWidth / 2));
        }
    }

    function incrementImplodeViewer(divObject) {
        let viewerH = divObject.height();
        if (viewerH > 0) {
            setTimeout(function () {
                divObject.css("height", viewerH - heightIncrement);
                incrementImplodeViewer(divObject);
            }, explodeSpeed);
        }
        else {
            $('#singleImageOuterContainer').hide();
            $("#divSlideshowButton").hide();
            $("#viewerCloseButton").hide();
            $("#vailShell").hide();
            $('body').off();
        }
    }

    function closeImageViewer() {
        incrementImplodeViewer($("#viewerImage"));
    }

    function resizeViewer() {
        if ($('#singleImageOuterContainer').is(":visible")) {
            $("#singleImageOuterContainer").css("height", viewerMaxH);
            let visWidth = $('#visableArea').width();
            let imgWidth = $('#viewerImage').width();
            $("#singleImageOuterContainer").css("left", (visWidth / 2) - (imgWidth / 2));
        }
    }

    function showSlideshow() {
        try {
            $("#vailShell").hide();
            $('#singleImageOuterContainer').hide();
            $("#divSlideshowButton").hide();
            $("#viewerCloseButton").hide();
            $("#vailShell").hide();
            $('body').off();

            showSlideshowViewer(currentFolderId, currentImagelinkId, false)
        } catch (e) {
            logCatch("show slideshow", e);
        }
    }
    function closeExploderDiv() {
        $('#exploderDiv').hide();
        //$("#divSlideshowButton").hide();
        //$("#viewerCloseButton").hide();
        $("#vailShell").hide();
    }
}
/*-- Search --------------------------------------------*/{
    let searchString = "";

    function oggleSearchKeyDown(event) {
        var ev = event.keyCode;
        if (!listboxActive) {

            if (ev === 9 || ev === 40) {  //  tab
                event.preventDefault();
                itemIndex = 1;
                listboxActive = true;
                $('#searchResultsDiv').find('li:first').addClass('selectedSearchItem').focus();
                return false;
            }
            if (ev === 27) {  //  escape
                clearSearch();
                return;
            }
            if (ev === 8) {  //  backspace
                if (searchString.length > 0)
                    searchString = searchString.substring(0, searchString.length - 1);
                performSearch(searchString);
                return;
            }
            if (ev === 13) {  // enter
                var selectedItem = $('#searchResultsDiv').find('li:first').prop("id");
                jumpToSelected(selectedItem);
                return;
            }

            if (ev !== 46 && ev > 31 && (ev < 48 || ev > 57)) {
                if ($('#searchResultsDiv').val().length > searchString.length + 2) {
                    alert("ev: " + ev + " evc: " + String.fromCharCode(ev) +
                        "\n cur: " + searchString + "ins: " + $('#searchResultsDiv').val() +
                        "\ncurL: " + searchString.length + " insL: " + $('#searchResultsDiv').val().length
                    );
                    searchString = $('#searchResultsDiv').val();
                    performSearch(searchString);
                }
                else {
                    searchString += String.fromCharCode(ev);
                    //$('#txtSearch').val(searchString);
                    performSearch(searchString);
                }
            }
        }
        else {
            // $('#headerMessage').html("LBA: " + ev);
            var kludge;

            if (ev === 40) {  // down arrow
                if (itemIndex < $('#searchResultsDiv').children().length) {
                    $('#searchResultsDiv').children().removeClass('selectedSearchItem');
                    kludge = "li:nth-child(" + ++itemIndex + ")";
                    $('#searchResultsDiv').find(kludge).addClass('selectedSearchItem').focus();
                    $('#headerMessage').html("down: " + itemIndex);
                }
            }
            if (ev === 38) {  // up arrow
                if (itemIndex > 1) {
                    $('#searchResultsDiv').children().removeClass('selectedSearchItem');
                    kludge = "li:nth-child(" + --itemIndex + ")";
                    $('#searchResultsDiv').find(kludge).addClass('selectedSearchItem').focus();
                    $('#headerMessage').html("up: " + itemIndex);
                }
            }
            if (ev === 13) {  // enter
                kludge = "li:nth-child(" + itemIndex + ")";
                var id = $('#searchResultsDiv').find(kludge).prop("id");
                jumpToSelected($('#searchResultsDiv').find(kludge).prop("id"));
            }
            if (ev === 27) {  //  escape
                clearSearch();
                return;
            }
        }
    }

    function performSearch(searchString) {
        if (searchString.length > 2) {

            let sql = "select f.Id, p.FolderName as ParentName, f.FolderName from CategoryFolder f join CategoryFolder p on f.Parent = p.Id " +
                "where (f.FolderName like '`" + searchString + "`%') and (f.FolderType !='singleChild') union " +
                "select f.Id, p.FolderName as ParentName, f.FolderName from CategoryFolder f join CategoryFolder p on f.Parent = p.Id " +
                "where f.FolderName like '%" + searchString + "%' and (f.FolderName not like '" + searchString + "%') and (f.FolderType != 'singleChild');";

            try {
                $('#divLoginArea').hide();
                $.ajax({
                    type: "GET",
                    url: "php/oggleSearch.php?searchString=" + searchString,
                    success: function (data) {
                        if (data.indexOf("Error") > 0) {
                            alert(data);
                        }
                        else {
                            let fData = JSON.parse(data);
                            $('#searchResultsDiv').html("<ul class='searchResultList>").show();
                            $.each(fData, function (idx, obj) {
                                $('#searchResultsDiv').append("<li id=" + obj.Id +
                                    " onclick='jumpToSelected(" + obj.Id + ")'>" +
                                    obj.ParentName + "-" + obj.FolderName + "</li>");
                            });
                        }
                    },
                    error: function (jqXHR) {
                        $('#albumPageLoadingGif').hide();
                        let errMsg = getXHRErrorDetails(jqXHR);
                        $('#randomGalleriesContainer').html(errMsg)
                    }
                });
            } catch (e) {
                alert(e);
            }
        }
    }

    function clearSearch() {
        $('#searchResultsDiv').hide().html("");
        $('#divLoginArea').show();
        listboxActive = false;
        searchString = "";
        $('#txtSearch').val("");
        $('#searchResultsDiv').hide();
    }

    function jumpToSelected(selectedFolderId) {
        //rtpe('SRC', hdrFolderId, searchString, selectedFolderId);
        //logEvent("SRC", selectedFolderId, "jumpToSelected", "searchString: " + searchString);

        clearSearch();

        window.open("https://ogglefiles.com/beta/album.html?folder=" + selectedFolderId, "_blank");  // open in new tab

        var parentOpener = window.opener; window.opener = null; window.open("https://ogglefiles.com/beta/album.html?folder=" + selectedFolderId, "_blank"); window.opener = parentOpener;

    }
}
/*-- log error -----------------------------------------*/{
    function logOggleError(errorCode, folderId, errorMessage, calledFrom) {
        try {
            let visitorId = getCookieValue("VisitorId", calledFrom + "/logError");
            $.ajax({
                type: "POST",
                url: "php/logError.php",
                data: {
                    ErrorCode: errorCode,
                    FolderId: folderId,
                    VisitorId: visitorId,
                    CalledFrom: calledFrom,
                    ErrorMessage: errorMessage
                },
                success: function (success) {
                    if (success == "!ok") {
                        console.log(addImageFileSuccess);
                    }
                    else {
                        console.error("log oggle error fail: " + success);
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    alert("Error log error: " + errMsg);
                }
            });
        } catch (e) {
            console.error("logOggle error not working: " + e);
        }
    }

    function imageError(folderId, linkId) {
        try {
            // let calledFrom = "noneya";
            console.error("imageError: IMG. folder: " + folderId +
                "\n linkId: " + linkId);

            $('#' + linkId).attr('src', 'https://common.ogglefiles.com/img/redballonSmall.png');
            // logError("ILF", folderId, "linkId: " + linkId, "gallery");

        } catch (e) {
            logCatch("image error", e);
        }
    }
}
/*-- context menu --------------------------------------*/{
    let menuType, linkId, folderId, imgSrc;
    function albumContextMenu(pmenuType, plinkId, pfolderId, pimgSrc) {
        event.preventDefault();
        window.event.returnValue = false;
        menuType = pmenuType, linkId = plinkId, folderId = pfolderId, imgSrc = pimgSrc;
        pos = {};
        pos.x = event.clientX;
        pos.y = event.clientY + $(window).scrollTop();
        $('#contextMenuContent').html(oggleContextMenuHtml());
        $('#contextMenuContainer').css("top", pos.y);
        $('#contextMenuContainer').css("left", pos.x);
        $('#contextMenuContainer').show();

        if (menuType === "Folder")
            getFolderctxMenuDetails();
        else
            getSingleImageDetails(linkId);
    }
    function getSingleImageDetails(linkId, folderId) {
        try {
            let getSingleImageDetailsStart = Date.now();
            $('#ctxTxtModelName').show().html("<img title='loading gif' alt='' class='ctxloadingGif' src='https://common.ogglefiles.com/img/loader.gif'/>");
            $('#ctxExplode').hide();
            $('#ctxOpenInNewTab').hide();
            $('#ctxSeeMore').hide();
            $('#ctxSaveAs').hide();
            $('#ctxImageShowLinks').hide();
            $('#ctxDownLoad').hide();
            $.ajax({
                type: "GET",
                url: "php/customFetch.php?query=select p.FolderName as ParentFolderName, i.*, f.* from ImageFile i " +
                    "join CategoryFolder f on i.FolderId=f.Id join CategoryFolder p on f.Parent=p.Id where i.id ='" + linkId + "'",
                success: function (data) {
                    let imgData = JSON.parse(data);
                    pFolderName = imgData.FolderName;
                    if (imgData.FolderType == "singleChild")
                        $('#ctxTxtModelName').html(imgData.ParentFolderName);
                    else {
                        $('#ctxTxtModelName').html(imgData.FolderName);
                    }
                    if (imgData.FolderType == "multiModel") {
                        if (imgData.Id != folderId) { //  we have a link
                            $('#ctxSeeMore').show();
                        }
                        else {
                            $('#ctxTxtModelName').html("unknown model");
                        }
                    }

                    $('#imageInfoFileName').html(imgData.FileName);
                    $('#imageInfoFolderPath').html(imgData.FolderPath);
                    $('#imageInfoLinkId').val(linkId);
                    $('#imageInfoHeight').html(imgData.Height);
                    $('#imageInfoWidth').html(imgData.Width);
                    $('#imageInfoSize').html(imgData.Size).toLocaleString();
                    $('#imageInfoLastModified').html(imgData.Acquired);
                    $('#imageInfoExternalLink').html(imgData.ExternalLink);

                    if (menuType === "Carousel") {
                        $('#ctxOpenInNewTab').show();
                    }
                    if (menuType === "Slideshow") {
                        $('#ctxssClose').show();
                    }
                    $('#ctxComment').show();

                    // beta mode
                    $('.adminLink').show();
                    //if (isInRole("admin", "context menu"))
                    //    $('.adminLink').show();
                    //else
                    //    $('.adminLink').hide();

                    let delta = Date.now() - getSingleImageDetailsStart;
                    let minutes = Math.floor(delta / 60000);
                    let seconds = (delta % 60000 / 1000).toFixed(0);
                    //
                    console.log("get Single Image Details took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    logError("XHR", folderId, errMsg, "getSingle ImageDetails");
                    alert("getSingle ImageDetails: " + errMsg);
                }
            });
        } catch (e) {
            logCatch("getSingle ImageDetails", e);
        }
    }
    function oggleContextMenuHtml() {
        return `<div id='ctxTxtModelName' class='ctxItem' onclick='oggleCtxMenuAction(\"showDialog\")'>model name</div>
        <div id='ctxSeeMore' class='ctxItem' onclick='oggleCtxMenuAction(\"see more\")'>see more of her</div>
        <div id='ctxOpenInNewTab'  class='ctxItem' onclick='oggleCtxMenuAction(\"openInNewTab\")'>Open in new tab</div>
        <div id='ctxFantasy' class='ctxItem' onclick='oggleCtxMenuAction(\"fantasy\")'>Write a fantasy about this image</div>
        <div id='ctxComment' class='ctxItem' onclick='oggleCtxMenuAction(\"comment\")'>Write a fantasy about this image</div>
        <div id='ctxExplode' class='ctxItem' onclick='oggleCtxMenuAction(\"explode\")'>rank this image</div>
        <div id='ctxSaveAs'  class='ctxItem' onclick='oggleCtxMenuAction(\"saveAs\")'>save as</div>
        <div id='ctxssClose' class='ctxItem' onclick='oggleCtxMenuAction(\"closeSlideshow\")'>close slideshow</div>
        <div id='ctxImageShowLinks' class='ctxItem' onclick='oggleCtxMenuAction(\"showLinks\")'>Show Links</div>
        <div id='linkInfoContainer' class='contextMenuInnerContainer'></div>
        <div id='ctxInfo'    class='adminLink' onclick='oggleCtxMenuAction(\"info\")'>Show Image info</div>
        <div id='ctxDownLoad' onclick='oggleCtxMenuAction(\"download\")'>download folder</div>`
            +
            `<div id='imageInfoContainer' class='contextMenuInnerContainer'>
            <div><span class='ctxItem'>file name</span><span id='imageInfoFileName' class='ctxInfoValue'></span></div>
            <div><span class='ctxItem'>folder path</span><span id='imageInfoFolderPath' class='ctxInfoValue'></span></div>
            <div><span class='ctxItem'>link id</span><input id='imageInfoLinkId'></input></div>
            <div>
                <span class='ctxItem'>height</span><span id='imageInfoHeight' class='ctxInfoValue'></span>" +
                <span class='ctxItem'>width</span><span id='imageInfoWidth' class='ctxInfoValue'></span>" +
                <span class='ctxItem'>size</span><span id='imageInfoSize' class='ctxInfoValue'></span>
            </div>
            <div><span class='ctxItem'>last modified</span><span id='imageInfoLastModified' class='ctxInfoValue'></span></div>
            <div><span class='ctxItem'>external link</span><span id='imageInfoExternalLink' class='ctxInfoValue'></span></div>
        </div>
        <div id='folderInfoContainer' class='contextMenuInnerContainer'>
            <div><span class='ctxItem'>file name</span><span id='folderInfoFileName' class='ctxInfoValue'></span></div>
            <div><span class='ctxItem'>folder id</span><span id='folderInfoId' class='ctxInfoValue'></span></div>
            <div><span class='ctxItem'>folder path</span><span id='folderInfoPath' class='ctxInfoValue'></span></div>
            <div><span class='ctxItem'>files</span><span id='folderInfoFileCount' class='ctxInfoValue'></span></div>
            <div><span class='ctxItem'>subfolders</span><span id='folderInfoSubDirsCount' class='ctxInfoValue'></span></div>
            <div><span class='ctxItem'>last modified</span><span id='folderInfoLastModified' class='ctxInfoValue'></span></div>
        </div>
        <div id='ctxShowAdmin' class='adminLink' onclick='$(\"#linkAdminContainer\").toggle()'>Admin</div>`
            +
            `<div id='linkAdminContainer' class='contextMenuInnerContainer'>
            <div onclick='oggleCtxMenuAction(\"archive\")'>Archive</div>
            <div onclick='oggleCtxMenuAction(\"copy\")'>Copy Link</div>
            <div onclick='oggleCtxMenuAction(\"move\")'>Move Image</div>
            <div onclick='oggleCtxMenuAction(\"remove\")'>Remove Link</div>
            <div onclick='oggleCtxMenuAction(\"reject\")'>Move to Rejects</div>
            <div onclick='oggleCtxMenuAction(\"delete\")'>Delete Image</div>
            <div onclick='oggleCtxMenuAction(\"setF\")'>Set as Folder Image</div>
            <div onclick='oggleCtxMenuAction(\"setC\")'>Set as Category Image</div>
        </div>`;
    }

    function oggleCtxMenuAction(action) {
        switch (action) {
            case "saveAs":
                document.execCommand("SaveAs", null, "file.csv");
                break;
            case "download":
                if (localStorage["IsLoggedIn"] == "true")
                    alert("still working on this feature. Send site developer an email to request folder");
                else
                    alert("You must be logged in to download an album");
                break;
            case "showDialog": {
                if ($('#ctxTxtModelName').html() === "unknown model") {
                    showUnknownModelDialog(pMenuType, pImgSrc, pLinkId, pFolderId);
                }
                else
                    if (isNullorUndefined(pModelFolderId))
                        showFolderInfoDialog(pFolderId, "img ctx");
                    else
                        showFolderInfoDialog(pModelFolderId, "img ctx");
                $("#contextMenuContainer").fadeOut();
                break;
            }
            case "closeSlideshow":
                closeViewer("context menu");
                break;
            case "openInNewTab": {
                rtpe("ONT", "context menu", pFolderName, pFolderId);
                break;
            }
            case "see more": {
                rtpe("SEE", pFolderId, pFolderName, pModelFolderId);
                break;
            }
            case "comment": {
                showImageCommentDialog(pLinkId, pImgSrc, pFolderId, pMenuType);
                $("#contextMenuContainer").fadeOut();
                break;
            }
            case "explode": {
                explodeImage();
                break;
            }
            case "Image tags":
            case "folder tags":
                openMetaTagDialog(pFolderId, pLinkId);
                break;
            case "info":
                if (pMenuType === "Folder")
                    $('#folderInfoContainer').toggle();
                else
                    $('#imageInfoContainer').toggle();
                break;
            case "showLinks":
                $('#linkInfoContainer').toggle();
                break;
            case "archive":
                showArchiveLinkDialog(pLinkId, pFolderId, pImgSrc, pMenuType);
                break;
            case "copy":
                showCopyLinkDialog(pLinkId, pMenuType, pImgSrc);
                $("#imageContextMenu").fadeOut();
                break;
            case "move":
                showMoveLinkDialog(pLinkId, pFolderId, pMenuType, pImgSrc);
                $("#imageContextMenu").fadeOut();
                break;
            case "remove":
                $("#imageContextMenu").fadeOut();
                attemptRemoveLink(pLinkId, pFolderId, pImgSrc);
                break;
            case "delete":
                $("#imageContextMenu").fadeOut();
                deleteLink(pLinkId, pFolderId, pImgSrc);
                break;
            case "reject":
                $("#imageContextMenu").fadeOut();
                showMoveImageToRejectsDialog(pMenuType, pLinkId, pFolderId, pImgSrc, "single link");
                break;
            case "setF":
                setFolderImage(pLinkId, pFolderId, "folder");
                break;
            case "setC":
                setFolderImage(pLinkId, pFolderId, "parent");
                break;
            default: {
                logError("SWT", pFolderId, "action: " + action, "oggleCtxMenuAction");
            }
        }
    }
    /*--  context menu actions ---------------------------------*/
    function showMoveImageToRejectsDialog(menuType, linkId, folderId, imgSrc, errMsg) {
        if (errMsg === "single link") {
            $('#centeredDialogTitle').html("move image to rejects");
            $('#centeredDialogContents').html(
                "<form id='frmReject>'\n" +
                "    <div class='inline'><img id='linkManipulateImage' class='copyDialogImage' src='" + imgSrc + "'/></div>\n" +
                "    <div><input type='radio' value='DUP' name='rdoRejectImageReasons' checked='checked'></input>  duplicate</div>\n" +
                "    <div><input type='radio' value='BAD' name='rdoRejectImageReasons'></input>  bad link</div>\n" +
                "    <div><input type='radio' value='LOW' name='rdoRejectImageReasons'></input>  low quality</div>\n" +
                "    <div class='roundendButton' onclick='performMoveImageToRejects(\"" + menuType + "\",\"" + linkId + "\"," + folderId + ")'>ok</div>\n" +
                "</form>");
        }
        if (errMsg === "home folder Link") {
            $('#centeredDialogTitle').html("Remove Home Folder Link");
            $('#centeredDialogContents').html("<div class='oggleDialogWindow'>\n" +
                "    <div class='inline'><img id='linkManipulateImage' class='copyDialogImage' src='" + imgSrc + "'/></div>\n" +
                "    <div>Are you sure you want to remove the home folder Link</div>\n" +
                "    <div class='roundendButton' onclick='removeHomeFolderLink(\"" + linkId + "\)'>confirm</div>\n" +
                "</div>\n");
        }
        $('#centeredDialogContainer').fadeIn();
    }
    function performMoveImageToRejects(menuType, linkId, folderId) {

        let rejectReason = $('input[name="rdoRejectImageReasons"]:checked').val();
        $('#albumPageLoadingGif').show();
        $.ajax({
            type: "PUT",
            url: 'php/moveToRejects',
            data: {
                rejectReason: rejectReason,
                linkId: linkId
            },
            success: function (success) {
                $('#albumPageLoadingGif').hide();
                if (success === "single link" || success === "home folder Link") {
                    showConfirmDeteteImageDialog(menuType, linkId, folderId, imgSrc, success);
                }
                else {
                    if (success === "ok") {
                        if (viewerShowing) {
                            // TODO: remove image from slideshow array
                            slide("next");
                        }
                        // TODO: include reason radio button
                        getAlbumImages(folderId);
                        centeringDialogClose();
                        slideShowDialogClose();
                        displayStatusMessage("ok", "link moved to rejects" + linkId);
                        logDataActivity({
                            VisitorId: getCookieValue("VisitorId", "perform MoveImageToRejects"),
                            ActivityCode: "REJ",
                            FolderId: folderId,
                            Details: "reason: " + $('input[name=rdoRejectImageReasons]:checked', '#frmReject').val() + "link moved to rejects" + linkId
                        });
                    }
                    else {
                        logError("AJX", 3908, success, "perform MoveImageToRejects");
                    }
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", pSelectedTreeId, errMsg, functionName);
            }
        });
    }
    function showCopyLinkDialog(pLinkId, pMenuType, pImgSrc) {
    }
    function showImageCommentDialog(linkId, imgSrc, folderId, calledFrom) {
        if (typeof pause === 'function') pause();
        //logEvent("SID", folderId, calledFrom, "LinkId: " + linkId);

        //$('#centeredDialogContents').html(imageCommentDialogHtml());
        $("#centeredDialogContainer").fadeIn();
        $('#centeredDialogContainer').css("top", $('.oggleHeader').height() + 50);
        $('#centeredDialogTitle').html("Write a fantasy about this image");
        $('#commentDialogImage').attr("src", imgSrc);

        //$('#imageCommentEditor').summernote({
        //    height: 200,
        //    dialogsInBody: true,
        //    codemirror: { lineWrapping: true, mode: "htmlmixed", theme: "cobalt" },
        //    toolbar: [
        //        ['codeview'],
        //        ['font style', ['fontname', 'fontsize', 'color', 'bold', 'italic', 'underline']]
        //    ]
        //});
        $('#imageCommentEditor').summernote('focus');
        $('txtCommentTitle').blur(function () { console.log("txtCommentTitle blurr"); $('#imageCommentEditor').summernote('focus'); });

        //$('#imageCommentEditor').focus();
        //$("#imageCommentEditor").summernote('codeview.toggle');
        //setTimeout(function () { $("#imageCommentEditor").summernote('codeview.toggle'); }, 800);

        $(".note-editable").css('font-size', '15px');
        $(".modelDialogInput").prop('readonly', true);
        //innocent young girl with an enormous set of knockers.She doesn't mind showing them, but it's like she's doing you a favor.
        let imageComment = {
            VisitorId: getCookieValue("VisitorId", "show ImageCommentDialog"),
            ImageLinkId: linkId,
            CalledFrom: calledFrom,
            FolderId: folderId
        };
    }
}

// REPORT THEN PERFORM EVENT
function XXperformEvent(eventCode, eventDetail, folderId) {
    //        if (eventCode === "PRN") {
    //            //  setUserPornStatus(pornType);
    //        }
    //            case "LUP":  // latest Update click
    //        if (eventDetail.lastIndexOf("_") > 0) {
    //            logImageHit(eventDetail.substr(eventDetail.lastIndexOf("_") + 1, 36), folderId, true);
    //        }
    //        window.location.href = "/album.html?folder=" + folderId;
    //        break;
    //            case "GIC": // Gallery Item Clicked
    //            case "CMC": // carousle context menu item clicked
    //            case "CXM":  // carousle context menu opened
    //            case "XLC":  // external link clicked
    //        // DO NOTHING BUT REPORT
    //        break;
    //            case "PRN":  //("Porn Option clicked");
    //        window.location.href = '/index.html?subdomain=porn';
    //        break;
    //            case "HBC":  //  header banner clicked
    //        window.location.href = '/index.html?spa=' + eventDetail;
    //        break;
    //            case "GAX":  // can I get a connection
    //        alert("can I get a connection");
    //        //window.location.href = ".";
    //        break;
    //            case "EXP":  // Explode
    //        //rtpe("EXP", currentAlbumJSfolderName, selectedImage, albumFolderId);
    //        window.open(eventDetail, "_blank");
    //            logImageHit(eventDetail.substr(eventDetail.lastIndexOf("_") + 1, 36), folderId, true);
    //        }
    //        window.location.href = "/album.html?folder=" + folderId;  //  open page in same window
    //        break;
    //            case "HBX":  // Home breadcrumb Clicked
    //        if (eventDetail === "porn")
    //            window.location.href = '/index.html?subdomain=porn';
    //        else
    //            window.location.href = "/";
    //        break;
    //            case "RNK":  // Ranker Banner Clicked
    //        window.location.href = "/Ranker.html?subdomain=" + eventDetail;
    //        break;
    //            case "FLC":  //  footer link clicked
    //        switch (eventDetail) {
    //            case "about us": showCustomMessage(38); break;
    //            case "dir tree": showCatListDialog(2); break;
    //            case "porn dir tree": showCatListDialog(242); break;
    //            case "playmate dir tree": showCatListDialog(472); break;
    //            case "porn": showCustomMessage(35, false); break;
    //            case "blog": window.location.href = '/index.html?subdomain=blog'; break;
    //            case "ranker": window.location.href = "/Ranker.html"; break;
    //            case "rejects": window.location.href = "/album.html?folder=1132"; break;
    //            case "centerfolds": window.location.href = "/album.html?folder=1132"; break;
    //            case "cybergirls": window.location.href = "/album.html?folder=3796"; break;
    //            case "softcore": window.location.href = "/album.html?folder=5233"; break;
    //            case "extras": window.location.href = "/album.html?folder=2601"; break;
    //            case "sluts": window.location.href = "/album.html?folder=440"; break;
    //            case "magazine covers": window.location.href = "/album.html?folder=1986"; break;
    //            case "archive": window.location.href = "/album.html?folder=3"; break;
    //            case "videos": window.location.href = 'video.html'; break;
    //            case "mailme": window.location.href = 'mailto:curtishrhodes@hotmail.com'; break;
    //            case "freedback": showFeedbackDialog(folderId); break;
    //            case "slut archive": window.location.href = "/album.html?folder=440"; break;
    //            default:
    //                logError("SWT", folderId, "Uncaught Case: " + eventDetail, "performEvent/footer link click");
    //                break;
    //        }
}

