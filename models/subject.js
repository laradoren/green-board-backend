import mongoose from "mongoose";

const Schema = mongoose.Schema;

const subjectSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    groups: [
        {
            type: Schema.Types.ObjectId,
            ref: "Group"
        }
    ],
    tasks: [
        {
            type: Schema.Types.ObjectId,
            ref: "Task"
        }
    ]
});

export default mongoose.model('Subject', subjectSchema);