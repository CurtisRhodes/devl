// let settingsImgRepo = 'https ://img.brucheum.com/';
// let settingsImgRepo = 'st21569.ispot.cc/danni/';
let settingsImgRepo = 'https://ogglefiles.com/danni/';


// LOAD DIR TREE
function showBuildDirTreeDialog() {
    $('#dashboardFileListContainer').hide();
    $('#dashboardDialogBoxTitle').html("Build Dir Tree");
    $('#dashboardDialogContents').html(
        "    <div><span>choose start folder</span><select id='selDirTreeRoot' class='txtLinkPath roundedInput'>\n" +
        "              <option selected='selected' value='0'>-- or select --</option>\n" +
        "              <option selected='selected' value='3'>Big Naturals ~(115,000)</option>\n" +
        "              <option selected='selected' value='1132'>Centerfolds ~(100,500)</option>\n" +
        "              <option selected='selected' value='3796'>Cybergirls ~(42,500)</option>\n" +
        "              <option selected='selected' value='9706'>girls around the world ~(25,600)</option>\n" +
        "              <option selected='selected' value='242'>Porn ~(22,000)</option>\n" +
        "              <option selected='selected' value='440'>Porn Stars ~(20,600)</option>\n" +
        "              <option selected='selected' value='91'>back in the day ~(20,000)</option>\n" +
        "              <option selected='selected' value='3956'>private collection ~(4,000)</option>\n" +
        "              <option selected='selected' value='10326'>Bond Girls	~(5,000)</option>\n" +
        "           </select></div>\n" +
        "    <div><span>or select start folder</span><input id='txtRoot' class='txtLinkPath roundedInput'></input></div>\n" +
        "    <div class='roundendButton' tabindex='0' onclick='performBuildDirTree();dashboardDialogBoxClose(\"showBuildDirTreeDialog click\");')'>Go</div>");
    $('#dashboardDialogBox').draggable().fadeIn();
    $('#dashboardDialogContents').keydown(function (event) {
        if (event.keyCode === 13) {
            performBuildDirTree();
            dashboardDialogBoxClose('showBuildDirTreeDialog keydown');
        }
    });
    $('#dashboardDialogBox').css("top", "150px");
    $('#dashboardDialogBox').css("left", "250px");
    $('#txtRoot').focus();
}

function performBuildDirTree() {
    let startRoot = $('#txtRoot').val();
    if ((startRoot === "0") || (isNullorUndefined(startRoot)))
        startRoot = $('#selDirTreeRoot').val();
    if ((startRoot === "0") || (isNullorUndefined(startRoot)))
        startRoot = 10326
    buildDirTree(startRoot);
}

// CREATE NEW FOLDER
function showCreateNewFolderDialog() {
    $('#dashboardDialogBoxTitle').html("Create New Folder");
    $('#dashboardDialogContents').html(
        "       <div><span>parent</span><input id='txtCreateFolderParent' class='txtLinkPath inlineInput roundedInput' readonly='readonly'></input></div>\n" +
        "       <div><span>title</span><input id='txtNewFolderTitle' class='inlineInput roundedInput'></input></div>\n" +
        "       <div><span>type</span><select id='ddNewFolderType' class='inlineInput roundedInput'>\n" +
        "              <option value='singleChild'>singleChild</option>\n" +
        "              <option value='singleModel'>singleModel</option>\n" +
        "              <option value='singleParent'>singleParent</option>\n" +
        "              <option value='multiModel'>multiModel</option>\n" +
        "              <option value='multiFolder'>multiFolder</option>\n" +
        "          </select></div>\n" +
        "       <div><span>sort order</span><input id='txtSortOrder' class='inlineInput roundedInput'></input></div>\n" +
        "       <div class='roundendButton' onclick='performCreateNewFolder()'>Create Folder</div>\n");
    $("#txtSortOrder").val("0");

    let cp = $('#txtCurrentActiveFolder').val();
    $("#txtCreateFolderParent").val(cp);
    $("#txtNewFolderTitle").val(cp.substr(cp.lastIndexOf("/") + 1));

    $('#dashboardDialogContents').keydown(function (event) {
        if (event.keyCode === 13) {
            performCreateNewFolder('showCreateNewFolderDialog');
        }
    });

    $('#dashboardDialogBox').css("top", "160px");
    $('#dashboardDialogBox').css("left", "250px");
    $('#dashboardDialogBox').draggable().fadeIn();
}
function performCreateNewFolder() {
    try {

       // if (makeDirectory()) {

            let sStart = Date.now();
            $('#dashBoardLoadingGif').show();
            $('#dataifyInfo').show().html("saving changes");

            let folderPath = $('#txtCurrentActiveFolder').val() + "/" + $('#txtNewFolderTitle').val();

            $.ajax({
                type: "POST",
                url: "php/createNewFolder.php",
                data: {
                    parentId: $('#txtActiveFolderId').val(),
                    folderPath: folderPath,
                    newFolderName: $('#txtNewFolderTitle').val(),
                    folderType: $('#ddNewFolderType').val(),
                    rootfolder: 'archive',
                    sortOrder: $('#txtSortOrder').val()
                },
                success: function (success) {
                    $('#dataifyInfo').html(success);
                    $('#dashBoardLoadingGif').hide();
                    let delta = (Date.now() - sStart);
                    if (delta > 150)
                        $('#dataifyInfo').append("  saving changes took: " + (delta / 1000).toFixed(3));
                },
                error: function (jqXHR) {
                    $('#dashBoardLoadingGif').hide();
                    let errMsg = getXHRErrorDetails(jqXHR);
                    logError("AJX", $('#txtActiveFolderId').val(), errMsg, "create New Folder");
                }
            });
        
    } catch (e) {
        $('#dashBoardLoadingGif').hide();
        logCatch("CreateNewFolder", e);
    }
}

// ADD NEW IMAGES
function showImportDialog() {
    $('#dashboardDialogTitle').html("add new images");
    $('#dashboardDialogContents').html(
        "    <div>parent<span>" + $('#txtActiveFolderId').val()+"</span></div>\n" +
        "    <div><span>select image folder</span><input type='file' /></div>\n" +
        //"    <div><span>create subfolders </span><input type='checkbox' id='ckCreateSubfolders'></input></div>\n" +
        //"    <div class='roundendButton' onclick='importNewImages($(\"#ckRepairIncludeSubfolders\").is(\":checked\"))'>Run</div>\n");
        "    <div class='roundendButton' onclick='importNewImages()'>Run</div>\n");
    $("#txtFolderToRepair").val(pSelectedTreeFolderPath);
    $('#dashboardDialog').fadeIn();
}
function importNewImages() {
    // select Parent folder using dir tree
    // 


}

// PHP DISK OPERATIONS
function showReportsSection() {
    $('.fullScreenSection').hide();
    $('#reportsSection').show();
    setLeftMenu("reports");
    $('#reportsMiddleColumn').css("width", $('#dashboardContainer').width() - $('#reportsLeftColumn').width());
}
function closeDashboardFileList() {
    $(' #dashboardFileListContainer').hide();
}
function showFiles() {
    try {
        let infoStart = Date.now();
        $('#dashboardFileListContainer').show();
        let path = "../../danni/" + $('#txtCurrentActiveFolder').val();
        console.log("path: " + path);
        $.ajax({
            url: "php/getDirectoryFiles.php?path=" + path,
            success: function (data) {
                $('#dashboardFileListContainer').show();
                $('#dashboardFileListHeaderTitle').html($('#txtCurrentActiveFolder').val());
                if (data == "false") {
                    $('#dashboardFileList').html("folder not found: " + path);
                }
                else {
                    if ( isNullorUndefined(data)) {
                        $('#dashboardFileList').html("data: " + data);
                    }
                    else {
                        let dashboardFileListArray = JSON.parse(data);
                        $('#dashboardFileList').html("");
                        $.each(dashboardFileListArray, function (idx, obj) {
                            $('#dashboardFileList').append("<div>" + obj.name + "," + obj.type + "<div>");
                        });
                        let delta = (Date.now() - infoStart) / 1000;
                        console.log("showFiles took: " + delta.toFixed(3));
                    }
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                alert("showFiles AJX: " + errMsg);
            }
        });
    } catch (e) {
        logCatch("showFiles CATCH: ", e);
    }
}

// FOLDER COUNTS
function updateFolderCounts() {
    try {
        let sStart = Date.now();
        $('#dashBoardLoadingGif').show();
        let rootPath = $('#txtCurrentActiveFolder').val().trim();
        $.ajax({
            type: "GET",
            url: "php/getFolderCounts.php?rootId=" + $('#txtActiveFolderId').val() + "&rootPath=" + rootPath,
            success: function (data) {
                $('#dashBoardLoadingGif').hide();
                let returnObject = JSON.parse(data);
                if (returnObject[0] == "ok") {
                    // $returnObject = ['ok', $ChangesMade, $FoldersProcessed, $TestChangesMade];

                    $('#dataifyInfo').html("ok.  folders processed: " + returnObject[1] + "  changes made: " + returnObject[2] + "null changes: " + returnObject[3]).show();
                    let delta = (Date.now() - sStart);
                    if (delta > 150)
                        $('#dataifyInfo').append("  .Took: " + (delta / 1000).toFixed(3));
                }
                else {
                    alert("get folder counts AJX: " + returnObject);
                }
            },
            error: function (jqXHR) {
                $('#dashBoardLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                alert("get folder counts XHR: " + errMsg);
                logError("XHR", $('#txtActiveFolderId').val(), errMsg, "get folder counts");
            }
        });
    } catch (e) {
        $('#dashBoardLoadingGif').hide();
        logCatch("get folder counts", e);
    }
}

// REPAIR FUNCTIONS
{
    let recurr, addNew, startTime, physcialFilesProcessed, imageFilesProcessed, imageFilesAdded;
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
        physcialFilesProcessed = 0;
        imageFilesProcessed = 0;
        imageFilesAdded = 0;
        recurr = $("#ckRepairIncludeSubfolders").is(":checked");
        addNew = $("#ckAddNewImages").is(":checked");
        let rootFolderId = $('#txtActiveFolderId').val();
        dashboardDialogBoxClose("addNewImages");
        $('#dashboardFileListContainer').show();
        $('#dashboardFileListHeaderTitle').html("Repair Links");
        $('#dashboardFileList').html("<div id='dcPhyscialFilesProcessed'></div>");
        $('#dashboardFileList').append("<div id='dcImageRowsProcessed'></div>");
        $('#dashboardFileList').append("<div id='dcImageRowsAdded'></div>");
        repairImagesRecurr(rootFolderId, recurr, addNew);
    }

    function repairImagesRecurr(rootFolderId, recurr, addNew) {
        try
        {
            $.ajax({
                url: "php/customQuery.php?query=select p.Id Parent, p.FolderName as ParentName, f.FolderName, f.FolderPath, f.FolderType" +
                    " from CategoryFolder f join CategoryFolder p on p.Id = f.Parent where f.Id = " + rootFolderId,
                success: function (catFolderJson) {
                    if (catFolderJson.indexOf('Error') > -1) {
                        $('#dashboardFileList').append("<div>Error: folder not found: " + fullPath + "</div>");
                        return;
                    }
                    let catFolder = JSON.parse(catFolderJson)[0];
                    let fileNamePrefix = catFolder.FolderName;
                    if (catFolder.FolderType == "singleChild")
                        fileNamePrefix = catFolder.ParentName;

                    let fullPath = "../../danni/" + catFolder.FolderPath;
                    let folderNameShowing = false;
                    $.ajax({
                        url: "php/getOggleFolder.php?path=" + fullPath + "&folderId=" + rootFolderId,
                        success: function (scanDirJson) {
                            if (scanDirJson == "false") {
                                $('#dashboardFileList').append("<div>Error: folder not found: " + fullPath + "</div>");
                                return;
                            }
                            let allDirValues = JSON.parse(scanDirJson);
                            let physcialImageFileRows = allDirValues.filter(node => node.type == "file");
                            let physcialDirectories = allDirValues.filter(node => node.type == "dir");
                            $.ajax({
                                url: "php/customQuery.php?query=select * from ImageFile where FolderId=" + rootFolderId,
                                success: function (imageFileJson) {
                                    let imageFileRows = JSON.parse(imageFileJson);
                                    $.each(physcialImageFileRows, function (idx, objPhyscialimageFileRow) {
                                        let dataTableRow = imageFileRows.filter(imageFile => encodeURI(imageFile.FileName) ==
                                            encodeURI(objPhyscialimageFileRow.name));
                                        if (dataTableRow.length == 0) {
                                            if (!folderNameShowing) {
                                                $('#dashboardFileList').append("<div style='text-decoration:underline'>   " +
                                                    catFolder.FolderName + "   (" + rootFolderId + ")");
                                                folderNameShowing = true;
                                            }
                                            // we have a physcialFile missing a data record
                                            if (addNew) {
                                                renameImageFile(objPhyscialimageFileRow.name, fileNamePrefix, rootFolderId, catFolder.FolderType, fullPath);
                                            }
                                            else {
                                                $('#dashboardFileList').append("<div style='color:blue'>" +
                                                    "Orphan physcial file. Missing ImageFile: " + objPhyscialimageFileRow.name + "</div>");
                                            }
                                        }

                                        $('#dcPhyscialFilesProcessed').html("<div>Physcial Files Processed: " +
                                            (++physcialFilesProcessed).toLocaleString() + "</div>");
                                    });
                                    $.each(imageFileRows, function (idx, objDataTableRow) {
                                        let physcialFileRow = physcialImageFileRows.filter(node => node.name == objDataTableRow.FileName);
                                        if (physcialFileRow.length == 0) {
                                            // we have a data record with no physcial file
                                            if (!folderNameShowing) {
                                                $('#dashboardFileList').append("<div style='text-decoration:underline'>: " +
                                                    "data records with no physcial file. Foder: "+
                                                    catFolder.FolderName + "(" + rootFolderId + ")");
                                                folderNameShowing = true;
                                            }
                                            $('#dashboardFileList').append("<div>Orphan ImageFile row: " + objDataTableRow.FileName + "</div>");
                                        }

                                        $('#dcImageRowsProcessed').html("<div>Image Files Processed: " +
                                            (++imageFilesProcessed).toLocaleString() + "</div>");
                                    });
                                    if (recurr) {
                                        $.each(physcialDirectories, function (idx, obj) {
                                            repairImagesRecurr(obj.folderId, recurr, addNew)
                                        });
                                    }
                                },
                                error: function (jqXHR) {
                                    $('#dashBoardLoadingGif').hide();
                                    let errMsg = getXHRErrorDetails(jqXHR);
                                    alert("addnew / get DirectoryFiles AJX: " + errMsg);
                                }
                            });
                        },
                        error: function (jqXHR) {
                            $('#dashBoardLoadingGif').hide();
                            let errMsg = getXHRErrorDetails(jqXHR);
                            alert("addnew/get DirectoryFiles XHR: " + errMsg);
                        }
                    });
                },
                error: function (jqXHR) {
                    $('#dashBoardLoadingGif').hide();
                    let errMsg = getXHRErrorDetails(jqXHR);
                    alert("catFolderJson XHR: " + errMsg);
                }
            });
        } catch (e) {
            $('#dashBoardLoadingGif').hide();
            logCatch("RepairLinks CAT", e);
        }
    }

    function isUUId(guidPart) {
        return true;
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
                        $('#dashboardFileList').append("<div>Physcial File Renamed: from: " + physcialimageFileName +
                            " to: " + newFileName + "</div>");
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
        //let guidId = fileName.substr(fileName.indexOf("_") + 1, 36);
        //let guidId = fileName.substr(fileName.indexOf("_") + 1, 36);
        //let guidId = fileName.substr(fileName.indexOf("_") + 1, 36);

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
                    $('#dashboardFileList').append("<div style='color:blue'>image file added: (" + folderId + ")  " + fileName + "</div>");

                    $('#dcImageRowsAdded').html("<div>Image Files Added: " +
                        (++imageFilesAdded).toLocaleString() + "</div>");
                }
                else {
                    console.log(addImageFileSuccess);
                    $('#dashboardFileList').append("<div style='color:red'>add image file error: " + addImageFileSuccess + "</div>");
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                $('#dashboardFileList').append("<div style='color:red'>add image file XHR error: " + errMsg + "</div>");
            }
        });
    }

    function removeImageFile(folderId, fileName) {
    }
    function checkForOrphanCatLinkRecords() {
    }
    function reportRepairResults(repairReport) {
        try {

            $('#dashboardFileListContainer').show();

            $('#dashboardFileListHeaderTitle').html("repair report");

            if (repairReport.ErrorArray.length > 0) {
                $('#dashboardFileList').append("<div>Errors: " + repairReport.ErrorArray.length + "</div><div>");
                $.each(repairReport.ErrorArray, function (idx, obj) {
                    $('#dashboardFileList').append("<div>" + obj + "</div>");
                })
                $('#dashboardFileList').append("</div>");
            }
            $('#dashboardFileList').html("<div>Physcial Files Processed : " + repairReport.PhyscialFilesProcessed + "</div>");
            if (repairReport.OrphanImageArray.length > 0) {
                $('#dashboardFileList').append("<div>Orphan Image Files : " + repairReport.OrphanImageArray.length + "</div><div>");
                $.each(repairReport.OrphanImageArray, function (idx, obj) {
                    $('#dashboardFileList').append("<div>" + obj + "</div>");
                })
                $('#dashboardFileList').append("</div>");
            }
            $('#dashboardFileList').append("<div>Image Files Processed: " + repairReport.ImageFilesProcessed.toLocaleString() + "</div>");
            if (repairReport.OrphanImageFileArray.length > 0) {
                $('#dashboardFileList').append("<div>Orphan Image File Rows: " + repairReport.OrphanImageFileArray.length + "</div><div>");
                $.each(repairReport.OrphanImageFileArray, function (idx, obj) {
                    $('#dashboardFileList').append("<div>" + obj + "</div>");
                })
                $('#dashboardFileList').append("</div>");
            }
            
            //if (repairReport.ImageFileRowsAddedArray.length > 0) {
            //    $('#dashboardFileList').append("<div>Image Files Added: " + repairReport.ImageFileRowsAddedArray.length + "</div><div>");
            //    $.each(ImageFileRowsAddedArray.ErrorArray, function (idx, obj) {
            //        $('#dashboardFileList').append("<div>" + obj + "</div>");
            //    });
            //    $('#dashboardFileList').append("</div>");
            //}


            //$('#dataifyInfo').append(", Links: " + repairReport.LinkRecordsProcessed);
            //$('#dataifyInfo').append(", Image rows: " + repairReport.ImageFilesProcessed);

            if (repairReport.LinksEdited > 0)
                $('#dashboardFileList').append(", links Edited: " + repairReport.LinksEdited);
            if (repairReport.ImageFilesAdded > 0)
                $('#dashboardFileList').append(", ImageFilesAdded: " + repairReport.ImagesRenamed);
            if (repairReport.PhyscialFileRenamed > 0)
                $('#dashboardFileList').append(", Physcial File Names Renamed: " + repairReport.PhyscialFileRenamed);
            if (repairReport.ImageFilesRenamed > 0)
                $('#dashboardFileList').append(", Image File Names Renamed: " + repairReport.ImageFilesRenamed);
            if (repairReport.ImagesRenamed > 0)
                $('#dashboardFileList').append(", Image Files Renamed: " + repairReport.ImagesRenamed);
            if (repairReport.ZeroLenFileResized > 0)
                $('#dashboardFileList').append(", ZeroLen File Resized: " + repairReport.ZeroLenFileResized);
            if (repairReport.ImageFilesMoved > 0)
                $('#dashboardFileList').append(", Images Moved: " + repairReport.ImageFilesMoved);
            if (repairReport.CatLinksRemoved > 0)
                $('#dashboardFileList').append(", Links Removed: " + repairReport.CatLinksRemoved);
            if (repairReport.CatLinksAdded > 0)
                $('#dashboardFileList').append(", CatLinks Added: " + repairReport.CatLinksAdded);
            if (repairReport.ImageFilesAdded > 0)
                $('#dashboardFileList').append(", ImageFiles Added: " + repairReport.ImageFilesAdded);
            if (repairReport.ImagesDownLoaded > 0)
                $('#dashboardFileList').append(", ImageFiles ImagesDownLoaded: " + repairReport.ImagesDownLoaded);
            if (repairReport.ImageFilesRemoved > 0)
                $('#dashboardFileList').append(", ImageFiles Removed: " + repairReport.ImageFilesRemoved);
            if (repairReport.ZeroLenImageFilesRemoved > 0)
                $('#dashboardFileList').append("<div>ZeroLen ImageFiles Removed: " + repairReport.ZeroLenImageFilesRemoved + "</div>");


            let delta = Date.now() - startTime;
            let minutes = Math.floor(delta / 60000);
            let seconds = (delta % 60000 / 1000).toFixed(0);
            $('#dashboardFileList').append("<br/><div>repair links took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds + "</div>");
        }
        catch (e) {
            alert("problem displaying repair report: " + e);
        }
    }
}
// MOVE MANY
{
    let mmSourceFolderId, mmSelectedTreeFolderPath;
    function showMoveManyTool(cx) {
        if (isNullorUndefined($('#txtCurrentActiveFolder').val())) {
            alert("select a folder");
            return;
        }
        if (cx == 1) {
            $('#moveManyTitle').html("Move Many");
            $('#moveManyButton').html("Move");
        }
        if (cx == 2) {
            $('#moveManyTitle').html("Copy Many");
            $('#moveManyButton').html("Copy");
        }
        if (cx == 3) {
            $('#moveManyTitle').html("Archive Many");
            $('#moveManyButton').html("Archive");
        }
        mmSourceFolderId = $('#txtActiveFolderId').val();
        mmSelectedTreeFolderPath = $('#txtCurrentActiveFolder').val();
        $('.fullScreenSection').hide();
        $('#moveManySection').show();
        $('#txtMoveManySource').val(mmSelectedTreeFolderPath);
        $('#moveManyImageArea').css("height", $('#dashboardContainer').height() - $('#moveManyHeader').height());
        //activeDirTree = "moveMany";
        //loadDirectoryTree(1, "mmDirTreeContainer", true);
        //showHtmlDirTree("mmDirTreeContainer");
        loadMMcheckboxes();
    }
    function loadMMcheckboxes() {
        $('#dashBoardLoadingGif').fadeIn();
        let imgRepo = settingsArray.ImageRepo;
        $.ajax({
            type: "GET",

            //db.VwLinks.Where(l => (l.FolderId == folderId) && (l.FolderId == l.SrcId)).OrderBy(l => l.SortOrder).ToList();
            url: "php/customQuery?query=select * from VwLinks where FolderId=" + $('#txtActiveFolderId').val(),
            success: function (imgLinks) {
                $('#dashBoardLoadingGif').hide();
                if (imgLinks != "error") {
                    $('#moveManyImageArea').html("");
                    let jLinks = JSON.parse(imgLinks)
                    $.each(jLinks, function (ndx, obj) {
                        $('#moveManyImageArea').append("<div class='sortBox'><img class='sortBoxImage' src='" + imgRepo + "/" + obj.FileName + "'/>" +
                            "<br/><input type='checkbox' class='loadManyCheckbox' imageId=" + obj.LinkId + "></input></div>");
                    });
                    $('#moveManyCountContainer').html(imgLinks.Links.length.toLocaleString());
                }
                else { logError("AJX", mmSourceFolderId, imgLinks.Success, "getDeepFolderCounts"); }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, mmSourceFolderId, "loadMMcheckboxes")) logError("XHR", mmSourceFolderId, errMsg, "loadMMcheckboxes");
            }
        });
    }

    function mmSelectAll() {
        if ($('#mmCkSelectAll').is(":checked"))
            $('.loadManyCheckbox').prop("checked", true);
        else
            $('.loadManyCheckbox').prop("checked", false);
    }
    function moveCheckedImages() {
        if (mmSourceFolderId == pSelectedTreeId) {
            alert("select a destination");
            return;
        }
        var checkedImages = [];
        $('#moveManyImageArea').children().each(function (ndx, obj) {
            if ($(this).find("input").is(":checked")) {
                checkedImages.push($(this).find("input").attr("imageId"));
            }
        });

        let mmContext;
        if ($('#moveManyTitle').html() == "Move Many")
            mmContext = "move";
        if ($('#moveManyTitle').html() == "Copy Many")
            mmContext = "copy";
        if ($('#moveManyTitle').html() == "Archive Many")
            mmContext = "archive";

        //let lblMoveManyDestination = $('#txtMoveManyDestination').val().replace(".OGGLEBOOBLE.COM", "").replace("/Root/", "").replace(/%20/g, " ");
        let lblMoveManyDestination = $('#txtMoveManyDestination').val().replace(/%20/g, " ");
        if (confirm(mmContext + " " + checkedImages.length + " images to " + lblMoveManyDestination)) {
            let moveManyModel = {
                Context: mmContext,
                SourceFolderId: mmSourceFolderId,
                DestinationFolderId: pSelectedTreeId,
                ImageLinkIds: checkedImages
            };
            $('#dashBoardLoadingGif').fadeIn();
            try {
                $.ajax({
                    type: "PUT",
                    url: settingsArray.ApiServer + "api/Links/MoveMany",
                    data: moveManyModel,
                    success: function (success) {
                        //$('#dashBoardLoadingGif').hide();
                        //if (success === "ok") {

                        //string ftpRepo = imgRepo.Substring(7);
                        //var dbDestFolder = db.CategoryFolders.Where(i => i.Id == moveManyModel.DestinationFolderId).First();
                        //string destFtpPath = ftpHost + ftpRepo + "/" + dbDestFolder.FolderPath;

                        //if (!FtpUtilies.DirectoryExists(destFtpPath))
                        //    FtpUtilies.CreateDirectory(destFtpPath);

                        //var dbSourceFolder = db.CategoryFolders.Where(f => f.Id == moveManyModel.SourceFolderId).First();
                        //string sourceFtpPath = ftpHost + ftpRepo + "/" + dbSourceFolder.FolderPath;

                        //ImageFile dbImageFile = null;
                        //string oldFileName;
                        //string newFileName;
                        //string linkId;
                        //int sortOrder;
                        //        for (int i = 0; i < moveManyModel.ImageLinkIds.Length; i++)
                        //        {
                        //            linkId = moveManyModel.ImageLinkIds[i];
                        //            if (moveManyModel.Context == "copy") //only
                        //            {
                        //                db.CategoryImageLinks.Add(new MySqlDataContext.CategoryImageLink()
                        //                    {
                        //                        ImageCategoryId = dbDestFolder.Id,
                        //                        ImageLinkId = linkId,
                        //                        SortOrder = 9876
                        //                    });
                        //                db.SaveChanges();
                        //            }
                        //            else {
                        //                dbImageFile = db.ImageFiles.Where(f => f.Id == linkId).First();
                        //                oldFileName = dbImageFile.FileName;
                        //                string ext = dbImageFile.FileName.Substring(dbImageFile.FileName.LastIndexOf("."));

                        //                if (dbDestFolder.FolderType == "singleChild") {
                        //                    var destinationParent = db.CategoryFolders.Where(f => f.Id == dbDestFolder.Parent).First();
                        //                    newFileName = destinationParent.FolderName + "_" + linkId + ext;
                        //                }
                        //                else
                        //                    newFileName = dbDestFolder.FolderName + "_" + linkId + ext;

                        //                if (dbDestFolder.Parent == dbSourceFolder.Id)
                        //                    newFileName = oldFileName;

                        //                success = FtpUtilies.MoveFile(sourceFtpPath + "/" + oldFileName, destFtpPath + "/" + newFileName);
                        //                if (success == "ok") {
                        //                    dbImageFile.FolderId = moveManyModel.DestinationFolderId;
                        //                    dbImageFile.FileName = newFileName;
                        //                    db.SaveChanges();

                        //                    var oldLink = db.CategoryImageLinks.Where(l => l.ImageCategoryId == dbSourceFolder.Id && l.ImageLinkId == linkId).First();
                        //                    sortOrder = oldLink.SortOrder;
                        //                    if (moveManyModel.Context == "move") {
                        //                        db.CategoryImageLinks.Remove(oldLink);
                        //                        db.SaveChanges();
                        //                    }

                        //                    db.CategoryImageLinks.Add(new CategoryImageLink()
                        //                        {
                        //                            ImageCategoryId = dbDestFolder.Id,
                        //                            ImageLinkId = linkId,
                        //                            SortOrder = sortOrder
                        //                        });
                        //                    db.SaveChanges();
                        //                    // SIGNAR
                        //                }
                        //                else
                        //                    return success;
                        //            }
                        //        }
                        //        db.SaveChanges();
                        //        success = "ok";
                    }
                });
            }
            catch (ex) {
                success += Helpers.ErrorDetails(ex);
            }
        }
    }
}
// SORT FUNCTIONS
{
    let sortOrderArray = [];
    function showSortTool() {
        if (isNullorUndefined($('#txtActiveFolderId').val())) {
            alert("select a folder");
            return;
        }
        $('.fullScreenSection').hide();
        $('#dashboardTopRow').hide();
        $('#dirTreeContainer').hide();
        $('#sortToolSection').show();
        resizeDashboardPage();
        $('#sortTableHeader').html(pSelectedTreeFolderPath.replace(".OGGLEBOOBLE.COM", "").replace("/Root/", "").replace(/%20/g, " ")
            + "(" + $('#txtActiveFolderId').val() + ")");
        $('#dashBoardLoadingGif').fadeIn();
        var daInfoMessage = $('#dataifyInfo').html();
        $('#dataifyInfo').append("loading sorted images");

        //imgLinks.Links = db.VwLinks.Where(l => l.FolderId == folderId).OrderBy(l => l.SortOrder).ToList();
        $.ajax({
            url: "php/customQuery.php?query=select * from VwLinks where FolderId=" + $('#txtActiveFolderId').val() + " order by SortOrder",
            success: function (imgLinks) {
                $('#dashBoardLoadingGif').hide();
                if (imgLinks.indexOf("error") > -1)
                    $('#sortToolImageArea').html(imgLinks);
                else {
                    $('#sortToolImageArea').html("");
                    let links = JSON.parse(imgLinks);
                    sortOrderArray = [];
                    $.each(links, function (ndx, obj) {
                        $('#sortToolImageArea').append("<div class='sortBox'><img class='sortBoxImage' src='" +
                            settingsImgRepo + obj.FileName + "'/>" +
                            "<br/><input class='sortBoxInput' id=" + obj.LinkId + " value=" + obj.SortOrder + "></input></div>");
                        sortOrderArray.push({
                            FolderId: $('#txtActiveFolderId').val(),
                            ItemId: obj.LinkId,
                            ImageSrc: settingsImgRepo + obj.FileName,
                            SortOrder: obj.SortOrder
                        });
                    });
                    $('#dashBoardLoadingGif').hide();
                    $('#dataifyInfo').html(daInfoMessage + " done");
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                logError("AJX", $('#txtActiveFolderId').val(), errMsg, "showSortTool");
            }
        });
    }

    function updateSortOrder() {
        $('#dashBoardLoadingGif').show();
        $('#dataifyInfo').show().html("sorting array");
        sortOrderArray = [];
        $('#sortToolImageArea').children().each(function () {
            sortOrderArray.push({
                FolderId: $('#txtActiveFolderId').val(),
                ItemId: $(this).find("input").attr("id"),
                ImageSrc: $(this).find("img").attr("src"),
                SortOrder: $(this).find("input").val()
            });
        });
        sortOrderArray = sortOrderArray.sort(SortImageArray);
        reloadSortTool();
        //saveSortChanges(sortOrderArray, "sort");
    }

    function SortImageArray(a, b) {
        var aSortOrder = Number(a.SortOrder);
        var bSortOrder = Number(b.SortOrder);
        return ((aSortOrder < bSortOrder) ? -1 : ((aSortOrder > bSortOrder) ? 1 : 0));
    }

    function autoIncrimentSortOrder() {
        //if (confirm("reset all sort orders")) {
        $('#dashBoardLoadingGif').show();
        $('#dataifyInfo').show().html("auto incrimenting array");
        sortOrderArray = [];
        let autoI = 0;
        $('#sortToolImageArea').children().each(function () {
            sortOrderArray.push({
                FolderId: $('#txtActiveFolderId').val(),
                ItemId: $(this).find("input").attr("id"),
                ImageSrc: $(this).find("img").attr("src"),
                SortOrder: autoI += 2
            });
        });
        reloadSortTool();
        //saveSortChanges(sortOrderArray, "incrimenting");
        //}
    }

    function reloadSortTool() {
        $('#sortToolImageArea').html("");
        $.each(sortOrderArray, function (idx, obj) {
            $('#sortToolImageArea').append("<div class='sortBox'><img class='sortBoxImage' src='" + obj.ImageSrc + "'/>" +
                "<br/><input class='sortBoxInput' id=" + obj.ItemId + " value=" + obj.SortOrder + "></input></div>");
        });
        $('#dashBoardLoadingGif').hide();
        $('#dataifyInfo').hide();
    }
    // 2 22 2022
    function saveSortOrder() {
        try {
            $('#dashBoardLoadingGif').show();
            $('#dataifyInfo').show().html("saving changes");
            let sStart = Date.now();

            $.ajax({
                type: "POST",
                url: "php/saveSortChanges.php",
                data: { 'sortOrderArray': JSON.stringify(sortOrderArray) },
                cache: false,
                success: function (success) {
                    $('#dataifyInfo').html(success);
                    $('#dashBoardLoadingGif').hide();
                    let delta = (Date.now() - sStart);
                    if (delta < 150)
                        $('#dataifyInfo').hide();
                    else {
                        $('#dataifyInfo').html("saving changes took: " + (delta / 1000).toFixed(3));
                        $('#dataifyInfo').html(success);
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    logError("AJX", $('#txtActiveFolderId').val(), errMsg, "showSortTool");
                }
            });
        } catch (e) {
            logCatch("saveSortOrder", e);
        }
    }
}

function showDefaultWorkArea() {
    $('.fullScreenSection').hide();
    $('#dashboardTopRow').show();
    $('#dirTreeContainer').show();
}

function dashboardDialogBoxClose(calledFrom) {
    //alert("dashboard DialogBox Close. calledFrom: " + calledFrom)
    $('#dashboardDialogBox').hide();
    $('#dashboardDialogContents').off();
}

function sqlSandbox() {
    $('.fullScreenSection').hide();
    $('#sqlSandboxSection').show();
}

function throwAnError() {
    logError("TST", 11, "test error", "oggle dashboard");
    //logLocalError("TST", 11, "test error", "oggle dashboard");
}

function logLocalError(errorCode, folderId, errorMessage, calledFrom) {

    let visitorId = "xxx"; // getCookieValue("VisitorId", calledFrom + "/logError");
    $.ajax({
        type: "POST",
        url: "php/addErrorLog.php",
        data: {
            ErrorCode: errorCode,
            FolderId: folderId,
            VisitorId: visitorId,
            CalledFrom: calledFrom,
            ErrorMessage: errorMessage
        },
        success: function (success) {
            if (success == "!ok") {
                console.log(success);
                $('#rightSideWorkarea').append("<div style='color:red'>add image file error: " + success + "</div>");
            }
            else
                $('#dataifyInfo').show().html(success);

        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            alert("Error log error: " + errMsg);
        }
    });
}

function testConnection() {
    alert("url: php/validateHITConnection.php")
    $.ajax({    //create an ajax request to display.php
        type: "GET",
        url: "php/validateHITConnection.php",
        dataType: "html",   //expect html to be returned                
        success: function (response) {
            $("#dashboardContainer").html(response);
            console.log(response);
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            alert("validateConnection: " + errMsg);
            //if (!checkFor404(errMsg, folderId, "chargeCredits")) logError("XHR", folderId, errMsg, "chargeCredits");
        }
    });
}
function testGetCatFolder() {
    $.ajax({
        type: "GET",
        url: "php/customQuery.php?query=select * from CategoryFolder where Id = 411",
        dataType: "html",
        success: function (response) {
            $("#outputArea").html(response);
        }
    });
}
function makeDirectoryTest() {
    try {

        let folderPath = $('#txtCurrentActiveFolder').val() + "/" + $('#txtNewFolderTitle').val();

        $.ajax({
            type: "GET",
            url: "php/makeDirectory.php?folderPath=" + folderPath,
            success: function (success) {

                $('#dataifyInfo').html(success);
                $('#dashBoardLoadingGif').hide();
                return true;
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);

                alert("make directory: " + errMsg);

                logError("AJX", $('#txtActiveFolderId').val(), errMsg, "make Directory");

                return false;
            }
        });
    } catch (e) {
        $('#dashBoardLoadingGif').hide();
        logCatch("make Directory", e);
        return false;
    }
}
function folderCountTest() {
    try {
        let folderId = $('#txtActiveFolderId').val();
        let path = "../../danni/" + $('#txtCurrentActiveFolder').val();
        $.ajax({
            type: "GET",
            url: "php/updateFolderCount.php?folderId=" + folderId + "&path=" + path,
            success: function (success) {
                if (success.trim().startsWith("ok")) {
                    $('#dataifyInfo').show().html("Folder Count for " + $('#txtCurrentActiveFolder').val() + " updated to: " + success);
                    displayStatusMessage("ok", "Folder Count for " + $('#txtCurrentActiveFolder').val() + " updated to: " + success);
                }
                else {
                    logError("AJX", folderId, success, "update Folder Count");
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                alert("update Folder Count: " + errMsg);
            }
        });
    } catch (e) {
        logCatch("update Folder Count", e);
    }
}
