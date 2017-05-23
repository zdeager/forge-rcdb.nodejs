/////////////////////////////////////////////////////////
// Viewing.Extension.ModelLoader
// by Philippe Leefsma, April 2017
//
/////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import Toolkit from 'Viewer.Toolkit'

class HFDMCoreExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'hfdm-core'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.HFDM.Core'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    console.log('Viewing.Extension.HFDM.Core loaded')

    SystemJS.import('/resources/libs/hfdm/forge-hfdm.js').then((res) => {
      console.log(res)
    })

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.HFDM.Core unloaded')

    super.unload ()

    return true
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  HFDMCoreExtension.ExtensionId,
  HFDMCoreExtension)
