
function display2aT() {
    $('#middleColumn').html(`<div class='landingPageHeader'>2aT</div>`);
}

function displayOldWebsite() {
    $('#middleColumn').html(`<div class='landingPageHeader'>Brucheum</div>`);
}

function displayFlitter() {
    $('#middleColumn').html(`<div class='landingPageHeader'>Flitte</div>`);
}

function CurtisRhodesMenu() {
    return `
        <div id="tanBlue" class="vMenu">
            <div id="itemIntelDesgn" class="tabvMenuItem" onclick="window.location.href='index.html?spa=IntelDesign'">
                <img src="Images/TanBlue/IntelligentDesignTan.png" onmouseover="this.src='Images/TanBlue/IntelligentDesignBlue.png'" onmouseout="this.src='Images/TanBlue/IntelligentDesignTan.png'" />
            </div>
            <div id="itemBlondJew" class="tabvMenuItem" onclick="showBook(1)">
                <img src="Images/TanBlue/BlondJewTan.png" onmouseover="this.src='Images/TanBlue/BlondJewBlue.png'" onmouseout="this.src='Images/TanBlue/BlondJewTan.png'" />
            </div>
            <div id="itemBrucheum" class="tabvMenuItem" onclick="displayOldWebsite()">
                <img src="Images/TanBlue/BrucheumTan.png" onmouseover="this.src='Images/TanBlue/BrucheumBlue.png'" onmouseout="this.src='Images/TanBlue/BrucheumTan.png'" />
            </div>
            <div class="tabvMenuItem" onclick="displayFlitter()">
                <img src="Images/TanBlue/FlitterTan.png" onmouseover="this.src='Images/TanBlue/FlitterBlue.png'" onmouseout="this.src='Images/TanBlue/FlitterTan.png'" />
            </div>
            <div class="tabvMenuItem" onclick="window.location.href='index.html?spa=GetaGig'">
                <img src="Images/TanBlue/GetaJobTan.png" onmouseover="this.src='Images/TanBlue/GetaJobBlue.png'" onmouseout="this.src='Images/TanBlue/GetaJobTan.png'" />
            </div>
            <div class="tabvMenuItem" onclick="window.location.href='showbook(2)">
                <img src="Images/TanBlue/TimeSquaredTan.png" onmouseover="this.src='Images/TanBlue/TimeSquaredBlue.png'" onmouseout="this.src='Images/TanBlue/TimeSquaredTan.png'" />
            </div>
            <div id="item2aT" class="tabvMenuItem" onclick="display2aT()">
                <img src="Images/TanBlue/ToATeeTan.png" onmouseover="this.src='Images/TanBlue/ToATeeBlue.png'" onmouseout="this.src='Images/TanBlue/ToATeeTan.png'" />
            </div>
        </div>`;
}

function BrucheumMenu() {
    return `
        <div id="tanBlue" class="vMenu">
            <div id="itemIntelDesgn" class="tabvMenuItem" onclick="window.location.href='index.html?spa=IntelDesign'">
                <img src="Images/TanBlue/IntelligentDesignTan.png" onmouseover="this.src='Images/TanBlue/IntelligentDesignBlue.png'" onmouseout="this.src='Images/TanBlue/IntelligentDesignTan.png'" />
            </div>
            <div id="itemBlondJew" class="tabvMenuItem" onclick="showBook(1)">
                <img src="Images/TanBlue/BlondJewTan.png" onmouseover="this.src='Images/TanBlue/BlondJewBlue.png'" onmouseout="this.src='Images/TanBlue/BlondJewTan.png'" />
            </div>
            <div id="itemBrucheum" class="tabvMenuItem" onclick="displayOldWebsite()">
                <img src="Images/TanBlue/OggleBoobleTan.png" onmouseover="this.src='Images/TanBlue/OggleBoobleBlue.png'" onmouseout="this.src='Images/TanBlue/OggleBoobleTan.png'" />
            </div>
            <div class="tabvMenuItem" onclick="displayFlitter()">
                <img src="Images/TanBlue/FlitterTan.png" onmouseover="this.src='Images/TanBlue/FlitterBlue.png'" onmouseout="this.src='Images/TanBlue/FlitterTan.png'" />
            </div>
            <div class="tabvMenuItem" onclick="window.location.href='index.html?spa=GetaGig'">
                <img src="Images/TanBlue/GetaJobTan.png" onmouseover="this.src='Images/TanBlue/GetaJobBlue.png'" onmouseout="this.src='Images/TanBlue/GetaJobTan.png'" />
            </div>
            <div class="tabvMenuItem" onclick="window.location.href='showbook(2)">
                <img src="Images/TanBlue/TimeSquaredTan.png" onmouseover="this.src='Images/TanBlue/TimeSquaredBlue.png'" onmouseout="this.src='Images/TanBlue/TimeSquaredTan.png'" />
            </div>
            <div id="item2aT" class="tabvMenuItem" onclick="display2aT()">
                <img src="Images/TanBlue/ToATeeTan.png" onmouseover="this.src='Images/TanBlue/ToATeeBlue.png'" onmouseout="this.src='Images/TanBlue/ToATeeTan.png'" />
            </div>
        </div>`;
}

///ToDo
// fill in snippets.