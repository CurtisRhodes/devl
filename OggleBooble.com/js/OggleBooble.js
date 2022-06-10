const settingsImgRepo = 'https://ogglefiles.com/danni/';
let slideshowVisible = false, imageViewerVisible = false;

/*-- verify user -----------------------------------*/{
    function verifyUser(folderId, calledFrom) {

        if (isNullorUndefined(sessionStorage["VisitorIdVerified"])) {
            if (!window.sessionStorage) {
                logOggleError("V30", folderId, "session storage not recognized", "verify user");
                return;
            }
            sessionStorage["VisitorIdVerified"] = "ok";
            let visitorId = getCookieValue("VisitorId");
            if (visitorId == "cookie not found") {
                logOggleActivity("CNF", folderId, "verify user");  // new visitor cookie not found
                ipifyLookup(folderId, "session verify");
            }
            else {
                // happy path
                if (!isNullorUndefined(calledFrom)) {
                    recordHitSource(calledFrom, folderId);
                }
                verifyVisitorId(folderId, visitorId, "verify user");
                logOggleActivity("NSS", folderId, "verifyNewUser") // new session started
            }
        }
    }

    function verifyVisitorId(folderId, visitorId, calledFrom) {
        try {
            if (isGuid(visitorId)) {
                $.ajax({
                    type: "GET",
                    url: "php/registroFetch.php?query=Select * from Visitor where VisitorId='" + visitorId + "'",
                    success: function (data) {
                        if (data == "false") {
                            if (calledFrom = "verify user") {
                                logOggleActivity("VV3", folderId, visitorId);  //  visitorId from cookie not found in db
                            }
                            if (calledFrom = "log pageHit") {
                                logOggleActivity("VV1", folderId, visitorId);  //  log page hit visitorId not found in db
                                ipifyLookup(folderId, "log pageHit");
                            }
                        }
                        else {
                            if (calledFrom = "verify user") {
                                logOggleActivity("VV0", folderId, "verify Visitor"); // new session verified ok
                                logVisit("visitor verified");
                            }
                            if (calledFrom = "log pageHit") {
                                if (data.Country == "ZZ") {
                                    logOggleActivity("VV2", folderId, "verify Visitor"); // new session verified ok
                                }
                            }
                        }
                    },
                    error: function (jqXHR) {
                        logOggleError("XHR", -5904, getXHRErrorDetails(jqXHR), "verify VisitorId")
                    }
                });
            }
            else {
                logOggleError("V34", folderId, "wierd visitorId")
                // ipifyLookup("wierd visitorId");
            }
        } catch (e) {
            logOggleError("CAT", folderId, e, "verify VisitorId")
        }
    }

    function ipifyLookup(folderId, calledFrom) {
        // logOggleActivity("FY0", folderId, "calling", "ipify lookup");
        try {
            $.ajax({
                type: "GET",
                url: "https://api.ipify.org",
                success: function (ipifyRtrnIP) {
                    if (isNullorUndefined(ipifyRtrnIP)) {
                        logOggleActivity("FYE", folderId, "ipify lookup");  // ipify empty response
                        // logOggleError("XHR", folderId, "ipify empty response", "ipify lookup");
                    }
                    else {
                        if (calledFrom == "log pageHit") {
                            let visitorId = getCookieValue("VisitorId");
                            if (visitorId == "cookie not found") {
                                logOggleError("DBF", folderId, "double cookie not found", "ipify lookup / log pageHit");
                            }
                            else {
                                logOggleActivity("FY5", folderId, "ipify lookup"); // calling perform IpInfo from log pageHit
                                performIpInfo(folderId, ipifyRtrnIP, visitorId);
                            }
                        }
                        // logOggleActivity("FY1", folderId, "success", "ipify lookup");
                        if (calledFrom == "session verify") {
                            $.ajax({
                                type: "GET",
                                url: "php/registroFetch.php?query=Select * from Visitor where IpAddress='" + ipifyRtrnIP + "'",
                                success: function (data) {
                                    if (data == "false") { 
                                        let visitorId = create_UUID();
                                        localStorage["VisitorId"] = visitorId;
                                        logOggleActivity("FY2", folderId, ipifyRtrnIP);  // ipify IP not in Visitor table

                                        performIpInfo(folderId, ipifyRtrnIP, visitorId);

                                        if (!isNullorUndefined(calledFrom)) {
                                            recordHitSource(calledFrom, folderId);
                                        }
                                    }
                                    else {
                                        let visitorRow = JSON.parse(data);
                                        if (!isNullorUndefined(localStorage["VisitorId"])) {
                                            if (localStorage["VisitorId"] != visitorRow.VisitorId) {
                                                logOggleActivity("FY4", folderId, visitorRow.VisitorId);  //  visitorId mismatch
                                                logOggleError("FY4", folderId,
                                                    "local storage: " + localStorage["VisitorId"] + " does not match visitorRow.VisitorId: " + visitorRow.VisitorId,
                                                    "session verify/ipify lookup");
                                            }
                                        }
                                        else {
                                            logOggleActivity("FY3", folderId, ipifyRtrnIP); // ip in visitor table but cookie not found
                                            localStorage["VisitorId"] = visitorRow.VisitorId;
                                        }
                                    }
                                },
                                error: function (jqXHR) {
                                    logOggleError("XHR", folderId, getXHRErrorDetails(jqXHR), "ipify lookup/fetch Visitor")
                                }
                            });
                        }
                    }
                },
                error: function (jqXHR) {
                    logOggleActivity("FYX", folderId, "ipify lookup fail");
                    logOggleError("IFY", folderId, getXHRErrorDetails(jqXHR), "ipify lookup/" + calledFrom);
                    //addBadVisitor(create_UUID(), folderId, null, "ipify fail");
                }
            });
        }
        catch (e) {
            logOggleError("CAT", folderId, e, "lookup Ip Address")
        }
    }

    function performIpInfo(folderId, ipAddress, visitorId) {
        try {
            logOggleActivity("IP0", folderId, "Ip: " + ipAddress);
            $.ajax({
                type: "GET",
                url: "https://ipinfo.io/" + ipAddress + "?token=e66f93d609e1d8",                
                success: function (ipResponseObject) {
                    if (isNullorUndefined(ipResponseObject)) {
                        logOggleError("IPN", folderId, "null response", "perform IpInfo")
                        logOggleActivity("IP4", folderId, "ipAddress: " + ipAddress);
                    }
                    else {
                        addVisitor(folderId, visitorId, ipResponseObject);
                        logOggleActivity("IP1", folderId, "success Ip: " + ipAddress);
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    if (errMsg.indexOf("Rate limit exceeded") > 0) {
                        logOggleActivity("IP5", folderId, "Ip: " + ipAddress); // "rate limit exceeded"
                        //tryAlternativeLookupServices(folderId, ipAddress);
                        addBadVisitor(visitorId, folderId, ipAddress, "Rate limit exceeded");
                    }
                    else {
                        logOggleError("IPX", folderId, errMsg, "ip: " + ipAddress);
                        addBadVisitor(visitorId, folderId, ipAddress, "ipnfo burn");
                    }
                }
            });
        } catch (e) {
            logOggleActivity("IPC", folderId, "CAT error: " + e);
            logOggleError("CAT", folderId, e, "perform IpLookup");
        }
    }

    function tryAlternativeLookupServices(folderId, ipAddress) {

        logOggleActivity("IP6", folderId, "try Alternative Lookup Services"); // trying getmyipinfo
        $.ajax({
            url: "http://ip-api.com/php/ipAddress",
            // url: "http:/ /getmyipinfo.com?i=1628e640fc6c81",
            success: function (getmyipinfoResponse) {
                if (!isNullorUndefined(getmyipinfoResponse)) {
                    logOggleActivity("IP7", folderId, "ipAddress: " + ipAddress); // getmyipinfo worked
                }
                else {
                    logOggleActivity("IP8", folderId, "Ip: " + ipAddress); // get MyIpinfo null
                }
            },
            error: function (jqXHR) {
                logOggleError("XHR", folderId, getXHRErrorDetails(jqXHR), "try Alternative Lookup Services");
            }
        });

        }

    function recordHitSource(siteCode, folderId) {
        try {
            visitorId = getCookieValue("VisitorId");
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
                        logOggleActivity("PHC", folderId, "siteCode: " + siteCode);
                    }
                    else {
                        switch (success.trim()) {
                            case '23000': // duplicate page hit
                                break;
                            case '42000':
                            default:
                                logOggleError("AJX", folderId, "php code: " + success.trim(), "record hit source");
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
function displayFeedback() {
    alert("displayFeedback");
    //\"FLC\",\"feedback\", rootFolder + "\", folderId + "
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
                        logOggleError("AJX", -444, getXHRErrorDetails(jqXHR), "perform search");
                    }
                });
            } catch (e) {
                logOggleError("CAT", -444, e, "perform search");
            }
        }
    }

    function jumpToSelected(selectedFolderId) {
        //rtpe('SRC', hdrFolderId, searchString, selectedFolderId);
        //logEvent("SRC", selectedFolderId, "jumpToSelected", "searchString: " + searchString);

        clearSearch();

        window.open("https://ogglebooble.com/album.html?folder=" + selectedFolderId, "_blank");  // open in new tab

        var parentOpener = window.opener; window.opener = null; window.open("https://ogglebooble.com/album.html?folder=" + selectedFolderId, "_blank"); window.opener = parentOpener;

    }
}
/*-- log error -----------------------------------------*/{
    let errorActive = false;
    function logOggleError(errorCode, folderId, errorMessage, calledFrom) {
        try {
            if (!errorActive) {
                errorActive = true;
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
                        errorActive = false;
                        if (success.trim() == "ok") {
                            console.log(errorCode + " error from: " + calledFrom + " error: " + errorMessage);
                        }
                        else {
                            if (!success.trim().startsWith("2300"))
                                console.log("log oggle error fail: " + success);
                        }
                    },
                    error: function (jqXHR) {
                        let errMsg = getXHRErrorDetails(jqXHR);
                        console.log("Error log error: " + errMsg);
                        errorActive = false;
                    }
                });
            }
        } catch (e) {
            console.log("logOggle error not working: " + e);
            errorActive = false;
        }
    }

    function imageError(folderId, linkId, calledFrom) {
        try {

            // $('#' + vLink.LinkId + '').append(`<div class='knownModelIndicator'>


            setTimeout(function () {
                if ($('#' + folderId).attr('src') == null) {
                    $('#' + linkId + '').attr('src', 'https://common.ogglebooble.com/img/redballon.png');
                    logOggleError("ILF", folderId, "Src: " + linkId, calledFrom);
                    //console.log("imageError: IMG. folder: " + folderId + ", linkId: " + linkId + ", calledFrom: " + calledFrom);
                }
            }, 600);
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
            visitorId = getCookieValue("VisitorId");
            $.ajax({
                type: "POST",
                url: "php/logEvent.php",
                data: {
                    eventCode: eventCode,
                    folderId: folderId,
                    visitorId: visitorId,
                    calledFrom: calledFrom
                },
                success: function (success) {
                    if (success.trim() == "ok") {
                        console.log("event logged.  VisitorId: " + visitorId + "  Code: " + eventCode + "  calledFrom: " + calledFrom);
                    }
                    else {
                        console.log("log Oggle event fail: " + success);
                        logOggleError("AJX", folderId, success, "log event");
                    }
                },
                error: function (jqXHR) {
                    logOggleError("XHR", folderId, getXHRErrorDetails(jqXHR), "log event")
                }
            });
        } catch (e) {
            logOggleError("CAT", folderId, e, "log Oggle event")
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
            $('#ctxImageName').show().html("<img title='loading gif' alt='' class='ctxloadingGif' src='https://common.ogglebooble.com/img/loader.gif'/>");
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
            $('#ctxFolderName').show().html("<img title='loading gif' alt='' class='ctxloadingGif' src='https://common.ogglebooble.com/img/loader.gif'/>");
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
                        $('#folderInfoRoot').html(folderData.RootFolder);
                        $('#folderInfoType').html(folderData.FolderType);
                        $('#folderInfoFileCount').html(folderData.Files).toLocaleString();
                        $('#folderInfoSubDirs').html(folderData.SubFolders).toLocaleString();
                        $('#folderInfoTotalSubDirs').html(folderData.TotalSubFolders).toLocaleString();
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
            case "showLinks": $('#showLinksContainer').toggle();
                break;
            case "archive":
            case "move":
            case "copy":
                showCopyDialog(plinkId, "copy", pimgSrc);
                $('#contextMenuContainer').fadeOut();
                break;
            case "remove":
                $("#contextMenuContainer").fadeOut();
                performMoveImageToRejects(plinkId, pfolderId);
                break;
            case "delete":
                $("#contextMenuContainer").fadeOut();
                deleteLink(plinkId, pfolderId);
                break;
            case "reject":
                $("#contextMenuContainer").fadeOut();
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
/*-- context menu actions ------------------------------*/{
    function setFolderImage(filinkId, folderId, level) {
        try {
            $.ajax({
                type: "GET",
                url: "php/updateFolderImage.php?folderImage='" + filinkId + "'&folderId=" + folderId + "&level=" + level,
                success: function (success) {
                    if (success.trim().startsWith("ok")) {
                        displayStatusMessage("ok", level + " image set for " + folderId);
                        $("#contextMenuContainer").fadeOut();
                    }
                    else {
                        displayStatusMessage("error", success.trim());
                        logOggleError("AJX", folderId, success, "setFolderImage");
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    displayStatusMessage("error", errMsg);
                    logOggleError("XHR", folderId, errMsg, "set folder image");
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

    function showCopyDialog(linkId, menuType, imgSrc) {
        $("#centeredDialogTitle").html(menuType + " image");
        $("#centeredDialogContents").html(`
        <div class='fileDialogOuterContainer'>
            <div class='flexContainer'>
                <div id='fileDetailsSection' class='inline'>
                    <div class='dialogButton' onClick='moveCopyImage("` + linkId + `","copy")'>copy</div>
                    <div class='dialogButton' onClick='moveCopyImage("` + linkId + `","move")'>move</div>
                    <div class='dialogButton' onClick='moveCopyImage("` + linkId + `","archive")'>archive</div>
                    <div class='dialogButton' title='move but maintain model name' onClick='moveCopyImage("` + linkId + `","link")'>attribute</div>
                </div>
                <div id='fileImageSection' class='inline'>
                    <img id='modelDialogThumbNailImage' src='` + imgSrc + `' class='moveCopyDialogImage' />
                </div>
            </div>
            <div id='copyDialogDirTreeContainer' class='folderDialogFooter'>
                <div id='showCopyDialogFooter' class='folderDialogFooter'>destination
                    <input id="txtDestFolder"/>
            </div>
        </div>`);
        // $('#copyDialogDirTreeContainer').html("<div class='roundendButton' onclick='perfomCopyLink(\"" + linkId + "\")'>Caterogize</div>");

        $('#centeredDialogContainer').css({ "top": 33 + $(window).scrollTop() });
        $('#centeredDialogContainer').draggable().show();
    }

    function moveCopyImage(linkId, cMode) {
        let destFolder = $('#txtDestFolder').val();
        // alert(cMode + " image: " + linkId);
        //alert(cMode + " folderId: " + folderId);
        switch (cMode) {
            case "copy":
                $.ajax({
                    type: "POST",
                    url: "php/addLink.php",
                    data: {
                        FolderId: destFolder,
                        LinkId: linkId
                    },
                    success: function (success) {
                        $('#contextMenuContainer').fadeOut();
                        $('#albumPageLoadingGif').hide();
                        if (success.trim() == "ok") {
                            displayStatusMessage("ok", "image copied to " + destFolder);
                            logOggleEvent("CPL", destFolder, linkId);
                            // reload page
                            loadAlbumPage(pfolderId, currentIsLargeLoad, null);
                        }
                        else {
                            displayStatusMessage("error", success.trim());
                            logOggleError("AJX", pfolderId, success.trim(), "copy image");
                        }
                    },
                    error: function (jqXHR) {
                        $('#contextMenuContainer').fadeOut();
                        $('#albumPageLoadingGif').hide();
                        let errMsg = getXHRErrorDetails(jqXHR);
                        displayStatusMessage("error", errMsg);
                        logOggleError("XHR", pfolderId, errMsg, "copy image");
                    }
                });
                break;
            case "move":
                //let sql = "UPDATE ImageFile set FolderId=" + newParent + " where Id='" + linkId + "'";
                $.ajax({
                    type: "POST",
                    url: "php/moveLink.php",
                    data: {
                        SourceFolder: sourceFolder,
                        DestFolder: destFolder,
                        LinkId: linkId
                    },
                    success: function () {
                    },
                    error: function () {
                    }
                });
                break;
            case "mush":
                $.ajax({
                    url: "php/physciallyMoveImage.php?imageId=" + linkId + "&destFolder=",
                    success: function () {
                    },
                    error: function () {
                    }
                });
                break;
            default:
        }
    }

    function performMoveImageToRejects(linkId, folderId) {
        //let rejectReason = $('input[name="rdoRejectImageReasons"]:checked').val();
        $('#albumPageLoadingGif').show();
        $.ajax({
            url: 'php/moveToRejects.php?imageFileId=' + linkId,
            success: function (success) {
                $('#contextMenuContainer').fadeOut();
                $('#albumPageLoadingGif').hide();
                if (success.trim() == "ok") {

                    let selectedOption = $("input:radio[name=rdoRejectImageReasons]:checked").val()
                    displayStatusMessage("ok", "image moved to rejects " + selectedOption);
                    logOggleEvent("RJT", folderId, "RejectImageReason: " + selectedOption);
                    // reload page
                    loadAlbumPage(folderId, currentIsLargeLoad, null);
                }
                else {
                    displayStatusMessage("error", success.trim());
                    logOggleError("AJX", folderId, success.trim(), "move to rejects");
                }
            },
            error: function (jqXHR) {
                $('#contextMenuContainer').fadeOut();
                $('#albumPageLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                displayStatusMessage("error", errMsg);
                logOggleError("XHR", folderId, errMsg, "move to rejects");
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
                            case 'code: 23000':
                                //logOggleError("",)
                                break;
                            case '42000':
                            default:
                                logOggleError("AJX", -5477, success.trim(), "log visit");
                        }
                    }
                    sessionStorage["VisitLogged"] = "yes";
                },
                error: function (jqXHR) {
                    logOggleError("XHR", -547705, getXHRErrorDetails(jqXHR), "log visit");
                }
            });
        } catch (e) {
            logOggleError("Cat", folderId, e, "log visit")
        }
    }

    function logPageHit(folderId) {
        try {
            let visitorId = getCookieValue("VisitorId");
            if (visitorId == "cookie not found") {
                visitorId = create_UUID();
                localStorage["VisitorId"] = visitorId;
                ipifyLookup(folderId, "log pageHit");
            }
            else
                verifyVisitorId(folderId, visitorId, "log pageHit");
             
            $.ajax({
                type: "POST",
                url: "php/logPageHit.php",
                data: {
                    visitorId: visitorId,
                    pageId: folderId
                },
                success: function (success) {
                    switch (success.trim()) {
                        case "ok":
                            break;
                        case '23000':
                            //logOggleError("",);  // duplicate page hit
                            break;
                        case '42000':
                        default:
                            logOggleError("AJX", folderId, "php code: " + success.trim(), "log page hit");
                    }
                },
                error: function (jqXHR) {
                    logOggleError("XHR", folderId, getXHRErrorDetails(jqXHR), "log page hit");
                }
            });
        } catch (e) {
            logOggleError("CAT", folderId, e, "log page hit");
        }
    }

    function addVisitor(folderId, visitorId, ipResponse) {
        try {
            $.ajax({
                type: "POST",
                url: "php/addVisitor.php",
                data: {
                    visitorId: visitorId,
                    ip: ipResponse.ip,
                    city: ipResponse.city,
                    region: ipResponse.region,
                    country: ipResponse.country,
                    loc: ipResponse.loc,
                    initialPage: folderId
                },
                success: function (success) {
                    if (success.trim() == "ok") {
                        localStorage["VisitorId"] = visitorId;
                        logVisit("new visitor");
                    }
                    else {
                        switch (success.trim()) {
                            case '23000':
                                logOggleError("BVI", folderId, "Add Visitor Duplicate Ip: " + ipAddress);
                                break;
                            case '42000':
                            default:
                                logOggleError("AJX", folderId, "php error code: " + success, "add visitor");
                        }
                    }
                },
                error: function (jqXHR) {
                    logOggleError("XHR", -36603, getXHRErrorDetails(jqXHR), "add visitor");
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
        } catch (e) {
            logOggleError("CAT", folderId, e, "add visitor");
        }
    }

    function addBadVisitor(visitorId, folderId, ipAddress, failureMessage) {
        try {            
            if (isNullorUndefined(ipAddress)) {
                ipAddress = visitorId;
            }
            $.ajax({
                type: "POST",
                url: "php/addVisitor.php",
                data: {
                    visitorId: visitorId,
                    ip: ipAddress,
                    city: failureMessage,
                    region: "",
                    country: "",
                    loc: "",
                    initialPage: folderId
                },
                success: function (success) {
                    if (success.trim() == "ok") {
                        localStorage["VisitorId"] = visitorId;
                        setCookieValue("VisitorId", visitorId);
                        logOggleActivity("BVA", folderId, failureMessage); // bad visitoriId added
                        logVisit("new visitor");
                    }
                    else {
                        switch (success.trim()) {
                            case '23000':
                                logOggleError("BVI", folderId, "Bad Visitor Duplicate Ip : " + ipAddress);
                                break;
                            case '42000':
                            default:
                                logOggleError("AJX", folderId, "php error code: " + success, "add bad visitor");
                        }
                    }
                },
                error: function (jqXHR) {
                    logOggleError("XHR", folderId, getXHRErrorDetails(jqXHR), "add bad visitor");
                }
            });
        } catch (e) {
            logOggleError("CAT", folderId, e, "add bad visitor");
        }
    }

    function showPageHits(folderId) {
        try {
            $.ajax({
                type: "GET",
                url: "php/registroFetch.php?query=select count(*) as Hits from PageHit where PageId=" + folderId,
                success: function (data) {
                    let pgHits = JSON.parse(data);
                    $('#footerPagehit').html("page hits: " + pgHits.Hits.toLocaleString());
                },
                error: function (jqXHR) {
                    logOggleError("CAT", folderId, getXHRErrorDetails(jqXHR), "verify VisitorId")
                }
            });
        } catch (e) {
            logOggleError("CAT", folderId, e, "verify VisitorId")
        }
    }
}
/*-- exploding image view ------------------------------*/{
    const viewerOffsetTop = 44, explodeSpeed = 22, heightIncrement = 22;

    let viewerH, viewerMaxH, isSlideShowLargeLoad;

    function showMaxSizeViewer(imgSrc, calledFrom) {
        //logEvent("EXP", folderId, pFolderName, linkId);
        //showMaxSizeViewer()
        if (calledFrom == 'slideshow') {
            $("#slideshowCtxMenuContainer").hide();
        }
        else {
            $("#contextMenuContainer").hide();
            $('#viewerImage').attr("src", imgSrc);
        }
        $("#vailShell").show().on("click", function () { closeExploderDiv() });
        $('#singleImageOuterContainer').show();

        //replaceFullPage(imgSrc);
    }

    function viewImage(imgSrc, linkId, isLargeLoad) {
        currentImagelinkId = linkId;
        isSlideShowLargeLoad = isLargeLoad;
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
            $('body').off();
            showSlideshowViewer(currentFolderId, currentImagelinkId, isSlideShowLargeLoad)
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
    function showFileDetailsDialog(folderId) {
        try {
            if (typeof pause === 'function') pause();
            $('#albumPageLoadingGif').show();
            $("#centeredDialogTitle").html("loading");
            $("#centeredDialogContents").html(`
            <div class='fileDialogOuterContainer'>
                <div class='fileDialogTopSection'>
                    <div id='fileDetailsSection' class='inline'>
                        <table>
                            <tr><td>name        </td><td><input id='txtFolderName'></input></td></tr>
                            <tr><td>home country</td><td><input id='txtHomeCountry'></input></td></tr>
                            <tr><td>hometown    </td><td><input id='txtHometown'></input></td></tr>
                            <tr><td>born        </td><td><input id='txtBorn'></input></td></tr>
                            <tr><td>boobs       </td><td><select id='selBoobs' class='boobDropDown'>
                                                        <option value=0>Real</option>
                                                        <option value=1>Fake</option>
                                                </td></tr>
                            <tr><td>figure      </td><td><input id='txtMeasurements'></input></td></tr>
                        </table>
                    </div>
                    <div id='fileImageSection' class='inline'>
                        <img id='modelDialogThumbNailImage' src='https://common.ogglebooble.com/img/redballon.png' class='fileDetailsDialogImage' />
                    </div>
                </div>
                <div class='fileDialogBotomSection'>
                    <div id='summernoteFileContainer'></div>
                </div>
                <div id='folderInfoDialogFooter' class='folderDialogFooter'>
                    <div id='btnFileDlgEdit'  class='dialogButton' >Edit</div>
                    <div id='btnFileDlgDone'  class='dialogButton' onclick='doneEditing()'>Cancel</div>
                    <div id='btnTrackBkLinks' class='dialogButton' onclick='showTrackbackDialog()'>Trackback Links</div>
                </div>
            </div>
            <div id='trackBackDialog' class='floatingDialogBox'></div>`);

            $('#summernoteFileContainer').summernote({ toolbar: [['codeview']] });
            // <tr><td>nationality </td><td><input id='txtNationality'></input></td></tr>
            $(".note-editable").css({ 'font-size': '16px', 'min-height': '186px' });
            $('#txtBorn').datepicker();
            $('#centeredDialogContainer').css({ "top": 33 + $(window).scrollTop() });
            $('#centeredDialogContainer').draggable().show();

            
            $('#btnFileDlgDone').hide();
            $('#btnTrackBkLinks').hide();
            $('#summernoteFileContainer').summernote('disable');

            $("#fileDetailsSection input").prop("disabled", true);

            let sql = `select f.Id, f.FolderName, HomeCountry, HomeTown, FakeBoobs, FolderComments,
                            Measurements, Birthday, concat(f2.FolderPath,'/',i.FileName) as src
                        from CategoryFolder f
                        left join FolderDetail d on f.Id = d.FolderId
                        left join ImageFile i on f.FolderImage = i.Id
                        left join CategoryFolder f2 on i.FolderId = f2.Id
                        where f.Id =` + folderId;
            $.ajax({
                url: "php/yagdrasselFetch.php?query=" + sql,
                success: function (data) {
                    $('#albumPageLoadingGif').hide();
                    if (data == false) {
                        $("#centeredDialogTitle").html("lookup fail");
                        logOggleError("AJX", folderId, "lookup fail", "file details dialog");
                    }
                    else {
                        folderInfo = JSON.parse(data);
                        $("#centeredDialogTitle").html(folderInfo.FolderName);
                        $('#txtFolderName').val(folderInfo.FolderName);
                        $('#txtHomeCountry').val(folderInfo.HomeCountry);
                        $('#txtHometown').val(folderInfo.HomeTown);
                        $('#txtBorn').val(folderInfo.Birthday);
                        $("#txtMeasurements").val(folderInfo.Measurements);
                        $('#summernoteFileContainer').summernote('code', folderInfo.FolderComments);

                        let fdSectionHeight = $("#fileDetailsSection").height();
                        $("#modelDialogThumbNailImage").css("height", fdSectionHeight);

                        $("#modelDialogThumbNailImage").attr("src", settingsImgRepo + folderInfo.src);

                        logOggleEvent("SMD", folderId, "file details dialog")
                    }
                },
                error: function (jqXHR) {
                    $('#albumPageLoadingGif').hide();
                    logOggleError("XHR", folderId, getXHRErrorDetails(jqXHR), "show file details dialog");
                    $("#centeredDialogTitle").html("php error: " + getXHRErrorDetails(jqXHR));
                }
            });

            $('#btnFileDlgEdit').on("click", function () {
                if ($('#btnFileDlgEdit').html() === "Save") {
                    saveFolderDialog(folderId);
                    $('#btnFileDlgEdit').html("Edit");
                    $('#btnFileDlgDone').hide();
                    $('#btnTrackBkLinks').hide();
                    $("#fileDetailsSection input").prop("disabled", true);
                    $('#summernoteFileContainer').summernote('disable');
                }
                else {
                    $('#btnFileDlgEdit').html("Save");
                    $('#btnFileDlgDone').show();
                    $('#btnTrackBkLinks').show();
                    $("#fileDetailsSection input").prop("disabled", false);
                    $('#summernoteFileContainer').summernote('enable');
                    $('.note-editable').trigger('focus');
                }
            });

            $('#btnFileDlgDone').on("click", function () {
                $('#btnFileDlgEdit').html("Edit");
                $('#btnFileDlgDone').hide();
                $('#btnTrackBkLinks').hide();
                $("#fileDetailsSection input").css("enabled", false);
            });
            $('#centeredDialogContainer').mouseleave(function () {
                if ($("#btnFileDlgEdit").html() == "Edit") {
                    $('#centeredDialogContainer').fadeOut();
                }
            });
        }
        catch (e) {
            $('#albumPageLoadingGif').hide();
            $("#centeredDialogTitle").html("program error: " + e);
            logOggleError("CAT", folderId, e, "show file details dialog");
        }
    }
    function saveFolderDialog(folderId) {
        if (($('#txtFolderName').val() == folderInfo.FolderName) && ($('#summernoteFolderContainer').summernote("code") == folderInfo.FolderComments)) {
            $('#folderNameMessage').html("nothing to update");
        }
        else {
            //let txtComments = encodeURI($('#summernoteFileContainer').summernote("code"));
            let txtComments = $('#summernoteFileContainer').summernote("code");
            let birthday = $('#txtBorn').val();
            $.ajax({
                type: "POST",
                url: "php/updateFileInfo.php",
                data: {
                    folderId: folderId,
                    folderName: $('#txtFolderName').val(),
                    country: $('#txtHomeCountry').val(),
                    city: $('#txtHometown').val(),
                    dob: birthday,
                    boobs: $('#selBoobs').val(),
                    figure: $('#txtMeasurements').val(),
                    folderComments: txtComments
                },
                success: function (success) {
                    if (success.trim().startsWith("ok")) {
                        displayStatusMessage("ok", "Folder info updated");

                        logOggleActivity("SMD", folderId, "folder info dialog");
                    }
                    else {
                        $('#centeredDialogTitle').html("update failed: " + success.trim());
                        logOggleError("AJX", folderId, success, "update folderDetail");
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    $('#centeredDialogTitle').html("<span style='color:red'>" + errMsg + "</span>");
                    logOggleError("XHR", folderId, errMsg, "update folderDetail");
                }
            });
        }
    }

    function showFolderInfoDialog(folderId) {
        try { 
            $("#contextMenuContainer").fadeOut();
            if (typeof pause === 'function') pause();
            $("#centeredDialogTitle").html("loading");
            $("#centeredDialogContents").html(`
                <div id='folderNameMessage'></div>
                <div><input id='txtFolderName'></div>
                <div id='summernoteFolderContainer'></div>
                <div id='folderInfoDialogFooter' class='folderDialogFooter'>
                    <div id='btnFolderDlgEdit' class='dialogButton'>Edit</div>
                    <div id='btnFolderDlgDone' class='dialogButton'>Cancel</div   
                </div>`);

            $('#summernoteFolderContainer').summernote({ toolbar: [['codeview']] });
            $(".note-editable").css({ 'font-size': '16px', 'min-height': '186px', 'min-width': '355px' });

            $('#summernoteFolderContainer').summernote('disable');
            $('#txtFolderName').prop("disabled", true);
            $('#centeredDialogContainer').css({ "top": 33 + $(window).scrollTop() });
            $('#centeredDialogContainer').draggable().show();

            $("#btnFolderDlgDone").hide();

            $("#btnFolderDlgEdit").on("click", function () {
                if ($("#btnFolderDlgEdit").html() == "Edit") {
                    $("#btnFolderDlgEdit").html("Save");
                    $('#summernoteFolderContainer').summernote('enable');
                    $('#txtFolderName').prop("disabled", false);
                    $("#btnFolderDlgDone").show();
                    $('.note-editable').trigger('focus');
                }
                else {
                    updateFolderDetail(folderId);
                }
            });

            $("#btnFolderDlgDone").on('click', function () {
                $("#btnFolderDlgEdit").html("Edit");
                $('#summernoteFolderContainer').summernote('enable');
                $('#txtFolderName').prop("disabled", true);
                $("#btnFolderDlgDone").hide();
            });

            function centeringDialogClose() {
                if ($("#btnFolderDlgEdit").html() == "Edit") {
                    $("#vailShell").fadeOut();
                    $('#centeredDialogContainer').fadeOut();
                    if (typeof resume === 'function') resume();
                }
            }

            $.ajax({
                url: "php/yagdrasselFetch.php?query=select FolderName, FolderComments, FolderType from CategoryFolder f " +
                    "left join FolderDetail d on f.Id = d.FolderId where f.Id=" + folderId,
                success: function (data) {
                    if (data != "false") {
                        folderInfo = JSON.parse(data);
                        $("#centeredDialogTitle").html(folderInfo.FolderName);
                        $('#txtFolderName').val(folderInfo.FolderName);
                        $('#summernoteFolderContainer').summernote("code", folderInfo.FolderComments);

                        if (folderInfo.FolderType=='singleChild')
                            $('#folderNameMessage').html("You are encouraged to edit this folder title")


                        $('#centeredDialogContainer').mouseleave(function () {
                            centeringDialogClose();
                        });
                    }
                    else {
                        logOggleError("AJX", folderId, folderInfo.Success, "show folderInfo dialog");
                    }
                },
                error: function (jqXHR) {
                    logOggleError("XHR", folderId, getXHRErrorDetails(jqXHR), "show folderInfo dialog");
                }
            });
        }
        catch (e) {
            logOggleError("CAT", folderId, e, "show folderInfo dialog");
        }
    }
    function updateFolderDetail(folderId) {
        if (($('#txtFolderName').val() == folderInfo.FolderName) && ($('#summernoteFolderContainer').summernote("code") == folderInfo.FolderComments)) {
            $('#folderNameMessage').html("nothing to update");
        }
        else {
            let txtComments = encodeURI($('#summernoteFolderContainer').summernote("code"));

            $.ajax({
                type: "POST",
                url: "php/updateFolderDetail.php",
                data: {
                    folderId: folderId,
                    folderName: $('#txtFolderName').val(),
                    folderComments: txtComments
                },
                success: function (success) {
                    if (success.trim().startsWith("ok")) {
                        displayStatusMessage("ok", "Folder info updated");
                        $('#folderNameMessage').html(success.trim());
                        $("#btnFolderDlgEdit").html("Edit");
                        $("#btnFolderDlgDone").hide();
                        $('#summernoteFolderContainer').summernote('disable');
                        $('#txtFolderName').prop("disabled", true);
                        logOggleActivity("SMD", folderId, "folder info dialog");
                    }
                    else {
                        $('#folderNameMessage').html("update failed: " + success.trim());
                        logOggleError("AJX", folderId, success, "update folderDetail");
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    $('#folderNameMessage').html("<span style='color:red'>" + errMsg + "</span>");
                    logOggleError("XHR", folderId, errMsg, "update folderDetail");
                }
            });
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

    function showDirTreeDialog(imgSrc, menuType, title) {
        slideShowButtonsActive = false;
        let dirTreeDialogHtml = `<div>
                   <div class='inline'><img id='linkManipulateImage' class='copyDialogImage' src='" + imgSrc + "'/></div>
                   <div id='dirTreeResults' class='pusedoTextBox'></div>
                   <div class='inline'><img class='dialogDirTreeButton' src='/Images/caretDown.png' "
                       onclick='$(\"#linkManipulateDirTree\").toggle()'/></div>
                   <div id='linkManipulateClick'></div>
                   <div id='linkManipulateDirTree' class='hideableDropDown'>
                        <img class='ctxloadingGif' title='loading gif' alt='' src='https://common.ogglebooble.com/img/loader.gif'/>
                   </div>
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

    function showRejectsDialog(linkId, folderId, imgSrc) {
        $('#centeredDialogTitle').html("move image to rejects");
        $('#centeredDialogContents').html(
            "<form id='frmReject>'\n" +
            "    <div class='inline'><img id='linkManipulateImage' class='ctxDialogImage' src='" + imgSrc + "'/></div>\n" +
            "    <div><input type='radio' value='DUP' name='rdoRejectImageReasons' checked='checked'></input>  duplicate</div>\n" +
            "    <div><input type='radio' value='BAD' name='rdoRejectImageReasons'></input>  bad link</div>\n" +
            "    <div><input type='radio' value='LOW' name='rdoRejectImageReasons'></input>  low quality</div>\n" +
            "    <div><input type='radio' value='RAW' name='rdoRejectImageReasons'></input>  snatch shot</div>\n" +
            "    <div class='roundendButton' onclick='performMoveImageToRejects(\"" + linkId + "\"," + folderId + ")'>ok</div>\n" +
            "</form>");
        $('#centeredDialogContainer').draggable().fadeIn();
    }
}

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
    //            else {
    //                let activeElement = document.activeElement.id;
    //                $('#topRowRightContainer').html("activeElement: " + activeElement);
    //            }
}

/*--   zzzdialog windows --------------------------------------
    function modelInfoDetailHtml() {

        //if (localStorage["IsLoggedIn"] == "true") {
        //    $('#folderInfoDialogFooter').append(
        //        "        <div id='btnCatDlgLinks' class='dialogButton' onclick='showTrackbackDialog()'>Trackback Links</div>\n");
        //}
        //    "        <div id='btnCatDlgMeta' class='dialogButton' onclick='addMetaTags()'>add meta tags</div>

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
                   <div id='btnTbDlgAddEdit' class='dialogButton' onclick='tbAddEdit()'>add</div>
                   <div id='btnTbDlgDelete' class='dialogButton displayHidden' onclick='tbDelete()'>delete</div>
                   <div id='btnTbAddCancel' class='dialogButton' onclick='btnTbAddCancel()'>Cancel</div>
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
                    logOggleError("AJX", objFolderInfo.FolderId, trackbackModel.Success, "load trackBack items");
                }
            },
            error: function (jqXHR) {
                logOggleError("XHR", objFolderInfo.Id, getXHRErrorDetails(jqXHR), "load trackBack items");
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
                    else logOggleError("AJX", folderId, successModel.Success, "addTrackback");
                },
                error: function (jqXHR) {
                    logOggleError("XHR", objFolderInfo.Id, getXHRErrorDetails(jqXHR), "addTrackback");
                }
            });
        }
    }
    function tbDelete() { }

    //////////////// Identify Poser ////////////////

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
            "   <div id='btnPoserSave' style='margin-left:114px;'  class='dialogButton' onclick='poserSave(\"" + linkId + "\"," + folderId + ")'>save</div>\n" +
            "   <div id='btnPoserCancel' class='dialogButton' onclick='centeringDialogClose()'>cancel</div>\n" +
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
        //$("#btnPoserSave").hide();
        //$("#btnPoserCancel").hide();
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
}//    $("#txtBorn").datepicker();
    //    //$('#selBoobs').val(objFolderInfo.FakeBoobs ? 1 : 0).change();
    //}

    //function saveFolderDialog() {
    //    $('#albumPageLoadingGif').show();
    //    // LOAD GETS
    //    // alternamtive folderName $('#txtFolderName').val(rtnFolderInfo.FolderName);
    //    objFolderInfo.FolderName = $('#txtEdtFolderName ').val();
    //    objFolderInfo.Birthday = $('#txtBorn').val();
    //    objFolderInfo.HomeCountry = $('#txtHomeCountry').val();
    //    objFolderInfo.HomeTown = $('#txtHometown').val();
    //    objFolderInfo.Measurements = $('#txtMeasurements').val();
    //    objFolderInfo.FakeBoobs = $('#selBoobs').val() == 1;
    //    objFolderInfo.FolderComments = $('#summernoteContainer').summernote('code');
    //    //folderInfo.ExternalLinks = $('#externalLinks').summernote('code');
    //    //folderInfo.LinkStatus = $('#txtStatus').val();
    //    $.ajax({
    //        type: "PUT",
    //        url: settingsArray.ApiServer + "/api/FolderDetail/AddUpdate",
    //        data: objFolderInfo,
    //        success: function (success) {
    //            $('#albumPageLoadingGif').fadeOut();
    //            if (success === "ok") {
    //                displayStatusMessage("ok", "category description updated");
    //                //awardCredits("FIE", objFolderInfo.Id);
    //                $("#btnCatDlgDone").show();
    //                $('#summernoteContainer').focus();
    //                $('#summernoteContainer').summernote('focus');
    //                $('#summernoteContainer').summernote('focus');
    //            }
    //            else {
    //                logOggleError("AJX", objFolderInfo.Id, success, "save folderDialog");
    //            }
    //        },
    //        error: function (jqXHR) {
    //            logOggleError("XHR", objFolderInfo.Id, getXHRErrorDetails(jqXHR), "save folderDialog");
    //        }
    //    });
    //}
    //function doneEditing() {
    //    allowDialogClose = true;
    //    $("#btnCatDlgDone").hide();
    //    $('#btnCatDlgEdit').html("Edit");

    //    $('#editablePoserDetails').hide();
    //    $('#readonlyPoserDetails').show();
    //    $('#summernoteContainer').summernote("destroy");
    //    $('#summernoteContainer').summernote({
    //        toolbar: "none",
    //        height: "200"
    //    });
    //}

    //function clearGets() {
    //    $('#txtLinkHref').val('');
    //    $('#txtLinkLabel').val('');
    //    $('#txtFolderName').val('');
    //    $('#txtBorn').val('');
    //    $('#modelInfoDialogComment').html('');
    //    $('#txtNationality').val('');
    //    $('#txtStatus').val('');
    //    $('#externalLinks').html('');
    //}
*/