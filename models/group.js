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
        {
            type: Schema.Types.ObjectId,
            ref: "Subject"
        }
    ]
});

export default mongoose.model('Group', groupSchema);