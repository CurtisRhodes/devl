const settingsImgRepo = 'https://ogglefiles.com/danni/';
const settingsDanniPath = '../../../ogglefiles.com/public_html/danni/';
let currentImagelinkId, currentIsLargeLoad, currentAlbumItemIndex = 0;
let slideshowVisible = false, imageViewerVisible = false, dialogBoxOpen = false, albumPageRunning = false;
let mousePos = {};
let currentDragElement = null;

function onMouseMove(e) {
    e.preventDefault();
    offsetX = mouseX - e.clientX;
    offsetY = mouseY - e.clientY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    currentDragElement.style.top = (currentDragElement.offsetTop - offsetY) + 'px';
    currentDragElement.style.left = (currentDragElement.offsetLeft - offsetX) + 'px';
}

function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}

function recordHitSource(calledFrom, folderId) {
    try {
        if (folderId != 0) {
            var data = new FormData();
            data.append('folderId', folderId);
            data.append('siteCode', calledFrom);
            data.append('visitorId', localStorage.VisitorId);

            let hsSuccess = new Object;
            postDataToServer("php/logTrackbackHit.php", data, hsSuccess);
            let dataIncr = setInterval(function () {
                if (isNullorUndefined(hsSuccess.data))
                    loadingGif("show");
                else {
                    clearInterval(dataIncr); loadingGif("hide");
                    if (hsSuccess.data.trim() == "ok") {
                        // logOggleActivity("HSR", folderId, "siteCode: " + siteCode);  // hit source recorded
                    }
                    else {
                        switch (success.trim()) {
                            case '23000': // duplicate page hit
                                //logOggleError("EVD", folderId, "php code: " + success.trim(), "record hit source");
                                break;
                            case '42000':
                            default:
                                logOggleError("AJX", "php code: " + success.trim(), "record hit source");
                        }
                    }
                }
            }, 200);
        }
    } catch (e) {
        logOggleError("CAT", e, "record hit source");
    }
}

function memorySizeOf(obj) {
    // https ://gist.githubusercontent.com/zensh/4975495/raw/d126a12e84c85efe2460c543263317b8f50f2bad/memorySizeOfObject.js
    var bytes = 0;

    function sizeOf(obj) {
        if (obj !== null && obj !== undefined) {
            switch (typeof obj) {
                case 'number':
                    bytes += 8;
                    break;
                case 'string':
                    bytes += obj.length * 2;
                    break;
                case 'boolean':
                    bytes += 4;
                    break;
                case 'object':
                    var objClass = Object.prototype.toString.call(obj).slice(8, -1);
                    if (objClass === 'Object' || objClass === 'Array') {
                        for (var key in obj) {
                            if (!obj.hasOwnProperty(key)) continue;
                            sizeOf(obj[key]);
                        }
                    } else bytes += obj.toString().length * 2;
                    break;
            }
        }
        return bytes;
    };

    function formatByteSize(bytes) {
        if (bytes < 1024) return bytes + " bytes";
        else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + " KiB";
        else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + " MiB";
        else return (bytes / 1073741824).toFixed(3) + " GiB";
    };

    return formatByteSize(sizeOf(obj));
};

// onpagehide

function fileExists(filename) {
    let fileExists = new Object;
    getDataFromServer("php/fileExists.php?filename=" + settingsImgRepo + filename + "'", fileExists);
    let dataIncr = setInterval(function () {
        if (isNullorUndefined(fileExists.data))
            loadingGif("show");
        else {
            clearInterval(dataIncr); loadingGif("hide");
            return fileExists.data;
        }
    }, 200);
}

function showPageHits(folderId) {
    // showPageHits
    try {
        let rtn = new Object;
        getDataFromServer("php/getPageHits.php?pageId=" + folderId, rtn);
        let dataIncr = setInterval(function () {
            if (ready(rtn.data)) {
                clearInterval(dataIncr);
                let pgHits = JSON.parse(rtn.data);
                document.getElementById("footerCol5").insertAdjacentHTML("beforeend", "<div>page hits: " + Number(pgHits).toLocaleString());
            }
        }, 200);
    } catch (e) {
        logOggleError("CAT", e, "show page hits")
        document.getElementById("footerCol5").insertAdjacentHTML("beforeend", "<div> page hits: cat error");
    }
} 

/*-- click events --------------------------------------*/{
    function addRankerButton(rankerType, labelText) {
        return "<div class='headerBannerButton'>\n" +
            "<div class='clickable' onclick='location.href=\"index.html?spa=3907&bp=" + rankerType + "\"'" +
            "title='Spin through the links to land on random portrait images.'>" + labelText + "</div>" +
            "</div>\n";
    }

    function addPgLinkButton(folderId, labelText) {
        return "<div class='headerBannerButton'>" +
            //"   <div class='clickable' onclick='location.href=\"album.html?folder=" + folderId + "\"'>" + labelText + "</div>" +
            "   <div class='clickable' onclick='rtpe(\"HB2\",\"" + hdrRootFolder + "\"," + hdrFolderId + "," + folderId + ")'>" + labelText + "</div>" +
            "</div>\n";
    }

    function bannerLink(folderId, labelText, href) {
        let bannerHtml = `<div class='headerBannerButton'>
            <div class='clickable' onclick="logOggleEvent('BCL','` + labelText + `');window.location.href='` + href + `'">` + labelText + `</div>
        </div>`;
        return bannerHtml;
    }

    function topLogoClick(rootFolder) {
        if (document.location.hostname === "beta.ogglebooble.com") {
            switch (rootFolder) {
                case "playboy":
                case "adult":
                    window.location.href = "https://beta.ogglebooble.com/index.html?spa=playboy";
                    break;
                case "porn":
                case "sluts":
                    window.location.href = "https://beta.ogglebooble.com/index.html?spa=porn";
                    break;
                default:
                    window.location.href = "https://beta.ogglebooble.com";
            }
        }
        else {
            switch (rootFolder) {
                case "playboy":
                case "centerfold":
                case "cybergirls":
                case "international":
                case "lingerie":
                case "muses":
                case "adult":
                case "magazine":
                case "plus":
                case "adult":
                    window.location.href = "https://live.ogglebooble.com/index.html?spa=playboy";
                    break;
                case "porn":
                case "sluts":
                    window.location.href = "https://live.ogglebooble.com/index.html?spa=porn";
                    break;
                default:
                    window.location.href = "https://live.ogglebooble.com";
                //archive	22, 142
                //bond	181
                //boobs	319
                //celebrity	112
                //gent	626
                //    soft	282
                //    special	6

            }
        }
    }
}

/*-- key down handler --------------------------------------*/
function captureKeydownEvent(event) {
    try {
        if (ready(event.keyCode)) {
            switch (event.keyCode) {
                case 27: // Esc
                    break;
                case 113: // F2
                    ele("txtSearch").focus();
                    break;
                case 114: // F3
                    break;
                case 115: // F4  GO TO COMMAND LINE
                    break;
                case 116: // F5
                    break;
                case 117: // F6                  
                    break;
                case 119: // F8
                    //if (typeof currentFolderId == 'string')
                    //    showFolderCommentPanel(currentFolderId);
                    break;
                case 121: // F10
                    //toggleStandardHeader();
                    if (albumPageRunning) {
                        //let albumInfo = new Object;
                        //getDataFromServer("php/getAlbumInfo.php?folderId=" + currentFolderId, albumInfo);
                        //let albumIncr = setInterval(function () {
                        //    if (ready(albumInfo.data)) {
                        //        clearInterval(albumIncr);
                        //        if (albumInfo.data != "[]") {
                        //            albumInfo = JSON.parse(albumInfo.data)[0];
                        //            showImageViewer(albumInfo);
                        //        }
                        //        else {
                        //            logOggleError("AJX", albumInfo.data, "get album info for image viewer");
                        //        }
                        //    }
                        //}, 200);
                        //runSlideshow();

                        showSlideshowViewer(albumInfo);

                    }
                    break;

                case 123: break; // F12
                // default: console.log('unhandled keyCode: ' + event.keyCode);
            }
        }
        // left: 37, up: 38, right: 39, down: 40
        if (!dialogBoxOpen) {
            if (event.ctrlKey) {
                switch (event.which) {
                    case 38: //... handle Ctrl-up
                        getNavg('up');
                        break;
                    case 39: //... handle Ctrl-rightArrow
                        getNavg('next');
                        break;
                    case 37: //... handle Ctrl-leftArrow
                        getNavg('previous');
                        break;
                }
            }
        }

        if (imageViewerVisible) {
            switch (event.which) {
                case 27:                        // esc
                    closeImageViewer();
                    break;
                case 34:                        // pg down
                case 40:                        // dowm arrow
                case 37:                        // left arrow
                    event.preventDefault();
                    window.returnValue = false;
                    ImageViewerMove('previous', 'arrow key');
                    break;
                case 13:                        // enter
                case 38:                        // up arrow
                    event.preventDefault();
                    window.returnValue = false;
                    ImageViewerMove('up', 'arrow key');
                    break;
                case 39:                        // right arrow
                    event.preventDefault();
                    window.returnValue = false;
                    ImageViewerMove('next', 'arrow key');
                    break;
                //case 122:                       // F11
                //    ('#standardHeader').hide();
                //    break;
            }
        }

        if (slideshowVisible) {
            switch (event.which) {
                case 27:                        // esc
                    closeSlideshow();
                    break;
                //case 38: scrollTabStrip('foward'); break;
                //case 33: scrollTabStrip('foward'); break;
                case 34:                        // pg down
                case 40:                        // dowm arrow
                case 37:                        // left arrow
                    slide('prev');
                    break;
                case 13:                        // enter
                case 38:                        // up arrow
                case 39:                        // right arrow
                    event.preventDefault();
                    window.returnValue = false;
                    slide('next');
                    break;
                //case 122:                       // F11
                //    ('#standardHeader').hide();
                //    break;
            }
        }
    } catch (e) {
        // if(sessionStorage.VisitorId==adminVisitorId)

        logOggleError("CAT", e, "capture keydown event.  which: " + event.which + " ctrlKey: " + event.ctrlKey);
    }
}

function addTouch() {
    let touchstartX = 0
    let touchendX = 0

    function checkDirection() {
        if (touchendX < touchstartX) {
            // alert('swiped left!')
            ImageViewerMove('next', 'swipe');
        }
        if (touchendX > touchstartX) {
            // alert('swiped right!')
            ImageViewerMove('back', 'swipe');
        }
    }

    document.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX
        checkDirection();
    });

    document.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        checkDirection();
    });
}
