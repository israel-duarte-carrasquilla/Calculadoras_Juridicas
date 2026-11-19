<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$dbFile = __DIR__ . '/data_suite_juridica.json';

function getDefaultUsers() {
    return [
        [
            'id' => 'usr_israel',
            'name' => 'Israel',
            'username' => 'israel',
            'password' => 'DDuarte2004*',
            'role' => 'superadmin',
            'tokens' => 'unlimited',
            'usedTokens' => 0,
            'createdAt' => '2026-01-01',
            'status' => 'active',
            'notes' => 'Superadministrador con control total y consultas ilimitadas.'
        ],
        [
            'id' => 'usr_jcarlos',
            'name' => 'Juan Carlos Oyola',
            'username' => 'jcarlos',
            'password' => 'JC123',
            'role' => 'admin',
            'tokens' => 100,
            'usedTokens' => 0,
            'createdAt' => '2026-01-01',
            'status' => 'active',
            'notes' => 'Administrador autorizado para gestionar y recargar consultas.'
        ],
        [
            'id' => 'usr_prueba',
            'name' => 'Usuario de Prueba',
            'username' => 'prueba',
            'password' => '123',
            'role' => 'user',
            'tokens' => 5,
            'usedTokens' => 0,
            'createdAt' => '2026-01-01',
            'status' => 'active',
            'notes' => 'Usuario estándar para pruebas de consumo de tokens.'
        ]
    ];
}

function loadDb($dbFile) {
    if (!file_exists($dbFile)) {
        $initial = [
            'users' => getDefaultUsers(),
            'history' => []
        ];
        file_put_contents($dbFile, json_encode($initial, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        return $initial;
    }
    $raw = file_get_contents($dbFile);
    $data = json_decode($raw, true);
    if (!is_array($data) || !isset($data['users'])) {
        $data = [
            'users' => getDefaultUsers(),
            'history' => []
        ];
    }
    // Asegurar contraseñas oficiales de Israel y Juan Carlos
    $changed = false;
    foreach ($data['users'] as &$u) {
        if (($u['username'] ?? '') === 'israel' || ($u['id'] ?? '') === 'usr_israel') {
            if (($u['password'] ?? '') !== 'DDuarte2004*') {
                $u['password'] = 'DDuarte2004*';
                $changed = true;
            }
        }
        if (($u['username'] ?? '') === 'jcarlos' || ($u['id'] ?? '') === 'usr_jcarlos') {
            if (($u['password'] ?? '') !== 'JC123') {
                $u['password'] = 'JC123';
                $changed = true;
            }
        }
    }
    unset($u);
    if ($changed) {
        saveDb($dbFile, $data);
    }
    return $data;
}

function saveDb($dbFile, $data) {
    return file_put_contents($dbFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX) !== false;
}

$inputRaw = file_get_contents('php://input');
$input = json_decode($inputRaw, true);
if (!is_array($input)) {
    $input = $_POST;
}
$action = $input['action'] ?? ($_GET['action'] ?? '');

if ($action === 'ping') {
    echo json_encode(['ok' => true, 'status' => 'ready']);
    exit;
}

$db = loadDb($dbFile);

if ($action === 'login') {
    $usernameInput = mb_strtolower(trim((string)($input['username'] ?? '')), 'UTF-8');
    $passwordInput = (string)($input['password'] ?? '');

    $foundUser = null;
    foreach ($db['users'] as $u) {
        $uName = mb_strtolower(trim((string)($u['username'] ?? '')), 'UTF-8');
        $fullName = mb_strtolower(trim((string)($u['name'] ?? '')), 'UTF-8');
        $uId = mb_strtolower(trim((string)($u['id'] ?? '')), 'UTF-8');
        if ($uName === $usernameInput || $fullName === $usernameInput || $uId === $usernameInput) {
            $foundUser = $u;
            break;
        }
    }

    if (!$foundUser) {
        echo json_encode(['ok' => false, 'error' => 'Usuario no encontrado. Verifica el nombre ingresado.']);
        exit;
    }

    if (($foundUser['status'] ?? 'active') === 'suspended') {
        echo json_encode(['ok' => false, 'error' => 'Esta cuenta se encuentra suspendida. Contacta al administrador.']);
        exit;
    }

    if ((string)($foundUser['password'] ?? '') !== $passwordInput) {
        echo json_encode(['ok' => false, 'error' => 'Contraseña incorrecta para el usuario ' . $foundUser['name'] . '.']);
        exit;
    }

    $isAdmin = in_array($foundUser['role'] ?? 'user', ['superadmin', 'admin'], true);
    echo json_encode([
        'ok' => true,
        'user' => $foundUser,
        'users' => $isAdmin ? $db['users'] : [$foundUser],
        'history' => $isAdmin ? $db['history'] : array_values(array_filter($db['history'], function($h) use ($foundUser) {
            return ($h['userName'] ?? '') === ($foundUser['name'] ?? '');
        }))
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'get_session') {
    $userId = (string)($input['userId'] ?? '');
    $foundUser = null;
    foreach ($db['users'] as $u) {
        if (($u['id'] ?? '') === $userId) {
            $foundUser = $u;
            break;
        }
    }
    if (!$foundUser) {
        echo json_encode(['ok' => false, 'error' => 'Sesión no válida.']);
        exit;
    }
    $isAdmin = in_array($foundUser['role'] ?? 'user', ['superadmin', 'admin'], true);
    echo json_encode([
        'ok' => true,
        'user' => $foundUser,
        'users' => $isAdmin ? $db['users'] : [$foundUser],
        'history' => $isAdmin ? $db['history'] : array_values(array_filter($db['history'], function($h) use ($foundUser) {
            return ($h['userName'] ?? '') === ($foundUser['name'] ?? '');
        }))
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'save_users') {
    $adminId = (string)($input['adminId'] ?? '');
    $newUsers = $input['users'] ?? null;

    $adminUser = null;
    foreach ($db['users'] as $u) {
        if (($u['id'] ?? '') === $adminId && in_array($u['role'] ?? '', ['superadmin', 'admin'], true)) {
            $adminUser = $u;
            break;
        }
    }
    if (!$adminUser || !is_array($newUsers)) {
        echo json_encode(['ok' => false, 'error' => 'No autorizado para modificar usuarios.']);
        exit;
    }

    $db['users'] = $newUsers;
    saveDb($dbFile, $db);
    echo json_encode(['ok' => true, 'users' => $db['users']], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'consume_token') {
    $userId = (string)($input['userId'] ?? '');
    $historyItem = $input['historyItem'] ?? null;

    $targetIdx = -1;
    foreach ($db['users'] as $idx => $u) {
        if (($u['id'] ?? '') === $userId) {
            $targetIdx = $idx;
            break;
        }
    }

    if ($targetIdx === -1) {
        echo json_encode(['ok' => false, 'error' => 'Usuario no encontrado.']);
        exit;
    }

    $user = &$db['users'][$targetIdx];
    if (($user['tokens'] ?? 0) !== 'unlimited') {
        $num = intval($user['tokens'] ?? 0);
        if ($num <= 0) {
            echo json_encode(['ok' => false, 'error' => 'Sin tokens disponibles.']);
            exit;
        }
        $user['tokens'] = $num - 1;
    }
    $user['usedTokens'] = intval($user['usedTokens'] ?? 0) + 1;

    if (is_array($historyItem)) {
        array_unshift($db['history'], $historyItem);
        if (count($db['history']) > 100) {
            $db['history'] = array_slice($db['history'], 0, 100);
        }
    }

    saveDb($dbFile, $db);
    echo json_encode([
        'ok' => true,
        'user' => $user,
        'history' => $db['history']
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['ok' => false, 'error' => 'Acción no reconocida.']);
