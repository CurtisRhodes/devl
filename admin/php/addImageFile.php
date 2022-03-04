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
        $externalLink = "??";
        $now = date('Y-m-d H:i:s');

        $files = preg_grep('/^([^.])/', scandir($path));
        
        $success = 'not found';
        foreach ($files as $file) {
            if(trim($file) == $fileName) {
                $success = 'file found but';                
                $image_info = getimagesize($path.'/'.$fileName);
                $width = $image_info[0];
                $height = $image_info[1];
                $fileSize = filesize($path.'/'.$fileName);
                $success = 'file data ok';
            }
        }

        if($success == 'file data ok')
        {
            $sql = "INSERT INTO ImageFile (Id,FileName,FolderId,ExternalLink,Width,Height,Size,Acquired) ".
              "VALUES ('".$Id."','".$fileName."','".$folderId."','".$externalLink."',".$width.",".$height.",".$fileSize.",'".$now."')";
            $stmt1 = $pdo->prepare($sql);
            $stmt1->execute();

            $stmt2 = $pdo->prepare("INSERT INTO CategoryImageLink (ImageCategoryId,ImageLinkId,SortOrder) VALUES (".$folderId.",'".$Id."',0)");
            $stmt2->execute();

            $success = 'ok';
        }

        $pdo = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;

?>
