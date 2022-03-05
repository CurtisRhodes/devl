<?php
    try
    {
        include('settings.php');
        $pdo = pdoConn();

        $rootPath = $_GET['rootPath'];
        $rootId = $_GET['rootId'];

        $TotalSubFolders = 0;
        $TotalChildFiles = 0;
        $ChangesMade = 0;
        $FoldersProcessed = 0;
        $LocalOffset = '../../danni/';


        function updateFolder($pdo, $folderId, $folderPath, &$ChangesMade, &$FoldersProcessed, &$TotalSubFolders, &$TotalChildFiles)
        {        
            $dirPath = preg_grep('/^([^.])/', scandir($folderPath));
            $dirfileCount = count($dirPath);
            
            $TotalChildFiles += $dirfileCount;

            //$cmd = $pdo->query("select * from CategoryFolder where Id=".$folderId);
            //$catRow = $cmd->fetch();

 //           $test = $catRow[SubFolders];
 //           $test = $dirfileCount;

//            if($catRow[Files] != $dirfileCount) {
//                $stmt= $pdo->prepare("UPDATE CategoryFolder SET Files=".$dirfileCount." WHERE Id=".$folderId);
//                $stmt->execute();
//                $ChangesMade++;
//            }
//
//            $cmd = $pdo->query("select Id, FolderPath from CategoryFolder where Parent=".$folderId);
//            $subDirs = $cmd->fetch_all();
//            $subDirCount = count($subDirs);
//
//            if($catRow[SubFolders] != $subDirCount) {
//                $stmt= $pdo->prepare("UPDATE CategoryFolder SET SubFolders=".$subDirCount." WHERE Id=".$folderId);
//                $stmt->execute();
//                $ChangesMade++;
//            }
//            $TotalSubFolders += $subDirDirCount;
//
//            // DANGER recurr
//            // foreach($subDirs as $subDir) {
//            //    updateFolder($subDir[Id], $folderPath.$subDir[Id]);
//            // }
//
//            if($catRow[TotalSubFolders] != $TotalSubFolders) {
//                $stmt= $pdo->prepare("UPDATE CategoryFolder SET TotalSubFolders=".$TotalSubFolders." WHERE Id=".$folderId);
//                $stmt->execute();
//                $ChangesMade++;        
//            }
//
//            if($catRow[TotalChildFiles] != $TotalChildFiles) {
//                $stmt= $pdo->prepare("UPDATE CategoryFolder SET TotalChildFiles=".$TotalChildFiles." WHERE Id=".$folderId);
//                $stmt->execute();
//                $ChangesMade++; 
//            }

            $FoldersProcessed++;
        }

        updateFolder($pdo, $rootId, $LocalOffset.$rootPath, $ChangesMade, $FoldersProcessed, $TotalSubFolders, $TotalChildFiles);
        //updateFolder($pdo, $folderId, $folderPath,         &$ChangesMade, &$FoldersProcessed, &$TotalSubFolders, &$TotalChildFiles)

        //echo 'try5  changesMade: '.$ChangesMade;

        $pdo = null;        
        $returnObject = ['success' => 'ok','changesMade' => $ChangesMade,'foldersProcessed' => $FoldersProcessed];
    }       
    catch(Exception $e) {
      echo 'Error: ' .$e->getMessage();
    }
    echo json_encode($returnObject);
?>
