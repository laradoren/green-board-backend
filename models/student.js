import mongoose from "mongoose";

const Schema = mongoose.Schema;

const studentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "Student"
    },
    group: String,
    subjects: [

    ]
});

export default mongoose.model('Student', studentSchema);