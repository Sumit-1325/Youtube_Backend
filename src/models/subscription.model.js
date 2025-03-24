import mongoose ,{ Schema } from "mongoose";

const SubscriptionSchema = new Schema({
    Subscriber : {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    Channel : {
        type: Schema.Types.ObjectId, // one to whom subscriber is subscribing
        ref: "User",
        required: true
    },
}
,{ timestamps: true } 
);

export const Subscription = mongoose.model("Subscription", SubscriptionSchema);