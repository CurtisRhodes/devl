var settingsArray = {};
var userRoles = [];
let tanBlueMenuSnippet, bookPanelSnippet;

/* -------- useful utilities -----------*/{

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
}

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
        logCatch("send email", e);
    }
}

function showFeedbackDialog() {
    // do I need a global currentAlbumId 
}

function mailMe() {
    //rtpe(\"FLC\",\"mailme\",\"mailme\"," + folderId + ")
}

/* -------- activity logs -----------*/{

    function logCatch(calledFrom, errorMessage) {
        console.log("catch error in: " + calledFrom + "\n\n" + errorMessage);
        alert("catch error in: " + calledFrom + "\n\n" + errorMessage);

    }

    function logError(errorCode, folderId, errorMessage, calledFrom) {
        //alert("errorCode: " + errorCode + ", folderId: " + folderId + "\n errorMessage: " + errorMessage + "\ncalledFrom: " + calledFrom);

        let visitorId = getCookieValue("VisitorId", calledFrom + "/logError");
        $.ajax({
            type: "POST",
            url: 'https://common.ogglefiles.com/php/addErrorLog.php',
            data: {
                ErrorCode: errorCode,
                FolderId: folderId,
                VisitorId: visitorId,
                CalledFrom: calledFrom,
                ErrorMessage: errorMessage
            },
            success: function (success) {
                if (success == "!ok") {
                    console.log(success);
                    $('#dashboardFileList').append("<div style='color:red'>add image file error: " + success + "</div>");
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                alert("Error log error: " + errMsg);
            }
        });
    }

    function logActivity(eventCode, calledFrom) {
        try {
            visitorId = getCookieValue("VisitorId", "logActivity");
            console.log("logActivity  visitorId: " + visitorId + "  eventCode: " + eventCode + "  calledFrom: " + calledFrom);
            //        if (success === "ok")
            //            displayStatusMessage("ok", "add image logged");
            //        else
            //            alert("ChangeLog: " + success);
            //    error: function (xhr) {
            //        $('#dashBoardLoadingGif').hide();
            //        alert("ChangeLog xhr error: " + getXHRErrorDetails(xhr));
            //    }
            //    let visitorId = getCookieValue("VisitorId", calledFrom + "log Event/" + eventCode);
            //        $.getJSON('php/logEvent.php?eventCode=' + EventCode + '&folderId=' + folderId + '&details=' + details + '&calledFrom=' + calledFrom + '&visitorId=' + visitorId,
            //            function (data) {
            //                console.log(data);
            //            });
        } catch (e) {
            logCatch("log activity", e);
        }
    }

    function rtpe(labelText, calledFromFolderId) {
        try {
            let eventCode;
            switch (labelText) {
                case "every playboy centerfold":
                    eventCode = "EPC";
                    window.location.href = "/index.html?spa=playboy";
                    break;
                case "Gent Archive":
                    eventCode = "GNT";
                    window.location.href = "/album.html?folder=846";
                    break;
                case "Bond Girls":
                    eventCode = "BND";
                    window.location.href = "/album.html?folder=10326";
                    break;
                case "Oggle Porn":
                    eventCode = "PRN";
                    window.location.href = "/album.html?folder=242";
                    break;
                case "softcore":
                    eventCode = "SFT";
                    window.location.href = "/album.html?folder=846";
                    break;
            }
            logEvent(eventCode, calledFromFolderId);
        }
        catch (e) {
            logCatch("rtpe", e);
        }
    }

    function logEvent(eventCode, calledFromFolderId) {
        try {
            console.log("logEvent: " + eventCode + " calledFrom: " + calledFromFolderId);
            //let visitorId = getCookieValue("VisitorId", "log Event/" + eventCode);
            //$.getJSON('php/logEvent.php?eventCode=' + eventCode + '&folderId=' + calledFromFolderId + '&visitorId=' + visitorId, function (data) {
            //    console.log(data);
            //});
        } catch (e) {
            logCatch("logEvent", e);
        }
    }
}

/* -------- look up user -----------*/{
    function lookupIpAddress() {
        try {
            $.ajax({
                type: "GET",
                url: "https://api.ipify.org",
                success: function (ipifyRtrnTxt) {
                    if (isNullorUndefined(ipifyRtrnTxt)) {
                        console.log("ipInfo empty response");
                        //logActivity2(visitorId, "I01", folderId, ipifyRtrnTxt); // ipify ok
                        //ifyUpdate(visitorId, ipifyRtrnTxt, folderId, calledFrom);
                    }
                    else {
                        checkVisitor(ipResponse.ip);
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    alert("perform IpLookup: " + errMsg);
                    //logActivity2(visitorId, "I0X", folderId, errMsg); //  get IpIfyIpInfo XHR error
                    //if (!checkFor404(errMsg, folderId, "get IpIfyIpInfo/" + calledFrom))
                    //    logError2(create_UUID(), "XHR", folderId, errMsg, "get IpIfyIpInfo/" + calledFrom);
                }
            });
        }
        catch (e) {
            logCatch("perform IpLookup", e);
          //  logActivity2(create_UUID(), "I0C", 621240, "get IpIfyIpInfo/" + calledFrom); // IP catch error
          //  logError2(create_UUID(), "CAT", 621241, e, "get IpIfyIpInfo/" + calledFrom);
        }
    }

    function performIpLookup() {
        try {
            //logActivity2(visitorId, "I0D", folderId, "ipAddress: " + ipAddress); // entering IpInfo
            $.ajax({
                type: "GET",
                url: "https://ipinfo.io/" + ipAddress + "?token=ac5da086206dc4",
                success: function (ipResponse) {
                    if (isNullorUndefined(ipResponse)) {

                        console.log("ipInfo empty response");

                        //logActivity2(visitorId, "I0E", folderId, "ipResponse.ip: " + ipResponse.ip); // ipInfo empty response
                    }
                    else {
                        checkVisitor(ipResponse.ip);
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    alert("perform IpLookup: " + errMsg);
                }
            });
        } catch (e) {
            logCatch("perform IpLookup", e);
            //logActivity2(visitorId, "I0C", folderId, "getIpInfo3/" + calledFrom); // catch error
            //logError2(visitorId, "CAT", folderId, e, "getIpInfo3/" + calledFrom);
        }
    }

    function checkVisitor(ipAddress) {
        try {
            //logActivity2(visitorId, "I0D", folderId, "ipAddress: " + ipAddress); // entering IpInfo
            $.ajax({
                type: "GET",
                url: "php/visitorLookup.php",
                success: function (data) {
                    alert(data);
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    alert("perform IpLookup: " + errMsg);
                }
            });
        } catch (e) {
            logCatch("perform IpLookup", e);
        }
    }
}
/* -------- Cookies ----------------*/{
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
                        break;
                    }
                }
            }

            if (returnValue == "cookie not found") {
                if (!isNullorUndefined(localStorage[itemName])) {
                    returnValue = localStorage[itemName];
                    rebuildCookie();
                    if (itemName == "VisitorId")
                        logActivity("CK1", calledFrom); // local storage bypass
                    else
                        logActivity("CK2", calledFrom);
                }
                else {
                    if (itemName == "VisitorId") {
                        if (calledFrom != "verify session") {
                            let newVisId = create_UUID();
                            localStorage["VisitorId"] = newVisId;
                            rebuildCookie();
                            addVisitor(newVisId, 1111, "cookie not found");
                            returnValue = newVisId;
                            logError("CK2", 217731, "navigator.cookieEnabled: " + navigator.cookieEnabled, calledFrom + "/GET CookieValue");
                        }
                    }
                    else {
                        if (itemName == "IsLoggedIn") {
                            localStorage["IsLoggedIn"] = "false";
                            returnValue = "false";
                            rebuildCookie();
                        }
                        else {
                            logError("CK3", 217731, "navigator.cookieEnabled: " + navigator.cookieEnabled, calledFrom + "/GET CookieValue");
                        }
                    }
                }
            }
        }
        catch (ex) {
            logCatch("getCookieValue", e);
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
            logCatch("rebuildCookie", e);
        }
    }
}
/* -------- Header -----------------*/{
    // let hdrFolderId, hdrRootFolder;

    function bannerLink(labelText, href) {
        return "<div class='headerBannerButton'>" +
            "<div class='clickable' onclick='window.location.href=\"https://beta.ogglefiles.com/" +
            href + "\"'>" + labelText + "</div>\n</div>\n";
    }

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
                document.title = "OggleBooble : Home of the Big Naturals";
                $('#fancyHeaderTitle').html("OggleBooble");
                $('#topHeaderRow').html("Home of the Big Naturals");
                $('#hdrBtmRowSec3').append(bannerLink('every playboy centerfold', 'index.html?spa=playboy'));
                $('#hdrBtmRowSec3').append(bannerLink('Bond Girls', 'album.html?folder=10326'));
                break;
            case "playboy":
                $('#divSiteLogo').attr("src", "https://common.ogglefiles.com/img/playboyBallon.png");
                $('#fancyHeaderTitle').html("every playboy centerfold");
                document.title = "Every Playboy Centerfold : OggleBooble";
                $('#hdrBtmRowSec3').append(bannerLink('back to OggleBooble', 'index.html'));
                $('#hdrBtmRowSec3').append(bannerLink('Bond Girls', 'album.html?folder=10326'));


                changeFavoriteIcon("playboy");
                $('#oggleHeader').css({ "background-color": "#000", "color": "#fff" });
                break;
            case "brucheum":
                $('#divSiteLogo').attr("src", "https://common.ogglefiles.com/img/house.gif");
                $('#fancyHeaderTitle').html("The Brucheum");
                $('#topHeaderRow').html("");
                $('#searchBox').hide();
                showLogin(false);
                break;
            case "slideshow":
                $('#fancyHeaderTitle').html("OggleBooble");
                $('#topHeaderRow').html("Slideshow");
                break;
            case "oggleAlbum":
                $('#fancyHeaderTitle').html("OggleBooble");
                //$('#topRowRightContainer').append(bannerLink("every playboy centerfold", 3908));
                //$('#hdrBtmRowSec3').append(bannerLink("Oggle Porn", 242));
                //$('#hdrBtmRowSec3').append(bannerLink("softcore", 5233));
                //$('#hdrBtmRowSec3').append(bannerLink("Gent Archive", 846));
                //$('#hdrBtmRowSec3').append(bannerLink("Bond Girls", 10326));
                //$('#topHeaderRow').html("Home of the Big Naturals");
                break;
            case "OggleDashboard":
                $('#fancyHeaderTitle').html("OggleBooble.com");
                $('#topHeaderRow').html("admin");
                $('#divSiteLogo').attr("src", "https://common.ogglefiles.com/img/adminPanel01.png");
                $('#fancyHeaderTitle').html("Oggle Dashboard");
                break;
            case "admin":
                document.title = "admin : Brucheum.com";
                $('#fancyHeaderTitle').html("Brucheum.com");
                $('#topHeaderRow').html("admin");
                $('#searchBox').hide();
                break;
            case "IntelDesign":
                document.title = "Intelligent Design Software : CurtisRhodes.com";
                $('#divSiteLogo').attr("src", "https://common.ogglefiles.com/img/intel01.jpg");
                $('#fancyHeaderTitle').html("Intelligent Design Software");
                break;
            case "blog": {
                document.title = "blog : CurtisRhodes.com";
                $('#divSiteLogo').attr("src", "https://common.ogglefiles.com/img/house.gif");
                $('#fancyHeaderTitle').html("CurtisRhodes.com");
                $('#topHeaderRow').html("blog");
                $('#searchBox').hide();
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
            case "oggleAlbum": {
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
                console.log("no top header row set for: " + headerContext);
            }
        }
    }

    function changeFavoriteIcon(headerContext) {
        try {
            let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            switch (headerContext) {
                case "brucheum": link.href = 'https://common.ogglefiles.com/img/Brucheum.ico'; break;
                case "playboy": link.href = 'https://common.ogglefiles.com/img/playboyBallon.png'; break;
                case "intelDesign": link.href = 'https://common.ogglefiles.com/img/intel01.jpg'; break;
                case "getaJob": link.href = 'https://common.ogglefiles.com/img/GetaJob.png'; break;
                case "loading": link.href = "https://common.ogglefiles.com/img/loader.gif"; link.type = 'image/gif'; break;
                case "redBallon": link.href = 'https://common.ogglefiles.com/img/redBallon.ico'; break;
                default: link.href = 'https://common.ogglefiles.com/img/redBallon.ico'; break;
            }
            document.getElementsByTagName('head')[0].appendChild(link);
        } catch (e) {
            logCatch("changeFavoriteIcon", e);
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
        location.href = "album.html?folder=" + folderId;
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

    function showLogin(isLoggedIn, userName) {
        if (isLoggedIn) {
            $('#spnUserName').html(userName);
            $('#optionNotLoggedIn').hide();
            $('#optionLoggedIn').show();
            $('#footerCol5').show();
        }
        else {
            $('#optionLoggedIn').hide();
            $('#optionNotLoggedIn').show();
            $('#footerCol5').hide();
        }
    }

    function headerHtml() {
        return "<div class='siteLogoContainer' onclick='topLogoClick()' >" +
            "       <img id='divSiteLogo' title='home' class='siteLogo' src='https://common.ogglefiles.com/img/redballon.png'/>" +
            "   </div>\n" +
            "   <div class='headerBodyContainer'>\n" +
            "       <div class='flexContainer'>\n" +
            "           <div id='fancyHeaderTitle' onclick='headerTitleClick()' class='calligraphyTitle'></div >\n" +
            "           <div id='topHeaderRow' class='hdrTopRowMenu'></div>" +
            "           <div id='topRowRightContainer'></div>" +
            "           <div id='searchBox' class='oggleSearchBox'>\n" +
            "               <span id='notUserName' title='Esc clears search.'>search</span>" +
            "                   <input class='oggleSearchBoxText' id='txtSearch' title='search' onkeydown='oggleSearchKeyDown(event)'></input>" +
            "               <div id='searchResultsDiv' class='searchResultsDropdown'></div>\n" +
            "           </div>\n" +
            "       </div>\n" +
            "       <div id='headerBottomRow' class='flexContainer'>\n" +
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
            "               <img src='https://common.ogglefiles.com/img/close.png' onclick='centeringDialogClose()'/></div>\n" +
            "           </div>\n" +
            "           <div id='centeredDialogContents' class='floatingDialogContents'></div>\n" +
            "      </div>\n" +
            "   </div>\n" +
            "</div>\n" +

            "<div id='floatingDialogBox' class='floatingDialogContainer displayHidden'>\n" +
            "    <div class='floatingDialogHeader'>\n" +
            "        <div \id='floatingDialogBoxTitle' class='floatingDialogTitle'></div>\n" +
            "        <div class='dialogCloseButton'><img src='https://common.ogglefiles.com/img/close.png' onclick='$(\"#floatingDialogBox\").hide()'/></div>\n" +
            "    </div>\n" +
            "    <div id='floatingDialogContents' class='floatingDialogContents'></div>\n" +
            "</div>\n" +

            "<div id='customDirTreeContainer' class='dirTreeImageContainer floatingDirTreeImage'>\n" +
            "   <img class='customDirTreeImage' src='https://common.ogglefiles.com/img/close.png'/>\n" +
            "</div>\n" +
            "<div id='vailShell' class='modalVail'></div>\n";
    }
}
/* -------- Dialog boxes -----------*/{
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
}
/* -------- Footer -----------------*/{
    function footerHtml() {
        $('footer').html(`
        <div class='flexContainer'>
              <div id='footerCol1' class='footerCol'>
                <div class='clickable' onclick='showFeedbackDialog()'>Feedback</div>
             </div>
             <div id='footerCol2' class='footerCol'>
                <div class='clickable' onclick='window.open("https://ogglefiles.com/blog")'>Blog</div>
             </div>
             <div id='footerCol3' class='footerCol'>
                <div class='clickable' onclick='mailMe()'>email site developer</div>
             </div>
             <div id='footerCol4' class='footerCol'>
             </div>
             <div id='footerCol5' class='footerCol'>
             </div>
             <div id='footerCol6' class='footerCol'>
             </div>
             <div id='footerCol7' class='footerCol rightMostfooterColumn'>
             </div>
            </div>\n<div class='footerFooter'>
                <div class='footerFooterMessage' id='footerMessage1'></div>
                <div class='footerFooterMessage' id='footerMessage2'></div>
                <div class='forceRight'>Copyright &copy;` + new Date().getFullYear() + `  -
                <div class='inline clickable' onclick='window.open("https://ogglefiles.com/node/IntelDesign.html")'">
                        Intelligent Design SoftWare</div>
            </div>
        </div>`);
    }

    //  target='_blank'

    function displayFooter(footerContext) {
        try {
            $('footer').html(footerHtml());
            switch (footerContext) {
                case "oggleAlbum":
                case "gallery":
                case "oggleIndex":
                case "slideshow":
                    $('#footerCol2').append(`
                    <div class='clickable' onclick='footerItemClick(1)'>Sitemap</div>
                    <div class='clickable' onclick='displayFeedback()'>Feedback</div>`
                    );
                    $('#footerCol3').append(`
                    <div class='clickable' onclick='footerItemClick(1)'>Search</div>
                    <div class='clickable' onclick='footerItemClick(1)'>Research</div>
                    <div class='clickable' onclick='footerItemClick(1)'>Advertize</div>`
                    );
                    $('#footerCol4').append();
                    $('#footerCol5').append();
                    $('#footerCol6').append(`
                        <div class='clickable' onclick='window.open("https://ogglefiles.com/admin/OggleDashboard.html")'>dashboard</div>`
                    );
                    $('#footerCol7').html();
                    break;
                case "welcome":
                case "blog":
                case "root":
                case "playboy":
                    $('#footerCol2').append();
                    $('#footerCol3').append();
                    $('#footerCol4').append();
                    $('#footerCol5').append();
                    $('#footerCol6').append();
                    $('#footerCol7').html();
                    break;
                case "special":
                case "index": {
                    $('#footerCol1').html(`
                        <div class='clickable' onclick='window.location.href=\"index.html?spa=3909\", \"_blank\"'>OgglePorn</div>
                        <div class='clickable' onclick='window.location.href=\"index.html?folderId=1142\", \"_blank\"'>Centerfolds</div>\n`);
                    $('#footerCol2').html(`
                        <div class='clickable' onclick='showCatListDialog(2)'>Category List</div>
                        <div class='clickable' onclick='showCatListDialog(3)'>Babes List</div>\n`);
                    break;
                }
                default: {
                    $('#footerCol1').html("<div>unhandled domain: " + footerContext + "</div>\n");
                    alert("footerContext not understood: " + footerContext)
                    break;
                }
            }
        } catch (e) {
            logCatch("display footer", e);
        }
    }

    //<a href='htt ps://ipinfo.io/' alt='IPinfo - Comprehensive IP address data, IP geolocation API and database'>
    //      this site uses<img src='/images/ipinfo.png' height='40' /></a>
    //<div id='footerCol6' class='footerColCustContainer'>
    //    <div class='clickable' onclick='window.location.href='https://www.paypal.com/donate/?hosted_button_id=M5UE6B2RJ9NFY'
    //        alt='paypal test'>make a donation</div>
    //</div >
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

    function footerItemClick(footerItem) {
        alert("footerItemClick: " + footerItem);
    }

    function displayFeedback() {
        alert("displayFeedback");
        //\"FLC\",\"feedback\", rootFolder + "\", folderId + "
    }
}
/* -------- Hit Counter ------------*/{
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
}

/* -------- Context Menu -----------*/{
}

