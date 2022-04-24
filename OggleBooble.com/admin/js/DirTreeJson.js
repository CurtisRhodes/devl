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
        if (isNullorUndefined(jsonResultsItem))
            alert("total fail");
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
                    setTimeout(function () {
                        recurseDirTree(subNode.Id);
                    }, 1400);
                }
            });
        }
    } catch (e) {
        logAdminError("CAT", e, "recurseDirTree");
    }
}

function lookupRecurr(searchNodeId) {
    try {
        let jsonResultsRootItem = jsonResults.filter(node => node.Id == startNodeId)[0];
        if (isNullorUndefined(jsonResultsRootItem)) {
            alert("lookup fail");
        }
        else {
            if (searchNodeId == jsonResultsRootItem.Id)
                return jsonResultsRootItem;
            else {
                $.each(jsonResultsRootItem.nodes, function (idx, rootNode) {
                    if (rootNode.Id == searchNodeId)
                        return rootNode;
                });
                $.each(jsonResultsRootItem.nodes, function (idx, rootNode) {
                    if (rootNode.Id == searchNodeId)
                        return rootNode;
                });
                $.each(jsonResultsRootItem.nodes, function (idx, subNode) {
                    jsonResultsItem = jsonResults.filter(node => node.Id == subNode.Id);
                    $.each(jsonResultsItem.nodes, function (idx, subNodeLevel2) {
                        if (subNodeLevel2.Id == searchNodeId)
                            return subNodeLevel2;
                    });
                    $.each(jsonResultsItem.nodes, function (idx, subNodeLevel2) {
                        jsonResultsSubItem = jsonResults.filter(node => node.Id == subNode.Id);
                        $.each(jsonResultsSubItem.nodes, function (idx, subNodeLevel3) {
                            if (subNodeLevel3.Id == searchNodeId)
                                return subNodeLevel3;
                        });
                        alert("may need to go another level deep");
                    });
                });
            }
        }
    } catch (e) {
        alert("llllooooo: " + e);

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

