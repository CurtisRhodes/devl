<?php
    try
    {
        $fileName = $_POST['fileName'];
        $text = $_POST['text'];

        $success = "?";
        
        // Read the JSON file 
        $json = file_get_contents(path, file_name)
        
        // Decode the JSON file
        $json_data = json_decode($json,true);
        
        // Display data
        
        print_r($json_data);


        //$myfile = fopen($fileName, "w") or die("Unable to open file!");
        //fwrite($myfile, $text);
        //fclose($myfile);
     
        $success = "ok";
  
    }
    catch(Exception $e) {
        $success = 'e: '.$e->getMessage();
    }
    echo $success;
?>

