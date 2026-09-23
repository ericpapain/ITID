<?php
// ======================================================================
// ITID France — Fonctions Utilitaires Analytics & Géolocalisation
// ======================================================================

function getClientIp(): string {
    $headers = [
        'HTTP_CF_CONNECTING_IP', // Cloudflare
        'HTTP_X_REAL_IP',        // Nginx proxy
        'HTTP_X_FORWARDED_FOR',  // Standard proxy
        'REMOTE_ADDR'            // Direct connection
    ];

    foreach ($headers as $header) {
        if (!empty($_SERVER[$header])) {
            $ipList = explode(',', $_SERVER[$header]);
            foreach ($ipList as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
    }

    return '127.0.0.1';
}

function isBot(string $userAgent): bool {
    if (empty($userAgent)) return false;
    $pattern = '/(bot|crawler|spider|crawling|slurp|duckduckbot|baiduspider|yandex|bingbot|googlebot|lighthouse|headless|ptst|mediapartners-google)/i';
    return (bool)preg_match($pattern, $userAgent);
}

function parseUserAgent(string $ua): array {
    $device = 'desktop';
    if (preg_match('/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i', $ua)) {
        $device = 'tablet';
    } elseif (preg_match('/(mobile|iphone|ipod|android.*mobile|blackberry|bb10|windows phone|opera mini|iemobile)/i', $ua)) {
        $device = 'mobile';
    }

    // Système d'exploitation
    $os = 'Inconnu';
    $osVersion = '';
    if (preg_match('/windows nt 10\.0/i', $ua)) {
        $os = 'Windows'; $osVersion = '10/11';
    } elseif (preg_match('/windows nt 6\.[1-3]/i', $ua)) {
        $os = 'Windows'; $osVersion = '7/8';
    } elseif (preg_match('/windows/i', $ua)) {
        $os = 'Windows';
    } elseif (preg_match('/macintosh|mac os x/i', $ua)) {
        $os = 'macOS';
    } elseif (preg_match('/iphone|ipad|ipod/i', $ua)) {
        $os = 'iOS';
    } elseif (preg_match('/android/i', $ua)) {
        $os = 'Android';
    } elseif (preg_match('/linux/i', $ua)) {
        $os = 'Linux';
    }

    // Navigateur
    $browser = 'Inconnu';
    $browserVersion = '';
    if (preg_match('/edg\/([\d\.]+)/i', $ua, $m)) {
        $browser = 'Edge'; $browserVersion = $m[1];
    } elseif (preg_match('/chrome\/([\d\.]+)/i', $ua, $m) && !preg_match('/edg|opr/i', $ua)) {
        $browser = 'Chrome'; $browserVersion = $m[1];
    } elseif (preg_match('/firefox\/([\d\.]+)/i', $ua, $m)) {
        $browser = 'Firefox'; $browserVersion = $m[1];
    } elseif (preg_match('/safari\/([\d\.]+)/i', $ua, $m) && !preg_match('/chrome|android/i', $ua)) {
        $browser = 'Safari'; $browserVersion = $m[1];
    } elseif (preg_match('/opr\/([\d\.]+)/i', $ua, $m)) {
        $browser = 'Opera'; $browserVersion = $m[1];
    }

    return [
        'device' => $device,
        'os' => $os,
        'os_version' => $osVersion,
        'browser' => $browser,
        'browser_version' => $browserVersion,
    ];
}

function getIpLocation(string $ip): array {
    // Adresses privées ou boucle locale
    if (
        $ip === '127.0.0.1' ||
        $ip === '::1' ||
        preg_match('/^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/', $ip)
    ) {
        return [
            'country' => 'France',
            'country_code' => 'FR',
            'city' => 'Local / Troyes',
            'region' => 'Grand Est',
            'timezone' => 'Europe/Paris',
        ];
    }

    $cacheFile = __DIR__ . '/../data/geo_cache.json';
    $cache = [];
    if (file_exists($cacheFile)) {
        $raw = @file_get_contents($cacheFile);
        if ($raw) {
            $cache = @json_decode($raw, true) ?: [];
        }
    }

    if (isset($cache[$ip])) {
        return $cache[$ip];
    }

    // Appel distant très rapide avec timeout strict (1.5s max pour ne jamais bloquer)
    $loc = [
        'country' => 'France',
        'country_code' => 'FR',
        'city' => 'Inconnue',
        'region' => '',
        'timezone' => 'Europe/Paris',
    ];

    try {
        $ctx = stream_context_create([
            'http' => [
                'timeout' => 1.5,
                'ignore_errors' => true,
            ]
        ]);
        $json = @file_get_contents("http://ip-api.com/json/{$ip}?fields=status,country,countryCode,regionName,city,timezone", false, $ctx);
        if ($json) {
            $data = json_decode($json, true);
            if (!empty($data) && ($data['status'] ?? '') === 'success') {
                $loc = [
                    'country' => $data['country'] ?? 'France',
                    'country_code' => $data['countryCode'] ?? 'FR',
                    'city' => $data['city'] ?? 'Inconnue',
                    'region' => $data['regionName'] ?? '',
                    'timezone' => $data['timezone'] ?? 'Europe/Paris',
                ];
                
                // Mettre en cache (limité à 1000 entrées récentes)
                if (count($cache) > 1000) {
                    $cache = array_slice($cache, -500, null, true);
                }
                $cache[$ip] = $loc;
                @file_put_contents($cacheFile, json_encode($cache, JSON_UNESCAPED_UNICODE));
            }
        }
    } catch (Exception $e) {
        // Fallback silencieux
    }

    return $loc;
}
