function validateUser() {
    try {
        if (isNullorUndefined(sessionStorage.VisitorId)) {
            if (ready(localStorage.VisitorId)) {
                sessionStorage.VisitorId = localStorage.VisitorId;
                //logOggleActivity('IP1',""); // visitorId found in local storage
                logVisit(); // "return visitor"
            }
            else {
                lookForUserByIp();
            }
        }
        else {
            if (isNullorUndefined(sessionStorage.VisitorIdValid)) {
                validateVisitorId();
            }
            logCommonPageHit();
        }

        if (sessionStorage.VisitorId == adminVisitorId) {
            // do tests here
            // 7a8e876b-6f3b-4109-9f30-66caba1046bb
            // sessionStorage.VisitorIdValid = null; // reset VisitorIdValid to force validateVisitorId() to run
            // validateVisitorId();

            //addIpOnlyVisitor("787.777.777");
        }
    }
    catch (e) {
        logCommonError("CAT", e, "validate user");
        // ReferenceError: getAlbumPageInfo is not defined
    }
}

function validateVisitorId() {
    try {
        if (ready(localStorage.VisitorId)) {

            let visitorObj = {};
            let sql = "select * from Visitor where VisitorId = '" + sessionStorage.VisitorId + "'";
            getDataFromServer("php/fetch.php?schema=oggleboo_Visitors&query=" + sql, visitorObj);
            let verifyVisitorIntrvl = setInterval(function () {
                if (ready(visitorObj.data)) {
                    clearInterval(verifyVisitorIntrvl);
                    if (visitorObj.data.trim() == "false") {
                        lookForUserByIp();
                    }
                    else {

                        visitorData = JSON.parse(visitorObj.data);
                        sessionStorage.Country = visitorData.Country;

                        if (isNullorUndefined(visitorData.Country)) {
                            callIpInfo(visitorData.IpAddress);
                        }
                        // check for registered user
                        let regUserObj = {};
                        let sql = "select * from RegisteredUser where VisitorId = '" + sessionStorage.VisitorId + "'";
                        getDataFromServer("php/fetch.php?schema=oggleboo_Visitors&query=" + sql, regUserObj);
                        let regUserIntrvl = setInterval(function () {
                            if (ready(regUserObj.data)) {
                                clearInterval(regUserIntrvl);
                                if (regUserObj.data == "false") {
                                    sessionStorage.UserName = "unregistered";
                                }
                                else {
                                    if (regUserObj.data.indexOf("rror") > 0) {
                                        alert("unable to connect to database " + regUserObj.data);
                                    }
                                    else {
                                        let userData = JSON.parse(regUserObj.data);
                                        sessionStorage.UserName = userData.UserName;
                                    }
                                }
                                if (window.location.hostname == "live.ogglebooble.com") {
                                    showLogin();
                                    logVisit();
                                }
                                sessionStorage.VisitorIdValid = "ok";
                            }
                        }, 234);
                    }
                }
            }, 311);
        }
    } catch (e) {
        if (sessionStorage.VisitorId == adminVisitorId) {
            myAlert("verify VisitorId: " + e);
        }
        else {
            logCommonError("CAT", e, "verify VisitorId");
        }
    }
}

function lookForUserByIp() {
    try {
        let ipObj = {};
        getDataFromServer("php/getUsersIp.php", ipObj);
        let ipObIntrvl = setInterval(() => {
            if (ready(ipObj.data)) {
                clearInterval(ipObIntrvl);
                if (ipObj.data.trim() == "[]") {
                    // no Ip found
                    sessionStorage.VisitorId = "unknown user";
                    sessionStorage.UserName = "unknown user";
                    logOggleActivity("IP7", "look for User byIp"); // no VisitorId and Ip not found by php
                }
                else {
                    let getVisObj = {};
                    getDataFromServer("php/fetchAll.php?schema=oggleboo_Visitors&query=Select * from Visitor where IpAddress='" + ipObj.data + "'", getVisObj);
                    let getVisIntrvl = setInterval(function () {
                        if (ready(getVisObj.data)) {
                            clearInterval(getVisIntrvl);
                            if (getVisObj.data.trim() == "[]") {
                                logOggleActivity("IP4", "no VisitorId for Ip" + ipObj.data);  //null VisitorId and Ip valid but not found in Visitor table (happy path)

                                addIpOnlyVisitor(ipObj.data);

                                // callIpInfo(ipObj.data);
                            }
                            else {
                                let visitorInfo = JSON.parse(getVisObj.data);
                                sessionStorage.VisitorId = visitorInfo[0].VisitorId;
                                validateVisitorId();
                                logOggleActivity('IP2', "Ip: " + ipObj.data); // VisitorId found by Ip
                            }
                        }
                    }, 366);
                }
            }
        }, 144);
        //let cookieVisitorId = getCookieValue("VisitorId");
    } catch (e) {
        logOggleError("CAT", e, "get Php Ip");
    }
}

function logVisit() {
    try {
        let logVisObj = {};
        let logVisData = new FormData();
        logVisData.append("visitorId", sessionStorage.VisitorId);
        logVisData.append("appName", "OggleBooble");
        postDataToServer("php/logVisit.php", logVisData, logVisObj);
        let logVisIntrvl = setInterval(function () {
            if (ready(logVisObj.data)) {
                clearInterval(logVisIntrvl)
                if (logVisObj.data.trim() == "ok") {
                    logOggleActivity("VIS", "OggleBooble"); // visit logged
                    if (sessionStorage.UserName == "unregistered") {
                        displayStatusMessage("ok", "Welcome unknown Visitor");
                        callIpInfo(logVisData.IpAddress);
                    }
                    else
                        displayStatusMessage("ok", "Welcome back " + sessionStorage.UserName);
                }
                else {
                    switch (logVisObj.data.trim()) {
                        case 'code: 23000':
                            //logCommonError("",)
                            break;
                        case '42000':
                        default:
                            logCommonError("AJX", logVisObj.data.trim(), "log visit");
                    }
                }
            }
        }, 73);
    } catch (e) {
        logCommonError("CAT", e, "log visit");
    }
}

function callIpInfo(ipAddress) {
    try {
        if (isNullorUndefined(ipAddress)) {
            logCommonError("IP0", "call ipInfo: " + ipAddress, "call IpInfo");
            return;
        }
        else {
            logOggleActivity("IP0", "call ipInfo: " + ipAddress);// entering IpInfo            
            let ipInfoObj = {};
            getDataFromServer("https://ipinfo.io/" + ipAddress + "?token=e66f93d609e1d8", ipInfoObj);
            let ipInfoIntrvl = setInterval(function () {
                if (ready(ipInfoObj.data)) {
                    clearInterval(ipInfoIntrvl)
                    if (ipInfoObj.data.indexOf("error") > -1) {
                        logCommonError("409", ipInfoObj.data, "call IpInfo");
                        logOggleActivity("IPF", "call IpInfo"); //  "null response"
                        callIpGeoLoc(ipAddress);
                    }
                    else {
                        logOggleActivity("IP1", "ip: " + ipAddress); // IpInfo success
                        let response = JSON.parse(ipInfoObj.data);

                        let visitorData = {
                            ipAddress: ipAddress,
                            city: response.city.replace(/'/g, "\\'"),
                            country: response.country,
                            region: response.region.replace(/'/g, "\\'"),
                            geoCode: response.loc
                        };
                        updateVisitor(visitorData);
                    }
                }
            }, 188);
        }
    }
    catch (e) {
        logCommonError("CAT", e, "call IpInfo");
    }
}

function addIpOnlyVisitor(ipAddress) {
    try {
        let newVisitorId = create_UUID();

        let visFormData = new FormData();
        visFormData.append("visitorId", newVisitorId);
        visFormData.append("ipAddress", ipAddress);
        // visFormData.append("city", "unknown");
        let addUpdateVisObj = {};
        postDataToServer("php/addIpOnlyVisitor.php", visFormData, addUpdateVisObj);
        let updateVisIncr = setInterval(() => {
            if (ready(addUpdateVisObj.data)) {
                clearInterval(updateVisIncr);
                loadingGif("hide");
                if (addUpdateVisObj.data.trim() == "ok") {
                    sessionStorage, VisitorId = newVisitorId;
                    localStorage.VisitorId = newVisitorId;

                    logOggleActivity("NEW", "addIpOnlyVisitor"); // new Visitor Added
                }
                else {
                    logCommonError("AJX", addUpdateVisObj.data, "addIpOnlyVisitor");
                }
            }
        }, 200);
    } catch (e) {
        logCommonError("CAT", e, "addUpdate Visitor");
    }
}

function updateVisitor(visitorData) { 
    try {
        let visFormData = new FormData();
        visFormData.append("visitorId", localStorage.VisitorId);
        visFormData.append("ipAddress", visitorData.ipAddress);
        visFormData.append("city", visitorData.city);
        visFormData.append("country", visitorData.country);
        visFormData.append("region", visitorData.region);
        visFormData.append("geoCode", visitorData.geoCode);
        visFormData.append("initialPage", currentFolderId);

        var hostname = window.location.hostname;
        switch (hostname) {
            case "admin.ogglebooble.com":
                updateAdminVisitor(visFormData);
                break;
            case "live.ogglebooble.com":
            default:
                let updateVisObj = {};
                postDataToServer("php/updateVisitor.php", visFormData, updateVisObj);
                let updateVisIncr = setInterval(function () {
                    if (ready(updateVisObj.data)) {
                        clearInterval(updateVisIncr);
                        if (updateVisObj.data.trim() == "ok") {
                            logOggleActivity("UDV", "update Visitor"); // visitor updated}
                        }
                        else {
                            logCommonError("AJX", updateVisObj.data, "update Visitor");
                        }
                    }
                }, 200);
        }
    } catch (e) {
        logCommonError("CAT", e, "update Visitor");
    }
}

function callIpGeoLoc(ipAddress) {
    // IpInfo alternative
    try {
        let ipGeoObj = {};
        getDataFromServer('https://api.ipgeolocation.io/ipgeo?apiKey=2d914391de9b4d32943a5c018d06a5ab&ip=' + ipAddress, ipGeoObj);
        let ipGeoObjIntrvl = setInterval(function () {
            if (ready(ipGeoObj.data)) {
                clearInterval(ipGeoObjIntrvl);
                if (isNullorUndefined(ipGeoObj.data)) {
                    logOggleActivity("IG4", "call IpGeoLoc"); // null response
                    logCommonError("IG4", ipAddress, "call IpGeoLoc");
                }
                else {
                    response = JSON.parse(ipGeoObj.data);
                    logOggleActivity("IG1", "success Ip: " + ipAddress); // IpGeoLoc success

                    let visitorData = {
                        visitorId: visitorId,
                        ipAddress: ipAddress,
                        city: response.city.replace(/'/g, "\\'"),
                        country: response.country_code2,
                        region: response.state_prov.replace(/'/g, "\\'"),
                        geoCode: response.geoname_id,
                        initialPage: currentFolderId
                    };
                    updateVisitor(visitorData);
                }
            }
        }, 121);
    } catch (e) {
        logCommonError("CAT", e, "call IpGeoLoc");
    }
}

function ipifyLookup() {
    // php get Ip alternative
    try {

        let ipInfoObj = {};
        getDataFromServer("https://api.ipify.org", ipInfoObj);
        let ipInfoIntrvl = setInterval(function () {
            if (ready(ipInfoObj.data)) {
                clearInterval(ipInfoIntrvl);
                let ipifyIpAddress = ipInfoObj.data;

                //logOggleActivity("IFN", currentFolderId, calledFrom); // ipify null response
                //addUnknownIpVisitor(currentFolderId, "ipify null phpIpResponse", "ipify Lookup/" + calledFrom);


                if (currentIp == ipifyIpAddress) {
                    logOggleActivity("IFC", "ipify Lookup");  // no help from ipifyLookup
                }
                else {
                    // updateVisitorIP
                    let updateVisData = new FormData();
                    updateVisData.append(visitorId, sessionStorage.VisitorId);
                    updateVisData.append(element, value);
                    let updateVisObj = {};
                    postDataToServer("php/updateVisitorIP.php", updateVisData, updateVisObj);
                    let updateVisIntrvl = setInterval(function () {
                        if (ready(updateVisObj.data)) {
                            clearInterval(updateVisIntrvl);
                            if (updateVisObj.data == "ok") {

                            }
                        }
                    }, 200);
                }
            }
        }, 95);
    }
    catch (e) {
        logCommonError("CAT", e, "ipify lookup");
    }
}
