// const settingsImgRepo = 'https: //ogglebooble.com/danni/';

let currentBlogObject = {
    BlogId: 0,
    CommentType: '',
    CommentTitle: '',
    ImgSrc: '',
    Text: '',
    Posted: '',
    Summary: '',
};

function startOggleBlog() {
    loadDropDowns();
    currentBlogObject.CommentType = 'PBE';
    displayBlogList();

    $('.blogSection').hide();
    $('#blogListArea').show();

    $('#leftColumnList').hide();
    $('#leftColumnNew').show();
    $('#leftColumnView').hide();
    $('#leftColumnEdit').hide();
}

function showBlogListClick() {
    $('.blogSection').hide();
    $('#blogListArea').show();
    displayBlogList();
    //alert("showBlogListClick: " + currentBlogObject.CommentType);
}

function displayBlogList() {
    try {

        // <div id='blogCategoryListArea' class='blogItemContainer'></div>


        $.ajax({
            type: "GET",
            url: "php/getBlogItems.php?commentType=" + currentBlogObject.CommentType,
            success: function (data) {
                let jData = JSON.parse(data);
                $('#blogArticleJogArea').html("");
                if (jData.length == 0)
                    alert("no entries found for commentType: " + currentBlogObject.CommentType);
                else {
                    $.each(jData, function (idx, blogComment) {
                        $('#blogArticleJogArea').append(`
                            <div class="blogArticleItem">
                                <div><img class="articleJogImage" src="` + blogComment.ImageLink + `"/></div>
                                <div>
                                    <div class="blogListCommentTitle">` + blogComment.CommentTitle + `</div>
                                    <div class="blogListCommentSummary">` + blogComment.CommentText.substr(0,100) + `</div>
                                </div>
                                <div class="blogListEditButton" onclick="displayEditArea('`+ blogComment.Id + `')">edit</div>
                            </div>`);
                    });
                    resizeBlogPage();
                }
            },
            error: function (jqXHR) {
                $('#albumPageLoadingGif').hide();
                logBlogError("XHR", -245223911, getXHRErrorDetails(jqXHR), "display blog list");
            }
        });
    } catch (e) {
        logBlogError("CAT", -245223911, e, "display blog list");
    }
}

function showAddNew() {

}

function displayEditArea(blogId) {
    try {
        $('.blogSection').hide();
        $('#blogEditArea').show();

        $('#leftColumnList').show();
        $('#leftColumnNew').show();
        $('#leftColumnView').hide();
        //$('#leftColumnEdit').hide();

        $('#btnAddEdit').html("Update");
        $('#albumPageLoadingGif').show();
        $.ajax({
            type: "GET",
            url: "php/wysiwygFetch.php?query=select * from BlogComment where Id='" + blogId + "'",
            success: function (data) {
                $('#albumPageLoadingGif').hide();
                let blogComment = JSON.parse(data);

                $('#txtEntryTile').val(blogComment.CommentTitle);
                $('#txtPosted').val(blogComment.Posted);
                $('#summernoteBodyContainer').summernote('code', blogComment.CommentText);
                $('#imgBlogLink').attr("src", blogComment.ImageLink);
            },
            error: function (jqXHR) {
                logBlogError("XHR", -245223915, getXHRErrorDetails(jqXHR), "error blog list");
                $('#albumPageLoadingGif').hide();
            }
        });
    } catch (e) {
        logBlogError("CAT", -245223915, e, "error blog list");
    }

    //
    //$('#btnNewCancel').hide();
    //loadDropDown();
    //$('#blogCrudBox').css("width", $(window).width() * .66);
    //loadSingleBlogEntry(blogItemId, "edit");
}

function displayViewArea() {
    $('.blogSection').hide();
    $('#blogViewArea').show();
    $('#leftColumnNew').show();
    $('#leftColumnView').hide();
    $('#leftColumnEdit').hide();
    //loadSingleBlogEntry(blogItemId);
}

function displayNewEntryArea() {

    $('.blogSection').hide();
    $('#blogEditArea').show();
    $('#leftColumnNew').hide();
    $('#leftColumnList').show();
    $('#leftColumnView').show();
    $('#leftColumnEdit').hide();
    $("#txtPosted").datepicker({ defaultDate: new Date() });
    $('#summernoteSummaryContainer').summernote();
    $('#summernoteBodyContainer').summernote();


    $('#blogPageTitle').html("new blog entry");
    $('#btnAddEdit').html("Add");
    $("#imgBlogJog").attr("src", "https://common.ogglebooble.com/img/redballon.png");
    $("#txtEntryTile").val("I know you are but what am I");

}

function loadSingleBlogEntry(blogItemId, editMode) {
    try {
        $.ajax({
            type: "GET",
            url: "wysiwygFetch.php?query=" + "select * from BlogItem where BlogId=" + blogItemId,
            success: function (model) {
                if (model.Success === "ok") {
                    //currentBlogObject.ImageLink = model.ImageLink;
                    currentBlogObject.ImgSrc = model.ImgSrc;
                    currentBlogObject.ImgSrc = model.ImgSrc;
                    currentBlogObject.CommentType = model.CommentType;

                    if (editMode == "edit") {
                        $('#txtCommentTitle').val(model.CommentTitle);
                        $('#txtLink').val(model.Link);
                        $('#imgBlogLink').attr("src", model.ImgSrc);
                        $('#summernoteContainer').summernote('code', model.CommentText);
                        $('#txtPosted').val(model.Pdate); //.datepicker();
                        $('#txtLink').val(model.ImageLink);
                        $('#imgBlogLink').attr("src", model.ImgSrc);
                        $('#txtBlogId').val(currentBlogObject.Id);

                        $('#btnAddEdit').html("Update");
                        $('#btnNewCancel').html("Cancel");
                    }
                    else {
                        $('#blogPageTitle').html(model.CommentTitle);
                        $('#blogPageBody').html(model.CommentText);                        
                        $('#blogPageImage').attr("src", model.ImgSrc);
                    }
                }
                else {
                    logBlogError("AJX", 3911, model.Success, "load SingleBlogEntry");
                }
            },
            error: function (jqXHR) {
                $('#blogLoadingGif').hide();
                logBlogError("XHR", -24522331, e, "load SingleBlogEntry");
            }
        });
    } catch (e) {
        logBlogError("CAT", -24522331, e, "load SingleBlogEntry");
    }
}

function clearBlogGets() {
    // $('#txtommentTile').val($('#txtLnk').val("");
    $('#sumernoteContainer').summernote('cde', "");
    $('#imgBlogLink').attr("src", "");
    currentBlogObject.Id = "";
}

function addBlogEntry() {
    try {
        currentBlogObject.CommentTitle = $('#txtCommentTtle').val();
        currentBlogObject.VisitorId = getCookievalue("VisitorId", "save BlogEntry");
        currentBlogObject.Link = $('#txtLink').val();
        currentBlogObject.CommentText = $('#summernoteContainer').summernote('code');
        currentBlogObject.CommentType = $('#selBlogEditCommentType').val();

        if ($('#btnAddEdit').html() == "Add") {
            $.ajax({
                type: "POST",
                url: settingsArray.ApiServer + "api/OggleBlog/Insert",
                data: currentBlogObject,
                success: function (successModel) {
                    if (successModel.Success == "ok") {
                        displayStatusMessage("ok", "Entry Saved");
                        $('#btnAddEdit').html("Edit");
                        //$('#btnNewCancel').show();
                        currentBlogObject.Id = successModel.ReturnValue;
                    }
                    else
                        logError("AJX", 3911, successModel.Success, "saveBlogEntry");
                },
                error: function (jqXHR) {
                    logBlogError("XHR", -24522911, e, "add blog entry");
                }
            });
        }
    } catch (e) {
        logBlogError("CAT", -24522911, e, "add blog entry");
    }
}

function updateBlogEntry() {
    try {
        $.ajax({
            type: "PUT",
            url: settingsArray.ApiServer + "api/OggleBlog/Update",
            data: currentBlogObject,
            success: function (success) {
                if (success == "ok") {
                    displayStatusMessage("ok", "Entry Updated");
                } else logError("AJX", -24522661, success, "saveBlogEntry");
            },
            error: function (jqXHR) {
                logBlogError("XHR", -24522661, getXHRErrorDetails(jqXHR), "update blog entry");
            }
        });
    }
    catch (e) {
        logBlogError("CAT", -24522661, e, "update blog entry");
    }
}

function loadImage() {


    let srcFile = $('#txtLink').val();

    let savedFile = "https://ogglebooble.com/blog/blog%20images/" + srcFile.name;

    alert("srcFile: " + srcFile);

    //<?php
    //?>


    // get full html image name



    //ImageFile dbImageFile = db.ImageFiles.Where(i => i.Id == linkId).First();
    //imageAddress = db.CategoryFolders.Where(f => f.Id == dbImageFile.FolderId).First().FolderPath + "/" + dbImageFile.FileName;


//    $.ajax({
//        url: settingsArray.ApiServer + "api/OggleBlog/GetImageLink?linkId=" + $('#txtLink').val(),
//        success: function (imageAddress) {
//            $('#imgBlogLink').attr("src", imageAddress);
//            currentBlogObject.ImageLink = $('#txtLink').val();
//        },
//        error: function (jqXHR) {
//            logBlogError("XHR", -245223911, getXHRErrorDetails(jqXHR), "load image");
//        }
//    });
}

function btnNewCancelAction() {
    if ($('#btnNewCancel').html() == "Cancel") {
        showArticleJogs();
    }
}

function loadDropDowns() {
    $.ajax({
        type: "GET",
        url: "php/getRefs.php?refType=BLG",
        success: function (data) {
            let jData = JSON.parse(data);
            $('#blogListRefDropDown').html("");
            $('#selBlogEditCommentType').html("");
            $.each(jData, function (idx, obj) {
                if (obj.RefCode == currentBlogObject.CommentType)
                    $('#blogListRefDropDown').append("<option selected='selected' value='" + obj.RefCode + "'>" + obj.Description + "</option>");
                else
                    $('#blogListRefDropDown').append("<option value='" + obj.RefCode + "'>" + obj.Description + "</option>");

                $('#selBlogEditCommentType').append("<option value='" + obj.RefCode + "'>" + obj.Description + "</option>");
            });

            $('#blogListRefDropDown').change(function () {
                if ($('#blogListRefDropDown').val() != currentBlogObject.CommentType) {
                    currentBlogObject.CommentType = $('#blogListRefDropDown').val();
                    displayBlogList();
                }
            });
        },
        error: function (jqXHR) {
            logBlogError("XHR", -21544, getXHRErrorDetails(jqXHR), "blog load dropDowns");
            $('#blogLoadingGif').hide();
        }
    });
}

function logBlogError(errorCode, folderId, errorMessage, calledFrom) {
    try {
        let visitorId = getCookieValue("VisitorId");
        $.ajax({
            type: "POST",
            url: "php/logError.php",
            data: {
                ErrorCode: errorCode,
                FolderId: folderId,
                VisitorId: visitorId,
                CalledFrom: calledFrom,
                ErrorMessage: errorMessage
            },
            success: function (success) {
                if (success.trim() == "ok") {
                    alert("Error: " + errorMessage + " calledFrom: " + calledFrom);
                    console.log(errorCode + " error from: " + calledFrom + " error: " + errorMessage);
                }
                else {
                    alert("Error log Ajax error: " + errorMessage + " calledFrom: " + calledFrom);
                    if (!success.trim().startsWith("2300"))
                        console.log("log oggleError fail: " + success + " calledFrom: " + calledFrom);
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                alert("Error log XHR error: " + errMsg);
            }
        });
    } catch (e) {
        alert("Error log CATCH error: " + e);
        console.log("logOggle error not working: " + e);
    }
}

function validateConnection() {
    $.ajax({
        type: "GET",
        url: "php/validateConnection.php",
        success: function (data) {
            alert(data);
        },
        error: function (jqXHR) {
            alert(getXHRErrorDetails(jqXHR));
        }
    });
}

