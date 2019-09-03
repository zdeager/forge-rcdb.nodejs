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
import MultiLine from 'MultiLine'
import BarCost from 'BarCost'
import React from 'react'
import d3 from 'd3'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import DatabaseAPI from './Viewing.Extension.Critical.API'

class CriticalAssetVizExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onItemSelected = this.onItemSelected.bind(this)

    this.react = options.react

    this.dbAPI = new DatabaseAPI(
      this.options.apiUrl)

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
      selectedViz: null,
      data: null,
      baseline: null

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
  async onItemSelected (item) {

    console.log('selected item', item);

    this.viewer.fitToView([item])

    Toolkit.isolateFull(
      this.viewer,
      [item])

    // get asset data from db
    let dbData = null;
    try
    {
      dbData =
        await this.dbAPI.getData(
          this.options.collection, item)
    } catch (ex) {
      console.log("no record");
    }

    // get baseline data
    const group = this.react.getState().selectedGroup;

    const componentProps =
      await Toolkit.getBulkPropertiesAsync(
        this.viewer.model, [item], group.propName);

    this.react.setState({
      selectedID: item,
      data: dbData,
      baseline: componentProps
    })

    //this.emit('item.selected', item)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onVizSelected (viz) {

    console.log('selected viz', viz);

    this.react.setState({
      selectedViz: viz
    })

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  reset () {
    this.react.setState({

      selectedGroup: null,
      selectedIDs: null,
      selectedID: null,
      selectedViz: null,
      data: null,
      baseline: null

    });
  }


  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setSelectedItem (group, items) {

    console.log('selected items', items);

    this.react.setState({
      selectedIDs: items,
      selectedGroup: group,
      selectedID: null,
      selectedViz: null,
      data: null,
      baseline: null
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTitle () {

    const group = this.react.getState().selectedGroup;

    // asset dropdown

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
      title = "Asset";
    }


    // viz dropdown

    const vizs = ["Sensor", "Cost"];

    let menu2Items = null;

    if (vizs) {
      menu2Items = vizs.map((viz, idx) => {
        return (
          <MenuItem eventKey={idx} key={idx} onClick={() => {

            this.onVizSelected(viz);
          }}>
            { viz }
          </MenuItem>
        )
      })
    }

    const item2 = this.react.getState().selectedViz;

    let title2 = null;

    if (item2) {
      title2 = item2;
    } else {
      title2 = "Viz";
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
        <div className="drop" style={{"paddingLeft": "10px"}}>
          <DropdownButton
            title={title2}
            key="extra-dropdown2"
            id="extra-dropdown2">
            { menu2Items }
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
      selectedID,
      selectedViz,
      data,
      baseline,
      selectedGroup
    } = this.react.getState()

    let label = null;
    if (selectedGroup)
    {
      label = selectedGroup.propName;
    }

    //const item = !this.react.getState().selectedID;

    //const viz = !this.react.getState().selectedViz;

    if (selectedViz === "Sensor") {
      return (
        <div className="content">
          <MultiLineContainer
            guid={selectedID}
            data={data}
            baseline={baseline}
            label={label}
          />
        </div>
      )
    } else if (selectedID && selectedViz === "Cost") {
      return (
        <div className="content">
          <BarCostContainer
            guid={selectedID}
            data={data}
          />
        </div>
      )
    } else {
      return (
        <div className="content">
          <Loader show={true}/>
        </div>
      )
    }
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

class MultiLineContainer extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor () {

    super ()

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillReceiveProps (props) {

    const domElement = findDOMNode(this)

    const height = domElement.offsetHeight

  }


  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    return (
      <ReflexContainer>
        {
          <ReflexElement>
            <div style={{
              background: '#fdfdfd',
              paddingTop:'10px',
              height: '100%'
              }}>
              <MultiLine
                dataGuid={this.props.guid}
                data={this.props.data}
                baseline={this.props.baseline}
                label={this.props.label}
              />
            </div>
          </ReflexElement>
        }
      </ReflexContainer>
    )
  }
}

class BarCostContainer extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor () {

    super ()

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillReceiveProps (props) {

    const domElement = findDOMNode(this)

    const height = domElement.offsetHeight

  }


  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    return (
      <ReflexContainer>
        {
          <ReflexElement>
            <div style={{
              background: '#fdfdfd',
              paddingTop:'10px',
              height: '100%'
              }}>
              <BarCost
                dataGuid={this.props.guid}
                data={this.props.data}
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
