import GraphicMarker from 'GraphicMarker'
import SwitchButton from 'SwitchButton'
import Toolkit from 'Viewer.Toolkit'
import Dropdown from 'Dropdown'

export default class LabelMarker extends GraphicMarker {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor(parent, viewer, dbId, screenPoint, properties = null) {

    super(viewer.container, {x: 100, y: 22})

    this.controlsId = this.guid()

    this.properties = properties

    this.labelId = this.guid()

    this.svgId = this.guid()

    this.viewer = viewer

    this.parent = parent

    this.dbId = dbId

    this.setContent(`
      <div id="${this.labelId}" class="markup3D-label">
        <svg id="${this.svgId}" class="markup3D">
        </svg>
        <div id="${this.controlsId}" class="markup3D">
        </div>
      </div>
    `)

    $(`#${this._markerId}`).css({
      'pointer-events': 'auto'
    })

    $(`#${this.svgId}`).css({
      cursor: 'pointer'
    })

    var snap = Snap($(`#${this.svgId}`)[0])

    this.label = snap.paper.text(0, 15,
      'Place label ...')

    this.label.attr({
      fontFamily: 'Arial',
      fontSize: '13px',
      stroke: '#000000'
    })

    this.setVisible(true)

    this.setScreenPoint(screenPoint)

    this.onMouseMoveHandler = (event)=>
      this.onMouseMove(event)

    this.onMouseUpHandler = (event)=>
      this.onMouseUp(event)

    this.onMouseDownHandler = (event)=>
      this.onMouseDown(event)

    this.onDoubleClickHandler = (event)=>
      this.onDoubleClick(event)

    $(`#${this.labelId}`)
      .mouseover(() => {
        this.emit('mouseover')
      })
      .mouseout(() => {
        this.emit('mouseout')
      })

    $(`#${this.svgId}`).on(
      'mouseup',
      this.onMouseUpHandler)

    $(`#${this.svgId}`).on(
      'mousedown',
      this.onMouseDownHandler)

    $(`#${this.svgId}`).on(
      'dblclick',
      this.onDoubleClickHandler)

    this.createControls()

    this.showControls(false)

    this.timeoutId = 0
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  setVisible (show) {

    if (show) {

      clearTimeout(this.timeoutId)
      this.timeoutId = 0
      super.setVisible(true)

    } else{

      clearTimeout(this.timeoutId)
      this.timeoutId = setTimeout(() => {
        super.setVisible(false)
      }, 400)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  startDrag () {

    $(`#${this.svgId}`).css({
      cursor: 'move'
    })

    var $canvas = $('canvas', this.viewer.container)

    this.viewerCursor = $canvas.css('cursor')

    $canvas.css({
      cursor: 'move'
    })

    this.parent.dragging = true

    $(`#${this.svgId}`).on(
      'mousemove',
      this.onMouseMoveHandler)

    this.parent.emit('drag.start', this.parent)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  async endDrag () {

    this.parent.dragging = false

    $(`#${this.svgId}`).off(
      'mousemove',
      this.onMouseMoveHandler)

    this.parent.emit('drag.end', this.parent)

    var $canvas = $('canvas', this.viewer.container)

    $canvas.css({
      cursor: this.viewerCursor
    })

    $(`#${this._markerId}`).css({
      'pointer-events': 'auto'
    })

    $(`#${this.svgId}`).css({
      cursor: 'pointer'
    })

    if(this.item) {
      return
    }

    // if (LabelMarker.prototype.labelName) {

    //   var prop = await Toolkit.getProperty(
    //     this.viewer.model,
    //     this.dbId,
    //     LabelMarker.prototype.labelName,
    //     'Not Available')

    //   this.updateLabel(
    //     prop.displayName,
    //     prop.displayValue)

    //   this.item = {
    //     value: prop.displayValue,
    //     name: prop.displayName
    //   }

    // } else {

    //   this.showControls(true)
    // }

    this.showControls(true)

    this.emit('created')
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  async createControls() {

    const properties = await Toolkit.getProperties(
      this.viewer.model,
      this.dbId,
      this.properties)

    const sortedProperties = properties.sort((a, b)=>{

      var nameA = a.displayName.toLowerCase()
      var nameB = b.displayName.toLowerCase()

      return nameA > nameB ? 1 : -1
    })

    var menuItems = sortedProperties.map((prop)=>{

      return {
        name: prop.displayName,
        value: prop.displayValue
      }
    })

    var $container = $(`#${this.controlsId}`)

    // this.dropdown = new Dropdown({
    //   container: $container,
    //   title: 'Property',
    //   pos: {
    //     top: 0, left: 0
    //   },
    //   menuItems
    // })

    // this.dropdown.on('item.selected', (item) => {

    //   LabelMarker.prototype.labelName = item.name

    //   this.item = item

    //   this.emit('labelSelected')
    // })

    var occlusionSwitchId = this.guid()
    var bindSwitchId = this.guid()
    var btnRemoveId = this.guid()
    var btnExitId = this.guid()

    let asset_name = this.guid();

    var html = `
      <input type="text" name="${asset_name}" value="Asset Tag" onfocus="this.value=''" style="color: #a9a9a9">
      <br>
      <div style="width: 150px; margin-top: 8px">

        <button id="${btnRemoveId}" class="btn btn-danger btn-ctrl"
          style="float: left; margin-right: 3px;margin-left: 3px;"
          data-placement="bottom"
          data-toggle="tooltip"
          data-delay='{"show":"500", "hide":"100"}'
          title="delete markup">
         <span class="fa fa-remove btn-span"></span>
        </button>
        <button id="${btnExitId}" class="btn btn-success btn-ctrl"
          data-placement="bottom"
          data-toggle="tooltip"
          data-delay='{"show":"500", "hide":"100"}'
          title="exit edit mode">
         <span class="fa fa-sign-out btn-span"></span>
         </button>
      </div>
    `

    $container.append(html)

    const $target = $container.find('label[data-toggle="tooltip"]')

    if ($target.tooltip) {

      $target.tooltip({
        container: 'body',
        animated: 'fade',
        html: true
      })
    }


    this.bindSwitch =
      new SwitchButton('#' + bindSwitchId,
        this.parent.bindToState)

    this.bindSwitch.on('checked', (checked)=>{

      this.parent.bindToState = checked
    })

    this.occlusionSwitch =
      new SwitchButton('#' + occlusionSwitchId,
        this.parent.occlusion)

    this.occlusionSwitch.on('checked', (checked)=>{

      this.parent.occlusion = checked
    })

    $('#' + btnRemoveId).click(()=>{

      this.parent.remove()
    })

    $('#' + btnExitId).click(()=>{

      // // ensure some default is set for next markup
      // if (!this.item) {

      //   this.item = menuItems[0]

      //   LabelMarker.prototype.labelName =
      //     this.item.name
      // }

      this.showControls(false)

      const tag = document.getElementsByName(asset_name)[0].value;
      //console.log(tag);
      this.item = tag;
      this.updateLabel(tag)
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  updateLabel (asset_tag) {

    var snap = Snap($(`#${this.svgId}`)[0])

    snap.attr({
      height:80
    })

    this.label.remove()

    /// asset

    var nameAsset = snap.paper.text(0, 15,
      "Asset Tag: ")

    var valueAsset = snap.paper.text(
      nameAsset.getBBox().width, 15,
      asset_tag)

    nameAsset.attr({
      fontFamily: 'Arial',
      fontSize: '13px',
      stroke: '#FF0000'
    })

    valueAsset.attr({
      fontFamily: 'Arial',
      fontSize: '13px',
      stroke: '#000000'
    })

    /// terminal

    var nameTerminal = snap.paper.text(0, nameAsset.getBBox().height*2,
      "Terminal: ")

    var valueTerminal = snap.paper.text(
      nameTerminal.getBBox().width, nameAsset.getBBox().height*2,
      "A")

    nameTerminal.attr({
      fontFamily: 'Arial',
      fontSize: '13px',
      stroke: '#FF0000'
    })

    valueTerminal.attr({
      fontFamily: 'Arial',
      fontSize: '13px',
      stroke: '#000000'
    })

    /// level

    var nameLevel = snap.paper.text(0, nameAsset.getBBox().height*3,
      "Level: ")

    var valueLevel = snap.paper.text(
      nameLevel.getBBox().width, nameAsset.getBBox().height*3,
      "1")

    nameLevel.attr({
      fontFamily: 'Arial',
      fontSize: '13px',
      stroke: '#FF0000'
    })

    valueLevel.attr({
      fontFamily: 'Arial',
      fontSize: '13px',
      stroke: '#000000'
    })

    /// room

    var loc = Math.floor(100 + Math.random() * 300)// + 'ABCDEFGHIJ'.charAt(Math.floor(Math.random() * 10))

    var nameRoom = snap.paper.text(0, nameAsset.getBBox().height*4,
      "Room: ")

    var valueRoom = snap.paper.text(
      nameRoom.getBBox().width, nameAsset.getBBox().height*4,
      loc)

    nameRoom.attr({
      fontFamily: 'Arial',
      fontSize: '13px',
      stroke: '#FF0000'
    })

    valueRoom.attr({
      fontFamily: 'Arial',
      fontSize: '13px',
      stroke: '#000000'
    })

    /// create label

    this.label = snap.group(
      nameAsset,
      valueAsset,
      nameTerminal,
      valueTerminal,
      nameLevel,
      valueLevel,
      nameRoom,
      valueRoom);

    var width = nameAsset.getBBox().width +
      valueAsset.getBBox().width

    $(`#${this._markerId}`).css({
      width: width + 10
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onMouseMove (event) {

    if (this.parent.dragging) {

      this.parent.setLeaderEndPoint({
        x: event.clientX,
        y: event.clientY
      })
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onMouseUp (event) {

    if (this.parent.dragging) {

      this.endDrag()
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onMouseDown (event) {

    if (!this.parent.dragging) {

      this.startDrag()
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onDoubleClick (event) {

    this.showControls(true)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  showControls (show) {

    $(`#${this.svgId}`).css({
      display: show ? 'none':'block'
    })

    $(`#${this.controlsId}`).css({
      display: show ? 'block' : 'none'
    })
  }
}
