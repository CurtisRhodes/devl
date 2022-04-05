const settingsImgRepo = 'https://ogglefiles.com/danni/';
let slideshowVisible = false, imageViewerVisible = false;

function captureKeydownEvent(event) {
    if (slideshowVisible)
        doSlideShowKdownEvents(event);
    else
        if (imageViewerVisible) {
            if (event.keyCode === 27)
                closeImageViewer();
        }
        else
            if (document.activeElement.id == "txtSearch")
                searchBoxKeyDown(event);
            else {
                let activeElement = document.activeElement.id;
                $('#topRowRightContainer').html("activeElement: " + activeElement);
            }
}


/*-- verify user -----------------------------------*/{
    function verifyUser(calledFrom) {
        if (isNullorUndefined(sessionStorage["VisitorIdVerified"])) {
            //sessionStorage["VisitorIdVerified"] = "ok";
            let cookeiVisitorId = getCookieValue("VisitorId");
            if (cookeiVisitorId == "cookie not found") {
                sessionStorage["VisitorIdVerified"] = "ok";
                ipifyLookup();
            }
            else {
                verifyVisitorId(cookeiVisitorId);
            }
            if (calledFrom == "album") {
                // new visitor comming in from an external link
            }
        }
        if (isNullorUndefined(sessionStorage["VisitLogged"])) {
            logVisit("verify");
        }

    }

    function verifyVisitorId(visitorId) {
        try {
            $.ajax({
                type: "GET",
                url: "php/registroFetch.php?query=Select * from Visitor where VisitorId='" + visitorId + "'",
                success: function (data) {
                    if (data == "false") {
                        ipifyLookup();
                    }
                    else {
                        sessionStorage["VisitorIdVerified"] = "ok";
                    }
                },
                error: function (jqXHR) {
                    logOggleError("CAT", folderId, getXHRErrorDetails(jqXHR), "verify VisitorId")
                }
            });
        } catch (e) {
            logOggleError("CAT", folderId, e, "verify VisitorId")
        }
    }

    function ipifyLookup() {
        try {
            $.ajax({
                type: "GET",
                url: "https://api.ipify.org",
                success: function (ipifyRtrnIP) {
                    if (isNullorUndefined(ipifyRtrnIP)) {
                        logOggleError("", -88817, "ipify empty response", "ipify lookup")
                    }
                    else {
                        // ipify success // checkVisitor(ipifyRtrnIP, calledFrom);
                        $.ajax({
                            type: "GET",
                            url: "php/registroFetch.php?query=Select * from Visitor where IpAddress='" + ipifyRtrnIP + "'",
                            success: function (data) {
                                if (data == "false") {
                                    performIpInfo(ipifyRtrnIP);
                                    //logOggleActivity("CV1", -88823, "lookup Ip Address"); // ipify IP not found.in Visitor table
                                }
                                else {
                                    let visitorRow = JSON.parse(data);
                                    if (localStorage["VisitorId"] == visitorRow.VisitorId) {
                                        //sessionStorage["VisitorIdVerified"] = "ok";
                                        logOggleError("BUG", -67736, "just told cookie not found", "ipify lookup")

                                    }
                                    else {
                                        logOggleActivity("CV2", -88812, "lookup Ip Address");  // local storage does not match visitorId for IP
                                        checklocalStorageVisitorId(visitorRow.VisitorId, ipifyRtrnIP);
                                    }
                                }
                            },
                            error: function (jqXHR) {
                                logOggleError("XHR", -67769, getXHRErrorDetails(jqXHR), "ipify lookup")
                                alert("perform IpLookup: " + errMsg);
                            }
                        });
                    }
                },
                error: function (jqXHR) {
                    logOggleError("XHR", -67700, getXHRErrorDetails(jqXHR), "lookup Ip Address")
                }
            });
        }
        catch (e) {
            logOggleError("CAT", -67700, e, "lookup Ip Address")
        }
    }

    function performIpInfo(ipAddress) {
        try {
            $.ajax({
                type: "GET",
                url: "https://ipinfo.io/" + ipAddress + "?token=ac5da086206dc4",
                success: function (ipResponse) {
                    if (isNullorUndefined(ipResponse)) {
                        logOggleActivity("IP4", -21264, ipAddress);  // IpInfo null response' where RefCode = 'IP4';
                    }
                    else {
                        addVisitor(ipResponse);
                        logOggleActivity("IP0", -21200, "success Ip: " + ipResponse.ip);
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    logOggleActivity("IPX", -21277, "XHR error: " + errMsg);
                    logOggleError("XHR", -21277, errMsg, "perform IpLookup");
                }
            });
        } catch (e) {
            logOggleActivity("IPC", -21269, "CAT error: " + e);
            logOggleError("CAT", -21269, e, "perform IpLookup");
        }
    }

    function checklocalStorageVisitorId(ipVisitorId, ipifyRtrnIP) {
        $.ajax({
            type: "GET",
            url: "php/registroFetch.php?query=Select * from Visitor where VisitorId='" + localStorage["VisitorId"] + "'",
            success: function (data) {
                if (data == "false") {
                    localStorage["VisitorId"] = ipVisitorId;
                    localStorage["VisitorId"] = ipVisitorId;
                    localStorage["VisitorId"] = ipVisitorId;
                    localStorage["VisitorId"] = ipVisitorId;
                    rebuildCookie();
                    logOggleError("BUG", -35400, "localStorage has bad VisitorId");
                }
                else {
                    // localStorage["VisitorId"] ok
                    let localStorageVisitorRow = JSON.parse(data);
                    if (ipifyRtrnIP != localStorageVisitorRow.ipAddress) {
                        logOggleError("BUG", -35421, "localStorage VisitorId(" + localStorage["VisitorId"] + ") has wrong Ip Address(" + localStorageVisitorRow.ipAddress + ")", "check localStorage VisitorId");

                    }
                }
            },
            error: function (jqXHR) {
                logOggleError("XHR", -67769, getXHRErrorDetails(jqXHR), "check localStorage VisitorId")
                alert("perform IpLookup: " + errMsg);
            }
        });
    }

    function recordHitSource(siteCode, folderId) {
        try {
            visitorId = getCookieValue("VisitorId");
            if (visitorId == "cookie not found") {
                ipifyLookup();
            }
            $.ajax({
                type: "POST",
                url: "php/logTrackbackHit.php",
                data: {
                    folderId: folderId,
                    siteCode: siteCode,
                    visitorId: visitorId
                },
                success: function (success) {
                    if (success.trim() == "ok") {
                        logOggleActivity("PHC", folderId, "record hit source");
                    }
                    else {
                        switch (success.trim()) {
                            case '23000':
                                //logError("",);  // duplicate page hit
                                break;
                            case '42000':
                            default:
                            //alert("logVisit: php error code: " + success);
                        }
                    }
                },
                error: function (jqXHR) {
                    logOggleError("XHR", folderId, getXHRErrorDetails(jqXHR), "record hit source");
                }
            });
        } catch (e) {
            logOggleError("CAT", folderId, e, "record hit source");
        }
    }
}
/*-- click events -----------------------------------*/
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

/*-- search --------------------------------------------*/{
    let searchString = "", itemIndex = -1;

    function searchBoxKeyDown(event) {
        var ev = event.keyCode;

        if (ev === 27) {  //  escape
            clearSearch();
        }
        if (ev === 8) {  //  backspace
            if (searchString.length > 0)
                searchString = searchString.substring(0, searchString.length - 1);
            if (searchString.length > 2)
                performSearch(searchString);
        }
        if (ev === 13) {  // enter
            if (searchString.length > 2)
                if ($('#searchResultsDiv').html() != "") {
                    var selectedItem = $('#searchResultsDiv').find('li:first').prop("id");
                    jumpToSelected(selectedItem);
                }
        }
        if (ev === 9 || ev === 40) {  // down arrow //  tab
            if (searchString.length > 2) {
                if ($('#searchResultsDiv').html() != "") {
                    $("#searchResultsDiv ul:first-child").addClass('selectedSearchItem').focus();
                    itemIndex = 1;
                }
            }
        }
        else {
            if (ev !== 46 && ev > 31 && (ev < 48 || ev > 57)) {
                searchString += String.fromCharCode(ev);
                if (searchString.length > 2) {
                    performSearch(searchString);
                }
            }
        }
    }

    function searchListKeyDown(event) {
        //event.preventDefault();

        if (ev === 38) {  // up arrow
            //if (itemIndex > 1) {
            //    $('#searchResultsDiv').children().removeClass('selectedSearchItem');
            //    kludge = "li:nth-child(" + --itemIndex + ")";
            //    $('#searchResultsDiv').find(kludge).addClass('selectedSearchItem').focus();
            //    $('#headerMessage').html("up: " + itemIndex);
            //}
        }
        if (ev === 13) {  // enter
            event.preventDefault();
            kludge = "li:nth-child(" + itemIndex + ")";
            var id = $('#searchResultsDiv').find(kludge).prop("id");
            jumpToSelected($('#searchResultsDiv').find(kludge).prop("id"));
            return false;
        }
        if (ev === 27) {  //  escape
            clearSearch();
        }
    }

    function clearSearch() {
        $('#searchResultsDiv').hide().html("");
        $('#txtSearch').html('').focus();
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
                        if (data != "null") {
                            if (!isNullorUndefined(data.trim())) {
                                let fData = JSON.parse(data);
                                $('#searchResultsDiv').html("<ul class='searchResultList>").show();
                                $.each(fData, function (idx, obj) {
                                    $('#searchResultsDiv').append("<li id=" + obj.Id +
                                        " onclick='jumpToSelected(" + obj.Id + ")'>" +
                                        obj.ParentName + "-" + obj.FolderName + "</li>");
                                });
                            }
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
            let visitorId = getCookieValue("VisitorId");
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
                    if (success.trim() == "ok") {
                        console.log(errorCode + " error from: " + calledFrom + " error: " + errorMessage);
                    }
                    else {
                        if (!success.trim().startsWith("2300"))
                            console.log("log oggleerror fail: " + success);
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    alert("Error log error: " + errMsg);
                }
            });
        } catch (e) {
            alert("Error log CATCH error: " + e);
            console.log("logOggle error not working: " + e);
        }
    }

    function imageError(folderId, linkId, calledFrom) {
        try {
            // let calledFrom = "noneya";
            console.log("imageError: IMG. folder: " + folderId + ", linkId: " + linkId + ", calledFrom: " + calledFrom);

            $('#' + linkId).attr('src', 'https://common.ogglefiles.com/img/redballonSmall.png');
            logOggleError("ILF", folderId, "linkId: " + linkId, calledFrom);

        } catch (e) {
            logOggleError("CAT", folderId, e, "image error")
        }
    }

    function logOggleActivity(activityCode, folderId, calledFrom) {
        try {
            $.ajax({
                type: "POST",
                url: "php/logActivity.php",
                data: {
                    activityCode: activityCode,
                    folderId: folderId,
                    visitorId: getCookieValue("VisitorId"),
                    calledFrom: calledFrom
                },
                success: function (success) {
                    if (success.trim() != "ok") {
                        console.log("log OggleActivity fail: " + success);
                        logOggleError("AJX", folderId, success, "log OggleActivity");
                    }
                },
                error: function (jqXHR) {
                    logOggleError("XHR", folderId, getXHRErrorDetails(jqXHR), "log OggleActivity")
                }
            });
        } catch (e) {
            logOggleError("CAT", folderId, e, "log OggleActivity")
        }
    }

    function logOggleEvent(eventCode, folderId, calledFrom) {
        try {
            visitorId = getCookieValue("VisitorId", "log Activity");
            try {
                let visitorId = getCookieValue("VisitorId", calledFrom + "/logError");
                $.ajax({
                    type: "POST",
                    url: "php/logActivity.php",
                    data: {
                        eventCode: eventCode,
                        folderId: folderId,
                        visitorId: visitorId,
                        calledFrom: calledFrom
                    },
                    success: function (success) {
                        if (success.trim() == "ok") {
                            console.log("activity logged.  VisitorId: " + visitorId + "  Code: " + activityCode + "  calledFrom: " + calledFrom);
                        }
                        else {
                            console.log("log OggleActivity fail: " + success);
                            logOggleError("AJX", folderId, success, "log OggleActivity");
                        }
                    },
                    error: function (jqXHR) {
                        let errMsg = getXHRErrorDetails(jqXHR);
                        logOggleError("XHR", folderId, errMsg, "log OggleActivity")
                        alert("Error log error: " + errMsg);
                    }
                });
            } catch (e) {
                console.error("logOggle error not working: " + e);
            }

        } catch (e) {
            logOggleError("CAT", folderId, e, "log OggleActivity")
        }
    }
}
/*-- context menu --------------------------------------*/{
    let pmenuType, plinkId, pfolderId, pimgSrc;
    function oggleContextMenu(menuType, linkId, folderId, imgSrc) {
        pmenuType = menuType;
        plinkId = linkId;
        pfolderId = folderId;
        pimgSrc = imgSrc;

        event.preventDefault();
        window.event.returnValue = false;
        pos = {};
        pos.x = event.clientX;
        pos.y = event.clientY + $(window).scrollTop();
        $('#contextMenuContent').html(oggleContextMenuHtml());
        $('#contextMenuContainer').css("top", pos.y);
        $('#contextMenuContainer').css("left", pos.x);
        $('#contextMenuContainer').draggable().show();

        switch (menuType) {
            case "video":
            case "image":
                ctxMenuImageInfo();
                break;
            case "subfolder":  // no need for image details 
                ctxMenuFolderInfo(folderId);
            default:
        }
        if (pmenuType === "Carousel") {
            $('#ctxNewTab').show();
        }
        if (pmenuType === "Slideshow") {
            $('#ctxssClose').show();
        }

        $("#contextMenuContainer").mousemove(function (event) {
            //$("#hdrBtmRowSec3").html('');
            let ctxLeft = $("#contextMenuContainer").offset().left - 22;
            let ctxTop = $("#contextMenuContainer").offset().top - 22;
            let ctxRight = $("#contextMenuContainer").offset().left + $("#contextMenuContainer").width() + 22;
            let ctxBott = $("#contextMenuContainer").offset().top + $("#contextMenuContainer").height() + 22;

            //$("#hdrBtmRowSec3").html("ctxTop: " + ctxTop + ", ctxBott: " + ctxBott + ", ctxLeft: " + ctxLeft +
            //    ", ctxRight: " + ctxRight + ", x: " + event.pageX + ", y: " + event.pageY);

            //if (event.pageY <= ctxTop) $("#hdrBtmRowSec3").html('past top');
            //if (event.pageY >= ctxBott) $("#hdrBtmRowSec3").html('past bott');
            //if (event.pageX <= ctxLeft) $("#hdrBtmRowSec3").html('past left');
            //if (event.pageX >= ctxRight) $("#hdrBtmRowSec3").html('past right');

            if ((event.pageY <= ctxTop) ||
                (event.pageY >= ctxBott) ||
                (event.pageX <= ctxLeft) ||
                (event.pageX >= ctxRight)) {
                $('#contextMenuContainer').fadeOut();
            }
        });
    }

    function ctxMenuImageInfo() {
        try {
            let getSingleImageDetailsStart = Date.now();

            $('.ctxItem').hide();
            $('#ctxImageName').show().html("<img title='loading gif' alt='' class='ctxloadingGif' src='https://common.ogglefiles.com/img/loader.gif'/>");
            $('#ctxComment').show();
            $('#ctxExplode').show();
            $('#ctxImageInfo').show();
            // beta mode
            $('.adminLink').show();

            sql = "select f.FolderName, p.FolderName as ParentFolderName, f.FolderPath, f.FolderType, i.* from ImageFile i join CategoryFolder f on i.FolderId = f.Id " +
                  " join CategoryFolder p on f.Parent = p.Id where i.Id='" + plinkId + "'";
            $.ajax({
                type: "GET",
                url: "php/yagdrasselFetch.php?query=" + sql,
                success: function (data) {
                    let imgData = JSON.parse(data);
                    if (imgData == "false") {
                        $('#ctxImageName').html("empty data");
                        logOggleError("AJX", pfolderId, "empty data", "get singleImage details");
                    }
                    else {

                        $('#ctxImageName').html(imgData.FolderName);
                        if (imgData.FolderType == "multiModel") {
                            if (imgData.FolderId == pfolderId) {
                                $('#ctxImageName').html("unknown model");
                            }
                        }

                        // imgInfo
                        $('#imageInfoFileName').html(imgData.FileName);
                        $('#imageInfoFolderPath').html(imgData.FolderPath);
                        $('#imageInfoLinkId').val(plinkId);
                        $('#imageInfoHeight').html(imgData.Height);
                        $('#imageInfoWidth').html(imgData.Width);
                        $('#imageInfoSize').html(imgData.Size).toLocaleString();
                        $('#imageInfoLastModified').html(imgData.Acquired);
                        $('#imageInfoExternalLink').html(imgData.ExternalLink);

                         /// check for CategoryImageLink links
                        sql = "select f.Id, f.FolderName from CategoryImageLink l join CategoryFolder f on l.ImageCategoryId = f.id " +
                            "where ImageLinkId = '" + plinkId + "' and ImageCategoryId !=" + pfolderId;
                        $.ajax({
                            type: "GET",
                            url: "php/yagdrasselFetchAll.php?query=" + sql,
                            success: function (data) {
                                let categoryImageLinks = JSON.parse(data);
                                if (categoryImageLinks.length > 0) {
                                    $('#ctxLinks').show();

                                    $.each(categoryImageLinks, function (idx, categoryImageLink) {
                                        if (categoryImageLink.Id == imgData.FolderId) {
                                            $('#showLinksContainer').append("<div style='color:red' onclick='window.open('https://Ogglebooble.com/album.html?folder="
                                                + categoryImageLink.Id + "')>" + categoryImageLink.FileName + "</div");
                                        }
                                        else
                                            $('#showLinksContainer').append("<div onclick='window.open('https://Ogglebooble.com/album.html?folder="
                                            + categoryImageLink.Id + "')>" + categoryImageLink.FileName + "</div");
                                    });
                                }
                                let delta = Date.now() - getSingleImageDetailsStart;
                                let minutes = Math.floor(delta / 60000);
                                let seconds = (delta % 60000 / 1000).toFixed(0);
                                //
                                console.log("get Single Image Details took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
                            },
                            error: function (jqXHR) {
                                logOggleError("XHR", folderId, getXHRErrorDetails(jqXHR), "check for links");
                            }
                        });
                    }
                },
                error: function (jqXHR) {
                    $('#ctxImageName').html(getXHRErrorDetails(jqXHR));
                    logOggleError("XHR", pfolderId, getXHRErrorDetails(jqXHR))
                }
            });
        } catch (e) {
            $('#ctxImageName').html(e);
            logOggleError("CAT", folderId, e, "get singleImage details")
        }
    }

    function ctxMenuFolderInfo(folderId) {
        try {

            $('.ctxItem').hide();
            $('#ctxFolderName').show().html("<img title='loading gif' alt='' class='ctxloadingGif' src='https://common.ogglefiles.com/img/loader.gif'/>");
            $('#ctxComment').show();
            $('#ctxSeeMore').html("more like her").show();
            $('#ctxDownLoad').show();
            $('#ctxFolderInfo').show();

            //let sql = "select * from CategoryFolder f left join FolderDetail d on d.FolderId = f.Id where f.Id=" + folderId;
            $.ajax({
                type: "GET",
                url: "php/yagdrasselFetch.php?query=select * from CategoryFolder where Id=" + folderId,
                success: function (data) {
                    let folderData = JSON.parse(data);
                    if (folderData == "false") {
                        $('#ctxFolderName').html("empty data");
                        logOggleError("AJX", pfolderId, "empty data", "get singleImage details");
                    }
                    else {
                        $('#ctxFolderName').html(folderData.FolderName);
                        // folderInfo
                        $('#folderInfoPath').html(folderData.FolderPath);
                        $('#folderInfoRoot').html(folderData.Rootfolder);
                        $('#folderInfoType').html(folderData.FolderType);
                        $('#folderInfoFileCount').html(folderData.Files).toLocaleString();
                        $('#folderInfoSubDirs').html(folderData.SubFolders).toLocaleString();
                        $('#folderInfoTotalSubDirs').html(folderData.TotalChildFolders).toLocaleString();
                        $('#folderInfoTotalChildFiles').html(folderData.TotalChildFiles).toLocaleString();
                    }
                    // beta mode
                    $('.adminLink').show();
                },
                error: function (jqXHR) {
                    $('#ctxFolderName').html("error");
                    logOggleError("XHR", folderId, getXHRErrorDetails(jqXHR), "get singleImage details");
                }
            });
        } catch (e) {
            $('#ctxFolderName').html("catch error");
            logOggleError("CAT", folderId, e, "get folder details")
        }
    }

    function oggleContextMenuHtml() {
         //   case "Image tags":
         //   case "folder tags":
        return `
        <div id='ctxImageName'  class='ctxItem' onclick='oggleCtxMenuAction(\"imageDialog\")'>model name</div>
        <div id='ctxFolderName' class='ctxItem' onclick='oggleCtxMenuAction(\"folderDialog\")'>folder name</div>
        <div id='ctxSeeMore'    class='ctxItem' onclick='oggleCtxMenuAction(\"see more\")'>see more of her</div>
        <div id='ctxNewTab'     class='ctxItem' onclick='oggleCtxMenuAction(\"openInNewTab\")'>Open in new tab</div>
        <div id='ctxFantasy'    class='ctxItem' onclick='oggleCtxMenuAction(\"fantasy\")'>Write a fantasy about this image</div>
        <div id='ctxComment'    class='ctxItem' onclick='oggleCtxMenuAction(\"comment\")'>Comment</div>
        <div id='ctxRank'       class='ctxItem' onclick='oggleCtxMenuAction(\"rank\")'>rank this image</div>
        <div id='ctxExplode'    class='ctxItem' onclick='oggleCtxMenuAction(\"explode\")'>full screen</div>
        <div id='ctxSaveAs'     class='ctxItem' onclick='oggleCtxMenuAction(\"saveAs\")'>save as</div>
        <div id='ctxssClose'    class='ctxItem' onclick='oggleCtxMenuAction(\"closeSlideshow\")'>close slideshow</div>
        <div id='ctxLinks'      class='ctxItem' onclick='oggleCtxMenuAction(\"showLinks\")'>Show Links</div>
        <div id='showLinksContainer'     class='contextMenuInnerContainer'></div>
        <div id='ctxDownLoad'   class='ctxItem' onclick='oggleCtxMenuAction(\"download\")'>download folder</div>
        <div id='ctxImageInfo'  class='ctxItem' onclick='oggleCtxMenuAction(\"imageInfo\")'>Show Image Info</div>
        <div id='ctxFolderInfo' class='ctxItem' onclick='oggleCtxMenuAction(\"folderInfo\")'>Show Folder Info</div>
        <div id='imageInfoContainer' class='contextMenuInnerContainer'>
            <div><label>file name</label>  <span id='imageInfoFileName' class='ctxInfoValue'></span></div>
            <div><label>folder path</label><span id='imageInfoFolderPath' class='ctxInfoValue'></span></div>
            <div><label>link id</label>    <input id='imageInfoLinkId'></input></div>
            <div>
                <label>height</label><span id='imageInfoHeight' class='ctxInfoValue'></span>" +
                <label>width</label> <span id='imageInfoWidth'  class='ctxInfoValue'></span>" +
                <label>size</label>  <span id='imageInfoSize'   class='ctxInfoValue'></span>
            </div>
            <div><label>last modified</label><span id='imageInfoLastModified' class='ctxInfoValue'></span></div>
            <div><label>external link</label><span id='imageInfoExternalLink' class='ctxInfoValue'></span></div>
        </div>
        <div id='folderInfoContainer' class='contextMenuInnerContainer'>
            <div><label>folder path</label>      <span id='folderInfoPath' class='ctxInfoValue'></span></div>
            <div><label>root folder</label>      <span id='folderInfoRoot' class='ctxInfoValue'></span></div>
            <div><label>folder type</label>      <span id='folderInfoType' class='ctxInfoValue'></span></div>
            <div><label>files</label>            <span id='folderInfoFileCount' class='ctxInfoValue'></span></div>
            <div><label>subfolders</label>       <span id='folderInfoSubDirs' class='ctxInfoValue'></span></div>
            <div><label>total subDirs</label>    <span id='folderInfoTotalSubDirs' class='ctxInfoValue'></span></div>
            <div><label>total child files</label><span id='folderInfoTotalChildFiles' class='ctxInfoValue'></span></div>
        </div>
        <div id='ctxShowAdmin' class='adminLink' onclick='$(\"#linkAdminContainer\").toggle()'>Admin</div>
            <div id='linkAdminContainer' class='contextMenuInnerContainer'>
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

            case "imageDialog": showFileDetailsDialog(pfolderId); break;
            case "folderDialog": showFolderInfoDialog(pfolderId); break;
                $("#contextMenuContainer").fadeOut();
                break;
            case "closeSlideshow":
                closeViewer("context menu");
                break;
            case "openInNewTab": {
                //rtpe("ONT", "context menu", pFolderName, folderId);
                window.open("/album.html?folder=" + pfolderId, "_blank");  // open in new tab
                break;
            }
            case "see more": {
                window.open("/album.html?folder=" + pfolderId, "_blank");  // open in new tab
                //rtpe("SEE", folderId, pFolderName, pModelFolderId);
                break;
            }
            case "comment": {
                showImageCommentDialog(plinkId, pimgSrc, pfolderId, pmenuType);
                $("#contextMenuContainer").fadeOut();
                break;
            }
            case "explode": {
                window.open(pimgSrc);
                break;
            }
            case "Image tags":
            case "folder tags":
                openMetaTagDialog(pfolderId, plinkId);
                break;
            case "folderInfo": $('#folderInfoContainer').toggle(); break;
            case "imageInfo": $('#imageInfoContainer').toggle(); break;
            case "showLinks": $('#showLinksContainer').toggle(); break;
            case "archive":
                showArchiveLinkDialog(plinkId, pfolderId, pimgSrc, pmenuType);
                break;
            case "copy":
                showCopyLinkDialog(plinkId, pmenuType, pimgSrc);
                $("#imageContextMenu").fadeOut();
                break;
            case "move":
                showMoveLinkDialog(plinkId, pfolderId, pmenuType, pimgSrc);
                $("#imageContextMenu").fadeOut();
                break;
            case "remove":
                $("#imageContextMenu").fadeOut();
                attemptRemoveLink(plinkId, pfolderId, pimgSrc);
                break;
            case "delete":
                $("#imageContextMenu").fadeOut();
                deleteLink(plinkId, pfolderId, pimgSrc);
                break;
            case "reject":
                $("#imageContextMenu").fadeOut();
                showRejectsDialog(plinkId, pfolderId, pimgSrc);
                break;
            case "setF":
                setFolderImage(plinkId, pfolderId, "folder");
                break;
            case "setC":
                setFolderImage(plinkId, pfolderId, "parent");
                break;
            default: {
                logOggleError("SWT", pfolderId, "action: " + action, "oggle ctxMenu action");
            }
        }
    }
}
/*-- context menu actions ---------------------------------*/{
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
            logOggleError("CAT", folderId, e, "set Folder Image")
        }
    }

    function writeAfantasy() {
        $('#centeredDialogTitle').html("move image to rejects");
        $('#centeredDialogContents').html(
            `  <div class='center'><img id='commentDialogImage' class='commentDialogImage' /></div>
            <div><input id='txtCommentTitle' class='roundedInput commentTitleText' tabindex='1' placeholder='Give your comment a title' /></div>
            <div id='imageCommentEditor' tabindex='2'>

            </div>
            <div class='folderDialogFooter'>
                <div id='divSaveFantasy' class='roundendButton clickable commentDialogButton inline' onclick='saveComment()'>save</div>
                <div id='divCloseFantasy' class='roundendButton clickable commentDialogButton inline' onclick='closeImageCommentDialog()'>cancel</div>
                <div id='commentInstructions' class='commentDialogInstructions inline'>log in to view comments</div>
            </div>`);
        $('#centeredDialogContainer').draggable().fadeIn();
    }

    function performMoveImageToRejects(linkId, folderId) {

        //let rejectReason = $('input[name="rdoRejectImageReasons"]:checked').val();
        $('#albumPageLoadingGif').show();
        $.ajax({
            url: 'php/moveToRejects.php?imageFileId=' + linkId,
            success: function (success) {
                $('#albumPageLoadingGif').hide();
                if (success.trim() == "ok") {
                    displayStatusMessage("ok", "image moved to rejects");
                }
                else {
                    alert("move to rejects: " + success);
                    //logError("AJX", 3908, success, "perform MoveImageToRejects");
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                alert("move to rejects: " + errMsg);
            }
        });
    }
}
/*-- hit Counter ---------------------------------------*/{
    function logVisit(calledFrom) {
        try {
            let visitorId = getCookieValue("VisitorId");
            $.ajax({
                type: "POST",
                url: "php/logVisit.php",
                data: {
                    visitorId: visitorId,
                    appName: "OggleBooble"
                },
                success: function (success) {
                    if (success.trim() == "ok") {
                        if (calledFrom == "new visitor")
                            displayStatusMessage("ok", "Welcome New Visitor");
                        else
                            displayStatusMessage("ok", "Welcome back ");
                    }
                    else {
                        switch (success.trim()) {
                            case '23000':
                                //logError("",)
                                break;
                            case '42000':
                            default:
                                alert("logVisit: " + success);
                        }
                    }
                    sessionStorage["VisitLogged"] = "yes";
                },
                error: function (jqXHR, exception) {
                    alert("LogVisit jqXHR : " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        } catch (e) {
            logOggleError("Cat", folderId, e, "log visit")
        }
    }

    function logPageHit(folderId) {
        //$('#footerMessage1').html("logging page hit");
        visitorId = getCookieValue("VisitorId", "log pageHit");
        if (visitorId == "cookie not found") {
            logOggleActivity("PHC", folderId,"log pageHit")
            ipifyLookup("log pageHit");
        }
        else {
            $.ajax({
                type: "POST",
                url: "php/logPageHit.php",
                data: {
                    visitorId: visitorId,
                    pageId: folderId
                },
                success: function (success) {
                    if (success.trim() != "ok") {
                        switch (success.trim()) {
                            case '23000':
                                //logError("",);  // duplicate page hit
                                break;
                            case '42000':
                            default:
                            //alert("logVisit: php error code: " + success);
                        }
                    }
                },
                error: function (jqXHR, exception) {
                    alert("log PageHit error: " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        }
    }

    function addVisitor(ipResponse) {
        visitorId = create_UUID();

//        alert("visitorId:" + visitorId + "  $city: " + ipResponse.city + ", $region: " + ipResponse.region +
//            "\ncountry: " + ipResponse.country + "  loc: " + ipResponse.loc + " ip: " + ipResponse.ip);


        $.ajax({
            type: "POST",
            url: "php/addVisitor.php",
            data: {
                visitorId: visitorId,
                ip: ipResponse.ip,
                city: ipResponse.city,
                region: ipResponse.region,
                country: ipResponse.country,
                loc: ipResponse.loc
            },
            success: function (success) {
                if (success.trim() == "ok") {
                    localStorage["VisitorId"] = visitorId;
                    logVisit("new visitor");
                }
                else {
                    switch (success.trim()) {
                        case '23000':
                            //logError("",);  // duplicate page hit
                            break;
                        case '42000':
                        default:
                            alert("logVisit: php error code: " + success);
                    }
                }
            },
            error: function (jqXHR, exception) {
                alert("log PageHit error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });

        //addVisitor({
        //    city: "Dallas",
        //    country: "US",
        //    hostname: "072-190-028-092.res.spectrum.com",
        //    ip: "72.190.28.92",
        //    loc: "32.9322,-96.8353",
        //    org: "AS11427 Charter Communications Inc",
        //    postal: "75244",
        //    region: "Texas",
        //    timezone: "America/Chicago",
        //    [[Prototype]]: Object
        //});
    }
}
/*-- exploding image view ------------------------------*/{
    const viewerOffsetTop = 44, explodeSpeed = 22, heightIncrement = 22;
    let viewerH, viewerMaxH;

    function showMaxSizeViewer(imgSrc, calledFrom) {
        //logEvent("EXP", folderId, pFolderName, linkId);
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

        //replaceFullPage(imgSrc);
    }

    function viewImage(imgSrc, linkId) {
        currentImagelinkId = linkId;
        imageViewerVisible = true;
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
        imageViewerVisible = false;
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
            logOggleError("CAT", -874, e, "show slideshow")
        }
    }
    function closeExploderDiv() {
        $('#exploderDiv').hide();
        //$("#divSlideshowButton").hide();
        //$("#viewerCloseButton").hide();
        $("#vailShell").hide();
    }
}
/*-- dialog windows --------------------------------------*/{
    function showRejectsDialog(linkId, folderId, imgSrc) {
        $('#centeredDialogTitle').html("move image to rejects");
        $('#centeredDialogContents').html(
            "<form id='frmReject>'\n" +
            "    <div class='inline'><img id='linkManipulateImage' class='ctxDialogImage' src='" + imgSrc + "'/></div>\n" +
            "    <div><input type='radio' value='DUP' name='rdoRejectImageReasons' checked='checked'></input>  duplicate</div>\n" +
            "    <div><input type='radio' value='BAD' name='rdoRejectImageReasons'></input>  bad link</div>\n" +
            "    <div><input type='radio' value='LOW' name='rdoRejectImageReasons'></input>  low quality</div>\n" +
            "    <div class='roundendButton' onclick='performMoveImageToRejects(\"" + linkId + "\"," + folderId + ")'>ok</div>\n" +
            "</form>");
        $('#centeredDialogContainer').draggable().fadeIn();
    }

    function showFileDetailsDialog(folderId) {
        try {  // GetQuickFolderInfo
            if (typeof pause === 'function') pause();

            $("#centeredDialogTitle").html("loading");

            $("#centeredDialogContents").html(`
            <div class='flexbox'>
                <div class='inline'>
                    <table>
                        <thead><tr><th></th></tr></thead>
                        <tbody>
                        <tr><td>name        </td><td><input id='txtFolderName'></input></td></tr>
                        <tr><td>home country</td><td><input id='txtHomeCountry'></input></td></tr>
                        <tr><td>hometown    </td><td><input id='txtHometown'></input></td></tr>
                        <tr><td>nationality </td><td><input id='txtNationality'></input></td></tr>
                        <tr><td>born        </td><td><input id='txtBorn'></input></td></tr>
                        <tr><td>boobs       </td><td><select id='selBoobs' class='boobDropDown'>
                                    <option value=0>Real</option><option value=1>Fake</option></td></tr>
                        <tr><td>figure      </td><td><input id='txtMeasurements'></input></td></tr>
                        <tbody>
                    </table>
                </div>
                <div class='inline'>
                    <img id='modelDialogThumbNailImage' src='https://common.ogglefiles.com/img/redballon.png' class='folderDetailsDialogImage' />
                </div>
            </div>
            <div id='summernoteContainer'></div>
            <div id='folderInfoDialogFooter' class='folderDialogFooter'>
                <div id='btnCatDlgEdit' class='folderCategoryDialogButton' onclick='editFolderDialog()'>Edit</div>
                <div id='btnCatDlgDone' class='folderCategoryDialogButton' onclick='doneEditing()'>Done</div>
                <div id='btnCatDlgLinks' class='folderCategoryDialogButton' onclick='showTrackbackDialog()'>Trackback Links</div>
            </div>
            <div id='trackBackDialog' class='floatingDialogBox'></div>`);


            //$(".note-editable").css('font-size', '16px');
            //$('#centeredDialogContainer').css("top", 111);
            //$('#centeredDialogContainer').css("left", -350);
            //$("#btnCatDlgDone").hide();
            //$("#btnCatDlgLinks").hide();
            $('#summernoteContainer').summernote({ toolbar: "none" });
            //$('#summernoteContainer').summernote('disable');
            $(".note-editable").css({ 'font-size': '16px', 'min-height': '186px' });

            //if (localStorage["IsLoggedIn"] == "false") {
            //    showMyAlert("you must be logged in to edit folder comments");
            //    $("#btnCatDlgEdit").hide();
            //    $("#btnCatDlgLinks").hide();
            //}

            $('#centeredDialogContainer').css({ "top": 33 + $(window).scrollTop() });
            $('#centeredDialogContainer').draggable().fadeIn();
            $('#centeredDialogContainer').mouseleave(function () {
                if (allowDialogClose)
                    $('#centeredDialogContainer').fadeOut();
            });

            let sql = "select * from CategoryFolder f " +
                " left join FolderDetail d on f.Id = d.FolderId where FolderId=" + folderId;
            $.ajax({
                url: "php/yagdrasselFetch.php?query=" + sql,
                success: function (folderInfo) {
                    $('#albumPageLoadingGif').hide();
                    if (folderInfo.Success === "ok") {
                        $('#txtFolderName').val(folderInfo.FolderName);
                        $('#txtHomeCountry').val(folderInfo.FolderName);
                        $('#txtHometown').val(folderInfo.FolderName);
                        $('#txtBorn').val(folderInfo.FolderName);
                        $('#txtFolderName').val(folderInfo.FolderName);
                        $("#centeredDialogTitle").html(folderInfo.FolderName);

                        //objFolderInfo.Nationality = $('#txtNationality').val();
                        //objFolderInfo.Measurements = $('#txtMeasurements').val();
                        //objFolderInfo.Boobs = $('#selBoobs').val();
                        //objFolderInfo.CommentText = $('#modelInfoDialogComment').summernote('code');
                        //objFolderInfo.ExternalLinks = $('#externalLinks').summernote('code');
                        //objFolderInfo.LinkStatus = $('#txtStatus').val();

                        //$('#txtEdtFolderName').val(folderInfo.FolderName);
                        //$("#centeredDialogTitle").html(folderInfo.FolderName);
                        //$("#summernoteContainer").summernote("code", folderInfo.FolderComments);

                        //$('#aboveImageContainerMessageArea').html("aFolderType: " + rtnFolderInfo.FolderType);
                        //multiModel	488
                        //multiFolder	394
                        switch (folderInfo.FolderType) {
                            case "singleModel":
                            case "singleParent":
                                showFullModelDetails(folderId);
                                break;
                            //case "singleChild":
                            //    showFullModelDetails(folderInfo.Parent);
                            //    break;
                        }

                        //logEvent("SMD", folderId, calledFrom, "folder type: " + folderInfo.FolderType);
                    }
                    else logOggleError("AJX", folderId, folderInfo.Success, "GetQuickFolderInfo");
                },
                error: function (jqXHR) {
                    logOggleError("XHR", folderId, getXHRErrorDetails(jqXHR), "show file details dialog");
                }
            });
        }
        catch (e) {
            $('#albumPageLoadingGif').hide();
            logOggleError("CAT", folderId, e, "show file details dialog");
        }
    }

    function showFolderInfoDialog(folderId) {
        try {  // GetQuickFolderInfo
            if (typeof pause === 'function') pause();
            //$("#centeredDialogTitle").html("loading");
            $("#centeredDialogContents").html(`
                <div>
                    <div><input id='txtFolderName'></div>
                    <div id='summernoteContainer'></div>
                    <div id='folderInfoDialogFooter' class='folderDialogFooter'>
                        <div id='btnCatDlgEdit' class='folderCategoryDialogButton' onclick='editFolderDialog()'>Edit</div>
                        <div id='btnCatDlgDone' class='folderCategoryDialogButton' onclick='doneEditing()'>Cancel</div>
                    </div>
                </div>`);

            $("#btnCatDlgDone").hide()
            $("#btnCatDlgEdit").on("click", function () {
                if ($("#btnCatDlgEdit").html() == "Save") {

                }
                else {
                    $("#btnCatDlgEdit").html("Save");
                    $("#btnCatDlgDone").show()
                }
            });

            editFolderDialog

            //$(".note-editable").css('font-size', '16px');
            //$('#centeredDialogContainer').css("top", 111);
            //$('#centeredDialogContainer').css("left", -350);
            //$("#btnCatDlgEdit").hide();
            $('#summernoteContainer').summernote({ toolbar: "none" });
            //$('#summernoteContainer').summernote('disable');
            $(".note-editable").css({ 'font-size': '16px', 'min-height': '186px' });

            //if (localStorage["IsLoggedIn"] == "false") {
            //    showMyAlert("you must be logged in to edit folder comments");
            //    $("#btnCatDlgEdit").hide();
            //    $("#btnCatDlgLinks").hide();
            //}

            $('#centeredDialogContainer').css({ "top": 33 + $(window).scrollTop() });
            $('#centeredDialogContainer').draggable().fadeIn();
            $('#centeredDialogContainer').mouseleave(function () {
                if (allowDialogClose) centeringDialogClose();
            });

            $.ajax({
                url: "php/registroFetch.php?query=select * from CategoryFolder f " +
                    " left join FolderDetail d on f.Id = d.FolderId where FolderId=" + folderId,
                success: function (folderInfo) {
                    $('#albumPageLoadingGif').hide();
                    if (folderInfo.Success === "ok") {
                        $('#txtFolderName').val(folderInfo.FolderName);

                        //logEvent("SMD", folderId, calledFrom, "folder type: " + folderInfo.FolderType);
                    }
                    else {
                        logOggleError("AJX", folderId, folderInfo.Success, "GetQuickFolderInfo");
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                    if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
                }
            });
        }
        catch (e) {
            $('#albumPageLoadingGif').hide();
            logOggleError("CAT", folderId, e, "show folderInfo dialog");
        }
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

    function showCopyLinkDialog(linkId, menuType, imgSrc) {

        slideShowButtonsActive = false;
        //showDirTreeDialog(imgSrc, menuType, "Caterogize Link");
        $('#linkManipulateClick').html("<div class='roundendButton' onclick='perfomCopyLink(\"" + linkId + "\")'>Caterogize</div>");
    }

    function showDirTreeDialog(imgSrc, menuType, title) {
        //alert("showDirTreeDialog.  menuType: " + menuType);
        slideShowButtonsActive = false;
        let dirTreeDialogHtml = `<div>
                   <div class='inline'><img id='linkManipulateImage' class='copyDialogImage' src='" + imgSrc + "'/></div>
                   <div id='dirTreeResults' class='pusedoTextBox'></div>
                   <div class='inline'><img class='dialogDirTreeButton' src='/Images/caretDown.png' "
                       onclick='$(\"#linkManipulateDirTree\").toggle()'/></div>
                   <div id='linkManipulateClick'></div>
                   <div id='linkManipulateDirTree' class='hideableDropDown'><img class='ctxloadingGif' title='loading gif' alt='' src='Images/loader.gif' /></div>
               </div>`;

        $('#centeredDialogContents').html(dirTreeDialogHtml);
        $('#centeredDialogTitle').html(title);
        $('#centeredDialogContainer').css("top", 33);
        $('#centeredDialogContainer').draggable().fadeIn();

        if (isNullorUndefined(tempDirTree)) {
            showHtmlDirTree("linkManipulateDirTree");
            tempDirTree = $("linkManipulateDirTree").html();
            //loadDirectoryTree(1, "linkManipulateDirTree", false);
        }
        else {
            $('#dashBoardLoadingGif').show();
            $("linkManipulateDirTree").html(tempDirTree);
            $('#dashBoardLoadingGif').hide();
            //console.log("loaded linkManipulateDirTree from temp");
        }
        //var winH = $(window).height();
        //var dlgH = $('#centeredDialog').height();
    }

    var objFolderInfo = {}, allowDialogClose = true;

    function showFullModelDetails(folderId) {
        $('#albumPageLoadingGif').show();
        $("#modelInfoDetails").html(modelInfoDetailHtml());
        $('#readonlyPoserDetails').show();
        $('#editablePoserDetails').hide();

        //$('#btnCatDlgCancel').hide();
        //$('#btnCatDlgMeta').hide();

        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/FolderDetail/GetFullFolderInfo?folderId=" + folderId,
            success: function (folderInfo) {
                $('#albumPageLoadingGif').hide();
                if (folderInfo.Success === "ok") {
                    objFolderInfo = folderInfo;
                    $('#centeredDialogTitle').html(folderInfo.FolderName);
                    $('#modelDialogThumbNailImage').attr("src", folderInfo.FolderImage);
                    $('#txtFolderName').val(folderInfo.FolderName);
                    $('#txtBorn').val(dateString(folderInfo.Birthday));
                    $('#txtHomeCountry').val(folderInfo.HomeCountry);
                    $('#txtHometown').val(folderInfo.HomeTown);
                    $('#txtBoobs').val(((folderInfo.FakeBoobs) ? "fake" : "real"));
                    $('#txtMeasurements').val(folderInfo.Measurements);
                    setReadonlyFields();
                    $("#btnCatDlgLinks").show();
                    $("#summernoteContainer").summernote("code", folderInfo.FolderComments);
                }
                else {
                    $('#albumPageLoadingGif').hide();
                    logError("AJX", folderId, folderInfo.Success, "show FullModelDetails");
                }
            },
            error: function (jqXHR) {
                $('#albumPageLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "show FullModelDetails")) logError("XHR", folderId, errMsg, "show FullModelDetails");
            }
        });
    }

    function modelInfoDetailHtml() {

        //if (localStorage["IsLoggedIn"] == "true") {
        //    $('#folderInfoDialogFooter').append(
        //        "        <div id='btnCatDlgLinks' class='folderCategoryDialogButton' onclick='showTrackbackDialog()'>Trackback Links</div>\n");
        //}
        //    "        <div id='btnCatDlgMeta' class='folderCategoryDialogButton' onclick='addMetaTags()'>add meta tags</div>

    }

    // ADD EDIT FOLDER INFO
    function setReadonlyFields() {
        $('#readOnlyFolderName').html(objFolderInfo.FolderName);
        $('#readOnlyBorn').html(isNullorUndefined(objFolderInfo.Birthday) ? "_ " : dateString(objFolderInfo.Birthday));
        $('#readOnlyHomeCountry').html(isNullorUndefined(objFolderInfo.HomeCountry) ? " " : objFolderInfo.HomeCountry);
        $('#readOnlyHometown').html(isNullorUndefined(objFolderInfo.HomeTown) ? " " : objFolderInfo.HomeTown);
        $('#readOnlyBoobs').html(isNullorUndefined(objFolderInfo.FakeBoobs) ? 0 : objFolderInfo.FakeBoobs ? "fake" : "real");
        $('#readOnlyMeasurements').html(isNullorUndefined(objFolderInfo.Measurements) ? " " : objFolderInfo.Measurements);
    }
    function editFolderDialog() {
        if ($('#btnCatDlgEdit').html() === "Save") {
            saveFolderDialog();
            return;
        }
        allowDialogClose = false;

        //objFolderInfo.FolderType = folderInfo.FolderType;
        $('#divEdtFolderName').show();

        $('#editablePoserDetails').show();
        $('#readonlyPoserDetails').hide();
        $('#btnCatDlgEdit').html("Save");
        $('#summernoteContainer').summernote("destroy");
        $('#summernoteContainer').summernote({
            toolbar: [['codeview']],
            height: "200"
        });
        $('#summernoteContainer').focus();
        $('#summernoteContainer').summernote('focus');
        //$(".note-editable").css('font-size', '16px');
        //alert("summernote('code'):" + $('#summernoteContainer').summernote('code'))

        $("#txtBorn").datepicker();
        //$('#selBoobs').val(objFolderInfo.FakeBoobs ? 1 : 0).change();
    }
    function saveFolderDialog() {
        $('#albumPageLoadingGif').show();
        // LOAD GETS
        // alternamtive folderName $('#txtFolderName').val(rtnFolderInfo.FolderName);
        objFolderInfo.FolderName = $('#txtEdtFolderName ').val();
        objFolderInfo.Birthday = $('#txtBorn').val();
        objFolderInfo.HomeCountry = $('#txtHomeCountry').val();
        objFolderInfo.HomeTown = $('#txtHometown').val();
        objFolderInfo.Measurements = $('#txtMeasurements').val();
        objFolderInfo.FakeBoobs = $('#selBoobs').val() == 1;
        objFolderInfo.FolderComments = $('#summernoteContainer').summernote('code');
        //folderInfo.ExternalLinks = $('#externalLinks').summernote('code');
        //folderInfo.LinkStatus = $('#txtStatus').val();
        $.ajax({
            type: "PUT",
            url: settingsArray.ApiServer + "/api/FolderDetail/AddUpdate",
            data: objFolderInfo,
            success: function (success) {
                $('#albumPageLoadingGif').fadeOut();
                if (success === "ok") {
                    displayStatusMessage("ok", "category description updated");
                    //awardCredits("FIE", objFolderInfo.Id);
                    $("#btnCatDlgDone").show();
                    $('#summernoteContainer').focus();
                    $('#summernoteContainer').summernote('focus');
                    $('#summernoteContainer').summernote('focus');
                }
                else {
                    logError("AJX", objFolderInfo.Id, success, "saveFolderDialog");
                }
            },
            error: function (jqXHR) {
                $('#albumPageLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", objFolderInfo.Id, errMsg, functionName);
            }
        });
    }
    function doneEditing() {
        allowDialogClose = true;
        $("#btnCatDlgDone").hide();
        $('#btnCatDlgEdit').html("Edit");

        $('#editablePoserDetails').hide();
        $('#readonlyPoserDetails').show();
        $('#summernoteContainer').summernote("destroy");
        $('#summernoteContainer').summernote({
            toolbar: "none",
            height: "200"
        });
    }

    function clearGets() {
        $('#txtLinkHref').val('');
        $('#txtLinkLabel').val('');
        $('#txtFolderName').val('');
        $('#txtBorn').val('');
        $('#modelInfoDialogComment').html('');
        $('#txtNationality').val('');
        $('#txtStatus').val('');
        $('#externalLinks').html('');
    }

    function updateFolderDetail() {
        loadGets();
        $.ajax({
            type: "PUT",
            url: settingsArray.ApiServer + "api/FolderDetail/AddUpdate",
            data: objFolderInfo,
            success: function (success) {
                if (success === "ok") {
                    displayStatusMessage("ok", "Model info updated");
                }
                else {
                    logError("AJX", objFolderInfo.Id, success, "updateFolderDetail");
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", objFolderInfo.Id, errMsg, functionName);
            }
        });
    }

    ///////////////// TRACKBACK DIALOG  ////////////
    function showTrackbackDialog() {
        //$('#btnCatDlgEdit').html("pause");
        allowDialogClose = false;
        $("#trackBackDialog").html(`
            <div>
               <div id='bb'class='oggleDialogHeader'>" +
                   <div id='cc' class='oggleDialogTitle'>Trackback Links</div>" +
                   <div id='ddd' class='oggleDialogCloseButton'><img src='/images/poweroffRed01.png' onclick='$(\"#trackBackDialog\").hide()'/></div>
               </div>
               <div>link <input id='txtTrackBackLink'  class='roundedInput' style='width:85%'></input></div>" +
               <div>site <select id='selTrackBackLinkSite' class='roundedInput'>
                      <option value='BAB'>babepedia</option>
                      <option value='BOB'>boobpedia</option>
                      <option value='IND'>Indexx</option>
                      <option value='FRE'>freeones</option>
                   </select></div>
               <div>status<input id='txtTrackBackStatus' class='roundedInput'></input></div>" +
               <div class='tbResultsContainer'>" +
                   <ul id='ulExistingLinks'></ul>" +
               </div>
               <div class='folderDialogFooter'>
                   <div id='btnTbDlgAddEdit' class='folderCategoryDialogButton' onclick='tbAddEdit()'>add</div>
                   <div id='btnTbDlgDelete' class='folderCategoryDialogButton displayHidden' onclick='tbDelete()'>delete</div>
                   <div id='btnTbAddCancel' class='folderCategoryDialogButton' onclick='btnTbAddCancel()'>Cancel</div>
               </div>
            </div>`);

        $("#trackBackDialog").css("top", 150);
        $("#trackBackDialog").css("left", -550);
        $('#selTrackBackLinkSite').val("").attr('disabled', 'disabled');
        $('#txtTrackBackStatus').val("").attr('disabled', 'disabled');
        $('#txtTrackBackLink').val("").attr('disabled', 'disabled');
        $('#btnTbAddCancel').hide();
        $("#trackBackDialog").draggable().show();
        loadTrackBackItems();
    }
    function loadTrackBackItems() {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/FolderDetail/GetTrackBackLinks?folderId=" + objFolderInfo.FolderId,
            success: function (trackbackModel) {
                if (trackbackModel.Success === "ok") {
                    $('#ulExistingLinks').html("");
                    objFolderInfo.TrackBackItems = trackbackModel.TrackBackItems;
                    $.each(trackbackModel.TrackBackItems, function (idx, obj) {
                        $('#ulExistingLinks').append("<li class='clickable' onclick='loadTbForEdit(" + idx + ")' >" + obj.SiteCode + " - " + obj.LinkStatus + "</li>");

                    });
                }
                else {
                    logError("AJX", objFolderInfo.FolderId, trackbackModel.Success, "loadTrackBackItems");
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", objFolderInfo.Id, errMsg, functionName);
            }
        })
    }
    function btnTbAddCancel() {
        if ($('#btnTbAddCancel').html() === "cancel") {
            $('#btnTbAddCancel').hide();
            $('#selTrackBackLinkSite').val("").attr('disabled', 'disabled');
            $('#txtTrackBackStatus').val("").attr('disabled', 'disabled');
            $('#txtTrackBackLink').val("").attr('disabled', 'disabled');
            $('#btntbdlgaddedit').html("add");
        }
    }
    function loadTbForEdit(idx) {
        let selectedLink = objFolderInfo.TrackBackItems[idx];
        $('#selTrackBackLinkSite').val(selectedLink.SiteCode).attr('disabled', 'disabled');
        $('#txtTrackBackStatus').val(selectedLink.LinkStatus).attr('disabled', 'disabled');
        $('#txtTrackBackLink').val(selectedLink.Href).attr('disabled', 'disabled');
        $('#btnTbDlgAddEdit').html("edit");
    }
    function tbAddEdit() {
        if ($('#btnTbDlgAddEdit').html() === "add") {
            $('#selTrackBackLinkSite').val("").removeAttr('disabled');
            $('#txtTrackBackStatus').val("").removeAttr('disabled');
            $('#txtTrackBackLink').val("").removeAttr('disabled');
            $('#btnTbDlgAddEdit').html("save");
            $("#btnTbAddCancel").html("cancel").show();
            return;
        }
        if ($('#btnTbDlgAddEdit').html() === "edit") {
            $('#selTrackBackLinkSite').removeAttr('disabled');
            $('#txtTrackBackStatus').removeAttr('disabled');
            $('#txtTrackBackLink').removeAttr('disabled');
            $('#btnTbDlgAddEdit').html("save");
            $("#btnTbAddCancel").html("cancel").show();
            return;
        }
        if ($('#btnTbDlgAddEdit').html() === "save") {
            $.ajax({
                type: "POST",
                url: settingsArray.ApiServer + "api/FolderDetail/AddEditTrackBackLink",
                data: {
                    PageId: objFolderInfo.FolderId,
                    SiteCode: $('#selTrackBackLinkSite').val(),
                    Href: $('#txtTrackBackLink').val(),
                    LinkStatus: $('#txtTrackBackStatus').val()
                },
                success: function (successModel) {
                    if (successModel.Success === "ok") {
                        if (successModel.ReturnValue === "Insert")
                            displayStatusMessage("ok", "trackback link added");
                        else
                            displayStatusMessage("ok", "trackback link updated");

                        loadTrackBackItems();

                        $('#btnTbDlgAddEdit').html("add");
                        $('#selTrackBackLinkSite').val("");
                        $('#txtTrackBackStatus').val("");
                        $('#txtTrackBackLink').val("");
                        $('#btnTbDlgDelete').hide();
                    }
                    else logError("AJX", folderId, successModel.Success, "addTrackback");
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                    if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", objFolderInfo.Id, errMsg, functionName);
                }
            });
        }
    }
    function tbDelete() { }

    //////////////// Identify Poser ////////////////

    function xxcreatePosersIdentifiedFolder() {
        var defaultParentFolder = 917;
        if (validate()) {
            // step 1:  Create new Ftmp Folder
            $.ajax({
                type: "POST",
                url: settingsArray.ApiServer + "/api/FtpDashBoard/CreateFolder?parentId=" + defaultParentFolder + "&newFolderName=" + objFolderInfo.FolderName,
                success: function (successModel) {
                    $('#dashBoardLoadingGif').hide();
                    if (successModel.Success === "ok") {
                        // step 2: Move Image 
                        displayStatusMessage("ok", "new folder created");
                        //linkId = fileName.Substring(fileName.LastIndexOf("_") + 1, 36);
                        var MoveCopyImageModel = {
                            Mode: "Archive",
                            Link: successModel.FolderImage,
                            SourceFolderId: successModel.FolderId,
                            DestinationFolderId: successModel.ReturnValue
                        };

                        $.ajax({
                            type: "PUT",
                            url: settingsArray.ApiServer + "/api/MoveImage/MoveImage",
                            data: MoveCopyImageModel,
                            success: function (moveImageSuccessModel) {
                                if (moveImageSuccessModel.Success === "ok") {
                                    displayStatusMessage("ok", "image moved to newfolder");
                                }
                                else
                                    logError("AJX", defaultParentFolder, moveImageSuccessModel.Success, "createPosersIdentifiedFolder/MoveImage");
                            },
                            error: function (jqXHR) {
                                let errMsg = getXHRErrorDetails(jqXHR);
                                let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", defaultParentFolder, errMsg, functionName);
                            }
                        });
                    }
                    else
                        logError("AJX", defaultParentFolder, successModel.Success, "createPosersIdentifiedFolder");
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                    if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", defaultParentFolder, errMsg, functionName);
                }
            });
        }
        //// 2. actually create
        //string extension = model.FolderImage.Substring(model.FolderImage.LastIndexOf("."));
        ////string sourceOriginPath = Helpers.GetParentPath(dbParent.Id, true);
        //string linkId = model.FolderImage.Substring(model.FolderImage.LastIndexOf("_") + 1, 36);
        ////string ftpSource = "ftp://50.62.160.105/" + dbParent.RootFolder + ".ogglebooble.com/" + sourceOriginPath + "posers identified/" + model.FolderName + "_" + linkId + extension;

        //string ftpSource = model.FolderImage.Replace("http://", "ftp://50.62.160.105/");
        //string expectedFileName = model.FolderName + "_" + linkId + extension;
        //string ftpDestinationPath = "ftp://50.62.160.105/archive.ogglebooble.com/posers identified/" + model.FolderName;

        //if (!FtpUtilies.DirectoryExists(ftpDestinationPath))
        //    FtpUtilies.CreateDirectory(ftpDestinationPath);

        //success = FtpUtilies.MoveFile(ftpSource, ftpDestinationPath + "/" + expectedFileName);

        //ImageLink goDaddyrow = db.ImageLinks.Where(g => g.Id == linkId).First();
        //goDaddyrow.Link = "http://archive.ogglebooble.com/posers identified/" + model.FolderName + "/" + expectedFileName;
        //goDaddyrow.FolderLocation = newFolderId;

        //db.CategoryImageLinks.Add(new CategoryImageLink() {ImageCategoryId = newFolderId, ImageLinkId = linkId });
        //db.SaveChanges();


        // 2. add new category folder row and folder detail row
    }

    function showUnknownModelDialog(menuType, imgSrc, linkId, folderId) {
        let unknownModelDialogHtml =
            "<div class='flexContainer'>" +
            "   <div class='floatLeft'>" +
            "          <div class='inline'><img id='linkManipulateImage' class='copyDialogImage' src='" + imgSrc + "'/></div>\n" +
            "   </div>" +

            "   <div id='unknownPoserDialog' class='floatLeft'>" +
            "       <div>If you you know who this is<br/>please <a class='dialogEditButton' href='javascript:showIdentifyPoserDialog()'>identify poser</a></div>\n" +
            "       <br/>" +
            "       <a class='dialogEditButton' href='javascript:IamThisModel()'>I am in this image</a>\n" +
            "   </div>" +

            "   <div id='identifyPoserDialog' class='floatLeft displayHidden' style='width:400px'>\n" +
            "       <span>I think this poser&apos;s name is</span><input id='txtPoserIdentified' class='roundedInput'></input>\n" +
            "       <div>comment</div>" +
            "       <div class='modelInfoCommentArea'>\n" +
            "          <textarea id='poserSummernoteContainer'></textarea>\n" +
            "       </div>\n" +
            "   </div>" +
            "</div>" +
            "<div id='poserDialogFooter' class='folderDialogFooter'>\n" +
            "   <div id='btnPoserSave' style='margin-left:114px;'  class='folderCategoryDialogButton' onclick='poserSave(\"" + linkId + "\"," + folderId + ")'>save</div>\n" +
            "   <div id='btnPoserCancel' class='folderCategoryDialogButton' onclick='centeringDialogClose()'>cancel</div>\n" +
            "</div>";



        if (menuType == "SlideShow") {
            $('#slideShowDialogTitle').html("Unknown Poser");
            $('#slideShowDialogContents').html(unknownModelDialogHtml);
            $('#slideShowDialogContainer').draggable().fadeIn();
        }
        else {
            $('#centeredDialogTitle').html("Unknown Poser");
            $('#centeredDialogContents').html(unknownModelDialogHtml);
            $('#centeredDialogContainer').css("top", 125);
            $('#centeredDialogContainer').css("left", -350);
            $('#centeredDialogContainer').draggable().fadeIn();
        }

        //$('#centeredDialogContainer').css("min-width", 470);
        //$('#centeredDialogContainer').mouseleave(function () { centeringDialogClose(); });
        $('#poserSummernoteContainer').summernote({
            toolbar: [['codeview']],
            height: "100"
        });
        $("#btnPoserSave").hide();
        $("#btnPoserCancel").hide();
        allowDialogClose = true;
    }
    function IamThisModel() {
        alert("IamThisModel clicked");

    }
    function showIdentifyPoserDialog() {
        $('#centeredDialogTitle').html("Identify Unknown Poser");
        $("#identifyPoserDialog").show();
        $("#unknownPoserDialog").hide();
        $("#btnPoserSave").show();
        $("#btnPoserCancel").show();
        allowDialogClose = false;
    }

    function poserSave(linkId, folderId) {
        let visitorId = getCookieValue("VisitorId", "poser Save");
        if (document.domain !== "localhost")
            sendEmail("CurtishRhodes@hotmail.com", "PoserIdentified@Ogglebooble.com", "poser identified !!!", +
                "suggested name: " + $('#txtPoserIdentified').val() + "<br/>" +
                "visitor: " + visitorId + "<br/>" +
                "folderId: " + folderId + "<br/>" +
                "linkId: " + linkId);
        else
            alert("sendEmail(CurtishRhodes@hotmail.com, PoserIdentified@Ogglebooble.com,\nposer identified !!!\n" +
                "suggested name: " + $('#txtPoserIdentified').val() +
                "\nvisitor: " + visitorId + "\nfolderId: " + folderId + "\nlinkId: " + linkId
            );

        showMyAlert("Thank you for your input\nYou have earned 1000 credits.");
        logEvent("FBS", folderId, "poser identified", "link: " + linkId);
        centeringDialogClose();
    }

    function addHrefToExternalLinks() {
        alert("addHrefToExternalLinks: " + $('#txtLinkHref').val());
        $('#externalLinks').summernote('pasteHTML', "<a href=" + $('#txtLinkHref').val() + " target = '_blank'>" + $('#txtLinkLabel').val() + "</a><br/>");
        addTrackback($('#txtLinkHref').val());
        $('#txtLinkHref').val('');
        $('#txtLinkLabel').val('');
    }
    function addMetaTags() {

        //openMetaTagDialog(categoryFolderId);
    }
}

function displayFeedback() {
    alert("displayFeedback");
    //\"FLC\",\"feedback\", rootFolder + "\", folderId + "
}


/* -------- not used -----------*/{
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
}