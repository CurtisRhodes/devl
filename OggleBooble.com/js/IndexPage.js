const randomGalleriesCount = 11;
let updatedGalleriesCount = 15;
let currentNumericPageContext;

function launchIndexPage(pageContext, numericPageContext) {

    showLogin(false);
    currentNumericPageContext = numericPageContext;

    displayHeader(numericPageContext);
    displayFooter(numericPageContext);

    switch (numericPageContext) {
        case 72:
            $('body').css({ "background-color": "#bdbeb8", "color": "#fff" });
            $('#oggleHeader').css("background-color", "#000");
            $('#carouselContainer').css("background-color", "#bdbeb8");
            $('.hdrTopRowMenu').css("color", "#f2e289");
            $('#oggleHeader').css("color", "#f2e289");
            break; 
        case 3909:
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
    getLatestUpdatedGalleries(pageContext);
    
    //promoMessagesContainer
    $('#betaMessage').html("promo")
        .css({ "top": 111, "left": 50 })
        .on("click", function () {
            showMessageContainer()
        });
}

/*-- php -------------------------------------------*/{

    function getLatestUpdatedGalleries(pageContext) {
        try {
            $.ajax({
                type: "GET",
                url: "php/getLatestUpdated.php?spaType=" + pageContext + "&limit=" + updatedGalleriesCount,
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

                    $('#imgLatestUpdate').on("click", function () {
                        updatedGalleriesCount += 15;
                        getLatestUpdatedGalleries(currentNumericPageContext);
                        logOggleEvent("LUC", currentNumericPageContext, "get updated galleries");
                    }).show();
                },
                error: function (jqXHR) {
                    logOggleError("XHR", numericPageContext, getXHRErrorDetails(jqXHR), "get updated galleries");
                }
            });
        } catch (e) {
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

