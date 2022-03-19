
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
let recurr, addNew, removeOrphans, repairStartTime;

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
    showRepairReport();
    recurr = $("#ckRepairIncludeSubfolders").is(":checked");
    addNew = $("#ckAddNewImages").is(":checked");
    removeOrphans = $("#ckRemoveOrphans").is(":checked");

    let rootFolderId = $('#txtActiveFolderId').val();
    dashboardDialogBoxClose("addNewImages");

    repairImagesRecurr(rootFolderId, recurr, addNew, removeOrphans);
}

function repairImagesRecurr(rootFolderId, recurr, addNew, removeOrphans) {
    try {
        $.ajax({
            url: "php/customFetch.php?query=select f.Id, f.FolderType, f.FolderPath, f.SecretNote as actualFolderName, p.FolderName as ParentName from CategoryFolder f join CategoryFolder p on p.Id = f.Parent where f.Id=" + rootFolderId,
            success: function (result) {
                let catFolder = JSON.parse(result);
                // GET SUBFOLDERS AS PER DATABASE
                $.ajax({
                    url: 'php/customFetchAll.php?query=select Id, FolderName, SecretNote as actualFolderName, FolderPath from CategoryFolder where Parent=' + rootFolderId,
                    success: function (childDirs) {
                        if (childDirs.indexOf('Error') > -1) {
                            repairReport.errors.push("<div>Error: db error</div>");
                            return;
                        }
                        let jchildDirs = JSON.parse(childDirs);
                        // GET IMAGEFILE ROWS FROM DATABASE
                        $.ajax({
                            url: "php/customFetchAll.php?query=select * from ImageFile where FolderId=" + rootFolderId,
                            success: function (imageFiles) {
                                let databaseImageFilesRows = JSON.parse(imageFiles);
                                let fullPath = "../../danni/" + catFolder.FolderPath;
                                // GET PHYSCIAL FILES AS PER SCANDIR
                                $.ajax({
                                    url: "php/getOggleFolder.php?path=" + fullPath + "&folderId=" + rootFolderId,
                                    success: function (allFiles) {
                                        if (allFiles == "false") {
                                            repairReport.errors.push("parentDirInfo folder not found: " + fullPath);
                                            showRepairReport();
                                            return;
                                        }
                                        let jallFiles = JSON.parse(allFiles);
                                        //let physcialDirFiles = jallFiles.filter(node => node.type == "dir");
                                        let physcialImageFileRows = jallFiles.filter(node => node.type == "file");
                                        let removeOrphansStatus = addNewStatus = renameImagesStatus = "done";
                                        if (physcialImageFileRows.length > 0) {
                                            let desiredFileNamePrefix = catFolder.actualFolderName;
                                            if (catFolder.FolderType == "singleChild")
                                                desiredFileNamePrefix = catFolder.ParentName;


                                            // 1. REMOVE ORPHANS
                                            removeOrphansStatus = "running";
                                            removeOrphansStatus = removeOrphanImageRows(physcialImageFileRows, databaseImageFilesRows, rootFolderId);


                                            // 2. RENAME
                                            let renameInterval = setInterval(function () {
                                                if (removeOrphansStatus == "done") {
                                                    clearInterval(renameInterval);
                                                    renameImagesStatus = "running";
                                                    renameImagesStatus = renameImageFiles(desiredFileNamePrefix, fullPath, physcialImageFileRows);
                                                }
                                            }, 50);

                                            // 2. ADD
                                            let addMissingInterval = setInterval(function () {
                                                if (removeOrphansStatus == "done")
                                                    if (renameImagesStatus == "done") {
                                                        clearInterval(addMissingInterval);
                                                        addMissingStatus = "running";
                                                        addMissingImageFiles(desiredFileNamePrefix, physcialImageFileRows,
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
                                            if (removeOrphansStatus == "done")
                                                if (addNewStatus = renameImagesStatus == "done")
                                                    if (addNewStatus = renameImagesStatus == "done")
                                                        if (renameImagesStatus == "done")
                                                            clearInterval(recurrInterval);
                                                            if (recurr) {
                                                                $.each(jchildDirs, function (idx, childFolder) {
                                                                    repairImagesRecurr(childFolder.Id, recurr, addNew, removeOrphans);
                                                                });
                                                            }
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
            },
            error: function (jqXHR) {
                $('#dashBoardLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                alert("get CategoryFolder XHR: " + errMsg);
            }
        });
    } catch (e) {
        $('#dashBoardLoadingGif').hide();
        logCatch("repair ImagesRecurr CAT", e);
    }
}

function isGuid(value) {
    var regex = /[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}/i;
    var match = regex.exec(value);
    return match != null;
}

function removeOrphanImageRows(physcialImageFileRows, databaseImageFilesRows, rootFolderId) {
    let timer1 = Date.now();
    let rowsProcessed = 0;
    let rowsTpProcess = databaseImageFilesRows.length;
    let asyncBlock1 = setInterval(function () {
        if (abandon) return;
        $.each(databaseImageFilesRows, function (idx, databaseImageFile) {
            let physcialFileRow = physcialImageFileRows.filter(node => encodeURI(node.name) == encodeURI(databaseImageFile.FileName));
            if (physcialFileRow.length == 0) {
                // we have a data record with no physcial file
                if (removeOrphans)
                    $.ajax({
                        type: "GET",
                        url: "php/removeImageFile.php?imageFileId=" + databaseImageFile.Id,
                        success: function (removeImageFileSuccess) {
                            if (removeImageFileSuccess.trim().startsWith("ok")) {
                                repairReport.imageRowsRemoved.push("(" + rootFolderId + ")  " + databaseImageFile.FileName);
                            }
                            else {
                                console.log(removeImageFileSuccess);
                                repairReport.errors.push("<div style='color:red'>add image file error: " + removeImageFileSuccess + "</div>");
                            }
                            showRepairReport();
                            rowsProcessed++;
                        },
                        error: function (jqXHR) {
                            let errMsg = getXHRErrorDetails(jqXHR)
                            repairReport.errors.push("<div style='color:red'>add image file XHR error: " + errMsg + "</div>");
                            showRepairReport();
                            rowsProcessed++;
                        }
                    });
                else {
                    repairReport.orphanImages.push("unneeded imageFile row: (" + rootFolderId + ") " + imageFile.FileName);
                    showRepairReport();
                    rowsProcessed++;
                }
            }
            else
            rowsProcessed++;
            let delta = Date.now() - timer1;
            if (delta > 5001) {
                clearInterval(asyncBlock1);
                //alert("remove orphans process taking too long")
            }
            repairReport.physcialFilesProcessed++;
        });
        if (rowsProcessed == rowsTpProcess) {
            clearInterval(asyncBlock1);
            showRepairReport();
        }
    }, 200);
    return "done";
}

function renameImageFiles(desiredFileNamePrefix, path, physcialImageFileRows) {
    let timer2 = Date.now();
    let rowsProcessed = 0;
    let rowsTpProcess = physcialImageFileRows.length;
    let asyncBlock2 = setInterval(function () {
        $.each(physcialImageFileRows, function (idx, physcialImageFile) {
            repairReport.imageFilesProcessed++;
            if (abandon) return;
            if (!physcialImageFile.name.startsWith(desiredFileNamePrefix)) {
                let ext = physcialImageFile.name.substring(physcialImageFile.name.length - 4);
                let sameFileName = false;
                let guidPart = physcialImageFile.name.substr(physcialImageFile.name.indexOf("_") + 1, 36);
                if (!isGuid(guidPart)) {
                    guidPart = create_UUID();
                }
                else {
                    if (physcialImageFile.name.startsWith(desiredFileNamePrefix)) {
                        repairReport.errors.push("<div style='color:red'>why am I renaming: " + physcialImageFile.name + " ?</div>");
                        sameFileName = true;
                        showRepairReport();
                    }
                }
                if (!sameFileName) {
                    let newFileName = desiredFileNamePrefix + "_" + guidPart + ext;
                    $.ajax({
                        async: false,
                        url: "php/renameFile.php?path=" + path + "&oldFileName=" + physcialImageFile.name + "&newFileName=" + newFileName,
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
            else
                rowsProcessed++;
            let delta = Date.now() - timer2;
            if (delta > 5001) {
                clearInterval(asyncBlock2);
                //alert("rename process taking too long")
            }
        });
        if (rowsProcessed == rowsTpProcess) {
            clearInterval(asyncBlock2);
            showRepairReport();
        }
    }, 200);
    return "done";
}

function addMissingImageFiles(desiredFileNamePrefix, physcialImageFileRows, databaseImageFilesRows, folderId, fullPath) {
    let timer5 = Date.now();
    let rowsProcessed = 0;
    let rowsTpProcess = physcialImageFileRows.length;
    let asyncBlock5 = setInterval(function () {
        $.each(physcialImageFileRows, function (idx, physcialImageFile) {
            if (abandon) return;
            rowsProcessed++;
            let rowOk = false;
            databaseImageFilesRows.every(v => {
                if (encodeURI(v.FileName) == encodeURI(physcialImageFile.name)) {
                    rowOk = true;
                    return false;
                }
            });
            // let fidx = $.find(physcialImageFile.name, databaseImageFilesRows);
            // if () == -1) {
            //let correspondingDbRow = databaseImageFilesRows.filter(db => encodeURI(db.FileName) == encodeURI(physcialImageFile.name));
            //if (correspondingDbRow.length == 0) {
            if (!rowOk) {
                let guidPart = physcialImageFile.name.substr(physcialImageFile.name.indexOf("_") + 1, 36);
                if (!isGuid(guidPart)) {
                    repairReport.errors.push("improper file name (" + folderId + ") " + physcialImageFile.name);
                    showRepairReport();
                }
                else {
                    let ext = physcialImageFile.name.substring(physcialImageFile.name.length - 4);
                    let newFileName = desiredFileNamePrefix + "_" + guidPart + ext;
                    let data = {
                        Id: guidPart,
                        path: fullPath,
                        oldFileName: physcialImageFile.name,
                        newFileName: newFileName,
                        folderId: folderId
                    };
                    $.ajax({
                        type: "POST",
                        url: "php/addImageFile.php",
                        data: data,
                        success: function (addImageFileSuccess) {
                            if (addImageFileSuccess.trim().startsWith("ok")) {
                                repairReport.imageFilesAdded.push("(" + folderId + ")  " + newFileName);
                                showRepairReport();
                            }
                            else {
                                switch (addImageFileSuccess.trim()) {
                                    case '23000':
                                        repairReport.comparisonProblems++;
                                        //repairReport.errors.push("Insert failed (" + folderId + ") Id: " + guidPart + " already exists");
                                        break;
                                    case '42000':
                                        repairReport.errors.push("Insert failed (" + folderId + ") unhandled exception " +
                                            addImageFileSuccess.trim() + " for: " + newFileName);
                                        break;
                                    default:
                                        repairReport.errors.push("Insert failed (" + folderId + ") " + newFileName + " error: " + addImageFileSuccess.trim());
                                }
                            }
                            showRepairReport();
                        },
                        error: function (jqXHR) {
                            let errMsg = getXHRErrorDetails(jqXHR);
                            repairReport.errors.push("<div style='color:red'>add image file XHR error: " + errMsg + "</div>");
                            showRepairReport();
                        }
                    });
                }
            }
            let delta = Date.now() - timer5;
            if (delta > 5001) {
                clearInterval(asyncBlock5);
                //alert("rename process taking too long")
            }
        });
        if (rowsProcessed == rowsTpProcess) {
            clearInterval(asyncBlock5);
            showRepairReport();
        }
    }, 200);
    return "done";
}

lastFolderId = -33;
function updateRepairReport(folderId) {
    if (folderId != lastFolderId) {
        lastFolderId = folderId;
        $('#dashboardFileList').append("Folder: ");
    }
    $('#ttlFilesProcessed').html(Number(repairReport.physcialFilesProcessed).toLocaleString());
    $('#ttlFilesProcessed').html(Number(repairReport.imageFilesProcessed).toLocaleString());

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
