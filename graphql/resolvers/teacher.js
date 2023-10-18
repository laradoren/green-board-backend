import Group from "../../models/group.js";
import User from "../../models/user.js";
import Teacher from "../../models/teacher.js";
import Subject from "../../models/subject.js";
import Task from "../../models/task.js";
import {GraphQLError} from "graphql/index.js";

export const allGroups = async () => {
    try {
        const groups = await Group.find();
        return groups.map(async group => {
            return {
                _id: group._id,
                code: group.code
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
    let {email} = args;
    let errors = {};
    try {
        if(!ctx.isAuth || ctx.role !== "teacher") {
            errors.message = "Not Authorized for this action";
            errors.code = "NOT_AUTHORIZED";
            throw errors;
        }
        const user = await User.findOne({email: email});
        if(!user) {
            errors.message = "Not found";
            errors.code = "NOT_AUTHORIZED";
            throw errors;
        }
        const teacher = await Teacher.findOne({user: user._id});
        return teacher.subjects.map(async s => {
            const subject = await Subject.findById(s);
            return {
                _id: subject._id,
                title: subject.title,
                tasks: subject.tasks.map(async task => {
                    const t = await Task.findById(task);
                    return {
                        _id: t._id,
                        name: t.name,
                        description: t.description
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
    let {email, title, groups} = args.newSubject;
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

        const user = await User.findOne({email: email});
        if(!user) {
            errors.message = "Not found";
            errors.code = "NOT_AUTHORIZED";
            throw errors;
        }

        await Teacher.updateOne(
            { user: user._id },
            { $push: { subjects: resultedSubject._id } }
        );

        groups.map((group) => {
            return Group.updateOne({code: group},
                {$push: {subjects: resultedSubject._id}});
        });

        return {
            _id: resultedSubject.id,
            title: resultedSubject.title,
            tasks: resultedSubject.tasks
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

        const newTask = new Task({name, description, subject});
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
                description: t.description
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
                    description: t.description
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

        await Task.findByIdAndDelete(id);

        return {
            _id: subject._id,
            title: subject.title,
            tasks: subject.tasks.map(async item => {
                const t = await Task.findById(item);
                return {
                    _id: t._id,
                    name: t.name,
                    description: t.description
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
        //console.log(error);
        throw error;
    }
}

