
let repairReport = {
    physcialFilesProcessed: 0,
    imageFilesProcessed: 0,
    physcialFilesRenamed: [],
    imageFilesAdded: [],
    imageRowsRemoved: [],
    orphanImages:[],
    orphanImageFiles: [],
    missingPhyscialDirectories:[],
    missingParents: [],
    errors: []
};
let recurr, addNew, removeOrphans, startTime;

function showRepairDialog() {

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
}

function performRepairLinks() {
    startTime = Date.now();    
    $('#dashboardFileList').html("");
    repairReport.physcialFilesProcessed = 0;
    repairReport.imageFilesProcessed = 0;
    repairReport.physcialFilesRenamed = [];
    repairReport.imageFilesAdded = [];
    repairReport.imageRowsRemoved = [];
    repairReport.orphanImages = [];
    repairReport.orphanImageFiles = [];
    repairReport.missingPhyscialDirectories = [];
    repairReport.missingParents = [];
    repairReport.errors = [];

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
            url: "php/customFetch.php?query=select f.Id, f.FolderType, f.FolderPath, f.SecretNote as PhyscialFolderName, p.FolderName as ParentName from CategoryFolder f join CategoryFolder p on p.Id = f.Parent where f.Id=" + rootFolderId,
            success: function (result) {
                let catFolder = JSON.parse(result);
                // GET SUBFOLDERS AS PER DATABASE
                $.ajax({
                    url: 'php/customFetchAll.php?query=select Id, FolderName, SecretNote as PhyscialFolderName, FolderPath from CategoryFolder where Parent=' + rootFolderId,
                    success: function (childDirs) {
                        if (childDirs.indexOf('Error') > -1) {
                            $('#dashboardFileList').append("<div>Error: db error</div>");
                            return;
                        }
                        else {
                            let jchildDirs = JSON.parse(childDirs);
                            // GET IMAGEFILE ROWS FROM DATABASE
                            $.ajax({
                                url: "php/customFetchAll.php?query=select * from ImageFile where FolderId=" + rootFolderId,
                                success: function (imageFileJson) {
                                    let imageFileRows = JSON.parse(imageFileJson);
                                    let fullPath = "../../danni/" + catFolder.FolderPath;
                                    // GET PHYSCIAL FILES AS PER SCANDIR
                                    $.ajax({
                                        url: "php/getOggleFolder.php?path=" + fullPath + "&folderId=" + rootFolderId,
                                        success: function (parentDirInfo) {
                                            if (parentDirInfo == "false") {
                                                repairReport.errors.push("parentDirInfo folder not found: " + fullPath);
                                                return;
                                            }
                                            let jParentDirInfo = JSON.parse(parentDirInfo);
                                            let physcialDirFiles = jParentDirInfo.filter(node => node.type == "dir");

                                            $.ajax({
                                                url: "php/getOggleFolder.php?path=" + fullPath + "&folderId=" + rootFolderId,
                                                success: function (scanDirJson) {
                                                    if (scanDirJson == "false") {
                                                        repairReport.errors.push("scanDirJson folder not found: " + fullPath);
                                                        return;
                                                    }
                                                    let allDirValues = JSON.parse(scanDirJson);
                                                    let physcialImageFileRows = allDirValues.filter(node => node.type == "file");

                                                    // COMPARE DATABSE CATEGORYFOLDER ROWS WITH PHYSCIAL DIRECTORIES
                                                    //if (allDirValues.length == 0) {
                                                    //    if (imageFileRows.length > 0) {
                                                    //        repairReport.missingParents.push("no physcial folder for: (" + rootFolderId + ") " +
                                                    //            catFolder.Id + "-" + catFolder.FolderPath);
                                                    //    }
                                                    //}
                                                    //else
                                                    {
                                                        // COMPARE PHYSCIAL DIRECTORIES WITH DATABSE CATEGORYFOLDER ROWS
                                                        if (physcialDirFiles.length > 0) {
                                                            $.each(physcialDirFiles, function (idx, physcialDirectory) {
                                                                let dbChildFolder = jchildDirs.filter(node => encodeURI(node.PhyscialFolderName) == encodeURI(physcialDirectory.name));
                                                                if (dbChildFolder.length == 0) {
                                                                    repairReport.missingPhyscialDirectories.push("no CategoryFolder row for: (" + rootFolderId + ") " + physcialDirectory.name);
                                                                }
                                                            });
                                                        }

                                                        // COMPARE PHYSCIAL FILES WITH DATABSE IMAGEFILE ROWS
                                                        $.each(physcialImageFileRows, function (idx, objPhyscialimage) {
                                                            let dbImageFile = imageFileRows.
                                                                filter(node => encodeURI(node.FileName) == encodeURI(objPhyscialimage.name));
                                                            if (dbImageFile.length == 0) {
                                                                // we have a physcialFile missing a data record
                                                                if (addNew) {
                                                                    let fileNamePrefix = catFolder.PhyscialFolderName;
                                                                    if (catFolder.FolderType == "singleChild")
                                                                        fileNamePrefix = catFolder.ParentName;

                                                                    // add new called from rename
                                                                    renameImageFile(objPhyscialimage.name, fileNamePrefix,
                                                                        rootFolderId, catFolder.FolderType, fullPath);
                                                                }
                                                                else
                                                                    repairReport.orphanImageFiles.push(
                                                                        "physcialFile missing a data record: (" + rootFolderId + ") " + objPhyscialimage.name);
                                                                showRepairReport();
                                                            }
                                                            repairReport.physcialFilesProcessed++;
                                                        });

                                                        // COMPARE DATABSE IMAGEFILE ROWS WITH PHYSCIAL FILES
                                                        $.each(imageFileRows, function (idx, imageFile) {
                                                            let physcialFileRow = physcialImageFileRows.filter(node => node.name == imageFile.FileName);
                                                            if (physcialFileRow.length == 0) {
                                                                // we have a data record with no physcial file
                                                                if (removeOrphans)
                                                                    removeImageFile(rootFolderId, imageFile.Id, imageFile.FileName);
                                                                else
                                                                    repairReport.orphanImages.push("unneeded imageFile row: (" + rootFolderId + ") " + imageFile.FileName);
                                                            }
                                                            repairReport.imageFilesProcessed++;
                                                        });
                                                    }
                                                    showRepairReport();
                                                    if (recurr) {
                                                        $.each(jchildDirs, function (idx, childFolder) {
                                                            repairImagesRecurr(childFolder.Id, recurr, addNew, removeOrphans);
                                                        });
                                                    }
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
                                    alert("get ImageFiles XHR: " + errMsg);
                                }
                            });
                        }
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

function renameImageFile(physcialimageFileName, desiredFileNamePrefix, folderId, folderType, path) {
    if (!physcialimageFileName.startsWith(desiredFileNamePrefix)) {
        let suffix = physcialimageFileName.substring(physcialimageFileName.length - 4);
        let newFileName = desiredFileNamePrefix + "_" + create_UUID() + suffix;
 
        $.ajax({
            url: "php/renameFile.php?path=" + path + "&oldFileName=" + physcialimageFileName + "&newFileName=" + newFileName,
            success: function (success) {
                if (success == "ok") {
                    if (needsSaving) {
                        repairReport.physcialFilesRenamed.push(physcialimageFileName + " to: " + newFileName);
                        showRepairReport();
                    }
                    addImageFile(folderId, newFileName, folderType, path);
                }
                else {
                    $('#dashboardFileList').append("<div style='color:red'>rename file error: " + success + "</div>");
                }
            },
            error: function (jqXHR) {
                $('#dashBoardLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                $('#dashboardFileList').append("<div style='color:red'>rename file XHR error: " + errMsg + "</div>");
            }
        });
    }
    else
        addImageFile(folderId, physcialimageFileName, folderType, path);

}

function addImageFile(folderId, fileName, folderType, path) {
    let guidId = fileName.substr(fileName.indexOf("_") + 1, 36);
    let data = {
        Id: guidId,
        path: path,
        fileName: fileName,
        folderId: folderId,
        folderType: folderType
    };
    $.ajax({
        type: "POST",
        url: "php/addImageFile.php",
        data: data,
        success: function (addImageFileSuccess) {
            if (addImageFileSuccess.trim().startsWith("ok")) {
                repairReport.imageFilesAdded.push("(" + folderId + ")  " + fileName + " " + folderType);
                showRepairReport();
            }
            else {
                console.log(addImageFileSuccess);
                repairReport.errors.push("failed to add new Image row (" + folderId + ") " + fileName + " error: " + addImageFileSuccess);
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            $('#dashboardFileList').append("<div style='color:red'>add image file XHR error: " + errMsg + "</div>");
        }
    });
}

function removeImageFile(folderId, imageFileId, fileName) {
    try {

        $.ajax({
            type: "GET",
            url: "php/removeImageFile.php?imageFileId=" + imageFileId,
            success: function (removeImageFileSuccess) {
                if (removeImageFileSuccess.trim().startsWith("ok")) {
                    repairReport.imageRowsRemoved.push("(" + folderId + ")  " + fileName);
                    showRepairReport();
                }
                else {
                    console.log(removeImageFileSuccess);
                    $('#dashboardFileList').append("<div style='color:red'>add image file error: " + removeImageFileSuccess + "</div>");
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                $('#dashboardFileList').append("<div style='color:red'>add image file XHR error: " + errMsg + "</div>");
            }
        });
        
} catch (e) {
    logCatch("remove imageFile CAT", e);
}
    }

function showRepairReport() {
    try {
        $('#dashboardFileListContainer').show();
        $('#dashboardFileListHeaderTitle').html("Repair Links");
        $('#dashboardFileList').html("<div>Physcial Files Processed: " + Number(repairReport.physcialFilesProcessed).toLocaleString() + "</div>");
        $('#dashboardFileList').append("<div>Image Files Processed: " + Number(repairReport.imageFilesProcessed).toLocaleString() + "</div>");

        if (repairReport.errors.length > 0) {
            $('#dashboardFileList').append("<div>" + repairReport.errors.length + " Errors</div>");
            $.each(repairReport.errors, function (idx, obj) {
                $('#dashboardFileList').append("<div style='color:red'>" + obj + "</div>");
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

        if (repairReport.imageFilesAdded.length > 0) {
            $('#dashboardFileList').append("<div>Image Files Added: " + Number(repairReport.imageFilesAdded.length).toLocaleString() + "</div>");
            $.each(repairReport.imageFilesAdded, function (idx, obj) {
                $('#dashboardFileList').append("<div style='color:#00802b'>" + obj + "</div>");
            })
            $('#dashboardFileList').append("</div>");
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


        let delta = Date.now() - startTime;
        let minutes = Math.floor(delta / 60000);
        let seconds = (delta % 60000 / 1000).toFixed(0);
        $('#dashboardFileList').append("<br/><div>repair links took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds + "</div>");
    }
    catch (e) {
        alert("problem displaying repair report: " + e);
    }
}
