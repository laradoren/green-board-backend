import User from "../../models/user.js";
import Student from "../../models/student.js";
import Teacher from "../../models/teacher.js";
import {GraphQLError} from "graphql";
import {findUserByEmail} from "./auth.js";
import bcrypt from "bcryptjs";
import {findUserById} from "./index.js";
import Group from "../../models/group.js";

export const createUser = async (_, args, ctx) => {
    let errors = {};
    let {fullname, email, role, password} = args.newUser;
    try {
        if(!ctx.isAuth || ctx.role !== "admin") {
            errors.message = "Not Authorized for this action";
            errors.code = "NOT_AUTHORIZED";
            throw errors;
        }
        const user = await findUserByEmail(email);
        if(user) {
            errors.message = "Не знайдено Користувача";
            errors.code = "USER_ALREADY_EXIST";
            throw errors;
        }
        if(password) {
            password = await bcrypt.hash(password, 6);
        }
        const newUser = new User({
            fullname: fullname,
            email: email,
            role: role,
            password: password
        });
        const result = await newUser.save();
        if(role === "student") {
            const student = new Student({
                user: result._id,
            });
            const newStudent = await student.save();
            return {
                _id: newStudent._id,
                user: result
            };
        }
        if(role === "teacher") {
            const teacher = new Teacher({
                user: result._id,
                subjects: []
            });
            const newTeacher = await teacher.save();
            return {
                _id: newTeacher._id,
                user: result
            };
        }
        return {
            _id: result._id,
            user: result
        };;
    } catch (error) {
        throw new GraphQLError(error.message, {
            extensions: {
                code: error.code
            }
        });
    }
}

export const createTeachersList = async (_, args, ctx) => {
    let errors = {};
    let {list} = args;
    try {
        if(!ctx.isAuth || ctx.role !== "admin") {
            errors.message = "Not Authorized for this action";
            errors.code = "NOT_AUTHORIZED";
            throw errors;
        }

        return list.map(async item => {
            let {email, fullname} = item;
            const user = await findUserByEmail(email);
            if(user) {
                errors.message = "Не знайдено Користувача";
                errors.code = "USER_ALREADY_EXIST";
                throw errors;
            }

            const newUser = new User({
                fullname: fullname,
                email: email,
                role: "teacher",
            });

            const createdUser = await newUser.save();

            const newTeacher = new Teacher({
                user: createdUser._id,
                subjects: []
            });
            const teacher = await newTeacher.save();

            return {
                _id: teacher._id,
                user: createdUser
            }
        });

    } catch (error) {
        throw new GraphQLError(error.message, {
            extensions: {
                code: error.code
            }
        });
    }
}

export const getAllTeachers = async () => {
    try {
        const teachers = await Teacher.find();
        return teachers.map(async teacher => {
            const user = await findUserById(teacher.user);
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
}

export const deleteTeachersList = async (_, args, ctx) => {
    let {list} = args;
    let errors = {};
    try {
        if(!ctx.isAuth || ctx.role !== "admin") {
            errors.message = "Not Authorized for this action";
            errors.code = "NOT_AUTHORIZED";
            throw errors;
        }
        return list.map((async (id) => {
            const teacher = await Teacher.findById(id);
            if (!teacher) {
                errors.message = "Не знайдено Вчителя";
                errors.code = "USER_DONT_FOUND";
                throw errors;
            }

            const user = await findUserById(teacher.user);
            if (!user) {
                errors.message = "Не знайдено Користувача";
                errors.code = "USER_DONT_FOUND";
                throw errors;
            }


            await User.findOneAndDelete(
                {_id: user._id},
            );

            await Teacher.findOneAndDelete(
                {_id: id},
            );

            return {
                _id: teacher._id,
                ...teacher
            };
        }));

    } catch (error) {
        throw new GraphQLError(error.message, {
            extensions: {
                code: error.code
            }
        });
    }
}

export const updateTeacher = async (_, args, ctx) => {
    let {email, fullname, id} = args;
    let errors = {};
    try {
        if(!ctx.isAuth || ctx.role !== "admin") {
            errors.message = "Not Authorized for this action";
            errors.code = "NOT_AUTHORIZED";
            throw errors;
        }
        const teacher = await Teacher.findById(id);
        if(!teacher) {
            errors.message = "Не знайдено Користувача";
            errors.code = "USER_DONT_FOUND";
            throw errors;
        }

        const user = await findUserById(teacher.user);
        if(!user) {
            errors.message = "Не знайдено Користувача";
            errors.code = "USER_DONT_FOUND";
            throw errors;
        }


        const data = await User.findOneAndUpdate(
            {_id: user._id},
            {fullname: fullname, email: email},
            {new: true}
        );

        return {
            _id: teacher._id,
            user: data
        }

    } catch (error) {
        throw new GraphQLError(error.message, {
            extensions: {
                code: error.code
            }
        });
    }
}
export const getAllStudents = async () => {
    try {
        const students = await Student.find();
        return students.map(async student => {
            const user = await findUserById(student.user);
            return {
                ...student._doc,
                _id: student._id,
                group: student.group,
                user: user
            }
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const deleteStudentsList = async (_, args, ctx) => {
    let {list} = args;
    let errors = {};
    try {
        if(!ctx.isAuth || ctx.role !== "admin") {
            errors.message = "Not Authorized for this action";
            errors.code = "NOT_AUTHORIZED";
            throw errors;
        }
        return list.map((async (id) => {
            const student = await Student.findById(id);
            if (!student) {
                errors.message = "User does not found";
                errors.code = "USER_DONT_FOUND";
                throw errors;
            }

            const user = await findUserById(student.user);
            if (!user) {
                errors.message = "User does not found";
                errors.code = "USER_DONT_FOUND";
                throw errors;
            }


            await User.findOneAndDelete(
                {_id: user._id},
            );

            await Student.findOneAndDelete(
                {_id: id},
            );

            const group = await Group.findOne({code: student.group});

            const updatedGroup = await Group.findOneAndUpdate({ _id: group.id }, {
                $pull: {
                    students: id
                }
            }, {new: true});

            if(!updatedGroup.students.length) {
                await Group.findOneAndDelete(
                    {_id: group._id},
                );
            }

            return {
                _id: student._id,
                ...student
            };
        }));

    } catch (error) {
        throw new GraphQLError(error.message, {
            extensions: {
                code: error.code
            }
        });
    }
}

export const updateStudent = async (_, args, ctx) => {
    let {email, fullname, id} = args;
    let errors = {};
    try {
        if(!ctx.isAuth || ctx.role !== "admin") {
            errors.message = "Not Authorized for this action";
            errors.code = "NOT_AUTHORIZED";
            throw errors;
        }
        const student = await Student.findById(id);
        if(!student) {
            errors.message = "User does not found";
            errors.code = "USER_DONT_FOUND";
            throw errors;
        }

        const user = await findUserById(student.user);
        if(!user) {
            errors.message = "User does not found";
            errors.code = "USER_DONT_FOUND";
            throw errors;
        }


        const data = await User.findOneAndUpdate(
            {_id: user._id},
            {fullname: fullname, email: email},
            {new: true}
        );

        return {
            _id: student._id,
            group: student.group,
            user: data
        }

    } catch (error) {
        throw new GraphQLError(error.message, {
            extensions: {
                code: error.code
            }
        });
    }
}

export const createGroup = async (_, args, ctx) => {
    let {code, students} = args.newGroup;
    let errors = {};
    try {
        if(!ctx.isAuth || ctx.role !== "admin") {
            errors.message = "Not Authorized for this action";
            errors.code = "NOT_AUTHORIZED";
            throw errors;
        }
        const group = await Group.findOne({code: code})
        if(group) {
            errors.message = "Група вже існує";
            errors.code = "GROUP_ALREADY_EXIST";
            throw errors;
        }
        const newUsers = students.map(student => ({...student, role: "student"}));

        const users = await User.insertMany(newUsers);

        const studentsList = users.map(user => ({user: user._id, group: code}));

        const newStudents = await Student.insertMany(studentsList);

        const newGroup = new Group({
            code: code,
            students: newStudents
        });

        await newGroup.save();

        return newStudents.map(async student => {
            const user = await findUserById(student.user);
            return {
                ...student._doc,
                _id: student._id,
                group: student.group,
                user: user
            }
        });

    } catch (error) {
        throw new GraphQLError(error.message, {
            extensions: {
                code: error.code
            }
        });
    }
}
