"use strict";
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

    get cardTitle() {
        return "[" + this.ticket + "] " + this.title;
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

}

module.exports = Ticket;
