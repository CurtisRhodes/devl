﻿let repairReport = {
    FoldersProcessed: 0,
    physcialFilesProcessed: 0,
    imageFilesProcessed: 0,
    physcialFilesRenamed: [],
    imageFilesAdded: [],
    imageRowsRemoved: [],
    orphanImages: [],
    orphanImageFiles: [],
    missingPhyscialDirectories: [],
    missingParents: [],
    comparisonProblems: 0,
    errors: []
};
let abandon = false;
let addImageRows = 0;
let recurr, addNew, removeOrphans, repairStartTime;
let asyncBlock1 = null;
let testing = true;
function showRepairDialog() {
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
            <div class='roundendButton' onclick='performRepairLinks()'>Run</div>`);
    $('#dashboardDialogContents').keydown(function (event) {
        if (event.keyCode === 13) {
            performRepairLinks();
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

async function performRepairLinks() {
    repairStartTime = Date.now();
    abandon = false;
    asyncBlock1 = null;

    showRepairReport();
    recurr = $("#ckRepairIncludeSubfolders").is(":checked");
    addNew = $("#ckAddNewImages").is(":checked");
    removeOrphans = $("#ckRemoveOrphans").is(":checked");

    let rootFolderId = $('#txtActiveFolderId').val();
    dashboardDialogBoxClose("addNewImages");

    await processRemoveOrphans(rootFolderId);
    await processRenameImages(rootFolderId);
    await processAddMissingImageRows(rootFolderId);

    // repairImagesRecurr(rootFolderId, recurr, addNew, removeOrphans);
}

async function processRemoveOrphans(folderId) {
    // 1. get single catfolder row 
    $.ajax({
        url: "php/yagdrasselFetch.php?query=select f.Id, f.FolderName, p.FolderName as ParentName, f.FolderPath, f.FolderType " +
            " from CategoryFolder f join CategoryFolder p on p.Id = f.Parent where f.Id=" + folderId,
        success: function (data) {
            let catFolder = JSON.parse(data);
            // 2. get its subfolders
            $.ajax({
                url: 'php/yagdrasselFetchAll.php?query=select Id from CategoryFolder where Parent=' + folderId,
                success: function (data) {
                    let subfolders = JSON.parse(data);
                    // 3.  get image files
                    $.ajax({
                        url: 'php/yagdrasselFetchAll.php?query=select * from ImageFile where FolderId=' + folderId,
                        success: function (data) {
                            let imageFiles = JSON.parse(data);
                            // 3.  get physcial files
                            $.ajax({
                                url: "php/getOggleFolder.php?path=" + "../../danni/" + catFolder.FolderPath + "&folderId=" + folderId,
                                success: function (data) {
                                    let jallFiles = JSON.parse(data);
                                    //let physcialDirFiles = jallFiles.filter(node => node.type == "dir");
                                    let physcialFiles = jallFiles.filter(node => node.type == "file");

                                    removeOrphanImageRows(physcialFiles, imageFiles);

                                    subfolders.forEach(async (subfolder) => {
                                        await processRemoveOrphans(subfolder.Id);
                                    });
                                },
                                error: function (jqXHR) {
                                    $('#dashBoardLoadingGif').hide();
                                    let errMsg = getXHRErrorDetails(jqXHR);
                                    alert("get child folders XHR: " + errMsg);
                                }
                            });
                        },
                        error: function (jqXHR) {
                            $('#dashBoardLoadingGif').hide();
                            let errMsg = getXHRErrorDetails(jqXHR);
                            alert("get child folders XHR: " + errMsg);
                        }
                    });
                },
                error: function (jqXHR) {
                    $('#dashBoardLoadingGif').hide();
                    let errMsg = getXHRErrorDetails(jqXHR);
                    alert("get child folders XHR: " + errMsg);
                }
            });
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            alert("get child folders XHR: " + errMsg);
        }
    });

}

async function processRenameImages(folderId) {
    // 1. get single catfolder row 
    $.ajax({
        url: "php/yagdrasselFetch.php?query=select f.Id, f.FolderName, p.FolderName as ParentName, f.FolderPath, f.FolderType " +
            " from CategoryFolder f join CategoryFolder p on p.Id = f.Parent where f.Id=" + folderId,
        success: function (data) {
            let catFolder = JSON.parse(data);
            // 2. get its subfolders
            $.ajax({
                url: 'php/yagdrasselFetchAll.php?query=select Id from CategoryFolder where Parent=' + folderId,
                success: function (data) {
                    let subfolders = JSON.parse(data);
                    // 3.  get image files
                    $.ajax({
                        url: 'php/yagdrasselFetchAll.php?query=select * from ImageFile where FolderId=' + folderId,
                        success: function (data) {
                            let imageFiles = JSON.parse(data);
                            // 3.  get physcial files
                            $.ajax({
                                url: "php/getOggleFolder.php?path=" + "../../danni/" + catFolder.FolderPath + "&folderId=" + folderId,
                                success: function (data) {
                                    let jallFiles = JSON.parse(data);
                                    //let physcialDirFiles = jallFiles.filter(node => node.type == "dir");
                                    let physcialFiles = jallFiles.filter(node => node.type == "file");

                                    renameImageFiles(catFolder, physcialFiles);

                                    subfolders.forEach(async (subfolder) => {
                                        await processRenameImages(subfolder.Id);
                                    });
                                },
                                error: function (jqXHR) {
                                    $('#dashBoardLoadingGif').hide();
                                    let errMsg = getXHRErrorDetails(jqXHR);
                                    alert("get child folders XHR: " + errMsg);
                                }
                            });
                        },
                        error: function (jqXHR) {
                            $('#dashBoardLoadingGif').hide();
                            let errMsg = getXHRErrorDetails(jqXHR);
                            alert("get child folders XHR: " + errMsg);
                        }
                    });
                },
                error: function (jqXHR) {
                    $('#dashBoardLoadingGif').hide();
                    let errMsg = getXHRErrorDetails(jqXHR);
                    alert("get child folders XHR: " + errMsg);
                }
            });
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            alert("get child folders XHR: " + errMsg);
        }
    });

}

async function processAddMissingImageRows(folderId) {
    // 1. get single catfolder row 
    $.ajax({
        url: "php/yagdrasselFetch.php?query=select f.Id, f.FolderName, p.FolderName as ParentName, f.FolderPath, f.FolderType " +
            " from CategoryFolder f join CategoryFolder p on p.Id = f.Parent where f.Id=" + folderId,
        success: function (data) {
            let catFolder = JSON.parse(data);
            // 2. get its subfolders
            $.ajax({
                url: 'php/yagdrasselFetchAll.php?query=select Id from CategoryFolder where Parent=' + folderId,
                success: function (data) {
                    let subfolders = JSON.parse(data);
                    // 3.  get image files
                    $.ajax({
                        url: 'php/yagdrasselFetchAll.php?query=select * from ImageFile where FolderId=' + folderId,
                        success: function (data) {
                            let imageFiles = JSON.parse(data);
                            // 3.  get physcial files
                            $.ajax({
                                url: "php/getOggleFolder.php?path=" + "../../danni/" + catFolder.FolderPath + "&folderId=" + folderId,
                                success: function (data) {
                                    let jallFiles = JSON.parse(data);
                                    //let physcialDirFiles = jallFiles.filter(node => node.type == "dir");
                                    let physcialFiles = jallFiles.filter(node => node.type == "file");

                                    addMissingImageFiles(catFolder, imageFiles, physcialFiles);

                                    subfolders.forEach(async (subfolder) => {
                                        await processAddMissingImageRows(subfolder.Id);
                                    });
                                },
                                error: function (jqXHR) {
                                    $('#dashBoardLoadingGif').hide();
                                    let errMsg = getXHRErrorDetails(jqXHR);
                                    alert("get child folders XHR: " + errMsg);
                                }
                            });
                        },
                        error: function (jqXHR) {
                            $('#dashBoardLoadingGif').hide();
                            let errMsg = getXHRErrorDetails(jqXHR);
                            alert("get child folders XHR: " + errMsg);
                        }
                    });
                },
                error: function (jqXHR) {
                    $('#dashBoardLoadingGif').hide();
                    let errMsg = getXHRErrorDetails(jqXHR);
                    alert("get child folders XHR: " + errMsg);
                }
            });
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            alert("get child folders XHR: " + errMsg);
        }
    });

}


async function removeOrphanImageRows(physcialFiles, imageFiles) {
    if (imageFiles.lastFolderId > 0) {
        let rowsToProcess = imageFiles.length;
        $.each(imageFiles, function (idx, imageFile) {
            if (abandon) return;
            let physcialFileRow = physcialFiles.filter(node => encodeURI(node.name) == encodeURI(imageFile.FileName));
            if (physcialFileRow.length == 0) {
                // we have a data record with no physcial file
                $.ajax({
                    type: "GET",
                    url: "php/removeImageFile.php?imageFileId=" + imageFile.Id,
                    success: function (removeImageFileSuccess) {
                        if (removeImageFileSuccess.trim().startsWith("ok")) {
                            repairReport.imageRowsRemoved.push("(" + rootFolderId + ")  " + databaseImageFile.FileName);
                        }
                        else {
                            console.log(removeImageFileSuccess);
                            repairReport.errors.push("<div style='color:red'>add image file error: " + removeImageFileSuccess + "</div>");
                        }
                        rowsProcessed++;
                    },
                    error: function (jqXHR) {
                        let errMsg = getXHRErrorDetails(jqXHR)
                        repairReport.errors.push("<div style='color:red'>add image file XHR error: " + errMsg + "</div>");
                        rowsProcessed++;
                    }
                });
            }
            else
                rowsProcessed++;
            if (rowsProcessed == rowsToProcess)
                return;
            repairReport.physcialFilesProcessed++;
            showRepairReport();
        });
    }
    else
        return;
}

async function renameImageFiles(catFolder, physcialFiles) {
    let desiredFileNamePrefix = catFolder.FolderName;
    if (catFolder.FolderType == "singleChild")
        desiredFileNamePrefix = catFolder.ParentName;
    let rowsProcessed = 0;
    let rowsToProcess = physcialFiles.length;
    $.each(physcialFiles, function (idx, physcialFile) {
        if (abandon) return;
        if (!physcialFile.name.startsWith(desiredFileNamePrefix)) {
            let ext = physcialFile.name.substring(physcialFile.name.length - 4);
            let sameFileName = false;
            let guidPart = physcialFile.name.substr(physcialFile.name.indexOf("_") + 1, 36);
            if (!isGuid(guidPart)) {
                guidPart = create_UUID();
            }
            else {
                if (physcialFile.name.startsWith(desiredFileNamePrefix)) {
                    repairReport.errors.push("<div style='color:red'>why am I renaming: " + physcialFile.name + " ?</div>");
                    sameFileName = true;
                }
            }
            if (!sameFileName) {
                let newFileName = desiredFileNamePrefix + "_" + guidPart + ext;
                $.ajax({
                    async: false,
                    url: "php/renameFile.php?path=" + "../../danni/" + catFolder.FolderPath + "&oldFileName=" + physcialFile.name + "&newFileName=" + newFileName,
                       // ? path = " + settingsImgRepo + catFolder.FolderPath + " & oldFileName=" + physcialFile.name + "& newFileName=" + newFileName,
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
        }
        else {
            rowsProcessed++;
        }
        repairReport.imageFilesProcessed++;
        showRepairReport();
        if (rowsProcessed == rowsToProcess) {
            return true;
        }
    });
}

async function addMissingImageFiles(catFolder, imageFiles, physcialFiles) {
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
            let ext = physcialFile.name.substring(physcialFile.name.length - 4);
            let newFileName = desiredFileNamePrefix + "_" + guidPart + ext;
            let data = {
                Id: guidPart,
                path: "../../danni/" + catFolder.FolderPath,
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
                                repairReport.comparisonProblems++;
                                //repairReport.errors.push("Insert failed (" + folderId + ") Id: " + guidPart + " already exists");
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

function isGuid(value) {
    var regex = /[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}/i;
    var match = regex.exec(value);
    return match != null;
}

function showRepairReport() {
    $('#dashboardFileListContainer').show();
    $('#dashboardFileListHeaderTitle').html("Repair Links");
    try {        
        $('#dashboardFileList').html("<div>Folders Processed:" + Number(repairReport.FoldersProcessed).toLocaleString() + "</div>");
        $('#dashboardFileList').append("<div>Physcial Files Processed:" + Number(repairReport.physcialFilesProcessed).toLocaleString() + "</div>");
        $('#dashboardFileList').append("<div>Image Files Processed:" + Number(repairReport.imageFilesProcessed).toLocaleString() + "</div>");

        if (repairReport.errors.length > 0) {
            $('#dashboardFileList').append("<div>" + repairReport.errors.length + " Errors</div>");
            $.each(repairReport.errors, function (idx, obj) {
                $('#dashboardFileList').append("<div style='color:red'>" + obj + "</div>");
            })
            $('#dashboardFileList').append("</div>");
        }

        if (repairReport.imageFilesAdded.length > 0) {
            $('#dashboardFileList').append("<div>Image Files Added: " + Number(repairReport.imageFilesAdded.length).toLocaleString() + "</div>");
            $.each(repairReport.imageFilesAdded, function (idx, obj) {
                $('#dashboardFileList').append("<div style='color:#00802b'>" + obj + "</div>");
            })
            $('#dashboardFileList').append("</div>");
        }

        if (repairReport.missingPhyscialDirectories.length > 0) {
            $('#dashboardFileList').append("<div class='underline'>Missing Physcial Directories: " + repairReport.missingPhyscialDirectories.length + "</div><div>");
            $.each(repairReport.missingPhyscialDirectories, function (idx, obj) {
                $('#dashboardFileList').append("<div style='color:#e65c00'>" + obj + "</div>");
            })
            $('#dashboardFileList').append("</div>");
        }

        if (repairReport.missingParents.length > 0) {
            $('#dashboardFileList').append("<div class='underline'>Missing ImageFile Parent Rows: " + repairReport.missingParents.length + "</div><div>");
            $.each(repairReport.missingParents, function (idx, obj) {
                $('#dashboardFileList').append("<div style='color:#e65c00'>" + obj + "</div>");
            })
            $('#dashboardFileList').append("</div>");
        }

        if (repairReport.physcialFilesRenamed.length > 0) {
            $('#dashboardFileList').append("<div>Physcial File Renamed: " + Number(repairReport.physcialFilesRenamed.length).toLocaleString() + "</div>");
            $.each(repairReport.physcialFilesRenamed, function (idx, obj) {
                $('#dashboardFileList').append("<div style='color:#448927'>jpg renamed from: " + obj + "</div>");
            })
            $('#dashboardFileList').append("</div><br/>");
        }

        if (repairReport.imageRowsRemoved.length > 0) {
            $('#dashboardFileList').append("<div class='underline'>Image Files Removed: " + Number(repairReport.imageRowsRemoved.length).toLocaleString() + "</div>");
            $.each(repairReport.imageRowsRemoved, function (idx, obj) {
                $('#dashboardFileList').append("<div style='color:#004d99'>" + obj + "</div>");
            })
            $('#dashboardFileList').append("</div>");
        }

        if (repairReport.orphanImages.length > 0) {
            $('#dashboardFileList').append("<div class='underline'>Unneeded Image Files: " + repairReport.orphanImages.length + "</div><div>");
            $.each(repairReport.orphanImages, function (idx, obj) {
                $('#dashboardFileList').append("<div>" + obj + "</div>");
            })
            $('#dashboardFileList').append("</div>");
        }

        if (repairReport.orphanImageFiles.length > 0) {
            $('#dashboardFileList').append("<div class='underline'>Orphan Physcial Images: " + repairReport.orphanImageFiles.length + "</div><div>");
            $.each(repairReport.orphanImageFiles, function (idx, obj) {
                $('#dashboardFileList').append("<div>" + obj + "</div>");
            })
            $('#dashboardFileList').append("</div>");
        }

        if (repairReport.comparisonProblems > 0)
            $('#dashboardFileList').append("<div>comparison problems:" + Number(repairReport.comparisonProblems).toLocaleString() + "</div>");

        let delta = Date.now() - repairStartTime;
        let minutes = Math.floor(delta / 60000);
        let seconds = (delta % 60000 / 1000).toFixed(0);
        $('#dashboardFileList').append("<br/><div>repair links took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds + "</div>");
    }
    catch (e) {
        alert("problem displaying repair report: " + e);
    }
}

//async function processLinks(catFolder, subfolders, imageFiles, physcialFiles) {

//    await removeOrphanImageRows(physcialFiles, imageFiles);

//    await renameImageFiles(catFolder, physcialFiles);

//    await addMissingImageFiles(catFolder, imageFiles, physcialFiles);

//    subfolders.forEach(async (subfolder) => {
//        await processFolder(subfolder.Id);
//    });
//}