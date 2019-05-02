/////////////////////////////////////////////////////////
// Viewing.Extension.Critical.Table
// by Philippe Leefsma, September 2017
//    zde, Apr 2019
/////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import DatabaseAPI from './Viewing.Extension.Critical.API'
import './Viewing.Extension.Critical.Table.scss'
import WidgetContainer from 'WidgetContainer'
import {ReactLoader as Loader} from 'Loader'
import ServiceManager from 'SvcManager'
import throttle from 'lodash/throttle'
import Toolkit from 'Viewer.Toolkit'
import DBTable from './DBTable'
import find from 'lodash/find'
import React from 'react'

class DatabaseTableExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    //this.onUpdateItemSocket = this.onUpdateItemSocket.bind(this)
    //this.onUpdateItem = this.onUpdateItem.bind(this)
    this.onSelectItem = this.onSelectItem.bind(this)

    this.onResize = throttle(this.onResize, 250)

    this.socketSvc = ServiceManager.getService(
      'SocketSvc')

    this.dbAPI = new DatabaseAPI(
      this.options.apiUrl)

    this.react = options.react

    this.criticalMap = {}
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'database-table'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.Critical.Table'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    this.react.setState({

      selectedItem: null,
      guid: null,
      items: []

    }).then (() => {

      this.react.pushRenderExtension(this)

      this.react.setState({
        guid: this.guid()
      })
    })

    //this.socketSvc.on('material.update',
    //  this.onUpdateItemSocket)

    this.socketSvc.connect()

    this.viewer.loadDynamicExtension(
      'Viewing.Extension.ContextMenu', {
        buildMenu: (menu) => {
          return menu.map((item) => {
            const title = item.title.toLowerCase()
            if (title === 'show all objects') {
              return {
                title: 'Show All objects',
                target: () => {
                  Toolkit.isolateFull(this.viewer)
                  this.viewer.fitToView()
                }
              }
            }
            return item
          })
        }
      })

    console.log('Viewing.Extension.Critical.Table loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.Critical.Table unloaded')

    //this.socketSvc.off('material.update',
    //  this.onUpdateItemSocket)

    super.unload ()

    return true
  }

  
  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onUpdateItem (item, externalUpdate) {

    if (item) {

      const state = this.react.getState()

      if (!externalUpdate) {

        this.dbAPI.postItem(this.options.database, item)

        this.socketSvc.broadcast(
          'material.update',
          item)
      }

      const entry = this.materialMap[item.name]

      entry.dbMaterial = item

      entry.totalCost = entry.totalMass * this.toUSD(
        entry.dbMaterial.price,
        entry.dbMaterial.currency)

      const items = state.items.map((dbItem) => {

        return dbItem._id !== item._id
          ? dbItem
          : item
      })

      const guid = externalUpdate
          ? this.guid()
          : state.guid

      this.react.setState({
        items,
        guid
      })

      this.costBreakDownExtension.computeCost(
        this.materialMap)

      const dbProperties =
        this.buildViewerPanelProperties(
          item)

      this.viewerPropertiesExtension.updateProperties(
        dbProperties)
    }
  }
  

  
  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onUpdateItemSocket (item) {

    this.onUpdateItem(item, true)
  }
  

  
  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSelectItem (item, propagate) {

    console.log(item);
    console.log(this.criticalMap);
    if (item) {

      const critical = this.criticalMap[item.name]

      const dbIds = critical
        ? critical.components
        : (item.components || [])

      this.viewer.fitToView(dbIds)

      Toolkit.isolateFull(
        this.viewer,
        dbIds)

    } else {

      Toolkit.isolateFull(
        this.viewer)

      this.viewer.fitToView()
    }

    this.react.setState({
      selectedItem: item
    })

    //if (propagate) {
    //  this.costBreakDownExtension.setSelectedItem(item)
    //}
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onModelCompletedLoad () {

    // get critical assets from db
    const dbCriticals =
      await this.dbAPI.getItems(
        this.options.collection)
    console.log('aaaa', dbCriticals);

    
    // const dbCriticals = [
    //   {
    //     "_id": "id0",
    //     "name": "Critical rectangular duct"
    //   },
    //   {
    //     "_id": "id1",
    //     "name": "Critical round pipe"
    //   },
    //   {
    //     "_id": "id3",
    //     "name": "blah"
    //   }
    // ]

    // get components
    const componentIds =
      await Toolkit.getLeafNodes(this.viewer.model);

    // get critical property of each component
    const criticalPropResults =
      await Toolkit.getBulkPropertiesAsync(
        this.viewer.model, componentIds,
        this.options.criticalProperties);

    const criticalResults =
      criticalPropResults.map((result) => {

        return Object.assign({},
          result.properties[0], {
            dbId: result.dbId
          })
      });

    //console.log(criticalPropResults);
    //var arrayLength = criticalResults.length;
    //for (var i = 0; i < arrayLength; i++) {
    //    console.log(criticalResults[i]);
    //}

    // create map od critical assets
    //const criticalMap = {}

    componentIds.forEach((dbId) => {

        const criticalProp = find(criticalResults, { dbId })

        const criticalName = criticalProp ?
          criticalProp.displayValue :
          null

        if(criticalName !== "") {

          const dbCritical = find(dbCriticals, {
            name: criticalName
          })

          if (dbCritical) {

            if (!this.criticalMap[criticalName]) {

              this.criticalMap[criticalName] = {
                dbCritical: dbCritical,
                components: []
              }
            }

            let item = this.criticalMap[criticalName]

            if (item) {
              item.components.push(dbId)
            }
          }
        }
      })

    console.log(this.criticalMap);
    
    const filteredCritical =
        dbCriticals.filter((critical) => {

         return (this.criticalMap[critical.name] != null)
       })

    console.log(filteredCritical);

    this.react.setState({
        items: filteredCritical,
        guid: this.guid()
      })

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTitle () {

    return (
      <div className="title">
        <label>
          Critical Assets
        </label>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onResize () {

    this.react.setState({
      guid: this.guid()
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderContent () {

    const {guid, items, selectedItem} =
      this.react.getState()

    const showLoader = !items.length

    return (
      <div className="content">
        <Loader show={showLoader}/>
        <DBTable
          onSelectItem={this.onSelectItem}
          //onUpdateItem={this.onUpdateItem}
          selectedItem={selectedItem}
          items={items}
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

Autodesk.Viewing.theExtensionManager.registerExtension(
  DatabaseTableExtension.ExtensionId,
  DatabaseTableExtension)
