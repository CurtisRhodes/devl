// let settingsImgRepo = 'https://img.brucheum.com/';
// let settingsImgRepo = 'st21569.ispot.cc/danni/';
let settingsImgRepo = 'https://ogglefiles.com/danni/';

function showReportsSection() {
    $('.fullScreenSection').hide();
    $('#reportsSection').show();
    setLeftMenu("reports");
    $('#reportsMiddleColumn').css("width", $('#dashboardContainer').width() - $('#reportsLeftColumn').width());
}

function getDashboardStartRoot() {
    $('#floatingDialogBoxTitle').html("Build Dir Tree");
    $('#floatingDialogContents').html(
        "    <div><span>select start folder</span><input id='txtRoot' class='txtLinkPath roundedInput'></input></div>\n" +
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
    buildDirTree($('#txtRoot').val());
}

function showRepairLinksDialog() {
    $('#floatingDialogBoxTitle').html("Repair Links");
    $('#floatingDialogContents').html(
        "    <div><span>folder to repair</span><input id='txtFolderToRepair' class='txtLinkPath roundedInput' readonly='readonly'></input></div>\n" +
        "    <div><span>include all subfolders </span><input type='checkbox' id='ckRepairIncludeSubfolders'></input></div>\n" +
        "    <div class='roundendButton' onclick='performRepairLinks($(\"#ckRepairIncludeSubfolders\").is(\":checked\"))'>Run</div>\n");
    $("#txtFolderToRepair").val(pSelectedTreeFolderPath);
    $('#dashboardDialog').fadeIn();

}

function performRepairLinks(justOne) {
    var start = Date.now();
    $('#dataifyInfo').show().html("checking and repairing links");
    $('#dashBoardLoadingGif').fadeIn();
    $('#repairErrorReport').hide();
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/RepairLinks/Repair?folderId=" + pSelectedTreeId + "&localImgRepo=" + settingsArray.LocalImgRepo + "&recurr=" + justOne,
            success: function (repairReport) {
                $('#dashBoardLoadingGif').hide();
                $("#centeredDialogContents").fadeOut();
                if (repairReport.Success === "ok") {
                    try {
                        var delta = Date.now() - start;
                        var minutes = Math.floor(delta / 60000);
                        var seconds = (delta % 60000 / 1000).toFixed(0);
                        //console.log("repair links took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
                        $('#dataifyInfo').html("repair links took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
                        $('#dataifyInfo').append(", Files: " + repairReport.PhyscialFilesProcessed);
                        $('#dataifyInfo').append(", Links: " + repairReport.LinkRecordsProcessed);
                        $('#dataifyInfo').append(", Image rows: " + repairReport.ImageFilesProcessed);
                        if (repairReport.Errors.length > 0) {
                            $('#repairErrorReport').show().html("");
                            $.each(repairReport.Errors, function (idx, obj) {
                                $('#repairErrorReport').append("<div>" + obj + "</div>");
                            })
                        }

                        $('#dataifyInfo').append(", Errors: " + repairReport.Errors.length);
                        //if (repairReport.LinksEdited > 0)
                        //    $('#dataifyInfo').append(", links Edited: " + repairReport.LinksEdited);
                        //if (repairReport.ImageFilesAdded > 0)
                        //    $('#dataifyInfo').append(", ImageFilesAdded: " + repairReport.ImagesRenamed);
                        if (repairReport.PhyscialFileRenamed > 0)
                            $('#dataifyInfo').append(", Physcial File Names Renamed: " + repairReport.PhyscialFileRenamed);
                        if (repairReport.ImageFilesRenamed > 0)
                            $('#dataifyInfo').append(", Image File Names Renamed: " + repairReport.ImageFilesRenamed);
                        if (repairReport.ImagesRenamed > 0)
                            $('#dataifyInfo').append(", Image Files Renamed: " + repairReport.ImagesRenamed);
                        if (repairReport.ZeroLenFileResized > 0)
                            $('#dataifyInfo').append(", ZeroLen File Resized: " + repairReport.ZeroLenFileResized);
                        if (repairReport.ImageFilesMoved > 0)
                            $('#dataifyInfo').append(", Images Moved: " + repairReport.ImageFilesMoved);
                        if (repairReport.CatLinksRemoved > 0)
                            $('#dataifyInfo').append(", Links Removed: " + repairReport.CatLinksRemoved);
                        if (repairReport.CatLinksAdded > 0)
                            $('#dataifyInfo').append(", CatLinks Added: " + repairReport.CatLinksAdded);
                        if (repairReport.ImageFilesAdded > 0)
                            $('#dataifyInfo').append(", ImageFiles Added: " + repairReport.ImageFilesAdded);
                        if (repairReport.ImagesDownLoaded > 0)
                            $('#dataifyInfo').append(", ImageFiles ImagesDownLoaded: " + repairReport.ImagesDownLoaded);
                        if (repairReport.ImageFilesRemoved > 0)
                            $('#dataifyInfo').append(", ImageFiles Removed: " + repairReport.ImageFilesRemoved);
                        if (repairReport.ZeroLenImageFilesRemoved > 0)
                            $('#dataifyInfo').append(", ZeroLen ImageFiles Removed: " + repairReport.ZeroLenImageFilesRemoved);
                    }
                    catch (e) {
                        alert("problem displaying repair report: " + e);
                    }
                }
                else {
                    //logError("AJX", apFolderId, repairReport.Success, "performRepairLinks");
                    alert(repairReport.Success);
                }
            },
            error: function (jqXHR) {
                $('#dashBoardLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = "performRepairLinks"; // arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, pSelectedTreeId, "performRepairLinks")) logError("XHR", pSelectedTreeId, errMsg, "performRepairLinks");
            }
        });
    } catch (e) {
        logError("CAT", pSelectedTreeId, e, "performRepairLinks");
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