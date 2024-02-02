import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'
import Form from '../components/map/form/form';

test('renders form', () => {
  render(<Form/>);
  const labels = [
    screen.getByLabelText('longitude:'),
    screen.getByLabelText('latitude:'),
    screen.getByLabelText('name:')
  ];
  
  labels.forEach((label) => {
    expect(label).toBeInTheDocument();
  })
});