// 3/27/2023
let sortOrderArray = [];

function sortAlbum() {
    searchActive = false;
    hideElement(ele("albumContentArea"));
    const sortToolArea = ele("sortToolArea");
    replaceHtml(sortToolArea, `
        <div class='sortToolHeader'>
            <div id='sortTableHeader' class='sortToolTitle'></div>
            <div class='dialogCloseButton'>
                <img style='height:25px' src='https://common.ogglebooble.com/img/close.png' alt='close' onclick='closeSortTool()'>
            </div>
        </div>
        <div id='sortToolImageArea' class='sortToolDisplayContainer'></div>
        <div class='sortToolFooter'>
            <button class="roundendButton" onclick='updateSortOrder()'>ReSort</button>
            <button class="roundendButton" onclick='autoIncrimentSortOrder()'>AutoIncriment</button>
            <button class="roundendButton" onclick='saveNewSortOrder()'>Save</button>
        </div>`);

    loadSortTable();

    showElement(sortToolArea);

    if (sessionStorage.VisitorId !== adminVisitorId) {
        logOggleEvent("SRT", "someone is attempting to sort an album", "good luck");
    }
}

function loadSortTable() {
    let srtInfObj = {};
    let sql = "select * from vwSortArray where FolderId = " + currentFolderId + " order by SortOrder";    
    getDataFromServer("php/fetchAll.php?schema=oggleboo_Danni&query=" + sql, srtInfObj);
        //select * from vwLinks where FolderId = " + currentFolderId + " order by SortOrder"
    let srtIntrv = setInterval(() => {
        if (ready(srtInfObj.data)) {
            clearInterval(srtIntrv);
            const sortToolImageArea = ele("sortToolImageArea");
            if (srtInfObj.data.indexOf("error") > -1) {
                replaceContents(sortToolImageArea, srtInfObj.data);
            }
            else {
                removeContents(sortToolImageArea);
                showDataInfo("rendering");
                let sortArray = JSON.parse(srtInfObj.data);
                sortOrderArray = [];
                sortArray.forEach((arrayItem) => {
                    sortToolImageArea.insertAdjacentHTML("beforeend",`
                    <div class='sortBox'><img class='sortBoxImage' src='`+ settingsImgRepo + arrayItem.FileName + `'/>
                        <br/><input class='sortBoxInput' id="` + arrayItem.ImageId + `" value="` + arrayItem.SortOrder + `"name="` + arrayItem.FileName + `"></input></div >`);
                    sortOrderArray.push({
                        ImageId: arrayItem.ImageId,
                        ImageSrc: settingsImgRepo + arrayItem.FileName,
                        SortOrder: arrayItem.SortOrder
                    });
                });
                resizeAlbumPage("sort tool");
                //resizeSortToolPage();
                showDataInfo("hide");
                searchActive = false;
            }
        }
    }, 120);
}

function updateSortOrder() {
    loadingGif("show");
    showDataInfo("sorting array")
    let pageArray = [];

    const sortBoxInput = document.getElementsByClassName("sortBoxInput");
    Array.from(sortBoxInput).forEach((sortBox) => {
        pageArray.push({
            ItemId: sortBox.id,
            ImageSrc: sortBox.name,
            SortOrder: sortBox.value
        });
    });

    sortOrderArray = pageArray.sort(SortImageArray);
    loadingGif("hide");

    reloadSortTool();

    showDataInfo("hide");
    //saveSortChanges(sortOrderArray, "sort");
}

function SortImageArray(a, b) {
    var aSortOrder = Number(a.SortOrder);
    var bSortOrder = Number(b.SortOrder);
    return ((aSortOrder < bSortOrder) ? -1 : ((aSortOrder > bSortOrder) ? 1 : 0));
}

function autoIncrimentSortOrder() {
    //if (confirm("reset all sort orders")) {
    updateSortOrder();

    loadingGif("show");
    showDataInfo("auto incrimenting array");
    sortOrderArray = [];
    let autoI = 0;

    const sortBoxInput = document.getElementsByClassName("sortBoxInput");
    Array.from(sortBoxInput).forEach((sortBox) => {
        sortOrderArray.push({
            ItemId: sortBox.id,
            ImageSrc: sortBox.name,
            SortOrder: autoI += 2
        });
    });
    showDataInfo("hide");
    loadingGif("hide");
    reloadSortTool();
}

function reloadSortTool() {
    removeContents(ele("sortToolImageArea"));
    Array.from(sortOrderArray).forEach((link) => {
        sortToolImageArea.insertAdjacentHTML("beforeend", `
            <div class='sortBox'><img class='sortBoxImage' src='`+ settingsImgRepo + link.ImageSrc + `'/>
            <br/><input class='sortBoxInput' id="` + link.ItemId + `" value="` + link.SortOrder + `"name="` + link.ImageSrc + `"></input></div>`);

    });
    resizeAlbumPage("sort tool");
}

// 2 22 2022
// messed up 12/2024
function saveNewSortOrder() {
    try {
        showDataInfo("saving changes");
        let sStart = Date.now();
        let srtSaveObj = {};
        srtSaveData = new FormData();
        srtSaveData.append('folderId', currentFolderId);
        srtSaveData.append('sortOrderArray', JSON.stringify(sortOrderArray));

        postDataToServer("php/updateSortOrder.php", srtSaveData, srtSaveObj);
        let srtSavIncr = setInterval(() => {
            if (ready(srtSaveObj.data)) {
                clearInterval(srtSavIncr);
                if (srtSaveObj.data != "ok")
                    showDataInfo(srtSaveObj.data);
                else {
                    let delta = (Date.now() - sStart);
                    if (delta < 88)
                        showDataInfo(srtSaveObj.data);
                    else {
                        showDataInfo(srtSaveObj.data + "  Saving changes took: " + (delta / 1000).toFixed(3));
                    }
                    if (sessionStorage.VisitorId != adminVisitorId) {
                        sendOggleMail("someone sorted an album", "cool");
                        logOggleEvent("APS", "save sort order"); // album page sorted
                    }
                }
            }
        }, 200);
    } catch (e) {
        showDataInfo("hide");
        loadingGif("hide");
        alert("save sort order: " + e);
        logCommonError("CAT", e, "save sort order");
    }
}

function closeSortTool() {
    hideElement(ele("sortToolArea"));
    showElement(ele("albumContentArea"));    
    location.reload();
}

function resizeSortToolPage() {

    const extraBottom = 22;
    const albumPageFooter = ele("albumPageFooter");
    const sortToolArea = ele("sortToolArea");

    if (albumPageFooter.offsetTop < (window.innerHeight + extraBottom)) {
        albumPageFooter.offsetTop = window.innerHeight + extraBottom;
        ele("albumPageFooter").style.top = (window.innerHeight + extraBottom) + "px";

    }
    if (albumPageFooter.offsetTop < (sortToolArea.clientHeight + extraBottom)) {
        albumPageFooter.offsetTop = sortToolArea.clientHeight + extraBottom;
        ele("albumPageFooter").style.top = (sortToolArea.clientHeight + extraBottom) + "px";
    }
}

