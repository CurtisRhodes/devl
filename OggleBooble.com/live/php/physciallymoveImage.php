<?php

        $curFolderId = $_GET['curFolderId'];
        $destFolderId = $_GET['destFolderId'];
        $linkId = $_GET['linkId'];
        $mode = $_GET['mode'];

        $cmd = $pdo->query("select * from ImageFile where Id=".$curFolderId);
        $imageFile = $cmd->fetchAll();

        $cmd = $pdo->query("select FolderPath from CategoryFolder where Id=".$curFolderId);
        $currPath = $cmd->fetch();

        $cmd = $pdo->query("select FolderPath from CategoryFolder where Id=".$destFolderId);
        $destPath = $cmd->fetch();

        $files = preg_grep('/^([^.])/', scandir($currPath));
        if($files == false){
            $success = "scannDir fail. Path: [".$currPath."]";
        }
        else {
            foreach ($files as $file) {
                if($file == $fileName) {
                    if($file.rename($currPath.'/'.$fileName, $destPath.'/'.$fileName)){
                        $success = "ok";
                    }
                    else {
                        $success = "rename fail  :".$destPath.'/'.$file;
                    }
                }
            }  
        }

        $sql = "update ImageFile set FolderId=".$destFolderId." where Id='".$linkId."'";
        $stmt= $pdo->prepare($sql);
        $stmt->execute();
        $stmt1Success = $stmt->errorCode();
        if($stmt1Success == '00000') {

        echo $success;
?>
