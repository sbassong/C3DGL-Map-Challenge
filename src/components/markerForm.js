import React from 'react';
import './markerForm.css';

export default function MarkerForm(props) {
  return (
    <form className='marker-form'>
      <div className='form-inputs'>
        <label>
          longitude: 
          <input
            required
            name="lng"
            type="number"
            placeholder='-104.991531'
            value={props.formValues.lng}
            onChange={props.handleFormChange} />
        </label>
        <br />
        <label>
          latitude: 
          <input
            required
            name="lat"
            type="number"
            placeholder='39.742043'
            value={props.formValues.lat}
            onChange={props.handleFormChange} />
        </label>
        <label>
          name: 
          <input
            required
            name="name"
            type="text"
            placeholder='Denver'
            value={props.formValues.name}
            onChange={props.handleFormChange} />
        </label>
      </div>
    </form>
  );
}