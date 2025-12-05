const posterFolder = 'https://ogglefiles.com/danni/posters/';
const notFound_folderImage = 'img/redBalloonSmall.png';
const notFound_ImageLink = 'img/RenStimpy8.jpg'

let albumImagesArray = [];
let islargeLoad = false;
let repairFuncAvailable = false;

function loadAlbumPage(folderId, largeLoad) {
    try {
        hideElement(ele("albumPageFooter"));

        currentFolderId = folderId;
        islargeLoad = largeLoad;

        validateUser();

        loadAlbumImages(folderId);

        getAlbumPageInfo(folderId);

        document.addEventListener('keydown', captureKeydownEvent);
        window.addEventListener("resize", () => { resizeAlbumPage("resize") });

        ele("visibleArea").addEventListener("mousemove", (e) => {
            mousePos.x = e.clientX;
            mousePos.y = e.clientY;
            if (typeof checkContextMenuBounds === 'function') {
                checkContextMenuBounds(e);
            }
        });

    } catch (e) {
        logOggleError("CAT", e, "load Album Page");
    }
}

function loadAlbumImages(folderId) {
    try {
        let sql = "select * from vwAlbumImages where FolderId=" + folderId + " order by SortOrder";
        //if (islargeLoad)
        //    sql = "select * from vwAlbumImages where FolderId in (select Id from CategoryFolder where Parent =" + folderId + " and RootFolder !='magazine')";

        let vlinksObj = {};
        let imageHtml = "";
        getDataFromServer('php/fetchAll.php?schema=oggleboo_Danni&query=' + sql, vlinksObj);
        let vlinksIntrvl = setInterval(function () {
            if (ready(vlinksObj.data)) {
                clearInterval(vlinksIntrvl);
                if (vlinksObj.data.indexOf("connection Failed") > -1) {
                    displayStatusMessage("error", "max_user_connections. reload (F5)");
                }
                else {
                    const imageContainer = ele("imageContainer");
                    albumImagesArray = [];
                    let vlinks = JSON.parse(vlinksObj.data);
                    let imgSrc = 'img/redBallon.png';
                    vlinks.forEach(vlink => {
                        if (isNullorUndefined(vlink.FileName)) {
                            logOggleError("MAI", "albumImage.FileName null", "get album images"); // missing FileName
                        }
                        else {
                            imgSrc = settingsImgRepo + "/" + vlink.FileName.replace(/'/g, '%27');
                        }

                        if (imgSrc.endsWith("mpg") || imgSrc.endsWith("mp4")) {
                            imageContainer.insertAdjacentHTML("beforeend", `
                            <div class='intividualImageContainer'>
                                <video id='vid` + vlink.LinkId + `' controls='controls' class='thumbImage'>
                                    <source src='` + imgSrc + `' type='video/mp4' label='label'>
                                </video>
                            </div>`);
                            ele('vid' + vlink.LinkId).addEventListener("contextmenu", (e) => {
                                e.preventDefault();
                                mousePos.x = e.clientX;
                                mousePos.y = e.clientY;
                                showContextMenu('video', folderId, vlink.LinkId, imgSrc);
                            });
                        }
                        else {
                            imageHtml = `<div class='intividualImageContainer'>
                                    <img id='img` + vlink.ImageId + `' class='albumImage' alt='` + vlink.FolderName + `' title='` + vlink.FolderName + `'
                                    src='` + imgSrc + `' 
                                    onclick="showImageViewer('` + imgSrc + `',` + vlink.SortOrder + `)"/>`; 
                                    // onerror="albumImageError('` + vlink.ImageId + `','` + vlink.FileName + `')"
                            if (vlink.LinkId != 0) {  // a link
                                imageHtml += `<div class='knownModelIndicator'>
                                    <img src='img/horosEye.png' alt='alt' title='`+ vlink.FolderName + `'
                                    onclick='window.open(\"album.html?folder=` + vlink.LinkId + `\")'/>
                                </div>`;
                            }
                            albumImagesArray.push(imgSrc);
                            // imageHtml += `</div>`;
                            imageContainer.insertAdjacentHTML("beforeend", imageHtml);

                            ele('img' + vlink.ImageId).addEventListener("contextmenu", (e) => {
                                e.preventDefault();
                                mousePos.x = e.clientX;
                                mousePos.y = e.clientY;
                                showContextMenu('image', folderId, vlink.ImageId);
                            });
                        }
                    });
                    loadSubFolderImages(folderId);
                }
            }
        }, 20);
    }
    catch (e) {
        loadingGif("hide");
        logOggleError("CAT", e, "get album images");
    }
}

function loadSubFolderImages(folderId) {
    try {
        let imgSrc, subdirObj = {};
        let url = "select * from vwSubfolders where Parent= " + folderId + " order by SortOrder";
        getDataFromServer("php/fetchAll.php?schema=oggleboo_Danni&query=" + url, subdirObj);
        let subdirIntrvl = setInterval(() => {
            if (ready(subdirObj.data)) {
                clearInterval(subdirIntrvl);
                if (subdirObj.data.indexOf("connection Failed") > -1) {
                    // logOggleEvent(SQLSTATE[HY000][1203] User oggleboo_dbAdmin already has more than 'max_user_connections' active connections)
                    displayStatusMessage("error", "max_user_connections. reload (F5)");
                }
                else {
                    let folders = JSON.parse(subdirObj.data);
                    folders.forEach((subFolder) => {
                        let folderCounts = "(" + (Number(subFolder.FileCount) + Number(subFolder.Links)).toLocaleString() + ")";
                        if (subFolder.SubFolders > 0)
                            folderCounts = "(" + subFolder.SubFolders + "/" + Number(subFolder.TotalChildFiles).toLocaleString() + ")";
                        if (isNullorUndefined(subFolder.FolderImage)) {
                            if (subFolder.IsStepChild == 1) {
                                // repairStepChildImage(subFolder.Id);
                                imgSrc = notFound_folderImage;
                            }
                            else {
                                // addRandomFolderImage(subFolder.Id);
                                imgSrc = notFound_folderImage;
                            }
                        }
                        else
                            imgSrc = settingsImgRepo + "/" + subFolder.FolderImage;

                        let folderBorderClass = 'subFolderContainer';
                        if (subFolder.IsStepChild == 1) {
                            folderBorderClass = 'stepChildContainer';
                        }
                        imageContainer.insertAdjacentHTML("beforeend",
                            `<div class='` + folderBorderClass + `' 
                                    onclick='folderClick(` + subFolder.Id + `,"` + subFolder.IsStepChild + `")'>
                                        <img id='img` + subFolder.Id + `' class='folderImage' alt=` + subFolder.FolderName + `
                                        src='` + imgSrc + `' 
                                        onerror='folderImageError(` + folderId + `,"` + subFolder.FolderImage + `")'/>
                                    <div class='defaultSubFolderImage'>` + subFolder.FolderName + `</div>
                                    <span Id='fc` + subFolder.Id + `'>` + folderCounts + `</span>
                                </div>`);

                        ele('img' + subFolder.Id).addEventListener("contextmenu", (e) => {
                            e.preventDefault();
                            mousePos.x = e.clientX;
                            mousePos.y = e.clientY;
                            showContextMenu('folder', subFolder.Id, null, imgSrc);
                        });
                    });

                    showElement(ele('slideShowClick'));
                    resizeAlbumPage("loadSubFolders");
                    document.addEventListener("DOMContentLoaded", function () {
                        const div = document.querySelector("imageContainer");
                        const images = div.querySelectorAll("img");
                        let loadedCount = 0;

                        images.forEach((img) => {
                            img.addEventListener("load", () => {
                                loadedCount++;
                                if (loadedCount === images.length) {
                                    console.log("All images have completely loaded.");
                                    // You can perform any other actions you need here
                                    resizeAlbumPage("loaded");
                                }
                            });

                            // Optionally handle errors
                            img.addEventListener("error", () => {
                                console.error(`Image failed to load: ${img.src}`);
                                loadedCount++;
                                if (loadedCount === images.length) {
                                    console.log("All images have completely loaded, including failed ones.");

                                }
                            });
                        });
                    });

                    setTimeout(() => { resizeAlbumPage("timeout1"); }, 899);
                    setTimeout(() => { resizeAlbumPage("timeout2"); }, 2222);
                }
            }
        }, 33);
    } catch (e) {
        logOggleError("CAT", e, "get subFolders");
    }
}

function folderClick(folderId, folderType) {
    try {
        if (folderType === "1")
            window.open("/album.html?folder=" + folderId, "_blank");  // open in new tab
        else {
            // report event pare hit
            window.location.href = "/album.html?folder=" + folderId;  //  open page in same window
        }
        //" onclick='rtpe(\"SUB\",\"called from: " + folderId + "\",\"" + folder.DirectoryName + "\"," + folder.FolderId + ")'>\n" +
    } catch (e) {
        logOggleError("CAT", e, "folder click");
    }
}

function rotateTopBanner() {
    const headerTopRowLeft = ele("headerTopRowLeft");
    let msgArray = [];
    let msgArrayIdx = 0;
    // headerTopRowLeft.fadeIn('slow').html(msgArray[0]);
    let folderStats = new Object;
    let url = `php/fetch.php?schema=oggleboo_Danni&query=select (select format(count(*), 0) from CategoryFolder 
            where FolderType in ('singleParent', 'singleChild', 'singleModel')) albums, (select format(count(*), 0) images from ImageFile) images`;

    getDataFromServer(url, folderStats);
    let dataIncr = setInterval(function () {
        if (isNullorUndefined(folderStats.data))
            loadingGif("show");
        else {
            loadingGif("hide");
            clearInterval(dataIncr); 
            let fileCounts = JSON.parse(folderStats.data);
            msgArray.push(fileCounts.albums + " albums containing " + fileCounts.images + " images");
            msgArray.push(fileCounts.albums + " albums containing " + fileCounts.images + " images");
            msgArray.push("All images handpicked. Only girls I like. Only images I like.");
            // msgArray.push("Please send me some <a href='javascript:showOggleFeedbackDialog()'>feedback</a>. Tell me how you like my site.");
            msgArray.push("More pics of <a href='album.html?folder=1132'>Playboy models</a> than Playboy. (Sorces other than just Playboy licensed pitcures included.)");
            // msgArray.push("Please send me some <a href='javascript:showOggleFeedbackDialog()'>feedback</a>. Tell me how you like my site.");
            msgArray.push("Galleries of Playboy Adult Stars (the only remaining ongoing series), includes their porn images");
            msgArray.push("Porn images seperated from glam shots in seperate folders");
            msgArray.push("All albums double dupechecked and (most) <a href='javascript:helpMe()'>sorted</a>");
            msgArray.push("All images handpicked. Gynacological snatch shots removed");
            msgArray.push("All images handpicked. No faceless random body parts pics");
            msgArray.push("All images handpicked. Most dildo and twat touching money shots removed.");
            msgArray.push("And yet I still have " + fileCounts.albums + " albums containing " + fileCounts.images + " filtered, culled, and dupe checked images");
            msgArray.push("Please send me some <a href='javascript:showOggleFeedbackDialog()'>feedback</a>. Tell me how you like my site.");
            msgArray.push("check out my new <a href='javascript:showSiteMap(\"banner\")'>sitemap</a>");
            msgArray.push("check out my <a href='javascript:showCategoryList(\"banner\")'>Category List</a>");

            if (sessionStorage.UserName == "unregistered")
                msgArray.push("Register and Log in for added features and functionality");
            else
                msgArray.push("thank you for registering " + sessionStorage.UserName + ". <a href='javascript:extraFeatures()'>Learn about</a> added features and functionality");

            //msgArray.push("learn about this website");
            //msgArray.push("see <a href='javascript:mostPopularAlbums()'>the list</a> of my most popular albums");
            //msgArray.push("learn about my <a href='javascript:endlessCarouselInfo()'>endless carousel</a>");
            //msgArray.push("most twat touching shots removed");
            //msgArray.push("most twat touching shots removed");
            // msgArray.push("<a href='javascript:helpMe()'>help me</a> improve this site");

            let endlessInterval = setInterval(function () {
                fade(headerTopRowLeft, "in");
                setTimeout(function () {
                    fade(headerTopRowLeft, "out");
                    if (++msgArrayIdx >= msgArray.length) msgArrayIdx = 0;
                    replaceHtml(headerTopRowLeft, msgArray[msgArrayIdx]);
                }, 9400);
            }, 9450);
        }
    }, 200);
}

function folderImageError(folderId, jpgName) {
    try {
        let imgextsObj = {};
        if (isNullorUndefined(jpgName)) {

        }
        else {
            if (jpgName.substr(jpgName.lastIndexOf("_")).length > 36) {
                let imageId = jpgName.substr(jpgName.lastIndexOf("_") + 1, 36);
                if (isGuid(imageId)) {
                //    getDataFromServer("php/imageFileRecordExists.php?imageId=" + imageId, imgextsObj);
                //    let imgextsIntrvl = setInterval(function () {
                //        if (ready(imgextsObj.data)) {
                //            clearInterval(imgextsIntrvl);
                //            if (imgextsObj.data == "ok") {
                //                //('#img' + linkId + '').attr('src', imgSrc);
                //                // logOggleActivity("SAE", folderId, "album Image Error") // says album Image exists  ERROR MESSAGE AVOIDED
                //                //('#img' + linkId + '').attr('src', imgSrc);
                //            }
                //            else {
                //                //if (('#' + linkId).attr('src') == null) {
                //                //('#img' + linkId + '').attr('src', 'https://www.ogglebooble.com/img/RenStimpy8.jpg');
                //                // logOggleError("AIF", folderId, "linkId: " + linkId, fileName);
                //                // logOggleActivity("AIF", folderId, "imgSrc: " + imgSrc);
                //            }
                //        }
                //    }, 48);
                }
            }
        }
    } catch (e) {
        logOggleError("CAT", e, "album image error")
    }
}

function addRandomFolderImage(folderId) {
    try {
        let fRepirObj = {};
        getDataFromServer("php/repairFolderImage.php?folderId=" + folderId, fRepirObj);
        let fRepirIntrvl = setInterval(() => {
            if (ready(fRepirObj.data)) {
                clearInterval(fRepirIntrvl);
                // let rtnData = JSON.parse();
                if (fRepirObj.data.length == 36) {
                    let eleMissingImage = ele("img" + folderId);
                    if (ready(eleMissingImage)) {
                        eleMissingImage.src = settingsImgRepo + "/" + fRepirObj.data;
                        logOggleActivity("FIF", "add ImageLink");
                    }
                    else
                        logOggleError("BUG", "uncable to create " + emptyImg, "add missing folder Image");
                }
                else
                    logOggleError("AJX", fRepirObj.data, "add missing folder Image");
            }
        }, 124);
    } catch (e) {
        logOggleError("CAT", e, "add ImageLink");
    }
}

function albumImageError(linkId, fileName) {
    if (ready(fileName)) {
        //if (sessionStorage.VisitorId == adminVisitorId) { myAlert("404 " + fileName + " " + linkId); };

        ele("img" + linkId).src = 'img/redBallon.png';

        let four0fourobj = {};
        getDataFromServer("php/fetch.php?schema=oggleboo_Danni&query=select * from ImageFile where Id='" + linkId + "'", four0fourobj);
        let four0fourInterval = setInterval(() => {
            if (ready(four0fourobj.data)) {
                clearInterval(four0fourInterval);
                if (four0fourobj.data == "false") {
                    logOggleError("404", fileName, "imageId: " + linkId);
                }
            }
        }, 404);
    }
}

function repairStepChildImage(folderId) { }

function resizeAlbumPage(calledFrom) {
    try {
        if (ele("albumContentArea").style.display != "none") {
            const stdHeader = ele("stdHeader");
            var headerSpace = stdHeader.clientHeight + 10;
            const albumContentArea = ele("albumContentArea");

            var imageContainerHeight = albumContentArea.clientHeight;

            var windowHeight = (window.innerHeight - headerSpace);

            var footerOffset;
            if (windowHeight > imageContainerHeight) {
                footerOffset = (windowHeight - imageContainerHeight);
            }
            else {
                footerOffset = 8;
            }

            imageContainer.style.marginBottom = footerOffset + "px";
        }
    } catch (e) {
        logOggleError("CAT", e, "resize album page: " + calledFrom);
    }
}
