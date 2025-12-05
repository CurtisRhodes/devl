<?php
    try
    {
        $response = "ono";
        $to_email = 'curtishrhodes@hotmail.com';
        $subject = 'Testing PHP Mail';
        $message = 'This mail is sent using the PHP mail function';
    
//        $headers = 'From: oggleboo@ogglebooble.com';
//        $headers .= "MIME-Version: 1.0" . "\r\n";
//        $headers .= "Content-type: text/html;charset=UTF-8" . "\r\n";

        $headers = "From: oggleboo@ogglebooble.com" . "\r\n" . "MIME-Version: 1.0" . "\r\n" . "Content-type: text/html;charset=UTF-8" . "\r\n";
        
        // $headers = 'From: oggleboo@ogglebooble.com' . '\r\n' .'CC: curtis.rhodes@gmail.com'. '\r\n' . 'X-Mailer: PHP/' . phpversion();

        $success = mail($to_email, $subject, $message, $headers);

        if (!$success) {
            $response = error_get_last()['message'];
        }
        else {
        	$response = $success ;
        }
    }
    catch(Exception $e) {
        $response = 'catch Exception: '.$e->getMessage();
    }
    echo $response;
?>
