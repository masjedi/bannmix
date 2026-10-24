<?php

// Keep detail URLs crawlable before React loads. The page content is still
// supplied by the existing public API after the frontend starts.
$path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
if (!is_string($path) || !preg_match('~^/(products|events)/([A-Za-z0-9_-]+)/?$~', $path, $matches)) {
    http_response_code(404);
    exit;
}

$section = $matches[1];
$canonical = 'https://bannmix.af/' . $section . '/' . $matches[2];
$title = $section === 'products'
    ? 'Product Details | BannMix Afghanistan'
    : 'Event Details | BannMix Afghanistan';
$description = $section === 'products'
    ? 'Explore a BannMix natural food product made in Afghanistan, including product details and ordering information.'
    : 'Learn about a BannMix event or community activity in Afghanistan.';

$html = file_get_contents(__DIR__ . '/index.html');
if ($html === false) {
    http_response_code(500);
    exit;
}

$escape = static fn (string $value): string => htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$html = preg_replace('~<title>[^<]*</title>~', '<title>' . $escape($title) . '</title>', $html, 1);
$html = preg_replace('~<meta\s+name="description"\s+content="[^"]*"\s*/>~', '<meta name="description" content="' . $escape($description) . '" />', $html, 1);
$html = preg_replace('~<link\s+rel="canonical"\s+href="[^"]*"\s*/>~', '<link rel="canonical" href="' . $escape($canonical) . '" />', $html, 1);

header('Content-Type: text/html; charset=UTF-8');
echo $html;
