function addEmptyVisitor(ipAddress) {

    let newVisitorId = create_UUID();
    if (ready(sessionStorage.VisitorId)) {
        newVisitorId = sessionStorage.VisitorId;
    }
    else {
        logOggleActivity("AEV", "add emptyVisitor"); // entered with no visitorId
        sessionStorage.VisitorId = newVisitorId;
    }
    
    let visFormData = new FormData();
    visFormData.append("visitorId", newVisitorId);
    visFormData.append("ipAddress", ipAddress);
    visFormData.append("city", "zzz");
    visFormData.append("country", "zzz");
    visFormData.append("region", "zzz");
    visFormData.append("geoCode", "zzz");
    visFormData.append("initialPage", currentFolderId);
    let addVisObj = {};
    postDataToServer("php/addVisitor.php", visFormData, addVisObj);
    let addVisIncr = setInterval(function () {
        if (ready(addVisObj.data)) {
            clearInterval(addVisIncr);
            loadingGif("hide");
            let success = addVisObj.data.trim();
            if (success === "ok") {
                logOggleActivity("NEW", "add empty visitor"); // new Visitor Added
                if (sessionStorage.VisitorId !== adminVisitorId) {
                    sessionStorage.VisitorId = newVisitorId;
                    localStorage.VisitorId = newVisitorId;
                    sessionStorage.VisitorIdVerified = "ok";
                }
            }
            else {
                if (success == 'code: 23000') {
                    logOggleError("VAE", success.trim(), "visitorId already exists");
                    sessionStorage.VisitorIdVerified = "ok";
                }
                else
                    logOggleError("AJX", success.trim(), "change VisitorId on PageHits");
            }
        }
    }, 88);// add visitor interval
}

function getCurrentIP() {
}

function LazyVisitorAdd() {

}

function addVisitor(visitorData) {
    let visFormData = new FormData();
    visFormData.append("visitorId", visitorData.visitorId);
    visFormData.append("ipAddress", visitorData.ip);
    visFormData.append("city", visitorData.city);
    visFormData.append("country", visitorData.country);
    visFormData.append("region", visitorData.region);
    visFormData.append("geoCode", visitorData.loc);
    visFormData.append("initialPage", currentFolderId);
    let addVisObj = {};
    postDataToServer("php/addVisitor.php", visFormData, addVisObj);
    let addVisIncr = setInterval(function () {
        if (ready(addVisObj.data)) {
            clearInterval(addVisIncr);
            loadingGif("hide");
            let success = addVisObj.data.trim();
            if (success == "ok") {
                sessionStorage.VisitorId = visitorData.visitorId;
                localStorage.VisitorId = visitorData.visitorId;
                logOggleEvent("NEW", "add newVisitor"); // new Visitor Added
                sessionStorage.VisitorIdVerified = "ok";
            }
            else {
                if (success == 'code: 23000') {
                    logOggleError("VAE", success.trim(), "visitorId already exists");
                    sessionStorage.VisitorIdVerified = "ok";
                }
                else
                    logOggleError("AJX", success.trim(), "change VisitorId on PageHits");
            }
        }
    }, 88);// add visitor interval

}

function ipifyLookup(currentIp) {
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
        logOggleError("CAT", e, "ipify lookup");        
    }
}

function callIpInfo(ipAddress, visitorId) {
    try {
        logOggleActivity("IP0", "callI pInfo: " + ipAddress);// entering IpInfo            
        let ipInfoObj = {};
        getDataFromServer("https://ipinfo.io/" + ipAddress + "?token=e66f93d609e1d8", ipInfoObj);
        let ipInfoIntrvl = setInterval(function () {
            if (ready(ipInfoObj.data)) {
                clearInterval(ipInfoIntrvl)
                if (ipInfoObj.data.indexOf("error") > -1) {
                    logOggleError("409", ipInfoObj.data, "call IpInfo");
                    logOggleActivity("IP4", "call IpInfo"); //  "null response"
                    // callIpGeoLoc(visitorId, ipAddress);
                }
                else {
                    logOggleActivity("IP1", "ip: " + ipAddress); // IpInfo success
                    let response = JSON.parse(ipInfoObj.data);

                    let visitorData = {
                        visitorId: visitorId,
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
    catch (e) {
        logOggleError("CAT", e, "call IpInfo");
    }
}

function callIpGeoLoc(visitorId, ipAddress) {
    // IpInfo alternative
    try {
        let ipGeoObj = {};
        getDataFromServer('https://api.ipgeolocation.io/ipgeo?apiKey=2d914391de9b4d32943a5c018d06a5ab&ip=' + ipAddress, ipGeoObj);
        let ipGeoObjIntrvl = setInterval(function () {
            if (ready(ipGeoObj.data)) {
                clearInterval(ipGeoObjIntrvl);
                if (isNullorUndefined(ipGeoObj.data)) {
                    logOggleActivity("IG4", "call IpGeoLoc"); // null response
                    logOggleError("IG4", ipAddress, "call IpGeoLoc");
                }
                else {
                    response = JSON.parse(ipGeoObj.data);
                    logOggleActivity("IG1", "success Ip: " + ipAddress); // IpGeoLoc success

                    updateVisitor({
                        visitorId: visitorId,
                        ipAddress: ipAddress,
                        city: response.city.replace(/'/g, "\\'"),
                        country: response.country_code2,
                        region: response.state_prov.replace(/'/g, "\\'"),
                        geoCode: response.geoname_id,
                        initialPage: currentFolderId
                    }); //, "api.ipgeolocation.io");
                }
            }
        }, 121);
    } catch (e) {
        logOggleError("CAT", e, "call IpGeoLoc");
    }
}

function updateVisitor(updateVisData) {
    try {
        let visitorId = sessionStorage.VisitorId;
        let visFormData = new FormData();
        visFormData.append("visitorId", visitorId);
        visFormData.append("ipAddress", updateVisData.ipAddress);
        visFormData.append("city", updateVisData.city);
        visFormData.append("country", updateVisData.country);
        visFormData.append("region", updateVisData.region);
        visFormData.append("geoCode", updateVisData.loc);
        visFormData.append("initialPage", currentFolderId);
        let updateVisObj = {};
        postDataToServer("php/updateVisitor.php", visFormData, updateVisObj);
        let updateVisIncr = setInterval(function () {
            if (isNullorUndefined(updateVisObj.data))
                loadingGif("show");
            else {
                clearInterval(updateVisIncr);
                loadingGif("hide");
                if (updateVisObj.data.trim() == "ok") {
                    logOggleEvent("UDV", "add newVisitor"); // visitor updated
                }
                else {
                    logOggleError("UVE", updateVisObj.data.trim(), "update visitor");
                }
            }
        }, 200);
    } catch (e) {
        logOggleError("CAT", e, "update visitor");
    }
}


//// get location
//$url = json_decode(file_get_contents("http://api.ipinfodb.com/v3/ip-city/?key=/*userapikey*/
//// you can get your api key form http://ipinfodb.com/
////ip = ".$_SERVER['REMOTE_ADDR']." & format=json"));
//$country = $url -> countryName;  // user country
//$city = $url -> cityName;       // city
//$region = $url -> regionName;   // regoin
//$latitude = $url -> latitude;    //lat and lon
//$longitude = $url -> longitude;

//// get time
//date_default_timezone_set('UTC');
//$date = date("Y-m-d");
//$time = date("H:i:s");

//window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
//var pc = new RTCPeerConnection({ iceServers: [] }),
//    noop = function () { };
//pc.createDataChannel("");
//pc.createOffer(pc.setLocalDescription.bind(pc), noop);
//pc.onicecandidate = function (ice) {
//    if (!ice || !ice.candidate || !ice.candidate.candidate) return;
//    var myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
//    $('.ipAdd').text(myIP);
//    pc.onicecandidate = noop;
// let ip = document.location.origin;

