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
  const { offerDetails, loading, error, success } = useSelector((state) => state.offers);
  const [formErrors, setFormErrors] = useState({});
  const [newItem, setNewItem] = useState([]);
  const [newItemIds, setNewItemIds] = useState([]); // Changed to store multiple item IDs
  const [newskuIds, setNewSkuIds] = useState([]); // Changed to store multiple item IDs
  const [availableSkus, setAvailableSkus] = useState([]);
  const [skuValidationError, setSkuValidationError] = useState('');
  const [itemValidationError, setItemValidationError] = useState('');
  const [invalidItemError, setInvalidItemError] = useState('');
  const [itemlevelSku, setItemLevelsku] = useState([]);
  const [formData, setFormData] = useState({
    offerType: "",
    skuId: '',
    itemId: '',
    billAmount: 0.0,
    couponCode: ""
  });
  const fetchAvailableSkus = async (itemId) => {
    try {
      const response = await axios.get(`http://localhost:8080/vibecart/ecom/items/item/${itemId}/skuIDs`);
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
    if (!sku) {
      setSkuValidationError('SKU cannot be empty.');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8080/vibecart/ecom/products/product/sku-id/${sku}`);

      // Assuming response.data contains { skuID, itemID, ... }
      const { skuID, itemID } = response.data;

      if (skuID && itemID) {
        // Update state with new offer item
        setNewItem(prevOfferItems => [
          ...prevOfferItems,
          {
            offerType: formData.offerType,
            offerOn: "SKU",
            skuId: skuID,
            itemId: itemID,
            billAmount: 0.0,
            couponCode: ""
          }
        ]);
        console.log(newItem)
        setSkuValidationError('');
      } else {
        setSkuValidationError('Invalid SKU.');
      }
    } catch (error) {
      setSkuValidationError('Error validating SKU.');
    }
  };


  const handleInputChange = (e) => {
    const { id, value } = e.target;
    console.log(e.target.value);
    setFormData(prevState => ({ ...prevState, [id]: value }));

    if (id === 'skuId') {
      validateSku(value);
    }
    if (id === 'couponCode' && formData.offerType === 'DISCOUNT_COUPONS') {
      const myData = {
        offerType: formData.offerType,
        offerOn: 'NA',
        skuId: null,
        itemId: null,
        billAmount: 0.0,
        couponCode: value,
      };
      setNewItem(myData);
    } else if (id === 'billAmount') {
      const myData = {
        offerType: formData.offerType,
        offerOn: 'NA',
        skuId: null,
        itemId: null,
        billAmount: value,
        couponCode: null,
      };
      setNewItem(myData);
    }
  };





  const removeOfferItem = (index) => {
    const updatedItems = (offerDetails.offerItems || []).filter((_, idx) => idx !== index);
    dispatch(setOfferDetails({ offerItems: updatedItems }));
  };
  const validateItemId = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:8080/vibecart/ecom/items/item/${itemId}/skuIDs`);
      const data = await response.json();
      if (response.ok && data.skuIDs) {
        const myItems = data.skuIDs.map(sku => ({
          offerType: formData.offerType,
          offerOn: 'ITEM',
          skuId: sku,
          itemId: parseInt(itemId),
          billAmount: 0.0,
          couponCode: ''
        }));
        console.log(myItems);
        setNewItem(prevItems => [...prevItems, ...myItems])
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error validating item ID:', error);
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
  const addItemId = () => {
    if (formData.itemId) {
      setNewItemIds(prevState => [...prevState, formData.itemId]);
      setFormData(prevState => ({ ...prevState, itemId: '' }));
      setItemValidationError('');
    } else {
      setItemValidationError('Item ID cannot be empty.');
    }
  };

  const removeItemId = (itemIdToRemove) => {
    setNewItemIds(prevState => prevState.filter(id => id !== itemIdToRemove));
  };
  const addSku = () => {
    if (formData.skuId) {
      setNewSkuIds(prevState => [...prevState, formData.skuId]);
      setFormData(prevState => ({ ...prevState, skuId: '' }));

    } else {
      console.log(error)
    }

  }
  const removeSkuId = (skuIdToRemove) => {
    setNewSkuIds(prevState => prevState.filter(id => id !== skuIdToRemove));
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

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log({ ...offerDetails, offerItems: [newItem] })

    console.log(newItem)
    if (validateForm()) {
      dispatch(createOffer({ ...offerDetails, offerItems: [newItem] }));
    }
  };

  useEffect(() => {
    if (newItem.itemId) {
      fetchAvailableSkus(newItem.itemId);
    }
  }, [newItem.itemId]);

  useEffect(() => {
    if (success) {
      alert('Offer created successfully');
      dispatch(resetForm());
    }
  }, [success, dispatch]);

  return (
    <div className="container offer-container">
      <div className="card offer-card">
        <div className="card-header bg-light-grey">
          <h4 className="card-title">Add New Offer</h4>
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
                    onChange={(e) => dispatch(setOfferDetails({ offerName: e.target.value }))}
                    className={`form-control ${formErrors.offerName ? 'is-invalid' : ''}`}
                  />
                  {formErrors.offerName && <div className="invalid-feedback">{formErrors.offerName}</div>}
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="offerQuantity">Offer Quantity</label>
                  <input
                    type="number"
                    id="offerQuantity"
                    value={offerDetails.offerQuantity}
                    onChange={(e) => dispatch(setOfferDetails({ offerQuantity: parseInt(e.target.value) }))}
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
                    onChange={(e) => dispatch(setOfferDetails({ offerDiscountType: e.target.value }))}
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
                      onChange={(e) => dispatch(setOfferDetails({ offerDiscountValue: parseInt(e.target.value) }))}
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
                    onChange={(e) => dispatch(setOfferDetails({ offerStartDate: e.target.value }))}
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
                    onChange={(e) => dispatch(setOfferDetails({ offerEndDate: e.target.value }))}
                    className={`form-control ${formErrors.offerEndDate ? 'is-invalid' : ''}`}
                  />
                  {formErrors.offerEndDate && <div className="invalid-feedback">{formErrors.offerEndDate}</div>}
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className={`col-md-${formData.offerType ? '6' : '12'}`}>
                <div className="form-group">
                  <label htmlFor="offerType">Offer Type</label>
                  <select
                    id="offerType"
                    value={newItem.offerType}
                    onChange={(e) => setFormData((prevState) => ({ ...prevState, offerType: e.target.value }))}
                    className="form-control"
                  >
                    <option value="">Select Offer Type</option>
                    <option value="SKU_OFFER">SKU OFFER</option>
                    <option value="ITEM_OFFER">ITEM OFFER</option>
                    <option value="ON_BILL_AMOUNT">ON BILL AMOUNT</option>
                    <option value="DISCOUNT_COUPONS">DISCOUNT COUPONS</option>
                  </select>
                </div>
              </div>

              {formData.offerType === 'SKU_OFFER' && (
                <div className="col-md-6">
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
                          <div key={index} className="item-id">
                            <span>{skuId}</span>
                            <MdCancel onClick={() => removeSkuId(skuId)} className="remove-item-icon" />
                          </div>
                        ))}
                      </div>
                    )}
                    {skuValidationError && <div className="invalid-feedback">{skuValidationError}</div>}
                  </div>
                </div>
              )}

              {formData.offerType === 'ITEM_OFFER' && (
                <div className="col-md-6">
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
                    {itemValidationError && <div className="invalid-feedback">{itemValidationError}</div>}
                  </div>
                </div>
              )}

              {formData.offerType === 'DISCOUNT_COUPONS' && (
                <div className="col-md-6">
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
                </div>
              )}

              {formData.offerType === 'ON_BILL_AMOUNT' && (
                <div className="col-md-6">
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
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="offerDescription">Offer Description</label>
              <textarea
                id="offerDescription"
                value={offerDetails.offerDescription || ''}
                onChange={(e) => dispatch(setOfferDetails({ offerDescription: e.target.value }))}
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
