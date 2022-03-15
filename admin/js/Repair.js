
let repairReport = {
    physcialFilesProcessed: 0,
    imageFilesProcessed: 0,
    physcialFilesRenamed: [],
    imageFilesAdded: [],
    imageRowsRemoved: [],
    orphanImages:[],
    orphanImageFiles: [],
    missingPhyscialDirectories: [],    
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

function isGuid(value) {
    var regex = /[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}/i;
    var match = regex.exec(value);
    return match != null;
}

let removeOrphansEachCount = removeOrphansCount = interval0 = interval1 = 0;
;
function repairImagesRecurr(rootFolderId, recurr, addNew, removeOrphans) {
    try {
        if (interval0 != 0) {
            console.log("timer0: " + interval0);
            interval0 = 0;
        }
        let timer0 = setInterval(function () {
            if (removeOrphansCount == removeOrphansEachCount) {
                removeOrphansEachCount = 0;
                removeOrphansCount = -1;
                clearInterval(timer0)
                $.ajax({
                    url: "php/customFetch.php?query=select f.Id, f.FolderType, f.FolderPath, f.SecretNote as actualFolderName, p.FolderName as ParentName from CategoryFolder f join CategoryFolder p on p.Id = f.Parent where f.Id=" + rootFolderId,
                    success: function (result) {
                        let catFolder = JSON.parse(result);
                        // GET SUBFOLDERS AS PER DATABASE
                        $.ajax({
                            url: 'php/customFetchAll.php?query=select Id, FolderName, SecretNote as actualFolderName, FolderPath from CategoryFolder where Parent=' + rootFolderId,
                            success: function (childDirs) {
                                if (childDirs.indexOf('Error') > -1) {
                                    $('#dashboardFileList').append("<div>Error: db error</div>");
                                    return;
                                }
                                let jchildDirs = JSON.parse(childDirs);
                                // GET IMAGEFILE ROWS FROM DATABASE
                                $.ajax({
                                    url: "php/customFetchAll.php?query=select * from ImageFile where FolderId=" + rootFolderId,
                                    success: function (imageFiles) {
                                        let imageFileRows = JSON.parse(imageFiles);
                                        let fullPath = "../../danni/" + catFolder.FolderPath;
                                        // GET PHYSCIAL FILES AS PER SCANDIR
                                        $.ajax({
                                            url: "php/getOggleFolder.php?path=" + fullPath + "&folderId=" + rootFolderId,
                                            success: function (allFiles) {
                                                if (allFiles == "false") {
                                                    repairReport.errors.push("parentDirInfo folder not found: " + fullPath);
                                                    return;
                                                }
                                                let jallFiles = JSON.parse(allFiles);
                                                let physcialDirFiles = jallFiles.filter(node => node.type == "dir");
                                                let physcialImageFileRows = jallFiles.filter(node => node.type == "file");

                                                // COMPARE DATABSE CATEGORYFOLDER ROWS WITH PHYSCIAL DIRECTORIES
                                                //if (allDirValues.length == 0) {
                                                //    if (imageFileRows.length > 0) {
                                                //        repairReport.missingParents.push("no physcial folder for: (" + rootFolderId + ") " +
                                                //            catFolder.Id + "-" + catFolder.FolderPath);
                                                //    }
                                                //}
                                                //else

                                                // COMPARE PHYSCIAL DIRECTORIES WITH DATABSE CATEGORYFOLDER ROWS
                                                if (physcialDirFiles.length > 0) {
                                                    $.each(physcialDirFiles, function (idx, physcialDirectory) {
                                                        let dbChildFolder = jchildDirs.filter(node => encodeURI(node.actualFolderName) == encodeURI(physcialDirectory.name));
                                                        if (dbChildFolder.length == 0) {
                                                            repairReport.missingPhyscialDirectories.push("no CategoryFolder row for: (" + rootFolderId + ") " + physcialDirectory.name);
                                                        }
                                                    });
                                                }

                                                // removeOrphans COMPARE DATABSE IMAGEFILE ROWS WITH PHYSCIAL FILES
                                                removeOrphansCount = imageFileRows.length;
                                                $.each(imageFileRows, function (idx, imageFile) {
                                                    repairReport.imageFilesProcessed++;
                                                    let physcialFileRow = physcialImageFileRows.filter(node => node.name == imageFile.FileName);
                                                    if (physcialFileRow.length == 0) {
                                                        // we have a data record with no physcial file
                                                        if (removeOrphans)
                                                            removeImageFile(rootFolderId, imageFile.Id, imageFile.FileName);
                                                        else
                                                            repairReport.orphanImages.push("unneeded imageFile row: (" + rootFolderId + ") " + imageFile.FileName);
                                                    }
                                                    else {
                                                        let fileNamePrefix = catFolder.actualFolderName;
                                                        if (catFolder.FolderType == "singleChild")
                                                            fileNamePrefix = catFolder.ParentName;

                                                        if (!physcialFileRow[0].name.startsWith(fileNamePrefix)) {
                                                            if (removeOrphans) {
                                                                renameImageFile(fileNamePrefix, fullPath, physcialFileRow[0]);
                                                            }
                                                            else
                                                                repairReport.physcialFilesRenamed.push(
                                                                    "physcialFile needs to be renamed: (" + rootFolderId + ") " + objPhyscialimage.name);
                                                        }
                                                    }
                                                    removeOrphansEachCount++;
                                                });

                                                // addNew COMPARE PHYSCIAL FILES WITH DATABSE IMAGEFILE ROWS
                                                if (interval1 != 0) {
                                                    console.log("timer0: " + interval0);
                                                    interval1 = 0;
                                                }

                                                let timer1 = setInterval(function () {
                                                    if (removeOrphansCount == removeOrphansEachCount) {
                                                        clearInterval(timer1);
                                                        $.each(physcialImageFileRows, function (idx, objPhyscialimage) {
                                                            repairReport.physcialFilesProcessed++;
                                                            let dbImageFile = imageFileRows.filter(node => encodeURI(node.FileName) == encodeURI(objPhyscialimage.name));
                                                            if (dbImageFile.length == 0) {
                                                                // we have a physcialFile missing a data record
                                                                if (addNew) {
                                                                    addImageFile(rootFolderId, objPhyscialimage.name, fullPath);
                                                                }
                                                                else
                                                                    repairReport.orphanImageFiles.push(
                                                                        "physcialFile missing a data record: (" + rootFolderId + ") " + objPhyscialimage.name);
                                                            }
                                                            showRepairReport();
                                                        });
                                                    }
                                                    else {
                                                        interval1++;
                                                    }
                                                }, 50);
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
            }
            else {
                interval0++;
            }
        }, 20);
    } catch (e) {
        $('#dashBoardLoadingGif').hide();
        logCatch("repair ImagesRecurr CAT", e);
    }
}
function renameImageFile(desiredFileNamePrefix, path, physcialFileRow) {
    if (!physcialFileRow.name.startsWith(desiredFileNamePrefix) || !guidOk) {
        let suffix = physcialFileRow.name.substring(physcialFileRow.name.length - 4);
        let guidOk = true;
        let guidPart = physcialFileRow.name.substr(physcialFileRow.name.indexOf("_") + 1, 36);

        if (!isGuid(guidPart)) {
            guidOk = false;
            guidPart = create_UUID();
        }
        let newFileName = desiredFileNamePrefix + "_" + guidPart + suffix;
        $.ajax({
            url: "php/renameFile.php?path=" + path + "&oldFileName=" + physcialFileRow.name + "&newFileName=" + newFileName,
            success: function (success) {
                if (success == "ok") {
                    repairReport.physcialFilesRenamed.push(physcialFileRow.name + " to: " + newFileName);

                    // now update array
                    physcialFileRow.name = newFileName;

                    showRepairReport();
                }
                else {
                    repairReport.errors.push("<div style='color:red'>rename file error: " + success + "</div>");
                }
            },
            error: function (jqXHR) {
                $('#dashBoardLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                repairReport.errors.push("<div style='color:red'>rename file XHR error: " + errMsg + "</div>");
            }
        });
    }
}

function addImageFile(folderId, fileName, path) {
    let guidId = fileName.substr(fileName.indexOf("_") + 1, 36);
    let data = {
        Id: guidId,
        path: path,
        fileName: fileName,
        folderId: folderId
    };
    $.ajax({
        type: "POST",
        url: "php/addImageFile.php",
        data: data,
        success: function (addImageFileSuccess) {
            if (addImageFileSuccess.trim().startsWith("ok")) {
                repairReport.imageFilesAdded.push("(" + folderId + ")  " + fileName);
                showRepairReport();
            }
            else {
                switch (addImageFileSuccess.trim()) {
                    case '23000':
                        repairReport.errors.push("Insert failed (" + folderId + ") Id: " + Id + " already exists");
                        break;
                    case '42000':
                        repairReport.errors.push("Insert failed (" + folderId + ") unhandled exception " +
                            addImageFileSuccess.trim() + " for: " + fileName);
                        break;
                    default:
                        repairReport.errors.push("Insert failed (" + folderId + ") " + fileName + " error: " + addImageFileSuccess.trim());
                }
            }
            showRepairReport();
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            repairReport.errors.push("<div style='color:red'>add image file XHR error: " + errMsg + "</div>");
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
                    removeOrphansEachCount++;
                }
                else {
                    console.log(removeImageFileSuccess);
                    $('#dashboardFileList').append("<div style='color:red'>add image file error: " + removeImageFileSuccess + "</div>");
                    removeOrphansEachCount++;
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                $('#dashboardFileList').append("<div style='color:red'>add image file XHR error: " + errMsg + "</div>");
                removeOrphansEachCount++;
            }
        });

    } catch (e) {
        logCatch("remove imageFile CAT", e);
        removeOrphansEachCount++;
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
