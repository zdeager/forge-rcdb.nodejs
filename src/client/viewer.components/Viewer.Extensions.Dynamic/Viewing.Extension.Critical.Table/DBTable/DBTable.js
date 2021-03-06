
import PropTypes from 'prop-types'
import './libs/nice-select.css'
import find from 'lodash/find'
import './libs/nice-select'
import React from 'react'
import './libs/footable'
import './DBTable.scss'
import './libs/footable.editable'

class DBTable extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor () {

    super()

    this.scroll = 0
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidMount () {

    $('.footable').footable({
      breakpoints: {
        phone: 400,
        tablet: 400
      }
    })

    this.ftEditable = $().ftEditable()

    this.ftEditable.setUpdateHandler((updateRecord) => {

      let dbItem = find(this.props.items, {
        _id: updateRecord.id
      })

      this.props.onUpdateItem(dbItem)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  shouldComponentUpdate (nextProps) {

    if (nextProps.guid !== this.props.guid) {

      return true
    }

    return false
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  componentDidUpdate () {

    this.refresh()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillUnmount () {

    $('.footable').remove()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onRowClicked (id) {
    
    const selectedItem = find(
      this.props.items, {
        _id: id
      })
    
    if (selectedItem) {

      this.props.onSelectItem(
        selectedItem, true)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onHeaderClicked (e) {


  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  refresh() {

    if (this.ftEditable) {

      this.ftEditable.deleteAllRows(
        '.footable')

      this.ftEditable.addRows(
        '.footable',
        this.props.items.map((dbItem) => {

          return {
            name: dbItem.name,
            dataSource: dbItem.dataSource,
            assignee: dbItem.assignee,
            criticality: dbItem.criticality,
            id: dbItem._id
          }
        }), {

          select: {
            criticality: [
              {value:1, label:1},
              {value:2, label:2},
              {value:3, label:3},
              {value:4, label:4},
              {value:5, label:5}
            ]
          }
        })

      this.select = $('select', '.db-table').niceSelect()

      this.select.on('change', (e, option) => {

        const id = $(option).parents('tr')[0].id

        const dbItem = find(this.props.items, {
          _id: id
        })

        dbItem.criticality = parseInt($(option).attr('data-value'))

        this.props.onUpdateItem(dbItem)
      })

      $('.footable > tbody > tr > td:first-child').off(
        'click')

      $('.footable > tbody > tr > td:first-child').on (
        'click', (e) => {
          const id = $(e.target).parent()[0].id
          this.onRowClicked(id)
        })

      $('.footable > tbody > tr > td:first-child label').on (
        'click', (e) => {
          const id = $(e.target).parent().parent()[0].id
          this.onRowClicked(id)
        })

      $('.footable > thead > tr > th').on (
        'click', (e) => this.onHeaderClicked(e))

      $("td[contenteditable='true']", '.footable').on (
        'keydown keypress',  (e) => {

          // Only allow edits for assignee
          if($(e.target).index() === 2) {

            // prevents ENTER
            if (e.keyCode === 13) {

              const field = this.getField(e.target)

              const value = this.getValue(e.target)

              let dbItem = this.getDbItem(e.target)

              dbItem[field] = value

              this.props.onUpdateItem(dbItem)

              e.preventDefault()
            }
          }
        });

      $('.scroll tbody').scroll(()=>{

        this.scroll = $('.scroll tbody').scrollTop()
      })

      $('.scroll tbody').scrollTop(this.scroll)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getDbItem (target) {

    const id = $(target).parent()[0].id

    return find(this.props.items, {
      _id: id
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getValue (target) {

    const $label = $(target).find('label')

    if($label.length) {

      return $label.text()
    }

    return $(target).text()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getField (target) {

    const idx = $(target).index()

    const header = $('.footable > thead > tr > th')[idx]

    const field = $(header).attr('data-field')

    return field
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    return (
      <div className="db-table">
        <table className="footable scroll">
          <thead>
            <tr>
              <th className="db-column fooId"
                data-field="name">
                <label>Critical Asset Group</label>
              </th>
              <th className="db-column"
                data-field="dataSource">
                <label>Data Source</label>
              </th>
              <th className="db-column fooEditable"
                data-field="assignee">
                Assignee
              </th>
              <th className="db-column"
                data-field="criticality"
                data-ft-control="select">
                Criticality
              </th>
              <th className="db-column hidden">
                _id
              </th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
      </div>
    )
  }
}

export default DBTable
