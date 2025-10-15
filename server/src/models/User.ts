import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'admin' | 'finance_expert';

export interface UserDocument extends Document {
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  role: { type: String, enum: ['admin', 'finance_expert'], default: 'finance_expert', index: true },
  passwordHash: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date },
}, { timestamps: true });

UserSchema.index({ email: 1 }, { unique: true });

export const User: Model<UserDocument> = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);
