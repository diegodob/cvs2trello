"use strict";
var test = require('tape');
var Ticket = require('../lib/ticket');

function getTicketSample() {
  return new Ticket("2018031510000254","Mantenimiento.-","2018-03-15 17:10:05","INFRAESTRUCTURA","Abierto","3 Normal","mscarpello","SISTEMAS::Mantenimiento Reactivo","lorenteb");
}


function getTicketsSampleList() {
    return [
      new Ticket("2018031410000227","activaciòn Office","2018-03-14 15:30:02","SOPORTE","Abierto","3 Normal","abercovich","SOPORTE TECNICO::Mantenimiento Reactivo","nestrada"),
      new Ticket("2018031510000218","Tema celular.-","2018-03-15 15:10:13","SOPORTE::TELEFONIA","Abierto","2 Baja","fsotelo","SOPORTE TECNICO::Mantenimiento Reactivo","embonanata"),
      new Ticket("2018021510000254","Mantenimiento.-","2018-02-15 17:10:05","INFRAESTRUCTURA","Abierto","3 Normal","mscarpello","SISTEMAS::Mantenimiento Reactivo","lorenteb"),
      new Ticket("2017031510000228","activaciòn Office","2017-03-15 15:30:02","ADMINISTRACION","Abierto","3 Normal","abercovich","SOPORTE TECNICO::Mantenimiento Reactivo","nestrada"),
      new Ticket("2017031510000228","Problema con Sistema Operativo","2017-03-15 12:29:05","ADMINISTRACION","Abierto","3 Normal","abercovich","SOPORTE TECNICO::Mantenimiento Reactivo","nestrada")
    ];
}

test('check that constructor init correctly fields', function (t) {
    var aTicket = getTicketSample();
    t.equal(aTicket.created, "2018-03-15 17:10:05");
    t.equal(aTicket.cardTitle, "[2018031510000254] Mantenimiento.- (lorenteb)");
    t.equal(aTicket.ticketQueue, "INFRAESTRUCTURA");
    t.end();
});

test('check Ticket.compare(aTicket) method', function (t) {
    var ticketsSampleList = getTicketsSampleList();
    var anOrderedTicketsList = getTicketsSampleList();
    anOrderedTicketsList.sort((aTicket, otherTicket) => aTicket.compare(otherTicket));
    anOrderedTicketsList.forEach((x) => {console.log(x.created)});

    t.deepEqual(anOrderedTicketsList[0], ticketsSampleList[4]);
    t.deepEqual(anOrderedTicketsList[1], ticketsSampleList[3]);
    t.deepEqual(anOrderedTicketsList[2], ticketsSampleList[2]);
    t.deepEqual(anOrderedTicketsList[3], ticketsSampleList[0]);
    t.deepEqual(anOrderedTicketsList[4], ticketsSampleList[1]);
/*
    t.equal(anOrderedTicketsList[1], ticketsSampleList[3]);
    t.equal(anOrderedTicketsList[2], ticketsSampleList[2]);
    t.equal(anOrderedTicketsList[3], ticketsSampleList[1]);
    t.equal(anOrderedTicketsList[4], ticketsSampleList[0]);*/
    t.end();
});

test('check get Ticket.position() accesor', function (t) {
    var ticketsSampleList = getTicketsSampleList();
    console.log(ticketsSampleList[1].cardPosition, " ", ticketsSampleList[3].cardPosition);
    t.true(ticketsSampleList[0].cardPosition > ticketsSampleList[1].cardPosition);
    t.true(ticketsSampleList[3].cardPosition <= ticketsSampleList[4].cardPosition);
    t.end();
});
