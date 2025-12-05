
function addVisitor(visitorData, calledFrom) {
    try {
        logOggleActivity("AV0", visitorData.initialPage, "add visitor"); // entering add visitor
        if (isNullorUndefined(visitorData.visitorId)) {
            logOggleActivity("AV1", visitorData.initialPage, "isNullorUndefined(visitorData.visitorId)"); // update Visitor fail
            return;
        }
        let addVObj = {};
        postDataToServer("php/addVisitor.php", visitorData, addVObj);
        let addVIncr = setInterval(function () {
            if (ready(addVObj.data)) {
                clearInterval(dataIncr);
                if (addVObj.data.trim() == "ok") {
                    logOggleActivity("AV1", "add visitor:" + calledFrom); // update visitor success
                    // callIpInfo(visitorData.visitorId, visitorData.ipAddress, visitorData.InitialPage, "add visitor");
                }
                else {
                    if (addVObj.data.indexOf("23000") > -1) {
                        logOggleEvent("AVD", "duplicate call:" + calledFrom); // update visitor XHR
                    }
                    else {
                        logOggleEvent("AVE", calledFrom); // update Visitor fail
                    }
                }
            }
        }, 124);
    } catch (e) {
        logOggleError("CAT", e, "add visitor: " + calledFrom);
    }
}

function updateVisitor(visitorData) {
    try {
        logOggleActivity("UV0", visitorData.ipAddress) // entering update Visitor
        let myObject = new Object;
        postDataToServer("php/updateVisitor.php", visitorData, myObject);
        let dataIncr = setInterval(function () {
            if (isNullorUndefined(myObject.data))
                loadingGif("show");
            else {
                clearInterval(dataIncr); loadingGif("hide");
                if (myObject.data.trim() == "ok") {
                    logOggleActivity("UV1", "update visitor"); // update visitor success
                    ipInfoBusy = false;
                }
                else {
                    logOggleActivity("UVE", "update visitor"); // update Visitor fail
                    logOggleError("AJX", success, "update visitor");
                }
            }
        }, 200);
    } catch (e) {
        logOggleError("CAT", e, "update visitor");
        logOggleActivity("UVC", "update visitor"); // update visitor CATCH error
    }
}

function addUnknownIpVisitor(folderId, failureMessage, calledFrom) {
    try {
        let bogusIp = "BAD" + Math.floor((Math.random() * 16000) + 1);
        //var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        let myObject = new Object;
        postDataToServer("php/addVisitor.php", {
            visitorId: sessionStorage.VisitorId,
            ip: bogusIp,
            failureMessage: failureMessage,
            initialPage: folderId
        }, myObject);
        let dataIncr = setInterval(function () {
            if (isNullorUndefined(myObject.data))
                loadingGif("show");
            else {
                clearInterval(dataIncr); loadingGif("hide");
                if (myObject.data.trim() == "ok") {
                    logOggleActivity("BVA", failureMessage + ", " + calledFrom); // add bad visitoriId success
                    getPhpUsersIp("add Unknown Ip Visitor");
                }
                else {
                    switch (myObject.data.trim()) {
                        case '23000':
                            logOggleActivity("BVI", "Bad Visitor Duplicate Ip : " + ipAddress);
                            break;
                        case '42000':
                        default:
                            logOggleActivity("BVE", ipAddress); // bad Visitor ajax error
                            logOggleError("AJX", "php error code: " + success, "add bad visitor");
                    }
                }
            }
        }, 200);
    } catch (e) {
        logOggleError("CAT", e, "add bad visitor");
    }
}

function fixRenamedVisitorId(oldVisitorId, newVisitorId) {
    let myObject = new Object;
    postDataToServer("php/addVisitor.php", {
        visitorId: sessionStorage.VisitorId,
        ip: bogusIp,
        failureMessage: failureMessage,
        initialPage: folderId
    }, myObject);
    let dataIncr = setInterval(function () {
        if (isNullorUndefined(myObject.data))
            loadingGif("show");
        else {
            clearInterval(dataIncr); loadingGif("hide");
            if (myObject.data.trim() == "ok") {
                logOggleActivity("0Z5", newVisitorId); // fixed renamed visitorId
            }
            else {
                switch (success.trim()) {
                    case 'code: 23000':
                        //logOggleError("",)
                        break;
                    case '42000':
                    default:
                        logOggleError("AJX", success.trim(), "change VisitorId on PageHits");
                }
            }
        }
    }, 200);
}

function addOrUpdateVisitor(visitorData, calledFrom) {
    try {
        if (visitorData.visitorId == "cookie not found") {
            logOggleError("BUG", "visitorId not found", "add Or Update Visitor");
            return;
        }
        if (!isGuid(visitorData.visitorId)) {
            logOggleError("BUG", "invalid visitorId: " + visitorData.visitorId, "add Or Update Visitor");
            return;
        }
        if (isNullorUndefined(visitorData.visitorId)) {
            logOggleError("BUG", "null visitorId", "add Or Update Visitor");
            return;
        }
        let getIpObj = {};
        getDataFromServer("php/fetch.php?schema=oogleboo_Visitors&query=Select * from Visitor where IpAddress='" + visitorData.ipAddress + "'", getIpObj);
        let getIpIntrvl = setInterval(function () {
            if (ready(getIpObj.data)) {
                clearInterval(getIpIntrvl)
                if (getIpObj.data == "false") {
                    let getVisObj = {};
                    getDataFromServer("php/fetch.php?schema=oogleboo_Visitors&query=Select * from Visitor where VisitorId='" + visitorData.VisitorId + "'", getVisObj);
                    let getVisIntrvl = setInterval(() => {
                        if (ready(getVisObj.data)) {
                            clearInterval(getVisIntrvl);
                            if (getVisObj.data === "false") {
                                // new IP new VisId

                                addVisitor(visitorData, "add or update Visitor:" + calledFrom);
                            }
                            else {
                                let existingVisitor = JSON.parse(getVisObj.data);
                                if (existingVisitor.IpAddress != visitorData.ip) {
                                    let existantVisitorId = existingVisitor.VisitorId;
                                    sessionStorage.VisitorId = existantVisitorId;
                                    localStorage.VisitorId = existantVisitorId;
                                    rebuildCookie();
                                    // expungeDuplicateIpVisitor(existingVisitor.VisitorId, visitorData.visitorId);
                                    removeVisitor(visitorData.VisitorId);
                                    logOggleActivity("XVA", "expunge extra VisitorId" + success.trim()); // expunge extra VisitorId Ajax fail
                                    visitorData.visitorId = existantVisitorId;
                                }
                                updateVisitor(visitorData);
                            }
                        }
                    }, 200);
                }
                else {
                    let existingVisitor = JSON.parse(ipData);
                    if (existingVisitor.VisitorId == visitorData.visitorId) {
                        updateVisitor(visitorData);
                    }
                    else {
                        let existantVisitorId = existingVisitor.VisitorId;
                        sessionStorage.VisitorId = existantVisitorId;
                        localStorage.VisitorId = existantVisitorId;
                        rebuildCookie();
                        // expungeDuplicateIpVisitor(existingVisitor.VisitorId, visitorData.visitorId);
                        removeVisitor(visitorData.VisitorId);
                        logOggleActivity("XVA", "expunge extra VisitorId"); // expunge extra VisitorId Ajax fail
                        visitorData.visitorId = existantVisitorId;
                    }
                }
            }
        }, 200);
    } catch (e) {
        logOggleError("CAT", e, "add or updateVisitor," + calledFrom);
    }
}