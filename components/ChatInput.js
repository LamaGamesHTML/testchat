function ChatInput({ 
  newMessage, 
  onMessageChange, 
  onSubmit,
  onFileSelect,
  uploadingImage,
  selectedImagePreview,
  onRemoveImage,
  fileInputRef
}) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  return (
    <>
      <form className="chat-input" onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Send a message"
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <input
          type="file"
          accept="image/*"
          onChange={onFileSelect}
          style={{ display: 'none' }}
          ref={fileInputRef}
        />
        <button 
          type="button" 
          className="upload-button"
          onClick={() => fileInputRef.current.click()}
        >
          <i className="ri-image-line"></i>
        </button>
        <button type="submit" className="upload-button">
          {uploadingImage ? (
            <div className="loading-indicator"></div>
          ) : (
            <i className="ri-send-plane-fill"></i>
          )}
        </button>
      </form>
      {selectedImagePreview && (
        <div className="image-upload-preview">
          <img src={selectedImagePreview} alt="Upload preview" />
          <span className="remove-image" onClick={onRemoveImage}>
            <i className="ri-close-line"></i>
          </span>
        </div>
      )}
    </>
  );
}

