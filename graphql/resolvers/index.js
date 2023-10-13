import User from "../../models/user.js";
import Student from "../../models/student.js";
import Teacher from "../../models/teacher.js";
import Group from "../../models/group.js";
import {login, register} from "./auth.js";
import {createUser} from "./admin.js";

const findUser = async userId => {
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
        getUsers: () => {
            return User.find().then(users => {
                return users.map(user => {
                    return {...user._doc}
                })
            }).catch(error => {
                console.log(error);
                throw error;
            });
        },
        allTeachers: async () => {
            try {
                const teachers = await Teacher.find();
                return teachers.map(async teacher => {
                    const user = await findUser(teacher.user);
                    return {
                        ...teacher._doc,
                        _id: teacher._id,
                        user: user
                    }
                });
            } catch (error) {
                console.log(error);
                throw error;
            }
        },
        allStudents: async () => {
            try {
                const students = await Student.find();
                return students.map(async student => {
                    const user = await findUser(student.user);
                    return {
                        ...student._doc,
                        _id: student._id,
                        user: user
                    }
                });
            } catch (error) {
                console.log(error);
                throw error;
            }
        },
        allGroups: async () => {
            try {
                const groups = await Group.find();
                return groups.map(async group => {
                    const students = await User.find({group: group.code});
                    return {
                        ...group._doc,
                        students
                    }
                });
            } catch (error) {
                console.log(error);
                throw error;
            }
        },
        login: login,
        findUser: findUser,
    },

    Mutation: {
        createUser: createUser,
        createGroup: async (_, args) => {
            //Add crypt password
            const group = await Group.findOne({code: args.newGroup.code})
            if(group) {
                throw new Error('Group already exist');
            }

            const newUsers = args.newGroup.students.map(student => ({...student, role: "student"}));

            const users = await User.insertMany(newUsers);

            const students = users.map(user => ({user: user._id, group: args.newGroup.code}));

            const newStudents = await Student.insertMany(students);

            const newGroup = new Group({
                code: args.newGroup.code,
                students: newStudents
            });

            const result = await newGroup.save();
            return {...result._doc}
        },
        addStudent: async (_, args) => {
            const student = await Student.findById(args.info.studentId)
            if(!student) {
                throw new Error('Student does not exist');
            }
            let result = await Student.updateOne({
                _id: args.info.studentId
            }, {
                $set: {
                    group: args.info.group
                }
            });

            console.log(result);
            return {

            }
        },
        register: register,
    },
}