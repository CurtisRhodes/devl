let dirTreeData, jsonResults = [];

function createDirTreeJson() {
    let startNode = 3;
    try {
        let startTime = Date.now();
        //$('#dashBoardLoadingGif').show();
        $('#dataifyInfo').html("loading vwDirTree").show();
        $.ajax({
            cache: false,
            url: 'php/yagdrasselFetchAll.php?query=select * from VwDirTree',
            success(data) {
                dirTreeData = JSON.parse(data);

                let thisNode = dirTreeArray.filter(node => node.Id == startNode)[0];
                let folderImage = "https://common.ogglebooble.com/img/redballon.png";
                if (!isNullorUndefined(thisNode.FolderImage)) folderImage = settingsImgRepo + thisNode.FolderImage;
                let fildeCount = showFileCountTxt(thisNode);

                jsonResults = [
                    {
                        "Id": "" + thisNode.Id + "", "folderName": "" + thisNode.FolderName + "", "folderPath": "" +
                            thisNode.FolderPath + "", "folderImage": "" + folderImage + "", "fileCount": "" + fildeCount + "", "nodes": []
                    }
                ];

                recurseDirTree(startNode);

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
        logOggleError("CAT", -47700, e, "build dDirTree");
    }
}

async function recurseDirTree(nodeId) {

    let jsonResultsItem = jsonResults.filter(node => node.Id == nodeId)[0];

    if (isNullorUndefined(jsonResultsItem))
        alert("total fail");
    else {
        //    console.log(jsonResults[jsonResultsIdx].FolderName + " node[" + jsonResults[jsonResultsIdx].nodes.length + "]");

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
                recurseDirTree(subNode.Id);
            }
        });
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

