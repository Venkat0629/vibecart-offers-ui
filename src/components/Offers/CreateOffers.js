import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createOffer, resetForm, setOfferDetails } from '../Redux/offerSlice';
import { MdCancel } from "react-icons/md";
import { IoAddCircleSharp } from "react-icons/io5";
import axios from 'axios';
import Select from 'react-select';
import './Offer.css'; // Import your custom CSS file

const CreateOffer = () => {
  const dispatch = useDispatch();
  const { offerDetails = { offerItems: [] }, loading, error, success } = useSelector((state) => state.offers);
  const [formErrors, setFormErrors] = useState({});
  const [newItem, setNewItem] = useState({
  offerType: 'SKU_OFFER',
  itemIds: [],  // Change from single itemId to an array
  skuIds: [],   // Change from single skuId to an array
  couponCode: '',
  enteringSku: '',
  billAmount: ''
});

  const [availableSkus, setAvailableSkus] = useState([]);
  const [skuValidationError, setSkuValidationError] = useState('');
  const [itemValidationError, setItemValidationError] = useState('');
  const [invalidItemError, setInvalidItemError] = useState('');

  // Fetch SKUs based on itemId
  const fetchAvailableSkus = async (itemId) => {
    try {
      const response = await axios.get(`http://localhost:8080/vibecart/ecom/items/item/${itemId}/skuIDs`);
      if (Array.isArray(response.data.skuIDs)) {
        setAvailableSkus(response.data.skuIDs.map(sku => ({ value: sku, label: sku })));
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

  // Validate SKU
  const validateSku = async (sku) => {
    if (!sku) {
      setSkuValidationError('SKU cannot be empty.');
      return;
    }
    try {
      const response = await axios.get(`http://localhost:8080/vibecart/ecom/items/sku/${sku}`);
      if (response.data.valid) {
        setSkuValidationError('');
      } else {
        setSkuValidationError('Invalid SKU.');
      }
    } catch (error) {
      setSkuValidationError('Error validating SKU.');
    }
  };

  // Handle changes to the input fields
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setNewItem(prevState => ({ ...prevState, [id]: value }));

    // Validate SKU input
    if (id === 'enteringSku') {
      validateSku(value);
    }
  };

  // Handle changes to the SKU selection
  const handleSkuSelection = (selectedOptions) => {
    const selectedSkuIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setNewItem(prevState => ({ ...prevState, skuId: selectedSkuIds }));
  };

  // Add a new item to the offer
  const validateAndAddItem = () => {
    if (newItem.offerType === 'ITEM_OFFER' && (!newItem.itemId || newItem.skuId.length === 0)) {
      setItemValidationError('Item ID and at least one SKU ID are required.');
      return;
    }
    if (newItem.offerType === 'SKU_OFFER' && newItem.skuId.length === 0) {
      setItemValidationError('At least one SKU ID is required.');
      return;
    }

    setItemValidationError('');
    dispatch(setOfferDetails({
      offerItems: [...(offerDetails.offerItems || []), newItem]
    }));

    // Reset newItem state
    setNewItem({ offerType: 'SKU_OFFER', itemId: '', skuId: [], couponCode: '', enteringSku: '' });
    setAvailableSkus([]);
  };

  // Remove an item from the offer
  const removeOfferItem = (index) => {
    const updatedItems = (offerDetails.offerItems || []).filter((_, idx) => idx !== index);
    dispatch(setOfferDetails({ offerItems: updatedItems }));
  };
  const validateItemId = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:8080/vibecart/ecom/items/item/${itemId}/skuIDs`);
      const data = await response.json();
      if (response.ok && data.skuIDs) {
        return true; // Valid itemId
      } else {
        return false; // Invalid itemId
      }
    } catch (error) {
      console.error('Error validating item ID:', error);
      return false;
    }
  };
  const handleItemIdChange = async (e) => {
    const itemId = e.target.value.trim();
    setNewItem(prevState => ({
      ...prevState,
      itemId: itemId // Update itemId directly
    }));

    if (itemId) {
      // Start asynchronous validation
      const isValid = await validateItemId(itemId);
      if (isValid) {
        setItemValidationError(''); // Clear any previous error
        fetchAvailableSkus(itemId); // Fetch SKUs if itemId is valid
      } else {
        setItemValidationError(`Invalid item ID: ${itemId}`);
        setAvailableSkus([]); // Clear SKUs if itemId is invalid
      }
    } else {
      setItemValidationError('Item ID cannot be empty.');
      setAvailableSkus([]); // Clear SKUs if itemId is empty
    }
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
    if (newItem.itemId) {
      fetchAvailableSkus(newItem.itemId);
    }
  }, [newItem.itemId]);

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
          <div className="form-row">
            <div className="form-column">
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
            </div>

            <div className="form-column">
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
            </div>
          </div>

          <div className="form-row">
            <div className="form-column">
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
            </div>

            {offerDetails.offerDiscountType && (
              <div className="form-column">
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
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-column">
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
            </div>

            <div className="form-column">
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
            </div>
          </div>

          <div className="form-row">
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="offerType">Offer Type</label>
                <select
                  id="offerType"
                  value={newItem.offerType}
                  onChange={(e) => setNewItem(prevState => ({ ...prevState, offerType: e.target.value }))}
                >
                  <option value="SKU_OFFER">SKU OFFER</option>
                  <option value="ITEM_OFFER">ITEM OFFER</option>
                  <option value="ON_BILL_AMOUNT">ON_BILL_AMOUNT</option>
                  <option value="DISCOUNT_COUPONS">DISCOUNT_COUPONS</option>
                </select>
              </div>
            </div>

            {newItem.offerType === 'SKU_OFFER' && (
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="enteringSku">Enter SKUs</label>
                  <input
                    type="text"
                    id="enteringSku"
                    value={newItem.enteringSku || ''}
                    onChange={handleInputChange}
                  />
                  {skuValidationError && <span className="error">{skuValidationError}</span>}
                </div>
              </div>
            )}

            {newItem.offerType === 'ITEM_OFFER' && (
              <>
                <div className="form-column">
                  <div className="form-group">
                    <label htmlFor="itemId">Enter Item ID</label>
                    <input
                      type="text"
                      id="itemId"
                      value={newItem.itemId || ''}
                      onChange={handleItemIdChange}
                      className={itemValidationError ? 'input-error' : ''}
                    />

                    {itemValidationError && <span className="error">{itemValidationError}</span>}
                  </div>
                </div>

                {/* {newItem.itemId && (
        <div className="form-column">
          <div className="form-group">
            <label htmlFor="availableSkus">Available SKUs</label>
            <Select
              isMulti
              options={availableSkus}
              onChange={handleSkuSelection}
              value={availableSkus.filter(sku => newItem.skuId.includes(sku.value))}
            />
          </div>
        </div>
      )} */}
              </>
            )}
            {newItem.offerType === 'DISCOUNT_COUPONS' && (
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="couponCode">Enter Coupon Code</label>
                  <input
                    type="text"
                    id="couponCode"
                    value={newItem.couponCode || ''}
                    onChange={handleInputChange}
                  />
                  {/* {skuValidationError && <span className="error">{skuValidationError}</span>} */}
                </div>
              </div>
            )}
            {newItem.offerType === 'ON_BILL_AMOUNT' && (
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="billAmount">Enter Bill Amount</label>
                  <input
                    type="text"
                    id="billAmount"
                    value={newItem.billAmount || ''}
                    onChange={handleInputChange}
                  />
                  {/* {skuValidationError && <span className="error">{skuValidationError}</span>} */}
                </div>
              </div>
            )}
          </div>


          {/* <button type="button" onClick={validateAndAddItem} className="add-item-btn">
            <IoAddCircleSharp /> Add Item
          </button> */}
          <div className="form-group">
            <label htmlFor="offerDescription">Offer Description</label>
            <textarea
              id="offerDescription"
              value={offerDetails.offerDescription || ''}
              onChange={(e) => dispatch(setOfferDetails({ offerDescription: e.target.value }))}
              rows="2"
            />
          </div>
          <div className="offer-items-list">
            {(offerDetails.offerItems || []).map((item, index) => (
              <div key={index} className="offer-item">
                <p>Offer Type: {item.offerType}</p>
                {item.offerType === 'SKU_OFFER' && <p>SKU IDs: {item.skuId.join(', ')}</p>}
                {item.offerType === 'ITEM_OFFER' && <p>Item IDs: {item.itemIds.join(', ')}</p>
                }
                <button type="button" onClick={() => removeOfferItem(index)} className="remove-item-btn">
                  <MdCancel />
                </button>
              </div>
            ))}
          </div>

          <div className="form-group">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating Offer...' : 'Create Offer'}
            </button>
          </div>


        </form>
      </div>
    </div>
  );
};

export default CreateOffer;
