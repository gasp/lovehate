(function($){
	var conf ={},
	apiURL='',
	apiSEARCH = "http://localhost:8989/search.json?q=",
	param='',
	time=10,
	lang='',
	num_harvesting_msg=5,
	destination_element ='tw'
	$.feel = {
		words: {},
		tweets_stack: [],
		words_iterator: 0,
		speed:0, // 0 is slow, 100 is fast
		loverate:500, //0 is hate, 1000 is love 
		tempo:null,
		
		start: function(opt) {
			this.registerVar(opt);
			apiURL = this.createURL(0);
			this.harvest(0);
			setTimeout(function(){$.feel.play();},1000);
		},
		stop: function(){
			window.clearTimeout(this.tempo);
			delete this.tempo;
		},
		registerVar: function(opt){
			lang=opt.lang?opt.lang:"";
			num_harvesting_msg=opt.num_harvesting_msg?opt.num_harvesting_msg:num_harvesting_msg;
			this.words = opt.words;
		},
		createURL: function(wordi){ // wordi is the inc elem from word
			var url = '';
			jlg=lang.length>0?"&lang="+lang:jlg=""; 
			param='&since_id='+this.words[wordi].last_id;
			url=apiSEARCH+this.words[wordi].searchstr+param+jlg;
			url += "&rpp="+num_harvesting_msg;
			return url;
		},
		harvest: function(wordi){
			$.ajax({
				url: this.createURL(wordi),
				type: 'GET',
				dataType: 'jsonp',
				timeout: 1000,
				error: function(){
//					$("#log").append('<div>fail to load#</div>');
				},
				success: function(json){
					console.log('got json', json);
					results_length = json.length;
					$.each(json,function(i,item) {
						$.feel.tweets_stack.push(item);
						if(i>=(results_length-1))
							$.feel.words[wordi].last_id = item.id;
					});
				}
			});
		},
		textFormat: function(texto){
			//make links
			var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
			texto = texto.replace(exp,"<a href='$1' class='extLink' >$1</a>"); 
			var exp = /[\@]+([A-Za-z0-9-_]+)/ig;
			texto = texto.replace(exp,"<a href='http://twitter.com/$1' class='profileLink'>@$1</a>"); 
			// make it bold
			$.each(this.words,function(i,w){
				regExp=eval('/'+'i '+w.label+'/gi');
				newString = new String(' <span class="sp '+w.label+'">'+'i '+w.label+'</span> ');
				texto = texto.replace(regExp, newString);
			});
			return texto;
		},
		play: function(){
			// let's play at different speed depending on the stack
			stacksize = this.tweets_stack.length;
			if(stacksize <5){
				this.speed = 0;//slow
				this.num_harvesting_msg = 15;
			}

			if(stacksize>5){
				this.speed = 10;// rather slow
				this.num_harvesting_msg = 10;
			}

			if(stacksize>15){
				this.speed = 80;// quite fast
				this.num_harvesting_msg = 5;
			}
			if(stacksize>30){
				this.speed = 90;// quite fast
				this.num_harvesting_msg = 1;
			}
			waitingtime = Math.abs((100 - this.speed)*20);
			this.tempo = setTimeout("$.feel.play()",waitingtime);
			//let's harvest
			if(stacksize<40){
				wi=Math.floor(Math.random()*this.words.length);// this could be improved
				while(this.words_iterator==wi){
					wi=Math.floor(Math.random()*this.words.length);
				}
				this.words_iterator = wi;
				this.harvest(wi);
				
			}
			//let's display
			if(stacksize>0){
				this.display(this.tweets_stack.shift());
			}
		},
		display: function(tw){
			console.log(tw);
			// running text
			a = $('<a></a>').attr('href','http://www.twitter.com/'+tw.user.name+'/status/'+tw.id).html(' '+tw.user.name).addClass('u');
			$('<li></li>').html(this.textFormat(tw.text)).append(a).css('margin-left',this.loverate).prependTo('#'+destination_element);
			$('#'+destination_element+' li:nth-child(30)').remove();
			that = this;
			$.each(this.words,function(i,w){
				var exp = eval('/'+w.label+'/ig');
				if(tw.text.match(exp)){
					that.loverate += (w.value);
				}
			});
			if(that.loverate>1000)that.loverate=900;
			if(that.loverate<0)that.loverate=10;
			$('#cursor').css('left',(that.loverate));
		}
	}
}
)(jQuery);