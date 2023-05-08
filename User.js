import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    clients: {
        type: [String]
    },
    role: {
        type: String, 
        required: true,
        default: "employee"
    },
    position: {
        type: String,
        default: "employee"
    },
    gmail: {
        type: String, 
        default: ""
    },
    phone: {
      type: String, 
      default: ""
    },
    firstName: String,
    lastName: String,
    profileImg: String
})


userSchema.pre('save', function(next) {
    if (this.isNew) {
      const firstName = this.email.split(".")[0];
      this.firstName = firstName;
      const lastName = this.email.split(".")[1].split("@")[0];
      this.lastName = lastName;
      const img = this.firstName+".jpeg";
      this.profileImg = img
    }
    next();
  });

userSchema.virtual('id').get(function() {
    return this._id.toHexString();
  });
  
  userSchema.set('toJSON', {
    virtuals: true,
  });

const User = mongoose.model("User", userSchema)
export default User