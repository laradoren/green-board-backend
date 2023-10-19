import User from "../../models/user.js";
import Student from "../../models/student.js";
import {findUser, login, register} from "./auth.js";
import {
    createGroup,
    createTeachersList,
    createUser, deleteStudentsList,
    deleteTeachersList, getAllStudents,
    getAllTeachers, updateStudent,
    updateTeacher
} from "./admin.js";
import {
    allGroups,
    createSubject,
    createTask,
    deleteTask,
    getTeacherSubjects,
    updateTask
} from "./teacher.js";
import {createHomeTask, getStudentsSubjects} from "./student.js";

export const findUserById = async userId => {
    try {
        const user = await User.findById(userId);
        if(!user) {
            throw Error('User not found!');
        }
        return {
            ...user._doc
        }
    } catch (error) {
        console.log(error);
        return error;
    }
}

const addStudent = async data => {
    const user = await User.findOne({email: data.email});
    if(user) {
        throw new Error('User already exist');
    }
    const newUser = new User({
        fullname: data.fullname,
        email: data.email,
        role: "student",
    });
    const result = await newUser.save();
    const student = new Student({
        user: result._id,
        group: data.group
    });
    await student.save();
}
export const resolvers = {
    Query: {
        // getUsers: () => {
        //     return User.find().then(users => {
        //         return users.map(user => {
        //             return {...user._doc}
        //         })
        //     }).catch(error => {
        //         console.log(error);
        //         throw error;
        //     });
        // },
        allTeachers: getAllTeachers,
        allStudents: getAllStudents,
        allGroups: allGroups,
        login: login,
        findUser: findUser,
        getTeacherSubjects: getTeacherSubjects,
        getStudentSubjects: getStudentsSubjects,
    },

    Mutation: {
        createUser: createUser,
        createGroup: createGroup,
        // addStudent: async (_, args) => {
        //     const student = await Student.findById(args.info.studentId)
        //     if(!student) {
        //         throw new Error('Student does not exist');
        //     }
        //     let result = await Student.updateOne({
        //         _id: args.info.studentId
        //     }, {
        //         $set: {
        //             group: args.info.group
        //         }
        //     });
        //
        //     console.log(result);
        //     return {
        //
        //     }
        // },
        register: register,
        createTeachersList: createTeachersList,
        deleteTeachersList: deleteTeachersList,
        deleteStudentsList: deleteStudentsList,
        updateTeacher: updateTeacher,
        updateStudent: updateStudent,
        createSubject: createSubject,
        createTask: createTask,
        deleteTask: deleteTask,
        updateTask: updateTask,
        createHometask: createHomeTask
    },
}