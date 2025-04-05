function Message({ message, reactions, onReaction, activeEmojiPicker, onToggleEmojiPicker }) {
  return (
    <div key={message.id} className="message">
      <img 
        className="message-avatar" 
        src={`https://images.websim.ai/avatar/${message.username}`}
        alt={message.username} 
      />
      <div className="message-content">
        <div className="message-header">
          <span className="message-author">{message.username}</span>
          <span className="message-time">
            {new Date(message.created_at).toLocaleTimeString()}
          </span>
        </div>
        {message.content && <div className="message-text">{message.content}</div>}
        {message.imageUrl && (
          <img 
            className="message-image" 
            src={message.imageUrl} 
            alt="Uploaded content"
            onClick={() => window.open(message.imageUrl, '_blank')}
          />
        )}
        <MessageReactions 
          messageId={message.id}
          reactions={reactions}
          onReaction={onReaction}
          activeEmojiPicker={activeEmojiPicker}
          onToggleEmojiPicker={onToggleEmojiPicker}
        />
      </div>
    </div>
  );
}