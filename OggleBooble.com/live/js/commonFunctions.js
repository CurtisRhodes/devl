
/* ------------------ the data access pattern  -------------------------------*/{
    function getDataFromServer(url, myObject) {
        try {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (xhttp.readyState == 4) {
                    if (xhttp.status == 200)
                        if (!isNullorUndefined(xhttp.responseText))
                            myObject.data = xhttp.responseText;
                        else
                            myObject.data = false;
                    else
                        myObject.data = "error:" + xhttp.status;
                }
            };
            xhttp.open("GET", url, true);
            xhttp.send(myObject);
        } catch (e) {
            myObject.data = "error:" + e;
        }
    }

    function makeRequest(method, url) {
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send();
        });
    }

    function postDataToServer(url, data, myObject) {
        try {
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", url, true);
            xhttp.setRequestHeader('Access-Control-Allow-Origin', '*');
            xhttp.onreadystatechange = function () {
                if (xhttp.readyState == 4) {
                    let rtnData = xhttp.responseText;
                    if (isNullorUndefined(rtnData)) {
                        if (xhttp.status == 200)
                            myObject.data = "error:" + xhttp.statusText;
                    }
                    else {
                        if (xhttp.status == 200)
                            myObject.data = rtnData;
                        else
                            myObject.data = "error:" + xhttp.status;
                    }
                }
            };
            xhttp.onerror = function (e) {
                alert("XMLHttp error: " + e);
            };
            
            xhttp.send(data, myObject);
        } catch (e) {
            myObject.data = "error:" + e;
        }
    }

}

/*------------------- HTML Document Jquey equivilent  ---------------*/{
    function removeContents(ele) {
        var range = document.createRange(); // create range selection 
        range.selectNodeContents(ele); // select all content of the node
        range.deleteContents() // maybe there is replace command but i'm not find it
    }

    function replaceHtml(ele, frag) {
        if (typeof ele == "string") {
            ele = ele("ele");
        }

        var range = document.createRange(); // create range selection 
        range.selectNodeContents(ele); // select all content of the node
        range.deleteContents();
        ele.insertAdjacentHTML("beforeend", frag);
    }

    function fade(element, direction) {
        var op = 1, speed = 150;
        if (direction == "in") {
            op = 0;
            element.style.opacity = op;
            element.style.display = 'block';
        }
        var timer = setInterval(function () {
            if (direction == "in") {
                if (op >= 1.0) {
                    clearInterval(timer);
                }
            }
            else {
                if (op <= 0) {
                    clearInterval(timer);
                    element.style.display = 'none';
                }
            }
            element.style.opacity = op;
            // element.style.filter = 'alpha(opacity=' + op * 100 + ")";
            if (direction == "in")
                op += 0.1;
            else
                op -= 0.1;
        }, speed);
    }

    function ele(elementId) {
        return document.getElementById(elementId);
    }

    function hideElement(ele) {
        ele.style.display = "none";
    }

    function showElement(ele) {
        ele.opacity = 1;
        ele.style.display = "block";
    }
}

/* -------- useful utilities -----------*/{

    function getParams() {
        var params = {},
            pairs = document.URL.split('?').pop().split('&');
        for (var i = 0, p; i < pairs.length; i++) {
            p = pairs[i].split('=');
            params[p[0]] = p[1];
        }
        return params;
    }

    function create_UUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function isGuid(value) {
        //var regex = /[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}/i;
        let pattern = '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
        //var match = _regex.exec(value);
        var match = value.match(pattern);
        return match != null;
    }

    function isNumeric(value) {
        return !isNaN(value - parseFloat(value));
    }

    function todayString() {
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();
        return yyyy + '/' + mm + '/' + dd;
    }

    function dateString(dateObject) {
        let d = new Date(dateObject), day = d.getDate(), month = d.getMonth() + 1, yr = d.getFullYear();
        if (day < 10) {
            day = "0" + day;
        }
        if (month < 10) {
            month = "0" + month;
        }
        return month + "/" + day + "/" + yr;
    };

    function dateString2(dateObject) {
        let d = new Date(dateObject), day = d.getDate(), month = d.getMonth() + 1;
        if (day < 10) {
            day = "0" + day;
        }
        if (month < 10) {
            month = "0" + month;
        }
        return month + "/" + day;
    };

    function commaFormat(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function isNullorUndefined(val) {
        try {
            if (val === "") return true;
            if (val === null) return true;
            if (val === undefined) return true;
            if (val === "null") return true;
            if (val === "undefined") return true;
            return false;

        } catch (e) {
            alert("isNullorUndefined CAT error: " + e);
            //logCommonError("CAT", 123, e, "common is Null or Undefined");
        }
    }

    function ready(obj) {
        return !isNullorUndefined(obj);
    }

    function getXHRErrorDetails(jqXHR) {
        //alert('Request Status: ' + xhr.status + ' Status Text: ' + xhr.statusText + ' ' + xhr.responseText);
        var msg = '';
        if (jqXHR.status == 0) {
            msg = jqXHR.statusText + ' ' + jqXHR.responseText; // + ' ' + jqXHR.responseJSON.error.title;
        } else if (jqXHR.status === 404) {
            msg = 'Requested page not found. [404]';
        } else if (jqXHR.status === 500) {
            msg = 'Internal Server Error [500].';
        } else if (jqXHR.responseText === 'parsererror') {
            msg = 'Requested JSON parse failed.';
        } else if (jqXHR.responseText === 'timeout') {
            msg = 'Time out error.';
        } else if (jqXHR.responseText === 'abort') {
            msg = 'Ajax request aborted.';
        } else {
            msg = 'status:' + jqXHR.status + " : " + jqXHR.responseText;
        }
        return msg;
    }

    function htmlify(text) {
        text = text.replace(/&lt;/g, "<");
        text = text.replace(/&gt;/g, ">");
        return text;
    }

    function mouseMoveHandler(e, ele) {
        ele.style.left = e.clientX + "px";
        ele.style.top = e.clientY + "px";        
    }
    function mouseUpHandler() {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    }
}

/* -------- Cookies ----------------*/{
    function getCookieValue(itemName) {
        let returnValue = "cookie not found";
        try {
            let decodedCookie = decodeURIComponent(document.cookie);
            let cookieElements = decodedCookie.split(";");
            let cookieItem, cookieItemName, cookieItemValue;
            for (var i = 0; i < cookieElements.length; i++) {
                cookieItem = cookieElements[i].split("=");
                cookieItemName = cookieItem[0].trim();
                cookieItemValue = cookieItem[1];
                if (cookieItemName === itemName) {
                    if (!isNullorUndefined(cookieItemValue)) {
                        returnValue = cookieItemValue;
                        localStorage[itemName] = cookieItemValue;
                        break;
                    }
                }
            }
            if (returnValue == "cookie not found") {
                if (!isNullorUndefined(localStorage[itemName])) {
                    returnValue = localStorage[itemName];
                    rebuildCookie();
                }
            }
        }
        catch (e) {
            logCommonError("CAT", currentFolderId, e, "get CookieValue");
        }
        finally {
            return returnValue;
        }
    }
    function rebuildCookie() {
        try {
            document.cookie = "VisitorId=" + localStorage["VisitorId"];
            document.cookie = "UserName=" + localStorage["UserName"];
            document.cookie = "IsLoggedIn=" + localStorage["IsLoggedIn"];
            var expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 9);
            document.cookie = 'expires=' + expiryDate.toUTCString() + 'path=https://ogglebooble.com/';

        } catch (e) {
            console.log("CATCH rebuild cookie: " + e);
        }
    }
}

function logCommonPageHit() {
    try {
        if (sessionStorage.VisitorId !== adminVisitorId) {
            var data = new FormData();
            data.append('visitorId', sessionStorage.VisitorId);
            data.append('pageId', currentFolderId);

            let pgHitObj = {};
            //switch (document.location.hostname) {
            //    case "admin.ogglebooble.com":
            //        postDataToServer("https://admin.Ogglebooble.com/php/logPageHit.php", data, pgHitObj);
            //        break;
            //    case "live.ogglebooble.com":
            //        postDataToServer("https://live.Ogglebooble.com/php/logPageHit.php", data, pgHitObj);
            //}
            postDataToServer("../php/logPageHit.php", data, pgHitObj);
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
                                logCommonError("MXU", currentFolderId, pgHitObj.data, "log page hit");
                                console.log("max_user_connections");
                                displayStatusMessage("error", "max_user_connections. reload (F5)");
                                loadingGif("hide");
                            }
                            else {
                                logCommonError("AJX", pgHitObj.data, "log page hit");
                            }
                        }
                    }
                }
            }, 22);
            loadingGif("hide");
        }
    } catch (e) {
        logCommonError("CAT", currentFolderId, e, "log common pageHit");
    }
}

function setCurrentFolderId(folderId) {
    currentFolderId = folderId;
    localStorage.currentFolderId = folderId;
    sessionStorage.currentFolderId = folderId;
}

function setVisitorId(visitorId) {
    localStorage.VisitorId = visitorId;
    sessionStorage.VisitorId = visitorId;
    document.cookie = "VisitorId=" + visitorId;
}

function myAlert(message) {
    alert(message);
}

function displayStatusMessage(msgCode, message) {
    const divStatusMessage = ele("divStatusMessage");
    switch (msgCode) {
        case "ok":
            divStatusMessage.style.backgroundColor = "rgba(88, 139, 108, 0.75)";
            break;
        case "warning":
            divStatusMessage.style.backgroundColor = "#e6de3b";
            break;
        case "error":
            divStatusMessage.style.backgroundColor = "#c64e4e";
            break;
    }
    replaceHtml(divStatusMessage, message);
    fade(divStatusMessage, "in");

    if (msgCode === "ok") {
        setTimeout(function () { fade(divStatusMessage,"out"); }, 2500);
    }
    else {
        setTimeout(function () { fade(divStatusMessage, "out"); }, 15000);
    }
}

function logCommonError(errorCode, errorMessage, calledFrom) {
    
    try {
        let logErrSuccess = {};
        let errData = new FormData();
        errorCode = errorCode || "AJX";
        errorMessage = errorMessage || "No error message provided";
        calledFrom = calledFrom || "logCommonError";
        errData.append('ErrorCode', errorCode);
        errData.append('VisitorId', sessionStorage.VisitorId || commonAdminVisitorId);
        errData.append('FolderId', localStorage.currentActiveFolderId || "0");
        errData.append('CalledFrom', calledFrom);
        errData.append('ErrorMessage', errorMessage);
        postDataToServer("https://common.Ogglebooble.com/php/logCommonError.php", errData, logErrSuccess);
        let logErrInverval = setInterval(() => {
            if (!isNullorUndefined(logErrSuccess.data)) {
                clearInterval(logErrInverval);
                if (logErrSuccess.data.trim() == "ok") {
                    console.log(errorCode + " error from: " + calledFrom + " error: " + errorMessage);
                    alert("Error Code: " + errorCode + "\nError Message: " + errorMessage + "\nCalled From: " + calledFrom);
                }
                else {
                    if (!logErrSuccess.data.trim().startsWith("2300"))
                        console.log("log oggle error fail: " + logErrSuccess.data);
                }
            }
        }, 27);
    } catch (e) {
        console.log("logOggle error not working: " + e);
    }
}

function logCommonEvent(eventCode, folderId, calledFrom) {
    try {
        visitorId = sessionStorage.VisitorId;
        let logEvt = new Object;
        postDataToServer("../php/logEvent.php", {
            eventCode: eventCode,
            folderId: folderId,
            visitorId: visitorId,
            calledFrom: "COMMON/" + calledFrom
        }, logEvt);
        let lovEvtInterval = setInterval(() => {
            if (!isNullorUndefined(logEvt.data)) {
                if (logEvt.data.trim() == "ok") {
                    console.log("event logged.  VisitorId: " + visitorId + "  Code: " + eventCode + "  calledFrom: " + calledFrom);
                }
                else {
                    console.log("log Oggle event fail: " + success);
                    //logCommonError("AJX", folderId, success, "log event");
                }
            }
        }, 200);
    } catch (e) {
        console.log("log Oggle event catch fail: " + e);
        //logCommonError("CAT", folderId, e, "log Oggle event")
    }
}

function showDataInfo(message) {
    let dataifyInfo = ele("dataifyInfo");
    if (message == "hide")                                 
        dataifyInfo.style.display = "none";
    else {
        dataifyInfo.style.display = "block";
        replaceHtml(dataifyInfo, message);
    }

    ele("dataifyInfo").addEventListener("click", () => { dataifyInfo.style.display = "none"; });
}

function loadingGif(state) {
    try {
        if (state == "show")
            ele("loadingGif").style.display = "block";
        else
            ele("loadingGif").style.display = "none";
    } catch (e) {
        console.log("loadingGif: " + e);
    }
}

let currDot = "@";
function idleWait(char1, char2) {
    const idleDot = ele("idleDot");
    if (char1 === "hide")
        hideElement(idleDot);
    //replaceHtml(idleDot, "");
    else {
        showElement(idleDot);
        if (currDot == char1) {
            replaceHtml(idleDot, char1);
            currDot = char2;
        }
        else {
            replaceHtml(idleDot, char2);
            currDot = char1;
        }
    }
}
