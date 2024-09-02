import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createOffer, resetForm, setOfferDetails } from '../Redux/offerSlice';
import { MdCancel } from "react-icons/md";
import { IoAddCircleSharp } from "react-icons/io5";
import './Offer.css'; // Import your custom CSS file

const CreateOffer = () => {
  const dispatch = useDispatch();
  const { offerDetails, loading, error, success } = useSelector((state) => state.offers);
  const [formErrors, setFormErrors] = useState({});
  const [entityId, setEntityId] = useState('');
  const [entityValidationError, setEntityValidationError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [offerOn, setOfferOn] = useState('ITEM_IDS');

  const handleInputChange = (e) => {
    const { id, value, type } = e.target;
    const newValue = type === 'number' ? Number(value) : value;

    if (id === 'offerType') {
      dispatch(setOfferDetails({
        offerType: {
          ...offerDetails.offerType,
          offerType: newValue,
          entityIds: [],
          couponCode: '',
          offerOn: 'ITEM_ID'
        }
      }));
    } else if (id === 'couponCode') {
      setCouponCode(newValue);
    } else if (id === 'offerOn') {
      setOfferOn(newValue);
      dispatch(setOfferDetails({
        offerType: {
          ...offerDetails.offerType,
          offerOn: newValue
        }
      }));
    } else {
      dispatch(setOfferDetails({ [id]: newValue }));
    }
  };

  const validateAndAddEntity = () => {
    if (!entityId || entityId <= 0) {
      setEntityValidationError('Valid Entity ID is required.');
    } else {
      setEntityValidationError('');
      dispatch(setOfferDetails({
        offerType: {
          ...offerDetails.offerType,
          entityIds: [...(offerDetails.offerType.entityIds || []), entityId]
        }
      }));
      setEntityId('');
    }
  };

  const removeEntity = (index) => {
    const updatedEntities = offerDetails.offerType.entityIds.filter((_, idx) => idx !== index);
    dispatch(setOfferDetails({
      offerType: {
        ...offerDetails.offerType,
        entityIds: updatedEntities,
      }
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!offerDetails.offerName) errors.offerName = 'Offer Name is required.';
    if (!offerDetails.offerType.offerType) errors.offerType = 'Offer Type is required.';
    if (!offerDetails.offerDiscountType) errors.offerDiscountType = 'Discount Type is required.';
    if (offerDetails.offerDiscountType && offerDetails.offerDiscountValue <= 0) {
      errors.offerDiscountValue = `${offerDetails.offerDiscountType === 'FIXED_AMOUNT' ? 'Discount Amount' : 'Discount Percentage'} is required and must be greater than 0.`;
    }
    if (offerDetails.offerQuantity <= 0) errors.offerQuantity = 'Quantity is required and must be greater than 0.';
    if (!offerDetails.offerStartDate) errors.offerStartDate = 'Start Date is required.';
    if (!offerDetails.offerEndDate) errors.offerEndDate = 'End Date is required.';

    if (offerDetails.offerStartDate && offerDetails.offerEndDate) {
      if (new Date(offerDetails.offerStartDate) >= new Date(offerDetails.offerEndDate)) {
        errors.offerEndDate = 'End Date must be greater than Start Date.';
      }
    }

    if (offerDetails.offerType.offerType === 'DISCOUNT_COUPONS' && !couponCode) {
      errors.couponCode = 'Coupon Code is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const updatedOfferDetails = {
        ...offerDetails,
        offerType: {
          ...offerDetails.offerType,
          couponCode: offerDetails.offerType.offerType === 'DISCOUNT_COUPONS' ? couponCode : '',
        },
      };
      console.log('Offer details to be posted:', updatedOfferDetails);
      dispatch(createOffer(updatedOfferDetails));
    }
  };

  useEffect(() => {
    if (success) {
      alert('Offer created successfully');
      dispatch(resetForm());
    }
  }, [success, dispatch]);

  return (
    <div className="offer-container">
      <div className="offer-card">
        <h4>Add New Offer</h4>
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label htmlFor="offerName">Offer Name</label>
            <input
              type="text"
              id="offerName"
              value={offerDetails.offerName}
              onChange={handleInputChange}
              className={formErrors.offerName ? 'input-error' : ''}
            />
            {formErrors.offerName && <span className="error">{formErrors.offerName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="offerDescription">Offer Description</label>
            <textarea
              id="offerDescription"
              value={offerDetails.offerDescription}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="offerType">Offer Type</label>
            <select
              id="offerType"
              value={offerDetails.offerType.offerType}
              onChange={handleInputChange}
              className={formErrors.offerType ? 'input-error' : ''}
            >
              <option value="">Select Offer Type</option>
              <option value="ITEMS_OFFER">ITEMS_OFFER</option>
              <option value="LIMITED_TIME_OFFER">LIMITED_TIME_OFFER</option>
              <option value="ON_BILL_AMOUNT">ON_BILL_AMOUNT</option>
              <option value="DISCOUNT_COUPONS">DISCOUNT_COUPONS</option>
            </select>
            {formErrors.offerType && <span className="error">{formErrors.offerType}</span>}
          </div>

          {(offerDetails.offerType.offerType === 'ITEMS_OFFER' || offerDetails.offerType.offerType === 'LIMITED_TIME_OFFER') && (
            <>
              <div className="form-group">
                <label htmlFor="offerOn">Offer On</label>
                <select
                  id="offerOn"
                  value={offerOn}
                  onChange={handleInputChange}
                >
                  <option value="ITEM_ID">ITEM_IDS</option>
                  <option value="SKU_ID">SKU_IDS</option>
                </select>
              </div>

              <div className="form-group entity-input-group">
                <label htmlFor="entityIds">Entity ID</label>
                <div className="input-icon-wrapper">
                  <input
                    type="number"
                    id="entityIds"
                    value={entityId}
                    onChange={(e) => setEntityId(e.target.value)}
                    className={entityValidationError ? 'input-error' : ''}
                  />
                  <IoAddCircleSharp onClick={validateAndAddEntity} className="input-icon" color='lightgrey' size={24} />
                </div>
                {entityValidationError && <span className="error">{entityValidationError}</span>}
                <div className='entityids-field'>
                  {offerDetails.offerType.entityIds && offerDetails.offerType.entityIds.map((id, index) => (
                    <div key={index} className='entityids'>
                      {id}<MdCancel color='grey' onClick={() => removeEntity(index)} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {offerDetails.offerType.offerType === 'DISCOUNT_COUPONS' && (
            <div className="form-group">
              <label htmlFor="couponCode">Coupon Code</label>
              <input
                type="text"
                id="couponCode"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className={formErrors.couponCode ? 'input-error' : ''}
              />
              {formErrors.couponCode && <span className="error">{formErrors.couponCode}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="offerDiscountType">Discount Type</label>
            <select
              id="offerDiscountType"
              value={offerDetails.offerDiscountType}
              onChange={handleInputChange}
              className={formErrors.offerDiscountType ? 'input-error' : ''}
            >
              <option value="">Select Discount Type</option>
              <option value="FIXED_AMOUNT">FIXED_AMOUNT</option>
              <option value="PERCENTAGE">PERCENTAGE</option>
            </select>
            {formErrors.offerDiscountType && <span className="error">{formErrors.offerDiscountType}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="offerDiscountValue">
              {offerDetails.offerDiscountType === 'FIXED_AMOUNT' ? 'Discount Amount' : 'Discount Percentage'}
            </label>
            <input
              type="number"
              id="offerDiscountValue"
              value={offerDetails.offerDiscountValue}
              onChange={handleInputChange}
              className={formErrors.offerDiscountValue ? 'input-error' : ''}
            />
            {formErrors.offerDiscountValue && <span className="error">{formErrors.offerDiscountValue}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="offerQuantity">Quantity</label>
            <input
              type="number"
              id="offerQuantity"
              value={offerDetails.offerQuantity}
              onChange={handleInputChange}
              className={formErrors.offerQuantity ? 'input-error' : ''}
            />
            {formErrors.offerQuantity && <span className="error">{formErrors.offerQuantity}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="offerStartDate">Start Date</label>
            <input
              type="date"
              id="offerStartDate"
              value={offerDetails.offerStartDate}
              onChange={handleInputChange}
              className={formErrors.offerStartDate ? 'input-error' : ''}
            />
            {formErrors.offerStartDate && <span className="error">{formErrors.offerStartDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="offerEndDate">End Date</label>
            <input
              type="date"
              id="offerEndDate"
              value={offerDetails.offerEndDate}
              onChange={handleInputChange}
              className={formErrors.offerEndDate ? 'input-error' : ''}
            />
            {formErrors.offerEndDate && <span className="error">{formErrors.offerEndDate}</span>}
          </div>

          <div className="button-group">
            <button type="submit" className="submit-button">Create Offer</button>
            {/* <button type="button" onClick={() => dispatch(resetForm())} className="reset-button">Reset</button> */}
          </div>

          {error && (
            <span className="error">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </span>
          )}

        </form>
      </div>
    </div>
  );
};

export default CreateOffer;
