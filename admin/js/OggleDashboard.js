﻿// let settingsImgRepo = 'https://img.brucheum.com/';
// let settingsImgRepo = 'st21569.ispot.cc/danni/';
let settingsImgRepo = 'https://ogglefiles.com/danni/';
// let filePath = "/home/st21569/domains/ogglefiles.com/public_html/danni/";
let filePath = "danni/";


function showReportsSection() {
    $('.fullScreenSection').hide();
    $('#reportsSection').show();
    setLeftMenu("reports");
    $('#reportsMiddleColumn').css("width", $('#dashboardContainer').width() - $('#reportsLeftColumn').width());
}

// LOAD DIR TREE
function getDashboardStartRoot() {
    $('#serverFileList').hide();
    $('#floatingDialogBoxTitle').html("Build Dir Tree");
    $('#floatingDialogContents').html(
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
        "    <div class='roundendButton' tabindex='0' onclick='performBuildDirTree()')'>Go</div>");
    $('#floatingDialogBox').draggable().fadeIn();
    $('#floatingDialogContents').keydown(function (event) {
        if (event.keyCode === 13) {
            performBuildDirTree();
        }
    });
    $('#floatingDialogBox').css("top", "150px");
    $('#floatingDialogBox').css("left", "250px");
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
    $('#dashboardDialogTitle').html("Create New Folder");
    $('#dashboardDialogContents').html(
        //"       <div></div>\n" +
        "       <div><span>parent</span><input id='txtCreateFolderParent' class='txtLinkPath inlineInput roundedInput' readonly='readonly'></input></div>\n" +
        "       <div><span>title</span><input id='txtNewFolderTitle' class='inlineInput roundedInput'></input></div>\n" +
        "       <div><span>type</span><select id='ddNewFolderType' class='inlineInput roundedInput'>\n" +
        "              <option value='singleChild'>singleChild</option>\n" +
        "              <option value='singleModel'>singleModel</option>\n" +
        "              <option value='singleParent'>singleParent</option>\n" +
        "              <option value='multiModel'>multiModel</option>\n" +
        "              <option value='multiFolder'>multiFolder</option>\n" +
        "          </select></div>\n" +
        "       <div class='roundendButton' onclick='performCreateNewFolder()'>Create Folder</div>\n");
    $('#txtNewFolderTitle').keydown(function (event) {
        if (event.keyCode === 13) {
            //alert("keydown 13");
            performCreateNewFolder();
        }
    });
    $("#txtCreateFolderParent").val(pSelectedTreeFolderPath);
    $('#dashboardDialog').fadeIn();
}
function performCreateNewFolder() {
    $('#dashBoardLoadingGif').fadeIn();
    var newFolder = {};
    newFolder.FolderName = $('#txtNewFolderTitle').val();
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "/api/CatFolder/Create?parentId=" + $('#txtActiveFolderId').val() +
            "&newFolderName=" + $('#txtNewFolderTitle').val() + "&folderType=" + $('#ddNewFolderType').val(),
        success: function (successModel) {
            $('#dashBoardLoadingGif').hide();
            if (successModel.Success === "ok") {
                displayStatusMessage("ok", "new folder " + $('#txtNewFolderTitle').val() + " created");
                logDataActivity({
                    VisitorId: getCookieValue("VisitorId", "perform CreateNewFolder"),
                    ActivityCode: "NFC",
                    PageId: successModel.ReturnValue,
                    Details: $('#txtNewFolderTitle').val()
                });
                $('#txtNewFolderTitle').val('');
                //$('#createNewFolderDialog').dialog('close');
            }
            else
                alert("CreateNewFolder: " + successModel.Success);
        },
        error: function (xhr) {
            $('#dashBoardLoadingGif').hide();
            alert("createNewFolder xhr error: " + getXHRErrorDetails(xhr));
        }
    });
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
function showFiles() {
    try {
        let infoStart = Date.now();
        let path = "../../danni/" + $('#txtCurrentActiveFolder').val();
        console.log("path: " + path);
        $.ajax({
            //url: 'php/getDirectoryFiles.php?path=' + pathTest + $('#txtCurrentActiveFolder').val(),
            url: "php/getDirectoryFiles.php?path=" + path,
            success: function (data) {
                $('#serverFileListContainer').show();
                $('#serverFileListHeaderTitle').html($('#txtCurrentActiveFolder').val());
                if (data == "false") {
                    $('#serverFileList').html("folder not found: " + path);
                }
                else {
                    if ( isNullorUndefined(data)) {
                        $('#serverFileList').html("data: " + data);
                    }
                    else {
                        let serverFileListArray = JSON.parse(data);
                        $('#serverFileList').html("");
                        $.each(serverFileListArray, function (idx, obj) {
                            $('#serverFileList').append("<div>" + obj + "<div>");
                        });
                        let delta = (Date.now() - infoStart) / 1000;
                        console.log("showFiles took: " + delta.toFixed(3));
                    }
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                alert("showFiles: " + errMsg);
            }
        });
    } catch (e) {
        logCatch("showFiles", e);
    }
}

// REPAIR FUNCTIONS
function showRepairDialog() {
    $('#floatingDialogBoxTitle').html("Repair Links");
    $('#floatingDialogContents').html(
        "    <div><span>folder to repair</span><input id='txtFolderToRepair' readonly='readonly' class='roundedInput'></input></div>\n" +
        "    <div><span>include all subfolders </span><input type='checkbox' id='ckRepairIncludeSubfolders'></input></div>\n" +
        "    <div><span>remove orphan ImageFiles </span><input type='checkbox' id='ckRemoveOrphans'></input></div>\n" +
        "    <div class='roundendButton' onclick='performRepairLinks($(\"#ckRepairIncludeSubfolders\").is(\":checked\"))'>Run</div>\n");

    $('#txtFolderToRepair').val($('#txtCurrentActiveFolder').val());
    $('#floatingDialogBoxTitle').fadeIn();
    $('#floatingDialogContents').keydown(function (event) {
        if (event.keyCode === 13) {
            performRepairLinks($("#ckRepairIncludeSubfolders").is(":checked"));
        }
    });
    $('#floatingDialogBox').css("top", "160px");
    $('#floatingDialogBox').css("left", "250px");
    $('#floatingDialogBox').draggable().fadeIn();
}

let repairReport = {};
let startTime;
function performRepairLinks(justOne) {
    startTime = Date.now();
    $('#dataifyInfo').show().html("checking and repairing links");
    //$('#dashBoardLoadingGif').fadeIn();
    repairReport = {
        OrphanImageArray: [],
        OrphanImageFileArray: [],
        PhyscialFilesProcessed: 0,
        ImageFilesProcessed: 0
    };
    repairReport.OrphanImageFiles = [];

    $('#serverFileList').show()
        .keydown(function (event) {
        if (event.keyCode === 27) {
            closeDashboardFileList();
        }
    });

    checkForOrphanImageFileRecords($('#txtCurrentActiveFolder').val(), $('#txtActiveFolderId').val(), justOne);
}

function checkForOrphanImageFileRecords(startFolderPath, startFolderId, recurr) {
    try {
        let path = "../../danni/" + startFolderPath;
        console.log("path: " + path);
        $.ajax({
            url: "php/getDirectoryFiles.php?path=" + path,
            success: function (data) {
                if (data.indexOf('Error') > -1) {
                    $('#serverFileList').html(data);
                }
                else {
                    if (data == "false") {
                        $('#serverFileList').html("folder not found: " + path);
                    }
                    else {
                        if (isNullorUndefined(data)) {
                            $('#serverFileList').html("data: " + data);
                        }
                        else {
                            let objServerFiles = JSON.parse(data);

                            let serverFileCount = Object.keys(objServerFiles).length;

                            $.ajax({
                                url: "php/getImageFiles.php?folderId=" + startFolderId,
                                success: function (data) {
                                    let imageFileRows = JSON.parse(data);

                                    console.log("imageFiles.count(" + imageFileRows.length + ") , serverFileListArray.count(" + serverFileCount + ")");
                                    if (imageFileRows.length < serverFileCount) {
                                        console.log("more physcial files than ImageFile rows");
                                    }

                                    $.each(imageFileRows, function (idx, imageFileRow) {
                                        // let physcialFile = objServerFiles.filter(node => node == imageFileRow.FileName);
                                        let found = false;
                                        let dotAdjustment = 2;
                                        for (i = dotAdjustment; i < serverFileCount + dotAdjustment; i++) {
                                            if (imageFileRow.FileName == objServerFiles[i]) {
                                                found = true;
                                                break;
                                            }
                                        }
                                        if (!found) {
                                            // delete this physcial ImageFile
                                            repairReport.OrphanImageArray.push("<input style='width:500px' value=" + encodeURI(imageFileRow.FileName) + " />");
                                        }
                                        repairReport.PhyscialFilesProcessed++;
                                    });

                                    $.each(objServerFiles, function (idx, objServerFile) {
                                        let imageFileRow = imageFileRows.filter(node => node.FileName == objServerFile);
                                        if (imageFileRow == null) {
                                            // delete this ImageFileRow
                                            repairReport.OrphanImageFileArray.push("<input value=" + objServerFile + " />");
                                        }
                                        repairReport.ImageFilesProcessed++;
                                    });

                                    $('#dashBoardLoadingGif').hide();
                                    reportRepairResults(repairReport);
                                },
                                error: function (jqXHR) {
                                    $('#dashBoardLoadingGif').hide();
                                    let errMsg = getXHRErrorDetails(jqXHR);
                                    alert("RepairLinks/getImageFiles AJX: " + errMsg);
                                }
                            });
                        }
                    }

                    if (recurr) {

                        //foreach(str)
                        //checkForOrphanImageFileRecords(startFolderPath, startFolderId, recurr)

                    }
                }

            },
            error: function (jqXHR) {
                $('#dashBoardLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                alert("RepairLinks/getDirectoryFiles AJX: " + errMsg);
            }
        });
    } catch (e) {
        $('#dashBoardLoadingGif').hide();
        logCatch("RepairLinks CAT", e);
    }

}

function checkForOrphanCatLinkRecords() {

}

function reportRepairResults(repairReport) {
    try {

        $('#serverFileList').show();
        $('#floatingDialogBox').hide();

        $('#serverFileListHeaderTitle').html("repair report");

        $('#serverFileList').html("<div>Physcial Files Processed : " + repairReport.PhyscialFilesProcessed + "</div>");
        $('#serverFileList').html("<div>Orphan Image Files : " + repairReport.OrphanImageArray.length + "</div>");
        if (repairReport.OrphanImageArray.length > 0) {
            $('#serverFileList').append("<div>Orphan Image Files</div><div>");
            $.each(repairReport.OrphanImageArray, function (idx, obj) {
                $('#serverFileList').append("<div>" + obj + "</div>");
            })
            $('#serverFileList').append("</div>");
        }
        $('#serverFileList').append("<div>Image Files Processed: " + repairReport.ImageFilesProcessed + "</div>");
        $('#serverFileList').append("<div>Orphan Image File Rows: " + repairReport.OrphanImageFileArray.length + "</div>");
        if (repairReport.OrphanImageFileArray.length > 0) {
            $('#serverFileList').append("<div>Orphan Image File Rows</div><div>");
            $.each(repairReport.OrphanImageFileArray, function (idx, obj) {
                $('#serverFileList').append("<div>" + obj + "</div>");
            })
            $('#serverFileList').append("</div>");
        }

        //$('#dataifyInfo').append(", Links: " + repairReport.LinkRecordsProcessed);
        //$('#dataifyInfo').append(", Image rows: " + repairReport.ImageFilesProcessed);

        //if (repairReport.Errors.length > 0) {
        //    $('#repairErrorReport').show().html("");
        //    $.each(repairReport.Errors, function (idx, obj) {
        //        $('#repairErrorReport').append("<div>" + obj + "</div>");
        //    })
        //}

        //$('#dataifyInfo').append(", Errors: " + repairReport.Errors.length);
        //if (repairReport.LinksEdited > 0)
        //    $('#dataifyInfo').append(", links Edited: " + repairReport.LinksEdited);
        //if (repairReport.ImageFilesAdded > 0)
        //    $('#dataifyInfo').append(", ImageFilesAdded: " + repairReport.ImagesRenamed);
        //if (repairReport.PhyscialFileRenamed > 0)
        //    $('#dataifyInfo').append(", Physcial File Names Renamed: " + repairReport.PhyscialFileRenamed);
        //if (repairReport.ImageFilesRenamed > 0)
        //    $('#dataifyInfo').append(", Image File Names Renamed: " + repairReport.ImageFilesRenamed);
        //if (repairReport.ImagesRenamed > 0)
        //    $('#dataifyInfo').append(", Image Files Renamed: " + repairReport.ImagesRenamed);
        //if (repairReport.ZeroLenFileResized > 0)
        //    $('#dataifyInfo').append(", ZeroLen File Resized: " + repairReport.ZeroLenFileResized);
        //if (repairReport.ImageFilesMoved > 0)
        //    $('#dataifyInfo').append(", Images Moved: " + repairReport.ImageFilesMoved);
        //if (repairReport.CatLinksRemoved > 0)
        //    $('#dataifyInfo').append(", Links Removed: " + repairReport.CatLinksRemoved);
        //if (repairReport.CatLinksAdded > 0)
        //    $('#dataifyInfo').append(", CatLinks Added: " + repairReport.CatLinksAdded);
        //if (repairReport.ImageFilesAdded > 0)
        //    $('#dataifyInfo').append(", ImageFiles Added: " + repairReport.ImageFilesAdded);
        //if (repairReport.ImagesDownLoaded > 0)
        //    $('#dataifyInfo').append(", ImageFiles ImagesDownLoaded: " + repairReport.ImagesDownLoaded);
        //if (repairReport.ImageFilesRemoved > 0)
        //    $('#dataifyInfo').append(", ImageFiles Removed: " + repairReport.ImageFilesRemoved);
        //if (repairReport.ZeroLenImageFilesRemoved > 0)
        //    $('#dataifyInfo').append(", ZeroLen ImageFiles Removed: " + repairReport.ZeroLenImageFilesRemoved);

        let delta = Date.now() - startTime;
        let minutes = Math.floor(delta / 60000);
        let seconds = (delta % 60000 / 1000).toFixed(0);
        //console.log("repair links took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
        //let delta = (Date.now() - startTime) / 1000;
        //console.log("showFiles took: " + delta.toFixed(3));
        $('#serverFileList').append("<div>repair links took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds + "</div>");
    }
    catch (e) {
        alert("problem displaying repair report: " + e);
    }
}

function closeDashboardFileList() {
    $('#serverFileListContainer').hide();
}

function testConnection() {
    alert("url: php/validateConnection.php")
    $.ajax({    //create an ajax request to display.php
        type: "GET",
        url: "php/validateConnection.php",
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

    let whereClause = "where Id=411";

    $.ajax({
        type: "GET",
        url: "php/getCategoryFolders.php?whereClause=" + whereClause,
        dataType: "html",       
        success: function (response) {
            $("#outputArea").html(response);
        }
    });
}