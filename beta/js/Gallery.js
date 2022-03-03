
function loadAlbumPage(folderId, largeLoad) {
    islargeLoad = largeLoad;
    currentFolderId = folderId;
    if (islargeLoad)
        getMultipleAlbumImages(folderId)
    else {
        getGalleryImages(folderId);
        getSubFolders(folderId);
        getGalleryPageInfo(folderId);
    }
}

/*-- php -----------------------------------*/
function getGalleryImages(folderId) {
    try {
        $('#galleryPageLoadingGif').show();
        $.getJSON('php/customQuery.php?query=select * from VwLinks where FolderId=' + folderId+' order by SortOrder', function (data) {
            $('#galleryPageLoadingGif').hide();
            $.each(data, function (idx, vLink) {
                let imgSrc = 'https://common.ogglefiles.com/img/redballonSmall.png';
                if (!isNullorUndefined(vLink.FileName))
                    imgSrc = settingsImgRepo + "/" + vLink.FileName.replace(/'/g, '%27');

                $('#imageContainer').append("<div class='albumImageContainer'>" +
                    "<img id='" + vLink.LinkId + "' class='thumbImage' src='" + imgSrc + "'" +
                    "onerror='imageError(" + folderId + ",\"" + vLink.LinkId + "\")'\n" +
                    "oncontextmenu='albumContextMenu(\"Image\",\"" + vLink.LinkId + "\"," + folderId + ",\"" + imgSrc + "\")'" +
                    "onclick='viewImage(\"" + imgSrc + "\",\"" + vLink.LinkId + "\")'/></div>");
            });
            resizeGalleryPage();
        });
    } catch (e) {
        logCatch("getGalleryImages", e);
    }
}

function getSubFolders(folderId) {
    try {
        $('#galleryPageLoadingGif').show();
        $.getJSON("php/customQuery.php?query=select * from VwDirTree where Parent=" + folderId +
            " order by SortOrder,FolderName", function (data) {
                $('#galleryPageLoadingGif').hide();
            $.each(data, function (index, obj) {
                let linkId = create_UUID();
                let folderCounts = "(" + obj.FileCount.toLocaleString() + ")";
                if (obj.SubFolderCount > 0)
                    folderCounts = "(" + obj.SubFolderCount + "/" + (obj.FileCount + obj.TotalChildFiles).toLocaleString() + ")";

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
                resizeGalleryPage();
            });
    } catch (e) {
        $('#galleryPageLoadingGif').hide();
        logCatch("getSubFolders", e);
    }
}

function getGalleryPageInfo(folderId) {
    try {
        let infoStart = Date.now();
        $('#galleryTopRow').show();
        $('#aboveImageContainerMessageArea').html('loading');
        $.ajax({
            url: 'php/customQuery.php?query=Select * from CategoryFolder where Id=' + folderId,
            success: function (data) {
                let jdata = JSON.parse(data);
                let catfolder = jdata[0];
                $('#aboveImageContainerMessageArea').html('');
                $('#seoPageName').html(catfolder.FolderName);

                // resetOggleHeader(folderId, catfolder.RootFolder);

                if (catfolder.RootFolder == "porn")
                    document.title = catfolder.FolderName + " : OgglePorn";
                else
                    document.title = catfolder.FolderName + " : OggleBooble";

                switch (catfolder.FolderType) {
                    case "singleModel":
                    case "multiModel":
                    case "singleChild": $('#galleryBottomfileCount').html(catfolder.Files); break;
                    case "multiFolder":
                    case "singleParent":
                        if (catfolder.Files > 0) {
                            $('#galleryBottomfileCount').html(catfolder.Files + "/" + catfolder.SubFolders);
                        }
                        else {
                            $('#galleryBottomfileCount').html(catfolder.TotalSubFolders + "/" + catfolder.TotalChildFiles);
                        }
                        break;
                }
                $('#galleryBottomfileCount').show();
                $('#galleryBottomfileCount').on("click", function () { updateFolderCount(folderId, catfolder.FolderPath) });

                setBreadcrumbs(folderId);
                $('#feedbackButton').on("click", function () {
                    showFeedbackDialog(folderId, catfolder.FolderName);
                });
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                alert("getGalleryPageInfo: " + errMsg);
                //if (!checkFor404(errMsg, folderId, "chargeCredits")) logError("XHR", folderId, errMsg, "chargeCredits");
            }
        });
        let delta = (Date.now() - infoStart) / 1000;
        console.log("getGalleyInfo took: " + delta.toFixed(3));
    } catch (e) {
        logCatch("getGalleryPageInfo", e);
    }
}

function getMultipleAlbumImages(parentId) { }

function addBreadcrumb(folderId, folderName, className) {
    return "<div class='" + className + "' onclick='window.location.href=\"https://ogglefiles.com/beta/Gallery.html?album=" + folderId + "\"'>" + folderName + "</div>";
}

function setBreadcrumbs(folderId) {
    try {
        $.ajax({
            url: "php/customQuery.php?query=Select * from VwDirTree",
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

/*-- exploding image view -------------------*/
{
    let explodeSpeed = 22,
        heightIncrease = 22,
        visAreaH, viewerH,
        laps = 0,
        currentImagelinkId;

    function viewImage(imgSrc, linkId) {
        currentImagelinkId = linkId;
        $('#viewerImage').attr("src", imgSrc);
        $('#singleImageOuterContainer').show();
        viewerH = 50;
        visAreaH = $('#visableArea').height() - 22;
        let parentPos = $('#visableArea').offset();
        $("#singleImageOuterContainer").css({ top: parentPos.top, left: parentPos.left + 200 });
        $("#viewerImage").css("height", 50);
        //$("#viewerImage").css("width", "auto");

        // $("#hdrBtmRowSec3").html("visAreaH" + visAreaH + "  viewerH: " + viewerH);
        incrementExplode();
        $("#vailShell").show();

        $('body').keydown(function (event) {
            if (event.keyCode === 27) {
                closeImageViewer();
            }
        });

    }

    function incrementExplode() {
        // $("#hdrBtmRowSec3").html("visableArea height: " + visAreaH + "  viewerImage height: " + viewerH + " lap: " + laps);
        if (viewerH + 5 < visAreaH) {
            setTimeout(function () {
                viewerH += heightIncrease;
                laps++;
                $("#viewerImage").css("height", viewerH);
                incrementExplode();
            }, explodeSpeed);
        }
        else {
            $("#singleImageOuterContainer").css("height", visAreaH);
            $("#divShowSlideshow").show();
            $("#viewerCloseButton").show();
        }
    }

    /*-- show slideshow -------------------*/
    function showSlideshow() {
        try {
            if (islargeLoad)
                window.location.href = "/Slideshow.html?parentfolderId=" + currentFolderId + "&=startLink" + currentImagelinkId;
            else
                window.location.href = "/Slideshow.html?folderId=" + currentFolderId + "&startLink=" + currentImagelinkId;
        } catch (e) {
            logCatch("showSlideshow", e);
        }
    }
}

function closeImageViewer() {
    $('#singleImageOuterContainer').hide();
    $("#divShowSlideshow").hide();
    $("#viewerCloseButton").hide();
    $("#vailShell").hide();
    $('body').off();
}

/*---------------------*/
function folderClick(folderId, isStepChild) {
    try {
        if (isStepChild == 1)
            window.open("/https://ogglefiles.com/beta/Gallery.html?album=" + folderId, "_blank");  // open in new tab
        else {
            // report event pare hit
            window.location.href = "/https://ogglefiles.com/beta/Gallery.html?album=" + folderId;  //  open page in same window
        }
        //" onclick='rtpe(\"SUB\",\"called from: " + folderId + "\",\"" + folder.DirectoryName + "\"," + folder.FolderId + ")'>\n" +
    } catch (e) {
        logCatch("folderClick", e);
    }
}

