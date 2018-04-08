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

function getAllStickerForACardPromise(aTicket, aCard) {
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
}

function getAllStickersForAllCards(trelloListsMap, someTickets, aCardList) {
		var ticketByCardIdIndex = [];

		for (var i = 0; i < aCardList.length; i++) {
				ticketByCardIdIndex[aCardList[i].id] =  someTickets[i];
		}

		var allStickerPromisesList = [];
		aCardList.forEach( (aCard) => {
				var aTicket = ticketByCardIdIndex[aCard.id];
				console.log("Add sticker for card: %s.", aCard.name);
				allStickerPromisesList.push(getAllStickerForACardPromise(aTicket, aCard));
		});
		return allStickerPromisesList;
}

function getCreateAllCardsPromise(trelloListsMap, someTickets) {

		var allCardsPromiseList = [];
		someTickets.forEach( function (aTicket) {
				var aList = trelloListsMap[aTicket.ticketQueue];
				if (aList == undefined) {
						console.log("Ups... list wasn't found: ", aTicket.ticketQueue);
						throw new Error("List wasn't found: ", aTicket.ticketQueue);
				}
				var anAddCardPromise = trello.addCard(aTicket.cardTitle, aTicket.cardDescription, aList.id);
				allCardsPromiseList.push(anAddCardPromise);
		});
		return Promise.all(allCardsPromiseList);
}

function main() {
		program
		  .version('0.1.0')
		  .usage('-f <file.csv>')
		  .option('-f, --file <value>', 'A file.csv argument')
		  .parse(process.argv);

		console.log('Csv2Trello');
		console.log(' file: %j', program.file + "");

		var someTickets;
		var context = {};
		//Parse

		getParseCsvPromise(program.file).then( (csvData) => {
				console.log("csvData: ", csvData);
				someTickets = getTickets(csvData);
				console.log("someTickets: ", someTickets);

				return trello.getBoards("me");
		//Get Board
		}).then( (someBoards) => {

				var aBoard = selectBoardOrFail(someBoards);

				return trello.getListsOnBoard(aBoard.id);
		//Get board lists
		}).then( (someLists) => {
				console.log("someLists: " + someLists);
				context.trelloListsMap = [];
				someLists.forEach(function(aList) { context.trelloListsMap[aList.name] = aList });


				console.log("Existing lists: ", someLists.map( (aList) => aList.name))

				var someGetCardsOnListPromises = getCardsOnListPromises(someLists);
				return Promise.all(someGetCardsOnListPromises);

		//get cards from all lists
		}).then( (anArrayOfCards) => {
				var anArrayWithAllCards = flattenArrayOfArray(anArrayOfCards);
				console.log("Existing cards: ", anArrayWithAllCards.map( (aCard) => aCard.name));

				return getDeleteCardsPromise(anArrayWithAllCards);

		}).then( () => {
				console.log("Deleting all cards... ");
				//create cards
				return getCreateAllCardsPromise(context.trelloListsMap, someTickets);
		}).then( (aCardList) => {
				return getAllStickersForAllCards(context.trelloListsMap, someTickets, aCardList);
		}).catch( (anError) => {
				console.error("=-=-=-=-=-=-=-=-=-=ERROR=-=-=-=-=-=-=-=-=");
				console.error("error: ", anError);
				console.error("=-=-=-=-=-=-=-=-=-=ERROR=-=-=-=-=-=-=-=-=");
		});
//DDD
}

main();
