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

    type AuthData {
        user: User!
        token: String!
    }

    input UserInput {
        fullname: String!
        email: String!
        password: String
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

    input AddStudentInput {
        studentId: ID!
        group: String!
    }

    type Query {
        getUsers: [User!]!
        allTeachers: [Teacher!]!
        allStudents: [Student!]!
        allGroups: [Group!]!
        login(email: String!, password: String!): AuthData
        findUser(email: String!): User
    }

    type Mutation {
        createUser(newUser: UserInput): User
        createGroup(newGroup: GroupInput): Group
        addStudent(info: AddStudentInput): Student
        register(email: String!, password:String!, confirmedPassword: String! ): AuthData
    }

`