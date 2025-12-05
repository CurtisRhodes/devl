<?php
    $success = "ono";
    try
    {        
        $success = "ono";
        // $to_email = 'curtishrhodes@hotmail.com';
        $to_email = 'admin@ogglebooble.com';
        $subject = $_POST['subject'];
        $message = $_POST['message'];
        $headers = 'From: oggleboo@ogglebooble.com';

        $headers .= "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type: text/html;charset=UTF-8" . "\r\n";

        $success = mail($to_email, $subject, $message, $headers);

    }
    catch(Exception $e) {
        $success = 'catch Exception: '.$e->getMessage();
    }
    echo $success;
?>
