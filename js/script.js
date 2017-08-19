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
    $("#ajoutResto").dialog({
        autoOpen: false,
        closeText: "X",
        show: "clip",
        hide: "clip",
        modal: true,
        width: 500,
        open: function() {
            $(".ui-widget-overlay").click(function() {
                $("#ajoutResto").dialog('close');
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
        calcMoyenne(id);
        displayMoyenne(id);
    });

    /*filtre outil slide
    $("#slider").slider({
        id: "sliderNote",
        min: 1,
        max: 5,
        range: true,
        values: [1, 5],
        change: function(event, ui) {
            filtreNote = $("#slider").slider("values");
            $("#noteMin").empty();
            $("#noteMax").empty();
            $("#noteMin").append(filtreNote[0]);
            $("#noteMax").append(filtreNote[1]);
            displayRestofiltre(filtreNote[0], filtreNote[1]);
        }
    });*/

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
    $("#submit").click(function() {
        newResto();
    });
    $("#back").click(function() {
        $("#slide2").hide();
        $("#slide1").toggle("slide", { direction: 'left' });
    });

    /*
     * Requete pour récupérer les tokens
     *
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.yelp.com/oauth2/token",
        "method": "POST",
        "dataType": "jsonp",
        "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache",
            "postman-token": "2878af40-7d0d-57cb-ae8a-cb125810636a"
        },
        "data": {
            "client_id": "Tdof_KMIfiQv-oAtQqca-w",
            "client_secret": "JFGUwxHJEEIX2Fy9e8XaLneJmUZNQZ4AB9MhVVDY16h99fmgkeKtX3INTKzNxHVW",
            "grant_type": "client_credentials"
        }
    };

    $.ajax(settings).done(function(response) {
        console.log(response);
    });

     *
     * Requete de recherche avec le token récupéré grace à la requete précedente sur postman 
     *
     
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.yelp.com/v3/autocomplete?text=del&latitude=37.786882&longitude=-122.399972",
        "method": "GET",
        "dataType": "jsonp",
        "headers": {
            "authorization": "Bearer 2WTQgmFRRaQnC_vw0zsfe5PtCbYWr2A31njW2Aeh_T5WonghOjdSrmhne--AhQlWlkZnf5arGsx1vWRWgetVNvRlfvEO6mKsRx8ad-FJawv3we04Y_3oDw_sRJcsWXYx",
            "cache-control": "no-cache",
            "postman-token": "bfc6fce3-a14a-873f-c427-50812f178b02"
        }
    }

    $.ajax(settings).done(function(response) {
        console.log(response);
    });
    //en ajoutant dataType: jsonp on évite bien l'erreur "cross domaine" mais ça ne fonction toujours pas"
    */

});