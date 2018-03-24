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

function createTrelloCards(csvData) {
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
	});
	
	
	//var cardsPromise = trello.getCardsOnList(listId);
	//cardsPromise.then((cards) => {
	//	cards.forEach(function(aCard) { console.log("aCard:", aCard); } );
	//	
	//})	
	
	
}

function filterCsv(csvData) {
	csvData.shift();
	return csvData;
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
		  createTrelloCards(filterCsv(csvData));

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
