import mongoose from "mongoose";

const Schema = mongoose.Schema;

const hometaskSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    task: {
        type: Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },
    student: {
        type: Schema.Types.ObjectId,
        ref: "Student",
        required: true
    }
});

export default mongoose.model('Hometask', hometaskSchema);