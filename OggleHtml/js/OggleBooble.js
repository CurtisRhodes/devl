let settingsImgRepo = 'https://ogglefiles.com/danni/';
var busy = false;
var searchString = "";
var itemIndex = -1;
var listboxActive = false;

/*-- php -----------------------------------*/
function getLatestUpdatedGalleries(spaType) {
    let limit = 11;
    try {
        $('#latestUpdatesContainer').html('<img class="tinyloadingGif" src="img/loader.gif"/>');
        $.getJSON('php/getLatestUpdated.php?spaType=' + spaType + '&limit=' + limit, function (data) {
            $('#latestUpdatesContainer').html('');
            $.each(data, function (idx, obj) {
                let thisItemSrc = settingsImgRepo + obj.ImageFile;
                $('#latestUpdatesContainer').append("<div class='latestContentBox'>" +
                    "<div class='latestContentBoxLabel'>" + obj.FolderName + "</div>" +
                    "<img id='lt" + obj.FolderId + "' class='latestContentBoxImage' alt='img/redballon.png' \nsrc='" + thisItemSrc + "' \n" +
                    " onerror='imageError(\"" + obj.FolderId + "\",\"" + thisItemSrc + "\",'LatestUpdatedGalleries'\")'\n" +
                    //"onclick='rtpe(\"LUP\",\"" + obj.RootFolder + "\",\"" + obj.FolderName + "\"," + obj.FolderId + ")' />" +
                    "\nonclick='window.location.href=\"Gallery.html?album=" + obj.FolderId + "\" ' />" +
                    "<div class='latestContentBoxDateLabel'>updated: " + obj.Acquired + "</span></div>" +
                    "</div>");
            });
        });
    } catch (e) {
        $('#latestUpdatesContainer').html(e);
    }
}

function getRandomGalleries(pageContext) {
    let limit = 11;
    try {
        let whereClause = "((f.RootFolder=\"boobs\") or (f.RootFolder=\"archive\") or (f.RootFolder=\"bond\") or (f.RootFolder=\"soft\"))";
        if (pageContext == "porn")
            whereClause = "((f.RootFolder='porn') or (f.RootFolder='sluts') or (f.RootFolder='soft'))";
        if (pageContext == "playboy")
            whereClause = "((f.RootFolder='centerfold') or (f.RootFolder='cybergirl') or (f.RootFolder='muses') or (f.RootFolder='plus') or (f.RootFolder='bond'))";

        let sql = "select f.Id, concat(f2.FolderPath, \"/\", i.FileName) FileName, f.FolderName from CategoryFolder f " +
            "join ImageFile i on f.FolderImage = i.Id join CategoryFolder f2 on i.FolderId = f2.Id " +
            "where " + whereClause + " and f.FolderType !='singleChild' order by rand() limit " + limit + ";";

        $.ajax({
            type: "GET",
            url: "php/getRandomGalleries.php?whereClause=" + whereClause + "&limit=" + limit,
            success: function (data) {
                if (data.indexOf("Fatal error") > 0) {
                    $('#randomGalleriesContainer').html(data);
                }
                else {
                    let fData = JSON.parse(data);
                    $('#randomGalleriesContainer').html('');
                    $.each(fData, function (idx, obj) {
                        let thisItemSrc = settingsImgRepo + obj.FileName;
                        $('#randomGalleriesContainer').append("<div class='latestContentBox'>" +
                            "<div class='latestContentBoxLabel'>" + obj.FolderName + "</div>" +
                            "<img id='lt" + obj.Id + "' class='latestContentBoxImage' " +
                            "alt='Images/redballon.png' src='" + thisItemSrc + "' " +
                            "onclick='window.location.href=\"Gallery.html?album=" + obj.Id + "\" ' /></div>");
                    });
                }
            },
            error: function (jqXHR) {
                $('#albumPageLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                $('#randomGalleriesContainer').html(errMsg)
                //alert("getRandomGalleries: " + errMsg);
                // logError("XHR", folderId, errMsg, "get albumImages");
            }
        });
    } catch (e) {
        alert("getRandomGalleries catch: " + e);
    }
}

function testConnection() {
    $.ajax({    //create an ajax request to display.php
        type: "GET",
        url: "php/validateConnection.php",
        dataType: "html",   //expect html to be returned                
        success: function (response) {
            $("#carouselContainer").html(response);
        }
    });
}

/*-- click events -----------------------------------*/
function addPgLinkButton(folderId, labelText) {
    return "<div class='headerBannerButton'>" +
        "   <div class='clickable' onclick='rtpe(\"HB2\",\"" + hdrRootFolder + "\"," + hdrFolderId + "," + folderId + ")'>" + labelText + "</div>" +
        "</div>\n";
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

function refreshRandomGalleries(pageContext) {
    getRandomGalleries(1);
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

// REPORT THEN PERFORM EVENT

function performEvent(eventCode, eventDetail, folderId) {
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


/*-- Search -----------------------------------*/

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
            alert("enter");
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
                // $('#headerMessage').html("down: " + itemIndex);
            }
        }
        if (ev === 38) {  // up arrow
            if (itemIndex > 1) {
                $('#searchResultsDiv').children().removeClass('selectedSearchItem');
                kludge = "li:nth-child(" + --itemIndex + ")";
                $('#searchResultsDiv').find(kludge).addClass('selectedSearchItem').focus();
                //   $('#headerMessage').html("up: " + itemIndex);
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
        let likeSearchString = "'%" + searchString + "%'";

        try {
            $.ajax({
                type: "GET",
                url: "php/oggleSearch.php?searchString=" + likeSearchString,
                success: function (data) {
                    if (data.indexOf("Error") > 0) {
                        alert(likeSearchString + data);
                    }
                    else {
                        $('#searchResultsDiv').html("<ul class='searchResultList>").show();
                        let fData = JSON.parse(data);
                        $.each(fData, function (idx, obj) {
                            $('#searchResultsDiv').append("<li id=" + obj.Id +
                                " onclick='jumpToSelected(" + obj.Id + ")'>" +
                                obj.ParentName + "-" + obj.FolderName + "</li>");
                        });
                        $('#searchResultsDiv').append("</ul>").show();
                        $('#divLoginArea').hide();
                    }
                },
                error: function (jqXHR) {
                    $('#albumPageLoadingGif').hide();
                    let errMsg = getXHRErrorDetails(jqXHR);
                    $('#randomGalleriesContainer').html(errMsg)
                    //alert("getRandomGalleries: " + errMsg);
                    // logError("XHR", folderId, errMsg, "get albumImages");
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
    window.open("/album.html?folder=" + selectedFolderId, "_blank");  // open in new tab
    clearSearch();
}

function linkItemKeyDown(event) {
    alert("linkItemKeyDown");
}

/*-- log error -----------------------------------*/
function logOggleError(errorCode, folderId, errorMessage, calledFrom) {
    //alert(errorCode + "," + folderId + ", " + errorMessage + " calledFrom: " + calledFrom);
    //logError("ILF", folderId, "linkId: " + linkId + " imgSrc: " + imgSrc, "gallery");

    let visitorId = getCookieValue("VisitorId", calledFrom + "/logError");
    $.ajax({
        type: "POST",
        url: "php/addError.php",
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
                $('#dashboardFileList').append("<div style='color:red'>add image file error: " + addImageFileSuccess + "</div>");
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            alert("Error log error: " + errMsg);
        }
    });
}
