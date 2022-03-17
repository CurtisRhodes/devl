<?php
    $success = "ono";
    try
    {
        include('yagdrassel.php');
        $pdo = pdoConn();

        $Id = $_POST['Id'];
        $path = $_POST['path'];
        $oldFileName = $_POST['oldFileName'];
        $newFileName = $_POST['newFileName'];
        $folderId = $_POST['folderId'];
        $width = 0;
        $height = 0;
        $fileSize = 0;

        $files = preg_grep('/^([^.])/', scandir($path));
	    $success = 'unable aquire size data';
        foreach ($files as $file) {
            if(trim($file) == $oldFileName) {
                $image_info = getimagesize($path.'/'.$oldFileName);
                $width = $image_info[0];
                $height = $image_info[1];
                $fileSize = filesize($path.'/'.$oldFileName);
                $success = 'file data ok';
            }
        }

        if($success == 'file data ok')
        {
            $now = date('Y-m-d H:i:s');
            $externalLink = "??";

            $pdo->beginTransaction();

            $sql = "insert into ImageFile (Id,FileName,FolderId,ExternalLink,Width,Height,Size,Acquired) ".
                "values ('".$Id."','".$newFileName."','".$folderId."','".$externalLink."',".$width.",".$height.",".$fileSize.",'".$now."')";
            $stmt1 = $pdo->prepare($sql);
            $stmt1->execute();

            $pdo->commit();

            $stmt1Success = $stmt1->errorCode();
            if($stmt1Success == '00000') {
                $stmt2 = $pdo->prepare("insert into CategoryImageLink (ImageCategoryId,ImageLinkId,SortOrder) values (".$folderId.",'".$Id."',0)");
                $stmt2->execute();
                $success = 'ok';
            }
            else {
                $success = $stmt1Success;
            }

        }

        $pdo = null;
    }
    catch(PDOException $e) {
        $success = $e->getMessage();
        $pdo->rollback();
    }
    echo $success;
?>
