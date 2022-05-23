let dirTreeData, jsonResults = [], startNodeId;

function createDirTreeJson() {
    try {
        startNodeId = 3;
        let startTime = Date.now();
        //$('#dashBoardLoadingGif').show();
        $('#dataifyInfo').html("loading vwDirTree").show();
        $.ajax({
            cache: false,
            url: 'php/yagdrasselFetchAll.php?query=select * from VwDirTree',
            success(data) {
                dirTreeData = JSON.parse(data);

                let thisNode = dirTreeArray.filter(node => node.Id == startNodeId)[0];
                let folderImage = "https://common.ogglebooble.com/img/redballon.png";
                if (!isNullorUndefined(thisNode.FolderImage)) folderImage = settingsImgRepo + thisNode.FolderImage;
                let fildeCount = showFileCountTxt(thisNode);

                jsonResults = [
                    {
                        "Id": "" + thisNode.Id + "", "folderName": "" + thisNode.FolderName + "", "folderPath": "" +
                            thisNode.FolderPath + "", "folderImage": "" + folderImage + "", "fileCount": "" + fildeCount + "", "nodes": []
                    }
                ];

                recurseDirTree(startNodeId);

                saveFile();

                delta = (Date.now() - startTime) / 1000;
                console.log("loading Json tree file took: " + delta.toFixed(3));
                $('#dashBoardLoadingGif').hide();
            },
            error: function (jqXHR) {
                $('#dashBoardLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                logAdminError("AJX", $('#txtActiveFolderId').val(), "create New Folder");
            }
        });
    } catch (e) {
        logAdminError("CAT", e, "build dDirTree");
    }
}

function recurseDirTree(nodeId) {
    try {
        let jsonResultsItem = deepLookup(nodeId);
        if (isNullorUndefined(jsonResultsItem))
            console.log(nodeId + " sb a terminal node");
        else {
            let subNodes = dirTreeArray.filter(node => node.Parent == nodeId);
            $.each(subNodes, function (idx, subNode) {
                if (subNode.IsStepChild == 0) {
                    let folderImage = "https://common.ogglebooble.com/img/redballon.png";
                    if (!isNullorUndefined(subNode.FolderImage)) folderImage = settingsImgRepo + subNode.FolderImage;
                    let fileCount = showFileCountTxt(subNode);
                    jsonResultsItem.nodes.push({
                        "Id": "" + subNode.Id + "", "folderName": "" + subNode.FolderName +
                            "", "folderPath": "" + subNode.FolderPath + "", "folderImage": "" + folderImage + "", "fileCount": "" + fileCount + "", "nodes": []
                    });
                }
            });
            $.each(subNodes, function (idx, subNode) {
                if (subNode.IsStepChild == 0) {
                    recurseDirTree(subNode.Id);
                }
            });
        }
    } catch (e) {
        logAdminError("CAT", e, "recurseDirTree");
    }
}

function recurseForHtml(nodeId) {
    try {
        let parentNode = deepLookup(nodeId);
        if (isNullorUndefined(jsonResultsItem))
            console.log(nodeId + " sb a terminal node");
        else {
            let subNodes = dirTreeArray.filter(node => node.Parent == nodeId);
            $.each(subNodes, function (idx, subNode) {
                if (subNode.IsStepChild == 0) {


                    let folderImage = "https://common.ogglebooble.com/img/redballon.png";
                    if (!isNullorUndefined(subNode.FolderImage)) folderImage = settingsImgRepo + subNode.FolderImage;
                    let fileCount = showFileCountTxt(subNode);

                    parentNode.nodeContainer.append();


                    sbDirTree.Append(
                        "<div class='dirTreeNode clickable' style='text-indent:" + dirTreeTab + "px'>"
                        + "<span id='DQ33" + randomId + "' onclick='toggleDirTree(\"" + randomId + "\")' >[" + expandMode + "] </span>"
                        + "<div id='" + randomId + "aq' class='" + treeNodeClass + "' "
                        + "onclick='commonDirTreeClick(\"" + vwDir.DanniPath + "\"," + vwDir.ThisNode.Id + ")' "
                        + "oncontextmenu='showDirTreeContextMenu(" + vwDir.ThisNode.Id + ")' "
                        + "onmouseover='showFolderImage(\"" + folderImage + "\")' onmouseout='hideFolderImage()'>"
                        + vwDir.ThisNode.FolderName + "</div><span class='fileCount'>  : "
                        + txtFileCount + "</span></div>" + "\n<div class='" + expandClass + "' id='Q88" + randomId + "'>");

                    jsonResultsItem.nodes.push({
                        "Id": "" + subNode.Id + "", "folderName": "" + subNode.FolderName +
                            "", "folderPath": "" + subNode.FolderPath + "", "folderImage": "" + folderImage + "", "fileCount": "" + fileCount + "", "nodes": []
                    });
                }
            });
            $.each(subNodes, function (idx, subNode) {
                if (subNode.IsStepChild == 0) {
                    recurseForHtml(subNode.Id);
                }
            });
        }
    } catch (e) {
        logAdminError("CAT", e, "recurseDirTree");
    }
}

function deepLookup(searchNodeId) {
    let resultFound = false;
    let success = null;
    try {
        let jsonResultsRootItem = jsonResults.filter(node => node.Id == startNodeId)[0];
        if (searchNodeId == jsonResultsRootItem.Id)
            success = jsonResultsRootItem;
        else {
            $.each(jsonResultsRootItem.nodes, function (idx, rootNode) {
                if (rootNode.Id == searchNodeId) {
                    resultFound = true;
                    success = rootNode;
                    return false;
                }
            });
            if (!resultFound) {
                $.each(jsonResultsRootItem.nodes, function (idx, rootNode) {
                    let subNodes = rootNode.nodes;
                    $.each(subNodes, function (idx, subNode) {
                        if (subNode.Id == searchNodeId) {
                            resultFound = true;
                            success = subNode;
                            return false;
                        }
                    });
                });
                if (!resultFound) {
                    $.each(jsonResultsRootItem.nodes, function (idx, rootNode) {
                        let subNodes = rootNode.nodes;
                        if (!resultFound) {
                            $.each(subNodes, function (idx, subNode) {
                                if (!resultFound) {
                                    let nextlevelNodes = subNode.nodes;
                                    $.each(nextlevelNodes, function (idx, nextlevelNode) {
                                        if (nextlevelNode.Id == searchNodeId) {
                                            resultFound = true;
                                            success = nextlevelNode;
                                            return false;
                                        }
                                    });
                                    if (!resultFound) {
                                        $.each(nextlevelNodes, function (idx, nextlevelNode) {
                                            let thirdLevelNodes = nextlevelNode.nodes;
                                            $.each(thirdLevelNodes, function (idx, thirdLevelNode) {
                                                if (thirdLevelNode.Id == searchNodeId) {
                                                    resultFound = true;
                                                    success = thirdLevelNode;
                                                    return false;
                                                }
                                            });
                                        });
                                        if (!resultFound) {
                                            $.each(nextlevelNodes, function (idx, nextlevelNode) {
                                                let thirdLevelNodes = nextlevelNode.nodes;
                                                $.each(thirdLevelNodes, function (idx, thirdLevelNode) {
                                                    let fouthLevelNodes = thirdLevelNode.nodes;
                                                    $.each(fouthLevelNodes, function (idx, fouthLevelNode) {
                                                        if (fouthLevelNode.Id == searchNodeId) {
                                                            resultFound = true;
                                                            success = fouthLevelNode;
                                                            return false;
                                                        }
                                                    });
                                                    if (!resultFound) {
                                                        $.each(fouthLevelNodes, function (idx, fouthLevelNode) {
                                                            let fithLevelNodes = fouthLevelNode.nodes;
                                                            $.each(fithLevelNodes, function (idx, fithLevelNode) {
                                                                if (fithLevelNode.Id == searchNodeId) {
                                                                    resultFound = true;
                                                                    success = fouthLevelNode;
                                                                    return false;
                                                                }
                                                            });
                                                        });
                                                    } else return false;
                                                    // if (!resultFound) { alert("may need to go another level deep"); }
                                                });
                                            });
                                        } else return false;
                                    } else return false;
                                } else return false;
                            });
                        } else return false;
                    });
                }
            }
        }
    } catch (e) {
        alert("deep search: " + e);
    }
    return success;
}

function saveFile() {
    $('#dataifyInfo').html("writing to disk").show();
    let bigData = JSON.stringify(jsonResults);
    $.ajax({
        type: "POST",
        url: "php/writeToDisk.php",
        data: {
            fileName: "../../common/DirTree.json",
            text: bigData
        },
        success: function (success) {
            //$('#rightSideWorkarea').html(success);
            if (success.trim() == "ok")
                $('#dataifyInfo').html("saved to: DirTree.json").show();
            else
                $('#dataifyInfo').html(success).show();
        }
    });
}

function buildDirTreeFromJson() {


    //file_get_contents(path, file_name)

}

