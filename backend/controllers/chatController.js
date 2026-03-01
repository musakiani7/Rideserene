const Conversation = require('../models/Conversation');
const ChatMessage = require('../models/ChatMessage');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');

// ---------- Customer chat (req.user.id = customer) ----------

exports.getConversationsCustomer = async (req, res) => {
  try {
    const conversations = await Conversation.find({ customer: req.user.id })
      .populate('booking', 'bookingReference pickupDate pickupTime pickupLocation status')
      .populate('chauffeur', 'firstName lastName profilePicture')
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error('Get conversations (customer) error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.getOrCreateConversationByBookingCustomer = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).lean();
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized for this booking' });
    }
    const statusOk = ['confirmed', 'assigned', 'in-progress'].includes(booking.status);
    if (!statusOk) {
      return res.status(400).json({
        success: false,
        message: 'Chat is available only for confirmed or assigned rides',
      });
    }
    if (!booking.chauffeur) {
      return res.status(400).json({
        success: false,
        message: 'No chauffeur assigned to this ride yet',
      });
    }

    let conversation = await Conversation.findOne({ booking: bookingId })
      .populate('chauffeur', 'firstName lastName profilePicture')
      .populate('booking', 'bookingReference pickupDate pickupTime');
    if (!conversation) {
      conversation = await Conversation.create({
        booking: bookingId,
        customer: req.user.id,
        chauffeur: booking.chauffeur,
      });
      conversation = await Conversation.findById(conversation._id)
        .populate('chauffeur', 'firstName lastName profilePicture')
        .populate('booking', 'bookingReference pickupDate pickupTime')
        .lean();
    } else {
      conversation = conversation.toObject ? conversation.toObject() : conversation;
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Get/create conversation (customer) error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.getMessagesCustomer = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const conversation = await Conversation.findOne({
      booking: bookingId,
      customer: req.user.id,
    });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const messages = await ChatMessage.find({ conversation: conversation._id })
      .sort({ createdAt: 1 })
      .lean();

    // Mark chauffeur messages as read by customer
    await ChatMessage.updateMany(
      { conversation: conversation._id, senderType: 'chauffeur', readByCustomer: false },
      { readByCustomer: true }
    );

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Get messages (customer) error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.sendMessageCustomer = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { content } = req.body;
    const imageFile = req.file; // From multer upload

    console.log('📤 [sendMessageCustomer] Request received');
    console.log('📤 [sendMessageCustomer] bookingId:', bookingId);
    console.log('📤 [sendMessageCustomer] content:', content);
    console.log('📤 [sendMessageCustomer] imageFile:', imageFile ? { filename: imageFile.filename, size: imageFile.size, mimetype: imageFile.mimetype } : 'none');

    // Must have either content or image
    if ((!content || !String(content).trim()) && !imageFile) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message content or image is required' 
      });
    }

    const conversation = await Conversation.findOne({
      booking: bookingId,
      customer: req.user.id,
    });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Build image URL if file was uploaded
    const imageUrl = imageFile ? `/uploads/chat/${imageFile.filename}` : null;
    const messageContent = content ? String(content).trim().substring(0, 2000) : '';
    
    // Determine message type
    let messageType = 'text';
    if (imageUrl && messageContent) {
      messageType = 'text_image';
    } else if (imageUrl) {
      messageType = 'image';
    }

    // Prepare message data - only include content if it's not empty
    const messageData = {
      conversation: conversation._id,
      senderType: 'customer',
      messageType: messageType,
      readByChauffeur: false,
    };
    
    if (messageContent) {
      messageData.content = messageContent;
    }
    
    if (imageUrl) {
      messageData.imageUrl = imageUrl;
    }

    console.log('📤 [sendMessageCustomer] Creating message with data:', messageData);
    
    const message = await ChatMessage.create(messageData);
    console.log('📤 [sendMessageCustomer] Message created successfully:', message._id);

    conversation.updatedAt = new Date();
    await conversation.save();

    // Populate the message for response
    const populatedMessage = await ChatMessage.findById(message._id);
    
    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.error('Send message (customer) error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ---------- Chauffeur chat (req.chauffeur.id = chauffeur) ----------

exports.getChatEligibleRidesChauffeur = async (req, res) => {
  try {
    const rides = await Booking.find({
      chauffeur: req.chauffeur.id,
      status: { $in: ['confirmed', 'assigned', 'in-progress'] },
    })
      .populate('customer', 'firstName lastName profileImage')
      .sort({ pickupDate: 1 })
      .lean();
    res.status(200).json({
      success: true,
      data: rides,
    });
  } catch (error) {
    console.error('Get chat eligible rides (chauffeur) error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rides',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.getConversationsChauffeur = async (req, res) => {
  try {
    const conversations = await Conversation.find({ chauffeur: req.chauffeur.id })
      .populate('booking', 'bookingReference pickupDate pickupTime pickupLocation status')
      .populate('customer', 'firstName lastName profileImage')
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error('Get conversations (chauffeur) error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.getOrCreateConversationByBookingChauffeur = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).lean();
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.chauffeur.toString() !== req.chauffeur.id) {
      return res.status(403).json({ success: false, message: 'Not your booking' });
    }
    const statusOk = ['confirmed', 'assigned', 'in-progress'].includes(booking.status);
    if (!statusOk) {
      return res.status(400).json({
        success: false,
        message: 'Chat is available only for confirmed or assigned rides',
      });
    }

    let conversation = await Conversation.findOne({ booking: bookingId })
      .populate('customer', 'firstName lastName profileImage')
      .populate('booking', 'bookingReference pickupDate pickupTime');
    if (!conversation) {
      conversation = await Conversation.create({
        booking: bookingId,
        customer: booking.customer,
        chauffeur: req.chauffeur.id,
      });
      conversation = await Conversation.findById(conversation._id)
        .populate('customer', 'firstName lastName profileImage')
        .populate('booking', 'bookingReference pickupDate pickupTime')
        .lean();
    } else {
      conversation = conversation.toObject ? conversation.toObject() : conversation;
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Get/create conversation (chauffeur) error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.getMessagesChauffeur = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const conversation = await Conversation.findOne({
      booking: bookingId,
      chauffeur: req.chauffeur.id,
    });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const messages = await ChatMessage.find({ conversation: conversation._id })
      .sort({ createdAt: 1 })
      .lean();

    await ChatMessage.updateMany(
      { conversation: conversation._id, senderType: 'customer', readByChauffeur: false },
      { readByChauffeur: true }
    );

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Get messages (chauffeur) error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.sendMessageChauffeur = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { content } = req.body;
    const imageFile = req.file; // From multer upload

    console.log('📤 [sendMessageChauffeur] Request received');
    console.log('📤 [sendMessageChauffeur] bookingId:', bookingId);
    console.log('📤 [sendMessageChauffeur] content:', content);
    console.log('📤 [sendMessageChauffeur] imageFile:', imageFile ? { filename: imageFile.filename, size: imageFile.size, mimetype: imageFile.mimetype } : 'none');

    // Must have either content or image
    if ((!content || !String(content).trim()) && !imageFile) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message content or image is required' 
      });
    }

    const conversation = await Conversation.findOne({
      booking: bookingId,
      chauffeur: req.chauffeur.id,
    });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Build image URL if file was uploaded
    const imageUrl = imageFile ? `/uploads/chat/${imageFile.filename}` : null;
    const messageContent = content ? String(content).trim().substring(0, 2000) : '';
    
    // Determine message type
    let messageType = 'text';
    if (imageUrl && messageContent) {
      messageType = 'text_image';
    } else if (imageUrl) {
      messageType = 'image';
    }

    // Prepare message data - only include content if it's not empty
    const messageData = {
      conversation: conversation._id,
      senderType: 'chauffeur',
      messageType: messageType,
      readByCustomer: false,
    };
    
    if (messageContent) {
      messageData.content = messageContent;
    }
    
    if (imageUrl) {
      messageData.imageUrl = imageUrl;
    }

    console.log('📤 [sendMessageChauffeur] Creating message with data:', messageData);
    
    const message = await ChatMessage.create(messageData);
    console.log('📤 [sendMessageChauffeur] Message created successfully:', message._id);

    conversation.updatedAt = new Date();
    await conversation.save();

    // Populate the message for response
    const populatedMessage = await ChatMessage.findById(message._id);
    
    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.error('Send message (chauffeur) error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ---------- Delete conversation (Customer) ----------

exports.deleteConversationCustomer = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const customerId = req.user?.id || req.user?._id;
    
    console.log('🗑️ [deleteConversationCustomer] Route hit!');
    console.log('🗑️ [deleteConversationCustomer] bookingId:', bookingId);
    console.log('🗑️ [deleteConversationCustomer] customerId:', customerId);
    console.log('🗑️ [deleteConversationCustomer] req.user:', req.user);
    
    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
    
    // Convert bookingId to ObjectId if it's a valid MongoDB ObjectId
    let bookingObjectId;
    try {
      if (mongoose.Types.ObjectId.isValid(bookingId)) {
        bookingObjectId = new mongoose.Types.ObjectId(bookingId);
      } else {
        bookingObjectId = bookingId;
      }
    } catch (e) {
      bookingObjectId = bookingId;
    }
    
    console.log('🗑️ [deleteConversationCustomer] Searching for conversation with booking:', bookingObjectId);
    
    // Try multiple query approaches
    let conversation = await Conversation.findOne({
      booking: bookingObjectId,
      customer: customerId,
    });
    
    // If not found, try with string comparison
    if (!conversation) {
      conversation = await Conversation.findOne({
        $expr: { 
          $and: [
            { $eq: [{ $toString: '$booking' }, String(bookingId)] },
            { $eq: [{ $toString: '$customer' }, String(customerId)] }
          ]
        }
      });
    }

    console.log('🗑️ [deleteConversationCustomer] conversation found:', conversation ? conversation._id : 'NOT FOUND');

    if (!conversation) {
      // Check if conversation exists with different query (maybe booking ID format issue)
      const allConversations = await Conversation.find({ customer: customerId }).lean();
      console.log('🗑️ [deleteConversationCustomer] All conversations for customer:', allConversations.map(c => ({
        id: c._id,
        booking: c.booking,
        bookingStr: String(c.booking)
      })));
      
      // Try to find by string comparison
      const conversationByString = await Conversation.findOne({
        customer: customerId,
        $expr: { $eq: [{ $toString: '$booking' }, bookingId] }
      });
      
      if (!conversationByString) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found for this booking',
        });
      }
      
      // Use the found conversation
      const convToDelete = conversationByString;
      await ChatMessage.deleteMany({ conversation: convToDelete._id });
      await Conversation.findByIdAndDelete(convToDelete._id);
      
      return res.status(200).json({
        success: true,
        message: 'Conversation deleted successfully',
      });
    }

    // Delete all messages in this conversation
    const messagesDeleted = await ChatMessage.deleteMany({ conversation: conversation._id });
    console.log('🗑️ [deleteConversationCustomer] messages deleted:', messagesDeleted.deletedCount);

    // Delete the conversation
    await Conversation.findByIdAndDelete(conversation._id);
    console.log('🗑️ [deleteConversationCustomer] conversation deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (error) {
    console.error('🗑️ [deleteConversationCustomer] error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ---------- Delete conversation (Chauffeur) ----------

exports.deleteConversationChauffeur = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const chauffeurId = req.chauffeur?.id || req.chauffeur?._id;
    
    console.log('🗑️ [deleteConversationChauffeur] Route hit!');
    console.log('🗑️ [deleteConversationChauffeur] bookingId:', bookingId);
    console.log('🗑️ [deleteConversationChauffeur] chauffeurId:', chauffeurId);
    console.log('🗑️ [deleteConversationChauffeur] req.chauffeur:', req.chauffeur);
    
    if (!chauffeurId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
    
    // Convert bookingId to ObjectId if it's a valid MongoDB ObjectId
    let bookingObjectId;
    try {
      if (mongoose.Types.ObjectId.isValid(bookingId)) {
        bookingObjectId = new mongoose.Types.ObjectId(bookingId);
      } else {
        bookingObjectId = bookingId;
      }
    } catch (e) {
      bookingObjectId = bookingId;
    }
    
    console.log('🗑️ [deleteConversationChauffeur] Searching for conversation with booking:', bookingObjectId);
    
    // Try multiple query approaches
    let conversation = await Conversation.findOne({
      booking: bookingObjectId,
      chauffeur: chauffeurId,
    });
    
    // If not found, try with string comparison
    if (!conversation) {
      conversation = await Conversation.findOne({
        $expr: { 
          $and: [
            { $eq: [{ $toString: '$booking' }, String(bookingId)] },
            { $eq: [{ $toString: '$chauffeur' }, String(chauffeurId)] }
          ]
        }
      });
    }

    console.log('🗑️ [deleteConversationChauffeur] conversation found:', conversation ? conversation._id : 'NOT FOUND');

    if (!conversation) {
      // Check if conversation exists with different query (maybe booking ID format issue)
      const allConversations = await Conversation.find({ chauffeur: chauffeurId }).lean();
      console.log('🗑️ [deleteConversationChauffeur] All conversations for chauffeur:', allConversations.map(c => ({
        id: c._id,
        booking: c.booking,
        bookingStr: String(c.booking)
      })));
      
      // Try to find by string comparison
      const conversationByString = await Conversation.findOne({
        chauffeur: chauffeurId,
        $expr: { $eq: [{ $toString: '$booking' }, bookingId] }
      });
      
      if (!conversationByString) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found for this booking',
        });
      }
      
      // Use the found conversation
      const convToDelete = conversationByString;
      await ChatMessage.deleteMany({ conversation: convToDelete._id });
      await Conversation.findByIdAndDelete(convToDelete._id);
      
      return res.status(200).json({
        success: true,
        message: 'Conversation deleted successfully',
      });
    }

    // Delete all messages in this conversation
    const messagesDeleted = await ChatMessage.deleteMany({ conversation: conversation._id });
    console.log('🗑️ [deleteConversationChauffeur] messages deleted:', messagesDeleted.deletedCount);

    // Delete the conversation
    await Conversation.findByIdAndDelete(conversation._id);
    console.log('🗑️ [deleteConversationChauffeur] conversation deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (error) {
    console.error('🗑️ [deleteConversationChauffeur] error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
