	var app = angular.module("Cuecadastro", ['ngAnimate','ngMaterial','ngMdIcons','ngMessages','ui.mask']);
app.controller("MainCtrl",function($scope,$http,$timeout,$mdDialog){
			// VFORM
	{
	$scope.VFORM={};
	$scope.VFORM.init=function(){
		$scope.nicks=["bié","buck","castro","consta","duds","gabriel","gil","henrique","luan","lula","palmares","paty","robin","nenhum desses"];
		//code
		$scope.VFORM.show=true;
	}
	$scope.VFORM.fini=function(){
		$scope.VFORM.show=false;
		//code
	}
	$scope.VFORM.button=function(){
		UD={};
		UD.name=$scope.GLB.sanit.encode($scope.VFORM.name);
		UD.cpf =$scope.GLB.sanit.encode($scope.VFORM.cpf );
		UD.email=$scope.GLB.sanit.encode($scope.VFORM.email);
		UD.nick=$scope.GLB.sanit.encode($scope.VFORM.nick);
		UD.user=$scope.GLB.sanit.encode($scope.VFORM.user);
		UD.pswd=$scope.GLB.sanit.encode($scope.VFORM.pswd);
		console.log(UD);
		server_action("newUser",{"data":UD},function(res){
			//$scope.GRID.init();
			if(res=="OK"){
				alert=$mdDialog.alert({title:'Sucesso',textContent:'Seus dados estarão sujeitos a aprovação.',ok:'ok'});
				$mdDialog.show(alert).finally(function(){alert=undefined;window.location="http://www.students.ic.unicamp.br/~ra139270/cueca";});
			}else{
				$scope.GLB.modal.alert("Nome já escolhido","Alguém já escolheu esse nome. Para evitar confusão, por favor escolha outro.");
			}
		});
		
	}
	$scope.VFORM.button_server=function(){
		$scope.VFORM.name="wawa";
		$scope.VFORM.button();
	}
	}
	
	var server_action=function(operation,args,CB){
		NProgress.start();
		$.post("https://sql2.students.ic.unicamp.br/~ra139270/cueca/apps/cadastro/src/php/server.php",
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
				console.log(data);console.log(status);console.log(headers);console.log(config);
				console.log("error();");
			});
	};
	
		// INIT
	{
		$scope.GLB={};
		$scope.GLB.toLocaleDateString=function(val){var dt=Date.parse(val);return dt.toLocaleDateString();}
		$scope.GLB.sanit={};
		$scope.GLB.sanit.encode=function(str){return window.btoa(unescape(encodeURIComponent(str)));}
		$scope.GLB.sanit.decode=function(str){return decodeURIComponent(escape(window.atob(str)));}
		
		$scope.validaCPF=function(cpf){
			//console.log(cpf);
			if(cpf==undefined)return false;
			cpf=cpf.replace(/[^\d]+/g,'');
			if(cpf.length!=11||
				cpf=="00000000000"||cpf=="11111111111"||
				cpf=="22222222222"||cpf=="33333333333"||
				cpf=="44444444444"||cpf=="55555555555"||
				cpf=="66666666666"||cpf=="77777777777"||
				cpf=="88888888888"||cpf=="99999999999")
				return false;
			// 1o digito
			add=0;
			for(i=0;i<9;i++)add+=parseInt(cpf.charAt(i))*(10-i);
			rev=11-(add%11);
			if(rev==10||rev==11)rev=0;
			if(rev!=parseInt(cpf.charAt(9)))return false;
			// 2o digito
			add=0;
			for(i=0;i<10;i++)add+=parseInt(cpf.charAt(i))*(11-i);
			rev=11-(add%11);
			if(rev==10||rev==11)rev=0;
			if(rev!=parseInt(cpf.charAt(10)))return false;
			return true;
		}
		
		$scope.VFORM.init();
	}
}).config(function($mdThemingProvider){$mdThemingProvider.theme('docs-dark','default').primaryPalette('yellow').dark();});

app.directive('img', function () {
    return {
        restrict: 'E',        
        link: function (scope, element, attrs) {     
            // show an image-missing image
            element.error(function () {
                var w = element.width();
                var h = element.height();
                // using 20 here because it seems even a missing image will have ~18px width 
                // after this error function has been called
                if (w <= 160) { w = 160; }
                if (h <= 160) { h = 160; }
                var url = 'http://placehold.it/' + w + 'x' + h + '/cccccc/ffffff&text=Sem imagem';
                element.prop('src', url);
                element.css('border', 'double 3px #cccccc');
            });
        }
    }
});

