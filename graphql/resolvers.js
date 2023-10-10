import User from "../models/user.js";
import Student from "../models/student.js";
import Teacher from "../models/teacher.js";
import Group from "../models/group.js";

const findUser = userId => {
    return User.findById(userId).then(user => {
        return {
            ...user._doc, _id: user._id
        }
    }).catch(error => {
        console.log(error);
        throw error;
    })
}

const addStudent = data => {
    // User.findOne({email: data.email}).then(user => {
    //     // if(user) {
    //     //     throw new Error('User already exist');
    //     // }
    // });
    // const newUser = new User({
    //     fullname: data.fullname,
    //     email: data.email,
    //     role: "student",
    // });
    // return newUser
    //     .save()
    //     .then((result) => {
    //         const student = new Student({
    //             user: result._id,
    //             group: data.group
    //         });
    //         return student.save().then((studentResult) => {
    //             console.log(studentResult)
    //             return {...studentResult._doc, _id: studentResult._id}
    //         }).catch(error => console.log(error));
    //     }).catch(error => {
    //         console.log(error);
    //         throw error;
    //     });
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
        allTeacher: () => {
            return Teacher.find().then(teachers => {
                return teachers.map(teacher => {
                    const user = findUser(teacher.user);
                    return {
                        ...teacher._doc,
                        _id: teacher._id,
                        user: user
                    }
                })
            }).catch(error => {
                console.log(error);
                throw error;
            });
        },
        allStudents: () => {
            return Student.find().then(students => {
                return students.map(student => {
                    const user = findUser(student.user);
                    return {
                        ...student._doc,
                        _id: student._id,
                        user: user
                    }
                })
            }).catch(error => {
                console.log(error);
                throw error;
            });
        },
        allGroups: () => {
            // return Group.find().then(students => {
            //     return students.map(student => {
            //         const user = findUser(student.user);
            //         return {
            //             ...student._doc,
            //             _id: student._id,
            //             user: user
            //         }
            //     })
            // }).catch(error => {
            //     console.log(error);
            //     throw error;
            // });
        }
    },

    Mutation: {
        createUser: (_, args) => {
            //Add crypt password
            User.findOne({email: args.newUser.email}).then(user => {
                if(user) {
                    throw new Error('User already exist');
                }
            });
            const newUser = new User({
                fullname: args.newUser.fullname,
                email: args.newUser.email,
                password: args.newUser.password,
                role: args.newUser.role,
            });
            return newUser
                .save()
                .then(result => {
                    if(args.newUser.role === "student") {
                        const student = new Student({
                            user: result._id,
                        });
                        student.save();
                    }
                    if(args.newUser.role === "teacher") {
                        const teacher = new Teacher({
                            user: result._id,
                            subjects: []
                        });
                        teacher.save();
                    }

                    return {...result._doc}
                }).catch(error => {
                    console.log(error);
                    throw error;
                });
        },
        createGroup: async (_, args) => {
            // //Add crypt password
            // Group.findOne({code: args.newGroup.code}).then(group => {
            //     console.log(group);
            //     // if(group) {
            //     //     throw new Error('Group already exist');
            //     // }
            // });
            //
            // const newStudents = args.newGroup.students.map(async newStudent => {
            //     return await addStudent({...newStudent, group: args.newGroup.code});
            // });
            // console.log(newStudents);
            //
            // const newGroup = new Group({
            //     code: args.newGroup.code,
            //     students: newStudents
            // });
            // return newGroup
            //     .save()
            //     .then(result => {
            //          return {...result._doc}
            //     }).catch(error => {
            //         console.log(error);
            //         throw error;
            //     });
        }
    }
}