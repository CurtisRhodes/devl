
let repairReport = {
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

function performRepairLinks() {
    repairStartTime = Date.now();
    abandon = false;
    asyncBlock1 = null;

    showRepairReport();
    recurr = $("#ckRepairIncludeSubfolders").is(":checked");
    addNew = $("#ckAddNewImages").is(":checked");
    removeOrphans = $("#ckRemoveOrphans").is(":checked");

    let rootFolderId = $('#txtActiveFolderId').val();
    dashboardDialogBoxClose("addNewImages");

    processFolder(rootFolderId);
    // repairImagesRecurr(rootFolderId, recurr, addNew, removeOrphans);
}

async function processFolder(folderId) {
    // 1. get single catfolder row 
    $.ajax({
        url: "php/yagdrasselFetchAll.php?query=select * from CategoryFolder where Id=" + folderId,
        success: function (data) {
            let catFolder = JSON.parse(data);
            // 2. get its subfolders
            $.ajax({
                url: 'php/yagdrasselFetchAll.php?query=select Id from CategoryFolder where Parent=' + folderId,
                success: function (data) {
                    let subfolders  = JSON.parse(data);
                    // 3.  get image files
                    $.ajax({
                        url: 'php/yagdrasselFetchAll.php?query=select * from ImageFile where FolderId=' + folderId,
                        success: function (data) {
                            let imageFiles = JSON.parse(data);
                            // 3.  get physcial files
                            $.ajax({
                                url: "php/getOggleFolder.php?path=../../danni/" + catFolder.FolderPath + "&folderId=" + folderId,
                                success: function (data) {
                                    let physcialFiles = JSON.parse(data);

                                    processLinks(catFolder, subfolders, imageFiles, physcialFiles);

                                    return true;
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

async function processLinks(catFolder, subfolders, imageFiles, physcialFiles) {

    await removeOrphanImageRows(physcialFiles, imageFiles);

    await renameImageFiles(catFolder, physcialFiles);

    await addMissingImageFiles(catFolder, imageFiles, physcialFiles);

    subfolders.forEach(async (subfolder) => {


        await processFolder(subfolder.Id);
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
    let desiredFileNamePrefix = catFolder.actualFolderName;
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
                    repairReport.errors.push("<div style='color:red'>why am I renaming: " + physcialImageFile.name + " ?</div>");
                    sameFileName = true;
                }
            }
            if (!sameFileName) {
                let newFileName = desiredFileNamePrefix + "_" + guidPart + ext;
                $.ajax({
                    async: false,
                    url: "php/renameFile.php?path=" + catFolder.FolderPath + "&oldFileName=" + physcialFile.name + "&newFileName=" + newFileName,
                    success: function (success) {
                        if (success == "ok") {
                            repairReport.physcialFilesRenamed.push(physcialImageFile.name + " to: " + newFileName);
                            // now update array
                            physcialImageFile.name = newFileName;
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
    let desiredFileNamePrefix = catFolder.actualFolderName;
    if (catFolder.FolderType == "singleChild")
        desiredFileNamePrefix = catFolder.ParentName;
    let rowsProcessed = 0;
    let rowsToProcess = physcialFiles.length;
    $.each(physcialFiles, function (idx, physcialFile) {
        if (abandon) return;
        let rowOk = false;

        imageFiles.every(v => {
            if (encodeURI(v.FileName) == encodeURI(physcialFile.name)) {
                rowOk = true;
            }
        });
        if (!rowOk) {
            // verify file exists.  Whet if it's a link?
            let guidPart = physcialFile.name.substr(physcialFile.name.indexOf("_") + 1, 36);
            if (!isGuid(guidPart)) {
                repairReport.errors.push("improper file name (" + catFolder.Id + ") " + physcialFile.name);
                showRepairReport();
            }
            else {
                let ext = physcialImageFile.name.substring(physcialFile.name.length - 4);
                let newFileName = desiredFileNamePrefix + "_" + guidPart + ext;
                let data = {
                    Id: guidPart,
                    path: fullPath,
                    oldFileName: physcialFile.name,
                    newFileName: newFileName,
                    folderId: folderId
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


        //$('#dataifyInfo').append(", Links: " + repairReport.LinkRecordsProcessed);
        //$('#dataifyInfo').append(", Image rows: " + repairReport.ImageFilesProcessed);

        //if (repairReport.LinksEdited > 0)
        //    $('#dashboardFileList').append(", links Edited: " + repairReport.LinksEdited);
        //if (repairReport.ZeroLenFileResized > 0)
        //    $('#dashboardFileList').append(", ZeroLen File Resized: " + repairReport.ZeroLenFileResized);
        //if (repairReport.ImageFilesMoved > 0)
        //    $('#dashboardFileList').append(", Images Moved: " + repairReport.ImageFilesMoved);
        //if (repairReport.CatLinksRemoved > 0)
        //    $('#dashboardFileList').append(", Links Removed: " + repairReport.CatLinksRemoved);
        //if (repairReport.CatLinksAdded > 0)
        //    $('#dashboardFileList').append(", CatLinks Added: " + repairReport.CatLinksAdded);
        //if (repairReport.ImagesDownLoaded > 0)
        //    $('#dashboardFileList').append(", ImageFiles ImagesDownLoaded: " + repairReport.ImagesDownLoaded);
        //if (repairReport.ZeroLenImageFilesRemoved > 0)
        //    $('#dashboardFileList').append("<div>ZeroLen ImageFiles Removed: " + repairReport.ZeroLenImageFilesRemoved + "</div>");


        let delta = Date.now() - repairStartTime;
        let minutes = Math.floor(delta / 60000);
        let seconds = (delta % 60000 / 1000).toFixed(0);
        $('#dashboardFileList').append("<br/><div>repair links took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds + "</div>");
    }
    catch (e) {
        alert("problem displaying repair report: " + e);
    }
}

function repairImagesRecurr(rootFolderId, recurr, addNew, removeOrphans) {
    try {



        $.ajax({
            url: "php/yagdrasselFetch.php?query=select f.Id, f.FolderType, f.FolderPath, f.SecretNote as actualFolderName, p.FolderName as ParentName from CategoryFolder f join CategoryFolder p on p.Id = f.Parent where f.Id=" + rootFolderId,
            success: function (result) {
                let catFolder = JSON.parse(result);
                // GET SUBFOLDERS AS PER DATABASE
                $.ajax({
                    url: 'php/yagdrasselFetchAll.php?query=select Id, FolderName, SecretNote as actualFolderName, FolderPath from CategoryFolder where Parent=' + rootFolderId,
                    success: function (childDirs) {
                        if (childDirs.indexOf('Error') > -1) {
                            repairReport.errors.push("<div>Error: db error</div>");
                            return;
                        }
                        let jchildDirs = JSON.parse(childDirs);

                        // GET IMAGEFILE ROWS FROM DATABASE
                        $.ajax({
                            url: "php/yagdrasselFetchAll.php?query=select * from ImageFile where FolderId=" + rootFolderId,
                            success: function (imageFiles) {
                                let databaseImageFilesRows = JSON.parse(imageFiles);
                                let fullPath = "../../danni/" + catFolder.FolderPath;
                                // GET PHYSCIAL FILES AS PER SCANDIR



                                $.each(jallFiles, function (idx,) {



                                })




                                //let physcialDirFiles = jallFiles.filter(node => node.type == "dir");
                                let physcialImageFileRows = jallFiles.filter(node => node.type == "file");
                                let removeOrphansStatus = renameImagesStatus = addMissingStatus = "done";


                                if (physcialImageFileRows.length > 0) {



                                    let removeOrphansStatus = renameImagesStatus = addMissingStatus = "not started";
                                    let desiredFileNamePrefix = catFolder.actualFolderName;
                                    if (catFolder.FolderType == "singleChild")
                                        desiredFileNamePrefix = catFolder.ParentName;


                                    // 1. REMOVE ORPHANS
                                    if (removeOrphansStatus == "not started") {
                                        removeOrphansStatus = "running";
                                        removeOrphanImageRows(physcialImageFileRows, databaseImageFilesRows, rootFolderId).then(removeOrphansStatus = "done");
                                    }

                                    // 2. RENAME
                                    let renameInterval = setInterval(function () {
                                        if (removeOrphansStatus == "done") {
                                            clearInterval(renameInterval);
                                            renameImagesStatus = "running";
                                            renameImagesStatus = renameImageFiles(desiredFileNamePrefix, fullPath, physcialImageFileRows);
                                        }
                                    }, 50);

                                    // 2. ADD MISSING
                                    let addMissingInterval = setInterval(function () {
                                        if (removeOrphansStatus == "done")
                                            if (renameImagesStatus == "done") {
                                                clearInterval(addMissingInterval);
                                                addMissingStatus = "running";
                                                addMissingStatus = addMissingImageFiles(desiredFileNamePrefix, physcialImageFileRows,
                                                    databaseImageFilesRows, rootFolderId, fullPath);
                                            }
                                    }, 50);


                                    // COMPARE PHYSCIAL DIRECTORIES WITH DATABSE CATEGORYFOLDER ROWS
                                    //if (physcialDirFiles.length > 0) {
                                    //    $.each(physcialDirFiles, function (idx, physcialDirectory) {
                                    //        let dbChildFolder = jchildDirs.filter(node => encodeURI(node.actualFolderName) == encodeURI(physcialDirectory.name));
                                    //        if (dbChildFolder.length == 0) {
                                    //            repairReport.missingPhyscialDirectories.push("no CategoryFolder row for: (" + rootFolderId + ") " + physcialDirectory.name);
                                    //        }
                                    //    });
                                    //}

                                }
                                repairReport.FoldersProcessed++;
                                let recurrInterval = setInterval(function () {
                                    if (removeOrphansStatus == "done") {
                                        if (renameImagesStatus == "done") {
                                            if (addMissingStatus == "done") {
                                                clearInterval(recurrInterval);
                                                if (recurr)
                                                    $.each(jchildDirs, function (idx, childFolder) {
                                                        repairImagesRecurr(childFolder.Id, recurr, addNew, removeOrphans);
                                                    });
                                            }
                                            else console.log("add missing status: " + addMissingStatus);
                                        }
                                        else console.log("rename images status: " + renameImagesStatus);
                                    }
                                    else console.log("remove orphan status: " + removeOrphansStatus);
                                }, 500);

                                //alert("and done");  //    $('body').off();       
                                showRepairReport();
                            },
                            error: function (jqXHR) {
                                $('#dashBoardLoadingGif').hide();
                                let errMsg = getXHRErrorDetails(jqXHR);
                                alert("get getOggleFolder AJX: " + errMsg);
                            }
                        });
                    },
                    error: function (jqXHR) {
                        $('#dashBoardLoadingGif').hide();
                        let errMsg = getXHRErrorDetails(jqXHR);
                        alert("get getOggleFolder AJX: " + errMsg);
                    }
                });
            },
            error: function (jqXHR) {
                $('#dashBoardLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                alert("get child folders XHR: " + errMsg);
            }
        });
    } catch (e) {
        $('#dashBoardLoadingGif').hide();
        logOggleError("CAT", folderId, e, "repair ImagesRecurr");
    }
}
