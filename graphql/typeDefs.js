export const typeDefs = `#graphql
    type User {
        _id: ID! 
        fullname: String!
        email: String!
        password: String!
        role: String!
    }
    type NewUser {
        _id: ID!,
        user: User!
    }
    type Student {
        _id: ID!
        user: User!
        group: String!
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

    type Subject {
        _id: ID!
        name: String!
        groups: [Group!]!
    }

    type Task {
        name: String!
        description: String!
        file: String!
        hometasks: [ID!]
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

    input TeacherItem {
        fullname: String!
        email: String!
    }

    input TaskInput {
        name: String!
        description: String!
        file: String!
    }

    type Query {
        getUsers: [User!]!
        allTeachers: [Teacher!]!
        allStudents: [Student!]!
        allGroups: [Group!]!
        login(email: String!, password: String!): AuthData
        findUser(email: String!): User
        getSubjects(id: ID!): [Subject!]!
    }

    type Mutation {
        createUser(newUser: UserInput): NewUser
        createGroup(newGroup: GroupInput): [Student!]
        addStudent(info: AddStudentInput): Student
        register(email: String!, password:String!): AuthData
        createTeachersList(list: [TeacherItem!]): [Teacher!]
        deleteTeachersList(list: [ID!]): [Teacher!]
        deleteStudentsList(list: [ID!]): [Student!]
        updateTeacher(id: ID!, fullname: String!, email: String!): Teacher!
        updateStudent(id: ID!, fullname: String!, email: String!): Student!
        createSubject(id: ID!, groups: [ID!]!): Subject!
        createTask(newTask: TaskInput!): Task!
        deleteTask(id: TaskInput!): Task!
        updateTask(task: TaskInput!): Task!
    }
`