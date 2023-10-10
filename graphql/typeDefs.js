export const typeDefs = `#graphql
    type User {
        _id: ID! 
        fullname: String!
        email: String!
        password: String!
        role: String!
    }
    type Student {
        _id: ID!
        user: User!
        group: Group!
    }
    type Teacher {
        _id: ID!
        user: User!
    }
    type Group {
        _id: ID!
        code: String!
        students: [Student!]!
    }
    input UserInput {
        fullname: String!
        email: String!
        password: String!
        role: String!
    }

    input StudentInput {
        fullname: String!
        email: String!
    }

    input GroupInput {
        code: String!
        students: [StudentInput!]!
    }
    type Query {
        getUsers: [User!]!
        allTeacher: [Teacher!]!
        allStudents: [Student!]!
        allGroups: [Group!]!
    }

    type Mutation {
        createUser(newUser: UserInput): User
        createGroup(newGroup: GroupInput): Group
    }

`