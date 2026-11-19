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
            'email' => 'israel.duarte.carrasquilla@gmail.com',
            'phone' => '',
            'password' => 'DDuarte2004*',
            'role' => 'superadmin',
            'tokens' => 'unlimited',
            'balance' => 0,
            'usedTokens' => 0,
            'mustChangePassword' => false,
            'authProvider' => 'google',
            'createdAt' => '2026-01-01',
            'status' => 'active',
            'notes' => 'Superadministrador con control total y consultas ilimitadas.'
        ],
        [
            'id' => 'usr_jcarlos',
            'name' => 'Juan Carlos Oyola',
            'username' => 'jcarlos',
            'email' => 'jcarlos@solutiontech.lat',
            'phone' => '',
            'password' => 'JC123',
            'role' => 'admin',
            'tokens' => 100,
            'balance' => 1000000,
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
            'phone' => '',
            'password' => '123',
            'role' => 'user',
            'tokens' => 5,
            'balance' => 50000,
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
            'tokenPrice' => 10000,
            'users' => getDefaultUsers(),
            'history' => [],
            'recharges' => [],
            'oauth' => ['googleClientId' => '', 'microsoftClientId' => '']
        ];
        file_put_contents($dbFile, json_encode($initial, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        return $initial;
    }
    $raw = file_get_contents($dbFile);
    $data = json_decode($raw, true);
    if (!is_array($data) || !isset($data['users'])) {
        $data = [
            'tokenPrice' => 10000,
            'users' => getDefaultUsers(),
            'history' => [],
            'recharges' => [],
            'oauth' => ['googleClientId' => '', 'microsoftClientId' => '']
        ];
    }
    if (!isset($data['tokenPrice'])) $data['tokenPrice'] = 10000;
    if (!isset($data['recharges'])) $data['recharges'] = [];
    if (!isset($data['history'])) $data['history'] = [];
    if (!isset($data['oauth'])) $data['oauth'] = ['googleClientId' => '', 'microsoftClientId' => ''];

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
        if (!isset($u['balance'])) {
            $u['balance'] = ($u['tokens'] ?? 0) === 'unlimited' ? 0 : (intval($u['tokens'] ?? 0) * intval($data['tokenPrice']));
            $changed = true;
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
    echo json_encode(['ok' => true, 'oauth' => $db['oauth'], 'tokenPrice' => $db['tokenPrice']]);
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

if ($action === 'save_token_price') {
    $adminId = (string)($input['adminId'] ?? '');
    $newPrice = intval($input['tokenPrice'] ?? 0);
    $adminUser = null;
    foreach ($db['users'] as $u) {
        if (($u['id'] ?? '') === $adminId && ($u['role'] ?? '') === 'superadmin') {
            $adminUser = $u;
            break;
        }
    }
    if (!$adminUser) {
        echo json_encode(['ok' => false, 'error' => 'Solo el Superadministrador puede modificar el valor del token.']);
        exit;
    }
    if ($newPrice < 0) {
        echo json_encode(['ok' => false, 'error' => 'El valor del token no puede ser negativo.']);
        exit;
    }
    $db['tokenPrice'] = $newPrice;
    saveDb($dbFile, $db);
    echo json_encode(['ok' => true, 'tokenPrice' => $db['tokenPrice']]);
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
        'tokenPrice' => $db['tokenPrice'],
        'user' => $foundUser,
        'users' => $isAdmin ? $db['users'] : [$foundUser],
        'recharges' => $isAdmin ? $db['recharges'] : array_values(array_filter($db['recharges'], function($r) use ($foundUser) {
            return ($r['userId'] ?? '') === ($foundUser['id'] ?? '');
        })),
        'history' => $isAdmin ? $db['history'] : array_values(array_filter($db['history'], function($h) use ($foundUser) {
            return ($h['userName'] ?? '') === ($foundUser['name'] ?? '');
        }))
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'register') {
    $name = trim((string)($input['name'] ?? ''));
    $email = mb_strtolower(trim((string)($input['email'] ?? '')), 'UTF-8');
    $phone = trim((string)($input['phone'] ?? ''));
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

    $defaultTokens = 5;
    $newUser = [
        'id' => 'usr_' . time() . '_' . substr(md5($email), 0, 5),
        'name' => $name,
        'username' => $email,
        'email' => $email,
        'phone' => $phone,
        'password' => $password,
        'role' => 'user',
        'tokens' => $defaultTokens,
        'balance' => $defaultTokens * intval($db['tokenPrice']),
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
        'tokenPrice' => $db['tokenPrice'],
        'user' => $newUser,
        'users' => [$newUser],
        'recharges' => [],
        'history' => []
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'update_profile' || $action === 'link_email') {
    $userId = (string)($input['userId'] ?? '');
    $email = mb_strtolower(trim((string)($input['email'] ?? '')), 'UTF-8');
    $phone = trim((string)($input['phone'] ?? ($db['users'][0]['phone'] ?? '')));
    $provider = trim((string)($input['authProvider'] ?? ($input['provider'] ?? 'google')));

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

    if ($email !== '') {
        foreach ($db['users'] as $idx => $u) {
            if ($idx === $targetIdx) continue;
            $uName = mb_strtolower(trim((string)($u['username'] ?? '')), 'UTF-8');
            $uEmail = mb_strtolower(trim((string)($u['email'] ?? '')), 'UTF-8');
            if ($uName === $email || ($uEmail !== '' && $uEmail === $email)) {
                echo json_encode(['ok' => false, 'error' => 'Ese correo ya está vinculado a otra cuenta.']);
                exit;
            }
        }
    }

    $db['users'][$targetIdx]['email'] = $email;
    if (isset($input['phone'])) {
        $db['users'][$targetIdx]['phone'] = trim((string)$input['phone']);
    }
    $db['users'][$targetIdx]['authProvider'] = $provider;
    saveDb($dbFile, $db);

    $updatedUser = $db['users'][$targetIdx];
    $isAdmin = in_array($updatedUser['role'] ?? 'user', ['superadmin', 'admin'], true);
    echo json_encode([
        'ok' => true,
        'tokenPrice' => $db['tokenPrice'],
        'user' => $updatedUser,
        'users' => $isAdmin ? $db['users'] : [$updatedUser]
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
        $defaultTokens = 5;
        $foundUser = [
            'id' => 'usr_' . time() . '_' . substr(md5($email), 0, 5),
            'name' => $name !== '' ? $name : explode('@', $email)[0],
            'username' => $email,
            'email' => $email,
            'phone' => '',
            'password' => bin2hex(random_bytes(8)),
            'role' => 'user',
            'tokens' => $defaultTokens,
            'balance' => $defaultTokens * intval($db['tokenPrice']),
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
        'tokenPrice' => $db['tokenPrice'],
        'user' => $foundUser,
        'users' => $isAdmin ? $db['users'] : [$foundUser],
        'recharges' => $isAdmin ? $db['recharges'] : [],
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
        'tokenPrice' => $db['tokenPrice'],
        'user' => $foundUser,
        'users' => $isAdmin ? $db['users'] : [$foundUser],
        'recharges' => $isAdmin ? $db['recharges'] : array_values(array_filter($db['recharges'], function($r) use ($foundUser) {
            return ($r['userId'] ?? '') === ($foundUser['id'] ?? '');
        })),
        'history' => $isAdmin ? $db['history'] : array_values(array_filter($db['history'], function($h) use ($foundUser) {
            return ($h['userName'] ?? '') === ($foundUser['name'] ?? '');
        }))
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'register_recharge') {
    $adminId = (string)($input['adminId'] ?? '');
    $userId = (string)($input['userId'] ?? '');
    $amount = intval($input['amount'] ?? 0);
    $tokensAdded = intval($input['tokensAdded'] ?? 0);
    $depositLocation = trim((string)($input['depositLocation'] ?? ''));
    $reference = trim((string)($input['reference'] ?? ''));

    $adminUser = null;
    foreach ($db['users'] as $u) {
        if (($u['id'] ?? '') === $adminId && in_array($u['role'] ?? '', ['superadmin', 'admin'], true)) {
            $adminUser = $u;
            break;
        }
    }
    if (!$adminUser) {
        echo json_encode(['ok' => false, 'error' => 'No autorizado para registrar recargas.']);
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
        echo json_encode(['ok' => false, 'error' => 'Usuario destino no encontrado.']);
        exit;
    }

    $targetUser = &$db['users'][$targetIdx];
    $targetUser['balance'] = intval($targetUser['balance'] ?? 0) + $amount;
    if (($targetUser['tokens'] ?? 0) !== 'unlimited') {
        $targetUser['tokens'] = intval($targetUser['tokens'] ?? 0) + $tokensAdded;
    }

    $rechargeRecord = [
        'id' => 'rec_' . time() . '_' . rand(100, 999),
        'userId' => $targetUser['id'],
        'userName' => $targetUser['name'],
        'username' => $targetUser['username'],
        'amount' => $amount,
        'tokensAdded' => $tokensAdded,
        'tokenPriceAtTime' => $db['tokenPrice'],
        'depositLocation' => $depositLocation !== '' ? $depositLocation : 'No especificado',
        'reference' => $reference,
        'registeredBy' => $adminUser['name'],
        'timestamp' => date('d/m/Y H:i')
    ];

    array_unshift($db['recharges'], $rechargeRecord);
    if (count($db['recharges']) > 200) {
        $db['recharges'] = array_slice($db['recharges'], 0, 200);
    }

    saveDb($dbFile, $db);
    echo json_encode([
        'ok' => true,
        'user' => $targetUser,
        'users' => $db['users'],
        'recharges' => $db['recharges']
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
    $tokenPrice = intval($db['tokenPrice'] ?? 10000);
    $deductedBalance = 0;

    if (($user['tokens'] ?? 0) !== 'unlimited') {
        $num = intval($user['tokens'] ?? 0);
        if ($num <= 0) {
            echo json_encode(['ok' => false, 'error' => 'Sin tokens disponibles.']);
            exit;
        }
        $user['tokens'] = $num - 1;
        $curBal = intval($user['balance'] ?? 0);
        $deductedBalance = min($curBal, $tokenPrice);
        $user['balance'] = max(0, $curBal - $tokenPrice);
    }
    $user['usedTokens'] = intval($user['usedTokens'] ?? 0) + 1;

    if (is_array($historyItem)) {
        $historyItem['tokenCost'] = ($user['tokens'] === 'unlimited') ? 0 : $tokenPrice;
        $historyItem['balanceAfter'] = $user['balance'];
        array_unshift($db['history'], $historyItem);
        if (count($db['history']) > 200) {
            $db['history'] = array_slice($db['history'], 0, 200);
        }
    }

    saveDb($dbFile, $db);
    echo json_encode([
        'ok' => true,
        'tokenPrice' => $tokenPrice,
        'user' => $user,
        'history' => $db['history']
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['ok' => false, 'error' => 'Acción no reconocida.']);
