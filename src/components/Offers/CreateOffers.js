import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createOffer, resetForm, setOfferDetails } from '../Redux/offerSlice';
import { MdCancel } from "react-icons/md";
import { IoAddCircleSharp } from "react-icons/io5";
import axios from 'axios';
import './Offer.css'; // Import your custom CSS file

const CreateOffer = () => {
  const dispatch = useDispatch();
  const { offerDetails = { offerItems: [] }, loading, error, success } = useSelector((state) => state.offers);
  const [formErrors, setFormErrors] = useState({});
  const [newItem, setNewItem] = useState({
    offerType: 'SKU_OFFER',
    offerOn: 'SKU',
    itemId: '',
    skuId: [],
    billAmount: 0.0,
    couponCode: ''
  });
  const [availableSkus, setAvailableSkus] = useState([]);
  const [itemValidationError, setItemValidationError] = useState('');
  const [invalidItemError, setInvalidItemError] = useState('');

  // Fetch SKUs based on itemId
  const fetchAvailableSkus = async (itemId) => {
    try {
      const response = await axios.get(`http://localhost:8080/vibecart/ecom/items/item/${itemId}/skuIDs`);
      if (response.data.skuIDs) {
        setAvailableSkus(response.data.skuIDs);
        setInvalidItemError(''); // Clear any previous invalid item error
      } else {
        setAvailableSkus([]);
        setInvalidItemError('Invalid item ID.'); // Set invalid item error
      }
    } catch (error) {
      console.error('Error fetching SKUs:', error);
      setAvailableSkus([]);
      setInvalidItemError('Error fetching SKUs.'); // Handle fetch error
    }
  };

  // Handle changes to the input fields
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setNewItem(prevState => ({ ...prevState, [id]: value }));
  };

  // Handle changes to the SKU selection
  const handleSkuSelection = (e) => {
    const { value, checked } = e.target;
    setNewItem(prevState => {
      const updatedSkuIds = checked
        ? [...prevState.skuId, value]
        : prevState.skuId.filter(sku => sku !== value);
      return { ...prevState, skuId: updatedSkuIds };
    });
  };

  // Add a new item to the offer
  const validateAndAddItem = () => {
    if (newItem.offerOn === 'ITEM') {
      if (!newItem.itemId) {
        setItemValidationError('Item ID is required.');
        return;
      }
      if (newItem.skuId.length === 0) {
        setItemValidationError('At least one SKU ID must be selected.');
        return;
      }
    } else if (newItem.offerOn === 'SKU' && newItem.skuId.length === 0) {
      setItemValidationError('At least one SKU ID must be selected.');
      return;
    }

    setItemValidationError('');

    dispatch(setOfferDetails({
      offerItems: [...(offerDetails.offerItems || []), newItem]
    }));

    // Retain itemId and clear skuId
    setNewItem(prevState => ({
      ...prevState,
      skuId: [],
      billAmount: 0.0,
      couponCode: ''
    }));
    setAvailableSkus([]); // Clear the available SKUs after adding an item
  };

  // Remove an item from the offer
  const removeOfferItem = (index) => {
    const updatedItems = (offerDetails.offerItems || []).filter((_, idx) => idx !== index);
    dispatch(setOfferDetails({ offerItems: updatedItems }));
  };

  // Validate the entire form before submission
  const validateForm = () => {
    const errors = {};

    if (!offerDetails.offerName) errors.offerName = 'Offer Name is required.';
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

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      dispatch(createOffer(offerDetails));
    }
  };

  // Fetch SKUs when itemId changes
  useEffect(() => {
    if (newItem.offerOn === 'ITEM' && newItem.itemId) {
      fetchAvailableSkus(newItem.itemId);
    }
  }, [newItem.itemId, newItem.offerOn]);

  // Handle success response
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
              value={offerDetails.offerName || ''}
              onChange={(e) => dispatch(setOfferDetails({ offerName: e.target.value }))}
              className={formErrors.offerName ? 'input-error' : ''}
            />
            {formErrors.offerName && <span className="error">{formErrors.offerName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="offerDescription">Offer Description</label>
            <textarea
              id="offerDescription"
              value={offerDetails.offerDescription || ''}
              onChange={(e) => dispatch(setOfferDetails({ offerDescription: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label htmlFor="offerQuantity">Offer Quantity</label>
            <input
              type="number"
              id="offerQuantity"
              value={offerDetails.offerQuantity || ''}
              onChange={(e) => dispatch(setOfferDetails({ offerQuantity: e.target.value }))}
              className={formErrors.offerQuantity ? 'input-error' : ''}
            />
            {formErrors.offerQuantity && <span className="error">{formErrors.offerQuantity}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="offerDiscountType">Discount Type</label>
            <select
              id="offerDiscountType"
              value={offerDetails.offerDiscountType || ''}
              onChange={(e) => dispatch(setOfferDetails({ offerDiscountType: e.target.value }))}
              className={formErrors.offerDiscountType ? 'input-error' : ''}
            >
              <option value="">Select Discount Type</option>
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED_AMOUNT">Fixed Amount</option>
            </select>
            {formErrors.offerDiscountType && <span className="error">{formErrors.offerDiscountType}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="offerDiscountValue">Discount Value</label>
            <input
              type="number"
              id="offerDiscountValue"
              value={offerDetails.offerDiscountValue || ''}
              onChange={(e) => dispatch(setOfferDetails({ offerDiscountValue: e.target.value }))}
              className={formErrors.offerDiscountValue ? 'input-error' : ''}
            />
            {formErrors.offerDiscountValue && <span className="error">{formErrors.offerDiscountValue}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="offerType">Offer Type</label>
            <select
              id="offerType"
              value={newItem.offerType || ''}
              onChange={(e) => setNewItem({ ...newItem, offerType: e.target.value })}
            >
              <option value="">Select Offer Type</option>
              <option value="ITEM_OFFER">ITEM_OFFER</option>
              <option value="SKU_OFFER">SKU_OFFER</option>
              <option value="ON_BILL_AMOUNT">ON_BILL_AMOUNT</option>
              <option value="DISCOUNT_COUPONS">DISCOUNT_COUPONS</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="offerOn">Offer On</label>
            <select
              id="offerOn"
              value={newItem.offerOn}
              onChange={handleInputChange}
            >
              <option value="ITEM">Item</option>
              <option value="SKU">SKU</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="itemId">Item ID</label>
            <input
              type="text"
              id="itemId"
              value={newItem.itemId}
              onChange={handleInputChange}
            />
            {invalidItemError && <span className="error">{invalidItemError}</span>}
          </div>

          {newItem.offerOn === 'ITEM' && availableSkus.length > 0 && (
            <div className="form-group">
              <label>SKU IDs</label>
              <div className="checkbox-group">
                {availableSkus.map((sku) => (
                  <div key={sku}>
                    <input
                      type="checkbox"
                      value={sku}
                      onChange={handleSkuSelection}
                      checked={newItem.skuId.includes(sku.toString())}
                    />
                    <label>{sku}</label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {itemValidationError && <span className="error">{itemValidationError}</span>}
          <IoAddCircleSharp onClick={validateAndAddItem}/>
          <div className="offer-items-list">
            {offerDetails.offerItems && offerDetails.offerItems.map((item, index) => (
              <div key={index} className="offer-item">
                <span>{item.offerOn} - {item.itemId} - SKUs: {item.skuId.join(', ')}</span>
                <MdCancel onClick={() => removeOfferItem(index)}/>
              </div>
            ))}
          </div>

          <div className="form-group">
            <label htmlFor="offerStartDate">Start Date</label>
            <input
              type="date"
              id="offerStartDate"
              value={offerDetails.offerStartDate || ''}
              onChange={(e) => dispatch(setOfferDetails({ offerStartDate: e.target.value }))}
              className={formErrors.offerStartDate ? 'input-error' : ''}
            />
            {formErrors.offerStartDate && <span className="error">{formErrors.offerStartDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="offerEndDate">End Date</label>
            <input
              type="date"
              id="offerEndDate"
              value={offerDetails.offerEndDate || ''}
              onChange={(e) => dispatch(setOfferDetails({ offerEndDate: e.target.value }))}
              className={formErrors.offerEndDate ? 'input-error' : ''}
            />
            {formErrors.offerEndDate && <span className="error">{formErrors.offerEndDate}</span>}
          </div>
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Creating Offer...' : 'Create Offer'}
          </button>
          {error && <span className="error">{error}</span>}
        </form>
      </div>
    </div>
  );
};

export default CreateOffer;
