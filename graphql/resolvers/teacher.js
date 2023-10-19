import Group from "../../models/group.js";
import User from "../../models/user.js";
import Teacher from "../../models/teacher.js";
import Subject from "../../models/subject.js";
import Task from "../../models/task.js";
import {GraphQLError} from "graphql/index.js";
import Hometask from "../../models/hometask.js";
import hometask from "../../models/hometask.js";
import Student from "../../models/student.js";

export const allGroups = async () => {
    try {
        const groups = await Group.find();
        return groups.map(async group => {
            return {
                _id: group._id,
                code: group.code,
                students: group.students.map(async (student) => {
                    let s = await Student.findById(student);
                    return {
                        _id: s._id
                    }
                })
            }
        });
    } catch (error) {
        console.log(error);
        throw new GraphQLError(error.message, {
            extensions: {
                code: error.code
            }
        });
    }
}
export const getTeacherSubjects = async (_, args, ctx) => {
    let {id} = args;
    let errors = {};
    try {
        if(!ctx.isAuth || ctx.role !== "teacher") {
            errors.message = "Not Authorized for this action";
            errors.code = "NOT_AUTHORIZED";
            throw errors;
        }

        const teacher = await Teacher.findById(id);
        return teacher.subjects.map(async s => {
            const subject = await Subject.findById(s);
            return {
                _id: subject._id,
                title: subject.title,
                groups: subject.groups,
                tasks: subject.tasks.map(async task => {
                    const t = await Task.findById(task);
                    return {
                        _id: t._id,
                        name: t.name,
                        description: t.description,
                        hometasks: t.hometasks.map(async(h) => {
                            const hometask = await Hometask.findOne({_id: h});
                            const student = await Student.findById(hometask.student);
                            const user = await User.findById(student.user);
                            return {
                                _id: hometask._id,
                                text: hometask.text,
                                status: hometask.status,
                                student: {
                                    user: user
                                }
                            }
                        })
                    }
                })
            }
        });
    } catch (error) {
        console.log(error);
        throw new GraphQLError(error.message, {
            extensions: {
                code: error.code
            }
        });
    }
}
export const createSubject = async (_, args, ctx) => {
    let {teacher, title, groups} = args.newSubject;
    let errors = {};
    try {
        if(!ctx.isAuth || ctx.role !== "teacher") {
            errors.message = "Not Authorized for this action";
            errors.code = "NOT_AUTHORIZED";
            throw errors;
        }
        const subject = await Subject.findOne({title});

        if(subject) {
            errors.message = "Subject already exist";
            errors.code = "SUBJECT_ALREADY_EXIST";
            throw errors;
        }

        const newSubject = new Subject({
            title: title,
            tasks: [],
            groups: groups
        });

        const resultedSubject = await newSubject.save();

        await Teacher.findOneAndUpdate(
            { _id: teacher },
            { $push: { subjects: resultedSubject._id } }
        );

        groups.map(async (group) => {
            await Group.findOneAndUpdate({_id: group},
                {$push: {subjects: resultedSubject._id}}, {new: true});
        });

        return {
            _id: resultedSubject.id,
            title: resultedSubject.title,
            tasks: resultedSubject.tasks._id
        }
    } catch (error) {
        console.log(error);
        throw new GraphQLError(error.message, {
            extensions: {
                code: error.code
            }
        });
    }
}

export const createTask = async (_, args, ctx) => {
    let {name, description, subject: id} = args.newTask;
    let errors = {};
    try {
        if(!ctx.isAuth || ctx.role !== "teacher") {
            errors.message = "Not Authorized for this action";
            errors.code = "NOT_AUTHORIZED";
            throw errors;
        }

        const subject = await Subject.findById(id);
        if(!subject) {
            errors.message = "Subjects not found";
            errors.code = "SUBJECT_NOT_FOUND";
            throw errors;
        }

        const newTask = new Task({name, description, subject, hometasks: []});
        const task = await newTask.save();

        let updatedSubject = await Subject.findOneAndUpdate(
            { _id: id },
            { $push: { tasks: task._id } },
            {new: true}
        );

        subject.tasks.map(async task => {
            const t = await Task.findById(task);
            return {
                _id: t._id,
                name: t.name,
                description: t.description,
            }
        });

        return {
            _id: updatedSubject._id,
            title: updatedSubject.title,
            tasks: updatedSubject.tasks.map(async task => {
                const t = await Task.findById(task);
                return {
                    _id: t._id,
                    name: t.name,
                    description: t.description,
                    hometasks: t.hometasks.map(async(h) => {
                        const hometask = await Hometask.findOne({_id: h});
                        const student = await Student.findById(hometask.student);
                        const user = await User.findById(student.user);
                        return {
                            _id: hometask._id,
                            text: hometask.text,
                            status: hometask.status,
                            student: {
                                user: user
                            }
                        }
                    })
                }
            })
        }

    } catch (error) {
        console.log(error);
        throw new GraphQLError(error.message, {
            extensions: {
                code: error.code
            }
        });
    }
}
export const deleteTask = async (_, args, ctx) => {
    let {id} = args;
    let errors = {};
    try {
        if(!ctx.isAuth || ctx.role !== "teacher") {
            errors.message = "Not Authorized for this action";
            errors.code = "NOT_AUTHORIZED";
            throw errors;
        }

        const task = await Task.findById(id);
        if(!task) {
            errors.message = "Task not found";
            errors.code = "TASK_NOT_FOUND";
            throw errors;
        }

        let subject = await Subject.findOneAndUpdate(
            { _id: task.subject },
            { $pull: { tasks: task._id } },
            {new: true}
        );

        task.hometasks.map(async(h) => {
           await Hometask.findByIdAndDelete(h);
        });

        await Task.findByIdAndDelete(id);

        return {
            _id: subject._id,
            title: subject.title,
            tasks: subject.tasks.map(async item => {
                const t = await Task.findById(item);
                return {
                    _id: t._id,
                    name: t.name,
                    description: t.description,
                    hometasks: t.hometasks.map(async(h) => {
                        const hometask = await Hometask.findOne({_id: h});
                        const student = await Student.findById(hometask.student);
                        const user = await User.findById(student.user);
                        return {
                            _id: hometask._id,
                            text: hometask.text,
                            status: hometask.status,
                            student: {
                                user: user
                            }
                        }
                    })
                }
            })
        }

    } catch (error) {
        console.log(error);
        throw new GraphQLError(error.message, {
            extensions: {
                code: error.code
            }
        });
    }
}
export const updateTask = async () => {
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
}

export const updateHomeTask = async (_, args, ctx) => {
    let {id, status} = args;
    let errors = {};
    try {
        if(!ctx.isAuth || ctx.role !== "teacher") {
            errors.message = "Not Authorized for this action";
            errors.code = "NOT_AUTHORIZED";
            throw errors;
        }

        let hometask = await Hometask.findOneAndUpdate({_id: id}, {status}, {new: true});
        return {
            _id: hometask._id,
            text: hometask.text,
            status: hometask.status,
            task: hometask.task,
            student: hometask.student,
        }
    } catch (error) {
        console.log(error);
        throw new GraphQLError(error.message, {
            extensions: {
                code: error.code
            }
        });
    }
}

