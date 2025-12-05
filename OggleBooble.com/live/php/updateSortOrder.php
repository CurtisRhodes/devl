<?php
header("Access-Control-Allow-Origin: *");
include('getConnection.php');
$pdo = pdoConn('oggleboo_Danni');

$success = "ono";


    $folderId = $_POST['folderId'];
    $sortOrderArray = $_POST['sortOrderArray'];
    
    $decodedSortOrderArray = json_decode($sortOrderArray,true);
    
    foreach ($decodedSortOrderArray as $sortItem) {
        $ItemId = 'z';
        $SortOrder = 'z';

        foreach($sortItem as $x => $x_value) {
            if($x == 'ItemId') $ItemId = $x_value;
            if($x == 'SortOrder') $SortOrder = $x_value;
        }

        if($SortOrder != 'z')
        {
            //$sql = "UPDATE CategoryImageLink SET SortOrder=? WHERE ImageCategoryId=? AND ImageLinkId=?";
            $sql = "UPDATE ImageFile SET SortOrder=".$SortOrder." WHERE FolderId=".$folderId." AND Id='".$ItemId."'";
            $stmt= $pdo->prepare($sql);
            //$stmt->execute([$SortOrder, $folderId, $ItemId]);
            $stmt->execute();
            $stmtSuccess = $stmt->errorCode();
            if($stmtSuccess == '00000') 
                $success = 'ok';
            else
                $success = "err: ".$stmt->errorCode();
        }
        else
	        $success= "err: decode fail: ".$sortItem;
    }
    echo $success;    

?>
