function showUserStatsDialog() {

    let userStatsDialog = document.getElementById("standardDialogBox");
    replaceHtml(userStatsDialog,`
            <div class='floatingDialogHeader'>
                <div class='floatingDialogTitle'>My Usage Stats</div>
                <div class='dialogCloseButton'><img src='img/close.png' onclick='(\"#userStatsDialog\").hide();dialogBoxOpen=false;'/></div>
            </div>
            <div class='floatingDialogContents'>
                <table class='usrStatsTable'>
                    <tr>       <th>visits</th>        <th>pageHits</th>        <th>feedback</th>        <th>comments</th>       <th>credits</th></tr>
                    <tr><td id='tVisits'></td> <td id='tPageHits'></td> 
                        <td id='tFeedback'></td> <td id='tComments'></td> 
                        <td id='tCredits'</td></tr>
                </table>
                <div  class='clickable underline' onclick='showPageHistory()'>viewing history</div>
                <div id="pgHistoryContainer"></div>
            </div>`);

    userStatsDialog.style.top = "200px";
    userStatsDialog.style.right = "22px";

    showElement(userStatsDialog);

    getUserStats();
}

function getUserStats() {
    let visitorId = sessionStorage.VisitorId;
    let ttlPgHits = 0;
    //loadingGif("show");
    let visHistsObj = {};
    getDataFromServer("php/registroFetch.php?query=select Hits from VisitorPageHit where VisitorId='" + visitorId + "'", visHistsObj);
    let visHitsIntrvl = setInterval(() => {
        if (ready(visHistsObj.data)) {
            clearInterval(visHitsIntrvl)
            let jdata = JSON.parse(visHistsObj.data);
            let histPageHits = Number(jdata.Hits);
            if (histPageHits == NaN) histPageHits = 0;
            let extraHitsObj = {};
            getDataFromServer("php/registroFetch.php?query=select count(*) Hits from st21569_registro.PageHit where VisitorId='" + visitorId + "'", extraHitsObj);
            let extraHitsIntrvl = setInterval(() => {
                if (ready(extraHitsObj.data)) {
                    clearInterval(extraHitsIntrvl);
                    jdata = JSON.parse(extraHitsObj.data);
                    let newPageHits = Number(jdata.Hits);
                    ttlPgHits = histPageHits + newPageHits;
                    document.getElementById("tPageHits").value = ttlPgHits.toLocaleString();
                }
            }, 48);
        }
    }, 47);

    let visitObj = {};
    getDataFromServer("php/registroFetch.php?query=select count(*) Visits from st21569_registro.Visit where VisitorId='" + visitorId + "'", visitObj);
    let visitIntrvl = setInterval(() => {
        if (ready(visitObj.data)) {
            jdata = JSON.parse(visitObj.data);
            let numVisits = Number(jdata.Visits);
            document.getElementById("tVisits").value = numVisits.toLocaleString();
        }
    }, 49);

    let feedbkObj = {};
    getDataFromServer("php/wysiwygFetch.php?query=select count(*) feedback from Feedback where VisitorId='" + visitorId + "'", feedbkObj);
    let feedbkIntrvl = setInterval(() => {
        if (ready(feedbkObj.data)) {
            clearInterval(feedbkIntrvl);
            jdata = JSON.parse(data);
            let numFeedback = Number(jdata.feedback);
            replaceHtml(document.getElementById("tFeedback"), numFeedback.toLocaleString());
            ('#userStatsLoadingGif').hide();
            ('#divViewHistory').show();

            //    sendOggleMail("user stats displayed",
            //        "\n ttlPgHits: " + ttlPgHits,
            //        "\n numVisits: " + numVisits,
            //        "\n numFeedback: " + numFeedback
            //    );

        }
    }, 50);
}

function showPageHistory() {
    let pgHistoryContainer = document.getElementById("pgHistoryContainer");
    replaceHtml(pgHistoryContainer, `
    <div id='userPageHitsRpt' class='floatingDialogContainer'>
        <div class='floatingDialogHeader'>
            <div class='floatingDialogTitle'>page hits for `+ sessionStorage.UserName + `</div>
            <div class='dialogCloseButton'><img src='img/close.png' onclick='closePageHistory()'/></div>
        </div>
        <div id='divPgHitRpt' class='floatingDialogContents'></div>
    </div>`);

    let visitorId = sessionStorage.VisitorId;
    ('#userStatsLoadingGif').css("height", "27px").show();

    let sql = `select PageId, FolderName, OccuredDate, count(*) kount
                from st21569_registro.PageHit h
                join st21569_yagdrassel.CategoryFolder f on h.PageId = f.Id
                where VisitorId='`+ visitorId + `' group by PageId`;

    let pgHistObj = {};
    getDataFromServer("php/fetchAll.php?schema=oggleboo_Danni&query=" + sql, pgHistObj);
    let pgHistIntrvl = setInterval(() => {
        if (ready(pgHistObj.data)) {
            clearInterval(pgHistIntrvl);
            jdata = JSON.parse(pgHistObj.data);
            let dKluge = "<div class='rptLine'><div>PageId</div><div>FolderName</div><div>visits</div></div>";
            dKluge += "<div class='overflow600'>";
            jdata.forEach((obj) => {
                dKluge += "<div class='rptLine'><div>" + obj.PageId + "</div><div>" +
                    obj.FolderName + "</div><div>" + obj.kount + "</div></div>";
            });
            dKluge += "</div>";
            loadingGif("hide");
            // ('#userPageHitsRpt').css({ "top": "111px", "left": "1320px" }).draggable().show();
        }
    }, 51);
}
function closePageHistory() {
    removeContents(document.getElementById("pgHistoryContainer"));
}