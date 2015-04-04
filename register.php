<?php
	// After registering, user will be redirected to this page with POST variables set 
	 require('database.php');

	//inserts username and hashed password into newsite.USERS

	$username = $_POST['username'];
	$userpassword = $_POST['password'];
 	$hashedpassword = crypt($userpassword);
	
		// check table to find out whether username exists already
		//if not in system, will create a new entry into the USERS table
		$stmt = $mysqli->prepare("select hashedpassword from users where username=?");
		
		if(!$stmt){
			echo json_encode(array(
				"success" => false,
				"message" => "Registration Query Preparation Failed"
			));
			exit;
		}
		 
		$stmt->bind_param('s', $username);
		 
		$stmt->execute();
		
		// make sure that there is a row in the result (that is, that username even exists in system).
		// if not, back to login screen after delay
		$stmt->store_result();
        if($stmt->num_rows != 1) { // since we're searching based on primary key, there can only be 1
			$stmt = $mysqli->prepare("insert into users (username, hashedpassword) values (?, ?)");
		
			if(!$stmt){
				echo json_encode(array(
					"success" => false,
					"message" => "Registration Query Preparation Failed"
				));
				exit;
			}
 
			$stmt->bind_param('ss', $username, $hashedpassword );
 
			$stmt->execute();
		
			$stmt->close();

       		session_start();
			ini_set("session.cookie_httponly", 1);
			
       		$_SESSION['user'] = $username;
            $_SESSION['token'] = substr(md5(rand()), 0, 10);
			echo json_encode(array(
				"success" => true,
				"token" => $_SESSION['token']
			));
            exit; 
        }
		
		//if already in system, will tell you that

		else{	
				echo json_encode(array(
					"success" => false,
					"message" => "Username already in system"
				));
				exit;
		}
?>
