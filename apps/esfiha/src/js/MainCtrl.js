var app = angular.module("EsfihaApp", ['ui.bootstrap', 'ngAnimate']);
app.controller("MainCtrl", function($scope,$http,$timeout,$window,$interval){
	
		// PICK
	{
	$scope.PICK = {};
	$scope.PICK.choice = [];
	$scope.PICK.keep = false;
	$scope.PICK.init=function(){
		$scope.PICK.choice=Array.apply(null, new Array($scope.GLB.Flavors.length)).map(function(){return 0});
		$scope.PICK.name="";
		$scope.PICK.show=true;
	}
	$scope.PICK.fini=function(){
		$scope.PICK.show=false;
	}
	$scope.PICK.button=function(keep){
		/*if(EASTEREGG.subsequence("RBN",$scope.PICK.name.toUpperCase())){alert("Plágio detectado!");}
		if(EASTEREGG.Regex_rbn.test($scope.PICK.name)){alert("Plágio detectado!");}
		if(EASTEREGG.Regex_cto.test($scope.PICK.name)){
			var cto_ped=$scope.PICK.totalMoney($scope.PICK.choice);
			alert($scope.GLB.toReal(cto_ped)+" em esfihas?! Sua dívida poderia ser de só "+
				$scope.GLB.toReal(8500-cto_ped)+" agora.");}*/
		$scope.PICK.keep=keep;
		$scope.PICK.fini();
		$scope.GRUP.init();
	}
	$scope.PICK.totalMoney=function(pdd){
		var sum=0;for(var j=2; j<$scope.GLB.Flavors.length; ++j){
			pdd[j]=parseInt(pdd[j]);if(isNaN(pdd[j])){pdd[j]=0;}
			sum+=((pdd[j])*$scope.GLB.Flavors[j].Preco);
		}
		var sPcF=$scope.PICK.choice[1];
		sPcF=Math.floor(parseFloat(sPcF)*100);if(isNaN(sPcF)){sPcF=0;}
		return (sum+sPcF);
	}
	$scope.PICK.totalQuantity=function(pdd){
		var sum=0;for(var j=2; j<$scope.GLB.Flavors.length; ++j){
			pdd[j]=parseInt(pdd[j]);if(isNaN(pdd[j])){pdd[j]=0;}
			sum+=((pdd[j]));
		}return sum;
	}
	}
	
		// GRUP
	{
	$scope.GRUP = {};
	$scope.GRUP.hasgroup=false;
	$scope.GRUP.init=function(){
		if($scope.GRUP.hasgroup && $scope.PICK.keep){$scope.GRUP.store();return;}
		$scope.GRUP.hasgroup=false;
		//$scope.GRUP.mygroup=-1;
		DB_action("getGroups",{},function(res){
			$scope.GRUP.list=[];
			if(res.length==0 && $scope.PICK.keep){
				$scope.GRUP.newGroup();
			}
			else{
				$scope.GRUP.list=res;
				$scope.GRUP.show=true;
			}
		});
	}
	$scope.GRUP.fini=function(){
		$scope.GRUP.show=false;
	}
	
	$scope.GRUP.newGroup=function(){
		DB_action("criaGrupo",{},function(res){
			$scope.GRUP.mygroup=res;
			$scope.GRUP.store();
		});
	}
	
	$scope.GRUP.store=function(){
		$scope.GRUP.fini();
		$scope.PICK.choice[1] *= 100;
		$scope.GRUP.show=false;
		$scope.GRUP.hasgroup=true;
		if($scope.PICK.keep){
			DB_action("fazPedido",{"grupo":$scope.GRUP.mygroup,"usern":$scope.PICK.name,"pedid":$scope.PICK.choice},function(res){
				$scope.GRID.init();
			});
			$scope.PICK.keep=false;
		}
		else{$scope.GRID.init();}
	}
	}
	
		// GRID
	{
	$scope.GRID={}
	$scope.GRID.grid=[];
	$scope.GRID.totl={};
	$scope.GRID.numPedintesValidos=0;
	$scope.GRID.taxa=300;
	var GRID_pooling=false;
	var GRID_promiseEsf;
	var GRID_ts=0;
	$scope.GRID.init=function(){
		GRID_check();
		if(!GRID_pooling){GRID_pooling=true;
			GRID_promiseEsf=$interval(GRID_check, 5000);
		}
		$scope.GRID.show=true;
	}
	$scope.GRID.fini=function(){
		$scope.GRID.show=false;
		$interval.cancel(GRID_promiseEsf);
		GRID_pooling=false;
	}
	
	var GRID_check=function(){
		//console.log("condGet")
		//console.log($scope.GRUP.mygroup);
		//console.log(GRID_ts);
		
		DB_action("condGet",{"grupo":$scope.GRUP.mygroup,"myTS":GRID_ts},function(res){
			if(res!="OK"){
				GRID_ts=res.newTS;
				TSG={};
				TSG.grid=[];
				TSG.totl={};
				TSG.grid=res.newGrid;
				TSG.totl.choice=Array.apply(null, new Array($scope.GLB.Flavors.length)).map(function(){return 0});
				TSG.totl.totalMoney=0;
				TSG.totl.totalQuantity=0;
				TSG.numPedintesValidos=0;
				TSG.totl.extra=[];
				for(var i=0; i<TSG.grid.length; i++){
					var G= (JSON.parse(JSON.stringify(TSG.grid[i])));
					delete G.Grupo;delete G.Usuario;delete G.TimeStamp;delete G.UTS;delete G.Valid;
					delete G.Exn;delete G.Exp;
					var sGgi = TSG.grid[i];
					delete sGgi.E1;delete sGgi.E2;delete sGgi.E3;delete sGgi.E4;delete sGgi.E5;
					delete sGgi.E6;delete sGgi.E7;delete sGgi.E8;delete sGgi.E9;delete sGgi.E10;
					delete sGgi.E11;delete sGgi.E12;delete sGgi.E13;delete sGgi.E14;delete sGgi.E15;
					delete sGgi.E16;delete sGgi.E17;delete sGgi.E18;
					/*#SCALABILITY#*/
					
					sGgi.Exp=parseInt(sGgi.Exp);if(isNaN(sGgi.Exp)){sGgi.Exp=0;}
					sGgi.Valid=(sGgi.Valid=="1");
					G=[0,0].concat($.map(G,function(value,index){return [value];}));
					var sum=0;var qnt=0;for(var j=2; j<$scope.GLB.Flavors.length; ++j){
						G[j]=parseInt(G[j]);if(isNaN(G[j])){G[j]=0;}
						sum+=((G[j])*$scope.GLB.Flavors[j].Preco);
						qnt+=G[j];
					}sum+=TSG.grid[i].Exp;
					TSG.grid[i].choice=G;
					TSG.grid[i].totalMoney=sum;
					TSG.grid[i].totalQuantity=qnt;
					
					if(TSG.grid[i].Valid){
						TSG.numPedintesValidos++;
						TSG.totl.totalMoney+=sum;
						TSG.totl.totalQuantity+=qnt;
						if(TSG.grid[i].Exp)TSG.totl.extra.push({n:TSG.grid[i].Exn,p:TSG.grid[i].Exp});
						for(var j=2; j<$scope.GLB.Flavors.length; ++j){TSG.totl.choice[j]+=(G[j]);}
					}
				}
				/* Desconto da esfiha de carne eh aplicado no proximo */
				//if(TSG.totl.choice[2]>=10){$scope.GLB.Flavors[2].Preco="120";}
				//else{$scope.GLB.Flavors[2].Preco="180";}
				$scope.GRID.totl=TSG.totl;
				$scope.GRID.numPedintesValidos=TSG.numPedintesValidos;
				$scope.GRID.grid=TSG.grid;
				//console.log($scope.GRID.grid);
			}
		});
	}
	$scope.GRID.toggle=function(grupo,usern,tmstp){
		DB_action("togglaPedido",{"grupo":grupo,"usern":usern,"tmstp":tmstp},function(res){GRID_check();});
	}
	$scope.GRID.button=function(){
		$scope.GRID.fini();
		$scope.PICK.init();
	}
	}
	
	/*$scope.addAlert=function(tp,ms){$scope.alerts.push({type:tp,msg:ms});};
	$scope.closeAlert=function(index){$scope.alerts.splice(index,1);};
	$scope.closeAllAlerts=function(index){$scope.alerts=[];};*/
	
	//$scope.showAdmin=true;
		// VADM - ADMINISTRADOR
	{
	$scope.VADM_sendAction=function(){
		DB_action("condGet",{"grupo":1,"myTS":GRID_ts},function(res){
			console.log("SendAction res:");
			console.log(res);
			if(res!="OK"){
				GRID_ts=res.newTS;
			}
		});
	}
	$scope.VADM_ButtonSend=function(val){$scope.VADM_sendAction();}
	
	//$scope.VADM_query="Insira consulta SQL.";
	$scope.VADM_queryResponse="Resposta aqui";
	$scope.VADM_HumanAnswer="...";
	$scope.VADM_ButtonSend2=function(val){
		$scope.VADM_queryResponse="carregando...";
		DB_query($scope.VADM_query,function(res){
			$scope.VADM_queryResponse=JSON.stringify(res);
			$scope.VADM_HumanAnswer=JsonHuman.format(res);
			$("#VADM_Result").html($scope.VADM_HumanAnswer);
			//$(".jh-type-array").addClass("animated fadeIn") ;
			$(".jh-type-array").addClass("table table-striped table-bordered table-hover") ;
			$(".jh-type-object").addClass("table table-striped table-bordered table-hover") ;
			//jh-type-array jh-root
			//addClass() 
			//console.log(res);
			//console.log($scope.VADM_HumanAnswer);
			//VADM_HumanAnswer | json
		});
	}
	}
	
	/*Examples:
	 * op = "togglaPedido"
	 * args = {"grupo":1,"myTS":37,"usern":"joão","pedid":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],"tmstp":"2015-06-30 03:22:22"}
	 * */
	var DB_action=function(operation,args,CB){
		//console.log("Irei executar a Query:");
		//console.log(Query);
		//console.log("gonna get"); encodedQuery=
		if(!GRID_pooling)NProgress.start();
		$.post("https://sql2.students.ic.unicamp.br/~ra139270/cueca/apps/esfiha/src/php/DB_query.php",
		//$.post("http://www.students.ic.unicamp.br/~ra139270/cueca/apps/esfiha/src/php/DB_query.php",
			{
				op:(encodeURIComponent(operation)),
				args:(encodeURIComponent(JSON.stringify(args))),
			}
			).success(function(response){
				NProgress.done();
				//console.log("DB returned object:");
				//console.log(response)
				//console.log("parsing it became:");
				//console.log(JSON.parse(response));
				CB(JSON.parse(response));
				//console.log("success();");
				$scope.$apply();
			}
			).error(function(data, status, headers, config) {
				NProgress.done();
				console.log(data);
				console.log(status);
				console.log(headers);
				console.log(config);
				console.log("error();");
			});
	};
	
		// INIT
	$scope.PICK.show=false;
	$scope.GRUP.show=false;
	$scope.GRID.show=false;
	$scope.GLB = {};
	$scope.GLB.zeroPad=function(num, places){var zero=places-num.toString().length+1;return Array(+(zero > 0 && zero)).join("0") + num;}
	$scope.GLB.toReal=function(val){return "R$ "+Math.floor(val/100)+","+$scope.GLB.zeroPad(Math.ceil(val)%100,2);}
	
	$scope.GLB.toLocaleTimeString=function(val){
		//console.log("toLocaleTimeString:");
		//console.log("val:");console.log(val);
		var piv = parseInt(val)*1000
		//console.log("piv:");console.log(piv);
		var ndt = new Date(piv);
		//console.log("ndt:");console.log(ndt);
		var lts = ndt.toLocaleTimeString();
		//console.log("lts:");console.log(lts);
		return lts;
	}
	
	//DB_action("getFlavors",{},function(res){$scope.GLB.Flavors=res; $scope.PICK.init();});
	$scope.GLB.Flavors=[
		{"Id_TipoEsfiha":"0","Nome":"Extra","Preco":"0","Doce":"0","Salgado":"0","Vegan":"0","Gliphicon":"star","Color":"#FFA500"},
		{},
		{"Id_TipoEsfiha":"1","Nome":"Carne","Preco":"150","Doce":"0","Salgado":"1","Vegan":"0","Gliphicon":"heart","Color":"#A30085"},
		
		{"Id_TipoEsfiha":"2","Nome":"Bacon","Preco":"250","Doce":"0","Salgado":"1","Vegan":"0","Gliphicon":"heart","Color":"#DE2C2C"},
		{"Id_TipoEsfiha":"3","Nome":"Baur\u00fa","Preco":"250","Doce":"0","Salgado":"1","Vegan":"0","Gliphicon":"heart","Color":"#0FF26D"},
		{"Id_TipoEsfiha":"4","Nome":"Calabresa","Preco":"250","Doce":"0","Salgado":"1","Vegan":"0","Gliphicon":"heart","Color":"#F74825"},
		{"Id_TipoEsfiha":"5","Nome":"F\/Catupiry","Preco":"250","Doce":"0","Salgado":"1","Vegan":"0","Gliphicon":"heart","Color":"#FFFF9C"},
		{"Id_TipoEsfiha":"6","Nome":"Pizza","Preco":"250","Doce":"0","Salgado":"1","Vegan":"1","Gliphicon":"heart","Color":"#FF0000"},
		{"Id_TipoEsfiha":"7","Nome":"Queijo","Preco":"250","Doce":"0","Salgado":"1","Vegan":"1","Gliphicon":"heart","Color":"#FFFF00"},
		{"Id_TipoEsfiha":"8","Nome":"Br\u00f3colis","Preco":"250","Doce":"0","Salgado":"1","Vegan":"1","Gliphicon":"heart","Color":"#006903"},
		{"Id_TipoEsfiha":"9","Nome":"4Queijos","Preco":"250","Doce":"0","Salgado":"1","Vegan":"1","Gliphicon":"heart","Color":"#8F8F00"},
		{"Id_TipoEsfiha":"10","Nome":"Pepperone","Preco":"250","Doce":"0","Salgado":"1","Vegan":"0","Gliphicon":"heart","Color":"#FF70A2"},
		{"Id_TipoEsfiha":"11","Nome":"F\/Cheddar","Preco":"250","Doce":"0","Salgado":"1","Vegan":"0","Gliphicon":"heart","Color":"#FF8000"},
		
		{"Id_TipoEsfiha":"12","Nome":"Banana","Preco":"280","Doce":"1","Salgado":"0","Vegan":"1","Gliphicon":"delicious","Color":"#8CFF00"},
		{"Id_TipoEsfiha":"13","Nome":"Chocolate","Preco":"280","Doce":"1","Salgado":"1","Vegan":"1","Gliphicon":"delicious","Color":"#7B3F00"},
		{"Id_TipoEsfiha":"14","Nome":"Brigadeiro","Preco":"280","Doce":"1","Salgado":"0","Vegan":"1","Gliphicon":"delicious","Color":"#59260B"},
		{"Id_TipoEsfiha":"15","Nome":"Prest\u00edgio","Preco":"280","Doce":"1","Salgado":"0","Vegan":"1","Gliphicon":"delicious","Color":"#EDCBC0"},
		{"Id_TipoEsfiha":"16","Nome":"Romeu&Julieta","Preco":"280","Doce":"1","Salgado":"1","Vegan":"0","Gliphicon":"delicious","Color":"#BF4246"},
		
		{"Id_TipoEsfiha":"17","Nome":"Escarola","Preco":"250","Doce":"0","Salgado":"1","Vegan":"0","Gliphicon":"heart","Color":"#D0D6A9"},
		{"Id_TipoEsfiha":"18","Nome":"Milho","Preco":"250","Doce":"0","Salgado":"1","Vegan":"0","Gliphicon":"heart","Color":"#D9C84D"}
	]/*#SCALABILITY#*/
	
	$scope.PICK.init();
	
		// EASTER EGG
	EASTEREGG = {};
	EASTEREGG.Regex_rbn = /R+ *[O0]* *[B13]+ *[L\|1\[I\]]+ *[NM]* *H* *[O0]* */i;
	EASTEREGG.Regex_cto = /C+ *[AO0]+ *[L\|1\[I\]NM]+ *[O0S5]+ *[T]* *[A]* *[NTINOE]* */i;
	EASTEREGG.subsequence=function(x,y){
		f=true;for(c in x){
			if(y.indexOf(x[c])>-1){y=y.replace(x[c],"");}
			else{f=!f;break;}
		}return f;
	}
});


