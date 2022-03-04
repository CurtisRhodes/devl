
function showDailyError() {

    alert("validateConnection: " + errMsg);

}

function verifyHITConnection() {

    //alert("url: php/validateConnection.php")
    $.ajax({
        type: "GET",
        url: "php/validateHITConnection.php",
        dataType: "html",   //expect html to be returned                
        success: function (response) {
            $("#oggleMetricsContainer").html(response);
            console.log(response);
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            alert("validateConnection: " + errMsg);
            //if (!checkFor404(errMsg, folderId, "chargeCredits")) logError("XHR", folderId, errMsg, "chargeCredits");
        }
    });
}

let goDeepStart;
let countModel = {};
function GetDeepFolderCounts(folderId) {
    GoDeepFolderCounts(folderId);
    goDeepStart = DateTime.Now;
}

function GoDeepFolderCounts(folderId) {
    try {
        $.ajax({
            url: "php/getFolderCounts.php?query=select * from CategoryFolder where Id=" + folderId,
            success: function (catInfo) {
                $.ajax({
                    type: "GET",
                    url: "php/customQuery.php?query=select * from CategoryImageLinks where ImageCategoryId=" + folderId,
                    success: function (response) {

                        //let fileLinkCount = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Count();
                        //int subFolderCount = db.CategoryFolders.Where(f => f.Parent == folderId).Count();
                        //subFolderCount += db.StepChildren.Where(s => s.Parent == folderId).Count();



                    }, 
                    error: function (jqXHR) {
                        let errMsg = getXHRErrorDetails(jqXHR);
                        alert("validateConnection: " + errMsg);
                        //if (!checkFor404(errMsg, folderId, "chargeCredits")) logError("XHR", folderId, errMsg, "chargeCredits");
                    }
                });






                //let fileLinkCount = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Count();
                //int subFolderCount = db.CategoryFolders.Where(f => f.Parent == folderId).Count();
                //subFolderCount += db.StepChildren.Where(s => s.Parent == folderId).Count();



            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                alert("validateConnection: " + errMsg);
                //if (!checkFor404(errMsg, folderId, "chargeCredits")) logError("XHR", folderId, errMsg, "chargeCredits");
            }
        });
    } catch (e) {
        $('#dashBoardLoadingGif').hide();
        logCatch("CreateNewFolder", e);
    }
}