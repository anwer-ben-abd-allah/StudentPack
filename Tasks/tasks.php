<?php 
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Pack</title>
    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
    
    <link href="https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
    <link rel="stylesheet" href="../Time Table/timetable.css">
</head>
<body>

<?php
// including the navbar from the root folder
include '../navbar.php';
?>

  <!-- Shown by navbar_auth.js when logged in -->
  <button class="btn-logout" id="logoutBtn" style="display:none">
    ↩ Déconnexion
  </button>
    <script src="../navbar_auth.js">
    </script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script> <!-- jQuery library -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script> <!-- Latest compiled JavaScript -->
<p>set monthly or daily tasks , save finished tasks , sort tasks by type</p>
</body>
</html>