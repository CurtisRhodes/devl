let currentFolderId, currentImagelinkId;
function loadAlbumPage(folderId, largeLoad) {

    islargeLoad = largeLoad;
    currentFolderId = folderId;
    if (islargeLoad)
        getMultipleAlbumImages(folderId)
    else {

        $('#albumPageLoadingGif').css("height", "17px");
        getAlbumImages(folderId);
    }
    $('#albumContentArea').fadeIn();
}

/*-- php -----------------------------------*/
function getAlbumImages(folderId) {
    try {
        $('#albumPageLoadingGif').show();
        $.getJSON('php/customQuery.php?query=select * from VwLinks where FolderId=' + folderId+' order by SortOrder', function (data) {
            $('#albumPageLoadingGif').hide();
            $.each(data, function (idx, vLink) {
                let imgSrc = 'https://common.ogglefiles.com/img/redballon.png';
                if (!isNullorUndefined(vLink.FileName))
                    imgSrc = settingsImgRepo + "/" + vLink.FileName.replace(/'/g, '%27');

                $('#imageContainer').append("<div class='intividualImageContainer'>" +
                    "<img id='" + vLink.LinkId + "' class='thumbImage' src='" + imgSrc + "'" +
                    "onerror='imageError(" + folderId + ",\"" + vLink.LinkId + "\")'\n" +
                    "oncontextmenu='albumContextMenu(\"Image\",\"" + vLink.LinkId + "\"," + folderId + ",\"" + imgSrc + "\")'" +
                    "onclick='viewImage(\"" + imgSrc + "\",\"" + vLink.LinkId + "\")'/></div>");
            });
            getSubFolders(folderId);
        });
    } catch (e) {
        logCatch("getAlbumImages", e);
    }
}

function getSubFolders(folderId) {
    try {
        $('#albumPageLoadingGif').show();
        $.getJSON("php/customQuery.php?query=select * from VwDirTree where Parent=" + folderId +
            " order by SortOrder,FolderName", function (data) {
                $('#albumPageLoadingGif').hide();
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
                getAlbumPageInfo(folderId);
                resizeAlbumPage();
            });
    } catch (e) {
        $('#albumPageLoadingGif').hide();
        logCatch("getSubFolders", e);
    }
}

function getAlbumPageInfo(folderId) {
    try {
        let infoStart = Date.now();
        $('#albumTopRow').show();
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
                    case "singleChild": $('#albumBottomfileCount').html(catfolder.Files); break;
                    case "multiFolder":
                    case "singleParent":
                        $('#largeLoadButton').show();
                        $('#deepSlideshowButton').show();
                        if (catfolder.Files > 0) 
                            $('#albumBottomfileCount').html(catfolder.Files + "/" + catfolder.SubFolders);                        
                        else
                            $('#albumBottomfileCount').html(catfolder.TotalSubFolders + "/" + Number(catfolder.TotalChildFiles).toLocaleString());
                        break;
                }
                if (!islargeLoad)
                    $('#albumTopRow').show();

                $('#albumBottomfileCount').show();
                $('#albumBottomfileCount').on("click", function () { updateFolderCount(folderId, catfolder.FolderPath) });

                setBreadcrumbs(folderId);
                $('#feedbackButton').on("click", function () {
                    showFeedbackDialog(folderId, catfolder.FolderName);
                });
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                alert("getAlbumPageInfo: " + errMsg);
                //if (!checkFor404(errMsg, folderId, "chargeCredits")) logError("XHR", folderId, errMsg, "chargeCredits");
            }
        });
        let delta = (Date.now() - infoStart) / 1000;
        console.log("getGalleyInfo took: " + delta.toFixed(3));
    } catch (e) {
        logCatch("getAlbumPageInfo", e);
    }
}

function getMultipleAlbumImages(parentId) { }

function addBreadcrumb(folderId, folderName, className) {
    return "<div class='" + className + "' onclick='window.location.href=\"https://ogglefiles.com/beta/album.html?folder=" + folderId + "\"'>" + folderName + "</div>";
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
    const viewerOffsetTop = -44, explodeSpeed = 22, heightIncrement = 22;
    let visAreaH, viewerH, laps = 0;

    function viewImage(imgSrc, linkId) {
        currentImagelinkId = linkId;
        visAreaH = $(window).height() - $('header').height();
        viewerH = 50;
        let parentPos = $('#visableArea').offset();
        let startLeft = $('#visableArea').width() * .34;

        $("#singleImageOuterContainer").css({ height: viewerH, top: parentPos.top + viewerOffsetTop, left: parentPos.left + startLeft });
        $("#viewerImage").css("height", viewerH);
        $("#vailShell").show().on("click", function () { closeImageViewer() });
        $('#viewerImage').attr("src", imgSrc);
        $('#singleImageOuterContainer').show();
        incrementExplode();

        $('body').keydown(function (event) {
            if (event.keyCode === 27)
                closeImageViewer();
        });
    }

    function incrementExplode() {
        if (viewerH + viewerOffsetTop < visAreaH) {
            setTimeout(function () {
                viewerH += heightIncrement;
                laps++;
                $("#viewerImage").css("height", viewerH);

                let imgleft = $("#singleImageOuterContainer").css("left");

                $("#singleImageOuterContainer").css("left", imgleft - (heightIncrement / 2));
                incrementExplode();
            }, explodeSpeed);
        }
        else {
            $("#viewerImage").css("height", visAreaH - viewerOffsetTop);
            $("#divSlideshowButton").show();
            $("#viewerCloseButton").show();
            let visWidth = $('#visableArea').width();
            let imgWidth = $('#viewerImage').width();
            $("#singleImageOuterContainer").css("left", (visWidth / 2) - (imgWidth / 2));
        }
    }

    function incrementImplodeViewer(divObject) {
        let viewerH = divObject.height();
        if (viewerH > 0) {
            setTimeout(function () {
                divObject.css("height", viewerH - heightIncrement);
                incrementImplodeViewer(divObject);
            }, explodeSpeed);
        }
        else {
            $('#singleImageOuterContainer').hide();
            $("#divSlideshowButton").hide();
            $("#viewerCloseButton").hide();
            $("#vailShell").hide();
            $('body').off();
        }
    }

    function closeImageViewer() {
        incrementImplodeViewer($("#viewerImage"));
    }

    function resizeViewer() {
        if ($('#singleImageOuterContainer').is(":visible")) {
            $("#viewerImage").css("height", visAreaH - viewerOffsetTop);
            $("#singleImageOuterContainer").css("height", visAreaH - viewerOffsetTop);
            let visWidth = $('#visableArea').width();
            let imgWidth = $('#viewerImage').width();
            $("#singleImageOuterContainer").css("left", (visWidth / 2) - (imgWidth / 2));
        }
    }

    /*-- slideshow needs variables passed to viewer  -------------------*/
    function showSlideshow() {
        try {
            $("#vailShell").hide();
            closeImageViewer();
            setTimeout(function () {
                $('#singleImageOuterContainer').hide();
                startSlideShow(currentFolderId, currentImagelinkId, islargeLoad)
            }, 1100);
        } catch (e) {
            logCatch("showSlideshow", e);
        }
    }
}

/*---------------------*/
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

