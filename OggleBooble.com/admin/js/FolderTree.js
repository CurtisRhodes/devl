

function folderTree() {
	// 4/6/2022  2:54pm

	let startRoot = 0;



	$.ajax({
		url: 'yagdrasselFetchAll.php?query=select * from CategoryFolder where Parent=' + startRoot,
		success: function (data) {
			let childFolders = JSON.parse(data);
			$.each(childFolders, function (idx, obj) {


			})


		},
		error: function () { }
	});



}

function ajaxError() { }

