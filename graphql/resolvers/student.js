import Group from "../../models/group.js";
import Subject from "../../models/subject.js";
import Task from "../../models/task.js";
import {GraphQLError} from "graphql/index.js";
import Hometask from "../../models/hometask.js";

export const getStudentsSubjects = async (_, args, ctx) => {
    let {group, id} = args;
    let errors = {};
    try {
        if(!ctx.isAuth || ctx.role !== "student") {
            errors.message = "Not Authorized for this action";
            errors.code = "NOT_AUTHORIZED";
            throw errors;
        }
        const findGroup = await Group.findOne({code: group});
        if(!findGroup) {
            errors.message = "Group Not found";
            errors.code = "NOT_FOUND";
            throw errors;
        }
        return findGroup.subjects.map(async s => {
            const subject = await Subject.findById(s);
            return {
                _id: subject._id,
                title: subject.title,
                tasks: subject.tasks.map(async task => {
                    const t = await Task.findById(task);
                    let tasks = {
                        _id: t._id,
                        name: t.name,
                        description: t.description,
                        hometasks: []
                    }

                    const hometask = await Hometask.findOne({task: t._id, student: id});
                    if(hometask) {
                        tasks.hometasks.push({
                            _id: hometask._id,
                            text: hometask.text,
                            status: hometask.status
                        });
                    }

                    return tasks
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

export const createHomeTask = async (_, args, ctx) => {
    let {text, status, student, task} = args.hometask;
    let errors = {};
    try {
        if(!ctx.isAuth || ctx.role !== "student") {
            errors.message = "Not Authorized for this action";
            errors.code = "NOT_AUTHORIZED";
            throw errors;
        }
        const findTask = await Task.findById(task);
        if(!findTask) {
            errors.message = "Task Not found";
            errors.code = "TASK_NOT_FOUND";
            throw errors;
        }

        let homeTask = await Hometask.findOne({task, student});
        if (homeTask) {
            await Hometask.findOneAndUpdate({task, student}, {status, text}, {new: true});
        }
        if(!homeTask) {
            const newHomeTask = new Hometask({
                text: text,
                status: status,
                student: student,
                task: task
            });

            const hometask = await newHomeTask.save();

            await Task.findOneAndUpdate(
                { _id: task },
                { $push: { hometasks: hometask._id } },
                {new: true}
            );
        }

        const subject = await Subject.findById(findTask.subject);
        return {
            _id: subject._id,
            title: subject.title,
            tasks: subject.tasks.map(async task => {
                const t = await Task.findById(task);
                let tasks = {
                    _id: t._id,
                    name: t.name,
                    description: t.description,
                    hometasks: []
                }

                const h = await Hometask.findOne({task: t._id, student: student});
                if(h) {
                    tasks.hometasks.push({
                        _id: h._id,
                        text: h.text,
                        status: h.status
                    });
                }

                return tasks
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

