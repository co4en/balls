window.addEventListener("load",main,false);//подключаем скрипт

function main() {
	var ctx		= example.getContext("2d");

	var	N;

	var	k		= 1000;   //коэф. жесткости
	var	dt 		= 0.005;

	var	F_x 	= [];
	var	F_y 	= [];

	var F_pres_x = [];
	var	F_pres_y = [];

	var v_y 	= [];
	var v_x 	= [];

	var	x       = [];
	var	y     	= [];

	var l		= 0;

	var s0;

	var errorFlag;

	function init() {
		N 			= document.getElementById("NumberElements").value;
		errorFlag = false;

		var	Radius  = 4;
		var phi 	= 2 * Math.PI / N;

		var start_x_velocity = Number(document.getElementById("xVelocity").value);
		var start_y_velocity = -Number(document.getElementById("yVelocity").value);

		if (Math.abs(start_y_velocity) > 0.5 || Math.abs(start_x_velocity) > 0.5) {
			alert("Введите другое значение");
			errorFlag = true;
			return;
		}

		for (var i = 0; i < N; i++) {
			x.push(Radius * Math.cos(phi * i));
			y.push(Radius * Math.sin(phi * i));
			v_y.push(start_y_velocity);
			v_x.push(start_x_velocity);
			F_pres_x.push(0);
			F_pres_y.push(0);
		}

		l = Math.sqrt(Math.pow((x[1] - x[0]),2) + Math.pow((y[1] - y[0]),2));
		s0 		 = Square();
	}

	function Elastic_forces(k1, k2, k3) {
		var	dl_right;
		var	dl_left;
		var	F_l_y;
		var	F_r_y;

		var	F_l_x;
		var	F_r_x;

		var	cos_l;
		var	cos_r;
		var	sin_l;
		var	sin_r;

		dl_left	= Math.sqrt(Math.pow((x[k2] - x[k1]),2) + Math.pow((y[k2] - y[k1]),2));
		dl_right= Math.sqrt(Math.pow((x[k3] - x[k2]),2) + Math.pow((y[k3] - y[k2]),2));

		cos_l 	= ((y[k2] - y[k1])) / dl_left;
		sin_l 	= ((x[k2] - x[k1])) / dl_left;
		F_l_y 	= -k * (dl_left - l) * cos_l;
		F_l_x 	= -k * (dl_left - l) * sin_l;

		cos_r 	= ((y[k3] - y[k2])) / dl_right;
		sin_r 	= ((x[k3] - x[k2])) / dl_right;
		F_r_y 	= -k * (dl_right - l) * cos_r;
		F_r_x 	= -k * (dl_right - l) * sin_r;

		return [F_l_x, F_l_y, F_r_x, F_r_y];
	}

	function Square() {
		var S1 = 0;
		var S2 = 0;

		for (var i = 0; i < N - 1; i++) {
			S1 += x[i] * y[i+1];
		}

		for (var i = 0; i < N - 1; i++) {
			S2 += x[i+1] * y[i];
		}

		return 1/2 * Math.abs(S1 + x[N-1] * y[0] - S2 - x[0] * y[N-1]);
	}

	function Pressure() {
		var k_pres = -0.005;

		var sq = Square(); //площадь в текущий момент

		var length;
		var normal_x;
		var normal_y;
		var pressureConst = k_pres * (sq / s0 - 1);

		for (var i = 1; i < N; i++) {
			length = Math.sqrt(Math.pow((x[i-1] - x[i]), 2) + Math.pow((y[i-1] - y[i]), 2));

			normal_x = -(y[i-1] - y[i]) / length;
			normal_y = (x[i-1] - x[i]) / length;

			F_pres_x[i] += pressureConst * normal_x;
			F_pres_y[i] += pressureConst * normal_y;
			F_pres_x[i-1] += pressureConst * normal_x;
			F_pres_y[i-1] += pressureConst * normal_y;
		}

		length = Math.sqrt(Math.pow((x[N-1] - x[0]), 2) + Math.pow((y[N-1] - y[0]), 2));

		normal_x = -(y[N-1] - y[0]) / length;
		normal_y = (x[N-1] - x[0]) / length;

		F_pres_x[N-1] += pressureConst * normal_x;
		F_pres_y[N-1] += pressureConst * normal_y;
		F_pres_x[0] += pressureConst * normal_x;
		F_pres_y[0] += pressureConst * normal_y;
	}

	function physics() {
		var F_elast = [];

		F_elast[0] = Elastic_forces(N-1, 0, 1);
		for (var i = 1; i < N - 1; i++) {
			F_elast[i] = Elastic_forces(i-1, i, i+1);
		}
		F_elast[N-1] = Elastic_forces(N - 2, N - 1, 0);

		Pressure();

		for (var i = 0; i < N; i++) {
			F_y[i] = -F_elast[i][3] + F_elast[i][1] + F_pres_y[i] +
				LennardJhones(-9 - y[i]) - LennardJhones(9 - y[i]);
			F_x[i] = F_elast[i][0] - F_elast[i][2] + F_pres_x[i] +
				LennardJhones(-9 - x[i]) - LennardJhones(9 - x[i]);

			v_y[i] += F_y[i] * dt;
			y[i] += v_y[i] * dt;
			v_x[i] += F_x[i] * dt;
			x[i] += v_x[i] * dt;
		}
	}

	function LennardJhones(r) {
		var sigma 	= 0.2;
		var epsilon = 0.5;
		return 4 * epsilon * ((sigma / r) ** 12 - (sigma / r) ** 6);
	}
/*
	function drawLine(xStartPoint, yStartPoint, xEndPoint, yEndPoint) {
		ctx.beginPath();
		ctx.strokeStyle = 'black';
		ctx.moveTo(xStartPoint, yStartPoint);
		ctx.lineTo(xEndPoint, yEndPoint);
		ctx.stroke();
	}
*/
	function draw() {
		ctx.beginPath();
		ctx.fillStyle = 'white';
		ctx.rect(0, 0, 400, 400);
		ctx.fill();

		for (var i = 0; i < N; i++) {
			ctx.beginPath();
			ctx.fillStyle = 'black';
			ctx.arc(200 + x[i] * 20, 200 + y[i] * 20, 2.5, 0, 2*Math.PI);
			ctx.fill();
		}
/*
		for (var i = 0; i < N-1; i++) {
			drawLine(200 + x[i] * 20, 200 + y[i] * 20,
					200 + x[i+1] * 20, 200 + y[i+1] * 20);
		}

		drawLine(200 + x[N-1] * 20, 200 + y[N-1] * 20,
				200 + x[0] * 20, 200 + y[0] * 20);
*/
		drawLine(20, 20, 20, 380);
		drawLine(380, 20, 380, 380);
		drawLine(20, 380, 380, 380);
		drawLine(20, 20, 380, 20);

		physics();
	} 

	var timer;

	function drawOnClick() {
		var flag = document.getElementById("NumberElements").value;
		if (flag == "") {
			alert("Введите число элементов");
		} else {
			if (flag < 20 || flag > 60) {
				alert("Введите число в заданных границах");
			} else {
				init();
				if (errorFlag) {
					return;
				}
				timer = setInterval(draw, 1);
			}
		}
	}

	var startButton = document.getElementById("StartButton");
	var pauseButton = document.getElementById("PauseButton");
	var clearButton = document.getElementById("ClearButton");

	startButton.onclick = drawOnClick;

	function pauseOnClick() {
		clearInterval(timer);		
	}

	pauseButton.onclick = pauseOnClick;

	function clearOnClick() {
		clearInterval(timer);	
		x = [];
		y = [];
		v_x = [];
		v_y = [];
		N = 0;
		F_pres_x = [];
		F_pres_y = [];

		ctx.beginPath();
		ctx.fillStyle = 'white';
		ctx.rect(0, 0, 400, 400);
		ctx.fill();
	}

	clearButton.onclick = clearOnClick;
}