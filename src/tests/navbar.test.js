import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'
import Navbar from '../components/navbar/navbar';

test('renders navbar', () => {
  render(<Navbar/>);
  const linkElement = screen.getByText(/Concept3D Map Challenge/i);
  expect(linkElement).toBeInTheDocument();
});
