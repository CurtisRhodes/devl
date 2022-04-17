<?php

     $host_name = 'da100.is.cc';
     $database = 'oggleboo_registo';
     $user_name = 'oggleboo_registo';
     $password = 'Terry_ecac8432-304a-44be-ac2b-76559b4b0e85';
     $link = new mysqli($host_name, $user_name, $password, $database);

/*
    $host_name = '64.20.55.234';
    $user_name = 'st21569_registro';
    $password = '166ca201-3891-435f-9962-eb23e9b8eaa8';
    $link = new mysqli($host_name, $user_name, $password);
*/


    if ($link->connect_error) {
        die('<p>Failed to connect to registro: '. $link->connect_error .'</p>');
    } else {
        echo '<p>oggleboo_registo Connection successfully established.</p>';
    }
?>
