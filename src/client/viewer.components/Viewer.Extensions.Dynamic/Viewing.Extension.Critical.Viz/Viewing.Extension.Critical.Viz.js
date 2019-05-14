/////////////////////////////////////////////////////////
// Viewing.Extension.Critical.Viz
// by Philippe Leefsma, September 2017
//    zde, May 2019
/////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import {ReflexContainer, ReflexElement} from 'react-reflex'
import './Viewing.Extension.Critical.Viz.scss'
import WidgetContainer from 'WidgetContainer'
import {ReactLoader as Loader} from 'Loader'
import BaseComponent from 'BaseComponent'
import ServiceManager from 'SvcManager'
import {findDOMNode} from 'react-dom'
import Toolkit from 'Viewer.Toolkit'
import sortBy from 'lodash/sortBy'
import PieChart from 'PieChart'
import React from 'react'
import d3 from 'd3'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import MenuItem from 'react-bootstrap/lib/MenuItem'

class CriticalAssetVizExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onItemSelected = this.onItemSelected.bind(this)

    this.react = options.react

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'visual-report'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.Critical.Viz'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    this.react.setState({

      selectedGroup: null,
      selectedIDs: null,
      selectedID: null,
      legendData: [],
      pieData: [],
      guid: null

    }).then (() => {

      this.react.pushRenderExtension(this)
    })

    console.log('Viewing.Extension.Critical.Viz loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.Critical.Viz unloaded')

    super.unload ()

    return true
  }


  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onStopResize () {

    this.react.setState({
      guid: this.guid()
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onItemSelected (item) {

    console.log('selected item', item);

    this.viewer.fitToView([item])

    Toolkit.isolateFull(
      this.viewer,
      [item])

    this.react.setState({
      selectedID: item
    })

    //this.emit('item.selected', item)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setSelectedItem (group, items) {

    console.log('set items', items);

    this.react.setState({
      selectedIDs: items,
      selectedGroup: group,
      selectedID: null,
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTitle () {

    const group = this.react.getState().selectedGroup;

    const items = this.react.getState().selectedIDs;

    let menuItems = null;

    if (items) {
      menuItems = items.map((item, idx) => {
        return (
          <MenuItem eventKey={idx} key={idx} onClick={() => {

            this.onItemSelected(item);
          }}>
            { item }
          </MenuItem>
        )
      })
    }

    const item = this.react.getState().selectedID;

    let title = null;

    if (items && item) {
      title = group.name + " : " + item;
    } else if (items) {
      title = group.name;
    } else {
      title = "Select Asset Group";
    }

    return (
      <div className="title">
        <label>
          Critical Asset Data
        </label>
        <div className="drop">
          <DropdownButton
            title={title}
            key="extra-dropdown"
            id="extra-dropdown">
           { menuItems }
          </DropdownButton>
        </div>
      </div>
    )
    
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderContent () {

    const {
      legendData,
      pieData,
      guid
    } = this.react.getState()

    const showLoader = !legendData.length

    return (
      <div className="content">
        <Loader show={showLoader}/>
        <CostGraphContainer
          onItemSelected={this.onItemSelected}
          legendData={legendData}
          pieData={pieData}
          guid={guid}
        />
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render (opts = {showTitle: true}) {

    return (
      <WidgetContainer
        renderTitle={() => this.renderTitle(opts.docked)}
        showTitle={opts.showTitle}
        className={this.className}>
        { this.renderContent() }
      </WidgetContainer>
    )
  }
}

class CostGraphContainer extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor () {

    super ()

    this.onSegmentClicked = this.onSegmentClicked.bind(this)

    this.state = {
      showPie: false
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillReceiveProps (props) {

    const domElement = findDOMNode(this)

    const height = domElement.offsetHeight

    const showPie = !!(height > 220)

    this.assignState({
      showPie
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSegmentClicked (data, expanded) {

    const item = !expanded
      ? data.item
      : null

    this.props.onItemSelected (item)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    const {
      onItemSelected,
      legendData,
      pieData
    } = this.props

    return (
      <ReflexContainer>
        {
          this.state.showPie &&
          <ReflexElement>
            <div style={{
              background: '#fdfdfd',
              paddingTop:'10px',
              height: '100%'
              }}>
              <PieChart
                onSegmentClicked={this.onSegmentClicked}
                dataGuid={this.props.guid}
                data={pieData}
              />
            </div>
          </ReflexElement>
        }
      </ReflexContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  CriticalAssetVizExtension.ExtensionId,
  CriticalAssetVizExtension)
