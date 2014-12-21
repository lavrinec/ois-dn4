
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}
$(document).ready(function(){
  napredek(0);
    $('.menu a.item')
      .on('click', function() {
        if(!$(this).hasClass('dropdown')) {
          $(this)
            .addClass('active')
            .closest('.ui.menu')
            .find('.item')
              .not($(this))
              .removeClass('active')
          ;
        }
      })
    ;
	$("#pregled").click(function(){
		$(".pregled").show();
		$(".seznam").show();
		$(".dodajBolnika").hide();
		$(".dodajMeritev").hide();
		$(".najdiZdravnika").hide();
		$("#napakaa").hide();
		$("#opozorilo").hide();
		$("#opravljeno").hide();
	});
	$("#dodajBolnika").click(function(){
		$(".pregled").hide();
		$(".seznam").hide();
		$(".dodajBolnika").show();
		$(".dodajMeritev").hide();
		$(".najdiZdravnika").hide();
		$("#napakaa").hide();
		$("#opozorilo").hide();
		$("#opravljeno").hide();
	});
	$("#dodajMeritev").click(function(){
		$(".pregled").hide();
		$(".seznam").show();
		$(".dodajBolnika").hide();
		$(".dodajMeritev").show();
		$(".najdiZdravnika").hide();
		$("#napakaa").hide();
		$("#opozorilo").hide();
		$("#opravljeno").hide();
	});
	$("#najdiZdravnika").click(function(){
		$(".pregled").hide();
		$(".seznam").hide();
		$(".dodajBolnika").hide();
		$(".dodajMeritev").hide();
		$(".najdiZdravnika").show();
		$("#napakaa").hide();
		$("#opozorilo").hide();
		$("#opravljeno").hide();
	});
	$('.ui.dropdown').dropdown();
	showUser('5ed818e4-82d0-481d-b838-bf45f8db7082');
	napredek(100);
$("#potrdi").click(function(){
napredek(5);
sessionId=getSessionId();
var ime=$("#ime").val();
var priimek=$("#priimek").val();
var datum=$("#datum").val();
var ehrr;
$.ajaxSetup({
    headers: {
        "Ehr-Session": sessionId
    }
});
napredek(30);
$.ajax({
    url: baseUrl + "/ehr",
    type: 'POST',
    success: function (data) {
        var ehrId = data.ehrId;
		ehrr=ehrId;
        $(".headerer").html("EHR: " + ehrId);
napredek(60);
        // build party data
        var partyData = {
            firstNames: ime,
            lastNames: priimek,
            dateOfBirth: datum,
            partyAdditionalInfo: [{
                key: "ehrId",
                value: ehrId
            }]
        };
		napredek(75);
        $.ajax({
            url: baseUrl + "/demographics/party",
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(partyData),
            success: function (party) {
                if (party.action == 'CREATE') {
                    $(".resultat").html("Narejeno: " + party.meta.href);
					$("#napakaa").hide();
					$("#opravljeno").show();
					$("#ime").val('');
					$("#priimek").val('');
					$("#datum").val('');
					$("#seznamBolnikov").append('<option class="item" value="'+ehrr+'">'+ime+' '+priimek+'</option>');
					$(".menu:not(.ui)").append('<div class="item" data-value="'+ehrr+'">'+ime+' '+priimek+'</div>');
					napredek(100);
                } else{
					$(".resultat").html(party.action+": " + party.meta.href);
					$("#napakaa").show();
					$("#opravljeno").hide();
					napredek(98);
				}
            },
		    error: function(err) {
				$(".resultat").html(JSON.parse(err.responseText).userMessage);
				$("#napakaa").show();
				$("#opravljeno").hide();
				napredek(99);
			}
        });
    }
});
});
$("#najdi").click(function(){
$("#nakladanje").show();
$.ajaxPrefilter(function(options) {
  if(options.crossDomain && jQuery.support.cors) {
    var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');
    options.url = http + '//cors-anywhere.herokuapp.com/' + options.url;
    //options.url = "http://cors.corsproxy.io/url=" + options.url;
  }
});
$.get(
    'http://www.zdravniskazbornica.si/iskalnik/iskalnik.aspx?priimek='+$("#priimekZdravnika").val()+'&licencaId='+$("#DdlSpecialnost").val(),
    function(response) {
        $(response).find("#tblEmpty").each(function(){
			$(rezultatiIskanja).html(this);
		});
		 $(response).find("#LvZdravniki_groupPlaceholderContainer").each(function(){
			$(rezultatiIskanja).html(this);
		});
		$("#nakladanje").hide();
});
});
$("#shraniMeritev").click(function(){
napredek(1);
sessionId=getSessionId();
$.ajaxSetup({
    headers: {
        "Ehr-Session": sessionId
    }
});
napredek(15);
var compositionData = {
    "ctx/time": $("#datumMeritve").val(),
    "ctx/language": "en",
    "ctx/territory": "CA",
    "vital_signs/body_temperature/any_event/temperature|magnitude": $("#temp").val(),
    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
    "vital_signs/blood_pressure/any_event/systolic": $("#visoki").val(),
    "vital_signs/blood_pressure/any_event/diastolic": $("#niski").val(),
    "vital_signs/height_length/any_event/body_height_length": $("#visina").val(),
    "vital_signs/body_weight/any_event/body_weight": $("#teza").val(),
	"vital_signs/indirect_oximetry:0/spo2|numerator": $("#nasicenost").val()
};
napredek(42);
var ehrId=$("#seznamBolnikov").val();
var queryParams = {
    "ehrId": ehrId,
    templateId: 'Vital Signs',
    format: 'FLAT',
    committer: $("#merilec").val()
};
napredek(71);
$.ajax({
    url: baseUrl + "/composition?" + $.param(queryParams),
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(compositionData),
    success: function (party) {
					$(".resultat").html("Shranjeno: " + party.meta.href);
					$("#napakaa").hide();
					$("#opravljeno").show();
					$(".headerer").html("EHR: " + ehrId);
					napredek(100);
            },
		    error: function(err) {
				$(".resultat").html(JSON.parse(err.responseText).userMessage);
				$("#napakaa").show();
				$("#opravljeno").hide();
				napredek(99);
			}
});
});
  });
function showUser(ehrId) {
napredek(5);
$("#krvnaSlika").hide();
$("#opozorila").html("");
$("#opozorilo").hide();
$("#celiakija").hide();
sessionId=getSessionId();
$.ajaxSetup({
    headers: {
        "Ehr-Session": sessionId
    }
});
napredek(15);
$.ajax({
    url: baseUrl + "/view/" + ehrId + "/body_temperature",
    type: 'GET',
    success: function (res) {
	var table=[],podatki=[];
	for (var i in res) {
		table[i]=res[i].time.substring(0, 10);
		podatki[i]=res[i].temperature;
		if(podatki[i]>37.5){
			$("#opozorila").append("Visoka vrocina dne: "+table[i]+"<br>");
			$("#opozorilo").show();
		}
	}
		if (res.length > 0) {
		$("#prvii").show();
			var barChartData = {
		labels : table,
		datasets : [
			{
				fillColor : "rgba(220,220,220,0.35)",
				strokeColor : "rgba(151,187,205,0.36)",
				highlightFill : "rgba(180,187,180,0.37)",
				highlightStroke : "rgba(151,187,205,1)",
				data : podatki
			}
		]

	}
			var ctx = document.getElementById("prvi").getContext("2d");
		window.myBar = new Chart(ctx).Bar(barChartData, {
			responsive : true,
			scaleBeginAtZero : false,
			scaleStartValue : 34
		});
    }else{
		$("#prvii").hide();
	}}
		});
		napredek(30);
		$.ajax({
    url: baseUrl + "/view/" + ehrId + "/blood_pressure",
    type: 'GET',
    success: function (res) {
	var table=[],podatki=[];
	for (var i in res) {
		table[i]=res[i].time.substring(0, 10);
		podatki[i]=res[i].systolic;
		if(podatki[i]>145){
			$("#opozorila").append("Visok sintokticni krvni tlak dne: "+table[i]+"<br>");
			$("#opozorilo").show();
		}
		if(podatki[i]<105){
			$("#opozorila").append("Nizek sintokticni krvni tlak dne: "+table[i]+"<br>");
			$("#opozorilo").show();
		}
	}
		if (res.length > 0) {
		$("#drugii").show();
			var barChartData = {
		labels : table,
		datasets : [
			{
				fillColor : "rgba(220,220,220,0.35)",
				strokeColor : "rgba(151,187,205,0.36)",
				highlightFill : "rgba(180,187,180,0.37)",
				highlightStroke : "rgba(151,187,205,1)",
				data : podatki
			}
		]

	}
			var ctx = document.getElementById("drugi").getContext("2d");
		window.myBar = new Chart(ctx).Bar(barChartData, {
			responsive : true,
			scaleBeginAtZero : false,
		});
    }else{
		$("#drugii").hide();
	}}
		});
		napredek(53);
		$.ajax({
    url: baseUrl + "/view/" + ehrId + "/blood_pressure",
    type: 'GET',
    success: function (res) {
	var table=[],podatki=[];
	for (var i in res) {
		table[i]=res[i].time.substring(0, 10);
		podatki[i]=res[i].diastolic;
		if(podatki[i]>95){
			$("#opozorila").append("Visok disokticni krvni tlak dne: "+table[i]+"<br>");
			$("#opozorilo").show();
		}
		if(podatki[i]<55){
			$("#opozorila").append("Nizek disokticni krvni tlak dne: "+table[i]+"<br>");
			$("#opozorilo").show();
		}
	}
		if (res.length > 0) {
		$("#tretjii").show();
			var barChartData = {
		labels : table,
		datasets : [
			{
				fillColor : "rgba(220,220,220,0.35)",
				strokeColor : "rgba(151,187,205,0.36)",
				highlightFill : "rgba(180,187,180,0.37)",
				highlightStroke : "rgba(151,187,205,1)",
				data : podatki
			}
		]

	}
			var ctx = document.getElementById("tretji").getContext("2d");
		window.myBar = new Chart(ctx).Bar(barChartData, {
			responsive : true,
			scaleBeginAtZero : false
		});
    }else{
		$("#tretjii").hide();
	}}
		});
		napredek(74);
		var aql = "SELECT " +
    "c/context/start_time as time " +
    "FROM EHR[ehr_id/value = '" + ehrId + "'] CONTAINS COMPOSITION c ";
$.ajax({
    url: baseUrl + "/query?" + $.param({"aql": aql}),
    type: 'GET',
    success: function (res) {
        var rows = res.resultSet;
		$("#aql").html("Vseh vnosov za to osebo je: "+rows.length+"<br>");
    },
	error: function(err) {
				$(".resultat").html(JSON.parse(err.responseText).userMessage);
				$("#napakaa").show();
				$("#opravljeno").hide();
			}
});
napredek(80);
var indeksi=[], visine=[], datumi=[],datum,postavitev=0,uporabni=[];
$.ajax({
    url: baseUrl + "/view/" + ehrId + "/height",
    type: 'GET',
    success: function (res) {
	for (var i in res) {
		datum=res[i].time;
		visine[datum]=res[i].height;
		datumi[i]=datum;
	}
	$.ajax({
    url: baseUrl + "/view/" + ehrId + "/weight",
    type: 'GET',
    success: function (ress) {
	for (var i in ress) {
		datum=ress[i].time;
		if(visine[datum]>30&&visine[datum]<280){
			//$("#aql").append(""+visine[datum]+"<br><br>");
			indeksi[postavitev]=ress[i].weight/(visine[datum]*visine[datum]/10000);
			uporabni[postavitev]=datum.toString().substring(0, 10);
			//$("#aql").append(""+indeksi[postavitev]+"<br><br>");
			if(indeksi[postavitev]<18.5){
				$("#opozorila").append("Podhranjenost dne: "+uporabni[postavitev]+"<br>");
				$("#opozorilo").show();
			}
			else if(indeksi[postavitev]>40){
				$("#opozorila").append("Ekstremna debelost dne: "+uporabni[postavitev]+"<br>");
				$("#opozorilo").show();
			}
			else if(indeksi[postavitev]>30){
				$("#opozorila").append("Debelost dne: "+uporabni[postavitev]+"<br>");
				$("#opozorilo").show();
			}
			else if(indeksi[postavitev]>25){
				$("#opozorila").append("Prekomerna telesna teza dne: "+uporabni[postavitev]+"<br>");
				$("#opozorilo").show();
			}
			postavitev++;
			//$("#aql").append("Vseh "+postavitev+" vnosov za "+uporabni[postavitev-1]+": "+indeksi[postavitev-1]+"<br><br>");
		}
	}
	if (uporabni.length > 0) {
	//$("#aql").append("BLABLA<br><br>");
	$("#cetrtii").show();
			var barChartData = {
		labels : uporabni,
		datasets : [
			{
				fillColor : "rgba(220,220,220,0.35)",
				strokeColor : "rgba(151,187,205,0.36)",
				highlightFill : "rgba(180,187,180,0.37)",
				highlightStroke : "rgba(151,187,205,1)",
				data : indeksi
			}
		]

	}
			var ctx = document.getElementById("cetrti").getContext("2d");
		window.myBar = new Chart(ctx).Bar(barChartData, {
			responsive : true,
			scaleBeginAtZero : false,
			scaleStartValue : 15
		});
    }else{
		$("#cetrtii").hide();
	}
    }});
    }
	});
	var kri;
	napredek(100);
	var datoteka = new XMLHttpRequest();
datoteka.open("GET", "kri/"+ehrId+".txt", true);
datoteka.onreadystatechange = function (){
    if(datoteka.readyState === 4){
		$("#krvnaSlika").show();
        kri = datoteka.responseText.split('\n');
		$("#prva").html(kri[0]);
		if(kri[0]<4||kri[0]>10)
			document.getElementById("prva").style.color = "#ff0000";
		else
			document.getElementById("prva").style.color = "#00FF00";
		$("#druga").html(kri[1]);
		if(kri[1]<4.5||kri[1]>5.9)
			document.getElementById("druga").style.color = "#ff0000";
		else
			document.getElementById("druga").style.color = "#00FF00";
		$("#tretja").html(kri[2]);
		if(kri[2]<140||kri[2]>340)
			document.getElementById("tretja").style.color = "#ff0000";
		else
			document.getElementById("tretja").style.color = "#00FF00";
		$("#cetrta").html(kri[3]);
		if(kri[2]<140||kri[2]>175)
			document.getElementById("cetrta").style.color = "#ff0000";
		else
			document.getElementById("cetrta").style.color = "#00FF00";
		if(kri[4]==0){
			$("#peta").html("Negativno");
			document.getElementById("peta").style.color = "#00FF00";
		}
		else{
			$("#peta").html("Pozitivno");
			document.getElementById("peta").style.color = "#ff0000";
			if(kri[2]<140||kri[2]>175)
				$("#celiakija").show();
		}
		$("#sesta").html(kri[5]);
		if(kri[5]>9)
			document.getElementById("sesta").style.color = "#ff0000";
		else
			document.getElementById("sesta").style.color = "#00FF00";
    }
}
datoteka.send();

		
		
}
function napredek(str) {
$('#napredek').progress({
  percent: str
});
}