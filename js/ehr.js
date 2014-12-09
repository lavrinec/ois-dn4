
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
  $('#napredek').progress({
  percent: 0
});
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
		$(".dodajBolnika").hide();
		$(".dodajMeritev").hide();
	});
	$("#dodajBolnika").click(function(){
		$(".pregled").hide();
		$(".dodajBolnika").show();
		$(".dodajMeritev").hide();
	});
	$("#dodajMeritev").click(function(){
		$(".pregled").hide();
		$(".dodajBolnika").hide();
		$(".dodajMeritev").show();
	});
	$('.ui.dropdown')
      .dropdown()
    ;
	$('#napredek').progress({
  percent: 100
});
$("#potrdi").click(function(){
$('#napredek').progress({
  percent: 1
});
sessionId=getSessionId();
var ime=$("#ime").val();
var priimek=$("#priimek").val();
var datum=$("#datum").val();
$('#napredek').progress({
  percent: 15
});
$.ajaxSetup({
    headers: {
        "Ehr-Session": sessionId
    }
});
$('#napredek').progress({
  percent: 30
});
$.ajax({
    url: baseUrl + "/ehr",
    type: 'POST',
    success: function (data) {
        var ehrId = data.ehrId;
        $(".headerer").html("EHR: " + ehrId);
$('#napredek').progress({
  percent: 60
});
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
		$('#napredek').progress({
  percent: 75
});
        $.ajax({
            url: baseUrl + "/demographics/party",
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(partyData),
            success: function (party) {
                if (party.action == 'CREATE') {
                    $(".resultat").html("Created: " + party.meta.href);
					$("#napakaa").hide();
					$("#opravljeno").show();
					$('#napredek').progress({
  percent: 100
});
                } else{
					$(".resultat").html(party.action+": " + party.meta.href);
					$("#napakaa").show();
					$("#opravljeno").hide();
					$('#napredek').progress({
  percent: 98
});
				}
            },
		    error: function(err) {
				$(".resultat").html(JSON.parse(err.responseText).userMessage);
				$("#napakaa").show();
				$("#opravljeno").hide();
				$('#napredek').progress({
  percent: 99
});
			}
        });
    }
});
});
  });