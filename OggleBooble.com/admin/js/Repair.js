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

    await processAddMissingImageRows(rootFolderId);

    await processRenameImages(rootFolderId);
}

async function processRemoveOrphans(folderId) {
    // 1. get single catfolder row 
    $.ajax({
        url: "php/yagdrasselFetch.php?query=select f.Id, f.FolderName, p.FolderName as ParentName, f.FolderPath, f.FolderType " +
            " from CategoryFolder f join CategoryFolder p on p.Id = f.Parent where f.Id=" + folderId,
        success: function (data) {
            if (data == "false") {
                repairReport.errors.push("<div style='color:red'process RemoveOrphans (get cat folder) XHR error: " + data + "</div>");
            }
            else {
                let catFolder = JSON.parse(data);
                // 2. get its subfolders
                $.ajax({
                    url: 'php/yagdrasselFetchAll.php?query=select Id from CategoryFolder where Parent=' + folderId,
                    success: function (data) {
                        let subfolders = JSON.parse(data);

                        let childCount = subfolders.length;

                        // 3.  get image files
                        $.ajax({
                            url: 'php/yagdrasselFetchAll.php?query=select * from ImageFile where FolderId=' + folderId,
                            success: function (data) {
                                let imageFiles = JSON.parse(data);
                                // 3.  get physcial files
                                $.ajax({
                                    url: "php/getOggleFolder.php?path=" + settingsRepoPath + catFolder.FolderPath + "&folderId=" + folderId,
                                    success: function (data) {
                                        let jallFiles = JSON.parse(data);
                                        let physcialFiles = jallFiles.filter(node => node.type == "file");

                                        removeOrphanImageRows(physcialFiles, imageFiles, folderId);

                                        subfolders.forEach(async (subfolder) => {
                                            await processRemoveOrphans(subfolder.Id);
                                        });
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
                    },
                    error: function (jqXHR) {
                        $('#dashBoardLoadingGif').hide();
                        let errMsg = getXHRErrorDetails(jqXHR);
                        repairReport.errors.push("<div style='color:red'process RemoveOrphans (get sub folders) XHR error: " + errMsg + "</div>");
                    }
                });
            }
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            repairReport.errors.push("<div style='color:red'process RemoveOrphans (get cat folder) XHR error: " + errMsg + "</div>");
            //alert("get child folders XHR: " + errMsg);
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
                                url: "php/getOggleFolder.php?path=" + settingsRepoPath + catFolder.FolderPath + "&folderId=" + folderId,
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
                                    repairReport.errors.push("<div style='color:red'add missing (get physcial folder) XHR error: " + errMsg + "</div>");

                                }
                            });
                        },
                        error: function (jqXHR) {
                            $('#dashBoardLoadingGif').hide();
                            let errMsg = getXHRErrorDetails(jqXHR);
                            repairReport.errors.push("<div style='color:red'add missing (get child folder) XHR error: " + errMsg + "</div>");
                        }
                    });
                },
                error: function (jqXHR) {
                    $('#dashBoardLoadingGif').hide();
                    let errMsg = getXHRErrorDetails(jqXHR);
                    repairReport.errors.push("<div style='color:red'add missing (get cat folders) XHR error: " + errMsg + "</div>");
                }
            });
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            repairReport.errors.push("<div style='color:red'add missing (get physcial folder) XHR error: " + errMsg + "</div>");
        }
    });

}
async function processRenameImages(folderId) {
    // 1. single catfolder row 
    let catSql = "select f.Id, f.FolderName, p.FolderName as ParentName, " +
        "f.FolderPath, f.FolderType from CategoryFolder f join CategoryFolder p on p.Id = f.Parent where f.Id=" + folderId;
    $.ajax({
        url: "php/yagdrasselFetch.php?query=" + catSql,
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
                                url: "php/getOggleFolder.php?path=" + settingsRepoPath + catFolder.FolderPath + "&folderId=" + folderId,
                                success: function (data) {
                                    let jallFiles = JSON.parse(data);
                                    //let physcialDirFiles = jallFiles.filter(node => node.type == "dir");
                                    let physcialFiles = jallFiles.filter(node => node.type == "file");

                                    renameImageFiles(catFolder, imageFiles, physcialFiles);

                                    subfolders.forEach(async (subfolder) => {

                                        //if(subfolder.is)

                                        await processRenameImages(subfolder.Id);
                                    });
                                },
                                error: function (jqXHR) {
                                    $('#dashBoardLoadingGif').hide();
                                    let errMsg = getXHRErrorDetails(jqXHR);
                                    repairReport.errors.push("<div style='color:red'rename (get physcial files) XHR error: " + errMsg + "</div>");
                                }
                            });
                        },
                        error: function (jqXHR) {
                            $('#dashBoardLoadingGif').hide();
                            let errMsg = getXHRErrorDetails(jqXHR);
                            repairReport.errors.push("<div style='color:red'rename (get image files) XHR error: " + errMsg + "</div>");
                        }
                    });
                },
                error: function (jqXHR) {
                    $('#dashBoardLoadingGif').hide();
                    let errMsg = getXHRErrorDetails(jqXHR);
                    repairReport.errors.push("<div style='color:red'rename (get child folders) XHR error: " + errMsg + "</div>");
                }
            });
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            repairReport.errors.push("<div style='color:red'rename (get cat folder) XHR error: " + errMsg + "</div>");
        }
    });
}

async function removeOrphanImageRows(physcialFiles, imageFiles, folderId) {
    let rowsToProcess = imageFiles.length;
    let rowsProcessed = 0;
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
                        showRepairReport();
                    }
                    else {
                        console.log(removeImageFileSuccess);
                        repairReport.errors.push("<div style='color:red'>remove image file error: " + removeImageFileSuccess + "</div>");
                        showRepairReport();
                    }
                    rowsProcessed++;
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR)
                    repairReport.errors.push("<div style='color:red'>remove image file XHR error: " + errMsg + "</div>");
                    rowsProcessed++;
                    showRepairReport();
                }
            });
        }
        else
            rowsProcessed++;

        repairReport.imageFilesProcessed++;
        showRepairReport();
        if (rowsProcessed == rowsToProcess)
            return;
    });
}
async function renameImageFiles(catFolder, imageFiles, physcialFiles) {
    let desiredFileNamePrefix = catFolder.FolderName;
    if (catFolder.FolderType == "singleChild")
        desiredFileNamePrefix = catFolder.ParentName;
    let rowsProcessed = 0;
    let rowsToProcess = physcialFiles.length;
    physcialFileNameOk = true;
    $.each(physcialFiles, function (idx, physcialFile) {
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
            //let imageFileMatches = imageFiles.filter(imageFile => encodeURI(imageFile.FileName) == encodeURI(newFileName));
            //if (imageFileMatches > 0) {
            //console.log("good and valid");
            $.ajax({
                async: false,
                url: "php/renameFile.php?path=" + settingsRepoPath + catFolder.FolderPath + "&oldFileName=" + physcialFile.name + "&newFileName=" + newFileName,
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
            //    }
            //    else {
            //        console.log("no rename. add new");
            //        rowsProcessed++;
            //    }
        }
        else
            rowsProcessed++;

        repairReport.physcialFilesProcessed++;
        if (rowsProcessed == rowsToProcess) {
            showRepairReport();
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
