
function myAlertBox() {
    let messghtml = "<div>";



    document.append()
}

function endlessCarouselInfo() {
    let messghtml = "<div>";
    alert("endlessCarouselInfo");
}
function mostPopularAlbums() {
    alert("mostPopularAlbums");
}
function helpMe() {
    $('body').append(`<div id='helpMeDialogBox' class='floatingDialogContainer displayHidden'>
        <div class='floatingDialogHeader'>
            <div class='floatingDialogTitle'>Notice of Changes to OggleBooble</div>
            <div class='dialogCloseButton'>
                <img src='https://curtisrhodes.com/common/img/close.png' 
                onclick="$('#helpMeDialogBox').hide()" />
            </div>
        </div>
        <div class='announcementBorder5'>
            <div class='mH1'>Help Me Help You Help Me</div>
            <div class='mnText3'> 
                <ul>
                    <li>
                        Nobody sends me any feedback. Number one is to send me some <a href='javascript:showOggleFeedbackDialog()'>feedback</a> 
                        Suggent a model. Offer ideas how to improve this site. Let me know about any problems.
                        <br/>
                        This site is the hobby project of a retired database programmer. No third party tools are used except for the wysywig editor.
                        The endless carousel I wrote is worthy of Git article. If you are a web developer and would like to use some of the features you see on this site
                        such as the incirmental dir tree, please let me know.
                     </li>
                    <li>
                        Rename Albums. This website is built using a machine that saves new folder in a database. 
                        The folders are automatically named, for example, Suzie Sun_001, Suzie Sun_002, Suzie Sun_003, etc.
                        You are welcome to give these folders better names.
                     </li>
                    <li>
                        Bookmark My site. The number one way the Google search engine ranks sites other than unfair pratices is to count the number of other sites that link 
                        to your site. Please use this advanced technique.
                            <aside>
                                In order to get the page names I want on Boobapedia I create a static web page for every 
                            </aside>
                     </li>
                </ul>
            </div>
                    <li>Sort Albums</li>
                    <li>Take Surveys</li>
                    <li>bookmark and link</li>
                    <li>Code Review</li>
        </div>
    </div>`);

    $('#helpMeDialogBox').css({ "width": "945px", "top": "35px", "left": "387px" }).draggable().show();

    if (typeof pause === 'function') pause();
    document.documentElement.scrollTop = 0;

    if (sessionStorage.VisitorId != adminVisitorId)
        sendOggleMail("Help Me", "called from: " + calledFrom);
}

function oggleIsFree(calledFrom) {
    $('body').append(`<div id='oggleIsFreeDialogBox' class='floatingDialogContainer displayHidden'>
        <div class='floatingDialogHeader'>
            <div class='floatingDialogTitle'>Notice of Changes to OggleBooble</div>
            <div class='dialogCloseButton'>
                <img src='https://curtisrhodes.com/common/img/close.png' 
                onclick="$('#oggleIsFreeDialogBox').hide()" />
            </div>
        </div>
        <div class='announcementBorder5'>
            <div class='mH1'>OggleBooble Is Free</div>
            <div class='mnText3'> 
                There is too much free porn on the web. I did not produce any of this content, take any of the million pictures.<br>
                Still. All the work I done on this site does add value. Here you have the largest difinative collections of the most
                famous all natural biggest breasted models of all time.<br>
                Most naked lady web sites have only 15 or so images per page. OggleBooble averages around 44 images per page. 
                OggleBooble provides the "endless carousel" avaialble nowhere else. You just let it run on your largest screen for hours 
                and watch a never repeating show of beautiful naked big breasted all natuals.
                ...
            </div>
            <div class='mH1'>But</div>
            <div class='mnText3'> 
                OggleBooble is soon going to initiate <a href="#">New Rules</a> to have users do something more than simply 
                pay money. Contribute to this site. Any efforts made to help improve this site will be rewarded. 
                Certain actions will allow you to <a href="#">earn points</a>. Examples of how you can earn points include:
                <ul>
                    <li><a href='javascript:showOggleFeedbackDialog()'>Give feedback</a>. Let me know about any problems. Offer suggestions.</li>
                    <li><a href='javascript:showOggleFeedbackDialog()'>Label Folders</a>. Come up with clever titles for pages and win awards.</li>
                    <li>Sort Albums</li>
                    <li>Take Surveys</li>
                    <li>bookmark and link</li>
                    <li>Code Review</li>
                </ul>
            </div>
        </div>
    </div>`);
    $('#oggleIsFreeDialogBox').css({ "width": "945px", "top": "35px", "left": "387px" }).draggable().show();

    if (typeof pause === 'function') pause();
    document.documentElement.scrollTop = 0;

    //sendOggleMail("OggleBooble Is Free", "called from: " + calledFrom);
    logOggleEvent("OIF", calledFrom);
}

function extraFeatures() {
    //nariveid monument
    //the seripium
    //the soma
    //alabaster tomb

    alert("extra features");
}

