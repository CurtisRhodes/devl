// const settingsImgRepo = 'https: //ogglefiles.com/danni/';

let currentBlogObject = {
    BlogId: 0,
    CommentTitle: '',
    ImgSrc: '',
    Text: '',
    Posted: '',
    Summary: '',
};

function startOggleBlog() {

    displayBlogList('PBE');

    //$('#summernoteContainer').summernote();
    //loadDropDown($('#selBlogEditCommentType'));
    //$('#blogListArea').show();

}

function displayBlogList(commentType) {
    try {
        $('.blogSection').hide();
        $('#blogListArea').show();

        $('#leftColumnList').hide();
        $('#leftColumnNew').show();
        $('#leftColumnView').hide();
        $('#leftColumnEdit').hide();

        loadDropDown($('#ddCommentType', 'BLG'));

        //currentBlogObject.CommentType : $('#ddCommentType').val();
        $.ajax({
            type: "GET",
            url: "php/getBlogItems.php?commentType=" + commentType,
            success: function (data) {
                let jData = JSON.parse(data);
                currentBlogObject.CommentType = commentType;
                $('#blogArticleJogArea').html("");
                if (jData.length == 0)
                    alert("no entries found for commentType: " + commentType);
                else {
                    $.each(jData, function (idx, blogComment) {
                        $('#blogArticleJogArea').append(`
                            <div class="blogArticleItem">
                                <div><img class="articleJogImage" src="` + blogComment.JogImage + `"/></div>
                                <div>
                                    <div class="blogCommentTitle">` + blogComment.CommentTitle + `</div>
                                    <div class="blogSummary">` + blogComment.Summary + `</div>
                                </div>
                                <div class="blogEditButton" onclick="displayEditArea('`+ blogComment.Id + `')">edit</div>
                            </div>`);
                    });
                    resizeBlogPage();
                }
            },
            error: function (jqXHR) {
                $('#albumPageLoadingGif').hide();
                logBlogError("CAT", -245223911, getXHRErrorDetails(jqXHR), "display blog list");
            }
        });
    } catch (e) {
        logBlogError("CAT", -245223911, e, "display blog list");
    }
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
            url: "php/getBlogItem.php?blogId=" + blogId,
            success: function (data) {
                $('#albumPageLoadingGif').hide();
                let blogComment = JSON.parse(data)[0];
                $('#txtCommentTitle').val(blogComment.CommentTitle);
                loadDropDown($('#selBlogEditCommentType'));
                $('#txtPosted').val(blogComment.Created);
                $('#summernoteContainer').summernote('code', blogComment.CommentText);
                $('#imgBlogLink').attr("src", blogComment.JogImage);
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
    $('#leftColumnNew').hide();
    $('#leftColumnView').show();
    $('#leftColumnEdit').hide();
    $('#btnAddEdit').html("Add");
    $("#txtPosted").datepicker();
}

function loadDropDown(ddElement, refType) {
    $.ajax({
        type: "GET",
        url: "php/getRefs.php?refType=" + refType,
        success: function (data) {
            let jData = JSON.parse(data);
            ddElement.html("");
            $.each(jData, function (idx, obj) {
                if (obj.RefCode == currentBlogObject.CommentType) {
                    $('#blogTitle').html(obj.RefDescription);
                    ddElement.append("<option selected='selected' value='" + obj.RefCode + "'>" + obj.RefDescription + "</option>");
                }
                else
                    ddElement.append("<option value='" + obj.RefCode + "'>" + obj.RefDescription + "</option>");
            });

            ddElement.change(function () {
                currentBlogObject.CommentType = $('#ddCommentType').val()
                displayBlogList();
            });
        },
        error: function (jqXHR) {
            logBlogError("XHR", -21544, getXHRErrorDetails(jqXHR), "blog load dropDown");
            $('#blogLoadingGif').hide();
        }
    });
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
    // get full html image name
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/OggleBlog/GetImageLink?linkId=" + $('#txtLink').val(),
        success: function (imageAddress) {
            $('#imgBlogLink').attr("src", imageAddress);
            currentBlogObject.ImageLink = $('#txtLink').val();
        },
        error: function (jqXHR) {
            $('#blogLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            //let functionName=arguments.callee.toString().match(/function ([^\(]+) /)[1];
            if (!checkFor404(errMsg, folderId, "loadImage")) logError("XHR", 3911, errMsg, "loadImage");
        }
    });
}

function btnNewCancelAction() {
    if ($('#btnNewCancel').html() == "Cancel") {
        showArticleJogs();
    }
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
                    console.log(errorCode + " error from: " + calledFrom + " error: " + errorMessage);
                }
                else {
                    if (!success.trim().startsWith("2300"))
                        console.log("log oggleerror fail: " + success);
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                alert("Error log error: " + errMsg);
            }
        });
    } catch (e) {
        alert("Error log CATCH error: " + e);
        console.log("logOggle error not working: " + e);
    }
}
