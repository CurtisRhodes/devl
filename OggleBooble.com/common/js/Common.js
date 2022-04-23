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
        return yyyy + '/' + mm + '/' + dd;
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
            //msg = 'Not connect.\n Verify Network.';
            msg = 'jqXHR.status: ' + jqXHR.status + ", responseText: " + jqXHR.responseText;
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
        console.log("CATCH send email: " + e);
    }
}

function showFeedbackDialog() {
    // do I need a global currentAlbumId 
}

function mailMe() {
    //rtpe(\"FLC\",\"mailme\",\"mailme\"," + folderId + ")
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
                }
            }
        }
        catch (e) {
            console.log("CATCH getCookieValue: " + e);
        }
        finally {
            return returnValue;
        }
    }

    function setCookieValue(itemName, newValue) {
        document.cookie = itemName + "=" + newValue;
    }

    function rebuildCookie() {
        try {
            document.cookie = "VisitorId=" + localStorage["VisitorId"];
            document.cookie = "UserName=" + localStorage["UserName"];
            document.cookie = "IsLoggedIn=" + localStorage["IsLoggedIn"];
            var expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 9);
            document.cookie = 'expires=' + expiryDate.toUTCString() + 'path=https://ogglebooble.com/';

        } catch (e) {
            console.log("CATCH rebuild cookie: " + e);
        }
    }
}
/* -------- Header -----------------*/{
    // let hdrFolderId, hdrRootFolder;

    function displayHeader(headerContext) {
        $('header').html(headerHtml());

        //changeFavoriteIcon("redBallon");
        //document.title = "document.title";
        $('#topRowLeftContainer').html("");
        $('#headerMessage').html("");
        $('#topRowRightContainer').html("");
        $('#breadcrumbContainer').html("");
        $('#badgesContainer').html("");
        $('#hdrBtmRowSec3').html("");
        switch (headerContext) {
            case "oggleIndex":
                document.title = "OggleBooble : Home of the Big Naturals";
                $('#fancyHeaderTitle').html("OggleBooble");
                $('#topRowLeftContainer').html("Home of the Big Naturals");
                $('#hdrBtmRowSec3').append(bannerLink('every playboy centerfold', 'https://ogglebooble.com/index.html?spa=playboy'));
                $('#hdrBtmRowSec3').append(bannerLink('Oggle Porn', 'https://ogglebooble.com/index.html?spa=porn'));
                break;
            case "playboy":
            case "playboyIndex":
                document.title = "Every Playboy Centerfold : OggleBooble";
                $('#divSiteLogo').attr("src", "https://common.ogglebooble.com/img/playboyBallon.png");
                $('#fancyHeaderTitle').html("Every Playboy Centerfold");
                $('#hdrBtmRowSec3').append(bannerLink('back to OggleBooble', 'https://ogglebooble.com/index.html'));
                $('#hdrBtmRowSec3').append(bannerLink('Bond Girls', 'https://ogglebooble.com/album.html?folder=10326'));
                changeFavoriteIcon("playboy");
                break;
            case "porn":
                document.title = "OgglePorn : mostly blowjobs";
                $('#divSiteLogo').attr("src", "https://common.ogglebooble.com/img/csLips02.png");
                $('#fancyHeaderTitle').html("Oggle Porn");
                $('#hdrBtmRowSec3').append(bannerLink('back to OggleBooble', 'https://ogglebooble.com/index.html'));
                $('#hdrBtmRowSec3').append(bannerLink('porn actress archive', 'https://ogglebooble.com/album.html?folder=440'));
                changeFavoriteIcon("porn");
                break;
            case "sluts":
                $('#divSiteLogo').attr("src", "https://common.ogglebooble.com/img/csLips02.png");
                $('#fancyHeaderTitle').html("sluts ");
                $('#hdrBtmRowSec3').append(bannerLink('back to OgglePorn', 'https://ogglebooble.com/index.html?spa=porn'));
                $('#hdrBtmRowSec3').append(bannerLink('back to OggleBooble', 'https://ogglebooble.com/index.html'));
                changeFavoriteIcon("porn");
                break;
            case "bond":
                $('#divSiteLogo').attr("src", "https://common.ogglebooble.com/img/boogle007.png");
                $('#fancyHeaderTitle').html("Bond Girls");
                $('#topRowRightContainer').append(bannerLink('back to OggleBooble', 'https://ogglebooble.com/index.html'));
                $('#topRowRightContainer').append(bannerLink('every playboy centerfold', 'https://ogglebooble.com/index.html?spa=playboy'));
                changeFavoriteIcon("bond");
                break;
            case "soft":
                $('#divSiteLogo').attr("src", "https://common.ogglebooble.com/img/redwoman.png");
                $('#fancyHeaderTitle').html("Oggle softcore");
                $('#hdrBtmRowSec3').append(bannerLink('back to OggleBooble', 'https://ogglebooble.com'));
                $('#hdrBtmRowSec3').append(bannerLink('OgglePorn', 'https://ogglebooble.com/index.html?spa=porn'));
                break;
            case "brucheum":
                $('#divSiteLogo').attr("src", "https://common.ogglebooble.com/img/house.gif");
                $('#fancyHeaderTitle').html("The Brucheum");
                $('#topRowLeftContainer').html("");
                $('#searchBox').hide();
                showLogin(false);
                break;
            case "slideshow":
                $('#fancyHeaderTitle').html("OggleBooble");
                $('#topRowLeftContainer').html("Slideshow");
                break;
            case "oggleAlbum":
                $('#fancyHeaderTitle').html("OggleBooble");
                //$('#topRowRightContainer').append(bannerLink("every playboy centerfold", 3908));
                //$('#hdrBtmRowSec3').append(bannerLink("Oggle Porn", 242));
                //$('#hdrBtmRowSec3').append(bannerLink("softcore", 5233));
                //$('#hdrBtmRowSec3').append(bannerLink("Gent Archive", 846));
                //$('#hdrBtmRowSec3').append(bannerLink("Bond Girls", 10326));
                //$('#topRowLeftContainer').html("Home of the Big Naturals");
                break;
            case "OggleDashboard":
                $('#fancyHeaderTitle').html("OggleBooble.com");
                $('#topRowLeftContainer').html("admin");
                $('#divSiteLogo').attr("src", "https://common.ogglebooble.com/img/adminPanel01.png");
                $('#fancyHeaderTitle').html("Oggle Dashboard");
                break;
            case "admin":
                document.title = "admin : Brucheum.com";
                $('#fancyHeaderTitle').html("Brucheum.com");
                $('#topRowLeftContainer').html("admin");
                $('#searchBox').hide();
                break;
            case "IntelDesign":
                document.title = "Intelligent Design Software : CurtisRhodes.com";
                $('#divSiteLogo').attr("src", "https://common.ogglebooble.com/img/intel01.jpg");
                $('#fancyHeaderTitle').html("Intelligent Design Software");
                break;
            case "blog": {
                document.title = "blog : CurtisRhodes.com";
                $('#divSiteLogo').attr("src", "https://common.ogglebooble.com/img/house.gif");
                $('#fancyHeaderTitle').html("CurtisRhodes.com");
                $('#topRowLeftContainer').html("blog");
                $('#searchBox').hide();
                break;
            }
            case "index": {
                changeFavoriteIcon("redBallon");
                $('#topRowLeftContainer').html("Home of the Big Naturals");
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
                $('#topRowLeftContainer').html(
                    "<span class='bigTits' onclick='headerMenuClick(\"boobs\",3)'>BIG Naturals</span></a > organized by\n" +
                    "<span onclick='headerMenuClick(\"boobs\",3916)'>poses, </span>\n" +
                    "<span onclick='headerMenuClick(\"boobs\",136)'> positions,</span>\n" +
                    "<span onclick='headerMenuClick(\"boobs\",159)'> topics,</span>\n" +
                    "<span onclick='headerMenuClick(\"boobs\",199)'> shape,</span>\n" +
                    "<span onclick='headerMenuClick(\"boobs\",241)'> size,</span>\n");
                    //"<span onclick='headerMenuClick(\"boobs\",4010)'> tit play</span>\n");
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
                $('#topRowLeftContainer').html(
                    "<span onclick='headerMenuClick(\"soft\",379)'>pussy, </span>\n" +
                    "<span onclick='headerMenuClick(\"soft\",420)'>boob suckers, </span>\n" +
                    "<span onclick='headerMenuClick(\"soft\",498)'>big tit lezies, </span>\n" +
                    "<span onclick='headerMenuClick(\"soft\",357)'>fondle, </span>\n" +
                    "<span onclick='headerMenuClick(\"soft\",397)'>kinky, </span>\n" +
                    "<span onclick='headerMenuClick(\"soft\",411)'>naughty behaviour</span>\n");
                break;
            }
            case "playboy":
                $('#topRowLeftContainer').html(
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
            case "porn": {
                $('#topRowLeftContainer').html(
                    "<span onclick='headerMenuClick(\"porn\",243)'>cock suckers, </span>\n" +
                    "<span onclick='headerMenuClick(\"porn\",460)'>titty fuck, </span>\n" +
                    "<span onclick='headerMenuClick(\"porn\",426)'>penetration, </span>\n" +
                    "<span onclick='headerMenuClick(\"porn\",357)'>cum shots, </span>\n" +
                    "<span onclick='headerMenuClick(\"porn\",694)'>kinky, </span>\n" +
                    "<span onclick='headerMenuClick(\"porn\",411)'>naughty behaviour</span>\n");
                break;
            }
            case "sluts": {
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
                case "redBallon": link.href = 'https://common.ogglebooble.com/img/redBallon.ico'; break;
                case "playboy": link.href = 'https://common.ogglebooble.com/img/playboyBallon.png'; break;
                case "porn": link.href = 'https://common.ogglebooble.com/img/csLips02.png'; break;
                case "sluts": link.href = 'https://common.ogglebooble.com/img/redwoman.png.png'; break;
                case "bond": link.href = 'https://common.ogglebooble.com/img/boogle007.png'; break;
                case "intelDesign": link.href = 'https://common.ogglebooble.com/img/intel01.jpg'; break;
                case "getaJob": link.href = 'https://common.ogglebooble.com/img/GetaJob.png'; break;
                case "loading": link.href = "https://common.ogglebooble.com/img/loader.gif"; link.type = 'image/gif'; break;
                case "brucheum": link.href = 'https://common.ogglebooble.com/img/Brucheum.ico'; break;
                default: link.href = 'https://common.ogglebooble.com/img/redBallon.ico'; break;
            }
            document.getElementsByTagName('head')[0].appendChild(link);
        } catch (e) {
            console.log("CATCH change Favorites Icon: " + e);
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

    function bannerLink(labelText, href) {
        return `<div class='headerBannerButton'>
                    <div class='clickable' onclick='window.location.href="` + href + `"'>` + labelText + `</div>
                </div>`;
    }

    function topLogoClick() {
        let logoImage = $('#divSiteLogo').prop("src").substr($('#divSiteLogo').prop("src").lastIndexOf("/") + 1);
        switch (logoImage) {
            case "redballon.png":
                location.href = "https://ogglebooble.com"; break;
            case "redwoman.png":
                window.open("index.html?folder=440"); break;
            case "playboyBallon.png":
                window.location.href = "https://ogglebooble.com/index.html?spa=playboy"; break;
            case "csLips02.png":
                window.location.href = "https://ogglebooble.com/index.html?spa=porn"; break;
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
        return `<div class='siteLogoContainer' onclick='topLogoClick()' >
                   <img id='divSiteLogo' title='home' class='siteLogo' src='https://common.ogglebooble.com/img/redballon.png'/>
               </div>\n
               <div class='headerBodyContainer'>
                   <div id='topHeaderRow' class='flexContainer'>
                       <div id='fancyHeaderTitle' onclick='headerTitleClick()' class='calligraphyTitle'></div >
                       <div id='topRowLeftContainer' class='hdrTopRowMenu'></div>
                       <div id='topRowMiddleContainer'></div>
                       <div id='topRowRightContainer'></div>
                       <div id='searchBox' class='oggleSearchBox'>
                           <span id='notUserName' title='Esc clears search.'>search</span>
                               <input class='oggleSearchBoxText' id='txtSearch' title='search'></input > 
                           <div id='searchResultsDiv' class='searchResultsDropdown'></div>
                       </div>
                   </div>
                   <div id='headerBottomRow' class='flexContainer'>
                       <div class='bottomRowSection1'>
                           <div id='headerMessage' class='bottomLeftHeaderArea'></div>
                           <div id='breadcrumbContainer' class='breadCrumbArea'></div>
                           <div id='badgesContainer' class='badgesSection'></div>
                           <div id='hdrBtmRowSec3' class='hdrBtmRowOverflow'></div>
                       </div>
                       <div id='divLoginArea' class='loginArea'>
                           <div id='optionLoggedIn' class='displayHidden'>
                               <div class='hoverTab' title='modify profile'><a href='javascript:showUserProfileDialog()'>Hello <span id='spnUserName'></span></a></div>
                               <div class='hoverTab'><a href='javascript:onLogoutClick()'>Log Out</a></div>
                           </div>
                           <div id='optionNotLoggedIn' class='displayHidden'>
                               <div id='btnLayoutRegister' class='hoverTab'><a href='javascript:showRegisterDialog()'>Register</a></div>
                               <div id='btnLayoutLogin' class='hoverTab'><a href='javascript:showLoginDialog()'>Log In</a></div>
                           </div>
                       </div>
                   </div>
               </div>

            <div id='indexCatTreeContainer' class='floatingDialogContainer'></div>

            <div id='customMessageContainer' class='floatingDialogContainer'>
                <div id='customMessage' class='customMessageContainer' ></div>
            </div>

            <div class='centeringOuterShell'>
               <div class='centeringInnerShell'>
                  <div id='centeredDialogContainer' class='floatingDialogContainer'>
                       <div id='centeredDialogHeader'class='floatingDialogHeader' onmousedown='centeredDialogEnterDragMode()' onmouseup='centeredDialogCancelDragMode()'>
                           <div id='centeredDialogTitle' class='floatingDialogTitle'></div>
                           <div id='centeredDialogCloseButton' class='dialogCloseButton'>
                           <img src='https://common.ogglebooble.com/img/close.png' onclick='centeringDialogClose()'/></div>
                       </div>
                       <div id='centeredDialogContents' class='floatingDialogContents'></div>
                  </div>
               </div>
            </div>

            <div id='floatingDialogBox' class='floatingDialogContainer displayHidden'>
                <div class='floatingDialogHeader'>
                    <div \id='floatingDialogBoxTitle' class='floatingDialogTitle'></div>
                    <div class='dialogCloseButton'><img src='https://common.ogglebooble.com/img/close.png' onclick='$(\"#floatingDialogBox\").hide()'/></div>
                </div>
                <div id='floatingDialogContents' class='floatingDialogContents'></div>
            </div>

            <div id='customDirTreeContainer' class='dirTreeImageContainer floatingDirTreeImage'>
               <img class='customDirTreeImage' src='https://common.ogglebooble.com/img/close.png'/>
            </div>
            <div id='vailShell' class='modalVail'></div>`;
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
                <div class='clickable' onclick='window.open("https://blog.ogglebooble.com/OggleBlog.html")'>Blog</div>
             </div>
             <div id='footerCol3' class='footerCol'>
                <div class='clickable' onclick='window.location.href="mailto:curtishrhodes@hotmail.com"'>email site developer</div>
             </div>
             <div id='footerCol4' class='footerCol'>
                <div id='footerPageType'></div>
             </div>
             <div id='footerCol5' class='footerCol'>
                <div id='footerPagehit'>5</div>
             </div>
             <div id='footerCol6' class='footerCol'>
                <div class='clickable' onclick='window.open("https://www.paypal.com/donate/?hosted_button_id=M5UE6B2RJ9NFY")'
                    alt='paypal test'>make a donation</div>
             </div>
             <div id='footerCol7' class='footerCol rightMostfooterColumn'>
             </div>
        </div>
        <div class='footerFooter'>
            <div class='footerFooterMessage' id='footerMessage1'></div>
            <div class='footerFooterMessage' id='footerMessage2'></div>
            <div class='forceRight'>Copyright &copy;` + new Date().getFullYear() + `  -
                <div class='inline clickable' onclick='window.open("https://ogglefiles.com/node/IntelDesign.html")'">Intelligent Design SoftWare</div>
            </div>
        </div>`);
    }

    function displayFooter(footerContext) {
        try {
            $('footer').html(footerHtml());
            switch (footerContext) {
                case "archive":
                case "oggleAlbum":
                case "gallery":
                case "oggleIndex":
                case "porn":
                case "welcome":
                case "blog":
                case "root":
                case "special":
                case "index": {
                    $('#footerCol1').append(`
                        <div class='clickable' onclick='window.location.href=\"index.html?spa=3909\", \"_blank\"'>OgglePorn</div>
                        <div class='clickable' onclick='window.location.href=\"index.html?folderId=1142\", \"_blank\"'>Centerfolds</div>\n`);
                    $('#footerCol2').append(`
                        <div class='clickable' onclick='showCatListDialog(2)'>Category List</div>
                        <div class='clickable' onclick='showCatListDialog(3)'>Babes List</div>\n`);
                    break;
                }
                case "playboy":
                    $('#footerCol1').append(`
                        <div class='clickable' onclick='window.location.href=\"index.html?spa=3909\", \"_blank\"'>OgglePorn</div>
                        <div class='clickable' onclick='window.location.href=\"index.html?folderId=1142\", \"_blank\"'>Centerfolds</div>\n`);
                    $('#footerCol2').append(`
                        <div class='clickable' onclick='showCatListDialog(2)'>Category List</div>
                        <div class='clickable' onclick='showCatListDialog(3)'>Babes List</div>\n`);
                    break;
                case "slideshow":
                    $('#footerCol2').append(`
                    <div class='clickable' onclick='footerItemClick(1)'>Sitemap</div>
                    <div class='clickable' onclick='displayFeedback()'>Feedback</div>`
                    );
                    $('#footerCol3').append(`
                    <div class='clickable' onclick='footerItemClick(1)'>Search</div>                    
                    <div class='clickable' onclick='footerItemClick(1)'>Advertize</div>`
                    );
                    //$('#footerCol4').append();
                    //$('#footerCol5').append();
                    $('#footerCol6').append(`
                        <div class='clickable' onclick='window.open("https://admin.ogglebooble.com")'>dashboard</div>`
                    );
                    //$('#footerCol7').html();
                    break;
                default: {
                    $('#footerCol1').html("<div>unhandled domain: " + footerContext + "</div>\n");
                    //alert("footerContext not understood: " + footerContext)
                    break;
                }
            }
        } catch (e) {
            console.log("CATCH display footer: " + e);
        }
    }

    //<a href='htt ps://ipinfo.io/' alt='IPinfo - Comprehensive IP address data, IP geolocation API and database'>
    //      this site uses<img src='/images/ipinfo.png' height='40' /></a>
    //<div id='footerCol6' class='footerColCustContainer'>
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

    function mailMe() {

    }
}
