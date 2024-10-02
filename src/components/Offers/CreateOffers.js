import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createOffer, resetForm, setOfferDetails } from '../Redux/offerSlice';
import { MdCancel } from "react-icons/md";
import { IoAddCircleSharp } from "react-icons/io5";
import axios from 'axios';
import './Offer.css'; // Import your custom CSS file
import { VIBECART_URI } from '../Services/service';
import { useNavigate } from 'react-router-dom';

const CreateOffer = () => {
  const dispatch = useDispatch();
  const { offerDetails, loading, error, success } = useSelector((state) => state.offers);
  const [formErrors, setFormErrors] = useState({});
  const [newItem, setNewItem] = useState([]);
  const [newItemIds, setNewItemIds] = useState([]); // Changed to store multiple item IDs
  const [newskuIds, setNewSkuIds] = useState([]); // Changed to store multiple item IDs
  const [availableSkus, setAvailableSkus] = useState([]);
  const [skuValidationError, setSkuValidationError] = useState('');
  const [itemValidationError, setItemValidationError] = useState('');
  const [invalidItemError, setInvalidItemError] = useState('');
  const [formData, setFormData] = useState({
    offerType: "",
    skuId: '',
    itemId: '',
    billAmount: 0.0,
    couponCode: ""
  });
  const navigate = useNavigate()
  const fetchAvailableSkus = async (itemId) => {
    try {
      const response = await axios.get(`${VIBECART_URI}/vibecart/ecom/items/item/${itemId}/skuIDs`);
      if (Array.isArray(response.data.skuIDs)) {
        setAvailableSkus(response.data.skuIDs.map(sku => ({ value: sku, label: sku })));
        setInvalidItemError('');
        setAvailableSkus([]);
        setInvalidItemError('Invalid item ID.');
      }
    } catch (error) {
      console.error('Error fetching SKUs:', error);
      setAvailableSkus([]);
      setInvalidItemError('Error fetching SKUs.');
    }
  };

  const validateSku = async (sku) => {
    try {
      const response = await axios.get(`${VIBECART_URI}/vibecart/ecom/products/product/sku-id/${sku}`);
  
      // Assuming response.data contains { skuID, itemID, ... }
      const { skuID, itemID } = response.data;
  
      if (skuID && itemID) {
        // Ensure SKU is not duplicated
        setNewItem(prevOfferItems => {
          const newItem = {
            offerType: formData.offerType,
            offerOn: "SKU",
            skuId: skuID,
            itemId: itemID,
            billAmount: 0.0,
            couponCode: ""
          };
  
          // Filter out duplicates
          const uniqueItems = prevOfferItems.filter(
            item => !(item.skuId === newItem.skuId && item.itemId === newItem.itemId)
          );
  
          return [...uniqueItems, newItem];
        });
  
        setSkuValidationError('');
        return true;
  
      } else {
        // If skuID or itemID is missing, show error
        setSkuValidationError('Invalid SKU.');
        console.error('Invalid SKU');
        return false;
      }
    } catch (error) {
      // In case of an error, set validation error
      setSkuValidationError('Invalid SKU.');
      console.error('Invalid SKU', error);
      return false;
    }
  };
  


  const handleInputChange = (e) => {
    const { id, value } = e.target;
    console.log(e.target.value);
    setFormData(prevState => ({ ...prevState, [id]: value }));
    dispatch(setOfferDetails({ [id]: value }));

    setFormErrors(prevErrors => ({
      ...prevErrors,
      [id]: ''
    }));
    if (id === 'skuId') {
      validateSku(value);
    }
    
    if (id === 'couponCode' && formData.offerType === 'DISCOUNT_COUPONS') {
      const myData = [{
        offerType: formData.offerType,
        offerOn: 'NA',
        skuId: null,
        itemId: null,
        billAmount: 0.0,
        couponCode: value,
      }];
      setNewItem(myData);
    } else if (id === 'billAmount') {
      const myData = [{
        offerType: formData.offerType,
        offerOn: 'NA',
        skuId: null,
        itemId: null,
        billAmount: value,
        couponCode: null,
      }];
      setNewItem(myData);
    }

  };
  const addSku = async () => {
    console.log(formData);
    if (formData.skuId) {
      try {
        const isValid = await validateSku(formData.skuId);
  
        console.log('Validation result:', isValid);  // Log the result of the validation
  
        if (isValid) {
          setNewSkuIds(prevState => [...prevState, formData.skuId]);
          setFormData(prevState => ({ ...prevState, skuId: '' }));
          setSkuValidationError('');
        } else {
          console.log('Invalid SKU, cannot add.');
        }
      } catch (error) {
        console.error('Error while validating SKU:', error);
      }
    } else {
      console.log('SKU is required.');
    }
  };
  const removeSkuId = (skuIdToRemove) => {
    setNewSkuIds(prevState => prevState.filter(id => id !== skuIdToRemove));
  };
  const validateItemId = async (itemId) => {
    try {
      const response = await fetch(`${VIBECART_URI}/vibecart/ecom/items/item/${itemId}/skuIDs`);
      const data = await response.json();
  
      if (response.ok && data.skuIDs) {
        // Ensure items aren't duplicated
        setNewItem(prevItems => {
          const newItems = data.skuIDs.map(sku => ({
            offerType: formData.offerType,
            offerOn: 'ITEM',
            skuId: sku,
            itemId: parseInt(itemId),
            billAmount: 0.0,
            couponCode: ''
          }));
  
          // Filter out duplicates
          const uniqueItems = newItems.filter(
            newItem => !prevItems.some(item => item.skuId === newItem.skuId && item.itemId === newItem.itemId)
          );
  
          return [...prevItems, ...uniqueItems];
        });
  
        return true;
      } else {
        return false;
      }
    } catch (error) {
      setItemValidationError('Error validating item ID.');
      return false;
    }
  };
  const handleItemIdChange = async (e) => {
    const itemId = e.target.value.trim();
    setFormData(prevState => ({
      ...prevState,
      itemId: itemId
    }));

    if (itemId) {
      const isValid = await validateItemId(itemId);
      if (isValid) {
        setItemValidationError('');
        fetchAvailableSkus(itemId);
      } else {
        setItemValidationError(`Invalid item ID: ${itemId}`);
        setAvailableSkus([]);
      }
    } else {
      setItemValidationError('Item ID cannot be empty.');
      setAvailableSkus([]);
    }
  };
  const addItemId = async () => {
    if (formData.itemId) {
      const isValid = await validateItemId(formData.itemId);
      if (isValid) {
        setNewItemIds(prevState => [...prevState, formData.itemId]);
        setFormData(prevState => ({ ...prevState, itemId: '' }));
        setItemValidationError('');
      } else {
        setItemValidationError('Invalid Item ID.');
      }
    } else {
      setItemValidationError('Item ID cannot be empty.');
    }
  };
  const removeItemId = (itemIdToRemove) => {
    setNewItemIds(prevState => prevState.filter(id => id !== itemIdToRemove));
  };
  

  const validateForm = () => {
    const errors = {};
  
    if (!offerDetails.offerName) errors.offerName = 'Offer Name is required.';
    if (!offerDetails.offerDiscountType) errors.offerDiscountType = 'Discount Type is required.';
    if (offerDetails.offerDiscountType && offerDetails.offerDiscountValue <= 0) {
      errors.offerDiscountValue = `${offerDetails.offerDiscountType === 'PRICE' ? 'Discount Amount' : 'Discount Percentage'} is required and must be greater than 0.`;
    }
    if (offerDetails.offerQuantity <= 0) errors.offerQuantity = 'Quantity is required and must be greater than 0.';
    if (!offerDetails.offerStartDate) errors.offerStartDate = 'Start Date is required.';
    if (!offerDetails.offerEndDate) errors.offerEndDate = 'End Date is required.';
  
    if (offerDetails.offerStartDate && offerDetails.offerEndDate) {
      if (new Date(offerDetails.offerStartDate) >= new Date(offerDetails.offerEndDate)) {
        errors.offerEndDate = 'End Date must be greater than Start Date.';
      }
    }
    if (!offerDetails.offerDescription) errors.offerDescription = 'Offer Description required';
    
  
    setFormErrors(errors);

    return Object.keys(errors).length === 0;

  };
  

  const handleFormSubmit = (e) => {
    e.preventDefault();
  
    if (validateForm()) {
      dispatch(createOffer({ ...offerDetails, offerItems: newItem }))
        .then(() => {
          alert('Offer created successfully');
          navigate('/dashboard'); 
        })
        .catch((error) => {
          console.log('Error dispatching createOffer:', error);
        });
    } else {
      console.log('Validation Failed. Errors:', formErrors);
    }
  };
  
  useEffect(() => {
    if (newItem.itemId) {
      fetchAvailableSkus(newItem.itemId);
    }
  }, [newItem.itemId]);

  useEffect(() => {
    if (success) {
      dispatch(resetForm());
      setFormData({
        offerType: "",
        skuId: '',
        itemId: '',
        billAmount: 0.0,
        couponCode: ""
      });
    }
  }, [success, dispatch, setFormData]);
  

  return (
    <div className="container offer-container">
      <div className="card offer-card">
        <div className="card-header bg-light-grey">
          <h4 className="card-title mt-10">Add New Offer</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleFormSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="offerName">Offer Name</label>
                  <input
                    type="text"
                    id="offerName"
                    value={offerDetails.offerName || ''}
                    onChange={handleInputChange}
                    className={`form-control ${formErrors.offerName ? 'is-invalid' : ''}`}
                  />
                  {formErrors.offerName ? (<div className="invalid-feedback">{formErrors.offerName}</div>):''}
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="offerQuantity">Offer Usage Quantity</label>
                  <input
                    type="number"
                    id="offerQuantity"
                    value={offerDetails.offerQuantity || ''}
                    onChange={handleInputChange}
                    className={`form-control ${formErrors.offerQuantity ? 'is-invalid' : ''}`}
                  />
                  {formErrors.offerQuantity && <div className="invalid-feedback">{formErrors.offerQuantity}</div>}
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className={offerDetails.offerDiscountType ? 'col-md-6' : 'col-md-12'}>
                <div className="form-group">
                  <label htmlFor="offerDiscountType">Discount Type</label>
                  <select
                    id="offerDiscountType"
                    value={offerDetails.offerDiscountType || ''}
                    onChange={handleInputChange}
                    className={`form-control ${formErrors.offerDiscountType ? 'is-invalid' : ''}`}
                  >
                    <option value="">Select Discount Type</option>
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="PRICE">Price</option>
                  </select>
                  {formErrors.offerDiscountType && (
                    <div className="invalid-feedback">{formErrors.offerDiscountType}</div>
                  )}
                </div>
              </div>

              {offerDetails.offerDiscountType && (
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="offerDiscountValue">Discount Value</label>
                    <input
                      type="number"
                      id="offerDiscountValue"
                      value={offerDetails.offerDiscountValue || ''}
                      onChange={handleInputChange}
                      className={`form-control ${formErrors.offerDiscountValue ? 'is-invalid' : ''}`}
                    />
                    {formErrors.offerDiscountValue && (
                      <div className="invalid-feedback">{formErrors.offerDiscountValue}</div>
                    )}
                  </div>
                </div>
              )}
            </div>


            <div className="row mb-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="offerStartDate">Start Date</label>
                  <input
                    type="date"
                    id="offerStartDate"
                    value={offerDetails.offerStartDate || ''}
                    onChange={handleInputChange}
                    className={`form-control ${formErrors.offerStartDate ? 'is-invalid' : ''}`}
                  />
                  {formErrors.offerStartDate && <div className="invalid-feedback">{formErrors.offerStartDate}</div>}
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="offerEndDate">End Date</label>
                  <input
                    type="date"
                    id="offerEndDate"
                    value={offerDetails.offerEndDate || ''}
                    onChange={handleInputChange}
                    className={`form-control ${formErrors.offerEndDate ? 'is-invalid' : ''}`}
                  />
                  {formErrors.offerEndDate && <div className="invalid-feedback">{formErrors.offerEndDate}</div>}
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="form-group">
                <label htmlFor="offerType">Offer Type</label>
                <select
                  id="offerType"
                  value={newItem.offerType}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">Select Offer Type</option>
                  <option value="SKU_OFFER">SKU OFFER</option>
                  <option value="ITEM_OFFER">ITEM OFFER</option>
                  <option value="ON_BILL_AMOUNT">ON BILL AMOUNT</option>
                  <option value="DISCOUNT_COUPONS">DISCOUNT COUPONS</option>
                </select>
              </div>

              {formData.offerType === 'SKU_OFFER' && (
                <div className="form-group">
                  <label htmlFor="skuId">Enter SKUs</label>
                  <div className="input-group">
                    <input
                      type="number"
                      id="skuId"
                      value={formData.skuId}
                      onChange={handleInputChange}
                      className={`form-control ${skuValidationError ? 'is-invalid' : ''}`}
                      placeholder="Enter SKU"
                    />
                    <span className="input-group-text">
                      <IoAddCircleSharp
                        onClick={addSku}
                        className={`input-icon ${!formData.skuId ? 'icon-disabled' : ''}`}
                      />
                    </span>
                  </div>
                  {newskuIds.length > 0 && (
                    <div className="input-items-container mt-2">
                      {newskuIds.map((skuId, index) => (
                        <div key={index} className="input-item">
                          <span>{skuId}</span>
                          <MdCancel onClick={() => removeSkuId(skuId)} className="remove-item-icon" />
                        </div>
                      ))}
                    </div>
                  )}
                  {skuValidationError && <div className="invalid-feedbacks">{skuValidationError}</div>}
                </div>
                // </div>
              )}

              {formData.offerType === 'ITEM_OFFER' && (
                // <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="itemId">Enter Item ID</label>
                  <div className="input-group">
                    <input
                      type="text"
                      id="itemId"
                      value={formData.itemId}
                      onChange={handleItemIdChange}
                      className={`form-control ${itemValidationError ? 'is-invalid' : ''}`}
                    />
                    <span className="input-group-text">
                      <IoAddCircleSharp
                        onClick={addItemId}
                        className={`input-icon ${!formData.itemId ? 'icon-disabled' : ''}`}
                      />
                    </span>
                  </div>
                  {newItemIds.length > 0 && (
                    <div className="input-items-container mt-2">
                      {newItemIds.map((itemId, index) => (
                        <div key={index} className="input-item">
                          <span>{itemId}</span>
                          <MdCancel onClick={() => removeItemId(itemId)} className="remove-item-icon" />
                        </div>
                      ))}
                    </div>
                  )}
                  {/* <div>{itemValidationError}</div> */}
                  {itemValidationError && <div className='invalid-feedbacks'>{itemValidationError}</div>}
                </div>
                // </div>
              )}

              {formData.offerType === 'DISCOUNT_COUPONS' && (
                // <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="couponCode">Enter Coupon Code</label>
                  <input
                    type="text"
                    id="couponCode"
                    value={formData.couponCode || ''}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
                // </div>
              )}

              {formData.offerType === 'ON_BILL_AMOUNT' && (
                // <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="billAmount">Enter Bill Amount</label>
                  <input
                    type="number"
                    id="billAmount"
                    value={formData.billAmount || ''}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
                // </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="offerDescription">Offer Description</label>
              <textarea
                id="offerDescription"
                value={offerDetails.offerDescription || ''}
                onChange={handleInputChange}
                rows="2"
                className={`form-control ${formErrors.offerDescription ? 'is-invalid' : ''}`}
              />
              {formErrors.offerDescription && <div className="invalid-feedback">{formErrors.offerDescription}</div>}
            </div>

            <div className="row mt-4">
              <div className="col-md">
                <button type="submit" className="btn  w-100">
                  Create Offer
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );

};

export default CreateOffer;
