<?php
    $success = "ono";
    try
    {
        include('yagdrassel.php');
        $pdo = pdoConn();

        $parentId = $_POST['parentId'];
        $folderPath = $_POST['folderPath'];
        $newFolderName = $_POST['newFolderName'];
        $folderType = $_POST['folderType'];
        $rootfolder = $_POST['rootfolder'];
        $sortOrder = $_POST['sortOrder'];

         $cmd = $pdo->query("select * from CategoryFolder where Id = ".$parentId);
            $catRow = $cmd->fetch();

        $rootFolder = $catRow[RootFolder];
        $folderPath = $catRow[FolderPath]."/".$newFolderName;

        $stmt = $pdo->prepare("INSERT INTO CategoryFolder (Parent,FolderName,RootFolder,FolderPath,FolderType,SortOrder) VALUES (?,?,?,?,?,?)");
        $pdo->beginTransaction();

        $stmt->execute([$parentId, $newFolderName, $rootFolder, $folderPath, $folderType, $sortOrder]);
        $pdo->commit();
        $pdo = null;
        
        // $success = 'ok but: '.$folderPath;
        $mkdirSuccess = mkdir('../../danni/'.$folderPath);
        //$success = $mkdirSuccessText = iff($mkdirSuccess,'ok','directory fail');
    }
    catch(PDOException $e) {
        $success = $e->getMessage();
        $pdo->rollback();
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;
?>
