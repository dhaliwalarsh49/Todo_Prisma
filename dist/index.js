"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({ log: ['info', 'query', { emit: "event", level: "query" }] }); // add {log : ['info', 'query', {emit : "event", level : "query"}]} parameter to see all the logs and queries while performing CRUD operations
function insertUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield prisma.user.create({
            data: {
                email: user.email,
                password: user.password,
                firstname: user.firstname,
                lastname: user.lastname
            },
            select: {
                id: true,
                email: true
            }
        });
        console.log("User Inserted", res);
    });
}
function insertTodo(todo) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield prisma.todo.create({
            data: {
                title: todo.title,
                description: todo.description,
                done: todo.done,
                userId: todo.userId
            },
            select: {
                id: true,
                title: true
            }
        });
        console.log("Todo Added : ", res);
    });
}
function updateUser(email_1, _a) {
    return __awaiter(this, arguments, void 0, function* (email, { firstname, lastname }) {
        const res = yield prisma.user.update({
            where: { email: email },
            data: {
                firstname: firstname,
                lastname: lastname
            },
            select: {
                id: true,
                email: true
            }
        });
        console.log("User Updated : ", res);
    });
}
// updateUser("arsh@gmail.com", {firstname : "Arsh", lastname : "Deep"})
// -------------------------- Selecting from database
function selectUserByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield prisma.user.findFirst({
            where: { email: email }
        });
        console.log("User Found : ", res);
    });
}
// selectUserByEmail("arsh@gmail.com")
function selectUsersByFilter(filter) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield prisma.user.findMany({
            where: { OR: [{ firstname: filter }, { lastname: filter }] }
        });
        console.log("User(s) Found : ", res);
    });
}
// selectUsersByFilter("Deep")
// -------------------------- Transactions in prisma 
// We do not explicitely perform transaction, but prisma do it internally when data is required from two or more tables
// ****** Following two function performs same thing, but the first one will return all todos each containing its user information as well, but the second function will return the user details with its todos included
function getTodosWithUserDetails(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield prisma.todo.findMany({
            where: {
                userId: userId
            },
            select: {
                title: true,
                description: true,
                done: true,
                user: true
            }
        });
        console.log("Todos with User Details", res);
    });
}
// getTodosWithUserDetails(1)
function getUserWithAllTodos(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                todos: true
            }
        });
        console.log("User with all Todos : ", res);
    });
}
// getUserWithAllTodos(1)
// -------------------------- Delete from database
// **** Que : to delete all the todos of a particular user which are done(done : true)
// **** Sol 1 : to use delete query on todos having where clause containing both userId and done : true
function deleteDoneTodos(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield prisma.todo.deleteMany({
            where: {
                userId: userId,
                done: true
            }
        });
        console.log("Todos Deleted : ", res);
    });
}
// **** Sol 2 : to update the users table and perfrom deleted in the nested manner
function deleteDoneTodosOfUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield prisma.user.update({
            where: {
                id: userId
            },
            data: {
                todos: {
                    deleteMany: {
                        done: true
                    }
                }
            }
        });
        console.log("Todos Updated/Deleted", res);
    });
}
// deleteDoneTodosOfUser(1)
// -------------------------- Advance Queries
// Que : Find the all the users along with their todos whose email ends with gmail.com and have atleast one todo that is pending(done : false)
function findUsersWithPendingTodos() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield prisma.user.findMany({
            where: {
                email: {
                    endsWith: "gmail.com"
                },
                todos: {
                    some: {
                        done: false
                    }
                }
            },
            include: {
                todos: {
                    where: {
                        done: false
                    }
                }
            }
        });
        console.log("Users Found : ", res);
    });
}
// findUsersWithPendingTodos()
// -------------------------- Limit Rows - applicable where we want pagination
// Q : find next 2 users after the skipping first user
function findLimitedUsers(offset, count) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield prisma.user.findMany({
            skip: offset,
            take: count
        });
        console.log(res);
    });
}
// findLimitedUsers(1, 2)
// -------------------------- Advanced Debugging - to see the hidden values in query [Node : first import the prismaClient with proper parameters]
prisma.$on("query", (e) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${e.query} ${e.params}`);
}));
