import React, { useState } from 'react';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const FormContainer = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Button = styled.button`
  padding: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #0056b3;
  }
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  text-align: center;
`;

const SuccessMessage = styled(Message)`
  background-color: #d4edda;
  color: #155724;
`;

const ErrorMessage = styled(Message)`
  background-color: #f8d7da;
  color: #721c24;
`;

const StyledDatePicker = styled(DatePicker)`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  background-color: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const DatePickerWrapper = styled.div`
  .react-datepicker {
    font-family: inherit;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .react-datepicker__header {
    background-color: #f8f9fa;
    border-bottom: none;
    padding-top: 1rem;
  }

  .react-datepicker__current-month {
    color: #333;
    font-weight: 500;
  }

  .react-datepicker__day-name {
    color: #666;
  }

  .react-datepicker__day {
    color: #333;
    &:hover {
      background-color: #e9ecef;
    }
  }

  .react-datepicker__day--selected {
    background-color: #007bff;
    color: white;
    &:hover {
      background-color: #0056b3;
    }
  }

  .react-datepicker__day--keyboard-selected {
    background-color: #007bff;
    color: white;
  }

  .react-datepicker__navigation {
    top: 1rem;
  }

  .react-datepicker__navigation-icon::before {
    border-color: #333;
  }
`;

const ContactForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contactNo: '',
    email: '',
    message: '',
    city: '',
    country: '',
    dateOfBirth: null
  });

  const [status, setStatus] = useState({
    type: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      dateOfBirth: date
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'First Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.contactNo.trim()) return 'Contact Number is required';
    if (!formData.message.trim()) return 'Message is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setStatus({
        type: 'error',
        message: validationError
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5001/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setStatus({
        type: 'success',
        message: 'Thank you for your message! We will get back to you soon.'
      });
      setFormData({
        firstName: '',
        lastName: '',
        contactNo: '',
        email: '',
        message: '',
        city: '',
        country: '',
        dateOfBirth: null
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'An error occurred while submitting the form. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="contactNo">Contact Number *</Label>
          <Input
            type="tel"
            id="contactNo"
            name="contactNo"
            value={formData.contactNo}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="city">City</Label>
          <Input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="country">Country</Label>
          <Select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
          >
            <option value="">Select a country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="UK">United Kingdom</option>
            <option value="AU">Australia</option>
            <option value="IN">India</option>
            {/* Add more countries as needed */}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <DatePickerWrapper>
            <StyledDatePicker
              id="dateOfBirth"
              selected={formData.dateOfBirth}
              onChange={handleDateChange}
              dateFormat="MMMM d, yyyy"
              placeholderText="Select your date of birth"
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={100}
              maxDate={new Date()}
              isClearable
            />
          </DatePickerWrapper>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="message">Message *</Label>
          <TextArea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>

        {status.type === 'success' && (
          <SuccessMessage>{status.message}</SuccessMessage>
        )}
        {status.type === 'error' && (
          <ErrorMessage>{status.message}</ErrorMessage>
        )}
      </Form>
    </FormContainer>
  );
};

export default ContactForm; 