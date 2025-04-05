const room = new WebsimSocket();
const { useState, useEffect, useRef } = React;

function App() {
  const messages = React.useSyncExternalStore(
    room.collection('message').subscribe,
    () => room.collection('message').getList() || []
  );

  const reactions = React.useSyncExternalStore(
    room.collection('reaction').subscribe,
    () => room.collection('reaction').getList() || []
  );

  const [newMessage, setNewMessage] = useState('');
  const [activeEmojiPicker, setActiveEmojiPicker] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const emojiPickers = document.querySelectorAll('.emoji-picker');
      let clickedInside = false;
      emojiPickers.forEach(picker => {
        if (picker.contains(event.target)) clickedInside = true;
      });
      if (!clickedInside) setActiveEmojiPicker(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.created_at) - new Date(b.created_at)
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedImage) return;

    try {
      let imageUrl = null;
      if (selectedImage) {
        setUploadingImage(true);
        imageUrl = await websim.upload(selectedImage);
      }

      await room.collection('message').create({
        content: newMessage.trim(),
        imageUrl: imageUrl
      });

      setNewMessage('');
      setSelectedImage(null);
      setSelectedImagePreview(null);
      setUploadingImage(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setUploadingImage(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddReaction = async (messageId, emoji, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      const existingReaction = reactions.find(
        r => r.message_id === messageId && 
             r.emoji === emoji && 
             r.username === room.party.client.username
      );

      if (existingReaction) {
        await room.collection('reaction').delete(existingReaction.id);
      } else {
        await room.collection('reaction').create({
          message_id: messageId,
          emoji: emoji
        });
      }
    } catch (error) {
      console.error('Error managing reaction:', error);
    }
    setActiveEmojiPicker(null);
  };

  const getMessageReactions = (messageId) => {
    const messageReactions = reactions.filter(r => r.message_id === messageId);
    return messageReactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = {
          count: 0,
          users: [],
          hasReacted: false
        };
      }
      acc[reaction.emoji].count++;
      acc[reaction.emoji].users.push(reaction.username);
      if (reaction.username === room.party.client.username) {
        acc[reaction.emoji].hasReacted = true;
      }
      return acc;
    }, {});
  };

  return (
    <div className="app">
      <ChatHeader />
      <div className="chat-messages">
        {sortedMessages.map(message => (
          <Message
            key={message.id}
            message={message}
            reactions={getMessageReactions(message.id)}
            onReaction={handleAddReaction}
            activeEmojiPicker={activeEmojiPicker}
            onToggleEmojiPicker={(messageId, e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveEmojiPicker(activeEmojiPicker === messageId ? null : messageId);
            }}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput
        newMessage={newMessage}
        onMessageChange={setNewMessage}
        onSubmit={handleSendMessage}
        onFileSelect={handleFileSelect}
        uploadingImage={uploadingImage}
        selectedImagePreview={selectedImagePreview}
        onRemoveImage={() => {
          setSelectedImage(null);
          setSelectedImagePreview(null);
          fileInputRef.current.value = '';
        }}
        fileInputRef={fileInputRef}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);