<?php
header("Access-Control-Allow-Origin: *");

include('getConnection.php');
$pdo = pdoConn('oggleboo_Danni');

$success = "ono";
$cmd = null;
$results = null;
try
{
    $folderId = $_POST['folderId'];
    $sortOrderArray = $_POST['sortOrderArray'];
    $decodedSortOrderArray = json_decode($sortOrderArray,true);
    $knt = 0;
    foreach ($decodedSortOrderArray as $sortItem) {
        $FolderId = '0';
        $ItemId = 'z';
        $SortOrder = 'z';

        foreach($sortItem as $x => $x_value) {
            if($x == 'ItemId') $ItemId = $x_value;
            if($x == 'SortOrder') $SortOrder = $x_value;
        }

        if($SortOrder != 'z')
        {
            $sql = "UPDATE CategoryImageLink SET SortOrder=? WHERE ImageCategoryId=? AND ImageLinkId=?";
            $stmt= $pdo->prepare($sql);
            $stmt->execute([$SortOrder, $folderId, $ItemId]);

            $knt++;
        }
    }
    $success="knt=".$knt;
}
catch(Exception $e) {
    echo $e->getMessage();
}
finally {
    $cmd = null;
    $results = null;
    $pdo = null;
    echo $success;
}
?>
