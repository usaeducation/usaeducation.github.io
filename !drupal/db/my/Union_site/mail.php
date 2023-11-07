<?php
header('Content-Type: text/html;charset=utf-8');  //кодировка

// получаем переменные через post
    $name = $_POST['name'];
   	$email = $_POST['email'];
	$message = $_POST['message'];
	
//обрезаем пробелы
    $name1 = trim($name);
	$email1 = trim($email);
	$message1 = trim($message);
	
 // Экранируем опасные символы
    $name2 = htmlspecialchars($name1);
	$email2 = htmlspecialchars($email1);
	$message2 = htmlspecialchars($message1);
	
// Проверяем переменные на пустоту
    if($name2 == '') {unset($name2);}
	if($email2 == '') {unset($email2);}
	if($message2 == '') {unset($message2);}
	

if(isset($name2) && isset($email2) && isset($message2))
	{
		if(preg_match("|^[-0-9a-z_]+@[-0-9a-z^\.]+\.[a-z]{2,6}$|i",$email2))
		{	
			$address = 'vova-1985@tut.by';
			$sub = "Сообщение c сайта Union";
			$mes = "Автор назвался: $name \nУказал свой адрес: $email \nСодержание письма: $message";
			$verify = mail ($address,$sub,$mes,"Content-type:text/plain; charset = utf-8\r\nFrom:$email"); 
			if ($verify == 'true')
				{
				echo 'new<div id="bug" class="border_green">
				<img src="static/images/111.png" align="left"><p>Сообщение доставлено!<br/>Мы свяжемся с Вами.</p>
				</div><br/>';
				}
			else{echo 'old<div id="bug" class="border_red">
				<img src="static/images/error.png" align="left"><p>Сообщение не доставлено!<br/>Ошибка на стороне сервера!</p>
				</div><br/>';
				}
		}
		else{echo 'old<div id="bug" class="border_red">
			 <img src="static/images/error.png" align="left"><p>Вы неверно ввели свой email!<br/>Введите правильный email!</p>
			</div><br/>';
			}
	}
	
 else {
           echo '<div id="bug" class="border_red">
      <img src="static/images/error.png" align="left"><p>Вы ввели не все данные! <br/>Введите все данные !</p>
      </div><br/>';
         }






?>