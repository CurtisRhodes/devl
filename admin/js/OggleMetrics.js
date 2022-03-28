
function showDailyErrorReport() {
    $('.fullScreenContainer').hide();  // close all other sections
    $('#reportsHeader').show();
    $('#reportsHeaderTitle').html("Daily Error Report");
    $('#oggleMetricsContainer').show();

    // error summary report
    let sql = `select format(count(*), 0) count, ErrorCode, Description, CalledFrom, max(Occured) as Occured 
                from ErrorLog e left join RefCode r on e.ErrorCode = r.RefCode
                left join st21569_yagdrassel.CategoryFolder f on f.Id = e.FolderId
                where date(Occured)="` + todayString() + `"
                group by ErrorCode, Description, CalledFrom
                order by count(*) desc`;
    $.ajax({
        url: "php/registroFetchAll.php?query=" + sql,
        success: function (response) {

            let errorSummary = JSON.parse(response);
            $('#errorSummaryReport').html("<div>Error Summary</div>")

            let tableKlude = "<table>";
            $.each(errorSummary, function (idx, obj) {
                tableKlude += "<tr><td>" + obj.Count + "</td>";
                tableKlude += "<td>" + obj.ErrorCode + "</td>";
                tableKlude += "<td>" + obj.Description + "</td>";
                tableKlude += "<td>" + obj.CalledFrom + "</td>";
                tableKlude += "<td>" + obj.Occured + "</td></tr>";
            });
            tableKlude += "<table>"
            $('#errorSummaryReport').append(tableKlude);
        },
        error: function (jqXHR) {
            let errMsg = showDailyErrorReport(jqXHR);
            alert("validateConnection: " + errMsg);
        }
    });
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
                    url: "php/yagdrasselFetchAll.php?query=select * from CategoryImageLinks where ImageCategoryId=" + folderId,
                    success: function (response) {

                        //let fileLinkCount = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Count();
                        //int subFolderCount = db.CategoryFolders.Where(f => f.Parent == folderId).Count();
                        //subFolderCount += db.StepChildren.Where(s => s.Parent == folderId).Count();
                    }, 
                    error: function (jqXHR) {
                        logOggleError("XHR", -8877, getXHRErrorDetails(jqXHR), "go deep folderCounts");
                    }
                });
                //let fileLinkCount = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Count();
                //int subFolderCount = db.CategoryFolders.Where(f => f.Parent == folderId).Count();
                //subFolderCount += db.StepChildren.Where(s => s.Parent == folderId).Count();
            },
            error: function (jqXHR) {
                logOggleError("XHR", -888, getXHRErrorDetails(jqXHR), "go deep folderCounts");
            }
        });
    } catch (e) {
        $('#dashBoardLoadingGif').hide();
        logOggleError("CAT", -888, e, "go deep folderCounts");
    }
}