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
      message: scopeMessage || 'unauthorised access'
    });
  },

  messageServerError(response, scopeMessage) {
    response.status(500).json({
      success: false,
      message: `${scopeMessage}`
    });
  },

  messageBadRequest(response, scopeMessage) {
    response.status(400).json({
      success: false,
      message: scopeMessage
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
  },

  messageUpdateSuccess(response, scopeMessage) {
    response.status(200).json({
      success: true,
      message: scopeMessage || 'data update successful'
    });
  }
};

export default responses;


