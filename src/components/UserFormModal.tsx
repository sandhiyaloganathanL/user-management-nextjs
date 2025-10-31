'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/user';
import { getStates, getCitiesByState } from '@/data/masterData';
import { appConfig } from '@/config/config';
import { CloseIcon } from './Icons';
import { useAppSelector } from '@/store/store';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: Omit<User, 'id'>) => void;
  editUser?: User | null;
}

interface FormErrors {
  [key: string]: string;
}

const { text, validation } = appConfig;

// Modal component for adding/editing user with form validation
const UserFormModal: React.FC<UserFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editUser = null 
}) => {
  const users = useAppSelector((state) => state?.user?.users);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkedinUrl: '',
    gender: '',
    address: { line1: '', line2: '', state: '', city: '', pin: '' }
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [cities, setCities] = useState<string[]>([]);

  // Populate form when editing user
  useEffect(() => {
    if (editUser) {
      setFormData({
        name: editUser?.name,
        email: editUser?.email,
        linkedinUrl: editUser?.linkedinUrl,
        gender: editUser?.gender,
        address: { ...editUser?.address }
      });
      if (editUser?.address?.state) {
        setCities(getCitiesByState?.(editUser?.address?.state));
      }
    } else {
      resetForm();
    }
  }, [editUser, isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      linkedinUrl: '',
      gender: '',
      address: { line1: '', line2: '', state: '', city: '', pin: '' }
    });
    setErrors({});
    setCities([]);
  };

  // Validate all form fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData?.name?.trim?.()) {
      newErrors.name = text?.errors?.required;
    } else if (formData?.name?.trim?.()?.length < validation?.name?.minLength) {
      newErrors.name = `${text?.errors?.minChars} ${validation?.name?.minLength} ${text?.errors?.chars}`;
    } else if (formData?.name?.trim?.()?.length > validation?.name?.maxLength) {
      newErrors.name = `${text?.errors?.maxChars} ${validation?.name?.maxLength} ${text?.errors?.chars}`;
    }

    // Email validation with duplicate check
    if (!formData?.email?.trim?.()) {
      newErrors.email = text?.errors?.required;
    } else if (!validation?.email?.pattern?.test?.(formData?.email)) {
      newErrors.email = text?.errors?.invalidEmail;
    } else {
      const isDuplicate = users?.some?.(
        user => user?.email?.toLowerCase?.() === formData?.email?.toLowerCase?.() && 
        (!editUser || user?.id !== editUser?.id)
      );
      if (isDuplicate) {
        newErrors.email = text?.errors?.duplicateEmail;
      }
    }

    // LinkedIn URL validation
    if (!formData?.linkedinUrl?.trim?.()) {
      newErrors.linkedinUrl = text?.errors?.required;
    } else if (!validation?.linkedinUrl?.pattern?.test?.(formData?.linkedinUrl)) {
      newErrors.linkedinUrl = text?.errors?.invalidUrl;
    }

    if (!formData?.gender) newErrors.gender = text?.errors?.required;
    if (!formData?.address?.line1?.trim?.()) newErrors.line1 = text?.errors?.required;
    if (!formData?.address?.state) newErrors.state = text?.errors?.required;
    if (!formData?.address?.city) newErrors.city = text?.errors?.required;
    
    if (!formData?.address?.pin?.trim?.()) {
      newErrors.pin = text?.errors?.required;
    } else if (!validation?.pin?.pattern?.test?.(formData?.address?.pin)) {
      newErrors.pin = text?.errors?.digits;
    }

    setErrors(newErrors);
    return Object?.keys?.(newErrors)?.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e?.preventDefault?.();
    if (validateForm()) {
      onSubmit?.(formData);
      resetForm();
    }
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const state = e?.target?.value;
    setFormData(prev => ({ 
      ...prev, 
      address: { ...prev?.address, state, city: '' } 
    }));
    setCities(getCitiesByState?.(state));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors?.state;
      return newErrors;
    });
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e?.target?.value?.replace?.(/\D/g, '')?.slice?.(0, 6);
    setFormData(prev => ({ 
      ...prev, 
      address: { ...prev?.address, pin: value } 
    }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors?.pin;
      return newErrors;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded">
        {/* Modal header */}
        <div className="bg-[#f7f7f7] px-10 py-6 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl text-[#545454]">{editUser ? text?.editUserTitle : text?.addUserTitle}</h2>
          <button onClick={handleClose} className="w-8 h-8 rounded-[50px] flex items-center justify-center bg-white hover:bg-gray-200 border border-gray-300">
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            
            {/* Name field */}
            <div>
              <label htmlFor="name" className="block text-sm text-[#545454] mb-1.5">
                {text?.formFields?.name} <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                id="name" 
                value={formData?.name} 
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e?.target?.value }));
                  setErrors(prev => ({ ...prev, name: '' }));
                }}
                className={`w-full px-3 py-2 border ${errors?.name ? 'border-red-500' : 'border-[#d1d5db]'} text-sm text-[#545454] rounded focus:outline-none focus:ring-[#d1d5db] focus:border-[#d1d5db]`}
                placeholder={text?.placeholders?.name}
              />
              {errors?.name && <p className="text-xs text-red-500 mt-1">{errors?.name}</p>}
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm text-[#545454] mb-1.5">
                {text?.formFields?.email} <span className="text-red-500">*</span>
              </label>
              <input 
                type="email" 
                id="email" 
                value={formData?.email} 
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, email: e?.target?.value }));
                  setErrors(prev => ({ ...prev, email: '' }));
                }}
                className={`w-full px-3 py-2 border ${errors?.email ? 'border-red-500' : 'border-[#d1d5db]'} text-sm text-[#545454] rounded focus:outline-none focus:ring-[#d1d5db] focus:border-[#d1d5db]`}
                placeholder={text?.placeholders?.email}
              />
              {errors?.email && <p className="text-xs text-red-500 mt-1">{errors?.email}</p>}
            </div>

            {/* LinkedIn URL field */}
            <div>
              <label htmlFor="linkedinUrl" className="block text-sm text-[#545454] mb-1.5">
                {text?.formFields?.linkedinUrl} <span className="text-red-500">*</span>
              </label>
              <input 
                type="url" 
                id="linkedinUrl" 
                value={formData?.linkedinUrl} 
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, linkedinUrl: e?.target?.value }));
                  setErrors(prev => ({ ...prev, linkedinUrl: '' }));
                }}
                className={`w-full px-3 py-2 border ${errors?.linkedinUrl ? 'border-red-500' : 'border-[#d1d5db]'} text-sm text-[#545454] rounded focus:outline-none focus:ring-[#d1d5db] focus:border-[#d1d5db]`}
                placeholder={text?.placeholders?.linkedinUrl}
              />
              {errors?.linkedinUrl && <p className="text-xs text-red-500 mt-1">{errors?.linkedinUrl}</p>}
            </div>

            {/* Gender field */}
            <div>
              <label htmlFor="gender" className="block text-sm text-[#545454] mb-1.5">
                {text?.formFields?.gender} <span className="text-red-500">*</span>
              </label>
              <select 
                id="gender" 
                value={formData?.gender} 
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, gender: e?.target?.value }));
                  setErrors(prev => ({ ...prev, gender: '' }));
                }}
                className={`w-full px-3 py-2 border ${errors?.gender ? 'border-red-500' : 'border-[#d1d5db]'} text-sm text-[#545454] rounded appearance-none bg-white focus:outline-none focus:ring-[#d1d5db] focus:border-[#d1d5db]`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23545454' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '0.7rem'
                }}
              >
                <option value="">{text?.placeholders?.gender}</option>
                <option value="Male">{text?.genderOptions?.male}</option>
                <option value="Female">{text?.genderOptions?.female}</option>
                <option value="Other">{text?.genderOptions?.other}</option>
              </select>
              {errors?.gender && <p className="text-xs text-red-500 mt-1">{errors?.gender}</p>}
            </div>

            {/* Address Line 1 field */}
            <div>
              <label htmlFor="line1" className="block text-sm text-[#545454] mb-1.5">
                {text?.formFields?.addressLine1} <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                id="line1" 
                value={formData?.address?.line1} 
                onChange={(e) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    address: { ...prev?.address, line1: e?.target?.value } 
                  }));
                  setErrors(prev => ({ ...prev, line1: '' }));
                }}
                className={`w-full px-3 py-2 border ${errors?.line1 ? 'border-red-500' : 'border-[#d1d5db]'} text-sm text-[#545454] rounded focus:outline-none focus:ring-[#d1d5db] focus:border-[#d1d5db]`}
                placeholder={text?.placeholders?.addressLine1}
              />
              {errors?.line1 && <p className="text-xs text-red-500 mt-1">{errors?.line1}</p>}
            </div>

            {/* Address Line 2 field */}
            <div>
              <label htmlFor="line2" className="block text-sm text-[#545454] mb-1.5">
                {text?.formFields?.addressLine2}
              </label>
              <input 
                type="text" 
                id="line2" 
                value={formData?.address?.line2} 
                onChange={(e) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    address: { ...prev?.address, line2: e?.target?.value } 
                  }));
                }}
                className="w-full px-3 py-2 border border-[#d1d5db] text-sm text-[#545454] rounded focus:outline-none focus:ring-[#d1d5db] focus:border-[#d1d5db]"
                placeholder={text?.placeholders?.addressLine2}
              />
            </div>

            {/* State field */}
            <div>
              <label htmlFor="state" className="block text-sm text-[#545454] mb-1.5">
                {text?.formFields?.state} <span className="text-red-500">*</span>
              </label>
              <select 
                id="state" 
                value={formData?.address?.state} 
                onChange={handleStateChange}
                className={`w-full px-3 py-2 border ${errors?.state ? 'border-red-500' : 'border-[#d1d5db]'} text-sm text-[#545454] rounded appearance-none bg-white focus:outline-none focus:ring-[#d1d5db] focus:border-[#d1d5db]`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23545454' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '0.7rem'
                }}
              >
                <option value="">{text?.placeholders?.state}</option>
                {getStates?.()?.map?.((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors?.state && <p className="text-xs text-red-500 mt-1">{errors?.state}</p>}
            </div>

            {/* City field */}
            <div>
              <label htmlFor="city" className="block text-sm text-[#545454] mb-1.5">
                {text?.formFields?.city} <span className="text-red-500">*</span>
              </label>
              <select 
                id="city" 
                value={formData?.address?.city} 
                onChange={(e) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    address: { ...prev?.address, city: e?.target?.value } 
                  }));
                  setErrors(prev => ({ ...prev, city: '' }));
                }}
                disabled={!formData?.address?.state}
                className={`w-full px-3 py-2 border ${errors?.city ? 'border-red-500' : 'border-[#d1d5db]'} text-sm text-[#545454] disabled:bg-gray-100 rounded appearance-none bg-white focus:outline-none focus:ring-[#d1d5db] focus:border-[#d1d5db]`}
                style={{
                  backgroundImage: !formData?.address?.state ? 'none' : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23545454' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '0.7rem'
                }}
              >
                <option value="">{text?.placeholders?.city}</option>
                {cities?.map?.((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {errors?.city && <p className="text-xs text-red-500 mt-1">{errors?.city}</p>}
            </div>

            {/* Pin code field */}
            <div>
              <label htmlFor="pin" className="block text-sm text-[#545454] mb-1.5">
                {text?.formFields?.pinCode} <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                id="pin" 
                value={formData?.address?.pin} 
                onChange={handlePinChange}
                maxLength={6}
                className={`w-full px-3 py-2 border ${errors?.pin ? 'border-red-500' : 'border-[#d1d5db]'} text-sm text-[#545454] rounded focus:outline-none focus:ring-[#d1d5db] focus:border-[#d1d5db]`}
                placeholder={text?.placeholders?.pinCode}
              />
              {errors?.pin && <p className="text-xs text-red-500 mt-1">{errors?.pin}</p>}
            </div>

          </div>

          {/* Form action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-6">
            <button type="button" onClick={handleClose} className="w-full sm:w-auto px-5 py-2 bg-gray-200 hover:bg-gray-300 text-[#545454] text-sm rounded">
              {text?.cancelButton}
            </button>
            <button type="submit" className="w-full sm:w-auto px-6 py-2 bg-linear-to-r from-[#FFC107] via-[#FF5722] to-[#FFC107] text-white text-sm hover:opacity-90 rounded">
              {editUser ? text?.updateButton : text?.addUserButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;