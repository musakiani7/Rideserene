const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  senderType: {
    type: String,
    enum: ['customer', 'chauffeur'],
    required: true,
  },
  content: {
    type: String,
    required: false, // Not required if image is present
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters'],
    default: '',
  },
  imageUrl: {
    type: String,
    required: false, // Not required if content is present
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'text_image'],
    default: 'text',
  },
  readByCustomer: { type: Boolean, default: false },
  readByChauffeur: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

chatMessageSchema.index({ conversation: 1, createdAt: 1 });

// Custom validation: must have either content or imageUrl
chatMessageSchema.pre('validate', function(next) {
  if (!this.content && !this.imageUrl) {
    this.invalidate('content', 'Message must have either content or image');
    this.invalidate('imageUrl', 'Message must have either content or image');
  }
  next();
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
