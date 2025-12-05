
function setFolderImage(filinkId, folderId, level) {
    let fldImgObj = {};
    let fldImgData=new FormData;
    fldImgData.append("folderId", folderId);
    fldImgData.append("link", filinkId);
    fldImgData.append("level", level);
    loadingGif("show");
postDataToServer("php/updateFolderImage.php", fldImgData, fldImgObj);
    let fldImIntrvl = setInterval(() => {
        if (ready(fldImgObj.data)) {
            clearInterval(fldImIntrvl);
            loadingGif("hide");
            if (fldImgObj.data.trim().startsWith("ok")) {
                displayStatusMessage("ok", level + " image set for " + folderId);
            }
            else {
                displayStatusMessage("error", fldImgObj.data.trim());
                logOggleError("AJX", fldImgObj.data, "setFolderImage");
            }
        }
    }, 45);
}

function moveCopyImage(folderId, linkId, cMode) {
    switch (cMode) {
        case "copy":            
            let destFolder = ele('txtDestFolder').value;
            let cpyObj = {};
            cpyData = new FormData();
            cpyData.append("Source", folderId);
            cpyData.append("ImageId", linkId);
            cpyData.append("Destination", destFolder);
            postDataToServer("php/addLink.php", cpyData, cpyObj);
            let cpyIntrvl = setInterval(() => {
                if (ready(cpyObj.data)) {
                    clearInterval(cpyIntrvl);
                    //contextMenuContainer.fadeOut();
                    if (cpyObj.data.trim() == "ok") {
                        displayStatusMessage("ok", "image copied to " + destFolder);
                        logOggleEvent("CPL", destFolder + "," + linkId);
                        location.reload();
                    }
                    else {
                        displayStatusMessage("error", cpyObj.data);
                        logOggleError("AJX", cpyObj.data, "copy image");
                    }
                }
            }, 47);
            break;
        case "move":
            moveImage(folderId, linkId, "move");
            break;
        case "archive":
            moveImage(folderId, linkId, "archive");
            break;
        case "link":
            url = "php/physciallyMoveImage.php?imageId=" + linkId + "&destFolder=";
            break;
        default:
    }
}

function moveImage(curFolderId, linkId, mode) {
    let destFolderId = $('#txtDestFolder').val();
    let mover = new Object;
    postDataToServer("php/moveImage.php", {
        curFolderId: curFolderId,
        destFolderId: destFolderId,
        linkId: linkId,
        mode: mode
    }, mover);
    let intvM = setInterval(() => {
        if (isNullorUndefined(mover.data))
            loadingGif("show");
        else {
            clearInterval(intvM); loadingGif("none");
            if (success.trim() == "ok") {
                if (mode == "move") {
                    displayStatusMessage("ok", "image moved to " + destFolderId);
                    logOggleEvent("CPL", destFolder + "," + linkId);
                }
                else {
                    displayStatusMessage("ok", "image archived to " + destFolderId);
                    logOggleEvent("CPL", destFolder + "," + linkId);                }
                location.reload();
            }
            else {
                displayStatusMessage("error", success.trim());
                logOggleError("AJX", success.trim(), "move image");
            }
        }
    }, 200);
}

