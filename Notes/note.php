<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notes</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
    <style>
        body {
            background-color: #f0f0f0;
        }
        .navbar {
            margin-bottom: 0;
        }
        .main-container {
            padding: 20px;
            margin: 20px;
        }
        .note-box {
            background: white;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 20px;
        }
        h2 {
            color: #333;
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 10px;
        }
        .form-group label {
            font-weight: bold;
            color: #555;
        }
        .btn-add {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
            border-radius: 4px;
        }
        .btn-add:hover {
            background-color: #45a049;
        }
        textarea {
            resize: vertical;
        }
        .notes-list {
            background: #fff;
            padding: 20px;
            border-radius: 5px;
            min-height: 300px;
        }
        .note-item {
            background: #f9f9f9;
            padding: 15px;
            margin-bottom: 10px;
            border-left: 3px solid #4CAF50;
        }
        .note-subject {
            font-weight: bold;
            color: #4CAF50;
        }
        .note-date {
            color: #888;
            font-size: 12px;
            float: right;
        }
        .note-title {
            font-size: 16px;
            margin: 10px 0;
            color: #333;
        }
        .note-content {
            color: #666;
        }
        .delete-btn {
            color: red;
            cursor: pointer;
            float: right;
            margin-left: 10px;
        }
    </style>
      <link rel="stylesheet" href="../Time Table/timetable.css">
    <link href="https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
  
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
</nav>

    <div class="main-container">
        <div class="row">
            <div class="col-md-4">
                <div class="note-box">
                    <h2>Add Note</h2>
                    <form>
                        <div class="form-group">
                            <label>Subject:</label>
                            <select class="form-control">
                                <option>Select Subject</option>
                                <option>Analyse</option>
                                <option>Algèbre</option>
                                <option>Applications Réparties</option>
                                <option>Architecture des Réseaux</option>
                                <option>Comptabilité</option>
                                <option>Conception des SI</option>
                                <option>Droit</option>
                                <option>Java</option>
                                <option>SGBD</option>
                                <option>UNIX</option>
                                <option>WEB</option>
                                <option>Anglais</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Title:</label>
                            <input type="text" class="form-control" placeholder="Enter note title">
                        </div>
                        
                        <div class="form-group">
                            <label>Date:</label>
                            <input type="date" class="form-control">
                        </div>
                        
                        <div class="form-group">
                            <label>Note:</label>
                            <textarea class="form-control" rows="5" placeholder="Write your note here"></textarea>
                        </div>
                        
                        <button type="button" class="btn-add">Add Note</button>
                    </form>
                </div>
            </div>
            
            <div class="col-md-8">
                <div class="notes-list">
                    <h2>My Notes</h2>
                    
                    <div class="note-item">
                        <span class="delete-btn">×</span>
                        <span class="note-date">Dec 15, 2023</span>
                        <div class="note-subject">Java</div>
                        <div class="note-title">OOP Concepts</div>
                        <div class="note-content">mtnsech bech tb3th code par mail</div>
                    </div>
                    
                    <div class="note-item">
                        <span class="delete-btn">×</span>
                        <span class="note-date">Dec 14, 2023</span>
                        <div class="note-subject">SGBD</div>
                        <div class="note-title">SQL </div>
                        <div class="note-content">3ana compte rendu 9bl lds</div>
                    </div>
                    
                    
                </div>
            </div>
        </div>
    </div>
    
    <center>
        <a href="../index.html">Go back.</a>
    </center>

</body>
</html>