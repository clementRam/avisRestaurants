"use strict";
var data = [];
var dYelp = [];
var yelpToken = [];
var allResto = [];
var restoListe = [];
var filtreNote = [];
var newMarker = {};
var id = 0;
var infowindowOpen = 0;
var loc = {
    latitude: 0,
    longitude: 0
};
var userLoc = {
    latitude: 0,
    longitude: 0
};
var valSearch = "";
var geocoder;
var map;

$("#slide2").hide();

//Géolocalisation de l'utilisateur 
var options = {
    enableHighAccuracy: true,
    timeout: 8000,
    maximumAge: 0
};

function success(pos) {
    loc.latitude = pos.coords.latitude;
    loc.longitude = pos.coords.longitude;
    userLoc.latitude = pos.coords.latitude;
    userLoc.longitude = pos.coords.longitude;
    init();
}

function error(err) {
    console.warn('ERROR ' + err.code + ':' + err.message);
    alert("Erreur géolocalisation: " + err.message + ". Position par défaut: Bordeaux");
    loc.latitude = 44.8404400;
    loc.longitude = -0.5805000;
    userLoc.latitude = 44.8404400;
    userLoc.longitude = -0.5805000;
    init();
}
navigator.geolocation.getCurrentPosition(success, error, options);

//Ajax, recupere les restaurants de restaurants.json
$.getJSON('json/restaurants.json', function(d) {
    allResto = [];
    allResto = d;
});


//Token yelp API
// function getYelp() {
//     $.post("yelpToken.php").done(function(response) {
//         yelpToken = JSON.parse(response);
//         getRestoYelp();
//     });
// }

//requete sur l'api yelp pour stocker les données dans data 
function getRestoYelp() {
    $.post("yelp.php", { accessToken: yelpToken.access_token, tokenType: yelpToken.token_type, lat: loc.latitude, long: loc.longitude }).done(function(donnees) {
        dYelp = JSON.parse(donnees);
        for (var i = 0; i < dYelp.businesses.length; i++) {
            var restoYelp = {
                restaurantName: dYelp.businesses[i].name + "<img src='img/yelp_icon.png' class='logo-yelp'>",
                address: dYelp.businesses[i].location.display_address[0] + " " + dYelp.businesses[i].location.display_address[1],
                lat: dYelp.businesses[i].coordinates.latitude,
                long: dYelp.businesses[i].coordinates.longitude,
                moyenne: [dYelp.businesses[i].rating],
                streetView: "<img src=" + dYelp.businesses[i].image_url + ">",
                ratings: []
            };
            data.push(restoYelp);
        }
        initMap(data);
        moyenneStars(data);
        displayAllResto(data);
    });
}

//requete sur le fichier json pour stocker les données dans data
function reqJson() {
    for (var i = 0; i < allResto.length; i++) {
        if (allResto[i].lat < loc.latitude + 0.1 && allResto[i].lat > loc.latitude - 0.1 && allResto[i].long < loc.longitude + 0.01 && allResto[i].long > loc.longitude - 0.1) {
            data.push(allResto[i]);
        }
    }
}
// fonction principale 
function init() {
    data = [];
    // getYelp();
    getRestoYelp();
    reqJson();
    initMoyenne(data);
    moyenneStars(data);
    initMap(data);
    imgStreetView(data);
    displayAllResto(data);
}

function initMap(data) {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: loc.latitude,
            lng: loc.longitude
        },
        zoom: 14
    });
    geocoder = new google.maps.Geocoder();

    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
    }

    for (var i = 0; i < data.length; i++) {
        var myLatlng = new google.maps.LatLng(data[i].lat, data[i].long);
        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: data[i].restaurantName,
            label: (1 + i).toString()
        });
        marker.infowindow = new google.maps.InfoWindow({
            content: data[i].restaurantName + "<br>" + data[i].moyStars
        });
        data[i].marker = marker;
        marker.addListener('click', function() {
            if (infowindowOpen !== 0) {
                infowindowOpen.close();
            }
            this.infowindow.open(map, this);
            infowindowOpen = this.infowindow;
        });
    }
    map.addListener('rightclick', function(event) {
        newMarker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()),
            label: (data.length + 1).toString()
        });
        $("#addRestDialog").dialog('open');
    });
}
//restos visibles stockés dans restoliste selon les notes
function restoArray(min, max) {
    restoliste = [];
    for (var i = 0; i < data.length; i++) {
        var moyenneResto = parseInt(data[i].moyenne);
        if (min <= moyenneResto && moyenneResto <= max) {
            restoliste.push(data[i]);
        }
    }
}

//géocodage 
function codeAddress() {
    var address = document.getElementById('valSearch').value;
    geocoder.geocode({ 'address': address }, function(results, status) {
        if (status === 'OK') {
            map.setCenter(results[0].geometry.location);
            loc.latitude = results[0].geometry.location.lat();
            loc.longitude = results[0].geometry.location.lng();
            init();
        } else if (address === "") {
            loc.latitude = userLoc.latitude;
            loc.longitude = userLoc.longitude;
            init();
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

//changement css navbar au defilement de la page
function checkScroll() {
    var startY = $('.navbar').height() * 1;

    if ($(window).scrollTop() > startY) {
        $('.navbar').addClass("scrolled");
    } else {
        $('.navbar').removeClass("scrolled");
    }
}

//ajoute image street view pour chaque restaurant
function imgStreetView(data) {
    for (var i = 0; i < data.length; i++) {
        data[i].streetView = '<img src="https://maps.googleapis.com/maps/api/streetview?size=400x400&location=' + data[i].lat + ',' + data[i].long + '&fov=90&heading=235&pitch=10&key=AIzaSyCwzVIYdUufu8mhPO3gmsj97hMENK06Kow">';
    }
}

//Calcul de toutes les moyennes de data[]
function initMoyenne(data) {
    for (var i = 0; i < data.length; i++) {
        var total = 0;
        for (var j = 0; j < data[i].ratings.length; j++) {
            total += data[i].ratings[j].stars;
        }
        data[i].moyenne = [Math.ceil(total / data[i].ratings.length)];
    }
}

//Calcul moyenne
function updateMoyenne(i, data) {
    var total = 0;
    for (var j = 0; j < data[i].ratings.length; j++) {
        total += data[i].ratings[j].stars;
    }
    data[i].moyenne = [Math.ceil(total / data[i].ratings.length)];
}

//stock le nombre d'étoile correspondant à la moyenne
function moyenneStars(data) {
    for (var k = 0; k < data.length; k++) {
        data[k].moyStars = "";
        for (var l = 0; l < data[k].moyenne; l++) {
            data[k].moyStars += '<i class="fa fa-star" aria-hidden="true"></i>';
        }
    }
}

//update stars
function updateStars(i, data){
    data[i].moyStars = '';
    for(var j = 0; j < data[i].moyenne; j++){
        data[i].moyStars += '<i class="fa fa-star" aria-hidden="true"></i>';
    }
}

//affiche, met à jour la note moyenne 
function displayMoyenne(i) {
    $('#moyNote').empty();
    $('#moyNote').append(data[i].moyStars);
}


//restos visibles stockés un array selon la localisation
function restoArray(latUser, longUser) {
    restoListe = [];
    for (var i = 0; i < data.length; i++) {
        var lat = data[i].lat;
        var lgn = data[i].long;
        var latMax = data[i].lat + 0.01;
        var latMin = data[i].lat - 0.01;
        var longMax = data[i].long + 0.01;
        var longMin = data[i].long - 0.01;
        if (latUser <= latMax && latUser >= latMin && longUser <= longMax && longUser >= longMin) {
            restoListe.push(data[i]);
        }
    }
}

//affiche tous les restos du json dans la liste
function displayAllResto(data) {
    $('#resto-liste').empty();
    if (data.length === 0) {
        $('#resto-liste').append('<br><p>Aucun restaurant trouvé</p>');
    } else {
        for (var j = 0; j < data.length; j++) {
            $('#resto-liste').append(
                '<div class="resto pointer" id="' + j + '">' +
                    '<div class="infoResto">' +
                        '<span class="labelLi">' + data[j].marker.label + '</span>' +
                        '<span class="lienResto"><b> ' + data[j].restaurantName + '</b></span>' +
                        '<span class="moyNote">' + data[j].moyStars + '</span>' +
                        '<p>' + data[j].address + '</p>' +
                    '</div>' +
                '</div>'
            );
        }
        //effet slide sur la liste des restaurants 
        $("#slide2").hide();
        $(".resto").click(function(event) {
            id = $(this).attr("id");
            $("#slide1").hide();
            map.setZoom(14);
            map.setCenter(data[id].marker.getPosition());
            if (infowindowOpen !== 0) {
                infowindowOpen.close();
            }
            // if(data[id].marker.infoWindow == 'undefined'){
            //
            // }
            data[id].marker.infowindow.open(map, data[id].marker);
            infowindowOpen = data[id].marker.infowindow;
            event.preventDefault();
            displayComments(id);

            $("#slide2").toggle("slide", { direction: 'right' }, 'slow');
        });
    }
}
//affiche les restaurants selon le filtre note 
function displayRestofiltre(min, data) {
    for (var i = 0; i < data.length; i++) {
        if (Math.ceil(data[i].moyenne) < min) {
            $("#" + i).hide();
            data[i].marker.setVisible(false);
        }
        if (data[i].moyenne >= min) {
            $("#" + i).show();
            data[i].marker.setVisible(true);
        }
    }
}
//affiche la street view et tous les commentaires du restaurant 
function displayComments(id) {
    $("#comments, #addComment, #resto-nom, #imgStreetView, #stars").empty();
    $("#imgStreetView").append(data[id].streetView);
    $("#resto-nom").append(data[id].restaurantName);
    $("#stars").append(data[id].moyStars);
    displayMoyenne(id);
    $("#addComment").append("<a href='#sect3'>Ajouter un commentaire</a>");
    if (data[id].ratings) {
        for (var l = 0; l < data[id].ratings.length; l++) {
            $('#comments').append(
                '<p id="com' + l + '" class="moyNote"></p>' +
                '<p>' + data[id].ratings[l].comment + '</p>' +
                '<br>'
            );
            //Nombre d'étoiles pour chaque commentaire 
            for (var m = 0; m < data[id].ratings[l].stars; m++) {
                $("#com" + l).append('<i class="fa fa-star" aria-hidden="true"></i>');
            }
        }
    }
}

//insere les données du formulaire pour la création d'un nouveau restaurant
function newResto() {
    var name = document.getElementById("restName").value;
    // var adress = document.getElementById("address").value;
    var newResto = {
        restaurantName: name,
        address: '',
        lat: newMarker.position.lat(),
        long: newMarker.position.lng(),
        marker: newMarker,
        streetView: '<img src="https://maps.googleapis.com/maps/api/streetview?size=400x400&location=' + newMarker.position.lat() + ',' + newMarker.position.lng() + '&fov=90&heading=235&pitch=10&key=AIzaSyCwzVIYdUufu8mhPO3gmsj97hMENK06Kow">',
        label: data.length,
        moyenne: 3,
        ratings: []
    };
    data.push(newResto);
    var i = data.length - 1;
    updateStars(i, data);
    $("#addRestDialog").dialog("close");
    initMap(data);
    displayAllResto(data);
}

$(function() {

    //Effet transparence navbar
    if ($('.navbar').length > 0) {
        $(window).on("scroll load resize", function() {
            checkScroll();
        });
    }

    //géocodage du texte saisi dans la barre de recherche
    $("#searchButton").click(function() {
        valSearch = $("#valSearch").val();
        codeAddress();
    });

    //Affiche tous les commentaires
    $(".lienComments").click(function() {
        var restoID = $(this).attr('id');
        id = restoID;
        displayComments(restoID);
    });

    //affiche boite dialog ajout commentaire
    $("#addComment").click(function(event) {
        var restoID = $(this).attr('id');
        $("#addComments").dialog('open');
        event.preventDefault();
    });

    //dialog ajout de commentaires
    $("#addComments").dialog({
        autoOpen: false,
        closeText: "X",
        show: "clip",
        hide: "clip",
        modal: true,
        width: 500,
        open: function() {
            $(".ui-widget-overlay").click(function() {
                $("#addComments").dialog('close');
            });
        }
    });

    //dialog ajout de restaurant
    $("#addRestDialog").dialog({
        autoOpen: false,
        closeText: "X",
        show: "clip",
        hide: "clip",
        modal: true,
        width: 500,
        open: function() {
            $(".ui-widget-overlay").click(function() {
                $("#addRestDialog").dialog('close');
            });
        }
    });

    //Ajoute les nouveaux commentaires
    $("#validComment").click(function() {
        var newCommentID = data[id].ratings.length + 1;
        var stars = parseInt($(".note:checked").val());
        var comment = $("#comment").val();
        data[id].ratings.push({ stars, comment });
        $("#addComments").dialog('close');
        displayComments(id);
        updateMoyenne(id, data);
        updateStars(id, data);
        displayMoyenne(id);
        $('#' + id + ' .infoResto .moyNote').empty();
        $('#' + id + ' .infoResto .moyNote').append(data[id].moyStars);
    });

    //filtre outil étoile
    $("#outil-filtre-star").click(function() {
        var stars = parseInt($(".note-filtre:checked").val());
        displayRestofiltre(stars, data);
    });
    //Effet scroll vers les sections
    $('.scroll').on('click', function() { // Au clic sur un élément
        var page = $(this).attr('href'); // Page cible
        var speed = 750; // Durée de l'animation (en ms)
        $('html, body').animate({
            scrollTop: $(page).offset().top
        }, speed); // Go
        return false;
    });

    //insertion du nouveau resto après validation du formulaire 
    $("#btnAddRest").click(function() {
        newResto();
    });
    $("#back").click(function() {
        $("#slide2").hide();
        $("#slide1").toggle("slide", { direction: 'left' });
    });
});