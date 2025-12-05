const messageBoxSlideSpeed = 230, messageBoxTop = 88, commentDialogDestination = 50;
let slidePos = 0, destPos = 0;
let feedbackDialog = {};

//--- FEEDBACK DIALOG ---
function showOggleFeedbackDialog() {

    dialogBoxOpen = true;

    feedbackDialog = ele("standardDialogBox");
    replaceHtml(ele("standardDialogTitle"), "Feddback");
    replaceHtml(ele("standardDialogContents"), `
        <div id="feedbackHeader" class='feedbackHeader'>
            <input type='radio' value='CPM' name='rdoFeedback' checked='checked'></input>compliment
            <input type='radio' value='BAD' name='rdoFeedback'></input>complaint
            <input type='radio' value='RMD' name='rdoFeedback'></input>recomendation
            <input type='radio' value='BUG' name='rdoFeedback'></input>error report
        </div>
        <textarea id="feedbacktextarea" class='commentsTextArea feedbackEditBox' placeholder="what do you think"></textarea>
        <div><span></span>emai: <input id='txtFeedbackEmail' class='roundedInput' style='width:87%'></input></div>
        <div class='bannerButton' onclick='postFeedback()'>post</div>`
    );

    feedbackDialog.style.top = 381 + "px";
    feedbackDialog.style.left = 1366 + "px";
    showElement(feedbackDialog);

    ele("standardDialogCloseButton").addEventListener("click", () => { hideElement(feedbackDialog) });

    ele("standardDialogTitle").addEventListener('mousedown', (e) => {
        e.preventDefault();
        currentDragElement = feedbackDialog;
        mouseX = e.clientX;
        mouseY = e.clientY;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

}
function postFeedback() {
    const feedbacktextarea = document.getElementById("feedbacktextarea")
    if (feedbacktextarea.value == "") {
        alert("please include a comment");
        return;
    }
    let feedbackCat = document.querySelector('input[name="rdoFeedback"]:checked').value;
    let feedBackObj = {};
    let fbData = new FormData();
    fbData.append("visitorId", sessionStorage.VisitorId);
    fbData.append("folderId", currentFolderId);
    fbData.append("feedbackCat", feedbackCat);
    fbData.append("commentText", feedbacktextarea.value);
    fbData.append("email", document.getElementById("txtFeedbackEmail").value);
    postDataToServer("php/postFeedback.php", fbData, feedBackObj);
    let dataIncr = setInterval(function () {
        if (ready(feedBackObj.data)) {
            clearInterval(dataIncr);
            if (feedBackObj.data === "ok") {
                hideElement(feedbackDialog);
                displayStatusMessage("ok", "Entry Saved");

                let radioVal = "wagg";
                switch (feedbackCat) {
                    case "CPM": radioVal = "compliment"; break;
                    case "BAD": radioVal = "complaint"; break;
                    case "RMD": radioVal = "recommendation"; break;
                    case "BUG": radioVal = "error report"; break;
                }

                // SEND FEEDBACK EMAIL                    
                sendOggleMail("Feedback Sent!",
                    "\ncomment: " + feedbacktextarea.value +
                    "\ncomment type: " + radioVal +
                    "\nemail: " + document.getElementById("txtFeedbackEmail").value
                );

                if (sessionStorage["UserRole"] == "unregistered") {
                    // showLoginDialog();
                    displayStatusMessage("ok", "thank you for your " + radioVal + ". Please register");
                }
                else {
                    displayStatusMessage("ok", "thank you " + sessionStorage.UserName + " for your " + radioVal);
                }

            }
            else {
                displayStatusMessage("error", feedBackPosted.data);
                logOggleError("AJX", feedBackPosted.data, "post feedback");
            }
            dialogBoxOpen = false;
        }
    }, 200);
}

//--- REJECTS DIALOG
function showRejectsDialog(linkId, folderId, imgSrc) {
    const rejectsDialog = ele("standardDialogBox");

    replaceHtml(ele("standardDialogTitle"), "move image to rejects");
    replaceHtml(ele("standardDialogContents"), `
        <div class='flex'>
            <div style='float:right'>
                <img id='linkManipulateImage' class='ctxDialogImage' src='` + imgSrc + `'/>
            </div>
            <div>
                <div><input type='radio' value='DUP' name='rdoRejectImageReasons' checked='checked'></input>  duplicate</div>
                <div><input type='radio' value='BAD' name='rdoRejectImageReasons'></input>  bad link</div>
                <div><input type='radio' value='LOW' name='rdoRejectImageReasons'></input>  low quality</div>
                <div><input type='radio' value='RAW' name='rdoRejectImageReasons'></input>  snatch shot</div>
            </div>
        </div>
        <div>
            <div class='roundendButton inline' onclick='performMoveImageToRejects(\"` + linkId + `\")'>ok</div>
            <div class='roundendButton inline' onclick='hideElement(rejectsDialog)')'>ok</div>
        </div>`);
    rejectsDialog.style.top = messageBoxTop + "px"; 
    rejectsDialog.style.left = "500px";
    rejectsDialog.style.minWidth = "200px";

    ele("standardDialogCloseButton").addEventListener("click", () => { hideElement(rejectsDialog) });

    ele("standardDialogTitle").addEventListener('mousedown', (e) => {
        e.preventDefault();
        currentDragElement = rejectsDialog;
        mouseX = e.clientX;
        mouseY = e.clientY;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    ele("standardDialogCloseButton").addEventListener("click", () => {
        hideElement(rejectsDialog);
    });

    showElement(rejectsDialog);
}
function performMoveImageToRejects(linkId) {
    try {
        if (sessionStorage["UserRole"] == "unregistered") {
            alert("please register");
            // sendOggleMail("Unregistered attempt to move imagr to rejects", " VisitorId: " + sessionStorage["VisitorId"]);
        }
        else {
            // physcially move image to rejects folder
            // need a table called ImageRejects with columns: ImageId, OriginalFolderId, Reason, RootId
            // update imageFile FolderId to rejects folder

            let rejObj = {};
            let rejData = new FormData();
            rejData.append("imageId", linkId);
            rejData.append("targetFolderId", -6);

            postDataToServer("php/moveImage.php", rejData, rejObj);
            let remIntrvl = setInterval(() => {
                if (ready(rejObj.data)) {
                    clearInterval(remIntrvl);
                    if (rejObj.data.trim() == "ok") {
                        // let selectedOption = $("input:radio[name=rdoRejectImageReasons]:checked").val()
                        let selectedOption = document.querySelector('input[name="rdoRejectImageReasons"]:checked').value;
                        displayStatusMessage("ok", "image moved to rejects " + selectedOption);
                        logOggleEvent("RJT", "RejectImageReason: " + selectedOption + " imageId: " + linkId);

                        window.location.href = "album.html?folder=" + currentFolderId;
                    }
                    else {
                        //alert("Ajax error: " + success.trim());
                        displayStatusMessage("error", remObj.data.trim());
                        logOggleError("AJX", remObj.data.trim(), "move to rejects");
                    }
                }
            }, 82);
        }
    } catch (e) {
        loadingGif("hide");
        logOggleError("CAT", e, "move to rejects");
    }
}


//--- MOVE COPY ARCHIVE DIALOG
function showMoveCopyDialog(folderId, linkId, imgSrc) {
    let moveCopyDialog = ele("standardDialogBox");
    replaceHtml(ele("standardDialogTitle"), "move/copy image");
    replaceHtml(ele("standardDialogContents"), `
        <div class='fileDialogOuterContainer'>
            <div class='flexContainer'>
                <div id='fileDetailsSection'>
                    <div class='dialogButton' onClick='moveCopyImage(`+ folderId + `,"` + linkId + `","copy")'>copy</div>
                    <div class='dialogButton' onClick='moveCopyImage(`+ folderId + `,"` + linkId + `","move")'>move</div>
                    <div class='dialogButton' onClick='moveCopyImage(`+ folderId + `,"` + linkId + `","archive")'>archive</div>
                    <div class='dialogButton' title='move but maintain model name' onClick='moveCopyImage(`+ folderId + `,"` + linkId + `","link")'>attribute</div>
                </div>
                <div id='fileImageSection' class='inline'>
                    <img id='modelDialogThumbNailImage' src='` + imgSrc + `' class='moveCopyDialogImage' />
                </div>F
            </div>
            <div id='copyDialogDirTreeContainer' class='folderDialogFooter'>
                <div id='showCopyDialogFooter' class='folderDialogFooter'>destination
                    <input id="txtDestFolder"/>
            </div>
        </div>`);
    moveCopyDialog.style.position = "absolue";
    moveCopyDialog.style.left = mousePos.x + "px";
    moveCopyDialog.style.top = mousePos.y + "px";
    showElement(moveCopyDialog);

    ele("standardDialogTitle").addEventListener('mousedown', (e) => {
        e.preventDefault();
        mouseX = e.clientX;
        mouseY = e.clientY;
        currentDragElement = moveCopyDialog;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

}


//--- FOLDER COMMENTS DIALOG
function showFolderCommentsDialog(folderId, folderName) {

    const folderCommentsDialog = ele("standardDialogBox");
    if (slidePos <= 0) {
        destPos = commentDialogDestination;
        slidePos = 0 - folderCommentsDialog.offsetWidth - 5;

        folderCommentsDialog.style.top = messageBoxTop + "px";
        folderCommentsDialog.style.left = slidePos + "px";
        if (typeof pause === 'function') pause();
        replaceHtml(ele("standardDialogTitle"), "loading");
        replaceHtml(ele("standardDialogContents"), `
            <textarea id="commentsTextArea" class='commentsTextArea commentsDialog' rows="4" placeholder="what do you think"></textarea>
            <div class='bannerButton' onclick='saveFolderComment(`+ folderId + `)'>post</div>
            <div id='commentHistory' class'cmtHistOuterShell'>
                <div id="commentHistoryArea">
                commentHistoryArea
                </div>
            </div>`);
        loadFolderComments(folderId, folderName);
        folderCommentsDialog.style.left = slidePos + "px";
        showElement(folderCommentsDialog);
        folderCommentsSide(folderCommentsDialog, "out");
    }
    else {
        destPos = 0 - folderCommentsDialog.offsetWidth - 5;
        slidePos = commentDialogDestination;
        folderCommentsSide(folderCommentsDialog, "in");
    }
    ele("standardDialogCloseButton").addEventListener("click", (event) => {
        folderCommentsSide(folderCommentsDialog, "in");
    });
}

function loadFolderComments(folderId, folderName) {

    let folderCommentsObj = {};
    getDataFromServer('php/fetchAll.php?schema=oggleboo_Feedback&query=Select * from FolderComment where FolderId=' + folderId, folderCommentsObj);
    let dataIncr = setInterval(function () {
        if (ready(folderCommentsObj.data)) {
            clearInterval(dataIncr);
            if (folderCommentsObj.data !== false) {
                //hideElement(ele("commentHistoryArea"));

                let folderComments = JSON.parse(folderCommentsObj.data);
                let commentsHtml = "";
                for (let i = 0; i < folderComments.length; i++) {
                    commentsHtml += `
                    <div class='historyComment'>
                        <div class='commentFrom'>` + folderComments[i].VisitorId + `</div>
                        <div class='commentHistoryText'>` + folderComments[i].CommentText + `</div>
                        <div class='commentDate'>` + folderComments[i].Occured + `</div>
                    </div>`;
                };
                replaceHtml(ele("commentHistoryArea"), commentsHtml);
            }
            else {
                displayStatusMessage("error", folderCommentsObj.data);
                logOggleError("AJX", folderCommentsObj.data, "post feedback");
            }
        }
    }, 200);
}

function saveFolderComment(folderId) {
    const commentTextArea = ele("commentsTextArea");
    if (commentTextArea.value == "") {
        alert("please include a comment");
        return;
    }
    let folderCommentObj = {};
    let folderCommentData = new FormData();
    folderCommentData.append("visitorId", sessionStorage.VisitorId);
    folderCommentData.append("folderId", folderId);
    folderCommentData.append("commentText", commentTextArea.value);
    postDataToServer("php/postFolderComment.php", folderCommentData, folderCommentObj);
    let dataIncr = setInterval(function () {
        if (ready(folderCommentObj.data)) {
            clearInterval(dataIncr);
            if (folderCommentObj.data === "ok") {
                hideElement(ele("standardDialogBox"));
                displayStatusMessage("ok", "Entry Saved");
            }
            else {
                displayStatusMessage("error", folderCommentObj.data);
                logOggleError("AJX", folderCommentObj.data, "post feedback");
            }
        }
    }, 200);
}

function folderCommentsSide(dialogBox, direction) {
    let slideIntrvl = setInterval(() => {
        if (direction == "out") {
            if (slidePos < destPos) {
                slidePos += 14;
            }
            else {
                dialogBox.style.left = destPos + "px";
                clearInterval(slideIntrvl);
            }
        }
        else {
            if (slidePos > destPos) {
                slidePos -= 14;
            }
            else {
                clearInterval(slideIntrvl);
                hideElement(dialogBox);
            }
        }
    }, messageBoxSlideSpeed);
}

function tbDelete() {
    alert("ok");
}

function XXshowDirTreeDialog(imgSrc, menuType, title) {
    slideShowButtonsActive = false;
    let dirTreeDialogHtml = `<div>
        <div class='inline'><img id='linkManipulateImage' class='copyDialogImage' src='" + imgSrc + "'/></div>
        <div id='dirTreeResults' class='pusedoTextBox'></div>
        <div class='inline'><img class='dialogDirTreeButton' src='/Images/caretDown.png' "
            onclick='toggleTree()'/></div>
        <div id='linkManipulateClick'></div>
        <div id='linkManipulateDirTree' class='hideableDropDown'>
            <img class='ctxloadingGif' title='loading gif' alt='' src='img/loader.gif'/>
        </div>
    </div>`;

    replaceHtml(ele("linkManipulateDirTree"), dirTreeDialogHtml);

    //('#centeredDialogTitle').html(title);
    //('#centeredDialogContainer').css("top", 33);
    //('#centeredDialogContainer').draggable().fadeIn();

    if (isNullorUndefined(tempDirTree)) {
        //showHtmlDirTree("linkManipulateDirTree");
        //tempDirTree = ("linkManipulateDirTree").html();
        //loadDirectoryTree(1, "linkManipulateDirTree", false);
    }
    else {
        loadingGif("hide");
        //("linkManipulateDirTree").html(tempDirTree);
        //('#dashBoardLoadingGif').hide();
        //console.log("loaded linkManipulateDirTree from temp");
    }
    //var winH = (window).height();
    //var dlgH = ('#centeredDialog').height();
}

//--- IMAGE COMMENT DIALOG
function showImageCommentDialog(linkId, imgSrc, folderId, calledFrom) {
    var imageCommentDialog = ele("standardDialogBox");
    replaceHtml(ele("standardDialogContents"), `
        <div class='dialogImageContainer'>
            <img id='commentDialogImage' class='fantasyImage' alt='alt' title='title' src='`+ imgSrc + `' />
        </div>
        <div><input id='txtCommentTitle' class='roundedInput commentTitleText' tabindex='1' placeholder='Give your comment a title' /></div>
        <textbox id="imageComment" class="editorTextbox"></textbox>
        <div class='folderDialogFooter'>
            <div id='divSaveFantasy' class='roundendButton clickable commentDialogButton inline' onclick='saveComment()'>save</div>
            <div id='divCloseFantasy' class='roundendButton clickable commentDialogButton inline' onclick='closeElement("imageCommentDialog")'>cancel</div>
            <div id='commentInstructions' class='commentDialogInstructions inline'>log in to view comments</div>
        </div>`);

    replaceHtml(ele("standardDialogTitle"), "write a fantasy about this image");
    ele("commentDialogImage").src = imgSrc;

    imageCommentDialog.style.position = "absolute";
    imageCommentDialog.style.top = "100px";
    imageCommentDialog.style.left = "1000px";
    fade(imageCommentDialog, "in");
    // showElement(imageCommentDialog);
    if (typeof pause === 'function') pause();

    let imageComment = {
        VisitorId: sessionStorage.VisitorId,
        ImageLinkId: linkId,
        CalledFrom: calledFrom,
        FolderId: folderId
    };
}

//--- PORN STATUS DIALOG
function determinePornStatus() {
    try {
        //if (isNullorUndefined(sessionStorage.PornStatus)) {
        let url = "php/fetch.php?schema=oggleboo_Visitors&query=select PornStatus from Visitor f where VisitorId ='" + sessionStorage.VisitorId + "'";
        let pornRtn = new Object;
        getDataFromServer(url, pornRtn);
        let pornIntv = setInterval(() => {
            if (!isNullorUndefined(pornRtn.data)) {
                clearInterval(pornIntv);
                let visitorData = JSON.parse(pornRtn.data);
                if (isNullorUndefined(visitorData.PornStatus))
                    showPornWarning();
            }
        }, 200);
        // }
    } catch (e) {
        alert("determinePornStatus: " + e);
    }
}

function showPornWarning() {
    const pornWarningBody = ele("standardDialogBox");
    let pornWarningHtml = `
        <style>
            .pornWarning {
                border: solid 12px #000;
                padding: 12px;
                background-color: #888;
                font-size: 17px;
                color:#000;
                font-weight:bold;
            }
            .whiteWarning {
                color: #fefefe;
                padding: 10px;
                font-size: 20px;
                text-align: center;
            }
            input[type=checkbox] {
                 transform: scale(1.5);
                 margin-right: 12px;
            }
        </style>
        <div class="pornWarning">
            <div style="font-size:40px;color:red;text-align:center">WARNING</div>
            <div style="color:yellow;font-size:25px;text-align:center;margin:4px">
               This site shows pictures of girls with dicks in their mouths. 
            </div>
            <div class="whiteWarning">
                If you are offended by pictures and gifs and links to videos
                of females sucking on dicks please do not enter this site.
            </div>
            <p>
                <input id='hetosexual' type="checkbox"> I certify that I am a heterosexual male over 42 years old <br>
                <input id='jerk' type="checkbox"> I am over 18 and my Mommy knows what I'm doing<br>
                <input id='religious'type="checkbox"> 
                  I am a religious conservative dismayed by the downfall of society. I still want to see<br>
                <input id='female' type="checkbox"> I certify that I am a female cocksucker. You're especially welcome here <br>
                <input id='femdom' type="checkbox"> I am a female who refuses to give head and am disgusted by the terrible sluts who do so, 
                    but I want to revel in their humiliation.<br>
                <input id='gay' type="checkbox">I am a male homosexual cocksucker 
                            <span style="font-size:16px; font-weight:normal">(this site may not be for you.)</span>

                </p><div style="color:#fefefe;padding:10px;font-size:18px;text-align:center;"> This site shows images of females sucking on dick. </div>
                <br>
                <div class="whitewarning">
                    This site also contains images of different categories of pussy shots, breast fondling, cum shots, 
                    penetration, naughty and kininky behavior,
                    as well as thousands of felmale cocksuckers, mostly on their knees.
                </div>

                <div style="font-size:45px;color:red;text-align:center;cursor:pointer;"> 
                  <span style="margin-right:22px" onclick="savePornStatus('ok')">ACCEPT</span>
                  <span onclick="savePornStatus('not')">NEVER MIND</span></div>
            <div style="text-align:center">(if you <a href="javascript:showregisterdialog()">register</a> and <a href="javascript:showlogindialog()">log in</a> 
            you won't see this message any more)</div>
        </div>`;

    if (isNullorUndefined("pornWarningBody")) {
        document.body.insertAdjacentElement("beforebegin", `
                <div id='pornWarning' class='floatingDialogContainer'>
                    <div id='floatingDialogContents' class='floatingDialogContents'>
                        <div id='pornWarningBody' class="typicalPopup"></div>
                    </div>
                </div>`);
    }
    showElement(ele("vailShell"));
    replaceHtml(pornWarningBody, pornWarningHtml);
    pornWarningBody.style.position = "absolute";
    pornWarningBody.style.zIndex = 22;
    pornWarningBody.style.top = "55px";
    pornWarningBody.style.left = "350px";
    pornWarningBody.style.width = "850px";
    fade(pornWarningBody, "in");
}

function savePornStatus(accept) {
    try {
        if (accept == "ok") {
            let ckPornType = "unchecked";
            if (ele("hetosexual").checked) ckPornType = "hetero";
            if (ele("jerk").checked) ckPornType = "jerkoff";
            if (ele("religious").checked) ckPornType = "religious";
            if (ele("female").checked) ckPornType = "female";
            if (ele("femdom").checked) ckPornType = "femdom";
            if (ele("gay").checked) ckPornType = "gay";
            if (ckPornType == "unchecked")
                alert("please select a perv category");
            else {
                let pdata = new FormData();
                pdata.append('visitorId', sessionStorage.VisitorId);
                pdata.append('pornStatus', ckPornType);

                let pornObj = {};
                postDataToServer("php/setPornStatus.php", pdata, pornObj);
                let pornIntrvl = setInterval(() => {
                    if (!isNullorUndefined(pornObj.data)) {
                        clearInterval(pornIntrvl);
                        if (pornObj.data == "ok") {
                            sessionStorage.PornStatus = "ok";
                            hideElement(ele("standardDialogBox"));
                            hideElement(ele("vailShell"));
                            logOggleActivity("PSC", "dialog boxes"); // porn status checked
                        }
                        else
                            alert(pornObj.data);
                    }
                }, 200);
            }
        }
        else {
            location.href = "index.html";
        }
    } catch (e) {
        hideElement(ele("standardDialogBox"));
        hideElement(ele("vailShell"));
        alert("catch: " + e);
    }
}



function showCarouselSettingsDialog() {

    //document.body.insertAdjacentElement("beforeend", "");
    document.body.insertAdjacentHTML("beforeend", `
            <div id='carouselSettingsDialog' class='carouselSettingsDialog'>
                <div class='floatingDialogHeader'>
                    <div class='floatingDialogTitle'>Carousel Settings</div>
                    <div class='dialogCloseButton'>
                    <img src='https://common.ogglebooble.com/img/close.png' onclick='resume(); $(\"#carouselSettingsDialog\").hide();'/></div>
                </div>
                <div>
                    <input type='checkbox' class='carouselSettingCheckbox' id='ckCenterfold'>
                    <label for="ckCenterfold"> Include Centerfolds</label><br>
                    <input type='checkbox' class='carouselSettingCheckbox' id='ckArchive'>
                    <label for="ckArchive"> Include Big Naturals Archive</label><br>
                    <input type='checkbox' class='carouselSettingCheckbox' id='ckSoftcore'>
                    <label for="ckSoftcore"> Include softcore</label><br>
                    <input type='checkbox' class='carouselSettingCheckbox' id='ckPorn'>
                    <label for="ckPorn"> Include porn</label><br>
                    <input type='checkbox' class='carouselSettingCheckbox' id='ckLandscape'>
                    <label for="ckLandscape"> allow landscape size</label><br>
                    <input type='checkbox' class='carouselSettingCheckbox' id='ckPortrait'>
                    <label for="ckPortrait"> allow portrait size</label><br>
                </div>
            </div>`);

    let carouselSettingsDialog = ele("carouselSettingsDialog");

    
    carouselSettingsDialog.style.position = "absolue";
    carouselSettingsDialog.style.top = "200px";
    carouselSettingsDialog.style.right = "22px";
    showElement(carouselSettingsDialog);

}

