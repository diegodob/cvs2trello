"use strict";

const TicktAux = {
  //------------ AUX FUNCTIONS
  hoursTS(hours) {
      return hours * 60 * 60 * 1000;
  },

  daysTS(days) {
      return days * 24 * 60 * 60 * 1000;
  },

  age(created) {
    var nowTS = (new Date).getTime();
    var createTS = Date.parse(created);
    return nowTS - createTS;
  }
}

class Ticket {
    constructor(ticket, title, created, queue, state, priority, customerUser, service, agentOwner) {
        this.ticket = ticket;
        this.title = title;
        this.created = created;
        this.ticketQueue = queue;
        this.state = state;
        this.priority = priority;
        this.customerUser = customerUser;
        this.service = service;
        this.agentOwner = agentOwner;
    }

    //------------ ACCESSORS

    get cardTitle() {
        return "[" + this.ticket + "] " + this.title + " (" + this.agentOwner + ")";
    }

    get cardDescription() {
        return "Creada: " + this.created + "\n" +
            "Cliente: " + this.customerUser + "\n" +
            "Servicio: " + this.servicie + "\n"
            "Priority: " + this.priority + "\n";
    }

    get ticketQueue() {
        return this.queue;
    }

    set ticketQueue(value) {
        this.queue = value;
    }

    get star() {
        //If ticket has less than 60 minutes
        return TicktAux.age(this.created) < TicktAux.hoursTS(1);
    }

    get thumbsup() {
        //between 1 hours days and 24 hours
        return TicktAux.hoursTS(1) <= TicktAux.age(this.created) && TicktAux.age(this.created) < TicktAux.hoursTS(8) ;
    }

    get clock() {
        //between 1 days and 3 days
        return TicktAux.hoursTS(8) <= TicktAux.age(this.created) && TicktAux.age(this.created) < TicktAux.daysTS(3) ;
    }

    get warning() {
      //between 1 days and 3 days
      return TicktAux.daysTS(3) <= TicktAux.age(this.created) && TicktAux.age(this.created) < TicktAux.daysTS(7) ;
    }

    get frown() {
        //more than 7 days
        return TicktAux.daysTS(7) <= TicktAux.age(this.created) ;
    }


}

module.exports = Ticket;
