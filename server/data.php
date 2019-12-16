<?php

function get_data() {
  $file = dirname(__FILE__).'/data.json';
  return file_get_contents($file);
}

function get_request() {
  $data = get_data();
  return $data;
}

function post_request() {
  $json = file_get_contents('php://input');
  $data = json_decode($json, true);

  if (is_array($data)) {
    $file = dirname(__FILE__).'/data.json';
    file_put_contents($file, $json);
  }

  return $json;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

  header('Access-Control-Allow-Origin: http://localhost');
  header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type, Content-Length');
  header('Access-Control-Allow-Credentials: true');

  exit(0);

} else {
  $response = $_SERVER['REQUEST_METHOD'] === 'POST' ? post_request() : get_request();

  header('Access-Control-Allow-Origin: *');
  header('Content-Type: application/json');
  header('Content-Length: '.strlen($response));

  echo $response;
}
