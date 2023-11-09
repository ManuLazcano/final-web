<?php
require_once('../include.php');
require_once('../lib/jwt_helper.php');
require_once('../config/jwt.php');

/***************************** RUTEO ********************************/

// if (!isset($_GET['accion'])) {
//     outputError();
// }

/**Generamos el name de la función a la que tenemos que llamar, concatenando el método con la acción solicitada.*/
$metodo = strtolower($_SERVER['REQUEST_METHOD']); // Método de petición empleado para acceder a la página, por ejemplo 'GET', 'HEAD', 'POST', 'PUT'.
$accion = explode('/', strtolower($_GET['accion'])); // 'accion' lo estoy "definiendo" en .htaccess
$funcionNombre = $metodo . ucfirst($accion[0]);
$parametros = array_slice($accion, 1);
if (count($parametros) >0 && $metodo == 'get') {
    $funcionNombre = $funcionNombre.'ConParametros';
}
if (function_exists($funcionNombre)) {
    call_user_func_array ($funcionNombre, $parametros);
} else {
    outputError(400);
}


/***************************** SEGURIDAD ********************************/

function requireLogin () {
    $authHeader = getallheaders();
    try {
        list($jwt) = @sscanf($authHeader['Authorization'], 'Bearer %s');
        $datos = JWT::decode($jwt, JWT_KEY, JWT_ALG);
        $link = conectarBD();
        $jwtSql = mysqli_real_escape_string($link, $jwt);
        $result = mysqli_query($link, $sql = "SELECT 1 FROM tokens WHERE token = '$jwtSql'");
        if (!$result) {            
            outputError(500, mysqli_error($link));
        } else if (mysqli_num_rows($result)!=1) {
            outputError(401);
        }
        mysqli_close($link);
    } catch(Exception $e) {
        outputError(401);
    }
}


function limpiarTokensExpirados () {
    $link = conectarBD();
    $result = mysqli_query($link, "SELECT token FROM tokens");
    while ($fila=mysqli_fetch_assoc($result)) {
        $jwt = $fila['token'];
        try {
            // JWT::decode($jwt, JWT_KEY, JWT_ALG);
            $jwtSql = mysqli_real_escape_string($link, $jwt);
            mysqli_query($link, "DELETE FROM tokens WHERE token = '$jwtSql'");
        } catch(Exception $e) {
            // $jwtSql = mysqli_real_escape_string($link, $jwt);
            // mysqli_query($link, "DELETE FROM tokens WHERE token = '$jwtSql'");
            outputError(500);
        }
    }
    mysqli_close($link);
}


/***************************** API ********************************/

function postLogin() {
    limpiarTokensExpirados(); // borra de la BBDD todos los tokens inválidos (expirados).
    $loginData = json_decode(file_get_contents("php://input"), true);
    $link = conectarBD();

    $email = mysqli_real_escape_string($link, $loginData['email']);
    $password = mysqli_real_escape_string($link, $loginData['password']);

    $sql = "SELECT user.password FROM user WHERE user.email = '$email'";
    $result = mysqli_query($link, $sql);
    if($result === false) {                
        mysqli_close($link);
        outputError(500);
    }
    $passwordArray = mysqli_fetch_assoc($result); 
    $hash = $passwordArray['password'];
    if(!password_verify($password, $hash)){
        outputError(403);
    }

    $sql = "SELECT id, name FROM user WHERE email='$email' AND `password`='$hash'";
    $result = mysqli_query($link, $sql);
    if($result && mysqli_num_rows($result)==1) {
        $logged = mysqli_fetch_assoc($result);
        $data = [
            'uid'       => $logged['id'],
            'name'    => $logged['name'],
            'exp'       => time() + JWT_EXP,
        ];
        $jwt = JWT::encode($data, JWT_KEY, JWT_ALG);
        $jwtSql = mysqli_real_escape_string($link, $jwt);
        mysqli_query($link, "DELETE FROM tokens WHERE token = '$jwtSql'");
        if (mysqli_query($link, "INSERT INTO tokens (token) VALUES ('$jwtSql')")) {
            outputJson(['jwt' => $jwt]);
        } else {
            outputError(500, mysqli_error($link));
        }
    }
    outputError(401);
}

function postLogout() {
    requireLogin();
    $link = conectarBD();
    $authHeader = getallheaders();
    list($jwt) = @sscanf( $authHeader['Authorization'], 'Bearer %s');
    if (!mysqli_query($link, "DELETE FROM tokens WHERE token = '$jwt'")) {
        outputError(403);
    }
    mysqli_close($link);
    outputJson([]);
}



/***************************** API - Métodos HTTP para PUBLICACIONES ********************************/
/*
    getPublicaciones
(S) [
        {
            "title": "El title",
            "content": "Loremp ",
            "date": "2023-06-14",
            "nick_name": "Fede"        
        },
        {}  
    ]
*/
function getPublicaciones() {
    requireLogin();
    $link = conectarBD();
    $sql = "SELECT publication.title, publication.content, publication.date, user.nick_name 
            FROM `publication`
                INNER JOIN user ON user.id = publication.id_user;"; 

    $result = mysqli_query($link, $sql); 
    if($result === false) {
        echo "La consulta falló: " . mysqli_error($link);
        mysqli_close($link);
        outputError(500);
    }

    $return = []; // Array para almacenar los datos a enviar

    //Obtiene la SIGUEINTE FILA de resultados de la consulta en forma de un arreglo asociativo. 
    //Cada fila de resultados se almacena en la variable $row.
    while($row = mysqli_fetch_assoc($result)) {
        $return[] =  $row; //Guardo la fila actual en el array
    }

    mysqli_free_result($result); 
    mysqli_close($link);
    outputJson($return); // Devuelve los resultados en formato JSON con un código de respuesta 200
}


/*
         getPublicaciones/1
(S) 
    {
        "title": "El title",
        "content": "Loremp ",
        "date": "2023-06-14",
        "nick_name": "Fede"        
    }
*/
function getPublicacionesConParametros($id) {
    requireLogin();
    $link = conectarBD();
    settype($id, 'integer');
    $sql = "SELECT publication.title, publication.content, publication.date, user.nick_name 
            FROM `publication`
                INNER JOIN user ON user.id = publication.id_user
            WHERE publication.id = $id;"; 

    $result = mysqli_query($link, $sql); 
    if($result === false) {
        echo "La consulta falló: " . mysqli_error($link);
        mysqli_close($link);
        outputError(500);
    }

    //Verifico si existe la publicación con el id proporcionado
    if(mysqli_num_rows($result) == 0) {
        mysqli_close($link);
        outputError(404);
    }

    $return = mysqli_fetch_assoc($result);

    mysqli_free_result($result); 
    mysqli_close($link);
    outputJson($return); 
}


/*
         getCategorias/1
(S) 
    [
        {
            "title": "El title",
            "content": "Loremp ",
            "date": "2023-06-14",
            "nick_name": "Fede",
            "federation": "WRPF"        
        },
        {}
    ]
*/
function getFederacionesConParametros($id) {
    requireLogin();
    $link = conectarBD();
    settype($id, 'integer');
    $sql = "SELECT publication.title, publication.content, publication.date, user.nick_name, federation.federation
            FROM `publication`
                INNER JOIN user ON user.id = publication.id_user
                INNER JOIN federation ON federation.id = publication.id_federation
            WHERE publication.id_federation = $id;"; 

    $result = mysqli_query($link, $sql); 
    if($result === false) {
        echo "La consulta falló: " . mysqli_error($link);
        mysqli_close($link);
        outputError(500);
    }

    //Verifico si existe la publicación con el id proporcionado
    if(mysqli_num_rows($result) == 0) {
        mysqli_close($link);
        outputError(404);
    }

    $return = []; 

    //Obtiene la SIGUEINTE FILA de resultados de la consulta en forma de un arreglo asociativo. 
    //Cada fila de resultados se almacena en la variable $row.
    while($row = mysqli_fetch_assoc($result)) {
        $return[] =  $row; //Guardo la fila actual en el array
    }

    mysqli_free_result($result); 
    mysqli_close($link);
    outputJson($return); 
}

/*
        postPublicaciones
(E)
    {
        "title": "Un title",
        "content": "loprem ipsum",
        "id_user": 2,
        "id_federation": 1
    }
    //Fecha = CURDATE() //Fecha actual
*/
function postPublicaciones() {
    requireLogin();
    $link = conectarBD();
    
    // Recupera y valida los datos enviados por el cliente
   $data = json_decode(file_get_contents('php://input'), true);

    if (
        isset($data['title']) && !empty($data['title']) &&
        isset($data['content']) && !empty($data['content']) &&
        //isset($data['date']) && !empty($data['date']) &&
        isset($data['id_user']) &&
        isset($data['id_federation'])
    ) {
        // Escapa los datos
        $title = mysqli_real_escape_string($link, $data['title']);
        $content = mysqli_real_escape_string($link, $data['content']);
       // $date = mysqli_real_escape_string($link, $data['date']);
        $id_user = (int) $data['id_user'];
        $id_federation = (int) $data['id_federation'];
    } else {
        mysqli_close($link);        
        outputError(400);
    }

    $sql = "INSERT INTO publication (title, content, date, id_user, id_federation) VALUES ('$title', '$content', CURDATE(), $id_user, $id_federation)";
    $result = mysqli_query($link, $sql);

    if ($result === false) {
        echo "La consulta falló: " . mysqli_error($link);
        mysqli_close($link);
        outputError(500);
    }

    // Obtener el ID del nuevo registro
    $id = mysqli_insert_id($link);
    
    mysqli_close($link);
    outputJson(['id' => $id]);
}


/*
        patchPublicaciones
(E)
    {
        "title": "Un title",
        "content": "loprem ipsum",
        "id_federation": 1
    }
*/
function patchPublicaciones($id) {
    requireLogin();
    $link = conectarBD();
    settype($id, 'integer');

    $sql = "SELECT title, content, id_federation FROM publication WHERE id = $id";
    $result = mysqli_query($link, $sql);
    if ($result === false) {
        echo "La consulta falló: " . mysqli_error($link);
        mysqli_close($link);
        outputError(500);
    }
    // Verificar si existe el actor con el ID proporcionado
    if (mysqli_num_rows($result) == 0) {
        mysqli_close($link);
        outputError(404); // Actor no encontrado
    }


    $data = json_decode(file_get_contents('php://input'), true);
    if (
        isset($data['title']) && !empty($data['title']) &&
        isset($data['content']) && !empty($data['content']) &&
        isset($data['id_federation'])
    ) {
        // Escapa los datos
        $title = mysqli_real_escape_string($link, $data['title']);
        $content = mysqli_real_escape_string($link, $data['content']);
        $id_federation = (int) $data['id_federation'];
    } else {
        mysqli_close($link);    
        outputError(400);
    }

    $sql = "UPDATE publication SET
            title = '$title',
            content = '$content',
            id_federation = $id_federation
            WHERE id = $id";
    $result = mysqli_query($link, $sql);

    if ($result === false) {
        echo "La consulta falló: " . mysqli_error($link);
        mysqli_close($link);
        outputError(500);
    }
    
    mysqli_close($link);
    outputJson(['id' => $id]);
}


/*
        deletePublicaciones/2
*/
function deletePublicaciones($id) {
    requireLogin();
    $link = conectarBD();
    settype($id, 'integer');

    $sql = "DELETE FROM publication WHERE id = $id";
    $result = mysqli_query($link, $sql);

    if ($result === false) {
        echo "La consulta falló: " . mysqli_error($link);
        mysqli_close($link);
        outputError(500);
    }

    // Verificar si se eliminó la publicación con éxito
    if(mysqli_affected_rows($link) == 0) {
        outputError(404);
    }

    mysqli_close($link);
    outputJson([]); 
}


/***************************** API - Métodos HTTP para USUARIOS ********************************/
/*
         getUsuario/1
(S) 
    {
        "nick_name": "Fede",
        "name": "Federico De Soya",
        "email": "fede@gmail.com"       
    }
*/
function getUsuariosConParametros($id) {
    requireLogin();
    $link = conectarBD();
    settype($id, 'integer');
    $sql = "SELECT user.nick_name, user.name, user.email 
            FROM `user` 
            WHERE user.id = $id;"; 

    $result = mysqli_query($link, $sql); 
    if($result === false) {
        echo "La consulta falló: " . mysqli_error($link);
        mysqli_close($link);
        outputError(500);
    }

    //Verifico si existe la publicación con el id proporcionado
    if(mysqli_num_rows($result) == 0) {
        mysqli_close($link);
        outputError(404);
    }

    $return = mysqli_fetch_assoc($result);

    mysqli_free_result($result); 
    mysqli_close($link);
    outputJson($return); 
}


/*
        postUsuarios
(E)
    {
        "nick_name": "Aena270",
        "name": "Aenea Kets",
        "email": "aenea@gmail.com",
        "password": "password encriptado"
    }
    //Por defecto el rol es de user
*/
function postUsuarios() {
    $link = conectarBD();
    
    // Recupera y valida los datos enviados por el cliente
   $data = json_decode(file_get_contents('php://input'), true);

    if (
        isset($data['nick_name']) && !empty($data['nick_name']) &&
        isset($data['name']) && !empty($data['name']) &&
        isset($data['email']) && !empty($data['email']) && filter_var($data['email'], FILTER_VALIDATE_EMAIL) &&
        isset($data['password']) && !empty($data['password'])
    ) {
        // Escapa los datos
        $nick_name = mysqli_real_escape_string($link, $data['nick_name']);
        $name = mysqli_real_escape_string($link, $data['name']);
        $email = mysqli_real_escape_string($link, $data['email']);
        $password = mysqli_real_escape_string($link, $data['password']);
    } else {
        mysqli_close($link);        
        outputError(400);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $sql = "INSERT INTO user (nick_name, name, email, `password`) VALUES ('$nick_name', '$name', '$email', '$hash');";
    $result = mysqli_query($link, $sql);

    if ($result === false) {
        echo "La consulta falló: " . mysqli_error($link);
        mysqli_close($link);
        outputError(500);
    }

    // Obtener el ID del nuevo registro
    $id = mysqli_insert_id($link);
    
    mysqli_close($link);
    outputJson(['id' => $id]);
}


/*
        patchUsuarios
(E)
    {
        "nick_name": "Aena270",
        "name": "Aenea Kets",
        "email": "aenea@gmail.com",
       // "password": "password encriptado" DE MOMENTO NO PERMITO ACTUALIZAR LA CONTRASEÑA, ¿Tal vez es mejor hacer un patch específico para la contraseña?
    }
    //Por defecto el rol es de user
*/
function patchUsuarios($id) {
    requireLogin();
    $link = conectarBD();
    settype($id, 'integer');
    
    // Recupera y valida los datos enviados por el cliente
   $data = json_decode(file_get_contents('php://input'), true);

    if (
        isset($data['nick_name']) && !empty($data['nick_name']) &&
        isset($data['name']) && !empty($data['name']) &&
        isset($data['email']) && !empty($data['email']) && filter_var($data['email'], FILTER_VALIDATE_EMAIL)// &&
      //  isset($data['password']) && !empty($data['password'])
    ) {
        // Escapa los datos
        $nick_name = mysqli_real_escape_string($link, $data['nick_name']);
        $name = mysqli_real_escape_string($link, $data['name']);
        $email = mysqli_real_escape_string($link, $data['email']);
      //  $password = mysqli_real_escape_string($link, $data['password']);
    } else {
        mysqli_close($link);        
        outputError(400);
    }

    //$hash = password_hash($password, PASSWORD_DEFAULT);
    // $sql = "UPDATE user SET
    //         nick_name = '$nick_name',
    //         name = '$name',
    //         email = '$email',
    //         `password` = '$hash'
    //         WHERE user.id = $id";

    $sql = "UPDATE user SET
            nick_name = '$nick_name',
            name = '$name',
            email = '$email'
            WHERE user.id = $id";
    $result = mysqli_query($link, $sql);

    if ($result === false) {
        echo "La consulta falló: " . mysqli_error($link);
        mysqli_close($link);
        outputError(500);
    }
    
    mysqli_close($link);
    outputJson(['id' => $id]);
}

/*
        deleteUsuarios/2
*/
function deleteUsuarios($id) {
    requireLogin();
    $link = conectarBD();
    settype($id, 'integer');

    $sql = "DELETE FROM user WHERE id = $id";
    $result = mysqli_query($link, $sql);

    if ($result === false) {
        echo "La consulta falló: " . mysqli_error($link);
        mysqli_close($link);
        outputError(500);
    }

    if(mysqli_affected_rows($link) == 0) {
        outputError(404);
    }

    mysqli_close($link);
    outputJson([]); 
}



/***************************** API - Métodos HTTP para COMENTARIO ********************************/

/*
    getComentarios/1 //Trae todos los comments de una publicación
(S) 
    [
        {
            "content": "Lorem ipsum",
            "date": "2023-10-20 15:12:06",
            "nick_name": "Aenea270"       
        },
        {}
    ]   
*/
function getComentariosConParametros($id) {
    requireLogin();
    $link = conectarBD();
    settype($id, 'integer');

    $sql = "SELECT comment.content, comment.date, user.nick_name 
            FROM comment 
                INNER JOIN user ON user.id = comment.id_user 
            WHERE comment.id_publication = $id;";
    $result = mysqli_query($link, $sql);
    if($result === false) {
        echo "La consulta falló: " . mysqli_error($link);
        mysqli_close($link);
        outputError(500);
    }   

    $return = [];    
    while($row = mysqli_fetch_assoc($result)) {
        $return[] = $row;
    }

    mysqli_free_result($result); 
    mysqli_close($link);
    outputJson($return); 
}


/*
        postComentarios
(E)
    {
        "content": "lorem ipsum",
        "id_user": 3,
        "id_publication": 12
    }
    //date = current_timestamp() - Ejemplo: "2023/10/20 16:00:00"
*/
function postComentarios() {
    requireLogin();
    $link = conectarBD();

    $data = json_decode(file_get_contents('php://input'), true);
    if(
        isset($data['content']) && !empty($data['content']) &&
        isset($data['id_user']) && !empty($data['id_user']) &&
        isset($data['id_publication']) && !empty($data['id_publication'])
    ) {
        $content = mysqli_real_escape_string($link, $data['content']);
        $id_user = $data['id_user'];
        $id_publication = $data['id_publication'];
    } else {
        mysqli_close($link);        
        outputError(400);
    }

    $sql = "INSERT INTO comment (content, id_user, id_publication) VALUES ('$content', $id_user, $id_publication);";
    $result = mysqli_query($link, $sql);
    if($result === false) {
        echo "La consulta falló: " . mysqli_error($link);
        mysqli_close($link);
        outputError(500);
    } 

    $id = mysqli_insert_id($link);
    
    mysqli_close($link);
    outputJson(['id' => $id]);
}


/*
        patchComentarios
(E)
    {
       "content": "lorem ipsum"
    }
    //date = current_timestamp() - Ejemplo: "2023/10/20 16:00:00"
*/
function patchComentarios($id) {
    requireLogin();
    $link = conectarBD();

    $data = json_decode(file_get_contents('php://input'), true);
    if(isset($data['content']) && !empty($data['content'])) {
        $content = mysqli_real_escape_string($link, $data['content']);
    } else {
        mysqli_close($link);        
        outputError(400);
    }

    $sql = "UPDATE comment 
            SET content = '$content' 
            WHERE comment.id_publication = $id";
    $result = mysqli_query($link, $sql);
    if($result === false) {
        echo "La consulta falló: " . mysqli_error($link);
        mysqli_close($link);
        outputError(500);
    } 
    
    mysqli_close($link);
    outputJson(['id' => $id]);
}

/*
        deleteComentarios/12
*/
function deleteComentarios($id) {
    requireLogin();
    $link = conectarBD();
    settype($id, 'integer');

    $sql = "DELETE FROM comment WHERE id = $id";
    $result = mysqli_query($link, $sql);

    if ($result === false) {
        echo "La consulta falló: " . mysqli_error($link);
        mysqli_close($link);
        outputError(500);
    }

    if(mysqli_affected_rows($link) == 0) {
        outputError(404);
    }

    mysqli_close($link);
    outputJson([]); 
}

/*
getComentariosConParametros //Trae los comentarios de una publicación específica (creo que voy a tener que modificar getPublicacionesConParametro o tal vez no sea necesario) de momento no modifico la de publicaciones
*/
