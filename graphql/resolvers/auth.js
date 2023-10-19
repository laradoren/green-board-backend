import User from "../../models/user.js";
import jwt from "jsonwebtoken";
import {GraphQLError} from "graphql";
import bcrypt from "bcryptjs";
import Student from "../../models/student.js";
import Teacher from "../../models/teacher.js";

export const findUserByEmail = async (email) => await User.findOne({email: email});
export const login = async (_, args) => {
    let {email, password} = args;
    let errors = {};

    try {
        const user = await findUserByEmail(email);

        if(!user) {
            errors.message = "User does not found";
            errors.code = "USER_DONT_FOUND";
            throw errors;
        }

         const correctPassword = await bcrypt.compare(password, user.password);

        if(!correctPassword) {
            errors.message = "Can`t authenticate with this data";
            errors.code = "CANT_AUTHENTICATE";
            throw errors;
        }

        const token = jwt.sign(
            {userId: user._id, role: user.role, email: user.email},
            'privatekey',
            {expiresIn: "24h"}
        );

        if(user.role === "student") {
            let student = await Student.findOne({user: user._id});
            return {
                user, token: token, group: student.group, student: student._id
            }
        }

        if(user.role === "teacher") {
            let teacher = await Teacher.findOne({user: user._id});
            return {
                user, token: token, teacher: teacher._id
            }
        }

        return {
            user, token: token
        }
    } catch (error) {
        throw new GraphQLError(error.message, {
            extensions: {
                code: error.code
            }
        });
    }
};

export const findUser = async (_, args) => {
    const {email} = args;
    let errors = {};
    try {
        const user = await findUserByEmail(email);
        if(!user) {
            errors.message = "User does not found";
            errors.code = "USER_DONT_FOUND";
            throw errors;
        }

        return user;
    } catch (error) {
        throw new GraphQLError(error.message, {
            extensions: {
                code: error.code
            }
        });
    }
}

export const register = async (_, args) => {
    let {email, password} = args;
    let errors = {};
    try {
        const user = await findUserByEmail(email);
        if(!user) {
            errors.message = "User does not found";
            errors.code = "USER_DONT_FOUND";
            throw errors;
        }

        if(user.password) {
            errors.message = "User already active";
            errors.code = "USER_IS_ACTIVE";
            throw errors;
        }

        password = await bcrypt.hash(password, 6);

        const data = await User.findOneAndUpdate(
            {email: email},
            {password: password},
            {new: true}
        );

        const token = jwt.sign(
            {userId: data.id, role: data.role, email: data.email},
            'privatekey',
            {expiresIn: "24h"}
        );

        if(user.role === "student") {
            let student = await Student.findOne({user: user._id});
            return {
                user, token: token, group: student.group, student: student._id
            }
        }

        if(user.role === "teacher") {
            let teacher = await Teacher.findOne({user: user._id});
            return {
                user, token: token, teacher: teacher._id
            }
        }

        return {
            user: data, token: token
        }

    } catch (error) {
        throw new GraphQLError(error.message, {
            extensions: {
                code: error.code
            }
        });
    }
}

export const logout = async (_, args) => {
}