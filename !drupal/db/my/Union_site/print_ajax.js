

function showPage(page_name)
{
	document.getElementById('table_vizitki').style.display = "none";
	document.getElementById('table_bukleti').style.display = "none";
	document.getElementById('table_otkritki').style.display = "none";
	document.getElementById('table_kalendari').style.display = "none";
	document.getElementById('table_knigi').style.display = "none";
	document.getElementById('table_oblogki').style.display = "none";
	
	document.getElementById('table_'+page_name).style.display = "block";
	
	document.getElementById('gallery_vizitki').style.display = "none";
	document.getElementById('gallery_bukleti').style.display = "none";
	document.getElementById('gallery_otkritki').style.display = "none";
	document.getElementById('gallery_kalendari').style.display = "none";
	document.getElementById('gallery_knigi').style.display = "none";
	document.getElementById('gallery_oblogki').style.display = "none";
	
	document.getElementById('gallery_'+page_name).style.display = "block";
	
//	 //Получаем то что ввел польователь
//	 var name = document.getElementById('name').value;
//	
//	// 
//	var email = document.getElementById('email').value; 
//	
//	//
//	var message = document.getElementById('message').value;
//	
//	
//	var load1 = document.getElementById('load1');
//    var answer = document.getElementById('answer');
//	//var answer1 = document.getElementById('answer1');
//	
//	
//	 //То что будем отправлять на сервер
//      var parameter = 'name='+name+'&email='+email+'&message='+message;
//	          //Показываем загрузку
//       answer.innerHTML = load1.innerHTML;
//           //Соединяемься с аяксом
//      var network = createRequestObject();
//             //Тут мы выбраем метод отправки формы и куда отправляем
//            network.open("post","mail.php",true);
//               //Кодировка формы у меня она windows-1251
//            network.setRequestHeader("Content-type","application/x-www-form-urlencoded; charset=utf-8");
//              //Здесь пишим ответ от сервера то что отправить нам сервер в ответ
//			  network.onreadystatechange = getAlert;
//			  function getAlert(){
//				  					if (network.readyState == 4)
//			  							{
//											if (network.status == 200)
//											{
//												var mark = network.responseText.substring(0, 3);
//												var str_length = network.responseText.length;
//												if (mark == "old") 
//												{
//													//answer.innerHTML = '';
//													answer.innerHTML = network.responseText.substring(3, str_length);
//												}
//												else if (mark == "new") 
//												{
//													//answer.innerHTML = '';
//													answer.innerHTML = network.responseText.substring(3, str_length);
//													document.getElementById('name').value = ''; 
//													document.getElementById('email').value = ''; 
//													document.getElementById('message').value = '';
//												}
//												else {
//														answer.innerHTML = network.responseText;
//														//answer.innerHTML = '';
//													}
//													
//											}
//											else
//											alert("Error: status code is" + network.status + "/" + network.readyState);
//										}
//										
//										
//            					}
//        
//            //Отправлям запрос
//             network.send(parameter);
}


	
		//Подключаемся к аяксу
		function createRequestObject() {
		try { return new XMLHttpRequest() }
		catch(e) {
			try { return new ActiveXObject('Msxml2.XMLHTTP') }
			catch(e) {
				try { return new ActiveXObject('Microsoft.XMLHTTP') }
				catch(e) { return null; }
			}
		}
	}