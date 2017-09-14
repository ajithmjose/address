import React from 'react'

import Autocomplete from './ReactGoogleAutocomplete.js'
// import {ReactCustomGoogleAutocomplete} from 'react-google-autocomplete'
import Input from '@react-ag-components/input'
// import Input from './../../components/Input'
import ReferenceDataSelector from '@react-ag-components/reference-data-selector'
// import ReferenceDataSelector from './../../components/RefDataSelector'

import './ui-kit.css'
import './styles.css'

class Address extends React.Component {

  constructor(props) {
      super(props)

      this.state = {
        addressLine1:'',
        addressLine2:'',
        addressLine3:'',
        city:'',
        state:'',
        postcode:'',
        country:'',
        enterManually:false,
        enterMauallyText:'Enter address manually',
        cityOnly:props.type === 'city',
        defaultValue:props.defaultValue || ''
      }
      this.address = {}

      this.id = '_' + Math.random().toString(36).substr(2, 9)

      this.autoCompleteStyle = {
        maxWidth: props.maxWidth || "100%"
      }

      this.linkStyle = {
        display: "inline-block",
        marginBottom:"1em"
      }

  }

  componentDidMount() {
    if(this.props.value && !this.state.cityOnly){
      this.populateAddress(this.props.value)
    }
    if(this.props.value && this.state.cityOnly){
      this.setState((prevState, props) => ({
        defaultValue: this.props.value
      }))
    }
  }

  componentWillReceiveProps(nextProps){
    // only open manual if no text is in Address field
    if(this.getAddressEntryFieldText().trim().length < 1){
      if(nextProps.value && !this.state.cityOnly){
        this.populateAddress(nextProps.value)
      }
    }
    if(nextProps.value && this.state.cityOnly){
      this.setState((prevState, props) => ({
        defaultValue: nextProps.value
      }))
    }
    // if(nextProps.value && !this.state.cityOnly){
    //   this.populateAddress(nextProps.value)
    // }
    // if(this.props.value && this.state.cityOnly){
    //   this.setState((prevState, props) => ({
    //     defaultValue: this.props.value
    //   }))
    // }
  }

  populateAddress(data){
    if(data){
      let address = ''
      if(data.addressLine1 && data.addressLine1.trim().length > 0){
        address += data.addressLine1
      }
      if(data.addressLine2 && data.addressLine2.trim().length > 0){
        address += ' ' + data.addressLine2
      }
      if(data.addressLine3 && data.addressLine3.trim().length > 0){
        address += ' ' + data.addressLine3
      }
      if(address !== ''){
        address += ', '
      }
      address += data.city + ' ' + data.state + ' ' + data.postcode
      //address += data.country
      this.setState((prevState, props) => ({
        defaultValue: address
      }))
      let countryCode = data.country
      // get the country
      let urlPrefix = this.host + '/api/refdata/'
      fetch(urlPrefix + 'country', { credentials: 'same-origin' }).then(
        response => {
          if (response.status === 200) {
            response.text().then(data => {
              let parsedData = JSON.parse(data)
              if(countryCode){
                let text = parsedData.find((item) =>  item.value.toLowerCase() === countryCode.toLowerCase())
                if(text.label){
                  address += ', ' + data.country
                  this.setState({
                    defaultValue: address
                  })
                }
              }
            })
          }
        }
      )


      // this.setState((prevState, props) => ({
      //   enterManually: true,
      //   enterMauallyText: 'Close manual address',
      //   addressLine1:data.addressLine1,
      //   addressLine2:data.addressLine2,
      //   addressLine3:data.addressLine3,
      //   city:data.city,
      //   state:data.state,
      //   postcode:data.postcode,
      //   country:data.country
      // }))
      this.address = data
    }
  }

  onChange = (field) => {
    return (value) => {
      this.setState((prevState, props) => ({
        [field]: value
      }))
      this.address[field] = value
      if(this.props.onChange){
        this.props.onChange(this.address)
      }
    }
  }

  onPlaceSelected = (places) => {
    let address = {}
    for (var i = 0; i < places.address_components.length; i++) {
      var addressType = places.address_components[i].types[0];
      address[addressType] = places.address_components[i].short_name
    }


    let line1 = ''
    if(address.subpremise){
      line1 += address.subpremise + '/'
    }
    if(address.street_number){
      line1 += address.street_number
    }
    line1 += ' ' + address.route
    this.address.addressLine1=line1,
    this.address.addressLine2='',
    this.address.addressLine3=''

    this.address.city=address.locality
    this.address.state=address.administrative_area_level_1
    this.address.postcode=address.postal_code
    this.address.country=address.country

    if(this.props.onChange){
      if(this.state.cityOnly){
        this.props.onChange(this.address.city)
      } else {
        this.props.onChange(this.address)
      }
    }
  }

  handleManualAddressClick = (e) => {
    e.preventDefault()
    this.setState((prevState, props) => ({
      enterManually: !prevState.enterManually,
      enterMauallyText: (prevState.enterManually ? 'Enter address manually' : 'Close manual address')
    }))
  }

  getAddressEntryFieldText = () => {
    return document.getElementById(this.id).value
  }

  render() {

    // let componentRestrictions = {}

    // if(this.props.country){
    //   componentRestrictions.country = this.props.country
    // }

    let otherProps = {}
    if(this.props.country){
      otherProps.componentRestrictions = {}
      otherProps.componentRestrictions.country = this.props.country
    }

    return (
      <div>
        <fieldset className="address-field">


            <Autocomplete
              onPlaceSelected={this.onPlaceSelected}
              types={['geocode']}
              className="uikit-text-input uikit-text-input--block"
              style={this.autoCompleteStyle}
              defaultValue={this.state.defaultValue || ''}
              id={this.id}
              name={this.id}
              label={this.props.label || 'Address'}
              {...otherProps}
            />
            {/*
            <ReactCustomGoogleAutocomplete
              input={<Input
                      label="Enter address"
                      />}
              onPlaceSelected={this.onPlaceSelected}
              types={['geocode']}
              className="uikit-text-input uikit-text-input--block"
              style={this.autoCompleteStyle}
              placeholder={this.props.placeholder || 'Enter address'}
              defaultValue={this.state.defaultValue || ''}
            />
            */}
        </fieldset>
        {!this.state.cityOnly &&
          <a
            href="#"
            style={this.linkStyle}
            onClick={this.handleManualAddressClick}>{this.state.enterMauallyText}
          </a>
        }

        {this.state.enterManually &&
        <div>
          <Input
            label="Address line 1"
            id="address1"
            value={this.state.addressLine1}
            onChange={this.onChange('addressLine1')}
          />

          <Input
            label="Address line 2"
            id="address2"
            value={this.state.addressLine2}
            onChange={this.onChange('addressLine2')}
          />

          <Input
            label="Address line 3"
            id="address3"
            value={this.state.addressLine3}
            onChange={this.onChange('addressLine3')}
          />

          <Input
            label="City/Town"
            id="city"
            value={this.state.city}
            onChange={this.onChange('city')}
          />

          <Input
            label="State/Region"
            id="state"
            value={this.state.state}
            onChange={this.onChange('state')}
          />

          <Input
            label="Postcode"
            id="postcode"
            value={this.state.postcode}
            onChange={this.onChange('postcode')}
            type="tel"
            maxWidth="100px"
          />

          <ReferenceDataSelector
            id="country-selector"
            label="Country"
            placeholder="Select country"
            type="country"
            onChange={this.onChange('country')}
            value={this.state.country}
          />

        </div>
        }

      </div>
    )
  }
}

export default Address
