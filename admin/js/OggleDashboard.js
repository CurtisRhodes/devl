﻿// let settingsImgRepo = 'https ://img.brucheum.com/';
// let settingsImgRepo = 'st21569.ispot.cc/danni/';
let settingsImgRepo = 'https://ogglefiles.com/danni/';


// LOAD DIR TREE
function showBuildDirTreeDialog() {
    $('#serverFileListContainer').hide();
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
            dashboardDialogBoxClose('showBuildDirTreeDialog kk');
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
        let sStart = Date.now();
        $('#dashBoardLoadingGif').show();
        $('#dataifyInfo').show().html("saving changes");
        $.ajax({
            url: "php/createNewFolder.php?parentId=" + $('#txtActiveFolderId').val() +
                "&newFolderName=" + $('#txtNewFolderTitle').val() +
                "&folderType=" + $('#ddNewFolderType').val()+
                "&sortOrder=" + $('#txtSortOrder').val(),
            success: function (success) {
                $('#dataifyInfo').html(success);
                $('#dashBoardLoadingGif').hide();
                let delta = (Date.now() - sStart);
                if (delta < 150)
                    $('#dataifyInfo').hide();
                else {
                    $('#dataifyInfo').html(success);
                    $('#dataifyInfo').append("  saving changes took: " + (delta / 1000).toFixed(3));
                }
            },
            error: function (jqXHR) {
                $('#dashBoardLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                logError("AJX", $('#txtActiveFolderId').val(), errMsg, "showSortTool");
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
    $('#serverFileListContainer').hide();
}
function showFiles() {
    try {
        let infoStart = Date.now();
        $('#serverFileListContainer').show();
        let path = "../../danni/" + $('#txtCurrentActiveFolder').val();
        console.log("path: " + path);
        $.ajax({
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
                            $('#serverFileList').append("<div>" + obj.name + "," + obj.type + "<div>");
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

// REPAIR FUNCTIONS
{
    function showRepairDialog() {
        $('#dashboardDialogBoxTitle').html("Repair Links");
        $('#dashboardDialogContents').html(
            "    <div><span>folder to repair</span><input id='txtFolderToRepair' readonly='readonly' class='roundedInput'></input></div>\n" +
            "    <div><span>include all subfolders </span><input type='checkbox' id='ckRepairIncludeSubfolders'></input></div>\n" +
            "    <div><span>remove orphan ImageFiles </span><input type='checkbox' id='ckRemoveOrphans'></input></div>\n" +
            "    <div class='roundendButton'onclick = 'performRepairLinks($(\"#ckRepairIncludeSubfolders\").is(\":checked\"),\"#ckRemoveOrphans\").is(\":checked\")' > Run</div >\n");

        $('#txtFolderToRepair').val($('#txtCurrentActiveFolder').val());
        $('#dashboardDialogBoxTitle').fadeIn();
        $('#dashboardDialogContents').keydown(function (event) {
            if (event.keyCode === 13) {
                performRepairLinks($("#ckRepairIncludeSubfolders").is(":checked"));
            }
        });
        $('#dashboardDialogBox').css("top", "160px");
        $('#dashboardDialogBox').css("left", "250px");
        $('#dashboardDialogBox').draggable().fadeIn();
    }

    let repairReport = {};
    let startTime;
    function performRepairLinks(justOne,remove) {
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

        checkForOrphanImageFileRecords($('#txtCurrentActiveFolder').val(), $('#txtActiveFolderId').val(), justOne, remove);
    }

    let serverFilesArray = [];
    function checkForOrphanImageFileRecords(startFolderPath, startFolderId, recurr, remove) {
        try {
            let path = "../../danni/" + startFolderPath;
            console.log("path: " + path);
            $.ajax({
                url: "php/getOggleFolder.php?folderId=" + startFolderId + "&path=" + path,
                //url: "php/getOggleFolder.php?folderId=" + startFolderId,
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
                                serverFilesArray = JSON.parse(data);
                                $.ajax({
                                    url: "php/customQuery.php?query=select * from ImageFile where FolderId=" + startFolderId,
                                    success: function (data) {
                                        let imageFileRows = JSON.parse(data);

                                        console.log("imageFiles.count(" + imageFileRows.length + ") , serverFileListArray.count(" + serverFilesArray.length + ")");
                                        if (imageFileRows.length < serverFilesArray.length) {
                                            console.log("more physcial files than ImageFile rows");
                                        }

                                        $.each(imageFileRows, function (idx, imageFileRow) {

                                            let physcialFile = serverFilesArray.filter(node => node.name == imageFileRow.FileName);
                                            if (physcialFile == null) {
                                                repairReport.OrphanImageArray.push("<input style='width:500px' value=" + encodeURI(imageFileRow.FileName) + " />");
                                            }
                                            repairReport.PhyscialFilesProcessed++;
                                        });

                                        $.each(serverFilesArray, function (idx, objServerFile) {

                                            let imageFileRow = imageFileRows.filter(node => node.FileName == objServerFile);
                                            if (imageFileRow == null) {
                                                if (remove) {


                                                }

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
                            $.each(serverFilesArray, function (idx, obj) {
                                if (obj.type == "dir") {
                                    checkForOrphanImageFileRecords(startFolderPath + "/" + obj.name, obj.folderId, recurr);
                                }
                            });
                        }
                    }
                },
                error: function (jqXHR) {
                    $('#dashBoardLoadingGif').hide();
                    let errMsg = getXHRErrorDetails(jqXHR);
                    alert("RepairLinks/getDirectoryFiles XHR: " + errMsg);
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

            $('#serverFileListContainer').show();
            dashboardDialogBoxClose('reportRepairResults');

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

// SORT FUNCTIONS
{
    let sortOrderArray = [];
    function showSortTool() {
        //checkForOrphanImageFileRecords($('#txtCurrentActiveFolder').val(), $('#txtActiveFolderId').val(), justOne);
        if (isNullorUndefined($('#txtActiveFolderId').val())) {
            alert("select a folder");
            return;
        }
        //checkForOrphanImageFileRecords($('#txtCurrentActiveFolder').val(), $('#txtActiveFolderId').val()
        $('.fullScreenSection').hide();
        $('#dashboardTopRow').hide();
        $('#dirTreeContainer').hide();
        $('#sortToolSection').show();
        resizeDashboardPage();
        //$('#sortToolImageArea').css("height", $('#dashboardContainer').height() - $('#sortToolHeader').height());
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
    alert("dashboard DialogBox Close. calledFrom: " + calledFrom)
    $('#dashboardDialogBox').hide();
    //$('#dashboardDialogContents').keydown = null;
    document.onkeydown = null;
}