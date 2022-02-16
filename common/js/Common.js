var settingsArray = {};
var userRoles = [];
let tanBlueMenuSnippet, bookPanelSnippet;

// -------- useful utilities -----------

function getParams() {
    var params = {},
        pairs = document.URL.split('?').pop().split('&');
    for (var i = 0, p; i < pairs.length; i++) {
        p = pairs[i].split('=');
        params[p[0]] = p[1];
    }
    return params;
}

function create_UUID() {
    // thanks to-https://www.w3resource.com/javascript-exercises/javascript-math-exercise-23.php
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function todayString() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    return mm + '/' + dd + '/' + yyyy;
}

function dateString2(dateObject) {
    let d = new Date(dateObject), day = d.getDate(), month = d.getMonth() + 1;
    if (day < 10) {
        day = "0" + day;
    }
    if (month < 10) {
        month = "0" + month;
    }
    return month + "/" + day;
};

function commaFormat(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function isNullorUndefined(val) {
    if (val === "")
        return true;
    if (val === null)
        return true;
    if (val === undefined)
        return true;
    return false;
}

function getXHRErrorDetails(jqXHR) {
    var msg = '';
    if (jqXHR.status === 0) {
        msg = 'Not connect.\n Verify Network.';
    } else if (jqXHR.status === 404) {
        msg = 'Requested page not found. [404]';
    } else if (jqXHR.status === 500) {
        msg = 'Internal Server Error [500].';

    } else if (jqXHR.responseText === 'parsererror') {
        msg = 'Requested JSON parse failed.';
    } else if (jqXHR.responseText === 'timeout') {
        msg = 'Time out error.';
    } else if (jqXHR.responseText === 'abort') {
        msg = 'Ajax request aborted.';
    } else {
        msg = 'Uncaught Error.\n' + jqXHR.responseText;
    }
    return msg;
}

// --------  -----------

function displayStatusMessage(msgCode, message) {

    var severityClassName;
    switch (msgCode) {
        case "ok":
            severityClassName = "severityOk";
            break;
        case "warning":
            severityClassName = "severityWarning";
            break;
        case "error":
            severityClassName = "severityError";
            break;
        default:
            severityClassName = msgCode;
    }
    //.severityOk {background - color: rgba(88, 139, 108, 0.75);    }
    //.severityWarning {        background - color: #e6de3b;    }
    //.severityError {        background - color: #c64e4e;    }

    $('#divStatusMessage').removeClass();
    $('#divStatusMessage').addClass(severityClassName);
    $('#divStatusMessage').html(message);
    $('#divStatusMessage').show();

    if (msgCode === "ok") {
        setTimeout(function () { $('#divStatusMessage').hide("slow"); }, 2500);
    }
    else {
        setTimeout(function () { $('#divStatusMessage').hide("slow"); }, 15000);
    }
}

function loadSettings() {
    document.title = "loading settings : Brucheum";
    $.ajax({
        type: "GET",
        url: "/Data/Settings.xml",
        dataType: "xml",
        success: function (settingsXml) {
            $(settingsXml).find('setting').each(function () {
                settingsArray[$(this).attr('name')] = $(this).attr('value');
            });
            document.title = "welcome : Brucheum";
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            alert("loadSettings: " + errMsg);
            // if (!checkFor404(errMsg, 444, "loadOggleSettings")) logError("XHR", 444, errMsg, "loadOggleSettings");
        }
    });
}

function sendEmail(to, from, subject, message) {
    try {
        $.ajax({
            type: "PUT",
            url: settingsArray.ApiServer + "api/Common/SendEmail",
            data: {
                To: to,
                From: from,
                Subject: subject,
                Message: message
            },
            success: function (success) {
                if (success === "ok") {
                    //$('#footerMessage1').html("email sent");
                    //displayStatusMessage("ok", "email sent");
                }
                else
                    logError("EME", 3992, success, subject);
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                alert("SendEmail: " + errMsg);
                //if (!checkFor404(errMsg, folderId, "sendEmail")) logError("XHR", 3992, errMsg, "sendEmail");
            }
        });
    } catch (e) {
        logError("CAT", 3992, e, "sendEmail");
    }
}

function showFeedbackDialog() {
    // do I need a global currentAlbumId 
}

function mailMe() {
    //rtpe(\"FLC\",\"mailme\",\"mailme\"," + folderId + ")
}

// -------- Event Handlers -----------

function logCatch(calledFrom, errorMessage) {
    alert("catch error in: " + calledFrom + "\n\n" + errorMessage);
}

function logError(errorCode, folderId, errorMessage, calledFrom) {

    alert(errorCode + "," + folderId + ", " + errorMessage + " calledFrom: " + calledFrom);


    if (errorCode != "404") {
        //let eVisitorId = getCookieValue("VisitorId", "logError");
        //setTimeout({ logError2(eVisitorId, errorCode, folderId, errorMessage, calledFrom) }, 888);
        //logError2(localStorage["VisitorId"], errorCode, folderId, errorMessage, calledFrom);
    }
}

function logError2(visitorId, errorCode, folderId, errorMessage, calledFrom) {
    alert("logError2:" + errorCode + "," + folderId + ", " + errorMessage + " calledFrom: " + calledFrom);
    // if (isNullorUndefined(calledFrom))
    //     calledFrom = "unknown";

    // if (document.domain === 'localhost') {
    //     //console.log(errorCode + " " + folderId + " " + errorMessage + " " + calledFrom);
    //     alert("Error " + errorCode + " calledFrom: " + calledFrom + "\nerrorMessage : " + errorMessage);
    // }
    // else {
    //     try {

    //         $.ajax({
    //             type: "POST",
    //             url: settingsArray.ApiServer + "api/Common/LogError",
    //             data: {
    //                 VisitorId: visitorId,
    //                 ErrorCode: errorCode,
    //                 FolderId: folderId,
    //                 ErrorMessage: errorMessage,
    //                 CalledFrom: calledFrom
    //             },
    //             success: function (success) {
    //                 if (success === "ok") {
    //                     //displayStatusMessage("ok", "error message logged");
    //                     console.log("error message logged.  Called from: " + calledFrom + " message: " + errorMessage);
    //                 }
    //                 else {
    //                     console.error("ajx error in logError!!: " + success + " called from: " + calledFrom + "\nerrorMessage: " + errorMessage);
    //                 }
    //             },
    //             error: function (jqXHR) {
    //                 let errMsg = getXHRErrorDetails(jqXHR);
    //                 alert("logError2: " + errMsg);
    //             //    if (!checkFor404(errMsg, folderId, "logError")) {
    //             //        //logError("XHR", folderId, errMsg, functionName);
    //             //        if (document.domain === 'localhost') alert("XHR error in logError!!: " + "logError");
    //             //    }
    //             }
    //         });
    //     }
    //     catch (e) {
    //         if (document.domain === 'localhost') alert("Catch error in logError!!: " + e);
    //         console.error("Catch error in logError!!: " + e);
    //     }
    // }
}

function logActivity(changeLogModel) {
    //        if (success === "ok")
    //            displayStatusMessage("ok", "add image logged");
    //        else
    //            alert("ChangeLog: " + success);
    //    error: function (xhr) {
    //        $('#dashBoardLoadingGif').hide();
    //        alert("ChangeLog xhr error: " + getXHRErrorDetails(xhr));
    //    }
    //    let visitorId = getCookieValue("VisitorId", calledFrom + "log Event/" + eventCode);
    //    try {
    //        $.getJSON('php/logEvent.php?eventCode=' + EventCode + '&folderId=' + folderId + '&details=' + details + '&calledFrom=' + calledFrom + '&visitorId=' + visitorId,
    //            function (data) {
    //                console.log(data);
    //            });
    //    } catch (e) {
    //        alert(e);
    //    }
}

function logActivity2(visitorId, eventCode, calledFrom) {

    alert("logActivity2  visitorId: " + visitorId + "  eventCode: " + eventCode + "  calledFrom: " + calledFrom);

}

function logEvent(eventCode, calledFromFolderId) {
    //$eventCode = $_GET['eventCode'];
    //$folderId = $_GET['folderId'];
    //$calledFrom = $_GET['calledFrom'];
    //$visitorId = $_GET['visitorId'];
    try
    {
        let visitorId = getCookieValue("VisitorId", calledFrom + "log Event/" + eventCode);

        $.getJSON('php/logEvent.php?eventCode=' + EventCode + '&folderId=' + calledFromFolderId + '&visitorId=' + visitorId, function (data) {
            console.log(data);
        });
    } catch (e) {
        logCatch("logEvent", e);
    }
}

// -------- Cookies -----------

function getCookieValue(itemName, calledFrom) {
    let returnValue = "cookie not found";
    try {
        let decodedCookie = decodeURIComponent(document.cookie);
        let cookieElements = decodedCookie.split(";");
        let cookieItem, cookieItemName, cookieItemValue;
        for (var i = 0; i < cookieElements.length; i++) {
            cookieItem = cookieElements[i].split("=");
            cookieItemName = cookieItem[0].trim();
            cookieItemValue = cookieItem[1];
            if (cookieItemName === itemName) {
                if (!isNullorUndefined(cookieItemValue)) {
                    returnValue = cookieItemValue;
                    localStorage[itemName] = cookieItemValue;
                    //logActivity2(localStorage["VisitorId"], "CK0", 1031122, "GET CookieValue/" + calledFrom); // cookie actually worked
                    break;
                }
            }
        }

        if (returnValue == "cookie not found") {
            if (!isNullorUndefined(localStorage[itemName])) {
                returnValue = localStorage[itemName];
                rebuildCookie();
                if (itemName == "VisitorId")
                    logActivity2(localStorage["VisitorId"], "CK1", 1031122, calledFrom + "/GET CookieValue"); // local storage bypass
                else
                    logActivity2("unavailable", "CK1", 1031128, "itemName: " + itemName + ". calledFrom: " + calledFrom); // local storage bypass
            }
            else {
                if (itemName == "VisitorId") {
                    if (calledFrom != "verify session") {
                        let newVisId = create_UUID();
                        localStorage["VisitorId"] = newVisId;
                        rebuildCookie();
                        addVisitor(newVisId, 1111, "cookie not found");
                        returnValue = newVisId;
                        logError2(newVisId, "CK2", 703245, "navigator.cookieEnabled: " + navigator.cookieEnabled, calledFrom + "/GET CookieValue"); // visitor added from get cookie
                    }
                }
                else {
                    if (itemName == "IsLoggedIn") {
                        localStorage["IsLoggedIn"] = "false";
                        returnValue = "false";
                        rebuildCookie();
                    }
                    else {
                        logError2("unavailable", "CK3", 703245, "itemName: " + itemName + ". navigator.cookieEnabled: " + navigator.cookieEnabled + "calledFrom:" + calledFrom); // No local storage bypass
                    }
                }
            }
        }
        //else logActivity2(returnValue, "CK0", 11151150, "navigator.cookieEnabled: " + navigator.cookieEnabled); // cookie test ok
    }
    catch (ex) {
        logError2("unavailable", "CAT", 1130123, "returnValue: " + returnValue + ". ex: " + ex, "get Cookie outer fail/" + calledFrom);
    }
    finally {
        return returnValue;
    }
}

function rebuildCookie() {
    try {
        document.cookie = "VisitorId=" + localStorage["VisitorId"];
        document.cookie = "UserName=" + localStorage["UserName"];
        document.cookie = "IsLoggedIn=" + localStorage["IsLoggedIn"];

    } catch (e) {
        logError2(localStorage["VisitorId"], "CAT", 333, e, "rebuild Cookie");
    }
}

// -------- Header -----------
let hdrFolderId, hdrRootFolder;

function displayHeader(headerContext) {
    $('header').html(headerHtml());

    //changeFavoriteIcon("redBallon");
    //document.title = "document.title";
    $('#topHeaderRow').html("topHeaderRow");
    $('#headerMessage').html("");
    $('#topRowRightContainer').html("");
    $('#breadcrumbContainer').html("");
    $('#badgesContainer').html("");
    $('#hdrBtmRowSec3').html("");
    switch (headerContext) {
        case "oggleIndex":
            document.title = "document.title";
            //$("#divLoginArea").hide();
            $('#fancyHeaderTitle').html("OggleBooble");
            $('#topHeaderRow').html("Home of the Big Naturals");
            $('#topRowRightContainer').append(bannerLink("every playboy centerfold", 3908));
            $('#topRowRightContainer').append(bannerLink("Bond Girls", 3908));
            break;
        case "oggleGallery":
            $('#fancyHeaderTitle').html("OggleBooble");
            $('#topHeaderRow').html("Home of the Big Naturals");
            $('#topRowRightContainer').html("");
            $('#hdrBtmRowSec3').html("");
            break;
        case "playboyIndex": 
            $('#divSiteLogo').attr("src", "/img/playboyBallon.png");
            $('#fancyHeaderTitle').html("every playboy centerfold");
            document.title = "Every Playboy Centerfold : OggleBooble";
            changeFavoriteIcon("playboy");
            break;
        case "OggleDashboard":
            $('#fancyHeaderTitle').html("OggleBooble.com");
            $('#topHeaderRow').html("admin");
            $('#divSiteLogo').attr("src","/img/adminPanel01.png");
            $('#fancyHeaderTitle').html("Oggle Dashboard");
            break;
        case "admin":
            document.title = "admin : Brucheum.com";
            $('#fancyHeaderTitle').html("Brucheum.com");
            $('#topHeaderRow').html("admin");
            $('#searchBox').hide();            
            break;
        case "blog": {
            document.title = "blog : Brucheum.com";
            $('#fancyHeaderTitle').html("Brucheum.com");
            $('#topHeaderRow').html("blog");
            break;
        }
        case "bond":
        case "index": {
            changeFavoriteIcon("redBallon");
            $('#topHeaderRow').html("Home of the Big Naturals");
            //document.title = "welcome : OggleBooble";
            break;
        }
        case "album":
        case "loading": {
            $("#divLoginArea").hide();
            $('#headerMessage').html("OggleBooble");
            //document.title = "loading : OggleBooble";
            break;
        }
        case "porn":
            changeFavoriteIcon("porn");
            //console.log("changeFavoriteIcon porn 1")
            document.title = "OgglePorn";
            break;
        case "dashboard": {
            $('#headerMessage').html("dashboard");
            headerMenu = "dashboard";
            break;
        }
        case "blog": {
            // <div id='headerMessage' class='bottomLeftHeaderArea'></div>\n" +
            $('#headerMessage').html("blog");
            changeFavoriteIcon("redBallon");
            break;
        }
        case "ranker": {
            $('#headerMessage').html("ranker");
            break;
        }
        default:
            console.log("headerContext " + headerContext + " not handled");
            break;
    }

    setTopHeaderRow(headerContext);

    //mediaSavyHdrResize();
    //window.addEventListener("resize", mediaSavyHdrResize);
}

function setTopHeaderRow(headerContext) {
    switch (headerContext) {
        case "oggleIndex":
        case "oggleGallery": {
            $('#topHeaderRow').html(
                "<span class='bigTits' onclick='headerMenuClick(\"boobs\",3)'>BIG Naturals</span></a > organized by\n" +
                "<span onclick='headerMenuClick(\"boobs\",3916)'>poses, </span>\n" +
                "<span onclick='headerMenuClick(\"boobs\",136)'> positions,</span>\n" +
                "<span onclick='headerMenuClick(\"boobs\",159)'> topics,</span>\n" +
                "<span onclick='headerMenuClick(\"boobs\",199)'> shape,</span>\n" +
                "<span onclick='headerMenuClick(\"boobs\",241)'> size,</span>\n" +
                "<span onclick='headerMenuClick(\"boobs\",4010)'> tit play</span>\n");
            break;
        }
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
        case "soft": {
            $('#topHeaderRow').html(
                "<span onclick='headerMenuClick(\"soft\",379)'>pussy, </span>\n" +
                "<span onclick='headerMenuClick(\"soft\",420)'>boob suckers, </span>\n" +
                "<span onclick='headerMenuClick(\"soft\",498)'>big tit lezies, </span>\n" +
                "<span onclick='headerMenuClick(\"soft\",357)'>fondle, </span>\n" +
                "<span onclick='headerMenuClick(\"soft\",397)'>kinky, </span>\n" +
                "<span onclick='headerMenuClick(\"soft\",411)'>naughty behaviour</span>\n");
            break;
        }
        case "playboy":
            $('#topHeaderRow').html(
                "<span onclick='headerMenuClick(\"playboyIndex\",3796)'>cybergirls, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",6368)'>playboy plus, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",6095)'>muses, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",3128)'>international, </span>\n" +
                //"<span onclick='headerMenuClick(\"playboyIndex\",6076)'>specials, </span>\n" +
                //"<span onclick='headerMenuClick(\"playboyIndex\",3393)'>lingerie, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",9306)'>more</span>\n"
            );
            break;
        case "playboyIndex":
            $('#topHeaderRow').html(
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
        case "porn": {
            $('#topHeaderRow').html(
                "<span onclick='headerMenuClick(\"porn\",243)'>cock suckers, </span>\n" +
                "<span onclick='headerMenuClick(\"porn\",460)'>titty fuck, </span>\n" +
                "<span onclick='headerMenuClick(\"porn\",426)'>penetration, </span>\n" +
                "<span onclick='headerMenuClick(\"porn\",357)'>cum shots, </span>\n" +
                "<span onclick='headerMenuClick(\"porn\",694)'>kinky, </span>\n" +
                "<span onclick='headerMenuClick(\"porn\",411)'>naughty behaviour</span>\n");
            break;
        }
        case "sluts": {
            $('#topHeaderRow').html(
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
        }
        default: {
            console.log("topHeaderRow: " + headerContext + " unhandled");
            //logError("SWT", folderId, "subdomain: " + subdomain, "setHdrBottomRow");
        }
    }
}

function changeFavoriteIcon(headerContext) {
    try {
        let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        switch (headerContext) {
            case "brucheum": link.href = 'Images/Brucheum.ico'; break;
            case "playboy": link.href = 'img/playboyBallon.png'; break;
            case "intelDesign": link.href = 'Images/intel01.jpg'; break;
            case "getaJob": link.href = 'Images/GetaJob.png'; break;
            case "loading": link.href = "Images/loader.gif"; link.type = 'image/gif'; break;
            case "redBallon": link.href = 'Images/favicon.png'; break;
            default: link.href = 'Images/Brucheum.ico'; break;
        }
        document.getElementsByTagName('head')[0].appendChild(link);
    } catch (e) {
        logError("CAT", 3992, e, "changeFavoriteIcon");
    }
}

function showHamburger() {
    var picpos = $('#breadcrumbContainer').offset();
    var picLeft = Math.max(0, picpos.left + $('#hamburgerCtx').width());
    $('#hamburgerCtx').css("top", picpos.top + 5);
    $('#hamburgerCtx').css("left", picLeft);
    $('#hamburgerCtx').show();
}

function showResizeMessage(lasttopRowOption, lastBottomRowOption) {
    if (mediaDebug) {
        //if (!secMsg.includes("RESET"))
        $('#aboveImageContainerMessageArea').html("Top: " + lasttopRowOption + " : " + hdrTopRowSectionsW().toLocaleString() +
            " Bot: " + lastBottomRowOption + " : " + hdrBottRowSectionsW().toLocaleString() +
            "<span style='margin-left:45px;'>rW: </span> (" + $('.headerTopRow').width().toLocaleString() + ")");
    }
}

function headerMenuClick(calledFrom, folderId) {
    //alert("headerMenuClick folderId: " + folderId);
    //logEvent("TMC", folderId, calledFrom);
    location.href = "Gallery.html?album=" + folderId;
}

function topLogoClick() {
    let logoImage = $('#divSiteLogo').prop("src").substr($('#divSiteLogo').prop("src").lastIndexOf("/") + 1);
    switch (logoImage) {
        case "redballon.png": location.href = "index.html"; break;
        case "redwoman.png": window.open("index.html?folder=440"); break;
        case "playboyBallon.png": window.location.href = "Index.html?spa=72"; break;
        case "csLips02.png": window.location.href = "Index.html?spa=3909"; break;
        default:
            alert("topLogoClick: " + logoImage + " not handled");
            location.href = "index.html"; break;
    }
}

function headerTitleClick() {
    alert("headerTitle: " + $('#oggleHeaderTitle').html());
}

function showHamburger() {
    var picpos = $('#breadcrumbContainer').offset();
    var picLeft = Math.max(0, picpos.left + $('#hamburgerCtx').width());
    $('#hamburgerCtx').css("top", picpos.top + 5);
    $('#hamburgerCtx').css("left", picLeft);
    $('#hamburgerCtx').show();
}

function headerHtml() {
    return "<div class='siteLogoContainer' onclick='topLogoClick()' >" +
        "       <img id='divSiteLogo' title='home' class='siteLogo' src='https://common.ogglefiles.com/img/redballon.png'/>" +
        "   </div>\n" +
        "   <div class='headerBodyContainer'>\n" +
        "       <div class='headerTopRow'>\n" +
        "           <div id='fancyHeaderTitle' onclick='headerTitleClick()' class='calligraphyTitle'></div >\n" +
        "           <div id='topHeaderRow' class='hdrTopRowMenu'></div>" +
        "           <div id='topRowRightContainer'></div>" +
        "           <div id='searchBox' class='oggleSearchBox'>\n" +
        "               <span id='notUserName' title='Esc clears search.'>search</span>" +
        "                   <input class='oggleSearchBoxText' id='txtSearch' title='search' onkeydown='oggleSearchKeyDown(event)'></input>" +
        "               <div id='searchResultsDiv' class='searchResultsDropdown'></div>\n" +
        "           </div>\n" +
        "       </div>\n" +
        "       <div class='headerBottomRow'>\n" +
        "           <div class='bottomRowSection1'>\n" +
        "               <div id='headerMessage' class='bottomLeftHeaderArea'></div>\n" +
        "               <div id='breadcrumbContainer' class='breadCrumbArea'></div>\n" +
        "               <div id='badgesContainer' class='badgesSection'></div>\n" +
        "               <div id='hdrBtmRowSec3' class='hdrBtmRowOverflow'></div>\n" +
        "           </div>\n" +
        "           <div id='divLoginArea' class='loginArea'>\n" +
        "               <div id='optionLoggedIn' class='displayHidden'>\n" +
        "                   <div class='hoverTab' title='modify profile'><a href='javascript:showUserProfileDialog()'>Hello <span id='spnUserName'></span></a></div>\n" +
        "                   <div class='hoverTab'><a href='javascript:onLogoutClick()'>Log Out</a></div>\n" +
        "               </div>\n" +
        "               <div id='optionNotLoggedIn' class='displayHidden'>\n" +
        "                   <div id='btnLayoutRegister' class='hoverTab'><a href='javascript:showRegisterDialog()'>Register</a></div>\n" +
        "                   <div id='btnLayoutLogin' class='hoverTab'><a href='javascript:showLoginDialog()'>Log In</a></div>\n" +
        "               </div>\n" +
        "           </div>\n" +
        "       </div>\n" +
        "   </div>\n" +

        "<div id='indexCatTreeContainer' class='floatingDialogContainer'></div>\n" +

        "<div id='customMessageContainer' class='floatingDialogContainer'>\n" +
        "    <div id='customMessage' class='customMessageContainer' ></div>\n" +
        "</div>\n" +

        "<div class='centeringOuterShell'>\n" +
        "   <div class='centeringInnerShell'>\n" +
        "      <div id='centeredDialogContainer' class='floatingDialogContainer'>\n" +
        "           <div id='centeredDialogHeader'class='floatingDialogHeader' onmousedown='centeredDialogEnterDragMode()' onmouseup='centeredDialogCancelDragMode()'>" +
        "               <div id='centeredDialogTitle' class='floatingDialogTitle'></div>" +
        "               <div id='centeredDialogCloseButton' class='dialogCloseButton'>" +
        "               <img src='https://common.ogglefiles.com/img/powerOffRed01.png' onclick='centeringDialogClose()'/></div>\n" +
        "           </div>\n"+
        "           <div id='centeredDialogContents' class='floatingDialogContents'></div>\n"+
        "      </div>\n"+
        "   </div>\n"+
        "</div>\n"+
                
        "<div id='floatingDialogBox' class='floatingDialogContainer displayHidden'>\n"+
        "    <div class='floatingDialogHeader'>\n"+
        "        <div \id='floatingDialogBoxTitle' class='floatingDialogTitle'></div>\n" +
        "        <div class='dialogCloseButton'><img src='https://common.ogglefiles.com/img/powerOffRed01.png' onclick='$('#dfloatingDialogBox').hide()'/></div>\n" +
        "    </div>\n" +
        "    <div id='floatingDialogContents' class='floatingDialogContents'></div>\n" +
        "</div>\n" +

        "<div id='customDirTreeContainer' class='dirTreeImageContainer floatingDirTreeImage'>\n" +
        "   <img class='customDirTreeImage'/>\n" +
        "</div>\n" +

        "<div id='vailShell' class='modalVail'></div>\n" +

        "<div id='contextMenuContainer' class='ogContextMenu' onmouseleave='$(this).fadeOut()'>" +
        "   <div id='contextMenuContent'></div>\n" +
        "</div>\n";
}

// -------- Dialog boxes in header -----------

function centeredDialogEnterDragMode() {
    //$('#headerMessage').html("entering drag mode");
    $('#centeredDialogContents').draggable({ disabled: false });
    $('#centeredDialogContents').draggable();
}

function centeredDialogCancelDragMode() {
    //$('#headerMessage').html("end drag");
    $('#centeredDialogContents').draggable({ disabled: true });
}

function centeringDialogClose() {
    $("#vailShell").fadeOut();
    $('#centeredDialogContainer').fadeOut();
    if (typeof resume === 'function') resume();
}

// -------- Footer -----------
function footerHtml() {
    $('footer').html("<div class='flexContainer'>\n" +
        "    <div id='footerCol1' class='footerCol'>\n" +  // column 1
        "       <div class='clickable' onclick='showFeedbackDialog()'>Feedback</div>\n" +
        "    </div>\n" +
        "    <div id='footerCol2' class='footerCol'>\n" + // column 2
        "       <div class='clickable' onclick='window.location.href=\"index.html?spa=blog\", \"_blank\"'>Blog</div>\n" +
        "    </div>\n" +
        "    <div id='footerCol3' class='footerCol'>\n" + // column 3
        "       <div class='clickable' onclick='mailMe()'>email site developer</div>\n" +
        "    </div>\n" +
        "    <div id='footerCol4' class='footerCol'>\n" +  // column 4
        "    </div>\n" +
        "    <div id='footerCol5' class='footerCol'>\n" +  // column 5
        "    </div>\n" +
        "    <div id='footerCol6' class='footerCol'>\n" +  // column 6
        "       <div id='histats_counter'></div>\n" +
        "    </div>\n" +
        "    <div id='footerCol7' class='footerCol rightMostfooterColumn'>\n" +  // column 7
        //"           <a href='htt ps://ipinfo.io/' alt='IPinfo - Comprehensive IP address data, IP geolocation API and database'>" +
        //"           this site uses<img src='/images/ipinfo.png' height='40' /></a>\n" +
        "       <div id='footerCol6' class='footerColCustContainer'>\n" +
        "           <a href='https://www.paypal.com/donate/?hosted_button_id=M5UE6B2RJ9NFY' alt='paypal test'>make a donation</a>\n" +
        "       </div >\n" +
        "    </div>\n" +
        "   </div>\n<div class='footerFooter'>\n" +
        "       <div class='footerFooterMessage' id='footerMessage1'></div>\n" +
        "       <div class='footerFooterMessage' id='footerMessage2'></div>\n" +
        "       <div class='copyrightPush'>&copy;" + new Date().getFullYear() + " - " +
        "       <a href='https://curtisrhodes.com/index.html?spa=IntelDesign' target='_blank'>Intelligent Design SoftWare</a></div>\n" +
        "   </div>\n" +
        "</div>\n");
}

function displayFooter(footerContext) {
    try {
        $('footer').html(footerHtml());
        switch (footerContext) {
            case "oggleGallery":
            case "welcome":
                $('#footerCol2').append(`
                    <div class='clickable' onclick='footerItemClick(1)'>Sitemap</div>\n
                    <div class='clickable' onclick='displayFeedback()'>Feedback</div>\n`
                );
                $('#footerCol3').append(`
                    <div class='clickable' onclick='footerItemClick(1)'>Search</div>\n
                    <div class='clickable' onclick='footerItemClick(1)'>Research</div>\n
                    <div class='clickable' onclick='footerItemClick(1)'>Advertize</div>\n`
                );
                $('#footerCol4').append(`
                   <div class='clickable' onclick='footerItemClick(1)'>test 4</div>\n`
                );
                $('#footerCol5').append(`
                    <div class='clickable' onclick='footerItemClick(1)'>test 5</div>\n`
                );
                $('#footerCol6').append(`
                    <div class='clickable' onclick='window.open(\"index.html?spa=3910\")'>dashboard</div>\n`
                );
                $('#footerCol7').html(`
                    <div class='clickable' onclick='footerItemClick(1)'>Category List</div>\n
                    <div class='clickable' onclick='footerItemClick(1)'>Category List</div>\n
                    <div class='clickable' onclick='footerItemClick(1)'>Category List</div>\n`
                );
                break;
            case "oggleIndex":
            case "blog":
            case "root":
            case "special":
            case "index": {
                $('#footerCol1').html(
                    "<div class='clickable' onclick='window.location.href=\"index.html?spa=3909\", \"_blank\"'>OgglePorn</div>\n" +
                    "<div class='clickable' onclick='window.location.href=\"index.html?folderId=1142\", \"_blank\"'>Centerfolds</div>\n");
                $('#footerCol2').html(
                    "<div class='clickable' onclick='showCatListDialog(2)'>Category List</div>\n" +
                    "<div class='clickable' onclick='showCatListDialog(3)'>Babes List</div>\n");
                break;
            }
            default: {
                //logError("SWT", folderId, "rootFolder: " + rootFolder, "setOggleFooter");
                $('#footerCol1').html("<div>unhandled domain: " + rootFolder + "</div>\n");
                alert("footerContext not understood: " + footerContext)
                break;
            }
        }

        //<div id='footerPageHits'></div>\n
        //<div>page type: " + rootFolder + "</div>\n
        //<div id='footerFolderType'></div>\n" +
        //<div id='footerStaticPage'></div>\n"`

        //if (document.domain != "localhost") {
        //    $('.footer').append("   <!-- Histats.com  START  (aync)-->\n" +
        //        "   <script type='text/javascript'>var _Hasync= _Hasync|| [];\n" +
        //        "   _Hasync.push(['Histats.start', '1,4458214,4,30,130,80,00010101']);\n" +
        //        "   _Hasync.push(['Histats.fasi', '1']);\n" +
        //        "   _Hasync.push(['Histats.track_hits', '']);\n" +
        //        "   (function() {\n" +
        //        "   var hs = document.createElement('script'); hs.type = 'text/javascript'; hs.async = true;\n" +
        //        "   hs.src = ('//s10.histats.com/js15_as.js');\n" +
        //        "   (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(hs);\n" +
        //        "   })();</script>\n");
        //}


        //if (isInRole("trusted"))
        //    $('#footerCol5').show();
        //else
        //    $('#footerCol5').hide();

    } catch (e) {
        alert("footer catch error: " + e);
        //logError("CAT", folderId, e, "setOggleFooter", "footer/" + calledFrom);
    }
}

function footerItemClick(footerItem) {
    alert("footerItemClick: " + footerItem);
}

function displayFeedback() {
    alert("displayFeedback");
    //\"FLC\",\"feedback\", rootFolder + "\", folderId + "
}

// -------- Hit Counter -----------
function logVisit() {

    //var x = getCookie("path");
    //alert("cookie path: " + x);


    //if ((ipAddress === "68.203.90.183") || (ipAddress === "50.62.160.105")) return "ok";
    var logVisitUserName = getCookie("User");
    //if (logVisitUserName !== "") {    }
     //alert("logVisit UserName: " + logVisitUserName);0

    $('#footerMessage1').html("logging visit userName: " + logVisitUserName);
    setLoginHeader(logVisitUserName);
    if (logVisitUserName === "") logVisitUserName = "unknown";
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/HitCounter/LogVisit?userName=" + logVisitUserName + "&appName=Ogglebooble",
        success: function (successModel) {
            if (successModel.Success === "ok") {
                $('#footerMessage1').html("");
                if (successModel.ReturnValue !== "") {
                    $('#headerMessage').html(successModel.ReturnValue);
                }
            }
            else
                alert(successModel.Success);
        },
        error: function (jqXHR, exception) {
            $('#blogLoadingGif').hide();
            alert("LogVisit jqXHR : " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function logPageHit(folderName, appName) {
    //alert("logPageHit(" + folderName + "," + appName + ")");
    logVisit();
    $('#footerMessage1').html("logging page hit");
    var userName = getCookie("User");
    if (userName === "")
        userName = "unknown";
    else {
        setLoginHeader(userName);
    }
    //if ((ipAddress === "68.203.90.183") || (ipAddress === "50.62.160.105")) return "ok";
    var hitCounterModel = {
        AppId: appName,
        PageName: folderName,
        UserName: userName
    };
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "api/HitCounter/LogPageHit",
        data: hitCounterModel,
        success: function (successModel) {
            if (successModel.Success === "ok") {
                if (userName === "unknown")
                    $('#footerMessage1').html("logPageHit: " + successModel.ReturnValue);
                else
                    $('#footerMessage1').html("");
            }
            else
                alert("logPageHit: " + successModel.Success);
        },
        error: function (jqXHR, exception) {
            alert("logPageHit error: " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}
