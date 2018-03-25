#!/usr/bin/env node
// **** IMPORTA SECTION ****************************************

var program = require('commander');
var parse = require('csv-parse');
var fs = require('fs')
var Trello = require("trello");

// **** CONFIG SECTION ****************************************
var TRELLO_APPLICATION_KEY = "6d9725e88d3550057121ac6f8cdd0b97";
var TRELLO_USER_TOKEN = "bcbf360e1cb6ad98205e99393b4eb3db31b4359a317aa323a8a91951a14b142b";
var TRELLO_BOARD_NAME = "CSI OTRS Tickets";

// **** MAIN SECTION ****************************************

var trello = new Trello(TRELLO_APPLICATION_KEY, TRELLO_USER_TOKEN );


//var trelloNode = require('trello-node-api')("6d9725e88d3550057121ac6f8cdd0b97", "bcbf360e1cb6ad98205e99393b4eb3db31b4359a317aa323a8a91951a14b142b");

//const files = require('./lib/files');

//console.log("Hello world!");

//const run = async () => {
//	
//}

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
		aFilteredBoardList = boards.filter(function(otherBoard) { return otherBoard.name == TRELLO_BOARD_NAME });
		aBoard = aFilteredBoardList.shift();
		if (aBoard === undefined) {
			console.log("Ups... board wasn't found: ", aBoard, TRELLO_BOARD_NAME);	
			throw new Error("Board wasn't found: ", TRELLO_BOARD_NAME);		
		}
		console.log("Board: ", aBoard);
		
		console.log("getting lists on board: " + aBoard.id);

		trello.getListsOnBoard (aBoard.id, function(error, listsOnBoard2) {
			if (error) {
				throw new Error("Something goes wrong: ", error);
			}

			var boardMap = [];
			console.log("Lists: ", listsOnBoard2);
			if (listsOnBoard2 != undefined) {
				listsOnBoard2.forEach(function(aList) { boardMap[aList.name] = aList });						
			} 
			
			if (listsOnBoard2 == undefined) {
				throw new Error("::DEBUG:: No lists found");
			}
			
			console.log("Creating cards...", tickets);
				
			//Converts tickets into cards
			tickets.forEach( function (aTicket) {

				  aList = boardMap[aTicket.getCardListName()];
				  if (aList == undefined) {
					console.log("Ups... list wasn't found: ", aTicket.getCardListName());	
					throw new Error("List wasn't found: ", aTicket.getCardListName());							  
				  }
				  trello.addCard(aTicket.getCardTitle(), aTicket.getCardDescription(), aList.id, function (error, aCard) {
					if (error) {
						throw new Error("Something goes wrong: ", error);
					}
					console.log("Created card: ", aCard);
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
