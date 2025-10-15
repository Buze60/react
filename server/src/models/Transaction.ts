import mongoose, { Schema, Document, Model } from 'mongoose';

export type TransactionType = 'income' | 'expense';

export interface TransactionDocument extends Document {
  date: Date;
  category: string;
  description?: string;
  amount: number;
  type: TransactionType;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<TransactionDocument>({
  date: { type: Date, required: true, index: true },
  category: { type: String, required: true, trim: true, maxlength: 64, index: true },
  description: { type: String, trim: true, maxlength: 500 },
  amount: { type: Number, required: true, min: 0.01 },
  type: { type: String, enum: ['income', 'expense'], required: true, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

TransactionSchema.index({ type: 1, date: -1 });
TransactionSchema.index({ createdBy: 1, date: -1 });

export const Transaction: Model<TransactionDocument> = mongoose.models.Transaction || mongoose.model<TransactionDocument>('Transaction', TransactionSchema);
