const responses = {
  messageTokenIssue(response, scopeMessage) {
    response.status(401).json({
      success: false,
      message: scopeMessage || 'problem with access token'
    });
  },

  messageAuthorizedAccess(response, scopeMessage) {
    response.status(403).json({
      success: false,
      message: scopeMessage || 'unauthorized access'
    });
  },

  messageServerError(response, scopeMessage, error) {
    response.status(500).json({
      success: false,
      message: `${scopeMessage}`,
      error: error.message
    });
  },


  messageBadRequest(response, scopeMessage, error) {
    response.status(400).json({
      success: false,
      message: `${scopeMessage}`,
      error: error.message || 'misunderstood request'
    });
  },


  messageNotFound(response, scopeMessage) {
    response.status(404).json({
      success: false,
      message: scopeMessage || 'content not found'
    });
  },

  messageContentCreated(response, scopeMessage, data) {
    response.status(201).json({
      success: true,
      message: `${scopeMessage}`,
      data
    });
  },

  messageOkSendData(response, data) {
    response.status(200).json({
      success: true,
      data
    });
  },

  messageDeleteSuccess(response, scopeMessage) {
    response.status(200).json({
      success: true,
      message: scopeMessage || 'content deleted'
    });
  }
};

export default responses;


