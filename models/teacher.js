import mongoose from "mongoose";

const Schema = mongoose.Schema;

const teacherSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "Teacher",
        required: true
    },
    subjects: [

    ]
});

export default mongoose.model('Teacher', teacherSchema);