function countPrice(id){
	 var eksk_p=1500;
	 var mini_p=800;
	 var pogr_p=1300;
	 
	 if(id == 'eksk'){var price = eksk_p;}
	 else if(id == 'mini'){var price = mini_p;}
	 else if(id == 'pogr'){var price = pogr_p;}
	 
	var day_1=document.getElementById('day_1');
	var month_1=document.getElementById('month_1');
	var year_1=document.getElementById('year_1');
	
	var day_2=document.getElementById('day_2');
	var month_2=document.getElementById('month_2');
	var year_2=document.getElementById('year_2');
	if(day_1.value!='0' && day_2.value!='0' && month_1.value!='0' && month_2.value!='0' && year_1.value!='0' && year_2.value!='0')
		{
			var date_1 = month_1.value+"/"+day_1.value+"/"+year_1.value;
			var converted_1 = Date.parse(date_1) ;
			
			var date_2 = month_2.value+"/"+day_2.value+"/"+year_2.value;
			var converted_2 = Date.parse(date_2) ;
			
			var time = converted_2 - converted_1;
			if(time>0)
				{
					time = time/(1000*60*60*24);
					document.getElementById('price').value = time*price+'т.р.';
					//alert(time*price+'т.р.');
				}
			else{alert('Некоректно введены данные!');}
		}
	}
