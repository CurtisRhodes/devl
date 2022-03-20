const settingsImgRepo = 'https://ogglefiles.com/danni/';
let blogObject = {};

function displayBlogList(commentType) {
    try {
        $.ajax({
            type: "GET",
            url: "php/getBlogItems.php?commentType=" + commentType,
            success: function (data) {
                if (data.substring(5, 20).indexOf("error") > 0) {
                    $('#blogListArea').html(data);
                }
                else {
                    let jData = JSON.parse(data);
                    blogObject.CommentType = commentType;
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
                                <div class="blogEditButton" onclick="editBlogEntry('`+ blogComment.Id + `')">edit</div>
                            </div>`);
                        });

                        loadCommentTypesDD($('#ddCommentType'));
                        resizeBlogPage();
                    }
                }
            },
            error: function (jqXHR) {
                $('#albumPageLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                alert("displayBlogList: " + errMsg);
                // logError("XHR", folderId, errMsg, "get albumImages");
            }
        });
    } catch (e) {
        logCatch("loadImages", e);
    }
}

function loadCommentTypesDD(ddObject) {
    $.ajax({
        type: "GET",
        url: "php/getRefs.php?refType=BLG",
        success: function (data) {
            if (data.substring(5, 20).indexOf("error") > 0) {
                $('#blogListArea').html(data);
            }
            else {
                let jData = JSON.parse(data);
                ddObject.html("");
                //$('#ddCommentType').html("");
                $.each(jData, function (idx, obj) {
                    //$('#ddBlogRefs').append("<option value='" + obj.RefCode + "'>" + obj.RefDescription + "</option>");
                    if (obj.RefCode == blogObject.CommentType) {
                        $('#blogTitle').html(obj.RefDescription);
                        ddObject.append("<option selected='selected' value='" + obj.RefCode + "'>" + obj.RefDescription + "</option>");
                    }
                    else
                        ddObject.append("<option value='" + obj.RefCode + "'>" + obj.RefDescription + "</option>");
                });

                ddObject.change(function () {
                    blogObject.CommentType = $('#ddCommentType').val()
                    displayBlogList($('#ddCommentType').val());
                });
            }
        },
        error: function (jqXHR) {
            $('#blogLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            alert("loadCommentTypesDD: " + errMsg);
            //let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            //if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", 3911, errMsg, functionName);
        }
    });
}

function newEntry() {
    //"    <div id='blogEditArea' class='blogArea twoColumnFrame flexContainer'>
    displayBlogEditHtml();
    clearBlogGets();
    loadCommentTypesDD();
    $('#leftColumnNew').hide();
    $('#leftColumnShow').show();
    $('#leftColumnEdit').hide();
    $('#btnAddEdit').html("Add");
    $("#txtPosted").datepicker();
}

function editBlogEntry(blogId) {
    $('#blogListArea').hide();
    $('#blogEditArea').show();

    try {
        $.ajax({
            type: "GET",
            url: "php/getBlogItem.php?blogId=" + blogId,
            success: function (data) {
                if (data.substring(5, 20).indexOf("error") > 0) {
                    $('#blogListArea').html(data);
                }
                else {
                    let blogComment = JSON.parse(data)[0];

                    $('#txtCommentTitle').val(blogComment.CommentTitle);
                    loadCommentTypesDD($('#selBlogEditCommentType'));
                    $('#txtPosted').val(blogComment.Created);
                    $('#summernoteContainer').val(blogComment.CommentText);
                    $('#txtLink').val(blogComment.JogImage);
                    $('#imgBlogLink').css("src", settingsImgRepo + blogComment.JogImage);
                }
            },
            error: function (jqXHR) {
                $('#albumPageLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                alert("displayBlogList: " + errMsg);
                // logError("XHR", folderId, errMsg, "get albumImages");
            }
        });
    } catch (e) {
        logCatch("loadImages", e);
    }

    //
    $('#leftColumnNew').show();
    $('#leftColumnShow').show();
    $('#leftColumnEdit').hide();
    $('#btnAddEdit').html("Update");
    //$('#btnNewCancel').hide();
    //loadCommentTypesDD();
    //$('#blogCrudBox').css("width", $(window).width() * .66);
    //loadSingleBlogEntry(blogItemId, "edit");
}

function viewBlogEntry(blogItemId) {
    if (isNullorUndefined(blogItemId))
        blogItemId = blogObject.Id;
    else
        blogObject.Id = blogItemId;

    $('.blogEditButton').hide();
    $('#leftColumnShow').show();
    $('#leftColumnEdit').show();
}

function loadSingleBlogEntry(blogItemId, editMode) {
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/OggleBlog/GetBlogItem?blogId=" + blogItemId,
            success: function (model) {
                if (model.Success === "ok") {
                    blogObject.ImageLink = model.ImageLink;
                    blogObject.ImgSrc = model.ImgSrc;
                    blogObject.CommentType = model.CommentType;

                    if (editMode == "edit") {
                        $('#txtCommentTitle').val(model.CommentTitle);
                        $('#txtLink').val(model.Link);
                        $('#imgBlogLink').attr("src", settingsImgRepo + model.ImgSrc);
                        $('#summernoteContainer').summernote('code', model.CommentText);
                        $('#txtPosted').val(model.Pdate); //.datepicker();
                        $('#txtLink').val(model.ImageLink);

                        $('#summernoteContainer').summernote('code', model.CommentText);
                        
                        $('#imgBlogLink').attr("src", settingsImgRepo + model.ImgSrc);

                        $('#txtBlogId').val(blogObject.Id);

                        $('#btnAddEdit').html("Update");
                        $('#btnNewCancel').html("Cancel");
                    }
                    else {
                        $('#blogPageTitle').html(model.CommentTitle);
                        $('#blogPageBody').html(model.CommentText);
                        
                        $('#blogPageImage').attr("src", settingsImgRepo + model.ImgSrc);
                    }
                }
                else {
                    logError("AJX", 3911, model.Success, "load SingleBlogEntry");
                }
            },
            error: function (jqXHR) {
                $('#blogLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", 3911, errMsg, functionName);
            }
        });
    } catch (e) {
        logError("CAT", 3911, e, "load SingleBlogEntry");
    }
}

function loadRefs() {
    try {
        $.ajax({
            type: "GET",
            url: "php/getRefs.php?refType=BLG",
            success: function (data) {
                if (data.indexOf("error") > 0) {
                    $('#blogListArea').html(data);
                }
                else {
                    let jData = JSON.parse(data);
                    $('#blogArticleJogContainer').html("");
                    if (jData.length == 0)
                        alert("no entries found for commentType: " + commentType);
                    else {
                        $.each(jData, function (idx, obj) {
                            $('#ddBlogRefs').append(`
                                <div class="blogArticleBottomRow flexContainer">
                                    <div class="blogEditButton floatright" onclick="editArticle('` + blogComment.PkId + `');">edit</div>
                                </div>`);
                        });
                        resizeBlogPage();
                    }
                }
            },
            error: function (jqXHR) {
                $('#albumPageLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXH);
                alert("get albumImages: " + errMsg);
                // logError("XHR", folderId, errMsg, "get albumImages");
            }
        });
    } catch (e) {
        logCatch("loadImages", e);
    }
}

function clearBlogGets() {
    // $('#txtommentTile').val($('#txtLnk').val("");
    $('#sumernoteContainer').summernote('cde', "");
    $('#imgBlogLink').attr("src", "");
    blogObject.Id = "";
}

function addBlogEntry() {
    try {
        blogObject.CommentTitle = $('#txtCommentTtle').val();
        blogObject.VisitorId = getCookievalue("VisitorId", "save BlogEntry");
        blogObject.Link = $('#txtLink').val();
        blogObject.CommentText = $('#summernoteContainer').summernote('code');
        blogObject.CommentType = $('#selBlogEditCommentType').val();

        if ($('#btnAddEdit').html() == "Add") {
            $.ajax({
                type: "POST",
                url: settingsArray.ApiServer + "api/OggleBlog/Insert",
                data: blogObject,
                success: function (successModel) {
                    if (successModel.Success == "ok") {
                        displayStatusMessage("ok", "Entry Saved");
                        $('#btnAddEdit').html("Edit");
                        //$('#btnNewCancel').show();
                        blogObject.Id = successModel.ReturnValue;
                    }
                    else
                        logError("AJX", 3911, successModel.Success, "saveBlogEntry");
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errMsg, folderId, "saveBlogEntry")) logError("XHR", 3911, errMsg, "saveBlogEntry");
                }
            });
        }
    } catch (e) {
        logCatch("loadImages", e);
    }
}

function updateBlogEntry() {
    try {
        $.ajax({
            type: "PUT",
            url: settingsArray.ApiServer + "api/OggleBlog/Update",
            data: blogObject,
            success: function (success) {
                if (success == "ok") {
                    displayStatusMessage("ok", "Entry Updated");
                } else logError("AJX", 3911, success, "saveBlogEntry");
            }, error: function (jqXHR) { let errMsg = getXHRErrorDetails(jqXHR); let functionName = arguments.callee.toString().match(/function ([^\(]+) /)[1]; if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", 3911, errMsg, functionName); }
        });
    }
    catch (e) { logError("CAT", 3911, e, "saveBlogEntry"); }
}

function loadImage() {
    // get full html image name
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/OggleBlog/GetImageLink?linkId=" + $('#txtLink').val(),
        success: function (imageAddress) {
            $('#imgBlogLink').attr("src", settingsImgRepo + imageAddress);
            blogObject.ImageLink = $('#txtLink').val();
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

