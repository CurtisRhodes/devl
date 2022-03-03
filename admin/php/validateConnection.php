<?php
/*
    $host_name = 'db5006287599.hosting-data.io';
    $host_name = 'db5006287599.hosting-data.io';
    $host_name = 'db5006287599.hosting-data.io';
    $host_name = 'db5006287599.hosting-data.io';
    $host_name = 'db5006287599.hosting-data.io';

      $host_name = '64.20.55.234';
      $database = 'st21569_yagdrassel';
      $user_name = 'st21569_webVisitor';
      $password = 'Terry_ecac8432-304a-44be-ac2b-76559b4b0e85';
*/

    $host_name = '64.20.55.234';
    $user_name = 'st21569_registro';
    $password = '166ca201-3891-435f-9962-eb23e9b8eaa8';
    $link = new mysqli($host_name, $user_name, $password, $database);

    if ($link->connect_error) {
        die('<p>Failed to connect to dbu50024: '. $link->connect_error .'</p>');
    } else {
        echo '<p>dbu50024 Connection to MySQL server successfully established.</p>';
    }
?>
