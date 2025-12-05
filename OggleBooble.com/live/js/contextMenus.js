let offsetX = 0, offsetY = 0, mouseX = 0, mouseY = 0;

let plinkId, imageSrc;
let menuEntered = false;

function showContextMenu(menuType, folderId, linkId, folderName) {
    const contextMenuContainer = ele("contextMenuContainer");
    plinkId = linkId;
    menuEntered = false;

    switch (menuType) {
        case "image":
            showImageContextMenu(linkId);
            break;
        case "folder":
            showFolderContextMenu(folderId);
            break;
        case "carousel":
            showCarouselContextMenu(folderId, linkId, folderName);
            break;
        case "viewer":
            getFolderContextMenuInfo(folderId);
            break;
        case "video":
            getFolderContextMenuInfo(folderId);
            break;
        default:
            alert("unknown menu type");
    }
    contextMenuContainer.style.opacity = 1;

    //ele("visibleArea").addEventListener("mousemove", (e) => {
    //    checkContextMenuBounds();
    //});

    contextMenuContainer.style.top = mousePos.y + "px";
    contextMenuContainer.style.left = mousePos.x + "px";
    showElement(contextMenuContainer);

    contextMenuContainer.addEventListener("mouseenter", (e) => {
        menuEntered = true;
    });

    ele("contextMenuHeader").addEventListener('mousedown', (e) => {
        e.preventDefault();
        currentDragElement = contextMenuContainer;
        mouseX = e.clientX;
        mouseY = e.clientY;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}

function checkContextMenuBounds(event) {
    // window.getComputedStyle(ele("contextMenuContainer"));
    if (menuEntered) {
        try {
            let rect = ele("contextMenuContainer").getBoundingClientRect();
            if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
                //alert('Cursor is outside the rectangle');
                contextMenuOpen = false;
                hideElement(ele("contextMenuContainer"));
                // fade(ele("contextMenuContainer"), "out");
                ele("visibleArea").removeEventListener("mousemove", mouseMoveHandler);
                if (typeof resume === 'function') resume();
                isPaused = false;
                carouselPaused = false;
            }
        } catch (e) {
            logOggleError("CAT", e, "check ContextMenu Bounds");
        }
    }
    //    else {
    //        // we are in the menu bounds
    //        if (!menuEntered)
    //            menuEntered = true;
    //    }
}

function toggle(submenu) {
    const toggleEle = ele(submenu);
    if (window.getComputedStyle(toggleEle).display === "none")
        showElement(toggleEle)
    else
        hideElement(toggleEle);
}

/* -------- image -----------------------------*/{
    function showImageContextMenu(linkId) {
        let imageContextMenuHtml = `
        <div class='ctxMenuItem' onclick='imageCtxMenuAction("explode")'>explode</div>
        <div class='ctxMenuItem' id="txtComment" onclick='imageCtxMenuAction("comment")'>comment</div>
        <div class='ctxMenuItem' onclick='imageCtxMenuAction("saveAs")'>save as</div>
        <div class='ctxMenuItem' onclick='imageCtxMenuAction("rank")'>rank this image</div>
        <div class='ctxMenuItem' onclick='toggle("imageInfoContainer")'>Show Image Info</div>
        <div id='imageInfoContainer' class='contextMenuInnerContainer'>
            <div><label>file name</label>  <span id='imageInfoFileName' class='ctxInfoValue'></span></div>
            <div><label>folder path</label><span id='imageInfoFolderPath' class='ctxInfoValue'></span></div>
            <div><label>link id</label><input id='imageInfoLinkId'></input></div>
            <div>
                <label>height</label><span id='imageInfoHeight' class='ctxInfoValue'></span>" +
                <label>width</label> <span id='imageInfoWidth'  class='ctxInfoValue'></span>" +
                <label>size</label>  <span id='imageInfoSize'   class='ctxInfoValue'></span>
            </div>
            <div><label>last modified</label><span id='imageInfoLastModified' class='ctxInfoValue'></span></div>
            <div><label>external link</label><span id='imageInfoExternalLink' class='ctxInfoValue'></span></div>
        </div>`;

        if (sessionStorage.VisitorId == adminVisitorId) {
            imageContextMenuHtml += `
            <div class='ctxMenuItem' onclick='toggle("adminLinksContainer")'>Admin</div>
            <div id='adminLinksContainer' class='contextMenuInnerContainer'>
                <div class='ctxMenuItem' onclick='imageCtxMenuAction(\"copy\")'>Move/Copy Image</div>
                <div class='ctxMenuItem' onclick='imageCtxMenuAction(\"reject\")'>Move to Rejects</div>
                <div class='ctxMenuItem' onclick='imageCtxMenuAction(\"setF\")'>Set as Folder Image</div>
                <div class='ctxMenuItem' onclick='imageCtxMenuAction(\"setC\")'>Set as Category Image</div>
                <div class='ctxMenuItem' onclick='imageCtxMenuAction(\"setG\")'>Set as GP folder Image</div>
            </div>`;
        }

        replaceHtml(ele("contextMenuContent"), imageContextMenuHtml);
        
        getImageContextMenuInfo(linkId);
    }

    function getImageContextMenuInfo(linkId) {
        let imageInfoObj = {};
        sql = "select f.FolderName, p.FolderName as ParentFolderName, f.FolderPath, f.FolderType, i.* from ImageFile i join CategoryFolder f on i.FolderId = f.Id " +
            " join CategoryFolder p on f.Parent = p.Id where i.Id='" + linkId + "'";
        getDataFromServer("php/fetch.php?schema=oggleboo_Danni&query=" + sql, imageInfoObj);
        let imageInfoIntrv = setInterval(() => {
            if (ready(imageInfoObj.data)) {
                clearInterval(imageInfoIntrv);
                if (imageInfoObj.data == false) {
                    replaceHtml(ele("imageInfoFileName"), "empty data");
                    logOggleError("AJX", "empty data", "get singleImage details");
                }
                else {
                    let imgData = JSON.parse(imageInfoObj.data);
                    imageSrc = settingsImgRepo + imgData.FolderPath + "/" + imgData.FileName;
                    replaceHtml(ele("contextMenuHeader"), imgData.FolderName);
                    // let folderName = imgData.ParentFolderName + " / " + imgData.FolderName;
                    replaceHtml(ele("imageInfoFileName"), imgData.FileName);
                    replaceHtml(ele("imageInfoFolderPath"), imgData.FolderPath);
                    ele("imageInfoLinkId").value = linkId;
                    replaceHtml(ele("imageInfoHeight"), imgData.Height);
                    replaceHtml(ele("imageInfoWidth"), imgData.Width);
                    replaceHtml(ele("imageInfoSize"), (imgData.Size).toLocaleString());
                    replaceHtml(ele("imageInfoLastModified"), imgData.Acquired);
                    replaceHtml(ele("imageInfoExternalLink"), imgData.ExternalLink);
                }
            }
        }, 20);
    }

    function imageCtxMenuAction(action) {
        switch (action) {
            case "explode":

                window.open(imageSrc);

                break;
            case "comment": showImageCommentDialog(plinkId, imageSrc, currentFolderId, "image"); break;
            case "saveAs":
                //document.execCommand("SaveAs", null, "file.csv");
                break;
            case "download":
                // it's another Sunday and I still have os much left to do
                if (localStorage["IsLoggedIn"] == "true")
                    alert("still working on this feature. Send site developer an email to request folder");
                else
                    alert("You must be logged in to download an album");
                break;
            case "imageDialog": showFileDetailsDialog(currentFolderId); break;
            case "folderDialog": showFolderInfoDialog(currentFolderId); break;
            case "closeSlideshow": closeViewer("context menu"); break;
            case "openInNewTab": rtpe("ONT", "context menu", pFolderName, folderId);
            case "see more": break;
            case "Image tags":
            case "folder tags": openMetaTagDialog(currentFolderId, plinkId); break;
            case "archive":
            case "move":
            case "copy": showMoveCopyDialog(currentFolderId, plinkId, imageSrc); break;
            // case "remove": performMoveImageToRejects(plinkId, currentFolderId); break;
            case "delete": deleteLink(plinkId, currentFolderId); break;
            case "reject": showRejectsDialog(plinkId, currentFolderId, imageSrc); break;
            case "setF": setFolderImage(plinkId, currentFolderId, "folder"); break;
            case "setC": setFolderImage(plinkId, currentFolderId, "parent"); break;
            case "setG": setFolderImage(plinkId, currentFolderId, "grandparent"); break;
            default: {
                logOggleError("SWT", "action: " + action, "oggle ctxMenu action");
            }
            /*
            <div class='ctxMenuItem' onclick='oggleCtxMenuAction("rank")'>rank this image</div>
            <div id='imageInfoContainer' class='contextMenuInnerContainer'>
                <div><label>file name</label>  <span id='imageInfoFileName' class='ctxInfoValue'></span></div>
                <div><label>folder path</label><span id='imageInfoFolderPath' class='ctxInfoValue'></span></div>
                <div><label>link id</label><input id='imageInfoLinkId'></input></div>
                <div>
                    <label>height</label><span id='imageInfoHeight' class='ctxInfoValue'></span>" +
                    <label>width</label> <span id='imageInfoWidth'  class='ctxInfoValue'></span>" +
                    <label>size</label>  <span id='imageInfoSize'   class='ctxInfoValue'></span>
                </div>
                <div><label>last modified</label><span id='imageInfoLastModified' class='ctxInfoValue'></span></div>
                <div><label>external link</label><span id='imageInfoExternalLink' class='ctxInfoValue'></span></div>
            </div>
            <div class='ctxMenuItem' onclick='toggle("adminLinksContainer")'>Admin</div>
            <div id='adminLinksContainer' class='contextMenuInnerContainer'>
                <div class='ctxMenuItem' onclick='oggleCtxMenuAction(\"reject\")'>Move to Rejects</div>
            */
        }
    }
}

/* -------- folder -----------------------------*/{
    function showFolderContextMenu() {

        replaceHtml(ele("contextMenuContent"), `
        <div id="ctxMenuTitle" class="ctxMenuTitle">loading</div>
        <div class='ctxMenuItem' onclick='imageCtxMenuAction("comment")'>comment</div>
        <div class='ctxMenuItem' onclick='imageCtxMenuAction("saveAs")'>remove from carousel</div>
        <div class='ctxMenuItem' onclick='imageCtxMenuAction("rank")'>view statistics</div>`);
    }

    function getFolderContextMenuInfo(folderId) {
        let fldr = new Object;
        sql = "select f.FolderName, p.FolderName as ParentFolderName, f.FolderPath, f.FolderType from CategoryFolder f " +
            " join CategoryFolder p on f.Parent = p.Id where f.Id='" + folderId + "'";

        getDataFromServer("php/fetch.php?schema=oggleboo_Danni&query=" + sql, fldr);
        let fldrintv = setInterval(() => {
            if (ready(fldr.data)) {
                clearInterval(fldrintv); loadingGif("hide");
                if (fldr.data == "false") {
                    $('#ctxFolderName').html("empty data");
                    logOggleError("AJX", "empty data", "get singleImage details");
                }
                else {
                    folderData = JSON.parse(fldr.data);
                    //$('#ctxFolderName').html(folderData.FolderName);
                    // folderInfo
                    //folderInfoPath').html(folderData.FolderPath);
                    //folderInfoRoot').html(folderData.RootFolder);
                    //folderInfoType').html(folderData.FolderType);
                    //folderInfoFileCount').html(folderData.Files).toLocaleString();
                    //folderInfoSubDirs').html(folderData.SubFolders).toLocaleString();
                    //folderInfoTotalSubDirs').html(folderData.TotalSubFolders).toLocaleString();
                    //folderInfoTotalChildFiles').html(folderData.TotalChildFiles).toLocaleString();
                }
            }            
        }, 200);
    }
}

/* -------- carousel -----------------------------*/{
    function showCarouselContextMenu(folderId, linkId, folderName) {
        carouselPaused = true;
        replaceHtml(ele("contextMenuHeader"), folderName);
        replaceHtml(ele("contextMenuContent"), `
        <div class='ctxMenuItem' onclick='window.location.href="album.html?folder=` + folderId + `"'>open folder</div>
        <div class='ctxMenuItem' id="txtComment" onclick='carouselCtxtMenuAction("comment")'>comment</div>
        <div class='ctxMenuItem' id="txtComment" onclick="removeFromCarousel('`+ linkId + `')">remove from carousel</div>
        <div class='ctxMenuItem' onclick='carouselCtxtMenuAction("saveAs")'>pause</div>
        <div class='ctxMenuItem' onclick='carouselCtxtMenuAction("rank")'>adjust speed</div>`);
        getCarouselContextMenuInfo(linkId);
    }

    function CarouselContextMenu(action) {
        switch (action) {
            case "saveAs":
                break;
            case "comment":
                break;
            case "rank":
                break;
            default:
        }
    }

    function getCarouselContextMenuInfo(linkId) {
        let carouselInfoObj = {};
        sql = "select * from Carousel where LinkId='" + linkId + "'";
        getDataFromServer("php/fetch.php?schema=oggleboo_Danni&query=" + sql, carouselInfoObj);
        let carouselInfoIntrv = setInterval(() => {
            if (ready(carouselInfoObj.data)) {
                clearInterval(carouselInfoIntrv);
                if (carouselInfoObj.data == "false") {
                    replaceHtml(ele("contextMenuHeader"), "empty data");
                    return;
                }
                if (carouselInfoObj.data.indexOf("error") > -1) {
                    replaceHtml(ele("contextMenuHeader"), carouselInfoObj.data);
                }
                else {
                    let carouselData = JSON.parse(carouselInfoObj.data);
                    replaceHtml(ele("contextMenuHeader"), carouselData.FolderName);
                    //    replaceHtml(ele("carouselInfoFileName"), carouselData.FileName);
                    //    replaceHtml(ele("carouselInfoFolderPath"), carouselData.FolderPath);
                    //    ele("carouselInfoLinkId").value = carouselData.LinkId;
                    //    replaceHtml(ele("carouselInfoHeight"), carouselData.Height);
                    //    replaceHtml(ele("carouselInfoWidth"), carouselData.Width);
                    //    replaceHtml(ele("carouselInfoSize"), (carouselData.Size).toLocaleString());
                    //    replaceHtml(ele("carouselInfoLastModified"), carouselData.Acquired);
                }
            }
        }, 20);
    }

    function removeFromCarousel(linkId) {
        try {
            let delCarouselObj = {};
            // array.splice(index, 1);
            getDataFromServer("php/deleteFromCarousel.php?linkId=" + linkId, delCarouselObj);
            let delCarouselIntv = setInterval(() => {
                if (ready(delCarouselObj.data)) {
                    clearInterval(delCarouselIntv);
                    if (delCarouselObj.data.trim() != "ok") {
                        if (sessionStorage.VisitorId == adminVisitorId)
                            alert("unable to remove from carousel " + delCarouselObj.data);
                        else
                            logOggleError("CAT", "503 error", "remove from carousel");
                    }
                    else {
                        //replaceHtml(ele("contextMenuHeader"), "removed from carousel");
                        carouselPaused = false;
                        hideElement(ele("contextMenuContainer"));
                        // fade(ele("contextMenuContainer"), "out");
                        // ele("visibleArea").removeEventListener("mousemove", mouseMoveHandler);
                        // if (typeof resume === 'function') resume();
                        isPaused = false;
                    }
                }
            }, 33);
        }
        catch (e) {
            logOggleError("CAT", e, "remove from carousel");
        }
    }
}

/* -------- viewer -----------------------------*/{
    function showImageViewerContextMenu() {
        replaceHtml(ele("contextMenuContent"), `
        <div class='ctxMenuItem' id="txtComment" onclick='imageCtxMenuAction("comment")'>comment</div>
        <div class='ctxMenuItem' id="txtComment" onclick='imageCtxMenuAction("remove")'>remove from carousel</div>
        <div class='ctxMenuItem' onclick='imageCtxMenuAction("saveAs")'>download</div>
        <div class='ctxMenuItem' onclick='imageCtxMenuAction("rank")'>view statistics</div>`);
    }
}

/* -------- video -----------------------------*/{
        function showVideoContextMenu() {
            replaceHtml(ele("contextMenuContent"), `
            <div class='ctxMenuItem' id="txtComment" onclick='imageCtxMenuAction("comment")'>comment</div>
            <div class='ctxMenuItem' id="txtComment" onclick='imageCtxMenuAction("remove")'>remove from carousel</div>
            <div class='ctxMenuItem' onclick='imageCtxMenuAction("saveAs")'>download</div>
            <div class='ctxMenuItem' onclick='imageCtxMenuAction("rank")'>view statistics</div>`);
        }
    }

