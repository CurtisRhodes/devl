let verbose = true;

function logPageHit() {
    try {
        var data = new FormData();
        data.append('visitorId', sessionStorage.VisitorId);
        data.append('pageId', currentFolderId);

        let pgHitObj = new Object;
        postDataToServer("php/logPageHit.php", data, pgHitObj);
        let pgIntrv = setInterval(() => {
            if (ready(pgHitObj.data)) {
                clearInterval(pgIntrv)
                if (pgHitObj.data.trim() == "ok") {
                    // LazyVisitorAdd();
                }
                else {
                    if (pgHitObj.data.trim() == "23000") {
                        // logOggleActivity("DPH", currentFolderId, "log Page hit");
                    }
                    else {
                        if (pgHitObj.data.indexOf("connection Failed") > -1) { //: SQLSTATE[HY000][1203] User oggleboo_dbAdmin already has more than 'max_user_connections' active connections)
                            logOggleError("MXU", currentFolderId, pgHitObj.data, "log page hit");
                            console.log("max_user_connections");
                            displayStatusMessage("error", "max_user_connections. reload (F5)");
                            loadingGif("hide");
                        }
                        else {
                            logOggleError("AJX", pgHitObj.data, "log page hit");
                        }
                    }
                }
            }
        }, 22);
        loadingGif("hide");
    } catch (e) {
        logOggleError("CAT", currentFolderId, e, "log page hit");
    }
}

function logOggleError(errorCode, errorMessage, calledFrom) {
    try {
        var data = new FormData();
        data.append('ErrorCode', errorCode);
        data.append('VisitorId', sessionStorage.VisitorId);
        data.append('FolderId', currentFolderId);
        data.append('CalledFrom', calledFrom);
        data.append('ErrorMessage', errorMessage);

        let errRtn = new Object;
        postDataToServer("php/logError.php", data, errRtn);
        let errintrv = setInterval(() => {
            if (ready(errRtn.data)) {
                clearInterval(errintrv);
                if (errRtn.data === "ok") {
                    if (sessionStorage.VisitorId == adminVisitorId)
                        if (verbose)
                            alert("Error \n" + errorMessage + "\n called from: " + calledFrom);
                }
                else {
                    if (errorMessage == "error:503") {
                        alert("unable to connect to database " + calledFrom);
                    }
                    else {
                        if (sessionStorage.VisitorId == adminVisitorId)
                            alert("Error in logOggleError \n" + errorMessage + "\n called from: " + calledFrom);
                    }
                }
            }
        }, 205);
    } catch (e) {
        if (sessionStorage.VisitorId == adminVisitorId)
            alert("CATCH Error In Log Error \n" + errRtn.data + "\n called from: " + calledFrom);
    }
}

function logOggleActivity(activityCode, calledFrom) {

    try {
        var data = new FormData();
        data.append('activityCode', activityCode);
        data.append('visitorId', sessionStorage.VisitorId);
        data.append('folderId', currentFolderId);
        data.append('calledFrom', calledFrom);

        let logAct = new Object;
        postDataToServer("php/logActivity.php", data, logAct);
        loadingGif("hide");
    } catch (e) {
        logOggleError("CAT", currentFolderId, e, "log OggleActivity")
    }
}

function logOggleEvent(eventCode, calledFrom) {
    try {
        let visId = sessionStorage.VisitorId;
        if (isNullorUndefined(visId)) {
            visId = 'null or undefined';
            lookForVisitorId();
        }
        if (visId == {}) {
            sessionStorage.VisitorId = null;
            visId = 'objective';
            lookForVisitorId();
        }

        var data = new FormData();
        data.append('EventCode', eventCode);
        data.append('VisitorId', visId);
        data.append('FolderId', currentFolderId);
        data.append('CalledFrom', calledFrom);

        let logEvt = new Object;
        postDataToServer("php/logOggleEvent.php", data, logEvt);
        let evtIntrvl = setInterval(() => {
            if (ready(logEvt.data)) {
                clearInterval(evtIntrvl);
                if (logEvt.data.trim() !== "ok") {
                    logOggleError("AJX", logEvt.data.trim(), "log event");
                }
            }
        }, 34);
    } catch (e) {
        logOggleError("CAT", "code: " + eventCode + " e: " + e, "log Oggle event/" + calledFrom);
    }
}

function verifyVisitorCountry() {
    try {
        let zzrec = new Object;
        getDataFromServer("https://common.ogglebooble.com/php/fetch.php?schema=oggleboo_Visitors&query=select Country from Visitors where VisitorId='" + sessionStorage.VisitorId + "'", zzrec);
        let zzincre = setInterval(() => {
            if (!isNullorUndefined(zzrec.data)) {
                clearInterval(zzincre);
                if (zzrec.data == "ZZ") {
                    ipInfoRepair(zzVisitors[zzItems].VisitorId, zzVisitors[zzItems].IpAddress, "fixSome ZZVisitors");
                }

            }
        }, 200);
    } catch (e) {
        alert("fixSome ZZVisitors catch: " + e);
    }
}
