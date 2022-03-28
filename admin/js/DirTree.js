﻿let dirTreeArray, dirTreeTab = 0, dirTreeTabIndent = 20, maxExpandDepth = 39;
let largetxtstring;

function buildDirTree(startNode) {
    try {
        let startTime = Date.now();
        $('#dashBoardLoadingGif').show();
        $.getJSON('php/yagdrasselFetchAll.php?query=select * from VwDirTree', function (data) {
            $('#dashBoardLoadingGif').hide();
            let delta = (Date.now() - startTime) / 1000;
            console.log("loading vwLinks took: " + delta.toFixed(3));
            $('#floatingDialogBox').fadeOut();

            dirTreeArray = data;

            startTime = Date.now();
            let rootNode = dirTreeArray.filter(node => node.Id == startNode)[0];
            let randomId = create_UUID();

            largetxtstring = dirTreeNode(rootNode, randomId);
            largetxtstring += "<div id='CC" + randomId + "' class='expadoContainer'>";
            $('#dirTreeContainer').html(dirTreeArray[0].treeNodeTxt);

            $('#txtCurrentActiveFolder').val(rootNode.FolderPath);
            $('#txtActiveFolderId').val(rootNode.Id);

            traverseDirTree(rootNode);

            largetxtstring += "</div>";
            $('#dirTreeContainer').html(largetxtstring);

            delta = (Date.now() - startTime) / 1000;
            console.log("loading html tree took: " + delta.toFixed(3));

        });
    } catch (e) {
        logOggleError("CAT", -47700, e, "build dDirTree");
    }
}

function traverseDirTree(thisNode) {
    let subNodes = dirTreeArray.filter(node => node.Parent == thisNode.Id);
    dirTreeTab += dirTreeTabIndent;
    $.each(subNodes, function (idx, subNode) {
        let randomId = create_UUID();
        largetxtstring += dirTreeNode(subNode, randomId);
        if (subNode.SubFolderCount > 0) {
            if (dirTreeTab > maxExpandDepth) {
                largetxtstring += "<div id='CC" + randomId + "' class='expadoContainer' style='display:none' >";
            }
            else {
                largetxtstring += "<div id='CC" + randomId + "' class='expadoContainer' >";
            }

            if (subNode.IsStepChild === "0")
                traverseDirTree(subNode);

            largetxtstring += "</div>";
        }
    });
    dirTreeTab -= dirTreeTabIndent;
    $('#dirTreeContainer').html(largetxtstring + "</div>");
}

function dirTreeNode(node, randomId) {
    let treeNodeTxt;
    try {
        if (isNullorUndefined(node)) {
            debugger;
            alert("bad node?");
        }
        else {
            let expandMode = "[-]";
            if (node.SubFolderCount == 0)
                expandMode = "├";
            else {
                if (dirTreeTab > maxExpandDepth) {
                    expandMode = "[+]";
                }
            }

            let treeNodeClass = "treeLabelDiv";
            if (node.IsStepChild == 1) treeNodeClass = "stepchildTreeLabel";

            let folderImage;
            if (node.FolderImage == null)
                folderImage = "https://common.ogglefiles.com/img/redballon.png";
            else
                folderImage = settingsImgRepo + node.FolderImage;

            treeNodeTxt = "<div id='" + randomId + "' class='dirTreeNode clickable' style='text-indent:" + dirTreeTab + "px'>\n"
                + "<span id='TT" + randomId + "' onclick='toggleDirTree(\"" + randomId + "\")'>" + expandMode + "</span>"
                + "<div class='" + treeNodeClass + "' onclick='commonDirTreeClick(\"" + node.FolderPath + "\"," + node.Id + ")' "
                + "\n oncontextmenu='showDirTreeContextMenu(" + node.Id + ")' "
                + "\n onmouseover='showFolderImage(\"" + folderImage + "\")' "
                + "\n onmouseout='hideFolderImage()'>" + node.FolderName + "</div>"
                + " <span class='fileCount'>: " + showFileCountTxt(node) + "</span>"
                + "</div>\n";
        }
    } catch (e) {
        logOggleError("CAT", -47700, e, "add dirTree node");
    }
    return treeNodeTxt;
}

function showFolderImage(link) {
    $('.dirTreeImageContainer').css("top", event.clientY - 100);
    $('.dirTreeImageContainer').css("left", event.clientX + 10);
    $('.customDirTreeImage').attr("src", link);
    $('.dirTreeImageContainer').show();
 //   $('#badgesContainer').html(link);
}

function showFileCountTxt(vwDirNode) {
    let txtFileCount = "";
    if (vwDirNode.SubFolderCount > 0) {
        if (vwDirNode.FileCount > 0)
            txtFileCount = "(" + commaFormat(vwDirNode.SubFolderCount) + ")";
        if (vwDirNode.TotalChildFiles > 0) {
            txtFileCount += " [" + commaFormat(vwDirNode.TotalChildFiles) + "]";
            if (vwDirNode.TotalSubFolders === vwDirNode.SubFolderCount)
                txtFileCount += " {" + commaFormat(vwDirNode.SubFolderCount) + "}";
            else
                txtFileCount += " {" + vwDirNode.SubFolderCount + " / " + commaFormat(vwDirNode.TotalSubFolders) + "}";
        }
    }
    else
        txtFileCount = "(" + vwDirNode.FileCount + ")";
    return txtFileCount;
}

function hideFolderImage() {
    $('.dirTreeImageContainer').hide();
}

function toggleDirTree(randomId) {
    if ($('#TT' + randomId + '').html() === "[-]") {
        $('#TT' + randomId + '').html("[+]");
        $('#CC' + randomId + '').hide();
    }
    else {
        if ($('#TT' + randomId + '').html() === "[+]") {
            $('#TT' + randomId + '').html("[-]");
            $('#CC' + randomId + '').show();
        }
    }
}

function commonDirTreeClick(danniPath, folderId) {
    try {
        let activeDirTree = "dashboard";


        //pSelectedTreeId = folderId;
        pSelectedTreeFolderPath = danniPath.replace(".OGGLEBOOBLE.COM", "").replace("/Root/", "").replace(/%20/g, " ");
        //$("#topHeaderRow").html($('.txtLinkPath').val());
        switch (activeDirTree) {
            case "dashboard":
                $('#txtCurrentActiveFolder').val(danniPath);
                $('#txtActiveFolderId').val(folderId);
                break;
            case "catListDialog":
                window.location.href = "\album.html?folder=" + folderId;
                break;
            case "linkManipulateDirTree":
                $('#dirTreeResults').html(pSelectedTreeFolderPath);
                break;
            case "moveFolder":
                dSelectedTreeId = folderId;
                $('#txtNewMoveDestiation').val(danniPath);
                $('#moveFolderDirTreeContainer').fadeOut();
                break;
            case "moveMany":
                $('#txtMoveManyDestination').val(pSelectedTreeFolderPath);
                $('#mmDirTreeContainer').fadeOut();
                break;
            case "stepchild":
                $('#txtscSourceFolderName').val(pSelectedTreeFolderPath);
                $('#scDirTreeContainer').fadeOut();
                activeDirTree = "dashboard";
                break;
            default:
        }
    } catch (e) {
        logError("CAT", folderId, e, "common dirTree click");
    }
}

