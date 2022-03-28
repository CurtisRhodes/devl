const randomGalleriesCount = 11;
let updatedGalleriesCount = 15;

function launchIndexPage(pageContext) {

    showLogin(false);

    displayHeader(pageContext);
    displayFooter(pageContext);
    //promoMessagesContainer

    if (pageContext == "playboy") {
        $('body').css({ "background-color": "#000", "color": "#fff" });
        $('#carouselContainer').css("background-color", "#000");
        $('#topHeaderRow').css("color", "#f2e289");
    }

    if (pageContext == "porn") {
        $('body').css({ "background-color": "darksalmon", "color": "#fff" });
        $('#oggleHeader').css("background-color", "darkorange");
    }

    launchCarousel(pageContext);
    getRandomGalleries(pageContext);
    getLatestUpdatedGalleries(pageContext);

    verifyUser("index page");

//    $('#betaMessage').html("reformat hard drive")
//        .css({ "top": 111, "left": 50 })
//        .on("click", function () { showMessageContainer() }).show();
}

/*-- php -------------------------------------------*/{
    function getLatestUpdatedGalleries(spaType) {
        try {
            $('#latestUpdatesContainer').html('<img class="tinyloadingGif" src="img/loader.gif"/>');
            if (spaType == "oggleIndex")
                spaType = "boobs";

            $.ajax({
                type: "GET",
                url: "php/getLatestUpdated.php?spaType=" + spaType + "&limit=" + updatedGalleriesCount,
                success: function (data) {
                    $('#latestUpdatesContainer').html('');
                    let jdata = JSON.parse(data);
                    for (i = 0; i < updatedGalleriesCount; i++) {
                        let thisItemSrc = settingsImgRepo + jdata[i].ImageFile;
                        $('#latestUpdatesContainer').append("<div class='latestContentBox'>" +
                            "<div class='latestContentBoxLabel'>" + jdata[i].FolderName + "</div>" +
                            "<img id='lt" + jdata[i].FolderId + "' class='latestContentBoxImage' alt='img/redballon.png' \nsrc='" + thisItemSrc + "' \n" +
                            " onerror='imageError(\"" + jdata[i].FolderId + "\",\"" + thisItemSrc + "\",'LatestUpdatedGalleries'\")'\n" +
                            "\nonclick='window.location.href=\"https://ogglefiles.com/beta/album.html?folder=" + jdata[i].FolderId + "\" ' />" +
                            "<div class='latestContentBoxDateLabel'>updated: " + dateString2(jdata[i].Acquired) + "</span></div>" +
                            "</div>");
                    }
                    $('#imgLatestUpdate').on("click", function () {
                        updatedGalleriesCount += 11;
                        getLatestUpdatedGalleries(spaType);
                    }).show();
                },
                error: function (jqXHR) {
                    logOggleError("XHR", folderId, getXHRErrorDetails(jqXHR), "get updated galleries");
                }
            });
        } catch (e) {
            logOggleError("CAT", folderId, e, "get updated galleries");
        }
    }

    function getRandomGalleries(pageContext) {
        try {
            let whereClause = "((f.RootFolder=\"boobs\") or (f.RootFolder=\"archive\") or (f.RootFolder=\"bond\") or (f.RootFolder=\"soft\"))";

            if (pageContext == "porn")
                whereClause = "((f.RootFolder='porn') or (f.RootFolder='sluts') or (f.RootFolder='soft'))";

            if (pageContext == "playboy")
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
                                "onclick='window.location.href=\"https://ogglefiles.com/beta/album.html?folder=" + obj.Id + "\" ' /></div>");
                        });

                        $('#imgRandomGalleries').on("click", function () {
                            getRandomGalleries(pageContext);
                            logOggleActivity
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


/*-- message slide out -----------------------------*/{
    const messageBoxSlideSpeed = 50, messageBoxTop = 222;
    let currPos, destPos, offscreen, promoMessageRotator;

    function showPromoMessages() {
        // get promo messages
        promoMessageRotator = setInterval(function () { }, 2200);
    }

    function showMessageContainer(messageId) {
        $('#promoMessagesContainer').css("top", messageBoxTop);


        $('#promoMessagesContents').html(`
            <div class=""clickable onclick="testConnection()">verify connection</div>
            <div id="testConnectionResut"></div >
        `);
        offscreen = 0 - $('#promoMessagesContainer').width() - 100;


        $('#testConnectionResut').html("promoContainerWidth: " + $('#promoMessagesContainer').width() + "<br/>offscreen: " + offscreen);

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

