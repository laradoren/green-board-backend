import mongoose from "mongoose";

const Schema = mongoose.Schema;

const groupSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    students: [
        {
            type: Schema.Types.ObjectId,
            ref: "Student"
        }
    ],
    subjects: [

    ]
});

export default mongoose.model('Group', groupSchema);