import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setOfferDetails, setErrors, setSkuValidationError } from '../Redux/offerSlice';
import './Offer.css';

const CreateOffer = () => {
  const dispatch = useDispatch();
  const offerDetails = useSelector((state) => state.offer.offerDetails);
  const formErrors = useSelector((state) => state.offer.errors);
  const skuValidationError = useSelector((state) => state.offer.skuValidationError);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    dispatch(setOfferDetails({ ...offerDetails, [id]: value }));
  };

  const validateSkuId = async () => {
    if (offerDetails.skuId) {
      try {
        const response = await fetch(`your-api-endpoint/${offerDetails.skuId}`);
        if (!response.ok) {
          throw new Error('SKU ID not found');
        }
        dispatch(setSkuValidationError('')); // Clear error if valid
      } catch (error) {
        dispatch(setSkuValidationError('Invalid SKU ID'));
      }
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!offerDetails.offerId) errors.offerId = 'Offer ID is required.';
    if (!offerDetails.offerName) errors.offerName = 'Offer Name is required.';
    if (!offerDetails.offerType) errors.offerType = 'Offer Type is required.';
    if (!offerDetails.discountType) errors.discountType = 'Discount Type is required.';
    if (offerDetails.discountType && !offerDetails.discountValue) {
      errors.discountValue = `${offerDetails.discountType === 'price' ? 'Discount Amount' : 'Discount Percentage'} is required.`;
    }
    if (!offerDetails.quantity) errors.quantity = 'Quantity is required.';
    if (!offerDetails.startDate) errors.startDate = 'Start Date is required.';
    if (!offerDetails.expiryDate) errors.expiryDate = 'Expiry Date is required.';

    if (offerDetails.startDate && offerDetails.expiryDate) {
      if (new Date(offerDetails.startDate) >= new Date(offerDetails.expiryDate)) {
        errors.expiryDate = 'Expiry Date must be greater than Start Date.';
      }
    }

    dispatch(setErrors(errors));
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      await validateSkuId();

      if (!skuValidationError) {
        alert('Offer created successfully');
        console.log(offerDetails);
      }
    }
  };

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
            />
            {formErrors.offerName && <span className="error">{formErrors.offerName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="offerType">Offer Type</label>
            <select
              id="offerType"
              value={offerDetails.offerType}
              onChange={handleInputChange}
            >
              <option value="">Select Offer Type</option>
              <option value="ProductOffers">Product Offers</option>
              <option value="SeasonalPromotion">Seasonal Promotion</option>
              <option value="PriceDiscounts">Price Discounts</option>
            </select>
            {formErrors.offerType && <span className="error">{formErrors.offerType}</span>}
          </div>

          {/* Conditionally render the SKU ID field */}
          {offerDetails.offerType && (
            <div className="form-group">
              <label htmlFor="skuId">SKU ID</label>
              <input
                type="text"
                id="skuId"
                value={offerDetails.skuId}
                onChange={handleInputChange}
              />
              {skuValidationError && <span className="error">{skuValidationError}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="discountType">Discount Type</label>
            <select
              id="discountType"
              value={offerDetails.discountType}
              onChange={handleInputChange}
            >
              <option value="">Select Discount Type</option>
              <option value="price">Price</option>
              <option value="percentage">Percentage</option>
            </select>
            {formErrors.discountType && <span className="error">{formErrors.discountType}</span>}
          </div>

          {offerDetails.discountType && (
            <div className="form-group">
              <label htmlFor="discountValue">
                {offerDetails.discountType === 'price' ? 'Discount Amount' : 'Discount Percentage'}
              </label>
              <input
                type="number"
                id="discountValue"
                value={offerDetails.discountValue}
                onChange={handleInputChange}
              />
              {formErrors.discountValue && <span className="error">{formErrors.discountValue}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              type="number"
              id="quantity"
              value={offerDetails.quantity}
              onChange={handleInputChange}
            />
            {formErrors.quantity && <span className="error">{formErrors.quantity}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={offerDetails.startDate}
              onChange={handleInputChange}
            />
            {formErrors.startDate && <span className="error">{formErrors.startDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="expiryDate">Expiry Date</label>
            <input
              type="date"
              id="expiryDate"
              value={offerDetails.expiryDate}
              onChange={handleInputChange}
            />
            {formErrors.expiryDate && <span className="error">{formErrors.expiryDate}</span>}
          </div>

          <button type="submit" className="btn btn-primary form-control">Create Offer</button>
        </form>
      </div>
    </div>
  );
};

export default CreateOffer;
