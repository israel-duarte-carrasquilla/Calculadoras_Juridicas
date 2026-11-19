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
            'email' => 'webmaster@solutiontech.lat',
            'password' => 'DDuarte2004*',
            'role' => 'superadmin',
            'tokens' => 'unlimited',
            'usedTokens' => 0,
            'mustChangePassword' => false,
            'authProvider' => 'local',
            'createdAt' => '2026-01-01',
            'status' => 'active',
            'notes' => 'Superadministrador con control total y consultas ilimitadas.'
        ],
        [
            'id' => 'usr_jcarlos',
            'name' => 'Juan Carlos Oyola',
            'username' => 'jcarlos',
            'email' => 'jcarlos@solutiontech.lat',
            'password' => 'JC123',
            'role' => 'admin',
            'tokens' => 100,
            'usedTokens' => 0,
            'mustChangePassword' => false,
            'authProvider' => 'local',
            'createdAt' => '2026-01-01',
            'status' => 'active',
            'notes' => 'Administrador autorizado para gestionar y recargar consultas.'
        ],
        [
            'id' => 'usr_prueba',
            'name' => 'Usuario de Prueba',
            'username' => 'prueba',
            'email' => 'prueba@solutiontech.lat',
            'password' => '123',
            'role' => 'user',
            'tokens' => 5,
            'usedTokens' => 0,
            'mustChangePassword' => false,
            'authProvider' => 'local',
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
            'history' => [],
            'oauth' => ['googleClientId' => '', 'microsoftClientId' => '']
        ];
        file_put_contents($dbFile, json_encode($initial, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        return $initial;
    }
    $raw = file_get_contents($dbFile);
    $data = json_decode($raw, true);
    if (!is_array($data) || !isset($data['users'])) {
        $data = [
            'users' => getDefaultUsers(),
            'history' => [],
            'oauth' => ['googleClientId' => '', 'microsoftClientId' => '']
        ];
    }
    if (!isset($data['oauth'])) {
        $data['oauth'] = ['googleClientId' => '', 'microsoftClientId' => ''];
    }
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

if ($action === 'get_oauth_config') {
    echo json_encode(['ok' => true, 'oauth' => $db['oauth']]);
    exit;
}

if ($action === 'save_oauth_config') {
    $adminId = (string)($input['adminId'] ?? '');
    $adminUser = null;
    foreach ($db['users'] as $u) {
        if (($u['id'] ?? '') === $adminId && ($u['role'] ?? '') === 'superadmin') {
            $adminUser = $u;
            break;
        }
    }
    if (!$adminUser) {
        echo json_encode(['ok' => false, 'error' => 'Solo el Superadministrador puede configurar OAuth.']);
        exit;
    }
    $db['oauth'] = [
        'googleClientId' => trim((string)($input['googleClientId'] ?? '')),
        'microsoftClientId' => trim((string)($input['microsoftClientId'] ?? ''))
    ];
    saveDb($dbFile, $db);
    echo json_encode(['ok' => true, 'oauth' => $db['oauth']]);
    exit;
}

if ($action === 'login') {
    $usernameInput = mb_strtolower(trim((string)($input['username'] ?? '')), 'UTF-8');
    $passwordInput = (string)($input['password'] ?? '');

    $foundUser = null;
    foreach ($db['users'] as $u) {
        $uName = mb_strtolower(trim((string)($u['username'] ?? '')), 'UTF-8');
        $uEmail = mb_strtolower(trim((string)($u['email'] ?? '')), 'UTF-8');
        $fullName = mb_strtolower(trim((string)($u['name'] ?? '')), 'UTF-8');
        $uId = mb_strtolower(trim((string)($u['id'] ?? '')), 'UTF-8');
        if ($uName === $usernameInput || ($uEmail !== '' && $uEmail === $usernameInput) || $fullName === $usernameInput || $uId === $usernameInput) {
            $foundUser = $u;
            break;
        }
    }

    if (!$foundUser) {
        echo json_encode(['ok' => false, 'error' => 'Usuario no encontrado. Verifica el nombre o correo ingresado.']);
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

if ($action === 'register') {
    $name = trim((string)($input['name'] ?? ''));
    $email = mb_strtolower(trim((string)($input['email'] ?? '')), 'UTF-8');
    $password = (string)($input['password'] ?? '');
    $provider = trim((string)($input['provider'] ?? 'local'));

    if ($name === '' || $email === '' || strlen($password) < 6) {
        echo json_encode(['ok' => false, 'error' => 'Completa tu nombre, correo válido y una contraseña de mínimo 6 caracteres.']);
        exit;
    }

    foreach ($db['users'] as $u) {
        $uName = mb_strtolower(trim((string)($u['username'] ?? '')), 'UTF-8');
        $uEmail = mb_strtolower(trim((string)($u['email'] ?? '')), 'UTF-8');
        if ($uName === $email || ($uEmail !== '' && $uEmail === $email)) {
            echo json_encode(['ok' => false, 'error' => 'Este correo ya se encuentra registrado. Por favor inicia sesión.']);
            exit;
        }
    }

    $newUser = [
        'id' => 'usr_' . time() . '_' . substr(md5($email), 0, 5),
        'name' => $name,
        'username' => $email,
        'email' => $email,
        'password' => $password,
        'role' => 'user',
        'tokens' => 3,
        'usedTokens' => 0,
        'mustChangePassword' => false,
        'authProvider' => $provider,
        'createdAt' => date('Y-m-d'),
        'status' => 'active',
        'notes' => 'Auto-registro (' . strtoupper($provider) . ')'
    ];

    $db['users'][] = $newUser;
    saveDb($dbFile, $db);

    echo json_encode([
        'ok' => true,
        'user' => $newUser,
        'users' => [$newUser],
        'history' => []
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'oauth_login_or_register') {
    $name = trim((string)($input['name'] ?? ''));
    $email = mb_strtolower(trim((string)($input['email'] ?? '')), 'UTF-8');
    $provider = trim((string)($input['provider'] ?? 'google'));

    if ($email === '') {
        echo json_encode(['ok' => false, 'error' => 'No se recibió un correo válido del proveedor.']);
        exit;
    }

    $foundIdx = -1;
    foreach ($db['users'] as $idx => $u) {
        $uName = mb_strtolower(trim((string)($u['username'] ?? '')), 'UTF-8');
        $uEmail = mb_strtolower(trim((string)($u['email'] ?? '')), 'UTF-8');
        if ($uName === $email || ($uEmail !== '' && $uEmail === $email)) {
            $foundIdx = $idx;
            break;
        }
    }

    if ($foundIdx !== -1) {
        $foundUser = $db['users'][$foundIdx];
        if (($foundUser['status'] ?? 'active') === 'suspended') {
            echo json_encode(['ok' => false, 'error' => 'Esta cuenta se encuentra suspendida.']);
            exit;
        }
    } else {
        $foundUser = [
            'id' => 'usr_' . time() . '_' . substr(md5($email), 0, 5),
            'name' => $name !== '' ? $name : explode('@', $email)[0],
            'username' => $email,
            'email' => $email,
            'password' => bin2hex(random_bytes(8)),
            'role' => 'user',
            'tokens' => 3,
            'usedTokens' => 0,
            'mustChangePassword' => false,
            'authProvider' => $provider,
            'createdAt' => date('Y-m-d'),
            'status' => 'active',
            'notes' => 'Registro OAuth (' . strtoupper($provider) . ')'
        ];
        $db['users'][] = $foundUser;
        saveDb($dbFile, $db);
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

if ($action === 'change_password') {
    $userId = (string)($input['userId'] ?? '');
    $newPassword = (string)($input['newPassword'] ?? '');

    if (strlen($newPassword) < 6) {
        echo json_encode(['ok' => false, 'error' => 'La nueva contraseña debe tener al menos 6 caracteres.']);
        exit;
    }

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

    $db['users'][$targetIdx]['password'] = $newPassword;
    $db['users'][$targetIdx]['mustChangePassword'] = false;
    saveDb($dbFile, $db);

    $updatedUser = $db['users'][$targetIdx];
    $isAdmin = in_array($updatedUser['role'] ?? 'user', ['superadmin', 'admin'], true);
    echo json_encode([
        'ok' => true,
        'user' => $updatedUser,
        'users' => $isAdmin ? $db['users'] : [$updatedUser]
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
