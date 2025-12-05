function showAlbumDialog(catfolder) {
    try {
        switch (catfolder.FolderType) {
            case "singleModel":
            case "singleParent":
                showModelDetailDialog();
                break;
            default:
                showFolderDialog();
        }
 
        ele("standardDialogCloseButton").addEventListener("click", () => {
            hideElement(ele("standardDialogBox"));
            dialogBoxOpen = false;
        });
        if (typeof pause === 'function') pause();
        dialogBoxOpen = true;
    }
    catch (e) {
        loadingGif("hide");
        //replaceHtml(ele("btnFileDlgDone"), "program error: " + e);
        if (sessionStorage.VisitorId == adminVisitorId)
            alert("file details dialog: " + e);
        logOggleError("CAT", e, "show file details dialog");
    }
}

/* -------  model detail dialog  -----------------------------------------*/{
    function showModelDetailDialog() {

        replaceHtml(ele("standardDialogContents"), `
        <div class='folderDialogOuterContainer'>
            <div class='folderDialogTopSection'>
                <div class='albumDetailsSection'>
                    <div><label>name</label><input id='txtFolderName'/></div>
                    <div><label>country</label><input id='txtHomeCountry'/></div>
                    <div><label>region</label><input id='txtRegion'/></div>
                    <div><label>hometown</label><input id='txtHometown'/></div>
                    <div><label>born</label><input type="date" id="txtBorn"></div>
                    <div><label>boobs</label>
                        <select id='selBoobs' class='boobDropDown'>
                            <option value=0>Real</option>
                            <option value=1>Fake</option>
                        </select></div>
                    <div><label>figure</label><input id='txtMeasurements'/></div>
                </div>
                <div class='fileImageSection'>
                    <img id='modelDialogThumbNailImage' src='https://common.ogglebooble.com/img/redBalloon.png' class='albumDialogImage' />
                </div>
            </div>
            <div class='fileDialogBotomSection'>
                <textarea id='albumComments' class='albumCommentsTextbox resizable'></textarea>
            </div>
        </div>
        <div id='folderInfoDialogFooter' class='folderDialogFooter'>
            <div id='btnTrackBkLinks' class='dialogButton' onclick="showTrackbackDialog()">Trackback Links</div>
            <div id='btnFileDlgEdit'  class='dialogButton' onclick="saveModelDialogInfo()" >Save</div>
        </div>
    </div>
    <div id='trackBackDialog' class='floatingDialogBox'></div>`);

        const modelDetailDialog = ele('standardDialogBox');
        modelDetailDialog.style.top = "122px";
        modelDetailDialog.style.left = "500px";

        showElement(modelDetailDialog);

        modelDetailDialog.addEventListener("mouseenter", (e) => {
            menuEntered = true;
        });

        ele("standardDialogHeader").addEventListener('mousedown', (e) => {
            e.preventDefault();
            currentDragElement = modelDetailDialog;
            mouseX = e.clientX;
            mouseY = e.clientY;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        getModelDialogInfo();

    }

    function getModelDialogInfo() {
        try {
            ele("standardDialogTitle").innerHTML = "loading";
            let fldDiaObj = {};
            getDataFromServer("php/fetch.php?schema=oggleboo_Danni&query=select * from vwAlbumDialogInfo where Id = " + currentFolderId, fldDiaObj);
            let fldDiaIntrvl = setInterval(() => {
                if (ready(fldDiaObj.data)) {
                    clearInterval(fldDiaIntrvl);
                    if (fldDiaObj.data == false) {
                        replaceHtml(ele("folderInfoTitle"), "lookup fail");
                        logOggleError("AJX", "lookup fail", "file details dialog");
                    }
                    else {
                        folderInfo = JSON.parse(fldDiaObj.data);                          
                        ele("txtFolderName").value = folderInfo.FolderName;
                        replaceHtml(ele("standardDialogTitle"), folderInfo.FolderName);
                        //replaceHtml(ele("standardDialogTitle"), '<input id="txtFolderName"/>');
                        ele("txtHomeCountry").value = folderInfo.HomeCountry;
                        ele("txtRegion").value = folderInfo.Region
                        ele("txtHometown").value = folderInfo.HomeTown
                        ele("txtBorn").value = folderInfo.Birthday;
                        ele("txtMeasurements").value = folderInfo.Measurements;
                        ele("albumComments").value = folderInfo.FolderComments;
                        ele("selBoobs").value = folderInfo.FakeBoobs;
                        ele("modelDialogThumbNailImage").src = settingsImgRepo + folderInfo.FileName;
                    }
                }
            }, 24);
        } catch (e) {
            if (sessionStorage.VisitorId == adminVisitorId)
                alert("get model dialog info: " + e);
            logOggleError("CAT", e, "get model dialog info");
        }
    }

    function saveModelDialogInfo() {
        try {
            let albumComments = ele("albumComments").value;
            let country = ele("txtHomeCountry").value;
            let region = ele("txtRegion").value;
            let city = ele("txtHometown").value;
            let dob = ele("txtBorn").value;
            let fakeboobs = ele("selBoobs").value === '1' ? 1 : 0;
            let figure = ele("txtMeasurements").value;

            let albumInfo = new FormData;
            //replaceHtml(ele("standardDialogTitle"), '<input id="txtFolderName"/>');

            albumInfo.append("folderId", currentFolderId);
            albumInfo.append("folderName", ele("txtFolderName").value);
            albumInfo.append("country", country);
            albumInfo.append("region", region);
            albumInfo.append("city", city);
            albumInfo.append("dob", dob );
            albumInfo.append("boobs", fakeboobs );
            albumInfo.append("figure", figure);
            albumInfo.append("albumComments", albumComments);

            let albInfoObj = {};
            postDataToServer("php/saveModelDialogInfo.php", albumInfo, albInfoObj);
            let finfoIntrv = setInterval(() => {
                if (ready(albInfoObj.data)) {
                    clearInterval(finfoIntrv);
                    if (albInfoObj.data.trim().startsWith("ok")) {
                        displayStatusMessage("ok", "Folder info updated");
                        logOggleActivity("SMD", "folder info dialog");
                    }
                    else {
                        if (albInfoObj.data.indexOf("42000") >= 0) {
                            //replaceHtml("standardDialogTitle", "no changes made");
                            //displayStatusMessage("warning", "no changes made");
                            ele("albumComments").value = albInfoObj.data;
                        }
                        else {
                            displayStatusMessage("error", albInfoObj.data);
                            logOggleError("AJX", albInfoObj.data, "update folderDetail");
                        }
                    }
                }
            }, 25);
        } catch (e) {
            loadingGif("hide");
            if (sessionStorage.VisitorId == adminVisitorId)
                alert("carousel interval: " + e);
            logOggleError("CAT", e, "save modelDialog info");
        }
    }
}

/* -------  single child folder dialog  -----------------------------------------*/{
    function showFolderDialog() {

        replaceHtml(ele("standardDialogContents"), `
            <div class='containerSection'>
                <div class='inline'><span>album title</span><input id='txtAlbumTitle'></input></div>
                <div>
                    <textarea id='singleChildComment' class='singleChildComment resizable'></textarea>
                </div>
                <div class='folderDialogFooter'>
                    <div id='btnSingleChildDialogSave' class='dialogButton' onclick="saveFolderDialogInfo()">Save</div>
                    <div class='dialogButton' onclick='hideElement(ele("standardDialogBox"));dialogBoxOpen = false;'>Cancel</div>
                </div>
            </div>`);

        const folderInfoDialog = ele('standardDialogBox');
        folderInfoDialog.style.top = "22px";
        folderInfoDialog.style.left = "1000px";
        showElement(folderInfoDialog);
        dialogBoxOpen = true;
        replaceHtml(ele("standardDialogTitle"), "loading");
        getFolderDialogInfo();

    }

    function getFolderDialogInfo() {
        let snglDataObj = {};
        let querySql = `select f.FolderName, d.FolderComments from CategoryFolder f 
        left join FolderDetail d on f.Id = d.FolderId where f.Id =`;
        getDataFromServer("php/fetch.php?schema=oggleboo_Danni&query=" + querySql + currentFolderId, snglDataObj);
        let snglDataIntrvl = setInterval(() => {
            if (ready(snglDataObj.data)) {
                clearInterval(snglDataIntrvl);
                if (snglDataObj.data == false) {
                    replaceHtml(ele("folderInfoTitle"), "lookup fail");
                    logOggleError("AJX", "lookup fail", "file details dialog");
                }
                else {
                    singleChildData = JSON.parse(snglDataObj.data);
                    replaceHtml(ele("standardDialogTitle"), singleChildData.FolderName);
                    ele("txtAlbumTitle").value = singleChildData.FolderName;
                    ele("singleChildComment").value = singleChildData.FolderComments;
                }
            }
        }, 24);
    }

    function saveFolderDialogInfo() {
        try {
            let commentText = ele("singleChildComment").value;
            let scInfo = new FormData;
            scInfo.append("folderId", currentFolderId);
            scInfo.append("folderName", ele("txtAlbumTitle").value);
            scInfo.append("commentText", commentText);

            let scInfoObj = {};
            postDataToServer("php/saveFolderDialogInfo.php", scInfo, scInfoObj);
            let scInfoIntrv = setInterval(() => {
                if (ready(scInfoObj.data)) {
                    clearInterval(scInfoIntrv);
                    if (scInfoObj.data.trim().startsWith("ok")) {
                        displayStatusMessage("ok", "Folder info updated");
                        logOggleActivity("SMD", "folder info dialog");
                    }
                    else {
                        if (scInfoObj.data.indexOf("42000") > 0) {
                            //ele("singleChildComment").value = scInfoObj.data;
                            //displayStatusMessage("warning", "no changes made");
                            displayStatusMessage("ok", "Folder info updated");
                            logOggleActivity("SMD", "folder info dialog");
                        }
                        else {
                            displayStatusMessage("error", scInfoObj.data);
                            logOggleError("AJX", scInfoObj.data, "update folderDetail");
                        }
                    }
                }
            }, 25);
        } catch (e) {
            loadingGif("hide");
            alert("saveFolderDialog CAT: " + e);
        }
    }

    function toggleSaveButton() {
        if (ele("btnFileDlgEdit").value === "Save") {
            saveFolderDialog(folderId);
            replaceHtml(ele("btnFileDlgEdit"), "Edit");
            hideElement(ele("btnFileDlgDone"));
            hideElement(ele("btnTrackBkLinks"));
            //ele("fileDetailsSection input").prop("disabled", true);
            //('#summernoteFileContainer').summernote('disable');
        }
        else {
            replaceHtml(ele("btnFileDlgEdit"), "Save");
            showElement(ele("btnFileDlgDone"));
            showElement(ele("btnTrackBkLinks"));
            //ele("fileDetailsSection input").prop("disabled", false);
            //summernoteFileContainer').summernote('enable');
            //('.note-editable').trigger('focus');
        }
    }

    function toggleDoneButton() {
        //btnFileDlgEdit').html("Edit");
        //btnFileDlgDone').hide();
        //btnTrackBkLinks').hide();
        //fileDetailsSection input").css("enabled", false);
    }

    function updateFolderDialogInfo(folderId) {
        let txtFolderName = ele("txtFolderName");
        if (txtFolderName.value == folderInfo.FolderName) {
            //&& (folderInfoDialogSummernoteContainer').summernote("code") == folderInfo.FolderComments)) {
            replaceHtml(ele("folderNameMessage"), "nothing to update");
        }
        else {
            //let txtComments = ('#folderInfoDialogSummernoteContainer').summernote("code").replace("'", "''");
            data = new FormData;
            data.append("folderId", folderId);
            data.append("folderName", ele("txtFolderName").value);
            data.append("folderComments", txtComments);
            let postFld = {};
            postDataToServer("php/updateFolderDetail.php", data, postFld);
            let posfldIntrvl = setInterval(() => {
                if (!isNullorUndefined(postFld.data)) {
                    clearInterval(posfldIntrvl);
                    if (postFld.data.trim().startsWith("ok")) {
                        displayStatusMessage("ok", "Folder info updated");

                        // replaceHtml(ele("folderNameMessage"), postFld.data.trim());
                        // replaceHtml(ele("btnFolderDlgEdit"), "Edit");
                        // hideElement(ele("btnFolderDlgDone"));
                        // ele("summernoteFolderContainer').summernote('disable');
                        // ele("txtFolderName').prop("disabled", true);
                        // logOggleActivity("SMD", folderId, "folder info dialog");

                        //    if (ele("btnFolderDlgEdit").value == "Edit") {
                        //        replaceHtml(ele("btnFolderDlgEdit"), "Save");
                        //        //ele("folderInfoDialogSummernoteContainer').summernote('enable');
                        //        ele("txtFolderName").ariaDisabled = "disabled";
                        //        showElement(ele("btnFolderDlgDone"));
                        //        //showElemant(ele(" ('.note-editable').trigger('focus');
                        //    }
                    }
                    else {
                        replaceHtml(ele("folderNameMessage"), "update failed: " + success.trim());
                        logOggleError("AJX", success, "update folderDetail");
                    }
                }
            }, 200);
        }
    }

}

/* --------------- trackbacks --------------------------*/{
    function showTrackbackDialog() {
        document.body.insertAdjacentHTML("beforeend", `
        <div id="trackbackDialogBox" class="standardDialogBox">
            <div id='trackbackDialogHeader' class='standardDialogHeader'>
                <div id='trackbackDialogTitle' class='standardDialogTitle'></div>
                <div id="trackbackDialogCloseButton" class='dialogCloseButton' onclick="trackbackDialogBox.remove()">
                    <img src='https://common.ogglebooble.com/img/close.png' title='close dialog window' alt='close' />
                </div>
            </div>
            <div id='trackbackDialogContents' class='standardDialogContents'></div>
        </div>`);

        replaceHtml(ele("trackbackDialogHeader"), "trackback links");
        replaceHtml(ele("trackbackDialogContents"),`
        <div>link <input id='txtTrackBackLink'  class='roundedInput' style='width:85%'></input></div>
        <div>site <select id='selTrackBackLinkSite' class='roundedInput'>
            <option value='BAB'>babepedia</option>
            <option value='BOB'>boobpedia</option>
            <option value='IND'>Indexx</option>
            <option value='PBY'>playboy plus</option>
        </select></div>
        <div>status<input id='txtTrackBackStatus' class='roundedInput' value='ok'/></div>
        <div class='tbResultsContainer'>
            <ul id='ulExistingLinks'></ul>
        </div>
        <div class='folderDialogFooter'>
            <div id='btnTbDlgAddEdit' class='dialogButton' onclick='trackbackAdd()'>add</div>
            <div id='btnTbDlgDelete' class='dialogButton displayHidden' onclick='tbDelete()'>delete</div>
            <div id='btnTbAddCancel' class='dialogButton' onclick='btnTrackbackAddCancel()'>Cancel</div>
        </div>`);

        const trackbackDialogBox = ele("trackbackDialogBox");
        trackbackDialogBox.style.top = "222px";
        trackbackDialogBox.style.left = "211px";
        showElement(trackbackDialogBox);
        loadTrackBackItems();
    }

    function loadTrackBackItems() {
        let trkbkObj = {};
        getDataFromServer("php/fetchAll.php?schema=oggleboo_Danni&query=select * from TrackbackLink where CatFolderId=" + currentFolderId, trkbkObj)
        let trkbkIntrv = setInterval(() => {
            if (ready(trkbkObj.data)) {
                clearInterval(trkbkIntrv);
                removeContents(ele('ulExistingLinks'));
                if (trkbkObj.data != "false") {
                    let trackbackItems = JSON.parse(trkbkObj.data);
                    trackbackItems.forEach((item) => {
                        ('#ulExistingLinks').append("<li class='clickable' onclick='loadTrackbackForEdit('" + item.SiteCode + "')' >" + item.SiteCode + " - " + item.LinkStatus + "</li>");
                    });
                }
            }
        }, 34);
    }

    function loadTrackbackForEdit(siteCode) {
        replaceHtml(ele("btnTbDlgAddEdit"), "edit");
    }

    function trackbackAdd() {
        let siteCode = ele("selTrackBackLinkSite").value;
        let href = ele('txtTrackBackLink').value;
        let status = ele('txtTrackBackStatus').value;
        let trkbkObj = {};
        let trkbkData = new FormData;
        trkbkData.append("folderId", currentFolderId);
        trkbkData.append("siteCode", siteCode);
        trkbkData.append("href", href);
        trkbkData.append("status", status);
        trkbkData.append("mode", "add");

        postDataToServer("php/addEditTrackBackLink.php", trkbkData, trkbkObj)
        let trkbkIntrvl = setInterval(() => {
            if (ready(trkbkObj.data)) {
                clearInterval(trkbkIntrvl);
                if (trkbkObj.data.trim() === "ok") {
                    displayStatusMessage("ok", "trackback link added");
                    loadTrackBackItems();
                }
                else {
                    alert(trkbkObj.data);
                }
            }
        }, 52);
    }
}

