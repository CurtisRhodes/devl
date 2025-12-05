<?php
    try
    {
        include('getConnection.php');
        $conn = pdoConn('oggleboo_Danni');
  
        $folderId = $_POST['folderId'];
         $strData = $_POST['strData'];

        
        $decodedSortOrderArray = json_decode($strData, true);
        $knt = 0;



        //$success = "12345";
        // $decodedSortOrderArray = json_decode($SortOrderArray,true);
        
        $success= "folderId: [".$folderId."]";


        $conn = null;
    }
    catch(Exception $e) {
        $success = $e->getMessage();
    }
    echo $success;
?>
