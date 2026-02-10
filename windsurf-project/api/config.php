<?php

declare(strict_types=1);

function getGeminiApiKey(): string {
    $key = getenv('GEMINI_API_KEY');
    if (is_string($key) && trim($key) !== '') {
        return trim($key);
    }

    $localConfigPath = __DIR__ . DIRECTORY_SEPARATOR . 'config.local.php';
    if (is_file($localConfigPath)) {
        /** @var mixed $local */
        $local = require $localConfigPath;
        if (is_array($local) && isset($local['GEMINI_API_KEY']) && is_string($local['GEMINI_API_KEY']) && trim($local['GEMINI_API_KEY']) !== '') {
            return trim($local['GEMINI_API_KEY']);
        }
    }

    return '';
}
