function  showNonAsyncRepairDialog() {
    $('#dashboardFileList').html("");
    repairReport.FoldersProcessed = 0;
    repairReport.physcialFilesProcessed = 0;
    repairReport.imageFilesProcessed = 0;
    repairReport.physcialFilesRenamed = [];
    repairReport.imageFilesAdded = [];
    repairReport.imageRowsRemoved = [];
    repairReport.orphanImages = [];
    repairReport.orphanImageFiles = [];
    repairReport.missingPhyscialDirectories = [];
    repairReport.missingParents = [];
    repairReport.comparisonProblems = 0;
    repairReport.errors = [];
    addImageRows = 0;
    if (isNullorUndefined($('#txtCurrentActiveFolder').val())) {
        alert("select a folder");
        return;
    }
    $('#dashboardDialogBoxTitle').html("Repair Links");
    $('#dashboardFileList').html("");
    $('#dashboardDialogContents').html(`
            <div><span>folder to repair</span><input id='txtFolderToRepair' readonly='readonly'
                style='width:444px' class='roundedInput'></input></div>\n

            <div><span>include all subfolders </span><input id='ckRepairIncludeSubfolders'
                class='adminCheckbox' type='checkbox' checked='checked' ></input></div>\n

            <div><span>add new ImageFiles </span><input id='ckAddNewImages' 
                class='adminCheckbox' type='checkbox' checked='checked'></input></div>\n
            <div><span>remove orphan ImageFiles </span><input id='ckRemoveOrphans'
                class='adminCheckbox' type='checkbox' checked='checked'></input></div>\n
            <div class='roundendButton' onclick='performNonAsyncRepairLinks()'>Run</div>`);
    $('#dashboardDialogContents').keydown(function (event) {
        if (event.keyCode === 13) {
            performNonAsyncRepairLinks();
        }
    });
    $('#txtFolderToRepair').val($('#txtCurrentActiveFolder').val());
    $('#dashboardDialogBox').css("top", "212px");
    $('#dashboardDialogBox').css("left", "250px");
    $('#dashboardDialogBox').draggable().fadeIn();
    $('body').keydown(function (event) {
        if (event.keyCode === 27) {
            alert("escape key pressed");
            abandon = true;
        }
    });
}

function performNonAsyncRepairLinks() {
    repairStartTime = Date.now();
    abandon = false;
    asyncBlock1 = null;

    showRepairReport();
    recurr = $("#ckRepairIncludeSubfolders").is(":checked");
    addNew = $("#ckAddNewImages").is(":checked");
    removeOrphans = $("#ckRemoveOrphans").is(":checked");

    let rootFolderId = $('#txtActiveFolderId').val();
    dashboardDialogBoxClose("addNewImages");

    $.ajax({
        url: 'php/yagdrasselFetchAll.php?query=select Id from CategoryFolder where Parent=' + rootFolderId,
        success: function (data) {

            let subfolders = JSON.parse(data);
            let subfolderCount = subfolders.length;
            let foldersProcessed = 0;
            let subfolderLoop = setInterval(function () {

                repairFolder(subfolders[foldersProcessed]);

                if (foldersProcessed >= subfolderCount) {
                    clearInterval(subfolderLoop);
                }
            }, 500);
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            repairReport.errors.push("<div style='color:red'process RemoveOrphans (get sub folders) XHR error: " + errMsg + "</div>");
        }
    });
}

function repairFolder(objFolder) {
    let catFolder = JSON.parse(objFolder);
    let finished = false;
    let repairLoop = setInterval(function () {
        if (finished)
            clearInterval(repairLoop);
        else {
            // get image files
            $.ajax({
                url: 'php/yagdrasselFetchAll.php?query=select * from ImageFile where FolderId=' + catFolder.Id,
                async: "false",
                success: function (data) {
                    let imageFiles = JSON.parse(data);
                    // get physcial files
                    $.ajax({
                        url: "php/getOggleFolder.php?path=" + settingsRepoPath + catFolder.FolderPath + "&folderId=" + folderId,
                        success: function (data) {
                            let jallFiles = JSON.parse(data);
                            let physcialFiles = jallFiles.filter(node => node.type == "file");

                            nasycremoveOrphanImageRows(physcialFiles, imageFiles, catFolder.Id);

                            nasycrenameImageFiles(catFolder, imageFiles, physcialFiles);

                            nasycaddMissingImageFiles(catFolder, imageFiles, physcialFiles);

                        },
                        error: function (jqXHR) {
                            $('#dashBoardLoadingGif').hide();
                            let errMsg = getXHRErrorDetails(jqXHR);
                            repairReport.errors.push("<div style='color:red'process RemoveOrphans (get Image Files) AJX error: " + errMsg + "</div>");
                        }
                    });
                },
                error: function (jqXHR) {
                    $('#dashBoardLoadingGif').hide();
                    let errMsg = getXHRErrorDetails(jqXHR);
                    repairReport.errors.push("<div style='color:red'process (get Image file) RemoveOrphans XHR error: " + errMsg + "</div>");
                    //alert("get child folders XHR: " + errMsg);
                }
            });
        }
    }, 500);
}

function nasycremoveOrphanImageRows(physcialFiles, imageFiles, folderId) {
    let rowsToProcess = imageFiles.length;
    let rowsProcessed = 0;
    let orphanImageFiles = [];
    let removeOrphansLoop = setInterval(function () {
        if (rowsProcessed == rowsToProcess) {
            $.each(orphanImageFiles, function (idx, obj) {
                delete imageFiles[obj];
            });
            clearInterval(removeOrphansLoop);
        }
        else {
            $.each(imageFiles, function (idx, imageFile) {
                if (abandon) return;
                let physcialFileRow = physcialFiles.filter(physcialFile => encodeURI(physcialFile.name) == encodeURI(imageFile.FileName));
                if (physcialFileRow.length == 0) {
                    $.ajax({
                        async: "false",
                        url: "php/removeImageFile.php?imageFileId='" + imageFile.Id + "'",
                        success: function (removeImageFileSuccess) {
                            if (removeImageFileSuccess.trim().startsWith("ok")) {
                                repairReport.imageRowsRemoved.push("(" + folderId + ")  " + imageFile.FileName);
                                removeFromImageFiles.push(imageFile.Id);
                            }
                            else {
                                console.log(removeImageFileSuccess);
                                repairReport.errors.push("<div style='color:red'>remove image file error: " + removeImageFileSuccess + "</div>");
                            }
                            rowsProcessed++;
                            repairReport.imageFilesProcessed++;
                            showRepairReport();
                        },
                        error: function (jqXHR) {
                            let errMsg = getXHRErrorDetails(jqXHR)
                            repairReport.errors.push("<div style='color:red'>remove image file XHR error: " + errMsg + "</div>");
                            rowsProcessed++;
                            repairReport.imageFilesProcessed++;
                            showRepairReport();
                        }
                    });
                }
                else {
                    rowsProcessed++;
                    repairReport.imageFilesProcessed++;
                }
            });
        }
    }, 500);
}

function nasycrenameImageFiles(catFolder, physcialFiles) {
    let desiredFileNamePrefix = catFolder.FolderName;
    if (catFolder.FolderType == "singleChild")
        desiredFileNamePrefix = catFolder.ParentName;
    let rowsProcessed = 0;
    let rowsToProcess = physcialFiles.length;
    let renameLoop = setInterval(function () {
        physcialFileNameOk = true;
        $.each(physcialFiles, function (idx, physcialFile) {
            if (rowsProcessed == rowsToProcess) {
                clearInterval(renameLoop);
            }
            else {
                if (abandon) return;
                let ext = physcialFile.name.substring(physcialFile.name.lastIndexOf("."));
                let physcialFilePrefix = physcialFile.name.substr(0, physcialFile.name.indexOf("_"));
                if (physcialFilePrefix != desiredFileNamePrefix)
                    physcialFileNameOk = false;
                let guidPart = physcialFile.name.substr(physcialFile.name.indexOf("_") + 1, 36);
                if (!isGuid(guidPart)) {
                    guidPart = create_UUID();
                    physcialFileNameOk = false;
                }
                if (!physcialFileNameOk) {
                    let newFileName = desiredFileNamePrefix + "_" + guidPart + ext;
                    $.ajax({
                        async: false,
                        url: "php/renameFile.php?path=" + settingsRepoPath + catFolder.FolderPath + "&oldFileName=" + physcialFile.name + "&newFileName=" + newFileName,
                        success: function (success) {
                            if (success == "ok") {
                                repairReport.physcialFilesRenamed.push(physcialFile.name + " to: " + newFileName);
                                // now update array
                                physcialFile.name = newFileName;
                                showRepairReport();
                            }
                            else {
                                repairReport.errors.push("<div style='color:red'>rename file error: " + success + "</div>");
                                showRepairReport();
                            }
                            rowsProcessed++;
                        },
                        error: function (jqXHR) {
                            let errMsg = getXHRErrorDetails(jqXHR);
                            repairReport.errors.push("<div style='color:red'>rename file XHR error: " + errMsg + "</div>");
                            showRepairReport();
                            rowsProcessed++;
                        }
                    });
                }
                else {
                    rowsProcessed++;
                    repairReport.physcialFilesProcessed++;
                }
            }
        });    
    }, 500);
}

function nasycaddMissingImageFiles(catFolder, imageFiles, physcialFiles) {
    let desiredFileNamePrefix = catFolder.FolderName;
    if (catFolder.FolderType == "singleChild")
        desiredFileNamePrefix = catFolder.ParentName;
    let rowsProcessed = 0;
    let rowsToProcess = physcialFiles.length;
    $.each(physcialFiles, function (idx, physcialFile) {
        if (abandon) return;
        let rowOk = false;

        $.each(imageFiles, function (idx, imageFile) {
            if (imageFile.FileName == physcialFile.name) {
                rowOk = true;
                return false;
            }
        });
        if (!rowOk) {
            imageFiles.every(v => {
                if (encodeURI(v.FileName) == encodeURI(physcialFile.name)) {
                    rowOk = true;
                }
            });
        }
        if (!rowOk) {
            // verify file exists.  Whet if it's a link?
            let guidPart = "00";
            if (physcialFile.name.substr(physcialFile.name.indexOf("_")).length > 36)
                guidPart = physcialFile.name.substr(physcialFile.name.indexOf("_") + 1, 36);
            if (!isGuid(guidPart)) {
                guidPart = create_UUID();
                //repairReport.errors.push("improper file name (" + catFolder.Id + ") " + physcialFile.name);
                //showRepairReport();
            }
            let ext = physcialFile.name.substring(physcialFile.name.lastIndexOf("."));
            let newFileName = desiredFileNamePrefix + "_" + guidPart + ext;
            let data = {
                Id: guidPart,
                path: settingsRepoPath + catFolder.FolderPath,
                oldFileName: physcialFile.name,
                newFileName: newFileName,
                folderId: catFolder.Id
            };
            $.ajax({
                type: "POST",
                url: "php/addImageFile.php",
                data: data,
                success: function (addImageFileSuccess) {
                    if (addImageFileSuccess.trim().startsWith("ok")) {
                        repairReport.imageFilesAdded.push("(" + catFolder.Id + ")  " + newFileName);
                        showRepairReport();
                        addImageRows++;
                    }
                    else {
                        switch (addImageFileSuccess.trim()) {
                            case '23000': // Integrity constraint violation
                                $.ajax({
                                    url: "php/yagdrasselFetch.php?query=select FolderId from ImageFile where Id='" + guidPart + "'",
                                    data: data,
                                    success: function (data) {
                                        if (data == "false") {
                                            repairReport.errors.push("Lookup failed (" + catFolder.Id + ") " + newFileName + " error: " + addImageFileSuccess.trim());
                                        }
                                        else {
                                            let realFolder = JSON.parse(data);
                                            if (realFolder.FolderId != catFolder.Id) {
                                                repairReport.errors.push("unable to add (" + catFolder.Id + ") " + newFileName + " already in: " + realFolder.FolderId);
                                                showRepairReport();
                                            }
                                            else
                                                repairReport.comparisonProblems++;
                                        }
                                    },
                                    error: function (jqXHR) {
                                        // let errMsg = getXHRErrorDetails(jqXHR);
                                        repairReport.errors.push("<div style='color:red'>(" + catFolder.Id + ") " + idx + " missing image: " + physcialFile.name + "</div>");
                                        showRepairReport();
                                    }
                                });
                                break;
                            case '42000':
                                repairReport.errors.push("Insert failed (" + catFolder.Id + ") unhandled exception " +
                                    addImageFileSuccess.trim() + " for: " + newFileName);
                                break;
                            default:
                                repairReport.errors.push("Insert failed (" + catFolder.Id + ") " + newFileName + " error: " + addImageFileSuccess.trim());
                        }
                    }
                    showRepairReport();
                },
                error: function (jqXHR) {
                    // let errMsg = getXHRErrorDetails(jqXHR);
                    repairReport.errors.push("<div style='color:red'>(" + catFolder.Id + ") " + idx + " missing image: " + physcialFile.name + "</div>");
                    showRepairReport();
                }
            });
        }
        rowsProcessed++;
        showRepairReport();
        if (rowsProcessed >= rowsToProcess) {
            return "done";
        }
    });
}
