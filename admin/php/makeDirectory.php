 <?php
    try {

        $folderPath = $_GET['folderPath'];

        $fullPath = '../../danni/'.$folderPath;
        
        $mkdirSuccess = mkdir($fullPath);

        // $success = $mkdirSuccessText = iff($mkdirSuccess,'ok','directory fail');

        $success = 'test: '.$fullPath;

    }
    catch (Exception $e) {
        $success = $e -> getMessage();
    }
    echo $success;
?>
