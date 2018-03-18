<?php
$lat = $_POST["lat"];
$long = $_POST["long"];
//$tokenType = $_POST["tokenType"];
//$accessToken = $_POST["accessToken"];
$url = "https://api.yelp.com/v3/businesses/search?latitude=".$lat."&longitude=".$long."&limit=10";
$curl = curl_init();

curl_setopt($curl, CURLOPT_URL, $url);
curl_setopt_array($curl, array(
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "GET",
  CURLOPT_HTTPHEADER => array(
//    "authorization:" . $tokenType . " " . $accessToken,
    "authorization: Bearer 2WTQgmFRRaQnC_vw0zsfe5PtCbYWr2A31njW2Aeh_T5WonghOjdSrmhne--AhQlWlkZnf5arGsx1vWRWgetVNvRlfvEO6mKsRx8ad-FJawv3we04Y_3oDw_sRJcsWXYx",
  ),
));

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}