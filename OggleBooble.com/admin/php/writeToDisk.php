<?php
    try
    {
        $fileName = $_POST['fileName'];
        $text = $_POST['text'];

        $success = "?";
        $myfile = fopen($fileName, "w") or die("Unable to open file!");
        fwrite($myfile, $text);
        fclose($myfile);
     
        $success = "ok";
  
    }
    catch(Exception $e) {
        $success = 'e: '.$e->getMessage();
    }
    echo $success;
?>

