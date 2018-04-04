#!/usr/bin/env node
"use strict";
// **** IMPORT SECTION ****************************************

var program = require('commander');
var parse = require('csv-parse');
var fs = require('fs')
var Trello = require("trello");
var Config = require('./config');
var Ticket = require('./libs/ticket');

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
						console.log("^*+*^: ", csvrow)
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
		console.log("Ups... board wasn't found: ", aBoard, config.trello.boardName);
		throw new Error("Board wasn't found: ", config.trello.boardName);
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

function createCards(someLists, someTickets) {
		console.log("¡¡¡¡¿¿¿¿¡¡++: ", someTickets);
		//generate auxiliar index of lists
		var listsMap = [];
		someLists.forEach(function(aList) { listsMap[aList.name] = aList });

		//Converts tickets into card
		someTickets.forEach( function (aTicket) {

			var aList = listsMap[aTicket.ticketQueue];
			if (aList == undefined) {
					console.log("Ups... list wasn't found: ", aTicket.getCardListName());
					throw new Error("List wasn't found: ", aTicket.getCardListName());
			}
			var anAddCardPromise = trello.addCard(aTicket.cardTitle, aTicket.cardDescription, aList.id);
			anAddCardPromise.then((aCard) => console.log("*** Created card: ", aCard.title, " [", aCard.id, "]" )).catch( (anError) => {throw anError} );

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
	//getBoardPromise.then( (someBoards) => {
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

//trello.getCardsOnList("5ab70cd179e6dda69d83145c").then( (l) => console.log("xxxxyyy*** ",l) ).catch(console.log);
/*
#!/usr/bin/env node
// **** IMPORT SECTION ****************************************

var program = require('commander');
var parse = require('csv-parse');
var fs = require('fs')
var Trello = require("trello");
var config = require('./config');

// **** MAIN SECTION ****************************************

var trello = new Trello(config.trello.key, config.trello.token);


//var trelloNode = require('trello-node-api')("6d9725e88d3550057121ac6f8cdd0b97", "bcbf360e1cb6ad98205e99393b4eb3db31b4359a317aa323a8a91951a14b142b");

//const files = require('./lib/files');

//console.log("Hello world!");

//const run = async () => {
//
//}
function getCardsOnListPromise(listId) {
	return trello.getCardsOnList(listId);
}

function getCardsOnListsPromiseAux(somelistIds) {
		return somelistIds.reduce((resultCardsList, aListId) => {
			resultCardsList.push(getCardsOnListPromise(aListId));
			return resultCardsList;
	}, []);
}

function getAllCardsOnListPromise(somelistIds) {
		getCardsOnListsPromiseAux(somelistIds).reduce( (resultPromise, aPromise ) => {
			resultPromise.then((result) => {console.log("getAllCardsOnListPromise: (FALTA COMPLETAR AQUI)", result)} ).
				catch(throw new Error("Some error on getAllCardsOnListPromise"));
		}
}

function createMissingLists(aBoard, tickets, listsMap) {
	//calculate all list that are used in tickets
	var allNeededLists = tickets.reduce((prev, curr)=> { prev.push(curr.getCardListName()); return prev; }, []);
	//calculate lists that should be create to place tickets
	var shouldBeCreatedLists = allNeededLists.filter((item) => !(item in listsMap ) );
	console.log("allNeededLists: ", allNeededLists,"\nxxxyxxx",   "\n yyyy",shouldBeCreatedLists);
	console.log("********************* mapList: ", listsMap);

	var  allListId = listsMap.map((aList)=> {return aList.id} );
	var allCardsOnListsPromises = getCardsOnListsPromise(allListId);
	allCardsOnListsPromises.reduce((promises))
//	Promises.all(allCardsOnListsPromise).then(values => {
//  console.log("======= ALL CARDS ON LIST PROMISES" + values); // [3, 1337, "foo"]
});



	//for (let [aListName, aList] of listsMap) {
	//	console.log("++++++++++++++ ListId: ", listId);

	//	cardsPromise.then((cards) => {
	//		console.log("********************* Cards: ", cards);
	//	});
	//}

}


function createTrelloCards(tickets) {
	console.log("");
	console.log("Starting Trello board updating");
	var aBoard ;
	// Retrieve card list on board
	//Promise
	trello.getBoards("me", function (error, boards) {
		if (error) {
			throw new Error("Something goes wrong: ", error);
		}
		aFilteredBoardList = boards.filter(function(otherBoard) { return otherBoard.name == config.trello.boardName });
		aBoard = aFilteredBoardList.shift();
		if (aBoard === undefined) {
			console.log("Ups... board wasn't found: ", aBoard, config.trello.boardName);
			throw new Error("Board wasn't found: ", config.trello.boardName);
		}
		console.log("Board: ", aBoard);

		console.log("getting lists on board: " + aBoard.id);

		trello.getListsOnBoard (aBoard.id, function(error, listsOnBoard) {
			if (error) {
				throw new Error("Something goes wrong: ", error);
			}

			var listsMap = [];
			console.log("Lists: ", listsOnBoard);
			if (listsOnBoard != undefined) {
				listsOnBoard.forEach(function(aList) { listsMap[aList.name] = aList });
			}

			createMissingLists(aBoard, tickets, listsMap);

			if (listsOnBoard == undefined) {
				throw new Error("::DEBUG:: No lists found");
			}
			//Deleting all cards from board
					console.log("Creating cards...", tickets);

					//Converts tickets into cards
					tickets.forEach( function (aTicket) {

						  aList = listsMap[aTicket.getCardListName()];
						  if (aList == undefined) {
							console.log("Ups... list wasn't found: ", aTicket.getCardListName());
							throw new Error("List wasn't found: ", aTicket.getCardListName());
						  }
						  trello.addCard(aTicket.getCardTitle(), aTicket.getCardDescription(), aList.id, function (error, aCard) {
							if (error) {
								throw new Error("Something goes wrong: ", error);
							}
			//				console.log("Created card: ", aCard);
						  });


					});


		});


	});


	//var cardsPromise = trello.getCardsOnList(listId);
	//cardsPromise.then((cards) => {
	//	cards.forEach(function(aCard) { console.log("aCard:", aCard); } );
	//
	//})


}

function getTickets(csvData) {
	//remote title headers
	csvData.shift();
	//"Ticket#";"Title";"Created";"Queue";"State";"Priority";"Customer User";"Service";"Agent/Owner"
	var ticketList = [];
	csvData.forEach(function(aRow) {
		var aTicket = {
			ticket: aRow[0],
			title: aRow[1],
			created: aRow[2],
			queue: aRow[3],
			state: aRow[4],
			priority: aRow[5],
			customerUser: aRow[6],
			service: aRow[7],
			agentOwner: aRow[8],
			getCardTitle: function() {
				return "[" + this.ticket + "] " + this.title;
			},
			getCardDescription: function() {
				return "Creada: " + this.created + "\n" +
						"Cliente: " + this.customerUser + "\n" +
						"Servicio: " + this.servicie + "\n"
						"Priority: " + this.priority + "\n";
			},
			getCardListName: function() {
				return this.queue;
			}

		};
		ticketList.push(aTicket);
	});

	return ticketList;
}

function parseCsv(filename) {
	var csvData=[];
	fs.createReadStream(program.file + "")
		.pipe(parse({delimiter: ';'}))
		.on('data', function(csvrow) {
			//console.log("Row: ", csvrow);
			//do something with csvrow
			csvData.push(csvrow);
		})
		.on('end',function() {
		  //do something wiht csvData
		  //console.log("Readed: " + csvData);
		  createTrelloCards(getTickets(csvData));

	  });
}


program
  .version('0.1.0')
  .usage('-f <file.csv>')
  .option('-f, --file <value>', 'A file.csv argument')
  .parse(process.argv);

console.log('Csv2Trello');
console.log(' file: %j', program.file + "");
//console.log(' args: %j', program.args);

parseCsv(program.file);
*/
