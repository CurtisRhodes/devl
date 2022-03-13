let currentFolderId, currentImagelinkId;

function loadAlbumPage(folderId, islargeLoad) {
    currentFolderId = folderId;
    $('#albumPageLoadingGif').css("height", "27px");
    $('#imageContainer').html("");
    getAlbumImages(folderId, islargeLoad);
    getAlbumPageInfo(folderId, islargeLoad);
    $('#albumContentArea').fadeIn();
}

/*-- php -----------------------------------*/
function getAlbumImages(folderId, islargeLoad) {
    try {
        $('#albumPageLoadingGif').show();
        if (islargeLoad) {
            $.ajax({
                url: "php/customFetchAll.php?query=Select * from CategoryFolder where Parent=" + folderId,
                success: function (data) {
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
        "<img id='" + vLink.LinkId + "' class='thumbImage' src='" + imgSrc + "'" +
        "onerror='imageError(" + folderId + ",\"" + vLink.LinkId + "\")'\n" +
        "oncontextmenu='albumContextMenu(\"Image\",\"" + vLink.LinkId + "\"," + folderId + ",\"" + imgSrc + "\")'" +
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
        $('#aboveImageContainerMessageArea').html('loading breadcrumbs');
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
                $('#aboveImageContainerMessageArea').html('');
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

/*-- exploding image view -------------------*/
{
    const viewerOffsetTop = 44, explodeSpeed = 22, heightIncrement = 22;
    let viewerH, viewerMaxH;

    function viewImage(imgSrc, linkId) {
        currentImagelinkId = linkId;
        viewerH = 50;
        let parentPos = $('#visableArea').offset();
        let startLeft = $('#visableArea').width() * .34;

        $("#singleImageOuterContainer").css({
            height: viewerH,
            top: parentPos.top - viewerOffsetTop,
            left: parentPos.left + startLeft
        });
        $("#viewerImage").css("height", viewerH);
        $("#vailShell").show().on("click", function () { closeImageViewer() });
        $('#viewerImage').attr("src", imgSrc);
        $('#singleImageOuterContainer').show();
        viewerMaxH = $('#visableArea').height() + viewerOffsetTop - 55;
        incrementExplode();

        $('#viewerImage').on('click', showMaxSizeViewer(imgSrc, 'album'));

        $('body').keydown(function (event) {
            if (event.keyCode === 27)
                closeImageViewer();
        });
    }

    function incrementExplode() {
        if (viewerH < viewerMaxH) {
            setTimeout(function () {
                viewerH += heightIncrement;
                $("#viewerImage").css("height", viewerH);

                let imgleft = $("#singleImageOuterContainer").css("left");

                $("#singleImageOuterContainer").css("left", imgleft - (heightIncrement / 2));
                incrementExplode();
            }, explodeSpeed);
        }
        else {
            $("#viewerImage").css("height", viewerMaxH);
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
            $("#singleImageOuterContainer").css("height", viewerMaxH);
            let visWidth = $('#visableArea').width();
            let imgWidth = $('#viewerImage').width();
            $("#singleImageOuterContainer").css("left", (visWidth / 2) - (imgWidth / 2));
        }
    }

    function showSlideshow() {
        try {
            $("#vailShell").hide();
            $('#singleImageOuterContainer').hide();
            $("#divSlideshowButton").hide();
            $("#viewerCloseButton").hide();
            $("#vailShell").hide();
            $('body').off();
            
            showSlideshowViewer(currentFolderId, currentImagelinkId, false)
        } catch (e) {
            logCatch("show slideshow", e);
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

