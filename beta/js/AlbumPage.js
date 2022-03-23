let currentFolderId, currentImagelinkId;

function loadAlbumPage(folderId, islargeLoad) {
    currentFolderId = folderId;
    getAlbumImages(folderId, islargeLoad);
    getAlbumPageInfo(folderId, islargeLoad);
}

/*-- php -----------------------------------*/
function getAlbumImages(folderId, islargeLoad) {
    try {
        $('#albumPageLoadingGif').css("height", "27px");
        $('#albumPageLoadingGif').show();
        $('#imageContainer').html("");
        if (islargeLoad) {
            $.ajax({
                url: "php/customFetchAll.php?query=Select * from CategoryFolder where Parent=" + folderId,
                success: function (data) {
                    $('#albumContentArea').fadeIn();
                    let childFolders = JSON.parse(data);
                    $.each(childFolders, function (idx, childFolder) {
                        $.getJSON('php/customFetchAll.php?query=select * from VwLinks where FolderId=' + childFolder.Id + ' order by SortOrder', function (data) {
                            let vlinks = JSON.parse(data);
                            $.each(vlinks, function (idx, vLink) {
                                loadImageResults(vLink, childFolder.Id);
                            });
                        });
                        resizeAlbumPage();
                    });
                    $('#albumPageLoadingGif').hide();
                }
            });
        }
        else {
            $.getJSON('php/customFetchAll.php?query=select * from VwLinks where FolderId=' + folderId + ' order by SortOrder', function (data) {
                // let vlinks = JSON.parse(data);
                $.each(data, function (idx, vLink) {
                    loadImageResults(vLink, folderId);
                });
                getSubFolders(folderId);
            });
        }
    } catch (e) {
        $('#albumPageLoadingGif').hide();
        logCatch("getAlbumImages", e);
    }
}

function loadImageResults(vLink, folderId) {
    let imgSrc = 'https://common.ogglefiles.com/img/redballon.png';
    if (!isNullorUndefined(vLink.FileName))
        imgSrc = settingsImgRepo + "/" + vLink.FileName.replace(/'/g, '%27');

    $('#imageContainer').append("<div class='intividualImageContainer'>" +
        "<img id='" + vLink.LinkId + "' class='thumbImage' src='" + imgSrc + "' \n" +
        "onerror='imageError(" + folderId + ",\"" + vLink.LinkId + "\",\"album\")' \n" +
        "oncontextmenu='albumContextMenu(\"Image\",\"" + vLink.LinkId + "\"," + folderId + ",\"" + imgSrc + "\")' \n" +
        "onclick='viewImage(\"" + imgSrc + "\",\"" + vLink.LinkId + "\")'/></div>");
}

function getSubFolders(folderId) {
    try {
        $.getJSON("php/customFetchAll.php?query=select * from VwDirTree where Parent=" + folderId +
            " order by SortOrder,FolderName", function (data) {
                $.each(data, function (index, obj) {
                    let linkId = create_UUID();
                    let folderCounts = "(" + Number(obj.FileCount).toLocaleString() + ")";
                    if (obj.SubFolderCount > 0)
                        folderCounts = "(" + obj.SubFolderCount + "/" + Number(obj.FileCount + obj.TotalChildFiles).toLocaleString() + ")";

                    let imgSrc = 'https://common.ogglefiles.com/img/RenStimpy8.jpg'
                    if (!isNullorUndefined(obj.FolderImage))
                        imgSrc = settingsImgRepo + "/" + obj.FolderImage.replace(/'/g, '%27');

                    $('#imageContainer').append("<div class='subFolderContainer'\n" +
                        // " oncontextmenu='albumContextMenu(\"Folder\",\"" + linkId + "\"," + folderId + ",\"" + imgSrc + "\")'\n" +
                        " onclick='folderClick(" + obj.Id + "," + obj.IsStepChild + ")'>\n" +
                        "<img id='" + linkId + "' class='folderImage' src='" + imgSrc + "'/> " +
                        // alt = 'https://common.ogglefiles.com/img/RenStimpy8.jpg' /> " +
                        //"onerror='imageError(\"" + folderId + "\",\"'" + obj.linkId + "\"',\"'" + imgSrc + "\"','\"subFolder\")'/>\n" +
                        "<div class='defaultSubFolderImage'>" + obj.FolderName + "</div>\n" +
                        "<span Id='fc" + obj.FolderId + "'>" + folderCounts + "</span></div>");
                });
                resizeAlbumPage();
            });
    } catch (e) {
        $('#albumPageLoadingGif').hide();
        logCatch("getSubFolders", e);
    }
}

function getAlbumPageInfo(folderId, islargeLoad) {
    try {
        let infoStart = Date.now();
        if (isNullorUndefined(folderId)) {
            alert("get AlbumPage info: folderId.isNullorUndefined: " + folderId);
            return;
        }

        $.ajax({
            url: 'php/customFetch.php?query=Select * from CategoryFolder where Id=' + folderId,
            success: function (data) {
                let catfolder = JSON.parse(data);
                $('#albumPageLoadingGif').hide();
                $('#albumTopRow').show();
                $('#seoPageName').html(catfolder.FolderName);

                // resetOggleHeader(folderId, catfolder.RootFolder);

                switch (catfolder.RootFolder) {
                    case "playboy":
                    case "centerfold":
                    case "cybergirl":
                    case "magazine":
                    case "muses":
                    case "plus":
                        displayHeader("playboy");
                        displayFooter("playboy");

                        $('body').css({ "background-color": "#000", "color": "#fff" });
                        $('#carouselContainer').css("background-color", "#000");
                        break;
                    case "bond":
                    case "porn":
                    case "sluts":
                        document.title = catfolder.FolderName + " : OgglePorn";
                        break;
                    case "soft":
                        document.title = catfolder.FolderName + " : OgglePorn";
                        break;
                    default:
                        document.title = catfolder.FolderName + " : OggleBooble";
                }


                switch (catfolder.FolderType) {
                    case "multiFolder":
                    case "singleParent":
                        $('#largeLoadButton').show();
                        $('#deepSlideshowButton').show();
                        if (catfolder.Files > 0) 
                            $('#albumBottomfileCount').html(catfolder.Files + "/" + catfolder.SubFolders);                        
                        else
                            $('#albumBottomfileCount').html(catfolder.TotalSubFolders + "/" + Number(catfolder.TotalChildFiles).toLocaleString());
                        break;
                    case "singleModel":
                    case "multiModel":
                    case "singleChild":
                        $('#largeLoadButton').hide();
                        $('#deepSlideshowButton').hide();
                        $('#albumBottomfileCount').html(catfolder.Files);
                        break;
                }
                setBreadcrumbs(folderId);

                if (islargeLoad) {
                    $('#largeLoadButton').hide();
                }

                $('#largeLoadButton').on("click", function () { getAlbumImages(folderId, true) });
                $('#deepSlideshowButton').on("click", function () { showSlideshowViewer(folderId, 0, true) });
                $('#slideShowClick').on("click", function () { showSlideshowViewer(folderId, 0, false) });

                $('#albumBottomfileCount').show();
                $('#albumBottomfileCount').on("click", function () { updateFolderCount(folderId, catfolder.FolderPath) });

                $('#feedbackButton').on("click", function () {
                    showFeedbackDialog(folderId, catfolder.FolderName);
                });


            },
            error: function (jqXHR) {
                $('#albumPageLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                alert("get AlbumPageInfo: " + errMsg);
                //if (!checkFor404(errMsg, folderId, "chargeCredits")) logError("XHR", folderId, errMsg, "chargeCredits");
            }
        });
        let delta = (Date.now() - infoStart) / 1000;
        console.log("get AlbumPageInfo took: " + delta.toFixed(3));
    } catch (e) {
        logCatch("get Album Page Info folderId:", e);
    }
}

function setBreadcrumbs(folderId) {
    try {
        //$('#aboveImageContainerMessageArea').html('loading breadcrumbs');
        $('#breadcrumbContainer').html("<img style='height:27px' src='https://common.ogglefiles.com/img/loader.gif'/>");
        $.ajax({
            url: "php/customFetchAll.php?query=Select * from VwDirTree",
            success: function (data) {
                if (data.indexOf("Fatal error") > 0) {
                    $('#breadcrumbContainer').html(data);
                }
                else {
                    let dirTreeArray = JSON.parse(data);
                    let breadcrumbItem = dirTreeArray.filter(function (item) { return item.Id === folderId; });
                    if (breadcrumbItem.length == 0) {
                        $('#breadcrumbContainer').html("no good");
                        return;
                    }
                    $('#breadcrumbContainer').html(addBreadcrumb(folderId, breadcrumbItem[0].FolderName, "inactiveBreadCrumb"));
                    let parent = breadcrumbItem[0].Parent;

                    while (parent > 0) {
                        breadcrumbItem = dirTreeArray.filter(function (item) { return item.Id == parent; });
                        if (isNullorUndefined(breadcrumbItem)) {
                            parent = 99;
                            $('#breadcrumbContainer').prepend("item: " + parent + " isNullorUndefined");
                        }
                        else {
                            if (breadcrumbItem.length == 0) {
                                $('#breadcrumbContainer').prepend("no good " + parent + " length == 0");
                                parent = 99;
                            }
                            else {
                                $('#breadcrumbContainer').prepend(addBreadcrumb(parent, breadcrumbItem[0].FolderName, "activeBreadCrumb"));
                                parent = breadcrumbItem[0].Parent;
                            }
                        }
                    }
                }
            },
            error: function (jqXHR) {
                $('#albumPageLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                $('#breadcrumbContainer').html(errMsg);
            }
        });
    } catch (e) {
        logCatch("setBreadcrumbs", e);
    }
}

function addBreadcrumb(folderId, folderName, className) {
    return "<div class='" + className +
        "' onclick='window.location.href=\"https://ogglefiles.com/beta/album.html?folder=" + folderId +
        "\"'>" + folderName + "</div>";
}

function folderClick(folderId, isStepChild) {
    try {
        if (isStepChild == 1)
            window.open("https://ogglefiles.com/beta/album.html?folder=" + folderId, "_blank");  // open in new tab
        else {
            // report event pare hit
            window.location.href = "https://ogglefiles.com/beta/album.html?folder=" + folderId;  //  open page in same window
        }
        //" onclick='rtpe(\"SUB\",\"called from: " + folderId + "\",\"" + folder.DirectoryName + "\"," + folder.FolderId + ")'>\n" +
    } catch (e) {
        logCatch("folderClick", e);
    }
}

