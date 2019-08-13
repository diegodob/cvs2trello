# csv2trello
An example NodeJS project to import CSV files to trello.
![Men at work https://commons.wikimedia.org/wiki/File:Men-at-work-148408.svg](https://upload.wikimedia.org/wikipedia/commons/3/3b/Men-at-work-148408.svg)

# csv2trello
Utilidad para importar a un tablero de trello los tickets de OTRS.
Actualmente en estado "proof-of-concept" no productivo.

#Pre requisitos
Node.jd
Modulo commander
Modulo csv-parse
Modulo  fs
Modulo trello

#Instrucciones de instalación

## 1. Configurar un reporte de OTRS (estadisticas) 
El reoprte debe exportar a CSV y debe contener las siguientes columnas en orden:
0-Number
1-Ticket#
2-Age
3-Title
4-Created
5-Changed
6-Queue
7-State
8-Priority
9-Customer User
10-CustomerID
11-Agent/Owner
12-Responsible

El reporte debe dejarse en .\examples\tickets.csv. Se le debe remover la primer linea que contiene los headers.

Yo utilizo un archivo croneado con el siguiente código.

'''

#El script deja el archivo siempre con un nombre distinto, por eso me aseguro de borrar todo primero y luego renombrar todo lo que haya con ese nombre
rm /var/www/otrs2trello/*
/usr/share/otrs/bin/otrs.GenerateStats.pl -n 10014 -f CSV -o /var/www/otrs2trello
#Dejo el archivo disponible con un nombre determinado y para descargarlo con apache
mv /var/www/otrs2trello/* /var/www/otrs2trello/ticket.csv
#Remueve primer linea que tiene las cabeceras
sed -i '1d'  /var/www/otrs2trello/ticket.csv
chmod +r  /var/www/otrs2trello/ticket.csv
'''

NOTA 1) E


## 2. Crear un tablero de Trello
Para el ejemplo utilizaremos uno llamado "OTRS"

## 3. En el tablero de trello crear una "lista de tarjetas" de Trello por cada "cola" del OTRS

## 4. Clonar el repositorio
git clone https://github.com/diegodob/cvs2trello.git

## 5. Instalar dependencias
npm install

## Configurar el script 
Editar el archivo config.js
Más sobre el API de Trello: https://trello.com/app-key

config.trello.key = "poner key de trello";
config.trello.token = "poner token de trello";
config.trello.boardName = "OTRS";

## 6.
Ejecutar el script
node index.js -f .\examples\tickets.csv

