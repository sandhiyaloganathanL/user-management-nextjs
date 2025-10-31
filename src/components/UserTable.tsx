'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/user';
import UserFormModal from './UserFormModal';
import { useAppSelector, useAppDispatch, setUsers, addUser, updateUser, deleteUser } from '@/store/store';
import { appConfig } from '@/config/config';
import { PlusIcon, EditIcon, DeleteIcon, ChevronDownIcon, LinkedInIcon, AlertIcon } from './Icons';

const { text, features } = appConfig;

// Main component for user management table
const UserTable: React.FC = () => {
  const { users = [], isHydrated = false } = useAppSelector((state) => state?.user) || {};
  const dispatch = useAppDispatch();
  
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);

  // Load users from localStorage on mount
  useEffect(() => {
    const stored = localStorage?.getItem?.('users');
    dispatch?.(setUsers?.(stored ? JSON?.parse?.(stored) : []));
  }, [dispatch]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet?.has?.(id)) {
        newSet?.delete?.(id);
      } else {
        newSet?.add?.(id);
      }
      return newSet;
    });
  };

  const handleOpenModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSubmit = (data: Omit<User, 'id'>) => {
    if (editingUser) {
      dispatch?.(updateUser?.({ ...data, id: editingUser?.id }));
    } else {
      dispatch?.(addUser?.(data));
    }
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleDeleteClick = (user: User) => {
    setDeleteConfirmUser(user);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmUser?.id) {
      dispatch?.(deleteUser?.(deleteConfirmUser?.id));
      setDeleteConfirmUser(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmUser(null);
  };

  return (
    <>
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        
        {/* Page header with title and add button */}
        <div className="mb-6 flex flex-col sm:flex-row items-center sm:justify-between gap-4 min-h-20">
          <div className="flex-1">
       <h1 className="text-[1.875rem] text-[#F37318] text-center sm:text-left">
              {text?.pageTitle}
            </h1>
            <p className="text-base text-[#545454] mt-4 mb-5 font-light">
              {text?.pageSubtitle}
            </p>
          </div>
          <button onClick={handleOpenModal} className="px-6 py-2.5 bg-linear-to-r from-[#FFC107] via-[#FF5722] to-[#FFC107] text-white text-sm flex items-center justify-center hover:opacity-90 shrink-0 h-fit">
            <PlusIcon className="w-4 h-4 mr-2" />{text?.addUserButton}
          </button>
        </div>

        {/* Users table */}
        <div className="bg-white border border-gray-200 overflow-hidden">
          {!isHydrated ? (
            <div className="px-6 py-12 flex items-center justify-center h-[400px]">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-[#FFC107] rounded-full animate-spin mx-auto"></div>
                <p className="text-[#545454] text-sm mt-4">{text?.loading}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f7f7f7] border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-5 text-sm text-[#545454] font-medium uppercase text-left">{text?.tableHeaders?.name}</th>
                      <th className="px-6 py-5 text-sm text-[#545454] font-medium uppercase text-left">{text?.tableHeaders?.email}</th>
                      <th className="px-6 py-5 text-sm text-[#545454] font-medium uppercase text-left">{text?.tableHeaders?.linkedin}</th>
                      <th className="px-6 py-5 text-sm text-[#545454] font-medium uppercase text-left">{text?.tableHeaders?.gender}</th>
                      <th className="px-6 py-5 text-sm text-[#545454] font-medium uppercase text-left">{text?.tableHeaders?.address}</th>
                      <th className="px-6 py-5 text-sm text-[#545454] font-medium uppercase text-center">{text?.tableHeaders?.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {!users || users?.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <p className="text-[#545454] text-xl">{text?.noUsersFound}</p>
                          <p className="text-gray-400 text-sm mt-3">{text?.noUsersSubtext}</p>
                        </td>
                      </tr>
                    ) : (
                      users?.map?.((user: User) => (
                        <React.Fragment key={user?.id}>
                          <tr className="hover:bg-[#f7f7f7]">
                            <td className="px-6 py-5">
                              <div className="flex items-center">
                                <div className="w-9 h-9 bg-linear-to-br from-[#FFC107] to-[#FF5722] flex items-center justify-center">
                                  <span className="text-white text-sm">{user?.name?.charAt?.(0)?.toUpperCase?.()}</span>
                                </div>
                                <span className="ml-3 text-sm text-[#545454]">{user?.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-sm text-[#545454]">{user?.email}</td>
                            <td className="px-6 py-5">
                              <a href={user?.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-[#545454] hover:text-[#232d37]">
                                <LinkedInIcon className="w-4 h-4 mr-1.5" />{text?.viewProfile}
                              </a>
                            </td>
                            <td className="px-6 py-5 text-sm text-[#545454]">{user?.gender}</td>
                            <td className="px-6 py-5 cursor-pointer" onClick={() => toggleRow(user?.id)}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-[#545454]">{user?.address?.city}, {user?.address?.state}</p>
                                  <p className="text-xs text-[#545454]">{text?.pin}: {user?.address?.pin}</p>
                                </div>
                                <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ml-2 ${expandedRows?.has?.(user?.id) ? 'rotate-180' : ''}`} />
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center justify-center gap-2">
                                {features?.editableUsers && (
                                  <button className="px-3 py-1.5 bg-[#f7f7f7] hover:bg-gray-300 text-[#545454] text-sm inline-flex items-center" onClick={(e) => { e?.stopPropagation?.(); handleEditUser(user); }}>
                                    <EditIcon className="w-4 h-4 mr-1" />{text?.editButton}
                                  </button>
                                )}
                                {features?.deletableUsers && (
                                  <button className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm inline-flex items-center" onClick={(e) => { e?.stopPropagation?.(); handleDeleteClick(user); }}>
                                    <DeleteIcon className="w-4 h-4 mr-1" />{text?.deleteButton}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                          {/* Expanded row for complete address */}
                          {expandedRows?.has?.(user?.id) && (
                            <tr className="bg-[#f7f7f7]">
                              <td colSpan={6} className="px-6 py-6">
                                <div>
                                  <h3 className="text-sm font-medium text-[#545454] mb-3">{text?.completeAddress}</h3>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-xs text-[#545454] mb-1">{text?.addressLabels?.line1}</p>
                                      <p className="text-sm text-[#545454]">{user?.address?.line1 || text?.addressLabels?.notAvailable}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-[#545454] mb-1">{text?.addressLabels?.line2}</p>
                                      <p className="text-sm text-[#545454]">{user?.address?.line2 || text?.addressLabels?.notAvailable}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-[#545454] mb-1">{text?.addressLabels?.city}</p>
                                      <p className="text-sm text-[#545454]">{user?.address?.city || text?.addressLabels?.notAvailable}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-[#545454] mb-1">{text?.addressLabels?.state}</p>
                                      <p className="text-sm text-[#545454]">{user?.address?.state || text?.addressLabels?.notAvailable}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-[#545454] mb-1">{text?.addressLabels?.pin}</p>
                                      <p className="text-sm text-[#545454]">{user?.address?.pin || text?.addressLabels?.notAvailable}</p>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {users?.length > 0 && (
                <footer className="bg-[#f7f7f7] px-6 py-3 border-t border-gray-200">
                  <p className="text-sm text-[#545454]">
                    {text?.showingUsers} <span className="font-medium">{users?.length}</span> {users?.length === 1 ? text?.user : text?.users}
                  </p>
                </footer>
              )}
            </>
          )}
        </div>

        <UserFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmit} editUser={editingUser} />
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleDeleteCancel} />
          <div className="relative bg-white w-full max-w-md p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 mb-4">
              <AlertIcon className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg text-[#545454] text-center mb-2">{text?.deleteConfirmTitle}</h3>
            <p className="text-sm text-[#545454] text-center mb-6">
              {text?.deleteConfirmMessage} <span className="font-medium text-[#545454]">{deleteConfirmUser?.name}</span>?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={handleDeleteCancel} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-[#545454] text-sm">
                {text?.cancelButton}
              </button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm">
                {text?.deleteButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserTable;