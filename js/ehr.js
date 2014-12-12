
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
$(document)
  .ready(function(){
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
		$("#opravljeno").hide();
	});
	$("#dodajBolnika").click(function(){
		$(".pregled").hide();
		$(".seznam").hide();
		$(".dodajBolnika").show();
		$(".dodajMeritev").hide();
		$(".najdiZdravnika").hide();
		$("#napakaa").hide();
		$("#opravljeno").hide();
	});
	$("#dodajMeritev").click(function(){
		$(".pregled").hide();
		$(".seznam").show();
		$(".dodajBolnika").hide();
		$(".dodajMeritev").show();
		$(".najdiZdravnika").hide();
		$("#napakaa").hide();
		$("#opravljeno").hide();
	});
	$("#najdiZdravnika").click(function(){
		$(".pregled").hide();
		$(".seznam").hide();
		$(".dodajBolnika").hide();
		$(".dodajMeritev").hide();
		$(".najdiZdravnika").show();
		$("#napakaa").hide();
		$("#opravljeno").hide();
	});
	$('.ui.dropdown').dropdown();
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
function showUser(str) {
napredek(99);
}
function napredek(str) {
$('#napredek').progress({
  percent: str
});
}