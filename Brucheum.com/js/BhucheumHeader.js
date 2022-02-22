function resetSpaPage() {
    $('#leftColumn').html("");
    $('#tanBlue').hide();
    $("#headerSubTitle").html("");
    $('body').css("background-color", "#eeddbb");
    changeFavoriteIcon("default");
    stopCarousel();
    $("#optionNotLoggedIn").show();
    $("#optionLoggedIn").hide();    
}

function setIndexPage() {
    loadHeader("Brucheum");
    $('#leftColumn').html(BrucheumMenu());
    $('#middleColumn').html('<div id="bruchCaveImage" class="caveImage">');
    displayFooter("welcome");
}

function headerHtml() {
    return "<div class='siteLogoContainer'>" +
        "       <img id='divSiteLogo' class='bannerImage' title='home' src='img/house.gif' onclick='javascript:setIndexPage()' />" +
        "   </div>\n" +
        "   <div class='headerBodyContainer'>\n" +
        "       <div class='headerTopRow'>\n" +
        "           <div class='headerTitle' id='bannerTitle'>Curtis Rhodes.com</div>\n" +
        "           <div class='headerSubTitle' id='headerSubTitle'></div>\n" +
        "           <div id='topRowRightContainer'></div>" +
        //"           <div id='searchBox' class='searchBox'>\n" +
        //"               <span id='notUserName' title='Esc clears search.'>search</span>" +
        //"                   <input class='searchBoxText' id='txtSearch' onkeydown='searchKeyDown(event)'></input>" +
        //"               <div id='searchResultsDiv' class='searchResultsDropdown'></div>\n" +
        //"           </div>\n" +
        "       </div>\n" +
        "       <div id='headerBottomRow'>\n" +
        //"           <div class='bottomRowSection1'>\n" +
        "               <div id='headerMessage' class='bottomLeftHeaderArea'></div>\n" +
        "               <div id='breadcrumbContainer' class='breadCrumbArea'></div>\n" +
        "               <div id='badgesContainer' class='badgesSection'></div>\n" +
        "               <div id='hdrBtmRowSec3' class='hdrBtmRowOverflow'></div>\n" +
        //"           </div>\n" +
        "           <div id='divLoginArea' class='loginArea'>\n" +
        "               <div id='optionLoggedIn' class='displayHidden'>\n" +
        "                   <div class='hoverTab' title='modify profile'><a href='javascript:showUserProfileDialog()'>Hello <span id='spnUserName'></span></a></div>\n" +
        "                   <div class='hoverTab'><a href='javascript:onLogoutClick()'>Log Out</a></div>\n" +
        "               </div>\n" +
        "               <div id='optionNotLoggedIn' class='displayHidden'>\n" +
        "                   <div id='btnLayoutRegister' class='hoverTab'><a href='javascript:showRegisterDialog(\"true\")'>Register</a></div>\n" +
        "                   <div id='btnLayoutLogin' class='hoverTab'><a href='javascript:showLoginDialog()'>Log In</a></div>\n" +
        "               </div>\n" +
        "           </div>\n" +
        "       </div>\n" +
        "   </div>\n" +

        "<div id='indexCatTreeContainer' class='dialogContainer'></div>\n" +

        "<div id='customMessageContainer' class='dialogContainer'>\n" +
        "    <div id='customMessage' class='customMessageContainer' ></div>\n" +
        "</div>\n" +

        "<div class='centeringOuterShell'>\n" +
        "   <div class='centeringInnerShell'>\n" +
        "      <div id='centeredDialogContainer' class='dialogContainer'>\n" +
        "           <div id='centeredDialogHeader'class='dialogHeader'>" +
        "               <div id='centeredDialogTitle' class='dialogTitle'></div>" +
        "               <div id='centeredDialogCloseButton' class='dialogCloseButton'>" +
        "               <img src='/img/close.png' onclick='$(\"#centeredDialogContainer\").hide()'/></div>\n" +
        "           </div>\n" +
        "           <div id='centeredDialogContents' class='dialogContents'></div>\n" +
        "      </div>\n" +
        "   </div>\n" +
        "</div>\n" +

        "<div id='dirTreeContainer' class='dirTreeImageContainer floatingDirTreeImage'>\n" +
        "   <img class='dirTreeImage'/>\n" +
        "</div>\n" +

        "<div id='vailShell' class='modalVail'></div>\n" +

        "<div id='contextMenuContainer' class='ogContextMenu' onmouseleave='$(this).fadeOut()'>" +
        "   <div id='contextMenuContent'></div>\n" +
        "</div>\n";
}

function loadHeader(pageName) {

    $('header').html(headerHtml());

    switch (pageName) {
        case "Brucheum":

            $("#bannerTitle").html("The Brucheum");

            document.title = "welcome : Brucheum";
            //$('#leftColumn').html(tanBlueMenuSnippet);
            $("#breadcrumbContainer").html(`
                <div class='hoverTab'><a href='javascript:displayArticleList(0)'>Latest Articles</a></div>\n
                <div class='hoverTab'><a href='books.html'>Books</a></div>\n
                <div class='hoverTab'><a href='javascript:displayCustomPage(\"Apps\")'>Apps</a></div>\n
                <div class='hoverTab'><a href='javascript:displayCustomPage(\"IntelDesign\")'>Intelligent Design</a></div>\n
                <div class='hoverTab'><a href='javascript:displayCustomPage(\"GetaGig\")'>Get a Gig</a></div>\n`
            );
            //loadAndStartCarousel();
            break;
        case "Books":
            document.title = "books : CurtisRhodes.com";
            $("#headerSubTitle").html("My Books");
            $("#breadcrumbContainer").html(`
                <div class= 'menuTab floatLeft' onclick = 'displayCustomPage(\"Carosuel\")' > Articles</div >\n
                <div class= 'menuTab floatLeft' onclick = 'displayCustomPage(\"Apps\")' > Apps</div >\n
                <div class= 'menuTab floatLeft' onclick = 'displayCustomPage(\"IntelDesign\")' > Intelligent Design</div >\n
                <div class= 'menuTab floatLeft' onclick = 'displayCustomPage(\"GetaGig\")' > Get a Gig</div >\n`
            );
            break;
        case "Apps":
            document.title = "apps : CurtisRhodes.com";
            $('#middleColumn').html(`<div class='landingPageHeader'>Apps</div>`);
            break;
        case "IntelDesign":
            document.title = "Intelligent Design Software";
            changeFavoriteIcon("intelDesign");
            $('#divSiteLogo').attr("src", "img/intel01.jpg");
            $("#bannerTitle").html("Intelligent Design Software");
            $("#breadcrumbContainer").html(`
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Carosuel\")'>The Brucheum</div>\n
                <div class='menuTab floatLeft' onclick='displayIntelBlogPost(3)'>About Me</div>\n
                <div class='menuTab floatLeft' onclick='displayIntelArticles(0)'>Articles</div>\n
                <div class='menuTab floatLeft' onclick='displayMyResume()'>My Resume</div>\n
                <div class='menuTab floatLeft' onclick='displayIntelArticles(2)'>Programming for Girls</div>\n
                <div class='menuTab floatLeft' onclick='displaySkillsCloud()'>My Skills</div>`
            );
            displayIntelDesignPage();
            break;
        case "GetaGig":
            $('#divSiteLogo').attr("src", "img/GetaJob.png")
            document.title = "CurtisRhodes.com";
            changeFavoriteIcon("getaJob");
            $("#breadcrumbContainer").html(`
                <div class='menuTab floatLeft' onclick='displayNewJobSearch()'>New Job Search</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Carosuel\")'>Articles</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Apps\")'>Apps</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Intelligent Design\")'>Intelligent Design</div>\n`
            );
            displayGetaGig();
            break;
        default:
    }
}
