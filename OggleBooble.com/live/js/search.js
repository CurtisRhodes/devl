let searchActive = false;

/*
    <div class='searchBoxContainer'>
        <span>search</span>
        <input type="text" id='txtSearch' class='searchBoxText' title='search' onfocus='activateSearch()' />
        <div id='searchResultsDiv' class='searchResultsContainer'>
            <ul id='searchResultsList' class='oggleSearchList'></ul>
        </div>        
    </div>`);
            document.addEventListener('keydown', captureKeydownEvent);

*/

function activateSearch() {
    if (!searchActive) {
        searchActive = true;               
        if (sessionStorage.visititorId == adminVisitorId) {
            ele("headerTopRowCol1").innerHTML = "search active";
        }
        ele("txtSearch").value = "";
        document.addEventListener('keydown', handleSearchKeyPress);

        document.addEventListener('keyup', () => {
            //const txtSearch = ele("txtSearch");
            //event.key
            //if (sessionStorage.visititorId == adminVisitorId) {
            //    ele("headerTopRowCol2").innerHTML = txtSearch.value + " len: " + txtSearch.value.length;
            //}
            // ele("headerTopRowCol2").innerHTML = "focus= " + document.activeElement.id;
            // const txtSearch = ele("txtSearch");
            // var newLen = txtSearch.value.length;
            // ele("headerTopRowCol2").innerHTML = txtSearch.value + " len: " + newLen;
            if (ele("txtSearch").value.length > 2) {
                performSearch();
            }
        });
    }
}

function clearSearch() {
    if (ele("txtSearch").value === "") { // double esc
        searchActive = false;
        removeContents(ele("headerTopRowCol1"));
        removeContents(ele("headerTopRowCol2"));
        document.removeEventListener('keydown', handleSearchKeyPress);
        ele("txtSearch").blur();
        removeContents(ele("searchResultsList"));
        hideElement(ele("searchResultsDiv"));
    }
    else {
        ele("txtSearch").value = "";
        hideElement(ele("searchResultsDiv"));
    }
}

function handleSearchKeyPress(event) {
    if (event.key === 'Escape') {
        clearSearch();
        return;
    }
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (document.activeElement.id == "txtSearch") {
            let firstli = ele("searchResultsList").firstElementChild;            
            firstli.focus();
        }
        else {            
            if (document.activeElement.nextElementSibling != null) {
                document.activeElement.nextElementSibling.focus();
                // ele("headerTopRowCol2").innerHTML = "focus= " + document.activeElement.id;
                //document.activeElement.scrollIntoView(true);
            }
        }
        event.Handled = true;
    }
    if (event.key === 'ArrowUp') {
        if (document.activeElement.id != "txtSearch") {
            let selectedLi = document.activeElement;
            if (selectedLi.previousElementSibling != null) {
                selectedLi.previousElementSibling.focus();
                //selectedLi.scrollIntoView(true);
            }
        }
        return;
    }

    if (event.key === 'Enter') {
        if (document.activeElement.id == "txtSearch") {
            let firstli = ele("searchResultsList").firstElementChild;
            let selectedItem = firstli.id;
            jumpToSelected(selectedItem);
        }
        else {
            let selectedLi = document.activeElement;
            jumpToSelected(selectedLi.id);
        }
    }
}

function performSearch() {
    const searchResultsList = ele("searchResultsList");
    let searchObj = {};
    let searchResults = "";
    let spanColor = "black";
    // "where (f.FolderName like '".$srch."%') and (f.FolderType not in ('multiChild','singleChild','stepParent'))".
    getDataFromServer("php/oggleSearch.php?searchString=" + ele("txtSearch").value, searchObj);
    let searchIntrvl = setInterval(function () {
        if (ready(searchObj.data)) {
            clearInterval(searchIntrvl);
            showElement(ele("searchResultsDiv"));
            if (searchObj.data == "[]") {
                replaceHtml(searchResultsList, "<li>no results found</li>")
            }
            else {
                searchResults = JSON.parse(searchObj.data);
                removeContents(searchResultsList);
                searchResults.forEach(searchResult => {
                    let displayName = searchResult.ParentName;
                    if (searchResult.RootFolder != 'archive') {
                        displayName = searchResult.RootFolder + " " + searchResult.ParentName;
                    }
                    // set colors
                    switch (searchResult.RootFolder) {
                        case "eporn":
                            spanColor = "#669900";
                            displayName = "endless cocksuckers";
                            break;
                        case "muses":
                        case "plus":
                        case "cybergirls":
                        case "magazine":
                        case "centerfold": spanColor = "#e600e6"; break;
                        case "adult": spanColor = "#007acc"; break;
                        case "international": spanColor = "#ffff00"; break;
                        case "archive": spanColor = "#0055ff"; break;
                        case "soft": spanColor = "#b30000"; break;
                        case "porn":
                        case "sluts": spanColor = "red"; break;
                        default: spanColor = "pink"; break;
                    }

                    searchResultsList.insertAdjacentHTML("beforeend", "<li id = " + searchResult.Id + " class='searchResultsDropdown' " +
                        " tabIndex='-1' onclick='jumpToSelected(" + searchResult.Id + ")'>" +
                        searchResult.FolderName + " (<span style='color:" + spanColor + "'>" + displayName + ")</span>");
                });

                // Select all elements with the specified class
                //const elements = document.querySelectorAll('.your-class-name');
                //// Loop through each element and add the event listener
                //elements.forEach(element => {
                //    element.addEventListener('click', () => {
                //        console.log('Element clicked!');
                //    });
                //});

            }
            showElement(searchResultsDiv);
        }
    }, 28);
}

function jumpToSelected(folderId) {
    if (isNullorUndefined(currentFolderId)) currentFolderId = -88;
    logOggleEvent("SRC", "selectedFolderId: " + folderId + "txtSearch.value: " + ele("txtSearch").value);
    ele("txtSearch").value = "";
    clearSearch();
    window.open("album.html?folder=" + folderId, "_blank");  // open in new tab
}

