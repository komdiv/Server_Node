const { exec } = require('child_process');
const iconv = require('iconv-lite');
const fs = require('fs');

function getUsers() {
  return new Promise((resolve, reject) => {
    exec('net user', { encoding: 'buffer' }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        const result = iconv.decode(stdout, 'cp866');
        let users = result.split('\r\n').slice(4, -2);
        const usersList = users;

        users = usersList.map( element => (
            ((element.replace(/\s+/g,' ')).split(" "))[1]
            ));
          users.pop(); //это удалит последнюю строку, где сказано что "Операция прошла успешно"
        resolve(users);
      }
    });
  });
}

async function main() {
    //Эта функция более не требуется. Она в файл записывала список юзеров
  try {
    const usersList = await getUsers();
    const users=usersList;
     console.log('-------------------');
     console.log(users);
     console.log('====================');
     // открытие файла
fs.open('file.txt', 'w', (err, file) => {
  if (err) throw err;
  const data = ['Hello', 'world! together!! и Привет.'];
  //const data = 'Hello, world!';
  const infoToFile = JSON.stringify(users);
    // запись данных в файл
  fs.write(file, infoToFile, (err) => {
    if (err) throw err;
    console.log('Список юзеров windows только что был записан в файл');
  });
});

    console.log(users);
  } catch (error) {
    console.error(error);
    return false;
  }

  return users;//возвращаем список юзеров винды
}

//main(); //Выполню и список запишется в файл "file.txt"



//------------------------------------SERVER--------------------------------------------------


function getTekPage(queryObject){
    let tekNameUser = JSON.stringify(queryObject.name)
    const pagesList = ['index.html', 'page2.html'];
    console('---->>' + tekNameUser);
    
    switch (tekNameUser) {
        case true:
            return [queryObject.name, pagesList[1]]; 
            break;
    }
    return pagesList[0];
}


//import React from 'react';
let tekPage;
async function serverStart() {
    try{
        //----------Перед стартом получим полный список всех пользователей windows---
        console.log('Из сервера пытаемся получить список');
        const users = await getUsers();
        console.log('Пришел этот массив->' + users);
        //let users = result.split('\r\n').slice(4, -2);
        
        let port = 3001;
        //console.log('Дыр дыр дыр едем на порт ' + port);

        const http = require('http');
        const url = require('url');
        
        //-------Старт-----SERVERA----------------------
        const server = http.createServer((req, res)=>{
            let ff = req.url;
            //console.log("----->------>" + ff);
            let tekUrl = req.url;
            const queryObject = url.parse(req.url, true).query;

            let tekNameUser = JSON.stringify(queryObject.name);
            let isTekNameUser = false;
            users.forEach(element => {
                console.log((JSON.stringify(element)) + '=?' + tekNameUser);
                if(JSON.stringify(element)===tekNameUser) {
                    isTekNameUser=true;
                    //Логирование процесса сравнения:
                    //console.log(JSON.stringify(element) + '=' + tekNameUser + '<=========');
                }// проверка на валидность полученного имени
            });
                tekPage = tekNameUser? 'page2.html':'index.html';
                console.log("=======>" + tekNameUser + " ? = " + isTekNameUser);
                    fs.readFile(tekPage, (err, data) => {
                        if (err) {
                            console.log('ERROR = Читаем-> index.html');
                        // Если произошла ошибка, отправляем статус 500 и сообщение об ошибке
                        res.writeHead(500, {'Content-Type': 'text/plain'});
                        res.end('Internal Server Error');
                        } else {
                        // Отправляем статус 200 и содержимое файла index.html
                        console.log('Выгружаем ответ на сервер из->' + tekPage);
                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.write(data);                        
                        
                        res.end(`<script>
                                    let isUser = "${isTekNameUser}";
                                    let listUsers = "${users}";
                                </script>`);                        
                        users
                        //res.end();
                        }
                    });            
        });

        server.listen(port, 'localHost', (error)=>{
            error? console.log(error):console.log('Server well started on port ' + port);
        });
    } catch (error) {
        console.error("Ошибка на сервере Список юзеров получить не удалось.(может текстовый файл со списком юзеров открыт)" + error);
    }
}
//=================================SERVER=====================================================

console.log("Тестирование проводилось на windiws 10.");
console.log("Поиск пользователей идет с учетом регистра");
console.log("Запускаем сервак ->");
serverStart()