import mongoose from "mongoose";

const Schema = mongoose.Schema;

const teacherSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "Teacher",
        required: true
    },
    subjects: [
        {
            type: Schema.Types.ObjectId,
            ref: "Subject"
        }
    ]
});

export default mongoose.model('Teacher', teacherSchema);