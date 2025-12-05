
function showLogin() {
    try {
        setTimeout(() => {
            if (ready(sessionStorage.UserName)) {
                const divLogin = ele("divLogin");
                let loginLabel = sessionStorage.UserName;
                //if (sessionStorage.VisitorId == adminVisitorId) { }
                if (sessionStorage.UserName === "unregistered") {
                    loginLabel = "  please login";
                    divLogin.addEventListener("click", () => { showRegisterDialog() });
                }
                else {
                    // showUserProfileDialog()
                    divLogin.addEventListener("click", () => { showUserStatsDialog() });
                }

                internationalHello(loginLabel);
            }
        }, 1456);
    } catch (e) {
        logOggleError("CAT", e, "show login");
    }
}

function internationalHello(loginLabel) {
    flagImgSrc = "https://flagsapi.com/PW/shiny/24.png"; // Default flag for unknown country"
    if (ready(sessionStorage.Country)) {
        flagImgSrc = "https://flagsapi.com/" + sessionStorage.Country + "/shiny/24.png";
    }
    nationalHello = translate("greeting");

    let logintitle = "show user info";
    if (sessionStorage.UserName === "unregistered") {
        logintitle = "register to login";
    }
    replaceHtml(ele("divLogin"),
    `<div style="display: flex; align-items: center;">
        <p id="labelLogin" style="margin:0" title="`+ logintitle + `">&nbsp;` + nationalHello + ' ' + loginLabel + `</p>
    </div>`);
    //<img src=` + flagImgSrc + ` alt="your flag" >
}

function translate(wordage) {

    if (wordage == "greeting") {
        let greeting = "olá ";
        switch (sessionStorage.Country) {
            case "US": greeting = "hi "; break;
            case "GB": greeting = "ello "; break;
            case "FR": greeting = "bonjour "; break;
            case "DE": greeting = "hallo "; break;
            case "ES": greeting = "hola "; break;
            case "IT": greeting = "ciao "; break;
            case "NL": greeting = "hallo "; break;
            case "JP": greeting = "こんにちは "; break;
            case "CN": greeting = "你好 "; break;
            case "RU": greeting = "привет "; break;
            case "IN": greeting = "नमस्ते "; break;
            case "BR": greeting = "olá "; break;
            default:
                if (sessionStorage.Country != "") {
                    logOggleError("BUG", "unrecognized country code: " + sessionStorage.Country, "internationalHello");
                }
        }
        return greeting;
    }
}

function showRegisterDialog() {

    let rtnObj = {};
    getDataFromServer("php/fetch.php?schema=oggleboo_Visitors&query=select * from RegisteredUser where VisitorId='" + sessionStorage.VisitorId + "'", rtnObj);
    let dataIntrvl = setInterval(() => {
        if (ready(rtnObj.data)) {
            clearInterval(dataIntrvl);
            if (rtnObj.data != "false") {
                displayStatusMessage("error", "already registered");
                hideElement(registerDialog);
                setTimeout(() => { showUserProfileDialog() }, 1888);                
            }
        }
    }, 333);

    document.body.insertAdjacentHTML("beforeend", `
    <div id="registerDialog" class="standardDialogBox">
        <div class='standardDialogHeader'>
            <div class='standardDialogTitle'>Register</div>
            <div id="registerDialogCloseButton" class='dialogCloseButton'>
                <img src='https://common.ogglebooble.com/img/close.png' title='close dialog window' alt='close' />
            </div>
        </div>
        <div id='registerDialogBody' class='standardDialogContents'>
            <div id='registerError' class='errorMsg'></div>
            <div class='littleLabelRow'><span>email</span> <span id='emailError' class='errorMsg'></span></div>
            <div class='inputRow'><input Id='txtRegEmail' class=''></input></div>
            <div class='littleLabelRow'><span>clever user name</span> <span id='userNameError' class='errorMsg'></div>
            <div class='inputRow'><input Id='txtRegUsrName' class='' ></input></div>
            <div class='bannerButton' style='margin-top:16px' onclick='addRegisterUser()'>submit</div>
        </div>
    </div>`);

    const registerDialog = ele("registerDialog");
    ele("registerDialogBody").style.padding = "23px";
    registerDialog.style.top = "111px";
    registerDialog.style.left = "900px";
    showElement(registerDialog);

    ele("registerDialogCloseButton").addEventListener("click", () => { ele("registerDialog").remove() });

    logOggleEvent("RQO", "show register dialog") // register dialog opened
    ele("txtRegUsrName").addEventListener("blur", () => { verifyUniqueGobyName(ele("txtRegUsrName").value) })
    ele("txtRegEmail").addEventListener("blur", () => { validateEmail(ele("txtRegEmail").value) });
}

function verifyUniqueGobyName(gobyName) {
    let isUnqObj = {};
    getDataFromServer("php/fetch.php?schema=oggleboo_Visitors&query=select * from RegisteredUser where UserName='" + gobyName + "'", isUnqObj);
    let isUnqIntrvl = setInterval(() => {
        if (ready(isUnqObj.data)) {
            clearInterval(isUnqIntrvl);
            if (isUnqObj.data != "false") {
                replaceHtml(ele("userNameError"), "goby name already taken");
            }
            else {
                replaceHtml(ele("userNameError"), "");
            }
        }
    }, 562);
}

function validateEmail(email) {
    const res = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return res.test(String(email).toLowerCase());
}

function addRegisterUser() {
    try {
        let visitorId = sessionStorage.VisitorId;
        let userName = ele("txtRegUsrName").value;
        if (userName == "") {
            replaceHtml(ele("userNameError"), "required");
            return;
        }
        let userEmail = ele("txtRegEmail").value;
        if (userEmail=="") {
            replaceHtml(ele("emailError"), "required");
            return;
        }

        let rData = new FormData;
        rData.append("visitorId", visitorId);
        rData.append("userEmail", userEmail);
        rData.append("userName", userName);
        let regUsrObj = {};
        postDataToServer("php/registerUser.php", rData, regUsrObj);
        let regUsrObjIntrvl = setInterval(() => {
            if (ready(regUsrObj.data)) {
                clearInterval(regUsrObjIntrvl);
                if (regUsrObj.data == "ok") {
                    displayStatusMessage("ok", "thanks for registering " + userName);
                    sendOggleMail("Someone Registered!", "userEmail: " + userEmail);
                    ele("registerDialog").remove();
                    checkUserStatus("new registration");
                    logOggleEvent("REG", "add register user")// someone registered
                    setTimeout(() => {
                        showUserProfileDialog();                        
                    }, 888);
                }
                else {
                    if (regUsrObj.data.indexOf("23000")>-1) {
                        replaceHtml(ele("registerError"), "already registered");
                        setTimeout(() => {
                            ele("registerDialog").remove();
                            showUserProfileDialog();
                        }, 888);
                    }
                    else
                        replaceHtml(ele("registerError"), regUsrObj.data);
                }
            }
        }, 442);
    } catch (e) {
        replaceHtml(ele("registerError"), e);
        logOggleError("CAT", e, "register user");
    }
}

function showUserProfileDialog() {

    const userProfileDialog = ele("standardDialogBox");
    replaceHtml(ele("standardDialogTitle"), "user profile");
    replaceHtml(ele("standardDialogContents"), getUserDialogHtml());

    userProfileDialog.style.top = "78px";
    userProfileDialog.style.left = "518px";
    showElement(userProfileDialog);
    ele("standardDialogCloseButton").addEventListener("click", () => { hideElement(userProfileDialog) });
    ele("standardDialogTitle").addEventListener('mousedown', (e) => {
        e.preventDefault();
        currentDragElement = userProfileDialog;
        mouseX = e.clientX;
        mouseY = e.clientY;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    loadUserProfileData()
    
}

function getUserDialogHtml() {
    return `
    <div id='userProfileDialog' class='floatingDialogContainer'>
        <div id='userProfileDialogError' class='errorMsg'></div>
        <div id='floatingDialogContents' class='floatingDialogContents'>
        <div class='littleLabelRow'><span>first name</span><span style='margin-left:145px'>last name</span></div>
        <div class='inputRow'>
            <input Id='txtFname'></input>
            <input Id='txtLname'></input>
        </div>
        <div class='littleLabelRow'><span>email</span></div>
        <div class='inputRow'><input Id='txtUsrEmail' size=45 ></input></div>
        <div class='littleLabelRow'><span>goby name</span></div>
        <div class='inputRow'><input Id='txtUsrName' size=45 ></input></div>
        <div class='littleLabelRow'><span>City</span>
                <span style='margin-left:210px'>Region</span><span style='margin-left:200px'>Country</span></div>
        <div class='inputRow'>
            <input Id='txtCity'></input>
            <input Id='txtRegion'></input>
            <select Id='selCountry' style='width:175px;height:27px;'></select>
        </div>
        <div class='inputRow'>
            I am <input type='radio' value='1' name='rdoGender' checked='checked'></input>male
            <input type='radio' value='5' name='rdoGender'></input>female
            <input type='radio' value='9' name='rdoGender'></input>other
        </div>
        <div class='inputRow'>
            I am <input type='radio' value='1' name='rdoSex' checked='checked'></input>straight
            <input type='radio' value='2' name='rdoSex'></input>gay
            <input type='radio' value='3' name='rdoSex'></input>other
        </div>
        <div class='inputRow'>
            I am <input type='radio' value='8' name='rdoPolitics' checked='checked'></input>liberal
            <input type='radio' value='2' name='rdoPolitics'></input>conservative
            <input type='radio' value='4' name='rdoPolitics'></input>maga
        </div>
        <br/>
        <div class='littleLabelRow'>humble brag about your awesomness:</div>
        <div class='inputRow'>
            <textarea id="txtHumbleBrag" class='xxcommentsTextArea' style='width: 630px; height: 146px;'></textarea>
        </div>
        <div class='bannerButton' onclick='updateUserProfile()'>submit</div>
    </div>`;
}

function loadUserProfileData() {
    //updateLoggedInStatus("yes");
    //localStorage["VisitorId"] = 
    visitorId = sessionStorage["VisitorId"];

    try {
        let userProfileObj = {};
        getDataFromServer("php/fetch.php?schema=oggleboo_Visitors&query=select * from vwUser where VisitorId='" + sessionStorage.VisitorId + "'", userProfileObj);
        // getDataFromServer("php/registroFetch.php?query=select * from Visitor where VisitorId='" + sessionStorage.VisitorId + "'", visObj);
        let userProfileIntrvl = setInterval(() => {
            if (ready(userProfileObj.data)) {
                clearInterval(userProfileIntrvl);
                let userData = JSON.parse(userProfileObj.data);

                loadCountryCodes(userData.Country);
                let ipAddress = userData.IpAddress;
                let initialVisit = userData.InitialVisit;

                ele("txtFname").value = userData.FirstName;
                ele("txtLname").value = userData.LastName;
                ele('txtUsrEmail').value = userData.Email;
                ele("txtUsrName").value = userData.UserName;
                ele('selCountry').value = userData.Country;
                ele("txtRegion").value = userData.Region;
                ele('txtCity').value = userData.City;

                document.querySelector('input[name="rdoGender"]:checked').value = userData.Gender ?? "1";
                document.querySelector('input[name="rdoSex"]:checked').value = userData.SexualOrientation ?? "1";
                document.querySelector('input[name="rdoPolitics"]:checked').value = userData.Politics ?? "2";

                ele('txtHumbleBrag').value = userData.HumbleBrag;
            }
        }, 34);

    } catch (e) {
        alert("loadUserProfileData error:" + e);
    }
}

function updateUserProfile() {
    try {
        replaceHtml(ele("userProfileDialogError"), "");

        if (ele("txtUsrName").value == '') {
            replaceHtml(ele("userProfileDialogError"), "userName required");
            return;
        }

        const userEmail = ele("txtUsrEmail").value;
        if (!validateEmail(userEmail)) {
            replaceHtml(ele("userProfileDialogError"), "invalid email");
            return;
        }

        let usrFdata = new FormData;
        usrFdata.append("visitorId", sessionStorage.VisitorId);
        usrFdata.append("userEmail", userEmail);
        usrFdata.append("userName", ele("txtUsrName").value);
        usrFdata.append("fName", ele("txtFname").value);
        usrFdata.append("lName", ele("txtLname").value);
        usrFdata.append("city", ele("txtCity").value);
        usrFdata.append("region", ele("txtRegion").value);
        usrFdata.append("country", ele("selCountry").value);
        usrFdata.append("txtHumbleBrag", ele('txtHumbleBrag').value ?? "x");

        usrFdata.append("gender",document.querySelector('input[name="rdoGender"]:checked').value);
        usrFdata.append("sexualPreference", document.querySelector('input[name="rdoSex"]:checked').value);
        usrFdata.append("politics", document.querySelector('input[name="rdoPolitics"]:checked').value);
        let upObj = {};
        postDataToServer("php/updateUserProfile.php", usrFdata, upObj);
        let upIntrvl = setInterval(() => {
            if (ready(upObj.data)) {
                clearInterval(upIntrvl);
                if (upObj.data.trim() == "ok") {
                    displayStatusMessage("ok", "thanks for registering " + ele("txtUsrName").value);
                    sendOggleMail("Someone completed user profile!", "\nemail: " + userEmail);
                    hideElement(ele("standardDialogBox"));
                    dialogBoxOpen = false;

                    // show my new info dialog

                }
                else {
                    replaceHtml(ele("userProfileDialogError"), upObj.data);
                }
            }
        }, 36);
    } catch (e) {
        replaceHtml(ele("userProfileDialogError"), e);
        logOggleError("CAT", e, "update user profile");
    }
}

function forgotUserName() {
    //('#divLogInEmail').show();
}

function validateLogin() {
    updateLoggedInStatus("yes");
    //logInDialog').fadeOut();
}

function updateLoggedInStatus(inOrOut) {
    sessionStorage["isLoggedIn"] = inOrOut;
    let visitorId = getCookieValue("VisitorId");
    let isLoggedIn = (inOrOut == 'yes') ? 1 : 0;

    let lgData = new FormData;
    lgData.append("visitorId", visitorId);
    lgData.append("isLoggedIn", isLoggedIn);
    let lginObj = {};
    postDataToServer("php/updateLoggedInStatus.php", lginObj);
    let lginIntrvl = setInterval(() => {
        if (ready(lginObj.data)) {
            clearInterval(lginIntrvl);
            if (lginObj.data == "ok") {
                displayStatusMessage("ok", "user logged: " + inOrOut);
                checkUserStatus("user logged: " + inOrOut);
            }
            else {
                displayStatusMessage("error", "logged error: " + lginObj.data);
            }
        }
    }, 44);
}

function loadCountryCodes(currentCountry) {
    let ccObj = {};
    getDataFromServer("php/fetchAll.php?schema=oggleboo_Visitors&query=select * from CountryCode", ccObj);
    let ccIntrvl = setInterval(() => {
        if (ready(ccObj.data)) {
            clearInterval(ccIntrvl);
            const selCountry = ele("selCountry");
            removeContents(selCountry);
            let ccData = JSON.parse(ccObj.data);
            ccData.forEach((ccItem) => {
                if (ccItem.CountryCode == currentCountry)
                    selCountry.insertAdjacentHTML("beforeend", "<option selected='selected' value='" + ccItem.CountryCode + "'>" + ccItem.Country + "</option>");
                else
                    selCountry.insertAdjacentHTML("beforeend", "<option value='" + ccItem.CountryCode + "'>" + ccItem.Country + "</option>");
            });
        }
    }, 45);
}
