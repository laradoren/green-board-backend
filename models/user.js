import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
    role: {
        type: String,
        required: true
    },
    teacher: {
        type: Schema.Types.ObjectId,
        ref: "Teacher"
    },
    student: {
        type: Schema.Types.ObjectId,
        ref: "Student"
    }
});

export default mongoose.model('User', userSchema);