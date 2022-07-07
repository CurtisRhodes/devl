const randomGalleriesCount = 11;
let updatedGalleriesCount = 15;
let currentPageContext, currentNumericPageContext;

function launchIndexPage(pageContext, numericPageContext) {

    showLogin(false);
    currentNumericPageContext = numericPageContext;
    currentPageContext = pageContext;

    //displayHeader(numericPageContext);
    $('header').html(headerHtml());
    displayFooter(numericPageContext);

    switch (numericPageContext) {
        case 3908:   // index page
            document.title = "OggleBooble : Home of the Big Naturals";
            $('#fancyHeaderTitle').html("OggleBooble");
            $('#topRowLeftContainer').html("Home of the Big Naturals");

            $('#hdrBtmRowSec3').append(bannerLink('every playboy centerfold', 'https://ogglebooble.com/index.html?spa=playboy'));
            // $('#hdrBtmRowSec3').append(bannerLink('Oggle softcore', 'https://ogglebooble.com/album.html?folder=5233'));
            $('#hdrBtmRowSec3').append(bannerLink('Oggle Porn', 'https://ogglebooble.com/index.html?spa=porn'));

            $('#topRowLeftContainer').html(
                "<span class='bigTits' onclick='headerMenuClick(\"boobs\",3)'>BIG Naturals</span></a > organized by\n" +
                "<span onclick='headerMenuClick(\"boobs\",3916)'>poses, </span>\n" +
                "<span onclick='headerMenuClick(\"boobs\",136)'> positions,</span>\n" +
                "<span onclick='headerMenuClick(\"boobs\",159)'> topics,</span>\n" +
                "<span onclick='headerMenuClick(\"boobs\",199)'> shape,</span>\n" +
                "<span onclick='headerMenuClick(\"boobs\",241)'> size</span>\n");
            //"<span onclick='headerMenuClick(\"boobs\",4010)'> tit play</span>\n");
            break;
        case 72:
            changeFavoriteIcon("playboy");
            document.title = "Every Playboy Centerfold : OggleBooble";
            $('#divSiteLogo').attr("src", "https://common.ogglebooble.com/img/playboyBallon.png");
            $('#fancyHeaderTitle').html("Every Playboy Centerfold");

            $('#hdrBtmRowSec3').append(bannerLink('back to OggleBooble', 'https://ogglebooble.com/index.html'));
            $('#hdrBtmRowSec3').append(bannerLink('Bond girls', 'https://ogglebooble.com/album.html?folder=10326'));

            $('body').css({ "background-color": "#bdbeb8", "color": "#fff" });
            $('#oggleHeader').css("background-color", "#000");
            $('#carouselContainer').css("background-color", "#bdbeb8");
            $('.hdrTopRowMenu').css("color", "#f2e289");
            $('#oggleHeader').css("color", "#f2e289");

            $('#fancyHeaderTitle').css("cursor", "pointer");
            $('#fancyHeaderTitle').on("click", function () { window.location.href = "https://ogglebooble.com/album.html?folder=1132" });

            $('#topRowLeftContainer').html(
                "<span onclick='headerMenuClick(\"playboy\",3796)'>cybergirls, </span>\n" +
                "<span onclick='headerMenuClick(\"playboy\",6368)'>playboy plus, </span>\n" +
                "<span onclick='headerMenuClick(\"playboy\",6095)'>muses, </span>\n" +
                "<span onclick='headerMenuClick(\"playboy\",3128)'>international, </span>\n" +
                //"<span onclick='headerMenuClick(\"playboyIndex\",6076)'>specials, </span>\n" +
                //"<span onclick='headerMenuClick(\"playboyIndex\",3393)'>lingerie, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",9306)'>more</span>\n"
                //"<span onclick='headerMenuClick(\"playboyIndex\",4015)'>pictorials, </span>\n" +
                //"<span onclick='headerMenuClick(\"playboyIndex\",6076)'>specials, </span>\n" +
                //"<span onclick='headerMenuClick(\"playboyIndex\",3393)'>lingerie, </span>\n" +
            );
            $('#breadcrumbContainer').html(
                "<span onclick='headerMenuClick(\"playboyIndex\",621)'>1950's, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",638)'>1960's, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",639)'>1970's, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",640)'>1980's, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",628)'>1990's, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",641)'>2000's, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",513)'>2010's, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",4128)'>2020's </span>\n");
            break;
        case 3909:
            changeFavoriteIcon("porn");
            document.title = "OgglePorn : mostly blowjobs";
            $('#divSiteLogo').attr("src", "https://common.ogglebooble.com/img/csLips02.png");
            $('#fancyHeaderTitle').html("Oggle Porn");

            $('#hdrBtmRowSec3').append(bannerLink('back to OggleBooble', 'https://ogglebooble.com/index.html'));
            $('#hdrBtmRowSec3').append(bannerLink('porn actress archive', 'https://ogglebooble.com/album.html?folder=440'));
            $('#hdrBtmRowSec3').append(bannerLink('Oggle softcore', 'https://ogglebooble.com/album.html?folder=5233'));

            $('#topRowLeftContainer').html(
                "<span onclick='headerMenuClick(\"porn\",243)'>cock suckers, </span>\n" +
                "<span onclick='headerMenuClick(\"porn\",460)'>titty fuck, </span>\n" +
                "<span onclick='headerMenuClick(\"porn\",426)'>penetration, </span>\n" +
                "<span onclick='headerMenuClick(\"porn\",357)'>cum shots, </span>\n" +
                "<span onclick='headerMenuClick(\"porn\",694)'>kinky, </span>\n" +
                "<span onclick='headerMenuClick(\"porn\",411)'>naughty behaviour</span>\n");

            $('body').css({ "background-color": "darksalmon", "color": "#fff" });
            $('#carouselContainer').css("background-color", "darksalmon");
            $('#oggleHeader').css("background-color", "darkorange");
            break;
        default:
    }

    verifyUser(numericPageContext, null);
    logPageHit(numericPageContext);
    showPageHits(numericPageContext);

    launchCarousel(numericPageContext);
    getRandomGalleries(numericPageContext);
    getLatestUpdatedGalleries();
    
    //promoMessagesContainer
    $('#betaMessage').html("promo")
        .css({ "top": 111, "left": 50 })
        .on("click", function () {
            showMessageContainer()
        });
}

/*-- php -------------------------------------------*/{
    let gettingLatestUpdatedGalleries = false;
    function getLatestUpdatedGalleries() {
        try {
            if (!gettingLatestUpdatedGalleries) {
                gettingLatestUpdatedGalleries = true;
                $.ajax({
                    type: "GET",
                    url: "php/getLatestUpdated.php?spaType=" + currentPageContext + "&limit=" + updatedGalleriesCount,
                    success: function (data) {

                        $('#latestUpdatesContainer').html('');
                        let jdata = JSON.parse(data);
                        for (i = 0; i < updatedGalleriesCount; i++) {
                            let thisItemSrc = settingsImgRepo + jdata[i].ImageFile;
                            $('#latestUpdatesContainer').append("<div class='latestContentBox'>" +
                                "<div class='latestContentBoxLabel'>" + jdata[i].FolderName + "</div>" +
                                "<img id='lt" + jdata[i].FolderId + "' class='latestContentBoxImage' alt='img/redballon.png' \nsrc='" + thisItemSrc + "' \n" +
                                " onerror='imageError(\"" + jdata[i].FolderId + "\",\"" + thisItemSrc + "\",\"LatestUpdatedGalleries\")'\n" +
                                "\nonclick='latestUpdatesClick(" + jdata[i].FolderId + "\)'/>" +
                                "<div class='latestContentBoxDateLabel'>updated: " + dateString2(jdata[i].Acquired) + "</span></div>" +
                                "</div>");
                        }
                        $('#imgLatestUpdate').show();
                        gettingLatestUpdatedGalleries = false;

                        $('#imgLatestUpdate').on("click", function () {
                            updatedGalleriesCount += 15;
                            getLatestUpdatedGalleries();
                            logOggleEvent("LUC", currentNumericPageContext, "get updated galleries");
                        }).show();
                    },
                    error: function (jqXHR) {
                        gettingLatestUpdatedGalleries = false;
                        logOggleError("XHR", numericPageContext, getXHRErrorDetails(jqXHR), "get updated galleries");
                    }
                });
            }
        } catch (e) {
            gettingLatestUpdatedGalleries = false;
            logOggleError("CAT", numericPageContext, e, "get updated galleries");
        }
    }

    function latestUpdatesClick(folderId) {
        logOggleEvent("LUP", folderId, "get updated galleries");
        window.location.href = "https://ogglebooble.com/album.html?folder=" + folderId;
    }

    function getRandomGalleries(numericPageContext) {
        try {
            let whereClause = "((f.RootFolder=\"boobs\") or (f.RootFolder=\"archive\") or (f.RootFolder=\"bond\") or (f.RootFolder=\"soft\"))";

            if (numericPageContext == 3909)
                whereClause = "((f.RootFolder='porn') or (f.RootFolder='sluts') or (f.RootFolder='soft'))";

            if (numericPageContext == 72)
                whereClause = "((f.RootFolder='centerfold') or (f.RootFolder='cybergirl') or (f.RootFolder='muses') or (f.RootFolder='plus') or (f.RootFolder='bond'))";

            $.ajax({
                type: "GET",
                url: "php/getRandomGalleries.php?whereClause=" + whereClause + "&limit=" + randomGalleriesCount,
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
                                "onclick='window.location.href=\"https://ogglebooble.com/album.html?folder=" + obj.Id + "\" ' /></div>");
                        });

                        $('#imgRandomGalleries').on("click", function () {
                            getRandomGalleries(currentNumericPageContext);
                            logOggleEvent("RRG", 3908, currentNumericPageContext);
                        }).show();
                    }
                },
                error: function (jqXHR) {
                    $('#albumPageLoadingGif').hide();
                    logOggleError("XHR", folderId, getXHRErrorDetails(jqXHR), "get random  galleries");
                }
            });
        } catch (e) {
            logOggleError("CAT", folderId, e, "get random  galleries");
        }
    }
}

/*-- login -----------------------------------*/
    //if (localStorage["IsLoggedIn"] == "true") {
    //    getCookieValue("IsLoggedIn", "reset OggleHeader") == "true") {
    //    $('#spnUserName').html(getCookieValue("UserName", "reset OggleHeader"));


/*-- promo message -----------------------------*/{
    const messageBoxSlideSpeed = 50, messageBoxTop = 222;
    let currPos, destPos, offscreen, promoMessageRotator;

    function showPromoMessages() {
        // get promo messages
        promoMessageRotator = setInterval(function () { }, 2200);
    }

    function showMessageContainer(messageId) {
        $('#promoMessagesContents').html(`

            <div class='clickable underline' onclick='testConnection()' >verify connection</div>
            <div id="testConnectionResut"></div >
        `);

        //offscreen = 0 - $('#promoMessagesContainer').width() - 100;


        //$('#testConnectionResut').html("promoContainerWidth: " + $('#promoMessagesContainer').width() + "<br/>offscreen: " + offscreen);

        $('#promoMessagesContainer').css("top", messageBoxTop);
        currPos = offscreen;
        destPos = 50;
        $('#promoMessagesContainer').css("left", currPos).show();
        messageSide("out");
    }

    function messageSide(direction) {
        setTimeout(function () {
            $('#promoMessagesContainer').css("left", currPos);
            if (direction == "out") {
                if (currPos < destPos) {
                    currPos += 14;
                    messageSide(direction);
                }
                else {
                    $('#promoMessagesContainer').css("left", destPos);
                }
            }
            else {
                if (currPos > destPos) {
                    currPos -= 14;
                    messageSide(direction);
                }
                else {
                    $('#promoMessagesContainer').css("left", destPos);
                }
            }
        }, messageBoxSlideSpeed);
    }

    function promoMessageClose() {
        offscreen = 0 - $('#promoMessagesContainer').width() - 100;
        destPos = offscreen;
        messageSide("back");
        clearInterval(promoMessageRotator);
    }
}

/*-- testing -----------------------------------*/
function testConnection() {
    $.ajax({
        url: "php/validateConnection.php",
        success: function (response) {
            $('#testConnectionResut').html(response);
        }
    });
}

