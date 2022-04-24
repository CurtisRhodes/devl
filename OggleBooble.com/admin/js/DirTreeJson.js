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
        let jsonResultsItem = lookupRecurr(nodeId);

        if (!isNullorUndefined(jsonResultsItem)) {
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
        return -1;
    }
}

function lookupRecurr(searchNodeId) {
    try {
        let success = null;
        let ISaidStop = false;
        let jsonResultsRootItem = jsonResults.filter(node => node.Id == startNodeId)[0];
        if (!isNullorUndefined(jsonResultsRootItem)) {
            if (searchNodeId == jsonResultsRootItem.Id)
                success = jsonResultsRootItem;
            else {
                $.each(jsonResultsRootItem.nodes, function (idx, rootNode) {
                    if (!ISaidStop) {
                        if (rootNode.Id == searchNodeId) {
                            success = rootNode;
                            ISaidStop = true;
                        }
                    }
                });
                if (!ISaidStop) {
                    $.each(jsonResultsRootItem.nodes, function (idx, rootNode) {
                        if (!ISaidStop) {
                            let nextLevelNodes = rootNode.nodes;
                            $.each(nextLevelNodes, function (idx, nextLevelNode) {
                                if (!ISaidStop) {
                                    if (nextLevelNode.Id == searchNodeId) {
                                        success = nextLevelNode;
                                        ISaidStop = true;
                                    }
                                }
                            });
                        }
                    });
                    if (!ISaidStop) {
                        $.each(jsonResultsRootItem.nodes, function (idx, rootNode) {
                            if (!ISaidStop) {
                                let nextLevelNodes = rootNode.nodes;
                                $.each(nextLevelNodes, function (idx, nextLevelNode) {
                                    thirdLevelNodes = nextLevelNode.nodes;
                                    $.each(thirdLevelNodes, function (idx, thirdLevelNode) {
                                        if (thirdLevelNode.Id == searchNodeId) {
                                            ISaidStop = true;
                                            return nextLevelNode;
                                        }
                                    });
                                });
                            }
                        });
                        if (!ISaidStop) {
                            alert("may need to go another level deep");
                        }
                    }
                }
            }
            return success;
        }
    } catch (e) {
        alert("see: " + e);
    }
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

}

