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
        this._ticket = ticket;
        this.title = title;
        this.createdDate = created;
        this.ticketQueue = queue;
        this.state = state;
        this.ticketPriority = priority;
        this.customerUser = customerUser;
        this.service = service;
        this.agentOwner = agentOwner;
    }

    //------------ ACCESSORS

    get cardTitle() {
        return "[" + this.ticket + "] " + this.title + " (" + this.agentOwner + ")";
    }

    get created() {
      return this.createdDate;
    }

    get ticket() {
        return this._ticket;
    }

    get cardDescription() {
		console.log("xxx:",this.service);
        return "Creada: " + this.created + "\n" +
            "Cliente: " + this.customerUser + "\n" +
            "Servicio: " + this.service + "\n"
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

  	get laugh() {
  		return TicktAux.hoursTS(1) <= TicktAux.age(this.created) && TicktAux.age(this.created) < TicktAux.hoursTS(9) ;
  	}

  	get smile() {
  		return TicktAux.hoursTS(9) <= TicktAux.age(this.created) && TicktAux.age(this.created) < TicktAux.daysTS(3) ;
  	}


  	get huh() {
  		return TicktAux.daysTS(3) <= TicktAux.age(this.created) && TicktAux.age(this.created) < TicktAux.daysTS(7) ;
  	}

    get frown() {
        //more than 7 days
        return TicktAux.daysTS(7) <= TicktAux.age(this.created) ;
    }

    get thumbsup() {
        //between 1 hours days and 24 hours
        //return TicktAux.hoursTS(1) <= TicktAux.age(this.created) && TicktAux.age(this.created) < TicktAux.hoursTS(9) ;
		return false;
    }

    get warning() {
      //between 1 days and 3 days
      //return TicktAux.daysTS(3) <= TicktAux.age(this.created) && TicktAux.age(this.created) < TicktAux.daysTS(7) ;
	  return false;
    }


    get clock() {
        //between 1 days and 3 days
        //return TicktAux.hoursTS(8) <= TicktAux.age(this.created) && TicktAux.age(this.created) < TicktAux.daysTS(3) ;
		return this.priority == "high";
    }

    get rocket() {
		//console.log("xxxxxxxx: ", this.service == "PROVISION DE EQUIPAMIENTO E INSUMOS::" || this.service == "PROVISION DE EQUIPAMIENTO E INSUMOS::Solicitud PC");
		return this.service == "PROVISION DE EQUIPAMIENTO E INSUMOS::" || this.service == "PROVISION DE EQUIPAMIENTO E INSUMOS::Solicitud PC";
    }

  	get priority() {
  		if (this.ticketPriority == "2 Baja") {
  			return "low";
  		} else if (this.ticketPriority == "3 Normal") {
  				return "normal";
  		} else if (this.ticketPriority == "4 Alta") {
  				return "high";
  		} else {
  			throw new Error("Priority isn't valid: " + this.priority);
  		}

  	}

    compare(otherObject) {
        var aValue;
        if (this.created == otherObject.created) {
          aValue = 0;
        } else if (this.created < otherObject.created) {
          aValue = -1;
        } else {
          aValue = 1;
        }
        console.log("compare: %s<%s = %s",this.created , otherObject.created, aValue);
        return aValue;
    }

    /**
     * Get position of card in list
     * https://developers.trello.com/reference#cards-2 (pos parameter)
     */
    get cardPosition() {
      return 99999999 - parseFloat(this.ticket.substring(0,8));
    }

}

module.exports = Ticket;
