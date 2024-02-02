import React from 'react';

export default function Form({formRef, submitRef, formValues, handleFormChange, handleSubmitForm}) {
  return (
    <form 
      id='marker-form'
      ref={formRef}
    >
      <div className='form-inputs'>
        <label>
          longitude: 
          <input
            required
            name="lng"
            type="number"
            placeholder='-104.991531'
            value={formValues.lng}
            onChange={handleFormChange}
          />
        </label>
        <label>
          latitude: 
          <input
            required
            name="lat"
            type="number"
            placeholder='39.742043'
            value={formValues.lat}
            onChange={handleFormChange} 
          />
        </label>
        <label>
          name:
          <input
            required
            name="name"
            type="text"
            placeholder='Denver'
            value={formValues.name}
            onChange={handleFormChange} 
          />
        </label>
      </div>
      <button
        ref={submitRef}
        className='hidden-submit-button'
        style={{display: "none"}}
        type='submit'
        onClick={handleSubmitForm} 
      />
    </form>
  );
}