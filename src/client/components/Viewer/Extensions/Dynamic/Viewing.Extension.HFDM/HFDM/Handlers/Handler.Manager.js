import HandlerBase from './Handler.Base'

export default class HandlerManager {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor () {
    this.handlerMap = {}
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  registerHandler (id, handler) {
    this.handlerMap[id] = handler
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getHandler (id) {
    const handler = this.handlerMap[id]

    return handler || new HandlerBase()
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  bind (workspace) {
    this.workspace = workspace

    for (var id in this.handlerMap) {
      this.handlerMap[id].bind(workspace)
    }
  }
}
