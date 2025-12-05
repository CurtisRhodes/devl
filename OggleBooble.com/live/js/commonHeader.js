const adminVisitorId = '7a8e876b-6f3b-4109-9f30-66caba1046bb';
let currentFolderId = 0;
let headerInfo = {};

function displayCommonHeader(commonHeaderData) {
    try {
        headerInfo = commonHeaderData;

        getCommonHeaderHtml();

        currentFolderId = headerInfo.FolderId;
        currentVisitorId = headerInfo.VisitorId;

        setHeaderValues();
        setPageColors();
        changeFavoriteIcon();
        setDocumentTitle();

        ele("oggleHeader").addEventListener("resize", () => { resizeHeader() });
        resizeHeader();

    } catch (e) {
        if (headerInfo.VisitorId == adminVisitorId) {
            alert("display Header CATCH: " + e);
        }
        logCommonError("CAT", 999, e, "display header");
    }
}

function getCommonHeaderHtml() {
    replaceHtml(ele("stdHeader"), `
        <div id="oggleHeader" class="stickyHeader flexContainer">
        <div id="hdrLeftSection" class='siteLogoContainer'>
            <img id='divSiteLogo' title='home' class='siteLogo' src='img/redBalloon.png' />
        </div>
        <div id="hdrMiddleSection" class="headerSection hdrMiddleSection">
            <div class="aboveBreadcrumb">
                <div id="hdrLeft" class="headerSection">
                    <div id='fancyHeaderTitle' class='calligraphyTitle'></div>
                </div>
                <div class="headerSection">
                    <div id='hdrTopMenu' class='headerRow hdrSubTitle'></div>
                    <div id='headerTopRowMiddle' class='headerRow'></div>
                </div>
                <div id="hdrMiddle2" class="headerSection">
                    <div id='headerTopRowRight'  class='headerRow'></div>                        
                </div>
                <div class="headerSection">
                    <div id="headerTopRowCol1"></div>
                </div>
                <div class="headerSection">
                    <div id="headerTopRowCol2"></div>
                </div>
            </div>
            <div class="headerSection hdrMiddleSection">
                <div>
                    <div id="headerBottomRowCol1"></div>
                </div>
                <div id='breadcrumbContainer' class='menubar'></div>
            </div>
        </div>
        <div id="logoIcons" class="flexContainer" style="margin-top:5px;"></div>
        <div id="hdrRightSection" class="headerSection">
            <div id='searchContainer' class='searchBoxContainer'>
                <span>search</span><input type="text" id='txtSearch' class='searchBoxText' title='search' onfocus='activateSearch()' />
                <div id='searchResultsDiv' class='searchResultsContainer'>
                    <ul id='searchResultsList' class='oggleSearchList'></ul>
                </div>
            </div>
            <div class="loginContainer">
                <div id='divLogin' class='logInLink clickable'>login</div>
            </div>
        </div>
    </div>

    <div id='vailShell' class='modalVail'></div>

    <div id="standardDialogBox" class="standardDialogBox">
        <div id='standardDialogHeader' class='standardDialogHeader'>
            <div id='standardDialogTitle' class='standardDialogTitle'></div>
            <div id="standardDialogCloseButton" class='dialogCloseButton'>
                <img src='img/close.png' title='close dialog window' alt='close' />
            </div>
        </div>
        <div id='standardDialogContents' class='standardDialogContents'></div>
    </div>

    <div id='contextMenuContainer' class="ogContextMenuFocusShell">
        <div id="innerContextMenu" class='ogContextMenu'>
            <div id='contextMenuHeader' class='ogContextMenuHeader'></div>
            <div id='contextMenuContent' class='ogContextMenuContent'></div>
        </div>
    </div>`);

    ele('divSiteLogo').addEventListener('click', () => { siteLogoClick(headerInfo) });
}

function setHeaderValues() {
    try {
        let hdrTopMenu = "";
        let headerTopRowRight = "";
        let fancyTitle = "";
        let breadcrumbs = "";
        let logoIcons = "";
        if (headerInfo.FolderName === "index") {
            switch (headerInfo.RootFolder) {
                case "boobs":
                    fancyTitle = "Home of the Big Naturals";
                    ele("fancyHeaderTitle").style.cursor = "pointer";
                    ele("fancyHeaderTitle").addEventListener("click", function () { window.location.href = "album.html?folder=1132" });
                    logoIcons = `
                    <div class="logoButon"
                        onclick="logOggleEvent('BCL',460,'playboy'); window.open('index.html?spa=playboy')">
                        <img src='img/playboyBalloon.png'
                       title="every Playboy Centerfold"/></div>

                    <div class="logoButon"
                        onclick="logOggleEvent('BCL',460,'oggle'); window.open('index.html?spa=porn')">
                        <img src='img/csLips02.png'
                       title="oggle porn"/>
                    </div>`;

                    hdrTopMenu = boobsTopMenu();
                    breadcrumbs = `
                    <div class='breadcrumb' onclick='headerMenuClick(9736)'>big</div>
                    <div class='breadcrumb' onclick='headerMenuClick(9733)'>hot</div>
                    <div class='breadcrumb' onclick='headerMenuClick(22444)'>new</div>
                    <div class='breadcrumb' onclick='headerMenuClick(91)'>back in the day</div>
                    <div class='breadcrumb' onclick='headerMenuClick(846)'>Gent</div>
                    <div class='breadcrumb' onclick='headerMenuClick(103)'>heavy weapons</div>
                    <div class='breadcrumb' onclick='headerMenuClick(123)'>ultra jugs</div>`;
                    resizeHeader();

                    break;
                case "playboy":
                    fancyTitle = "Every Playboy Centerfold";
                    hdrTopMenu = playboyTopMenu();
                    breadcrumbs = `
                    <span onclick='headerMenuClick(621)'>1950's</span>
                    <span onclick='headerMenuClick(638)'>1960's</span>
                    <span onclick='headerMenuClick(639)'>1970's</span>
                    <span onclick='headerMenuClick(640)'>1980's</span>
                    <span onclick='headerMenuClick(628)'>1990's</span>
                    <span onclick='headerMenuClick(641)'>2000's</span>
                    <span onclick='headerMenuClick(513)'>2010's</span>
                    <span onclick='headerMenuClick(4128)'>2020's</span>`;
                    logoIcons = `
                    <div class="logoButon"
                        onclick="logOggleEvent('BCL',460,'oggle'); window.open('index.html?spa=boobs')">
                        <img src='img/redBalloon.png'
                       title="back to OggleBooble"/>
                    </div>
                    <div class="logoButon"
                        onclick="logOggleEvent('BCL',460,'oggle'); window.open('index.html?spa=porn')">
                        <img src='img/csLips02.png'
                       title="oggle porn"/>
                    </div>`;
                    break;
                case "porn":
                    fancyTitle = "Oggle porn";
                    hdrTopMenu = pornTopMenu();
                    logoIcons = `
                    <div class="logoButon"
                        onclick="logOggleEvent('BCL',460,'oggle'); window.open('index.html?spa=boobs')">
                        <img src='img/redBalloon.png'
                       title="back to OggleBooble"/>
                    </div>
                    <div class="logoButon"
                        onclick="logOggleEvent('BCL',460,'playboy'); window.open('index.html?spa=playboy')">
                        <img src='img/playboyBalloon.png'
                       title="every Playboy Centerfold"/></div>`;
                    break;
                case "admin":
                    fancyTitle = "Admin Panel";
                    hdrTopMenu = "Brucheum live page";
                    // breadcrumbs = ``;


                    break;
            }
        }
        else {
            switch (headerInfo.RootFolder) {
                case "root": hdrTopMenu = "root"; break;
                case "archive":
                case "boobs":
                    fancyTitle = getFolderName();
                    logoIcons = `
                    <div class="logoButon"
                        onclick="logOggleEvent('BCL',460,'playboy'); window.open('index.html?spa=playboy')">
                        <img src='img/playboyBalloon.png'
                       title="every Playboy Centerfold"/></div>

                    <div class="logoButon"
                        onclick="logOggleEvent('BCL',460,'oggle'); window.open('index.html?spa=porn')">
                        <img src='img/csLips02.png'
                       title="oggle porn"/>
                    </div>`;

                    hdrTopMenu = boobsTopMenu();

                    breadcrumbs = `
                    <div class='breadcrumb' onclick='headerMenuClick(9736)'>big</div>
                    <div class='breadcrumb' onclick='headerMenuClick(9733)'>hot</div>
                    <div class='breadcrumb' onclick='headerMenuClick(22444)'>new</div>
                    <div class='breadcrumb' onclick='headerMenuClick(91)'>back in the day</div>
                    <div class='breadcrumb' onclick='headerMenuClick(846)'>Gent</div>
                    <div class='breadcrumb' onclick='headerMenuClick(103)'>heavy weapons</div>
                    <div class='breadcrumb' onclick='headerMenuClick(123)'>ultra jugs</div>`;
                    //rotateTopBanner();

                    break;
                case "centerfold": case "playboy": case "magazine": case "plus": case "lingerie": case "international": case "muses":
                case "cybergirls": case "college": case "adult": case "magazine":
                    logoIcons = `
                           <div class="logoButon"
                        onclick="logOggleEvent('BCL',460,'oggle'); window.open('index.html?spa=boobs')">
                        <img src='img/redBalloon.png'
                       title="back to OggleBooble"/>
                    </div>
                    <div class="logoButon"
                        onclick="logOggleEvent('BCL',460,'oggle'); window.open('index.html?spa=porn')">
                        <img src='img/csLips02.png'
                       title="oggle porn"/>
                    </div>`;


                    switch (headerInfo.RootFolder) {
                        case "centerfold":
                            fancyTitle = "Playboy Centerfold";
                            if (headerInfo.FolderType == "multiFolder") {
                                if (headerInfo.ParentId == 1132) {
                                    fancyTitle = "Playboy Centerfold decade";
                                }
                            }
                            break;
                        case "playboy":
                            fancyTitle = "Playboy";

                            // if (headerInfo.gpId)

                            break;
                        case "magazine": fancyTitle = "Playboy Magazine "; break;
                        case "plus": fancyTitle = "Playboy Plus"; break;
                        case "lingerie": fancyTitle = "Playboy Book of Lingerie"; break;
                        case "international": fancyTitle = "Playboy International"; break;
                        case "muses": fancyTitle = "Playboy Muses"; break;
                        case "cybergirls": fancyTitle = "Playboy Cybergirls"; break;
                        case "college": fancyTitle = "Playboy College girls"; break;
                        case "adult": fancyTitle = "Playboy Adult Stars"; break;
                        case "magazine": fancyTitle = "Playboy Magazine"; break;
                    }
                    //replaceHtml( ele("playboyBreadcrumbContainer"),
                    hdrTopMenu = playboyTopMenu();
                    break;
                case "bond": fancyTitle = "Bond Girls"; break;
                case "porn":
                    fancyTitle = "Oggle porn";
                    hdrTopMenu = pornTopMenu();
                    breadcrumbs = `
                    <div class='breadcrumb' onclick='headerMenuClick(9736)'>big</div>
                    <div class='breadcrumb' onclick='headerMenuClick(9733)'>hot</div>
                    <div class='breadcrumb' onclick='headerMenuClick(22444)'>new</div>
                    <div class='breadcrumb' onclick='headerMenuClick(91)'>back in the day</div>
                    <div class='breadcrumb' onclick='headerMenuClick(846)'>Gent</div>
                    <div class='breadcrumb' onclick='headerMenuClick(103)'>heavy weapons</div>
                    <div class='breadcrumb' onclick='headerMenuClick(123)'>ultra jugs</div>`;
                    logoIcons = `
                    <div class="logoButon"
                        onclick="logOggleEvent('BCL',460,'oggle'); window.open('index.html?spa=boobs')">
                        <img src='img/redBalloon.png'
                       title="back to OggleBooble"/>
                    </div>
                    <div class="logoButon"
                        onclick="logOggleEvent('BCL',460,'playboy'); window.open('index.html?spa=playboy')">
                        <img src='img/playboyBalloon.png'
                       title="every Playboy Centerfold"/></div>`;
                    break;
                case "sluts":
                case "eporn":
                    //fancyTitle = "adult performers";
                    fancyTitle = getFolderName();
                    //hdrTopMenu = getRandomGalleries();
                    hdrTopMenu = `
                    <span class='clickable' onclick='headerMenuClick(1174)'>big titters gone bad, </span>
                    <span class='clickable' onclick='headerMenuClick(3728)'>blonde cocksuckers, </span>
                    <span class='clickable' onclick='headerMenuClick(27388)'>vixens, </span>
                    <span class='clickable' onclick='headerMenuClick(3739)'>exploited teens, <span>
                    <span class='clickable' onclick='headerMenuClick(4271)'>retro porn stars, </span>`;
                    logoIcons = `
                    <div class="logoButon"
                        onclick="logOggleEvent('BCL',460,'playboy'); window.open('index.html?spa=playboy')">
                        <img src='img/playboyBalloon.png'
                       title="every Playboy Centerfold"/></div>
                    <div class="logoButon"
                        onclick="logOggleEvent('BCL',460,'oggle'); window.open('index.html?spa=boobs')">
                        <img src='img/redBalloon.png'
                       title="back to OggleBooble"/>
                    </div>`;
                    break;
                case "soft":
                    fancyTitle = "Oggle softcore";
                    hdrTopMenu = `
                    <span class='clickable underline' onclick='headerMenuClick(379)'>pussy, </span>
                    <span class='clickable underline' onclick='headerMenuClick(420)'>boob suckers, </span>
                    <span class='clickable underline' onclick='headerMenuClick(498)'>girl on girl, </span>
                    <span class='clickable underline' onclick='headerMenuClick(876)'>fondle, </span>
                    <span class='clickable underline' onclick='headerMenuClick(397)'>kinky, </span>
                    <span class='clickable underline' onclick='headerMenuClick(411)'>naughty behaviour</span>`;
                    logoIcons = `
                    <div class="logoButon"
                        onclick="logOggleEvent('BCL',460,'oggle'); window.open('index.html?spa=porn')">
                        <img src='img/csLips02.png'
                       title="oggle porn"/>
                    </div>
                    <div class="logoButon"
                        onclick="logOggleEvent('BCL',460,'oggle'); window.open('index.html?spa=boobs')">
                        <img src='img/redBalloon.png'
                       title="back to OggleBooble"/>
                    </div>
                    <div class="logoButon"
                        onclick="logOggleEvent('BCL',460,'playboy'); window.open('index.html?spa=playboy')">
                        <img src='img/playboyBalloon.png'
                       title="every Playboy Centerfold"/></div>`;
                    break;
                case "gent":
                    fancyTitle = "Gent Archive";
                    hdrTopMenu = "home of the D cups";
                    breadcrumbs = `
                    <span class='clickable underline' onclick='headerMenuClick(\"gent\",1132)'>1950's, </span>
                    <span class='clickable underline' onclick='headerMenuClick(\"gent\",6368)'>1960's, </span>
                    <span class='clickable underline' onclick='headerMenuClick(\"gent\",6095)'>1970's, </span>
                    <span class='clickable underline' onclick='headerMenuClick(\"gent\",3128)'>1980's, </span>
                    <span class='clickable underline' onclick='headerMenuClick(\"gent\",3128)'>1990's, </span>
                    <span class='clickable underline' onclick='headerMenuClick(\"gent\",3128)'>2000's, </span>`;
                    logoIcons = `
                    <div class="logoButon"
                        onclick="logOggleEvent('BCL',460,'oggle'); window.open('index.html?spa=porn')">
                        <img src='img/csLips02.png'
                       title="oggle porn"/>
                    </div>
                    <div class="logoButon"
                        onclick="logOggleEvent('BCL',460,'oggle'); window.open('index.html?spa=boobs')">
                        <img src='img/redBalloon.png'
                       title="back to OggleBooble"/>
                    </div>
                    <div class="logoButon"
                        onclick="logOggleEvent('BCL',460,'playboy'); window.open('index.html?spa=playboy')">
                        <img src='img/playboyBalloon.png'
                       title="every Playboy Centerfold"/></div>`;
                    break;
                case "celebrity":
                    fancyTitle = getFolderName();
                    headerTopRowRight = "Celebrity Skin";
                    logoIcons = `
                    <div class="logoButon"
                        onclick="logOggleEvent('BCL',460,'oggle'); window.open('index.html?spa=porn')">
                        <img src='img/csLips02.png'
                       title="oggle porn"/>
                    </div>
                    <div class="logoButon"
                        onclick="logOggleEvent('BCL',460,'oggle'); window.open('index.html?spa=boobs')">
                        <img src='img/redBalloon.png'
                       title="back to OggleBooble"/>
                    </div>
                    <div class="logoButon"
                        onclick="logOggleEvent('BCL',460,'playboy'); window.open('index.html?spa=playboy')">
                        <img src='img/playboyBalloon.png'
                       title="every Playboy Centerfold"/></div>`;
                    break;
                case "brucheum": break;
                case "intelDesign": break;
                case "admin":
                    hdrTopMenu = "admin";
                    breadcrumbs = `
                    <a class='activeBreadCrumb' href=\"javascript:setLeftMenu('normal');showDefaultWorkArea()\">Brucheum live page</a>
                    <a class='activeBreadCrumb' href=\"javascript:setLeftMenu('admin');showDefaultWorkArea()\">OggleBooble</a>
                    <a class='activeBreadCrumb' href=\"javascript:showReportsSection();\">Intelligent Design</a>`;
                    break;
                case "oggleblog":
                    fancyTitle = "blog";
                    break;
                case "ranker":
                    fancyTitle = "ranker";
                    break;
                case "slideshow":
                    fancyTitle = "Slideshow";
                    break;
                default:
                    fancyTitle = headerInfo.RootFolder;
                    hdrTopMenu = "unhandeled";
                    break;
            }
        }

        replaceHtml(ele("fancyHeaderTitle"), fancyTitle);
        replaceHtml(ele("headerTopRowRight"), headerTopRowRight);
        replaceHtml(ele("logoIcons"), logoIcons);        
        replaceHtml(ele("hdrTopMenu"), hdrTopMenu);
        replaceHtml(ele("breadcrumbContainer"), breadcrumbs);
        resizeHeader();
    } catch (e) {
        if (headerInfo.VisitorId == adminVisitorId) {
            alert("CATCH set header details: " + e);
        }
        else
            logCommonError("CAT", 999, e, "set HeaderValues");
    }
}

function boobsTopMenu() {
    return `
    <span class='clickable underline' onclick='headerMenuClick(3)'>BIG Naturals</span> organized by
    <span class='clickable underline' onclick='headerMenuClick(2)'>poses, </span>
    <span class='clickable underline' onclick='headerMenuClick(136)'> positions,</span>
    <span class='clickable underline' onclick='headerMenuClick(159)'> topics,</span>
    <span class='clickable underline' onclick='headerMenuClick(199)'> shape,</span>
    <span class='clickable underline' onclick='headerMenuClick(241)'> size</span>`;
}
function playboyTopMenu() {
    return `
    <span class='clickable' onclick='headerMenuClick(14264)'>adult stars</span>
    <span class='clickable' onclick='headerMenuClick(6095)'>muses</span>
    <span class='clickable' onclick='headerMenuClick(3796)'>cybergirls</span>
    <span class='clickable' onclick='headerMenuClick(3128)'>international</span>
    <span class='clickable' onclick='headerMenuClick(1155)'>foreign editions</span>
    <span class='clickable' onclick='headerMenuClick(472)'>more</span>`;
}

function pornTopMenu() {
    return `
        <span class='clickable' onclick='headerMenuClick(440)'>slut archive, </span>
        <span class='clickable' onclick='headerMenuClick(243)'>cock suckers, </span>
        <span class='clickable' onclick='headerMenuClick(460)'>titty fuck, </span>
        <span class='clickable' onclick='headerMenuClick(426)'>penetration, </span>
        <span class='clickable' onclick='headerMenuClick(357)'>cum shots, </span>
        <span class='clickable' onclick='headerMenuClick(694)'>kinky, </span>
        <span class='clickable' onclick='headerMenuClick(411)'>naughty behaviour</span>`;
}

function setDocumentTitle() {
    let docTitle = "OggleBooble";
    if (headerInfo.FolderType == "singleChild") {
        if (headerInfo.RootFolder == "centerfold") {
            docTitle = headerInfo.ParentName + ": Playboy Centerfold: " + headerInfo.FolderName + ": OggleBooble";
        }
        else {
            if (!isNullorUndefined(headerInfo.gpName)) {
                if (headerInfo.gpName != "root") {
                    docTitle = headerInfo.ParentName + ": " + headerInfo.FolderName + ": " + headerInfo.gpName + ": OggleBooble";
                }
                else
                    docTitle = headerInfo.ParentName + ": " + headerInfo.FolderName + ": OggleBooble";
            }
            else
                docTitle = headerInfo.ParentName + ": " + headerInfo.FolderName + ": OggleBooble";
        }
    }
    else {
        if (headerInfo.RootFolder == "centerfold") {
            docTitle = headerInfo.FolderName + ": Playboy Centerfold " + headerInfo.ParentName + ": OggleBooble";
        }
        else {
            if (!isNullorUndefined(headerInfo.gpName)) {
                if (headerInfo.gpName != "root")
                    docTitle = headerInfo.FolderName + ": " + headerInfo.ParentName + ": " + headerInfo.gpName + ": OggleBooble";
                else
                    docTitle = headerInfo.FolderName + ": " + headerInfo.ParentName + ": OggleBooble";

            }
            else {
                if (headerInfo.ParentName != "root")
                    docTitle = headerInfo.FolderName + ": " + headerInfo.ParentName + ": OggleBooble";
                else
                    docTitle = headerInfo.FolderName + ": OggleBooble";
            }
        }
    }
    if (headerInfo.FolderType == "index") {
        switch (headerInfo.RootFolder) {
            case "boobs":
                docTitle = "OggleBooble: Home of the Big Naturals";
                break;
            case "playboy":
                docTitle = "OggleBooble: Every Playboy Centerfold";
                break;
            case "porn":
                docTitle = "OgglePorn: Shame on You";
                break;
        }
    }
    if (headerInfo.FolderType == "dashboard") {
        docTitle = "OggleBooble admin dashboard";
    }

    document.title = docTitle;
}

function changeFavoriteIcon() {
    const divSiteLogo = ele("divSiteLogo");
    let siteLogo = 'img/redBalloon.png';
    let logoIco = 'img/redBalloon.ico';
    if (document.location.hostname == "beta.ogglebooble.com") {
        siteLogo = 'https://beta.ogglebooble.com/img/betaBalloon.png';
        logoIco = 'https://beta.ogglebooble.com/img/beta01.ico';
    }
    if (headerInfo.FolderName == "index")
        switch (headerInfo.RootFolder) {
            case "playboy":
                siteLogo = 'img/playboyBalloon.png';
                logoIco = 'img/playboyBalloon.ico';
                break;
            case "boobs":
                break;
            case "porn":
                siteLogo = 'img/csLips02.png';
                logoIco = 'img/csLips02.png';
                break;
                break;
            case "admin":
            case "reports":
                siteLogo = 'https://admin.ogglebooble.com/img/adminPanel01.png';
                logoIco = 'https://admin.ogglebooble.com/img/OIP.png';
                break;
            default:
                if (headerInfo.VisitorId == adminVisitorId) {
                    alert("FavoriteIcon " + rootFolder + " not handled");
                }
                console.log("FavoriteIcon " + rootFolder + " not handled");
        }
    else {
        switch (headerInfo.RootFolder) {
            case "archive":
            case "boobs":
            case "root":
            case "celebrity":
            case "gent":
                break;
            case "playboy":
            case "centerfold":
            case "magazine":
            case "lingerie":
            case "plus":
            case "international":
            case "muses":
            case "college":
            case "cybergirl":
            case "cybergirls":
            case "adult":
                siteLogo = 'img/playboyBalloon.png';
                logoIco = 'img/playboyBalloon.ico';
                break;
            case 3909:
            case "porn":
            case "sluts":
                siteLogo = 'img/csLips02.png';
                logoIco = 'img/csLips02.png';
                break;
            case "soft":
                siteLogo = 'img/redwoman.png';
                logoIco = 'img/csLips02.png';
                break;
            case "oggleblog":
                siteLogo = 'img/scribe03.png';
                logoIco = 'img/scribe03.png';
                break;
            case "bond":
                siteLogo = 'img/boogle007.png';
                logoIco = 'img/boogle007.png';
                break;
            case "cRhodes":
                siteLogo = 'https://curtisrhodes.com/img/CRHODES.png';
                logoIco = 'https://curtisrhodes.com/img/CRHODES.ico';
                break;
            case "intelDesign":
                siteLogo = 'https://inteldesign.curtisrhodes.com/img/intel01.jpg';
                logoIco = 'https://inteldesign.curtisrhodes.com/img/intel01.jpg';
                break;
            case "getaJob":
                siteLogo = 'https://curtisrhodes.com/img/GetaJob.png';
                break;
            case "loading":
                siteLogo = "img/loader.gif"; link.type = 'image/gif';
                break;
            case "brucheum":
                siteLogo = 'https://brucheum.com/img/house.png';
                logoIco = 'https://brucheum.com/img/Brucheum.ico';
                break;
        }
    }

    divSiteLogo.src = siteLogo;
    ele("favIcon").href = logoIco;
}

function getFolderName() {
    let folderName = headerInfo.FolderName;
    if (headerInfo.FolderType == "singleChild") {
        if (headerInfo.ParentType == "singleParent")
            folderName = headerInfo.ParentName;
        else
            folderName = headerInfo.gpName;
    }
    //else {
    //    if (headerInfo.FolderType == "multiFolder") {
    //        if (headerInfo.ParentType == "singleParent")
    //            folderName = headerInfo.ParentName;
    //        else
    //            folderName = headerInfo.gpName;
    //    }
    //}
    return folderName;
}

function xxgetRandomGalleries() {


}

function headerMenuClick(folderId) {
    if (folderId == 846)
        sendOggleMail("Gent Archive Selected", "at last");

    logOggleEvent("HMC", currentFolderId, folderId);
    location.href = "album.html?folder=" + folderId;
}

function siteLogoClick() {
    let hostName = document.location.hostname;
    switch (headerInfo.RootFolder) {
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
            window.location.href = "https://" + hostName + "/index.html?spa=playboy";
            break;
        case "porn":
        case "sluts":
            if (headerInfo.FolderName == "index")
                window.location.href = "https://" + hostName + "/album.html?folder=242";
            else
                window.location.href = "https://" + hostName + "/index.html?spa=porn";
            break;
        default:
            window.location.href = "https://" + hostName;
        //archive	22, 142
        //bond	181
        //boobs	319
        //celebrity	112
        //gent	626
        //    soft	282
        //    special	6

    }

}

function setBannerLink(labelText, href) {
    //let hrefPath = document.location.hostname;
    return `<div class='headerBannerButton'>
                <div class='clickable' onclick="logOggleEvent('BCL',999,'` + labelText + `'); window.open('` + href + `')" >` + labelText + `</div>
            </div>`;
}

function setPageColors() {
    const carouselContainer = ele("carouselContainer");
    const oggleHeader = ele("oggleHeader");
    //    FolderName: "index",
    //    ParentName: "root",
    //    RootFolder: pageContext,
    //    FolderType: "index"
    if (headerInfo.FolderType == "index") {
        switch (headerInfo.RootFolder) {
            case "playboy":
                // playboyColors();
                oggleHeader.style.backgroundColor = "#80aaff";
                oggleHeader.style.color = "#000";
                document.body.style.backgroundColor = "#6b5b95";
                let sectionLabels = document.getElementsByClassName("sectionLabel");
                Array.from(sectionLabels).forEach(secLabel => secLabel.style.color = "#fff");
                let aboveImageContainerDivs = document.getElementsByClassName("aboveImageContainerDiv");
                Array.from(aboveImageContainerDivs).forEach(aboveImageContainerDiv => aboveImageContainerDiv.style.color = "#fff");
                break;
            case "porn":
                document.body.style.backgroundColor = "darksalmon";
                document.body.style.color = "#fff";
                carouselContainer.style.backgroundColor = "darksalmon";
                oggleHeader.style.backgroundColor = "darkorange";
                oggleHeader.style.color = "#f2e289";
                oggleHeader.style.color = "#000";
                break;
            case "boobs":
                document.body.style.backgroundColor = "#0088cc";
                break;
            default:
                if (sessionStorage.VisitorId == adminVisitorId) {
                    alert("setPageColor pageContext " + pageContext + " not handled");
                }
                console.log("setPageColor pageContext " + pageContext + " not handled");
        }
    }
    else {
        //put this is a config file
        const oggleHeader = ele("oggleHeader");
        // ---- reset arrows to black  -----------------------
        //ele("albumBottomfileCount").style.color = "#000";
        //ele("albumTopRow").style.color = "#000";
        //ele("folderUpButton").src = 'img/up.png';
        //ele("backButton").src = 'img/back.png';
        //ele("folderCommentButton").src = 'img/comment.png';
        //ele("nextButton").src = 'img/next.png';
        switch (headerInfo.RootFolder) {
            case "root":
                oggleHeader.style.backgroundColor = "#909";
                break;
            case "brucheum":
            case "oggleDashboard":
                break;
            case "boobs":
            case "archive":
                break;
            case "centerfold":
            case "playboy":
            case "magazine":
                oggleHeader.style.backgroundColor = "#818782";
                oggleHeader.style.color = "#E8E8E8";
                document.body.style.backgroundColor = "#222";
                document.body.style.color = "#000";
                // go with white arrows
                document.body.style.color = "#fff";
                ele("albumBottomfileCount").style.color = "#fff";
                ele("folderUpButton").src = 'img/upWhite.png';
                ele("backButton").src = 'img/backWhite.png';
                ele("folderCommentButton").src = 'img/commentWhite.png';
                ele("nextButton").src = 'img/nextWhite.png';
                break;
            case "plus":
                oggleHeader.style.backgroundColor = "#74bac3";
                oggleHeader.style.color = "#000";
                document.body.style.backgroundColor = "#c1bad1";
                document.body.style.color = "#000";
                break;
            case "college":
                oggleHeader.style.backgroundColor = "#ff66a3"; // pink
                oggleHeader.style.color = "#000";
                document.body.style.backgroundColor = "#ffe6ff";
                document.body.style.color = "#000";
                break;
            case "muses":
                oggleHeader.style.backgroundColor = "#d2ff4d";
                oggleHeader.style.color = "#004d00";
                document.body.style.backgroundColor = "#269900";
                document.body.style.color = "#fff";
                break;
            case "international":
                oggleHeader.style.backgroundColor = "#d2ff4d";    //  yellow
                oggleHeader.style.color = "#004d00";
                document.body.style.backgroundColor = "#d2ff4d";
                document.body.style.color = "#fff";
                break;
            case "cybergirl":
            case "cybergirls":
                document.body.style.backgroundColor = "#E18C2F"; //  orange
                oggleHeader.style.backgroundColor = "#F0B76A";
                break;
            case "lingerie":
            case "adult":
                document.body.style.backgroundColor = "#990099"; //  purple
                document.body.style.color = "#fff";
                oggleHeader.style.backgroundColor = "#d279d2";
                break;
            case "bond":
            case "celebrity":
                document.body.style.backgroundColor = "#000";
                document.body.style.color = "#fff";
                oggleHeader.style.backgroundColor = "#ffcc66";
                break;
            case 3909:
            case "porn":
            case "eporn":
                document.body.style.backgroundColor = "darksalmon";
                document.body.style.color = "#fff";
                oggleHeader.style.backgroundColor = "darkorange";
                oggleHeader.style.color = "#000"; // "#f2e289";
                break;
            case "sluts":
                oggleHeader.style.backgroundColor = "deeppink";
                document.body.style.backgroundColor = "palevioletred";
                break;
            case "soft":
                oggleHeader.style.backgroundColor = "deeppink";
                document.body.style.backgroundColor = "darksalmon";
                document.body.style.color = "#fff";
                break;
            case "gent":
                oggleHeader.style.backgroundColor = "#52527a";
                document.body.style.backgroundColor = "#8585ad";
                document.body.style.color = "#fff";
                break;
            case "intelDesign":
                oggleHeader.style.backgroundColor = "#74bac3";
                oggleHeader.style.color = "wheat";
                break;
            //default:
            //    logOggleError("SBT", currentFolderId, "rootFolder " + rootFolder + " not handled", "set Album Page Color");
        }
    }
}

function resizeHeader() {

    if (!ready(ele("hdrLeftSection"))) {
        setTimeout(() => {
            if (ready(ele("hdrLeftSection"))) {
                resizeHeader()
            }
        }, 650);
    } else {
        const hdrLeftSection = ele("hdrLeftSection");
        const hdrRightSection = ele("hdrRightSection");
        const logoIcons = ele("logoIcons");
        var hdrLeftSideWidth = hdrLeftSection.clientWidth;
        var hdrRightSideWidth = hdrRightSection.clientWidth + logoIcons.clientWidth;
        let calcMiddle = document.body.clientWidth - hdrLeftSideWidth - hdrRightSideWidth;
        ele("hdrMiddleSection").style.width = calcMiddle + "px";
    }
    /*
    this has to be done with media queries in css
    try {
        // resize header middle row
        let siteLogoW = ele("siteLogo").clientWidth;
        let searchBoxW = ele("searchBox").clientWidth;
        let midColW = (window.innerWidth - siteLogoW - searchBoxW - 78);
        ele("siteLogo").width;
        ele("headerMiddleSection").style.width = (midColW + "px");
    } catch (e) {
        //if (headerInfo.VisitorId == adminVisitorId) {
        //    alert("CATCH resize header: " + e);
        //}
        //else
        logCommonError("CAT", 0, e, "resize header");
    }
    */
}
