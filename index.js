#!/usr/bin/env node
"use strict";
// **** IMPORT SECTION ****************************************

var program = require('commander');
var parse = require('csv-parse');
var fs = require('fs')
var Trello = require("trello");
var Config = require('./config');
var Ticket = require('./lib/ticket');

// **** INITIALIZATE TRELLO API ****************************************

var trello = new Trello(Config.trello.key, Config.trello.token);

// **** BUSSINES LOGIC ****************************************

// **** FILE PARSING SECTION ****************************************

function getTickets(csvData) {
		//remove headers row
		csvData.shift();
		//"Ticket#";"Title";"Created";"Queue";"State";"Priority";"Customer User";"Service";"Agent/Owner"
		var ticketList = [];
		csvData.forEach(function(aRow) {
				var aTicket = new Ticket(
						aRow[0],
						aRow[1],
						aRow[2],
						aRow[3],
						aRow[4],
						aRow[5],
						aRow[6],
						aRow[7],
						aRow[8]
				);

				ticketList.push(aTicket);
		});
		//order ticket list
		ticketList.sort((a,b) => a.created < b.created);

		return ticketList;
}


function getParseCsvPromise(filename) {
		return new Promise(function(resolve, reject) {
				var csvData=[];
				fs.createReadStream(program.file + "")
					.pipe(parse({delimiter: ';'}))
					.on('data', function(csvrow) {
						//console.log("Row: ", csvrow);
						//do something with csvrow
						csvData.push(csvrow);
					})
					.on('end',function() {
							resolve(csvData);
				  });
			});

}

function selectBoardOrFail(boards) {
	var aFilteredBoardList = boards.filter(function(otherBoard) { return otherBoard.name == Config.trello.boardName });
	var aBoard = aFilteredBoardList.shift();
	if (aBoard === undefined) {
		console.log("Ups... board wasn't found: ", Config.trello.boardName);
		throw new Error("Board wasn't found: ", Config.trello.boardName);
	}
	console.log("Board name: ", aBoard.name);
	return aBoard;

}

//Return list of promises
function getCardsOnListPromises(someLists) {
  	return someLists.map((aList) => trello.getCardsOnList(aList.id));
}

function flattenArrayOfArray(anArrayOfArrays) {
		return anArrayOfArrays.reduce((aFlattenArray, anArray) => aFlattenArray.concat(anArray), []);
}

function getDeleteCardsPromise(someCards) {
		var somePromises = someCards.map((aCard) => trello.deleteCard(aCard.id));
		return Promise.all(somePromises);
}

function getStickerPromiseCenter(cardId, stickerName, zOrder) {
	return trello.addStickerToCard(cardId, stickerName, 35, 0, 0, zOrder);
}

function getStickerPromiseLeft(cardId, stickerName, zOrder) {
	return trello.addStickerToCard(cardId, stickerName, 5, 0, 0, zOrder);
}

function getStickerPromiseRight(cardId, stickerName, zOrder) {
	return trello.addStickerToCard(cardId, stickerName, 70, 0, 0, zOrder);
}

function createCards(someLists, someTickets) {
		//generate auxiliar index of lists
		var listsMap = [];
		someLists.forEach(function(aList) { listsMap[aList.name] = aList });

		//Converts tickets into card
		someTickets.forEach( function (aTicket) {

			var aList = listsMap[aTicket.ticketQueue];
			if (aList == undefined) {
					console.log("Ups... list wasn't found: ", aTicket.ticketQueue);
					throw new Error("List wasn't found: ", aTicket.ticketQueue);
			}
			var anAddCardPromise = trello.addCard(aTicket.cardTitle, aTicket.cardDescription, aList.id);
			anAddCardPromise.then((aCard) => {
					console.log("*** Created card: ", aCard.name, " [", aCard.id, "]");
					var zOrder = 1;
					var stickerPromises = [];
					if (aTicket.star) {stickerPromises.push(getStickerPromiseCenter(aCard.id, "star", zOrder++))};

					if (aTicket.thumbsup) {stickerPromises.push(getStickerPromiseCenter(aCard.id, "thumbsup", zOrder++))};

					if (aTicket.clock) {stickerPromises.push(getStickerPromiseLeft(aCard.id, "clock", zOrder++))};

					if (aTicket.warning) {stickerPromises.push(getStickerPromiseCenter(aCard.id, "warning", zOrder++))};

					if (aTicket.laugh) {stickerPromises.push(getStickerPromiseCenter(aCard.id, "laugh"), zOrder++)};

					if (aTicket.smile) {stickerPromises.push(getStickerPromiseCenter(aCard.id, "smile", zOrder++))};

					if (aTicket.huh) {stickerPromises.push(getStickerPromiseCenter(aCard.id,"huh", zOrder++))};

					if (aTicket.frown) {stickerPromises.push(getStickerPromiseCenter(aCard.id,"frown", zOrder++))};

					if (aTicket.rocket) {stickerPromises.push(getStickerPromiseRight(aCard.id,"heart", zOrder++))};

					if (stickerPromises.length != 0) {
						return Promise.all(stickerPromises);
					}


			}).catch( (anError) => {throw anError} );

	});

}

// **** MAIN SECTION ****************************************

function main() {
	program
	  .version('0.1.0')
	  .usage('-f <file.csv>')
	  .option('-f, --file <value>', 'A file.csv argument')
	  .parse(process.argv);

	console.log('Csv2Trello');
	console.log(' file: %j', program.file + "");

  //var csvData = parseCsv(program.file);



	//var getBoardPromise = trello.getBoards("me");

	var someTickets;

	getParseCsvPromise(program.file).then( (csvData) => {
			console.log("csvData: ", csvData);
			someTickets = getTickets(csvData);
			console.log("someTickets: ", someTickets);

			return trello.getBoards("me");
	}).then( (someBoards) => {

			var aBoard = selectBoardOrFail(someBoards);

			var getListsOnBoardPromise = trello.getListsOnBoard(aBoard.id);
			getListsOnBoardPromise.then( (someLists) => {
					console.log("Existing lists: ", someLists.map( (aList) => aList.name))


					var someGetCardsOnListPromises = getCardsOnListPromises(someLists);
					var aPromiseThatRetrieveAllCardsOnBoard = Promise.all(someGetCardsOnListPromises);

					aPromiseThatRetrieveAllCardsOnBoard.then((anArrayOfCards) => {
							var anArrayWithAllCards = flattenArrayOfArray(anArrayOfCards);
							console.log("Existing cards: ", anArrayWithAllCards.map( (aCard) => aCard.name));

							var aPromiseThatDeleteAllCards = getDeleteCardsPromise(anArrayWithAllCards);
							aPromiseThatDeleteAllCards.then( (nothing) => { console.log("Deleting all cards... ") } ).catch( (anError)=> { throw anError } );

							createCards(someLists, someTickets);


					}).catch( (anError)=> { throw anError } );

			}).catch( (anError) => {throw anError} );



	}).catch( (anError) => {
			console.error("=-=-=-=-=ERROR=-=-=-=", anError);
			console.error("error: ", anError);
			console.error("=-=-=-=-=ERROR=-=-=-=", anError);

	});


}

main();
