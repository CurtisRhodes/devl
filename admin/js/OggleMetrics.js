
function showPageHitsReport() {
    closeAllReports();
    $('#reportsHeader').show();
    $('#reportsHeaderTitle').html("Daily Hits");
    $('#pageHitReports').show();
    
    // daily page hits report
    let sql = "select date_format(Occured,'%b %e') as FormattedDate, Occured, format(count(*),0) as count from PageHit group by Occured";
    $.ajax({
        url: "php/registroFetchAll.php?query=" + sql,
        success: function (response) {
            let errorSummary = JSON.parse(response);
            $('#pageHitSummaryReport').html("<div  class='reportBodyTitle'>PageHit Summary</div>")
            let tableKlude = "<table>";  // <th><tr><td colspan=2 text-algn='center'>PageHit Summary</td><tr></th>";
            $.each(errorSummary, function (idx, obj) {
                tableKlude += "<td class='clickable underline' onclick='hitsByPageReport(\"" + obj.Occured + "\")'>" + obj.FormattedDate + "</td>";

            });
            tableKlude += "</tr><tbody></tr>"
            $.each(errorSummary, function (idx, obj) {
                tableKlude += "<td>" + obj.count.toLocaleString() + "</td>";
            });
            tableKlude += "</tr></tbody><table>"
            $('#pageHitSummaryReport').append(tableKlude).show();
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            alert("pageHitSummaryReport: " + errMsg);
        }
    });
}

function hitsByPageReport(pageHitDate) {

    let sql = `select  count(*) as Hits, PageId, FolderName, RootFolder 
                from PageHit h join st21569_yagdrassel.CategoryFolder f on f.Id = h.PageId
                where Occured='`+ pageHitDate +`' group by PageId, FolderName, Rootfolder
                order by count(*) desc`;
    $.ajax({
        url: "php/registroFetchAll.php?query=" + sql,
        success: function (response) {
            let errorSummary = JSON.parse(response);

            $('#pageHitByPageReport').html("<div class='reportBodyTitle'>PaegeHit Detail " + pageHitDate + "</div>");
            let tableKlude = "<table>";
            $.each(errorSummary, function (idx, obj) {
                tableKlude += "<tr><td>" + obj.Hits + "</td>";
                tableKlude += "<td class='clickable underline' " +
                    "onclick='pageHitPageDetailReport(\"" + obj.PageId + "\",\"" + pageHitDate + "\")'>" + obj.FolderName + "</td>";
                tableKlude += "<td>" + obj.RootFolder + "</td></tr>";
            });
            tableKlude += "<table>"
            $('#pageHitByPageReport').append(tableKlude).show();
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            alert("pageHit by pag eReport: " + errMsg);
        }
    });
}

function metricsReport() {
//    select VisitDate, count(*) from Visit
//    group by VisitDate;

//    select date(InitialVisit), count(*)
//    from Visitor
//    where InitialVisit > '2022-03-11'
//    group by date(InitialVisit);
}


function pageHitPageDetailReport(pageId, pageHitDate) {
    
    let sql = `select f.FolderName, h.VisitorId, concat(City,', ',Region,' ',Country) as Location,
                    h.Occured, coalesce(r.UserName,'*') as UserName
                from PageHit h left join st21569_yagdrassel.CategoryFolder f on h.PageId = f.Id
                left join Visitor v on h.VisitorId = v.VisitorId
                left join RegisteredUser r on h.VisitorId = r.VisitorId
                where date(h.Occured)='` + pageHitDate + `' and h.PageId=` + pageId;

    $.ajax({
        url: "php/registroFetchAll.php?query=" + sql,
        success: function (response) {

            let pageDetail = JSON.parse(response);
            $('#pageHitPageDetailReport').html("<div class='reportBodyTitle'>" + pageDetail[0].FolderName + "Page Hit Detail " + pageHitDate + "</div>");

            let tableKlude = "<table>";
            $.each(pageDetail, function (idx, obj) {
                tableKlude += "<tr><td>" + obj.Location + "</td>";
                tableKlude += "<td>" + obj.UserName + "</td></tr>";
            });
            tableKlude += "<table>"
            $('#pageHitPageDetailReport').append(tableKlude).show();
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            alert("pageHit by pag eReport: " + errMsg);
        }
    });

}


/*--------------------------------------------------*/
function showDailyErrorReport() {
    closeAllReports();
    $('#reportsHeader').show();
    $('#reportsHeaderTitle').html("Daily Error Report");
    $('#errorReports').show();

    // error summary report
    let sql = `select format(count(*), 0) as Count, ErrorCode, Description, CalledFrom, max(Occured) as Occured 
                from ErrorLog e left join RefCode r on e.ErrorCode = r.RefCode
                left join st21569_yagdrassel.CategoryFolder f on f.Id = e.FolderId
                where date(Occured)="` + todayString() + `"
                group by ErrorCode, Description, CalledFrom
                order by count(*) desc`;
    $.ajax({
        url: "php/registroFetchAll.php?query=" + sql,
        success: function (response) {
            let errorSummary = JSON.parse(response);
            $('#errorSummaryReport').html("<div class='reportBodyTitle'>Error Summary</div>")
            let tableKlude = "<table>";  // <th><tr><td colspan=2>Error Summary</td></tr></th>";
            $.each(errorSummary, function (idx, obj) {
                tableKlude += "<tr><td>" + obj.Count + "</td>";
                tableKlude += "<td class='clickable underline' onclick='errorDetailReport(\"" + obj.ErrorCode + "\")'>" + obj.ErrorCode + "</td>";
                tableKlude += "<td>" + obj.Description + "</td>";
                tableKlude += "<td>" + obj.CalledFrom + "</td>";
                tableKlude += "<td>" + obj.Occured + "</td></tr>";
            });
            tableKlude += "<table>"
            $('#errorSummaryReport').append(tableKlude).show();
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            alert("error summary report: " + errMsg);
        }
    });
}
function errorDetailReport(errorCode) {

    let sql = `select ErrorCode, r.Description, CalledFrom, FolderId, f.FolderName, ErrorMessage, City,Region,Country, e.Occured
            from ErrorLog e left join RefCode r on e.ErrorCode = r.RefCode
            left join st21569_yagdrassel.CategoryFolder f on f.Id = e.FolderId
            left join Visitor v on e.VisitorId = v.VisitorId
            where ErrorCode="` + errorCode + `" order by e.Occured desc`;

    $.ajax({
        url: "php/registroFetchAll.php?query=" + sql,
        success: function (response) {

            let errorSummary = JSON.parse(response);
            $('#errorDetailReport').html("<div class='reportBodyTitle'>Error Detail</div>")
            $('#errorDetailReport').html("<div>Error" + errorSummary[0].ErrorCode + ", " + errorSummary[0].Description + "</div>")

            let tableKlude = "<table>";
            $.each(errorSummary, function (idx, obj) {
                tableKlude += "<tr><td>" + obj.ErrorMessage + "</td>";
                tableKlude += "<td>" + obj.Occured + "</td>";
                tableKlude += "<td>" + obj.CalledFrom + "</td>";
                tableKlude += "<td>" + obj.FolderId + "</td>";
                tableKlude += "<td>" + obj.City + "</td>";
                tableKlude += "<td>" + obj.Region + "</td>";
                tableKlude += "<td>" + obj.Country + "</td></tr>";
            });
            tableKlude += "<table>"
            $('#errorDetailReport').append(tableKlude).show();
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            alert("error Detail Report: " + errMsg);
        }
    });

}

function showActivityReport() {


}


function closeAllReports() {
    $('.fullScreenSection').hide();  // close all other sections
    $('.reportSection').hide();  // close all other sections
    $('#reportsHeader').hide();
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
                logOggleError("XHR", -88866, getXHRErrorDetails(jqXHR), "go deep folderCounts");
            }
        });
    } catch (e) {
        $('#dashBoardLoadingGif').hide();
        logOggleError("CAT", -88865, e, "go deep folderCounts");
    }
}

