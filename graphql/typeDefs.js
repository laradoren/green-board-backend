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
        group: String
        teacher: ID
        student: ID
    }

    type Subject {
        _id: ID!
        title: String!
        groups: [Group!]!
    }

    type TeacherSubject {
        _id: ID!
        title: String!
        tasks: [Task!]
    }

    type StudentSubject {
        _id: ID!
        title: String!
        tasks: [Task!]
    }

    type Task {
        _id: ID!
        name: String!
        description: String!
        hometasks: [HomeTask!]!
    }

    type HomeTask {
        _id: ID!
        text: String!
        status: String!
        task: ID!
        student: Student!
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

    input SubjectInput {
        teacher: String!
        title: String!
        groups: [ID!]!
    }

    input TaskInput {
        name: String!
        description: String!
        subject: ID!
    }

    input HometaskInput {
        text: String!
        status: String!
        student: ID!
        task: ID!
    }

    type Query {
        getUsers: [User!]!
        allTeachers: [Teacher!]!
        allStudents: [Student!]!
        allGroups: [Group!]!
        login(email: String!, password: String!): AuthData
        findUser(email: String!): User
        getTeacherSubjects(id: ID!): [TeacherSubject!]!
        getStudentSubjects(group: String!, id: ID!): [StudentSubject!]!
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
        createSubject(newSubject: SubjectInput): TeacherSubject!
        createTask(newTask: TaskInput!): TeacherSubject!
        deleteTask(id: ID!): TeacherSubject!
        updateTask(task: TaskInput!): Task!
        createHometask(hometask: HometaskInput!): StudentSubject!
        updateHometask(id: ID, status: String!, text: String!): StudentSubject! 
    }
`