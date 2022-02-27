<?php
    $success = "ono";
    try
    {
        include('yagdrassel.php');
        $pdo = pdoConn();

        $Id = $_POST['newId'];
        $path = $_POST['path'];
        $fileName =  $_POST['fileName'];
        $folderId = $_POST['folderId'];
        $folderType = $_POST['folderType'];
        $width = 0;
        $height = 0; 
        $fileSize = 0;
        $type = 0; 
        $attr = "";

        $files = preg_grep('/^([^.])/', scandir($path));
        
        $success = 'not found';
        foreach ($files as $file) {
            if(trim($file) == $fileName) {
                $success = 'file found but';
                //list($width, $height, $type, $attr) = getimagesize($path.$fileName);
                $fileSize = filesize($path.$fileName);
                $success = 'file data ok';
            }
        }

        if($success == 'file data ok')
        {
            $stmt1 = $pdo->prepare("INSERT INTO ImageFile (Id,FileName,FolderId,ExternalLink,Width,Height,Size,Acquired) VALUES (?,?,?,?,?,?)");
            $stmt2 = $pdo->prepare("INSERT INTO CategoryImageLink (ImageCategoryId,ImageLinkId) VALUES (?,?)");
            $pdo->beginTransaction();

            $stmt1->execute([$Id, $fileName, $folderId, $folderPath, $path, $width, $height, $fileSize, date("Y/m/d:HH:MM")]);
            $stmt2->execute([$folderId, $Id]);

            $pdo->commit();
            $success = "ok";
        }

        $pdo = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;

?>
