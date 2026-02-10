<?php

declare(strict_types=1);

require_once __DIR__ . DIRECTORY_SEPARATOR . 'config.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$len = static function (string $value): int {
    if (function_exists('mb_strlen')) {
        return (int) mb_strlen($value);
    }
    return (int) strlen($value);
};

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}

header('Access-Control-Allow-Origin: *');

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'ok' => false,
        'error' => 'method_not_allowed',
        'message' => 'Usa POST.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$raw = file_get_contents('php://input');
if (!is_string($raw) || trim($raw) === '') {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => 'bad_request',
        'message' => 'Body vacío.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$data = json_decode($raw, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => 'bad_json',
        'message' => 'JSON inválido.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$message = $data['message'] ?? '';
if (!is_string($message)) {
    $message = '';
}
$message = trim($message);

if ($message === '') {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => 'empty_message',
        'message' => 'Escribe un mensaje.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($len($message) > 4000) {
    http_response_code(413);
    echo json_encode([
        'ok' => false,
        'error' => 'message_too_long',
        'message' => 'Mensaje demasiado largo.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$apiKey = getGeminiApiKey();
if ($apiKey === '') {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'missing_api_key',
        'message' => 'Falta configurar GEMINI_API_KEY en el servidor.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$model = 'gemini-1.5-flash';
$endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/' . rawurlencode($model) . ':generateContent?key=' . rawurlencode($apiKey);

$systemInstruction = "Eres un asistente de una agencia de IA. Responde en español, claro y profesional. Da respuestas concisas, con pasos accionables. Si falta información, pregunta lo mínimo necesario.";

$payload = [
    'contents' => [
        [
            'role' => 'user',
            'parts' => [
                ['text' => $systemInstruction . "\n\nUsuario: " . $message]
            ]
        ]
    ],
    'generationConfig' => [
        'temperature' => 0.5,
        'maxOutputTokens' => 500,
        'topP' => 0.9
    ]
];

$payloadJson = json_encode($payload, JSON_UNESCAPED_UNICODE);
if (!is_string($payloadJson) || $payloadJson === '') {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'json_encode_failed',
        'message' => 'No se pudo construir la solicitud.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$responseBody = '';
$httpCode = 0;

if (function_exists('curl_init')) {
    $ch = curl_init($endpoint);
    if ($ch === false) {
        http_response_code(500);
        echo json_encode([
            'ok' => false,
            'error' => 'curl_init_failed',
            'message' => 'No se pudo inicializar cURL.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json'
        ],
        CURLOPT_POSTFIELDS => $payloadJson,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30
    ]);

    $responseBody = curl_exec($ch);
    $curlErrNo = curl_errno($ch);
    $curlErr = curl_error($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($curlErrNo !== 0) {
        http_response_code(502);
        echo json_encode([
            'ok' => false,
            'error' => 'upstream_error',
            'message' => 'Error conectando a Gemini.',
            'details' => $curlErr
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
} else {
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => $payloadJson,
            'timeout' => 30,
            'ignore_errors' => true
        ]
    ]);

    $responseBody = file_get_contents($endpoint, false, $context);
    if (isset($http_response_header) && is_array($http_response_header)) {
        foreach ($http_response_header as $headerLine) {
            if (preg_match('/^HTTP\/(?:1\.0|1\.1|2|3)\s+(\d{3})\b/i', $headerLine, $m) === 1) {
                $httpCode = (int) $m[1];
                break;
            }
        }
    }
}

if (!is_string($responseBody) || trim($responseBody) === '') {
    http_response_code(502);
    echo json_encode([
        'ok' => false,
        'error' => 'empty_upstream_response',
        'message' => 'Respuesta vacía del proveedor.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$decoded = json_decode($responseBody, true);
if (!is_array($decoded)) {
    http_response_code(502);
    echo json_encode([
        'ok' => false,
        'error' => 'bad_upstream_json',
        'message' => 'JSON inválido del proveedor.',
        'httpCode' => $httpCode
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($httpCode < 200 || $httpCode >= 300) {
    http_response_code(502);
    echo json_encode([
        'ok' => false,
        'error' => 'upstream_http_error',
        'message' => 'Gemini respondió con error.',
        'httpCode' => $httpCode,
        'upstream' => $decoded
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$text = '';
$candidates = $decoded['candidates'] ?? null;
if (is_array($candidates) && isset($candidates[0]['content']['parts']) && is_array($candidates[0]['content']['parts'])) {
    $parts = $candidates[0]['content']['parts'];
    $texts = [];
    foreach ($parts as $part) {
        if (is_array($part) && isset($part['text']) && is_string($part['text'])) {
            $texts[] = $part['text'];
        }
    }
    $text = trim(implode("\n", $texts));
}

if ($text === '') {
    $text = 'No pude generar una respuesta. Intenta de nuevo.';
}

echo json_encode([
    'ok' => true,
    'reply' => $text
], JSON_UNESCAPED_UNICODE);
