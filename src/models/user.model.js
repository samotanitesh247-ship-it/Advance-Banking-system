import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, "Please fill a valid email address"],
        unique: [true, "Email already exists"]
    },
    password: {
        type: String,
        required: true,
        minlength: [6, "Password must be at least 6 characters long"],
        select: false
    }
}, {
    timestamps: true
})

userSchema.pre("save", async function(next){ // this refers to the password hashing process, we use pre save hook to hash the password before saving it to the database
    if(!this.isModified("password")){
        return next();
    }
    
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    return next();
})

userSchema.methods.comparePassword = async function(password){  // this refers to the user instance, we use comparePassword method to compare the password entered by the user with the hashed password stored in the database
    return await bcrypt.compare(password, this.password);
}

const user = mongoose.model("user",userSchema);

export default user;