import User from "../../models/user.js";
import Student from "../../models/student.js";
import Teacher from "../../models/teacher.js";
import {GraphQLError} from "graphql";
import {findUserByEmail} from "./auth.js";

export const createUser = async (_, args, ctx) => {
    let errors = {};
    const {fullname, email, role} = args.newUser;
    try {
        if(!ctx.isAuth || ctx.role !== "admin") {
            errors.message = "Not Authorized for this action";
            errors.code = "NOT_AUTHORIZED";
            throw errors;
        }
        const user = await findUserByEmail(email);
        if(user) {
            errors.message = "User already exist";
            errors.code = "USER_ALREADY_EXIST";
            throw errors;
        }
        const newUser = new User({
            fullname: fullname,
            email: email,
            role: role,
        });
        const result = await newUser.save();
        if(role === "student") {
            const student = new Student({
                user: result._id,
            });
            await student.save();
        }
        if(role === "teacher") {
            const teacher = new Teacher({
                user: result._id,
                subjects: []
            });
            await teacher.save();
        }
        return result;
    } catch (error) {
        throw new GraphQLError(error.message, {
            extensions: {
                code: error.code
            }
        });
    }
}