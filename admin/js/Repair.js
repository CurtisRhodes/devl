
let repairReport = {
    physcialFilesProessed: 0,
    imageFilesProessed: 0,
    physcialFilesRenamed: [],
    imageFilesAdded: [],
    imageRowsRemoved: [],
    orphanImages:[],
    orphanImageFiles: [],
    errors: []
};
let recurr, addNew, removeOrphans, startTime;

function showRepairDialog() {

    $('#dashboardDialogBoxTitle').html("Repair Links");
    $('#dashboardDialogContents').html(`
            <div><span>folder to repair</span><input id='txtFolderToRepair' readonly='readonly'
                style='width:444px' class='roundedInput'></input></div>\n
            <div><span>include all subfolders </span><input id='ckRepairIncludeSubfolders'
                class='adminCheckbox' type='checkbox' checked='checked' ></input></div>\n
            <div><span>add new ImageFiles </span><input id='ckAddNewImages' type='checkbox'
                class='adminCheckbox' checked='checked' ></input></div>\n
            <div><span>remove orphan ImageFiles </span><input type='checkbox' id='ckRemoveOrphans'></input></div>\n
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
    repairReport.physcialFilesProessed = 0;
    repairReport.imageFilesProessed = 0;
    repairReport.imageFilesAdded = [];
    repairReport.imageRowsRemoved = [];
    repairReport.orphanImages = [];
    repairReport.orphanImageFiles = [];
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
            url: "php/customFetch.php?query=select * from CategoryFolder where Id=" + rootFolderId,
            success: function (result) {
                let catFolder = JSON.parse(result);
                // GET SUBFOLDERS AS PER DATABASE
                $.ajax({
                    url: "php/customFetchAll.php?query=select p.Id Parent, p.FolderName as ParentName, f.FolderName, f.FolderPath, f.FolderType" +
                        " from CategoryFolder f join CategoryFolder p on p.Id = f.Parent where f.Id = " + rootFolderId,
                    success: function (childFolders) {
                        if (childFolders.indexOf('Error') > -1) {
                            $('#dashboardFileList').append("<div>Error: folder not found: " + fullPath + "</div>");
                            return;
                        }
                        else {
                            //let jchildFolders = JSON.parse(childFolders);
                            // GET IMAGEFILE ROWS FROM DATABASE
                            $.ajax({
                                url: "php/customFetchAll.php?query=select * from ImageFile where FolderId=" + rootFolderId,
                                success: function (imageFileJson) {
                                    let imageFileRows = JSON.parse(imageFileJson);
                                    let fullPath = "../../danni/" + catFolder.FolderPath;
                                    // GET PHYSCIAL FILES AS PER SCANDIR
                                    $.ajax({
                                        url: "php/getOggleFolder.php?path=" + fullPath + "&folderId=" + rootFolderId,
                                        success: function (scanDirJson) {
                                            if (scanDirJson == "false") {
                                                repairReport.errors.push("folder not found: " + fullPath);
                                                return;
                                            }
                                            let allDirValues = JSON.parse(scanDirJson);
                                            let physcialImageFileRows = allDirValues.filter(node => node.type == "file");
                                            let physcialDirectories = allDirValues.filter(node => node.type == "dir");


                                            // COMPARE DATABSE CATEGORYFOLDER ROWS WITH PHYSCIAL DIRECTORIES
                                            $.each(childFolders, function (idx, objChildFolder) {
                                                let physcialDirectory = physcialDirectories.filter(node => node.name == objChildFolder.FileName);
                                                if (physcialDirectory.length == 0) {
                                                    alert("child folder row with no physcial directory")
                                                }
                                            });

                                            // COMPARE PHYSCIAL DIRECTORIES WITH DATABSE CATEGORYFOLDER ROWS
                                            $.each(physcialDirectories, function (idx, objphyscialDirectory) {
                                                let dbChildFolder = childFolders.filter(node => node.name == objphyscialDirectory);
                                                if (dbChildFolder.length == 0) {
                                                    alert("physcial directory with no categoyFolder row ");
                                                }
                                            });

                                            // COMPARE PHYSCIAL FILES WITH DATABSE IMAGEFILE ROWS
                                            $.each(physcialImageFileRows, function (idx, objPhyscialimageFileRow) {
                                                let dataTableRow = imageFileRows.filter(imageFile => encodeURI(imageFile.FileName) ==
                                                    encodeURI(objPhyscialimageFileRow.name));
                                                if (dataTableRow.length == 0) {
                                                    // we have a physcialFile missing a data record
                                                    if (addNew) {
                                                        let fileNamePrefix = catFolder.FolderName;
                                                        if (catFolder.FolderType == "singleChild")
                                                            fileNamePrefix = catFolder.ParentName;
                                                        renameImageFile(objPhyscialimageFileRow.name, fileNamePrefix, rootFolderId, catFolder[0].FolderType, fullPath);
                                                    }
                                                    else
                                                        repairReport.orphanImageFiles.push(catFolder[0].FolderName + "   (" + rootFolderId + ")");
                                                }
                                                repairReport.physcialFilesProessed++;
                                            });

                                            // COMPARE DATABSE IMAGEFILE ROWS WITH PHYSCIAL FILES
                                            $.each(imageFileRows, function (idx, imageFile) {
                                                let physcialFileRow = physcialImageFileRows.filter(node => node.name == imageFile.FileName);
                                                if (physcialFileRow.length == 0) {
                                                    // we have a data record with no physcial file
                                                    if (removeOrphans)
                                                        removeImageFile(rootFolderId, imageFile.Id, catFolder[0].FolderName);
                                                    else
                                                        repairReport.orphanImages.push(imageFile.FileName);
                                                }
                                                repairReport.imageFilesProessed++;
                                            });

                                            if (recurr) {
                                                $.each(childFolders, function (idx, childFolder) {
                                                    repairImagesRecurr(childFolder.Id, recurr, addNew, removeOrphans);
                                                });
                                            }
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
    let newFileName = physcialimageFileName;
    let needsSaving = false;
    //if (!physcialimageFileName.startsWith(desiredFileNamePrefix))
    {
        let suffix = '.jpg';
        //suffix = physcialimageFileName.substr(physcialimageFileName.length - 4);
        newFileName = desiredFileNamePrefix + "_" + create_UUID() + suffix;
        needsSaving = true;
    }
    $.ajax({
        url: "php/renameFile.php?needsSaving=" + needsSaving + "&path=" + path +
            "&oldFileName=" + physcialimageFileName + "&newFileName=" + newFileName,
        success: function (success) {
            if (success == "ok") {
                if (needsSaving) {
                    repairReport.physcialFilesRenamed.push(physcialimageFileName + " to: " + newFileName);
                }
                addImageFile(folderId, newFileName, folderType, path);
            }
            else {
                if (success == "ok2")
                    addImageFile(folderId, newFileName, folderType, path);
                else
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
            }
            else {
                console.log(addImageFileSuccess);
                repairReport.errors.push(addImageFileSuccess);
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
            $('#dashboardFileList').append("<div style='color:red'>" + repairReport.errors.length + " Errors</div>");
            $.each(repairReport.errors, function (idx, obj) {
                $('#dashboardFileList').append("<div>" + obj + "</div>");
            })
            $('#dashboardFileList').append("</div>");
        }

        if (repairReport.imageFilesAdded.length > 0) {
            $('#dashboardFileList').append("<div>Image Files Added: " + Number(repairReport.imageFilesAdded.length).toLocaleString() + "</div>");
            $.each(repairReport.imageFilesAdded, function (idx, obj) {
                $('#dashboardFileList').append("<div style='color:green'>" + obj + "</div>");
            })
            $('#dashboardFileList').append("</div>");
        }

        if (repairReport.physcialFilesRenamed.length > 0) {
            $('#dashboardFileList').append("<div>Physcial File Renamed: " + Number(repairReport.physcialFilesRenamed.length).toLocaleString() + "</div>");
            $.each(repairReport.physcialFilesRenamed, function (idx, obj) {
                $('#dashboardFileList').append("<div style='color:green'>jpg renamed from: " + obj + "</div>");
            })
            $('#dashboardFileList').append("</div>");
        }

        if (repairReport.imageRowsRemoved.length > 0) {
            $('#dashboardFileList').append("<div>Image Files Removed: " + Number(repairReport.imageRowsRemoved.length).toLocaleString() + "</div>");
            $.each(repairReport.imageRowsRemoved, function (idx, obj) {
                $('#dashboardFileList').append("<div style='color:blue'>" + obj + "</div>");
            })
            $('#dashboardFileList').append("</div>");
        }

        if (repairReport.orphanImages.length > 0) {
            $('#dashboardFileList').append("<div>Orphan Physcial Images : " + repairReport.orphanImages.length + "</div><div>");
            $.each(repairReport.orphanImages, function (idx, obj) {
                $('#dashboardFileList').append("<div>" + obj + "</div>");
            })
            $('#dashboardFileList').append("</div>");
        }

        if (repairReport.orphanImageFiles.length > 0) {
            $('#dashboardFileList').append("<div>Orphan Image Files : " + repairReport.orphanImageFiles.length + "</div><div>");
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
