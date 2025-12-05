<?php

    include('getConnection.php');
    $conn = pdoConn('oggleboo_Danni');

	$folderId = $_GET['folderId'];
	$direction = $_GET['direction'];

	$cmd = $conn->query("select Parent parentId, SortOrder from CategoryFolder where Id=".$folderId);
	$curFolder = $cmd->fetch();
	$sortOrder = $curFolder[SortOrder];
	$parentId = $curFolder[parentId];

	if($direction=='next'){
		$cmd = $conn->query("select Id from CategoryFolder where Parent=".$parentId." and SortOrder =".
		" (select min(SortOrder) from CategoryFolder where Parent=".$parentId." and SortOrder > ".$sortOrder.")");
		$next = $cmd->fetch()[Id];

		if(is_null($next)){
			$next = $parentId;
		}

		echo $next;
	}
	else{
		$cmd = $conn->query("select Id from CategoryFolder where Parent=".$parentId.
			" and SortOrder < ".$sortOrder." order by SortOrder desc limit 1");

		$previous = $cmd->fetch()[Id];
	
		if(is_null($previous)) {
			$previous = $parentId;
		}

		echo $previous;
	}
	
	// echo "[{'next':'".$next."'},{'previous':'".$previous."'}]";
	// echo "{'".$next."','".$previous."'}".trim();
	// echo "[".$next.",".$previous.",".$parentId."]";

	$conn = null;
?>