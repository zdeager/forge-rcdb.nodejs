
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
    console.log(id);
    console.log(this.props);
    const selectedItem = find(
      this.props.items, {
        _id: id
      })
    console.log(selectedItem)
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
            id: dbItem._id
          }
        })
      )

      this.select = $('select', '.db-table').niceSelect()

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
