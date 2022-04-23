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
                        "id": "" + thisNode.Id + "", "folderName": "" + thisNode.FolderName + "", "folderPath": "" +
                            thisNode.FolderPath + "", "folderImage": "" + folderImage + "", "fileCount": "" + fildeCount + "", "nodes": []
                    }
                ];

                recurseDirTree(thisNode);

                saveFile();

                delta = (Date.now() - startTime) / 1000;
                console.log("loading Json tree file took: " + delta.toFixed(3));
                $('#dashBoardLoadingGif').hide();
            },
            error: function (jqXHR) {
                $('#dashBoardLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                logOggleError("AJX", $('#txtActiveFolderId').val(), errMsg, "create New Folder");
            }
        });
    } catch (e) {
        logOggleError("CAT", -47700, e, "build dDirTree");
    }
}

function recurseDirTree(thisNode) {
    if (thisNode.IsStepChild == 0) {
        let folderImage = "https://common.ogglebooble.com/img/redballon.png";
        if (!isNullorUndefined(thisNode.FolderImage)) folderImage = settingsImgRepo + thisNode.FolderImage;
        let fileCount = showFileCountTxt(thisNode);

        let parentNode = jsonResults.filter(node => node.id == thisNode.Parent);
        if (isNullorUndefined(parentNode)) {
            debugger;
        }
        else {
            if (isNullorUndefined(parentNode.nodes))
                parentNode.nodes = new Array;
            else {
                debugger;
            }

            parentNode.nodes.push({
                "id": "node" + thisNode.Id + "", "folderName": "" + thisNode.FolderName +
                    "", "folderPath": "" + thisNode.FolderPath + "", "folderImage": "" + folderImage + "", "fileCount": "" + fileCount + "", "nodes": []
            });


            let subNodes = dirTreeArray.filter(node => node.Parent == thisNode.Id);
            $.each(subNodes, function (idx, subNode) {
                recurseDirTree(subNode);
            });
        }
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

