<?php

     $host_name = 'da100.is.cc';
     $database = 'oggleboo_wysiwyg';
     $user_name = 'oggleboo_wysiwyg';
     $password = 'Terry_ecac8432-304a-44be-ac2b-76559b4b0e85';

     $link = new mysqli($host_name, $user_name, $password, $database);


    if ($link->connect_error) {
        die('<p>Failed to connect to oggleboo_wysiwyg: '. $link->connect_error .'</p>');
    } else {
        echo '<p>oggleboo_wysiwyg Connection successfully established.</p>';
    }
?>
