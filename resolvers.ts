import { users, orders, drivers } from './mockData.js';
import * as uuid from 'uuid';


export const resolvers = {
    // Queries are for fetching data
    Query: {
        // Standard queries: get all, get by identifier
        // TODO: Add in queries for ALL orders, a specific order by id, and orders by restaurant
        users() {
            return users;
        },
        user(_, {id}) {
            return users.find(user => user.id === id);
        },
        drivers() {
            return drivers;
        },
        driver(_, {id}) {
            return drivers.find(driver => driver.id === id);
        },
        orders() {
            return orders;
        },
        order(_, {id}) {
            return orders.find(order => order.id === id);
        },
        ordersByRestaurant(_,{restaurant}) {
            return orders.filter(order => order.restaurant === restaurant);
        }

    },
    // Mutations are for adding, deleting, and modifying data
    Mutation: {
        placeOrder(_, args) {
            const orderingUser = args.order.owner;
            console.log(orderingUser);

            // Search for user by id
            const orderingUserBalance = users[users.findIndex(user => user.id === orderingUser)].balance;
            console.log(orderingUserBalance);

            // Validation - does the user have enough balance to place the order?
            if (orderingUserBalance < args.order.cost) {
                throw new Error("Insufficient balance");
            }

            // Create a new order object
            let newOrder = {
                id: uuid.v4(),
                ...args.order
            }
  
            // Decrement user balance, and add order to orders array
            users[users.findIndex(user => user.id === orderingUser)].balance -= args.order.cost;
            orders.push(newOrder);
            return newOrder;
        },
        // TODO: Accept an order as a driver
        // Hints: 
        // Ensure the driver is available to accept the order
        // Ensure the order hasn't already been completed
        // Ensure the order doesn't already have a driver
        // Update the order and driver accordingly
        // Return the updated order!
        acceptOrder(_,args) {
            const driverID = args.driver;
            const orderID = args.order;
            console.log(driverID);
            console.log(orderID);
            const available = drivers[drivers.findIndex(driver => driver.id === driverID)].status;
            if (!(available === "Available")) {
                throw new Error("Driver not available");
            }
            const completed = orders[orders.findIndex(order => orderID === order.id)].status;
            const curDriver = orders[orders.findIndex(order => orderID === order.id)].driver;
            if (completed === "Completed") {
                throw new Error("Order completed");
            }
            if (!(curDriver === "")) {
                throw new Error("Driver already assigned");
            }
            drivers[drivers.findIndex(driver => driver.id === driverID)].status = "Unavailable";
            orders[orders.findIndex(order => orderID === order.id)].status = "Completed";
            orders[orders.findIndex(order => orderID === order.id)].driver = drivers.find(driver => driver.id === driverID).name;
            return orders.find(order => orderID === order.id);
            
        }
    },

    // For querying related data, we introduce custom objects

    // Query orders associated with each user
    User: {
        orders(parent, args, context, info) {
            console.log(parent.username);
            return orders.filter((order) => order.owner === parent.username);
        }
    },
    // Query all orders associated with each driver
    Driver: {
        orders(parent, args, context, info) {
            return orders.filter((order) => order.driver === parent.id);
        }
    },
    // Orders to drivers/owners
    Order: {
        owner(parent, args, context, info) {
            return users.find((user) => user.username === parent.owner);
        },
        driver(parent, args, context, info) {
            if (parent.driver === null) {
                return null;
            }
            return drivers.find((driver) => driver.id === parent.driver);
        }
    }

}