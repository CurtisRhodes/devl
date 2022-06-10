<?php
    try
    {
        include('yagdrassel.php');
        $pdo = pdoConn();
  
        $linkId = $_POST['LinkId'];
        $folderId = $_POST['FolderId'];

        $sql = "insert into CategoryImageLink (ImageCategoryId, ImageLinkId, SortOrder) ".
            "values (".$folderId.",'".$linkId."',0)";

        $stmt1 = $pdo->prepare($sql);
        $stmt1->execute();

        $stmt1Success = $stmt1->errorCode();
        if($stmt1Success == '00000') {
            $success = 'ok';
        }
        else {
            $success = $stmt1Success."   sql: ".$sql;
        }
        $pdo = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;
?>
