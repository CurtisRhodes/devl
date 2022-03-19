const updatedGalleriesSize = 12;
let updatedGalleriesSkip = 0;

/*-- php -------------------------------------------*/
function getLatestUpdatedGalleries(spaType) {
    try {
        $.ajax({
            type: "GET",
            url: "php/getLatestUpdated.php?spaType=" + spaType + "&limit=" + updatedGalleriesSize,
            success: function (data) {
                if (data.indexOf("error") > 0) {
                    alert("getLatestUpdatedGalleries: " + data);
                }
                else {
                    if (updatedGalleriesSkip == 0) {
                        $('#latestUpdatesContainer').html('');
                    }
                    let jdata = JSON.parse(data);
                    for (i = updatedGalleriesSkip; i < updatedGalleriesSize; i++) {
                        let thisItemSrc = settingsImgRepo + jdata[i].ImageFile;
                        $('#latestUpdatesContainer').append("<div class='latestContentBox'>" +
                            "<div class='latestContentBoxLabel'>" + jdata[i].FolderName + "</div>" +
                            "<img id='lt" + jdata[i].FolderId + "' class='latestContentBoxImage' alt='img/redballon.png' \nsrc='" + thisItemSrc + "' \n" +
                            " onerror='imageError(\"" + jdata[i].FolderId + "\",\"" + thisItemSrc + "\",'LatestUpdatedGalleries'\")'\n" +
                            "\nonclick='window.location.href=\"https://ogglefiles.com/beta/album.html?folder=" + jdata[i].FolderId + "\" ' />" +
                            "<div class='latestContentBoxDateLabel'>updated: " + dateString2(jdata[i].Acquired) + "</span></div>" +
                            "</div>");
                    }
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                alert("setFolderImage: " + errMsg);
            }
        });
    } catch (e) {
        logCatch("get Latest Updated Galleries", e);
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
                            "onclick='window.location.href=\"https://ogglefiles.com/beta/album.html?folder=" + obj.Id + "\" ' /></div>");
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

/*-- message box -----------------------------------*/

/*-- message slide out -----------------------------*/{
    let currPos, destPos;
    function messageSideOut(messageId) {
        currPos = -500;
        $('#messageSlideOut').css("left", currPos);
        $('#messageSlideOutContents').html('test message');
    }
    function sideOut() {
        if (currPos < destPos) {
            setTimeout(function () {
                currPos += 14;
                $('#messageSlideOut').css("left", currPos);
                sideOut();
            }, messageBoxSlideSpeed);
        }
    }
}


function testConnection() {
    //    $.ajax({    //create an ajax request to display.php
    //        type: "GET",
    //        url: "php/validateConnection.php",
    //        dataType: "html",   //expect html to be returned                
    //        success: function (response) {
    //            $("#carouselContainer").html(response);
    //        }
    //    });
}

