import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient(); // add {log : ['info', 'query', {emit : "event", level : "query"}]} parameter to see all the logs and queries while performing CRUD operations


// -------------------------- Inserting into database
type User = {
    email : string,
    firstname? : string,
    lastname? : string,
    password : string
}

async function insertUser(user : User){
    const res = await prisma.user.create({
        data : {
            email : user.email,
            password : user.password,
            firstname : user.firstname,
            lastname : user.lastname
        },
        select : {
            id : true,
            email : true
        }
    })

    console.log("User Inserted", res)
}

// insertUser({email : "Rohit@gmail.com", password : "454545", firstname : "Rohit", lastname : "Sharma"})

type Todo = {
    title : string,
    description : string,
    done? : boolean,
    userId : number
}

async function insertTodo(todo : Todo){
    const res = await prisma.todo.create({
        data : {
            title : todo.title,
            description : todo.description,
            done : todo.done,
            userId : todo.userId
        },
        select : {
            id : true,
            title : true
        }
    })
    console.log("Todo Added : ", res);
}
// insertTodo({title : "Learn DSA", description : "Start from today", userId : 1})
// insertTodo({title : "Learn Web", description : "Start from tommorow", userId : 1})
// insertTodo({title : "Practice Batting", description : "Start from today", userId : 3})


// -------------------------- Updating database

type UpdateParams = {
    firstname : string,
    lastname : string
}

async function updateUser(email : string, {firstname, lastname} : UpdateParams) {
    const res = await prisma.user.update({
        where : {email : email},
        data : {
            firstname : firstname,
            lastname : lastname
        },
        select : {
            id : true,
            email : true
        }
    })
    console.log("User Updated : ", res)
}

// updateUser("arsh@gmail.com", {firstname : "Arsh", lastname : "Deep"})


// -------------------------- Selecting from database

async function selectUserByEmail(email : string) {
    const res = await prisma.user.findFirst({
        where : {email : email}
    })
    console.log("User Found : ", res)
}

// selectUserByEmail("arsh@gmail.com")


async function selectUsersByFilter(filter : string) {
    const res = await prisma.user.findMany({
        where : {OR : [{firstname : filter}, {lastname : filter}]}
    })
    console.log("User(s) Found : ", res)
}

// selectUsersByFilter("Deep")


// -------------------------- Transactions in prisma 
// We do not explicitely perform transaction, but prisma do it internally when data is required from two or more tables

// ****** Following two function performs same thing, but the first one will return all todos each containing its user information as well, but the second function will return the user details with its todos included

async function getTodosWithUserDetails(userId : number){
    const res = await prisma.todo.findMany({
        where : {
            userId : userId
        },
        select : {
            title : true,
            description : true,
            done : true,
            user : true
        }
    })
    console.log("Todos with User Details", res)
}

// getTodosWithUserDetails(1)

async function getUserWithAllTodos(userId : number){
    const res = await prisma.user.findUnique({
        where : {
            id : userId
        },
        include : {
            todos : true
        }
    })
    console.log("User with all Todos : ", res)
}

// getUserWithAllTodos(1)


// -------------------------- Delete from database

// **** Que : to delete all the todos of a particular user which are done(done : true)

// **** Sol 1 : to use delete query on todos having where clause containing both userId and done : true
async function deleteDoneTodos(userId : number){
    const res = await prisma.todo.deleteMany({
        where : {
            userId : userId,
            done : true
        }
    })
    console.log("Todos Deleted : ", res);
}

// **** Sol 2 : to update the users table and perfrom deleted in the nested manner
async function deleteDoneTodosOfUser(userId : number){
    const res = await prisma.user.update({
        where : {
            id : userId
        },
        data : {
            todos : {
                deleteMany : {
                    done : true
                }
            }
        }
    })
    console.log("Todos Updated/Deleted", res)
}

// deleteDoneTodosOfUser(1)


// -------------------------- Advance Queries

// Que : Find the all the users along with their todos whose email ends with gmail.com and have atleast one todo that is pending(done : false)

async function findUsersWithPendingTodos(){
    const res = await prisma.user.findMany({
        where : {
            email : {
                endsWith : "gmail.com"
            },
            todos : {
                some : {
                    done : false
                }
            }
        },
        include : {
            todos : {
                where : {
                    done : false
                }
            }
        }
    })
    console.log("Users Found : ", res)
}

// findUsersWithPendingTodos()


// -------------------------- Limit Rows - applicable where we want pagination

// Q : find next 2 users after the skipping first user

async function findLimitedUsers(offset : number, count : number) {
    const res = await prisma.user.findMany({
        skip : offset,
        take : count
    })
    console.log(res)
}
// findLimitedUsers(1, 2)


// -------------------------- Advanced Debugging - to see the hidden values in query [Node : first import the PrismaClient with proper parameters]

// prisma.$on("query", async (e) => {
//     console.log(`${e.query} ${e.params}`)
// })