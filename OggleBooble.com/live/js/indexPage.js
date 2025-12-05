let randomGalleriesCount = 20, updatedGalleriesCount = 22;
let currentPageContext;

function launchIndexPage(pageContext) {

    currentPageContext = pageContext;
    // currentFolderId=
    switch (pageContext) {
        case "boobs": currentFolderId = 3; break;
        case "playboy": currentFolderId = 472; break;
        case "porn": currentFolderId = 460; break;
        default: currentFolderId = 3;
    }

    validateUser();

    let commonHeaderInfo = {
        VisitorId: sessionStorage.VisitorId,
        FolderId: currentFolderId,
        FolderName: "index",
        ParentName: "root",
        RootFolder: pageContext,
        FolderType: "index"
    };

    displayCommonHeader(commonHeaderInfo);

    showLogin();

    launchCarousel(pageContext);

    getLatestUpdatedGalleries(pageContext);
    getRandomGalleriesFromCache(pageContext);

    // rebuildRandomGalleryCache(pageContext);

    ele("imgLatestUpdated").addEventListener("click", () => {
        updatedGalleriesCount += 15;
        getLatestUpdatedGalleries(currentPageContext);
        // log event
    });
    ele("imgRandomGalleries").addEventListener("click", () => {
        rebuildRandomGalleryCache(pageContext);
        // log event
    });


    // displayFooter(pageContext, "index");
    if (sessionStorage.VisitorId == "60771847-a35a-4796-b590-f378b92b61b7") {
        sessionStorage.VisitorId = adminVisitorId;
    }
    if (sessionStorage.VisitorId == adminVisitorId) {
        ele("footerCol4").insertAdjacentHTML("beforeEnd",
            `<div class='clickable' onclick='rebuildLatestUpdatedGalleriesCache("` + currentPageContext + `")'>refresh latest</div>`);
    }

    // if (pageContext == "porn") determinePornStatus();

    if (sessionStorage.VisitorId == adminVisitorId) {
        showPageHits(currentFolderId)
        // ele("footerCol3").insertAdjacentHTML("beforeend", "<div class='clickable' onclick='showOggleFeedbackDialog(" + a lbumInfo.Id + ")'>Feedback</div>");
    }


    document.addEventListener('keydown', captureKeydownEvent);
    window.addEventListener("resize", resizeIndexPage());        
}

/*-- promo message -----------------------------*/{

    function showPromoMessages() {
        // get promo messages
        try {
            rtndata = null;
            getDataFromServer("php/fetch?schema=oggleboo_Brucheum&query=select BlogComment from st21569_wysiwyg.BlogItem where BlogTitle = 'porn warning'");
            let dataIncr = setInterval(function () {
                if (isNullorUndefined(rtndata))
                    loadingGif("show");
                else {
                    clearInterval(dataIncr); loadingGif("hide");
                    let dataJson = JSON.parse(rtndata);
                    showPromoMessage(dataJson[0].BlogComment, 'porn warning');
                }
            });
        } catch (e) {
            logOggleError("CAT", e, "get updated galleries");
        }
    }

    function showPromoMessage(html, title) {
        //  4/15/23
        $('body').append(`<div id='promoMsg' class='floatingDialogContainer'>
                 <div class='floatingDialogHeader'>
                    <div \id='floatingDialogBoxTitle' class='floatingDialogTitle'>`+ title + `</div>
                    <div class='dialogCloseButton'><img src='img/close.png' onclick='$(\"#promoMsg\").hide()'/></div>
                 </div>
                 <div id='floatingDialogContents' class='floatingDialogContents'>
                  <div id='promoMsgBody' class="typicalPopup">
                  </div>
                </div>`);
        $('#promoMsgBody').html(html);
        $('#promoMsg').css({ "top": "30px", "left": "330px" }).draggable().resizable().fadeIn();
    }

    //$('#betaMessage').html("promo")
    //    .css({ "top": 111, "left": 50 })
    //    .on("click", function () {
    //        showMessageContainer()
    //    });

    const messageBoxSlideSpeed = 50, messageBoxTop = 222;
    let currPos, destPos, offscreen, promoMessageRotator;


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

    function showAddSpace(pageContext) {
        $('#middleColumn').append("<div id='leftSideAddBox' class='addBox'></div>");
        $('#middleColumn').append("<div id='rightSideAddBox' class='addBox'></div>");
    }
}

function resizeIndexPage() {

    let mediaWidth = document.width;


    ele("carouselContainer").style.height = ((window.innerHeight * .62) + "px");
    resizeCarousel("index page");
}
