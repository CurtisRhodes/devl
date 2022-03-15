<?php
    $success = "ono";
    try
    {
        include('yagdrassel.php');
        $pdo = pdoConn();

        $Id = $_POST['Id'];
        $path = $_POST['path'];
        $fileName = $_POST['fileName'];
        $folderId = $_POST['folderId'];
        $folderType = $_POST['folderType'];
        $width = 0;
        $height = 0;
        $fileSize = 0;

        $files = preg_grep('/^([^.])/', scandir($path));
        //if($files.length == 0){
        //    $success = .$path." not found";
        //}
        //else {
	        $success = 'unable aquire size data';
            foreach ($files as $file) {
                if(trim($file) == $fileName) {
                    $image_info = getimagesize($path.'/'.$fileName);
                    $width = $image_info[0];
                    $height = $image_info[1];
                    $fileSize = filesize($path.'/'.$fileName);
                    $success = 'file data ok';
                }
            }
        //}

        if($success == 'file data ok'){
            $now = date('Y-m-d H:i:s');
            $externalLink = "??";

            $pdo->beginTransaction();

            $sql = "insert into ImageFile (Id,FileName,FolderId,ExternalLink,Width,Height,Size,Acquired) ".
                "values ('".$Id."','".$fileName."','".$folderId."','".$externalLink."',".$width.",".$height.",".$fileSize.",'".$now."')";
            $stmt1 = $pdo->prepare($sql);
            $stmt1->execute();

            $stmt2 = $pdo->prepare("insert into CategoryImageLink (ImageCategoryId,ImageLinkId,SortOrder) values (".$folderId.",'".$Id."',0)");
            $stmt2->execute();

            $pdo->commit();

            $success = 'ok';
        }
        $pdo = null;
    }
    catch(PDOException $e) {
        $success = $e->getMessage();
        $pdo->rollback();
    }
    echo $success;
?>
