var arr=[
		   ['viz', 'bw_1', 100, 500, 0.0563],
		    ['viz', 'bw_1', 500, 1000, 0.0506],
			 ['viz', 'bw_1', 1000, 1000000, 0.045],
		   ['viz', 'bw_2', 100, 500, 0.0631],
		    ['viz', 'bw_2', 500, 1000, 0.0568],
			 ['viz', 'bw_2', 1000, 1000000, 0.0505],
		   ['viz', 'col_1', 100, 500, 0.0733],
		    ['viz', 'col_1', 500, 1000, 0.066],
			 ['viz', 'col_1', 1000, 1000000, 0.0586],
		   ['viz', 'col_2', 100, 500, 0.0973],
		    ['viz', 'col_2', 500, 1000, 0.0875],
			 ['viz', 'col_2', 1000, 1000000, 0.0778],
		   ['bukl', 'A5_115', 50, 100, 0.39],
		   	['bukl', 'A5_115', 100, 300, 0.38],
		   		['bukl', 'A5_115', 300, 500, 0.36],
		   			['bukl', 'A5_115', 500, 1000, 0.33],
		   				['bukl', 'A5_115', 1000, 1000000, 0.3],
		   ['bukl', 'A5_135', 50, 100, 0.41],
		   	['bukl', 'A5_135', 100, 300, 0.40],
		   		['bukl', 'A5_135', 300, 500, 0.37],
		   			['bukl', 'A5_135', 500, 1000, 0.35],
		   				['bukl', 'A5_135', 1000, 1000000, 0.32],
		['bukl', 'A4_115', 50, 100, 0.79],
		   	['bukl', 'A4_115', 100, 300, 0.77],
		   		['bukl', 'A4_115', 300, 500, 0.72],
		   			['bukl', 'A4_115', 500, 1000, 0.67],
		   				['bukl', 'A4_115', 1000, 1000000, 0.61],
		['bukl', 'A4_135', 50, 100, 0.82],
		   	['bukl', 'A4_135', 100, 300, 0.8],
		   		['bukl', 'A4_135', 300, 500, 0.75],
		   			['bukl', 'A4_135', 500, 1000, 0.7],
		   				['bukl', 'A4_135', 1000, 1000000, 0.63],				
		['otkr', 'col_1', 10, 50, 0.27],
		    ['otkr', 'col_1', 50, 100, 0.24],
				['otkr', 'col_1', 100, 200, 0.21],
					['otkr', 'col_1', 200, 500, 0.19],
						['otkr', 'col_1', 500, 1000000, 0.17],
		['otkr', 'col_2', 10, 50, 0.37],
		    ['otkr', 'col_2', 50, 100, 0.33],
				['otkr', 'col_2', 100, 200, 0.3],
					['otkr', 'col_2', 200, 500, 0.27],
						['otkr', 'col_2', 500, 1000000, 0.24],
		['kal', '86_300', 50, 100, 0.122],
		   	['kal', '86_300', 100, 300, 0.116],
		   		['kal', '86_300', 300, 500, 0.109],
		   			['kal', '86_300', 500, 1000, 0.103],
		   				['kal', '86_300', 1000, 1000000, 0.097],
		['kal', '86_gl', 50, 100, 0.137],
		   	['kal', '86_gl', 100, 300, 0.131],
		   		['kal', '86_gl', 300, 500, 0.125],
		   			['kal', '86_gl', 500, 1000, 0.119],
		   				['kal', '86_gl', 1000, 1000000, 0.112],
		['kal', '86_mat', 50, 100, 0.146],
		   	['kal', '86_mat', 100, 300, 0.140],
		   		['kal', '86_mat', 300, 500, 0.134],
		   			['kal', '86_mat', 500, 1000, 0.128],
		   				['kal', '86_mat', 1000, 1000000, 0.122],
		['kal', '100_300', 50, 100, 0.152],
		   	['kal', '100_300', 100, 300, 0.144],
		   		['kal', '100_300', 300, 500, 0.138],
		   			['kal', '100_300', 500, 1000, 0.131],
		   				['kal', '100_300', 1000, 1000000, 0.126],
		['kal', '100_gl', 50, 100, 0.171],
		   	['kal', '100_gl', 100, 300, 0.163],
		   		['kal', '100_gl', 300, 500, 0.157],
		   			['kal', '100_gl', 500, 1000, 0.150],
		   				['kal', '100_gl', 1000, 1000000, 0.145],
		['kal', '100_mat', 50, 100, 0.183],
		   	['kal', '100_mat', 100, 300, 0.175],
		   		['kal', '100_mat', 300, 500, 0.168],
		   			['kal', '100_mat', 500, 1000, 0.162],
		   				['kal', '100_mat', 1000, 1000000, 0.157]
						

		   ];




function selProd()
{
	var prod = document.getElementById("k_production").value;
	
	if (prod == 'viz')
		{
			document.getElementById("k_paper").innerHTML = "<option selected=\"selected\" value=\"no_val\">Тип бумаги и формат ...</option><option value=\"bw_1\">Черно-белая односторонняя</option><option value=\"bw_2\">Черно-белая двухсторонняя</option><option value=\"col_1\">Полноцветная односторонняя</option><option value=\"col_2\">Полноцветная двухсторонняя</option>";
		}
		else if (prod == 'bukl')
		{
			document.getElementById("k_paper").innerHTML = "<option selected=\"selected\" value=\"no_val\">Тип бумаги и формат ...</option><option value=\"A5_115\">А5, 115г/м, полноцвет. двухсторонняя</option><option value=\"A5_135\">А5, 135г/м, полноцвет. двухсторонняя</option><option value=\"A4_115\">А4, 115г/м, полноцвет. двухсторонняя</option><option value=\"A4_135\">А4, 135г/м, полноцвет. двухсторонняя</option>";
		}
		else if (prod == 'otkr')
		{
			document.getElementById("k_paper").innerHTML = "<option selected=\"selected\" value=\"no_val\">Тип бумаги и формат ...</option><option value=\"col_1\">Полноцветная одностороняя</option><option value=\"col_2\">Полноцветная двухсторонняя</option>";
		}
		else if (prod == 'kal')
		{
			document.getElementById("k_paper").innerHTML = "<option selected=\"selected\" value=\"no_val\">Тип бумаги и формат ...</option><option value=\"86_300\">86х54мм, 300г/м</option><option value=\"86_gl\">86х54мм, глянцевая ламинация</option><option value=\"86_mat\">86х54мм, матовая ламинация</option><option value=\"100_300\">100х70мм, 300г/м</option><option value=\"100_gl\">100х70мм, глянцевая ламинация</option><option value=\"100_mat\">100х70мм, матовая ламинация</option>";
		}
		else
		{
			document.getElementById("k_paper").innerHTML = "<option selected=\"selected\" value=\"no_val\">Тип бумаги и формат ...</option>";
		}
}

function countPrice()
{
	var prod = document.getElementById("k_production").value;
	var paper = document.getElementById("k_paper").value;
	var kol = document.getElementById("k_kol").value;
	if(prod == 'no_val')
	{
		alert("Выберите тип продукции.");
	}
	else if(paper == 'no_val')
	{
		alert("Выберите тип бумаги и формат.");
	}
	else if(kol == 'Количество ...')
	{
		alert("Введите количество продукции.");
	}
	else if(!kol.match(/^\d+$/))
	{
		alert("В поле \"Количество\" должны быть только цифры.");
	}
	else
	{
		var flag=0;
		for(var i=0; i<arr.length; i++)
			{
				if((arr[i][0]==prod) && (arr[i][1]==paper) && (arr[i][2]<=kol) && (kol<arr[i][3]))
					{
						var r = kol*arr[i][4];
						document.getElementById("k_rez").innerHTML = (kol*arr[i][4]).toFixed(2) ;
						flag = 1;
					}
			}
		if(flag == 0){alert("Введите большее количество!");}
	}
}


