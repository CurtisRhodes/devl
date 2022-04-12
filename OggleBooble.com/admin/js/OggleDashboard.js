// let settingsImgRepo = 'https ://img.brucheum.com/';
// let settingsImgRepo = 'st21569.ispot.cc/danni/';
const settingsImgRepo = 'https://ogglebooble.com/danni/';
let startRoot = 10326;

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
        "    <div><span>or select start folder </span><input id='txtRoot' class='roundedInput'></input></div>\n" +
        "    <div class='roundendButton' tabindex='0' onclick='performBuildDirTree();dashboardDialogBoxClose(\"showBuildDirTreeDialog click\");')'>Go</div>");
    $('#dashboardDialogBox').draggable().fadeIn();
    $('#selDirTreeRoot').on("change", function () {
        $('#txtRoot').val($(this).val());
    });
    
    $('#dashboardDialogContents').keydown(function (event) {
        if (event.keyCode === 13) {
            performBuildDirTree();
            dashboardDialogBoxClose('showBuildDirTreeDialog keydown');
        }
    });
    $('#dashboardDialogBox').css("top", "150px");
    $('#dashboardDialogBox').css("left", "250px");    
    $('#txtRoot').val(startRoot).focus();
}

function performBuildDirTree() {
    if ($('#txtActiveFolderId').val() != "") {
        if ($('#selDirTreeRoot').val() != $('#txtActiveFolderId').val()) {
            startRoot = $('#txtActiveFolderId').val();
        }
        if ($('#txtRoot').val() != startRoot) {
            startRoot = $('#txtRoot').val();
        }        
    }
    buildDirTree(startRoot);
}

// CREATE NEW FOLDER

function showCreateNewFolderDialog() {
    $('#dashboardDialogBoxTitle').html("Create New Folder");
    $('#dashboardDialogContents').html(`
        <div><span>parent</span><input id='txtCreateFolderParent' class='txtLinkPath inlineInput roundedInput' readonly='readonly'></input></div>\n
        <div><span>title</span><input id='txtNewFolderTitle' class='inlineInput roundedInput'></input></div>\n
        <div><span>folder name</span><input id='txtNewFolderName' class='inlineInput roundedInput'></input></div>\n
        <div><span>type</span><select id='ddNewFolderType' class='inlineInput roundedInput'>\n
               <option value='singleChild'>singleChild</option>\n
               <option value='singleModel'>singleModel</option>\n
               <option value='singleParent'>singleParent</option>\n
               <option value='multiModel'>multiModel</option>\n
               <option value='multiFolder'>multiFolder</option>\n
           </select></div>\n
        <div class='float'>
            <div class='inline'><span>sort order </span><input id='txtSortOrder' class='roundedInput digit'/></div>\n
            <div class='inline'><span>number to create </span><input id='txtNumAutoCreate' class='roundedInput digit'/></div>\n
            <div class='inline'><span>start at </span><input id='txtNumStartAutoAt' class='roundedInput digit'/></div>\n
        </div>
            <div class='inline roundendButton' onclick='callPerformCreateNewFolder()'>Create Folder</div>\n
            <div class='inline roundendButton' onclick='performAutoCreateNewFolders()'>Auto Create multiple folders</div>\n`);

    $("#txtSortOrder").val("0");
    $("#txtNumAutoCreate").val("10");
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

function performAutoCreateNewFolders() {
    let startNumber = Number($('#txtNumStartAutoAt').val());
    let numNewFolder = startNumber + Number($('#txtNumAutoCreate').val());
    let newFolderTitle = $('#txtNewFolderTitle').val();
    let newFolderName = $('#txtNewFolderName').val();
    if (newFolderName == "")
        newFolderName = newFolderTitle;

    let loopCounter = startNumber;
    $('#dataifyInfo').html("creating new folder");
    let mySlowLoop = setInterval(function () {
        let folderName = newFolderName + "_00" + loopCounter;
        if (loopCounter > 9)
            folderName = newFolderName + "_0" + loopCounter;
        if (loopCounter > 99)
            folderName = newFolderName + "_" + loopCounter;

        $('#dataifyInfo').show().html("creating new folders");
        performCreateNewFolder(folderName, loopCounter++);

        if (loopCounter == numNewFolder) {
            clearInterval(mySlowLoop);
            $('#dataifyInfo').html("ok. " + numNewFolder + " new folders created");
        }
        else
            $('#dataifyInfo').html("creating new folder " + folderName);
    }, 770);
}

function callPerformCreateNewFolder() {

    performCreateNewFolder($('#txtNewFolderTitle').val(), $('#txtSortOrder').val());

    $('#dataifyInfo').html("ok. New folder created");

}

function performCreateNewFolder(newFolderName, sortOrder) {
    try {
        let sStart = Date.now();
        let folderPath = $('#txtCurrentActiveFolder').val() + "/" + $('#txtNewFolderTitle').val();
        $.ajax({
            url: "php/createNewFolder.php",
            type: "POST",
            data: {
                parentId: $('#txtActiveFolderId').val(), 
                folderPath: folderPath,
                //newFolderName: $('#txtNewFolderTitle').val(),
                newFolderName: newFolderName,
                folderType: $('#ddNewFolderType').val(),
                rootfolder: 'archive',
                sortOrder: sortOrder
            },
            success: function (success) {
                if (success.trim() != "ok") {
                    $('#dataifyInfo').html("error creating new folder: " + success);
                }
            },
            error: function (jqXHR) {
                $('#dashBoardLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                logError("AJX", $('#txtActiveFolderId').val(), errMsg, "create New Folder");
            }
        });
    } catch (e) {
        $('#dashBoardLoadingGif').hide();
        logOggleError("CAT", -888, e, "perform create new folder");
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
    $('.dashboardVisibleSection').hide();
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
                logOggleError("XHR", -888, getXHRErrorDetails(jqXHR), "show files");
            }
        });
    } catch (e) {
        logOggleError("CAT", -888, e, "show files");
    }
}

// FOLDER COUNTS
function updateFolderCounts() {
    try {
        let sStart = Date.now();
        $('#dashBoardLoadingGif').show();
        let rootPath = $('#txtCurrentActiveFolder').val().trim();

        let rootPath2 = $('#txtActiveFolderId').val() + "&rootPath=" + rootPath;

        $.ajax({
            type: "GET",
            url: "php/getFolderCounts.php?rootId=" + rootPath2,
            success: function (data) {
                $('#dashBoardLoadingGif').hide();
                let returnObject = JSON.parse(data);
                if (returnObject[0] == "ok") {
                    // $returnObject = ['ok', $ChangesMade, $FoldersProcessed, $TestChangesMade];

                    $('#dataifyInfo').html("ok.  folders processed: " + returnObject[1] + "  changes made: " + returnObject[2]).show();
                    let delta = (Date.now() - sStart);
                    if (delta > 150)
                        $('#dataifyInfo').append("  .Took: " + (delta / 1000).toFixed(3));
                }
                else {
                    logOggleError("AJX", -888, data, "update folder counts");
                }
            },
            error: function (jqXHR) {
                $('#dashBoardLoadingGif').hide();
                logOggleError("XHR", -88817, getXHRErrorDetails(jqXHR), "update folder counts");
            }
        });
    } catch (e) {
        $('#dashBoardLoadingGif').hide();
        logOggleError("CAT", -88817, e, "update folder counts");
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
        $('.dashboardVisibleSection').hide();
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
            url: "php/yagdrasselFetchAll.php?query=select * from VwLinks where FolderId=" + $('#txtActiveFolderId').val() + " order by SortOrder",
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
                    logOggleError("AJX", -88822, getXHRErrorDetails(jqXHR), "save sort order");
                }
            });
        } catch (e) {
            logOggleError("CAT", -88822, e, "save sort order");
        }
    }
}

function showDefaultWorkArea() {
    $('.dashboardVisibleSection').hide();
    $('#dashboardTopRow').show();
    $('#dirTreeContainer').show();
}

function dashboardDialogBoxClose(calledFrom) {
    //alert("dashboard DialogBox Close. calledFrom: " + calledFrom)
    $('#dashboardDialogBox').hide();
    $('#dashboardDialogContents').off();
}

function sqlSandbox() {
    $('.dashboardVisibleSection').hide();
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

function testHitConnection() {
    //alert("url: php/validateConnection.php")
    $.ajax({    //create an ajax request to display.php
        type: "GET",
        url: "php/validateConnection.php",
        success: function (response) {
            $("#rightSideWorkarea").html(response);
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
        url: "php/yagdrasselFetch.php?query=select * from CategoryFolder where Id = 411",
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


// MOVE MANY
{
    let mmSourceFolderId, mmSelectedTreeFolderPath;

    function showMoveManyDialog(cx) {
        if (isNullorUndefined($('#txtCurrentActiveFolder').val())) {
            alert("select a folder");
            return;
        }
        $('.dashboardVisibleSection').hide();
        $('#dirTreeContainer').hide();
        $('#dashboardTopRow').hide();

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
        $('#txtMoveManySource').html($('#txtCurrentActiveFolder').val());
        $('#txtMoveManySource').html("Archive");

        $.ajax({
            url: "php/yagdrasselFetchAll.php?query=select * from VwLinks where FolderId=" + $('#txtActiveFolderId').val() + " order by SortOrder",
            success: function (imgLinks) {
                $('#dashBoardLoadingGif').hide();
                if (imgLinks.indexOf("error") > -1)
                    $('#sortToolImageArea').html(imgLinks);
                else {
                    $('#moveManyImageArea').html("");
                    let links = JSON.parse(imgLinks);
                    moveManyArray = [];
                    $.each(links, function (ndx, obj) {
                        $('#moveManyImageArea').append("<div class='sortBox'><img class='sortBoxImage' src='" +
                            settingsImgRepo + obj.FileName + "'/>" +
                            "<br/><input class='sortBoxInput' id=" + obj.LinkId + " value=" + obj.SortOrder + "></input></div>");
                        moveManyArray.push({
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
                logError("AJX", $('#txtActiveFolderId').val(), errMsg, "move many");
            }
        });

        $('#moveManySection').show();
    }

    function showMoveManyTool(cx) {

        $('#txtMoveManySource').val(mmSelectedTreeFolderPath);
        $('#moveManyImageArea').css("height", $('#dashboardContainer').height() - $('#moveManyHeader').height());
        resizeDashboardPage();
        $('#sortTableHeader').html(pSelectedTreeFolderPath.replace(".OGGLEBOOBLE.COM", "").replace("/Root/", "").replace(/%20/g, " ")
            + "(" + $('#txtActiveFolderId').val() + ")");
        $('#dashBoardLoadingGif').fadeIn();

        $('#dataifyInfo').append("loading sorted images");


        mmSourceFolderId = $('#txtActiveFolderId').val();
        mmSelectedTreeFolderPath = $('#txtCurrentActiveFolder').val();
        //activeDirTree = "moveMany";
        //loadDirectoryTree(1, "mmDirTreeContainer", true);
        //showHtmlDirTree("mmDirTreeContainer");
        loadMMcheckboxes();
        if (isNullorUndefined($('#txtActiveFolderId').val())) {
            alert("select a folder");
            return;
        }

        //imgLinks.Links = db.VwLinks.Where(l => l.FolderId == folderId).OrderBy(l => l.SortOrder).ToList();
        $.ajax({
            url: "php/yagdrasselFetchAll.php?query=select * from VwLinks where FolderId=" + $('#txtActiveFolderId').val() + " order by SortOrder",
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
    function loadMMcheckboxes() {
        $('#dashBoardLoadingGif').fadeIn();
        let imgRepo = settingsArray.ImageRepo;
        $.ajax({
            type: "GET",
            //db.VwLinks.Where(l => (l.FolderId == folderId) && (l.FolderId == l.SrcId)).OrderBy(l => l.SortOrder).ToList();
            url: "php/yagdrasselFetchAll?query=select * from VwLinks where FolderId=" + $('#txtActiveFolderId').val(),
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
                else {
                    logError("AJX", mmSourceFolderId, imgLinks.Success, "getDeepFolderCounts");
                    alert("load MMcheckboxes AJXC error: " + imgLinks);
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                alert("load MMcheckboxes XHR error: " + errMsg);
                //if (!checkFor404(errMsg, mmSourceFolderId, "loadMMcheckboxes")) logError("XHR", mmSourceFolderId, errMsg, "loadMMcheckboxes");
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

//        string ftpRepo = imgRepo.Substring(7);
//        var dbDestFolder = db.CategoryFolders.Where(i => i.Id == moveManyModel.DestinationFolderId).First();
//        string destFtpPath = ftpHost + ftpRepo + "/" + dbDestFolder.FolderPath;

//        if (!FtpUtilies.DirectoryExists(destFtpPath))
//            FtpUtilies.CreateDirectory(destFtpPath);

//        var dbSourceFolder = db.CategoryFolders.Where(f => f.Id == moveManyModel.SourceFolderId).First();
//        string sourceFtpPath = ftpHost + ftpRepo + "/" + dbSourceFolder.FolderPath;

//        ImageFile dbImageFile = null;
//        string oldFileName;
//        string newFileName;
//        string linkId;
//        int sortOrder;
//        for (int i = 0; i < moveManyModel.ImageLinkIds.Length; i++)
//        {
//            linkId = moveManyModel.ImageLinkIds[i];
//            if (moveManyModel.Context == "copy") //only
//            {
//                db.CategoryImageLinks.Add(new MySqlDataContext.CategoryImageLink()
//                                {
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
//                                    {
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
//    }
//    catch (Exception ex)
//    {
//        success = Helpers.ErrorDetails(ex);
//        if (db != null)
//            db.Dispose();
//    }
//}
//            }
//            catch (Exception ex)
//{
//    success += Helpers.ErrorDetails(ex);
//}
//return success;
//        }
