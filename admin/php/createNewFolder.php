<?php
    $success = "ono";
    try
    {
        include('yagdrassel.php');
        // include('registro.php');
        $pdo = pdoConn();

        $parentId = $_POST['parentId'];
        $newFolderName = $_POST['newFolderName'];
        $folderPath = $_POST['folderPath'];
        $folderType = $_POST['folderType'];
        $rootfolder = $_POST['rootfolder'];
        $sortOrder = $_POST['sortOrder'];

         $cmd = $pdo->query("select * from CategoryFolder where Id = ".$parentId);
            $catRow = $cmd->fetch();

         $cmd = $pdo->query("select max(Id)+1 from CategoryFolder");
            $nextId = $cmd->fetch()[0];

        $rootFolder = $catRow[RootFolder];
        $folderPath = $catRow[FolderPath]."/".$newFolderName;

        if($catRow[FolderType]=='singleModel') {
            $stmt = $pdo->prepare("update CategoryFolder FolderType='singleParent' where Id=".$parentId);
            $stmt->execute();
        }

        $sql = "insert into CategoryFolder (Id,Parent,FolderName,RootFolder,FolderPath,FolderType,SortOrder)".
            " values(".$nextId.",".$parentId.",'". $newFolderName."','". $rootFolder."','". $folderPath."','". $folderType."',". $sortOrder.")";
        $stmt1 = $pdo->prepare($sql);
        $stmt1->execute();

        $stmt1Success = $stmt1->errorCode();
        if($stmt1Success == '00000') {
            $success = 'ok';
        }
        else {
            $success = "error ".$stmt1Success." sql: ".$sql;
        }

        $pdo = null;

        $fullPath = '../../danni/'.$folderPath;
        $mkdirSuccess = mkdir($fullPath);

    }
    catch(PDOException $e) {
        $success = $e->getMessage();
    }
    echo $success;
?>
