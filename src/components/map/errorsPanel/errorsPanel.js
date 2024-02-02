import React from 'react';

export default function ErrorsPanel({validationErrors}) {
  return (
    <ul className='errors-list'>
      { validationErrors?.length > 0 && validationErrors?.map((error, i) => (
        <li key={`error-${i}`}>
          <label>error: </label>
          {error}
        </li>
      ))}
    </ul>
  );
}